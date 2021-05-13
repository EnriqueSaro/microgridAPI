const { Router } = require("express");
const path = require("path");
const fs = require("fs");
const utils = require('./utils');

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
            let date = new Date(sample.fecha);
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
        res.status(400).send('Bad format, please provide dates in formt YYYY-MM-DDTHH:MM:SS.SSZ')
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
            let sample_month = new Date(sample.fecha).getMonth();
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


router.get('/days/download/:initDate/:finalDate', (req, res) => {

    const token = req.headers['x-request-id'];
    const url = process.env.SAMPLES_URL;
    
    let nodes = JSON.parse(fs.readFileSync(url + '/nodes-description.json'));
    let folder = nodes.filter(node => node.token === token)[0];
    folder = folder.module_id;

    const initDate = new Date(req.params.initDate);
    const finalDate = new Date(req.params.finalDate);
    finalDate.setHours(0,0,0,0);
    let dates_valid = initDate instanceof Date && !isNaN(initDate) &&
        finalDate instanceof Date && !isNaN(finalDate);

    if ( dates_valid ) {

        let day_reports =JSON.parse( fs.readFileSync(url+folder+'/month.json'));
        let reports = day_reports.filter((report) => {
                    let report_date = new Date(report.fecha).getTime();
                    return  initDate.getTime() <= report_date && report_date <= finalDate.getTime();
                }
            );
        if( reports.length === 0){
            res.status(404).send("Coudn't find any sample with proportioned dates")
        }else{
            
            let production = reports.map((report) => report.produccion );
            let date_production =  reports.map( (report) => new Date(report.fecha).toLocaleDateString() );
            
            let init = initDate.toLocaleDateString();
            let final = finalDate.toLocaleDateString();
            let period = "de los días : " + init + " a " + final;

            let ejs_options = {
                logoPath: path.join('file://',__dirname,'..','public','logo2.png'),
                y_production: production,
                x_date: date_production,
                production_sum: (production.reduce( (sum, currentValue) => sum + currentValue)).toFixed(3),
                period: period,
                voltage: false,
                current: false,
                apparent_power: false,
                active_power: false,
                frequency: false
            };

            utils.create_pdf_report(ejs_options,res);           
        }

    } else {
        res.status(400).send('Bad format, please provide dates in formt YYYY-MM-DDTHH:MM:SS.SSZ');
    }
});

router.get('/months/download/:initDate/:finalDate', (req, res) => {

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

        initDate.setDate(1);
        finalDate.setDate(1);
        initDate.setHours(0,0,0,0);
        finalDate.setHours(0,0,0,0);

        let month_reports =JSON.parse( fs.readFileSync(url+folder+'/year.json'));
        let reports = month_reports.filter((report) => {
                    let report_month = new Date(report.fecha).getTime();
                    return  initDate.getTime() <= report_month && report_month <= finalDate.getTime();
                }
            );
        if( reports.length === 0){
            res.status(404).send("Coudn't find any sample with proportioned dates")
        }else{
            
            let production = reports.map((report) => report.produccion );
            let date_production =  reports.map( (report) => new Date(report.fecha).toLocaleDateString() );
            
            const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                                "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
            
            let period = "de los meses : " + monthNames[initDate.getMonth()]+ " del " + initDate.getFullYear()
                         + "a " + monthNames[finalDate.getMonth()] + " del " + finalDate.getFullYear();

            let ejs_options = {
                logoPath: path.join('file://',__dirname,'..','public','logo2.png'),
                y_production: production,
                x_date: date_production,
                production_sum: (production.reduce( (sum, currentValue) => sum + currentValue)).toFixed(3),
                period: period,
                voltage: false,
                current: false,
                apparent_power: false,
                active_power: false,
                frequency: false
            };
            
            utils.create_pdf_report(ejs_options,res);

        }

    } else {
        res.status(400).send('Bad format, please provide dates in formt YYYY-MM-DDTHH:MM:SS.SSZ');
    }
});
module.exports = router;