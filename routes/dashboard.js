const { Router } = require("express");
const path = require("path");
const fs = require("fs"); 
const router = Router();
   

router.get("/", (req,res) => {
    
    const showAllData = (req.query.data === 'true') ? true : false;
    console.log(showAllData);
    
    const token = req.headers['x-request-id'];
    const url = process.env.SAMPLES_URL;
    
    let nodes = JSON.parse( fs.readFileSync( path.join(url,'nodes-description.json') ) );
    let node_index = nodes.findIndex(node => node.token === token);
    let folder = nodes[node_index].module_id;
    let ranges = nodes[node_index].ranges;

    // Read samples from  files     
    let day_samples = JSON.parse( fs.readFileSync( path.join(url,folder,'day.json') ) );
    let yesterday_samples = JSON.parse( fs.readFileSync( path.join(url,folder,'yesterday.json') ) );        

    let all_samples = [...yesterday_samples,...day_samples];
    let samples;
    if ( ranges.length === 0){
        samples = all_samples;
    }else{
        //Filter samples that are not in ranges
        samples = all_samples.filter( sample => {
            let sample_hour = new Date(sample.fecha).getHours();
            let is_in_range =  true;
            for (let range of ranges) {
                is_in_range &= (range.init < range.final) ?
                    ( range.init <= sample_hour && sample_hour <= range.final - 1) :
                    ( range.init <= sample_hour || sample_hour <= range.final - 1)
            }
            return !is_in_range;
        });
    }
    console.log('inicio: ' + samples.length);

    if (samples.length > 1440){
        let index_needed = samples.length - 1440;
        samples = samples.slice(index_needed);
    }
    console.log('fin: ' + samples.length);

    let last_sample = samples[samples.length -1];
    //Reverse samples because of the frontend need
    let reverse_samples = samples.reverse();

    let data = {
        voltage:  parseFloat(last_sample['voltaje'].toFixed(3)),
        current:  parseFloat((last_sample['corriente'] * 1000).toFixed(3)),
        production: parseFloat((last_sample['potencia_aparente']  / 60000 ).toFixed(7)),
        aparentPower:  parseFloat(last_sample['potencia_aparente'].toFixed(3)),
        activePower:  parseFloat(last_sample['potencia_activa'].toFixed(3)),
        powerFactor:  parseFloat(last_sample['factor_potencia'].toFixed(3)),
        frequency:  parseFloat(last_sample['frecuencia'].toFixed(3)),
        quadrant: last_sample['cudrante'],
    }

    if(showAllData){
        data.productionData = reverse_samples.map( function(sample) {
            return {
                date: sample['fecha'],
                value: parseFloat((sample['potencia_aparente'] / 60000).toFixed(7))
            }            
        });
        res.status(200).json(data);
    }else{
        res.status(200).json(data);
    }
            
});



module.exports = router;