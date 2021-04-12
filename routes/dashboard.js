
const { Router } = require("express");
const path = require("path");
const fs = require("fs"); 
const router = Router();

   

router.get("/", (req,res) => {
    
    const folder = req.headers['x-request-id'];
    const url = process.env.SAMPLES_URL;
    
        // Read users.json file     
    day = fs.readFileSync(url+folder+'/day.json');
    yesterday = fs.readFileSync(url+folder+'/yesterday.json');        
        // Converting to JSON 
    let day_samples =JSON.parse(day); 
    let yesterday_samples = JSON.parse(yesterday);

    if (day_samples.length == 0) {
        res.status(404).json({
            status:404,
            error:err || err2
        });

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

    res.status(200).json({
        voltage: last_sample['voltaje'],
        current: last_sample['corriente'],
        production: (last_sample['voltaje'] * last_sample['corriente']).toFixed(2),
        productionData: reverse_samples.map( function(sample) {
            return {
                date: sample['fecha'],
                value: (sample['voltaje'] * sample['corriente']).toFixed(2)
            }            
         })
    });
            
});

router.get('/data', (req,res) => {
    
    const folder = req.headers['x-request-id'];
    const url = process.env.SAMPLES_URL;

    fs.readFile(url+folder+'/day.json', function(err, day) { 
        if (err) {
            res.status(404).json({
                status:404,
                error:err 
            });
        }
        let day_samples = JSON.parse(day);
        let last_sample = day_samples[day_samples.length - 1];

        res.status(200).json({
            voltage: last_sample['voltaje'],
            current: last_sample['corriente'],
            production: (last_sample['voltaje'] * last_sample['corriente']).toFixed(2),
        });
    });

});


module.exports = router;