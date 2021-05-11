const { Router } = require("express");
const path = require("path");
const fs = require("fs"); 
const router = Router();
   

router.get("/", (req,res) => {
    
    let showAllData = (req.query.data) ? true : false;
    console.log(showAllData);
    
    const token = req.headers['x-request-id'];
    const url = process.env.SAMPLES_URL;
    
    let nodes = JSON.parse(fs.readFileSync(url + '/nodes-description.json'));
    let folder = nodes.filter(node => node.token === token)[0];
    folder = folder.module_id;

        // Read users.json file     
    day = fs.readFileSync(url+folder+'/day.json');
    yesterday = fs.readFileSync(url+folder+'/yesterday.json');        
        // Converting to JSON 
    let day_samples =JSON.parse(day); 
    let yesterday_samples = JSON.parse(yesterday);

    if (day_samples.length == 0) {
        res.status(404).send('Couldn\'t get response');
    }        

    let samples;
    if(yesterday_samples.length >= 1399){
        samples = [...yesterday_samples.slice(day_samples.length),...day_samples];
    }else{
        samples = [...yesterday_samples,...day_samples];
    }

    if (samples.length > 1440){
        let index_needed = samples.length - 1440;
        samples = samples.slice(index_needed);
    }

    let last_sample = samples[samples.length -1];
    //Reverse samples because of the frontend need
    let reverse_samples = samples.reverse();

    if(showAllData){
        res.status(200).json({
            voltage: last_sample['voltaje'],
            current: last_sample['corriente'],
            production: parseFloat((last_sample['potencia_aparente'] * 60 / 1000).toFixed(3)),
            aparentPower: last_sample['potencia_aparente'],
            activePower: last_sample['potencia_activa'],
            powerFactor: last_sample['factor_potencia'],
            frequency: last_sample['frecuencia'],
            quadrant: last_sample['cudrante'],
            productionData: reverse_samples.map( function(sample) {
                return {
                    date: sample['fecha'],
                    value: parseFloat((sample['potencia_aparente'] * 60 / 1000).toFixed(2))
                }            
            })
        });
    }else{
        res.status(200).json({
            voltage: last_sample['voltaje'],
            current: last_sample['corriente'],
            production: parseFloat((last_sample['potencia_aparente'] * 60 / 1000).toFixed(2)),
            aparentPower: last_sample['potencia_aparente'],
            activePower: last_sample['potencia_activa'],
            powerFactor: last_sample['factor_potencia'],
            frequency: last_sample['frecuencia'],
            quadrant: last_sample['cudrante'],
        });
    }
            
});



module.exports = router;