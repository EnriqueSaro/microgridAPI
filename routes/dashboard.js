const { Router } = require("express");
const path = require("path");
const fs = require("fs"); 
const router = Router();
   

router.get("/", (req,res) => {
    
    const showLinearData = (req.query.data === 'lineal') ? true : false;
    console.log(showLinearData);
    
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

    //obtain last sample
    let last_sample = samples[samples.length -1];
    
    console.log('inicio: ' + samples.length);    

    let day_date = ( day_samples.length === 0 ) ? false : new Date(day_samples[0].fecha);
    let yesterday_date = ( yesterday_samples.length === 0 ) ? false : new Date(yesterday_samples[0].fecha);

    let candles_samples = [];
    let lineal = [];    
    if (yesterday_date) {

        for (let hour = 0; hour < 24; hour++) {

            let hour_samples = [];
            for (const yesterday_sample of samples) {

                let sample_date = new Date(yesterday_sample.fecha);
                if (yesterday_date.getDate() !== sample_date.getDate())
                    continue;
                                    
                if (sample_date.getHours() === hour)
                    hour_samples.push(yesterday_sample);
                
                    
            }
            yesterday_date.setHours(hour, 0, 0, 0);
            hour_samples = hour_samples.map(sample => parseFloat((sample['potencia_aparente'] / 60000).toFixed(7)));
            //CHECK THIS NUMBER, WHY 4?
            if (hour_samples.length >= 4) {
                candles_samples.push({
                    date: yesterday_date.toISOString(),
                    data: hour_samples
                });
            }
            if(hour_samples.length > 0){
                let y = parseFloat(hour_samples.reduce( (sum,currentValue) => sum + currentValue).toFixed(5) );
                lineal.push({
                    x: yesterday_date.toISOString(),
                    y: y
                });
            }            
        }
    }

    if (day_date) {

        for (let hour = 0; hour < 24; hour++) {

            let hour_samples = [];
            for (const day_sample of samples) {

                let sample_date = new Date(day_sample.fecha);
                if (day_date.getDate() !== sample_date.getDate())
                    continue;
                
                if (sample_date.getHours() === hour)
                    hour_samples.push(day_sample);                
            }

            day_date.setHours(hour, 0, 0, 0);
            hour_samples = hour_samples.map( sample => parseFloat((sample['potencia_aparente'] / 60000).toFixed(7) ) );
            //CHECK THIS NUMBER, WHY 4?
            if (hour_samples.length >= 4) {                
                candles_samples.push({
                    date: day_date.toISOString(),
                    data: hour_samples
                });
            }
            if(hour_samples.length > 0){
                let y = parseFloat(hour_samples.reduce( (sum,currentValue) => sum + currentValue).toFixed(5) );
                lineal.push({
                    x: day_date.toISOString(),
                    y: y
                });
            }   
        }
    }
    //Give candles apropiate structure
    let final_candles = [];
    let current_open;
    candles_samples.forEach( candle => {       
     
        let close = candle.data[candle.data.length -1];

        final_candles.push({
            x: candle.date,
            low: Math.min(...candle.data),
            high: Math.max(...candle.data),
            open: ( current_open ) ?  current_open : candle.data[0],
            close: close
        });

        current_open = close;
        
    });
    console.log('candles: ' + final_candles.length + ' Inicio lineal: ' + lineal.length);
    
    //keep only 24 candles
    if (final_candles.length > 24){
        let index_needed = final_candles.length - 24;
        final_candles = final_candles.slice(index_needed);
    }
    //keep only 24 lineal samples
    if(lineal.length > 24){
        let index_needed = lineal.length - 24;
        lineal = lineal.slice(index_needed);
    }
    console.log('candles: ' + final_candles.length  + ' Final lineal: ' + lineal.length);

    let data = {
        voltage:  parseFloat(last_sample['voltaje'].toFixed(3)),
        current:  parseFloat((last_sample['corriente'] * 1000).toFixed(3)),
        production: parseFloat((last_sample['potencia_aparente']  / 60000 ).toFixed(7)),
        aparentPower:  parseFloat(last_sample['potencia_aparente'].toFixed(3)),
        activePower:  parseFloat(last_sample['potencia_activa'].toFixed(3)),
        powerFactor:  parseFloat(last_sample['factor_potencia'].toFixed(3)),
        frequency:  parseFloat(last_sample['frecuencia'].toFixed(3)),
        quadrant: last_sample['cuadrante'],
    }

    if(showLinearData){
        data.productionData = lineal;
        res.status(200).json(data);
    }else{
        data.productionData = final_candles;
        res.status(200).json(data);
    }
            
});



module.exports = router;