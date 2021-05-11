const { Router } = require("express");
const path = require("path");
const fs = require("fs");
const router = Router();


router.get('/days/:initDate/:finalDate', (req, res) => {

    const token = req.headers['x-request-id'];
    const url = process.env.SAMPLES_URL;
    
    let nodes = JSON.parse(fs.readFileSync(url + '/nodes-description.json'));
    let folder = nodes.filter(node => node.token === token)[0];
    folder = folder.module_id;

    const initDate = new Date(req.params.initDate);
    const finalDate = new Date(req.params.finalDate);

    let dates_valid = initDate instanceof Date && !isNaN(initDate) &&
        finalDate instanceof Date && !isNaN(finalDate);

    if ( dates_valid ) {

        let reports = JSON.parse(fs.readFileSync(url + folder + '/month.json'));
        let filtered_reports = reports.filter((sample) => {
            let date = new Date(sample.date);
            date.setHours(0, 0, 0, 0);
            return initDate <= date && finalDate >= date;
        });

        if( filtered_reports.length === 0){
            res.status(404).send("Coudn't find any sample with proportioned dates")
        }else{
            res.status(200).json(
                filtered_reports.map( report => {
                    return {
                        date: report.fecha,
                        production: report.produccion
                    }
                })
            );
        }

    } else {
        res.status(400).send('Bad format, please provide dates in formt YYYY-MM-DD')
    }
});

router.get('/months/:initDate/:finalDate', (req, res) => {

    const token = req.headers['x-request-id'];
    const url = process.env.SAMPLES_URL;
    
    let nodes = JSON.parse(fs.readFileSync(url + '/nodes-description.json'));
    let folder = nodes.filter(node => node.token === token)[0];
    folder = folder.module_id;

    const initDate = new Date(req.params.initDate);
    const finalDate = new Date(req.params.finalDate);

    let dates_valid = initDate instanceof Date && !isNaN(initDate) &&
                      finalDate instanceof Date && !isNaN(finalDate);

    if ( dates_valid ) {

        let init_month = initDate.getMonth();
        let final_month = finalDate.getMonth();

        let reports = JSON.parse(fs.readFileSync(url + folder + '/year.json'));
        let filtered_reports = reports.filter((sample) => {
            let sample_month = new Date(sample.date).getMonth();
            return init_month <= sample_month && final_month >= sample_month;
        });

        if( filtered_reports.length === 0){
            res.status(404).send("Coudn't find any sample with proportioned dates")
        }else{
            res.status(200).json(
                filtered_reports.map( report => {
                    return {
                        date: report.fecha,
                        production: report.produccion
                    }
                })
            );
        }

    } else {
        res.status(400).send('Bad format, please provide dates in format YYYY-MM-DDTHH:MM:SS.SSZ')
    }
});
module.exports = router;