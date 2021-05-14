const { Router } = require("express");
const path = require('path');
const fs = require("fs");
const utils = require('./utils');
const router = Router();


router.get("/", (req, res) => {

    const token = req.headers['x-request-id'];
    const url = process.env.SAMPLES_URL;
    
    let nodes = JSON.parse(fs.readFileSync(url + '/nodes-description.json'));
    let folder = nodes.filter(node => node.token === token)[0];
    folder = folder.module_id;
   
    let reports =JSON.parse( fs.readFileSync(url+folder+'/always-reports.json'))
                     .filter(report => report.show === true);

    let nowDate = new Date(); 
    let now = nowDate.getFullYear()+'/'+(nowDate.getMonth()+1)+'/'+nowDate.getDate();    
    
    nowDate.setDate(nowDate.getDate() - 1);
    let twodays = nowDate.getFullYear()+'/'+(nowDate.getMonth()+1)+'/'+nowDate.getDate();

    nowDate.setDate(nowDate.getDate() - 6);
    let lastweek = nowDate.getFullYear()+'/'+(nowDate.getMonth()+1)+'/'+nowDate.getDate(); 
    
    nowDate.setDate(nowDate.getDate() - 24);
    let current_month = nowDate.getFullYear()+'/'+(nowDate.getMonth()+1)+'/'+nowDate.getDate();

    nowDate.setDate(nowDate.getDate() - 334);
    let current_year = nowDate.getFullYear()+'/'+(nowDate.getMonth()+1)+'/'+nowDate.getDate();

    nowDate.setFullYear(nowDate.getFullYear() - 9);
    let current_decade = nowDate.getFullYear()+'/01/01';

    let dates = [now,twodays,lastweek,current_month,current_year,current_decade];
    
    res.status(200).send( 
        reports.map( (report,index) => {
            return{
                initDate: dates[report.id],
                finalDate: now,
                reportId: report.id
            }
        }) 
    );
    
});

router.get("/:reportId", (req, res) => {

    const token = req.headers['x-request-id'];
    const url = process.env.SAMPLES_URL;
    
    let nodes = JSON.parse(fs.readFileSync(url + '/nodes-description.json'));
    console.log(nodes)
    let folder = nodes.filter(node => node.token === token)[0];
    folder = folder.module_id;

    const reportId = parseInt(req.params.reportId);

    //TODO: make validation about reportId existence
    let production = [1, 2, 3];
    let date_production = [1, 2, 3];

    let reports;
    let nowDate = new Date(); 
    let now = nowDate.getFullYear()+'/'+(nowDate.getMonth()+1)+'/'+nowDate.getDate();

    let period;
    let interval;
    let voltage,current,apparent_power, active_power, frequency;

    switch (reportId) {
        case 0:
            reports =JSON.parse( fs.readFileSync(url+folder+'/day.json'));
            production = reports.map( (report) => parseFloat((report.potencia_aparente * 60 / 1000).toFixed(3)) );
            apparent_power = (production.reduce( (sum,currentValue) => sum + currentValue) / production.length).toFixed(3);
            voltage = (reports.map(report => report.voltaje)
                                   .reduce((sum,currentValue) => sum + currentValue) / reports.length).toFixed(3);
            current = (reports.map(report => report.corriente)
                                   .reduce((sum,currentValue) => sum + currentValue) / reports.length).toFixed(3);
            active_power = (reports.map(report => report.potencia_activa)
                                   .reduce((sum,currentValue) => sum + currentValue) / reports.length).toFixed(3);
            frequency = (reports.map(report => report.frecuencia)
                                .reduce((sum,currentValue) => sum + currentValue) / reports.length).toFixed(3);

            date_production =  reports.map( (report) => new Date(report.fecha).toLocaleString() );
            period = "Diario"
            interval = now;
            break;
        case 1:
            let yesterday_reports =JSON.parse( fs.readFileSync(url+folder+'/yesterday.json'));
            let today_reports =JSON.parse( fs.readFileSync(url+folder+'/day.json'));
            reports = [...yesterday_reports,...today_reports]; 
            production = reports.map( (report) => parseFloat((report.potencia_aparente * 60 / 1000).toFixed(3)) );            
            apparent_power = (production.reduce( (sum,currentValue) => sum + currentValue) / production.length).toFixed(3);
            voltage = (reports.map(report => report.voltaje)
                                   .reduce((sum,currentValue) => sum + currentValue) / reports.length).toFixed(3);
            current = (reports.map(report => report.corriente)
                                   .reduce((sum,currentValue) => sum + currentValue) / reports.length).toFixed(3);
            active_power = (reports.map(report => report.potencia_activa)
                                   .reduce((sum,currentValue) => sum + currentValue) / reports.length).toFixed(3);
            frequency = (reports.map(report => report.frecuencia)
                               .reduce((sum,currentValue) => sum + currentValue) / reports.length).toFixed(3);
            date_production =  reports.map( (report) => new Date(report.fecha).toLocaleString() );
            nowDate.setDate(nowDate.getDate() - 1);
            let yesterday = nowDate.getFullYear()+'/'+(nowDate.getMonth()+1)+'/'+nowDate.getDate();
            period = "Ayer y Hoy"
            interval = yesterday + " - " + now;
            break;
        case 2:
            let month_reports =JSON.parse( fs.readFileSync(url+folder+'/month.json'));
            nowDate.setDate(nowDate.getDate() - 7);
            nowDate.setHours(0,0,0,0);

            reports = month_reports.filter( (report) => new Date(report.fecha) >= nowDate);
            production = reports.map((report) => report.produccion );
            date_production =  reports.map( (report) => new Date(report.fecha).toLocaleDateString() );
            
            let lastweek = nowDate.getFullYear()+'/'+(nowDate.getMonth()+1)+'/'+nowDate.getDate();
            period = "Semanal"
            interval = lastweek + " - " + now;
            break;
        case 3:
            reports =JSON.parse( fs.readFileSync(url+folder+'/month.json'));
            production = reports.map((report) => report.produccion );
            date_production =  reports.map( (report) => new Date(report.fecha).toLocaleDateString() );

            let begin_day = new Date(reports[0].fecha);
            let day = begin_day.getFullYear()+'/'+(begin_day.getMonth()+1)+'/' + begin_day.getDate();
            period = "Mensual" 
            interval = day + " - " + now;
            break;
        case 4:
            reports =JSON.parse( fs.readFileSync(url+folder+'/year.json'));
            production = reports.map((report) => report.produccion );
            date_production =  reports.map( (report) => new Date(report.fecha).toLocaleDateString() );

            let begin_moth = new Date(reports[0].fecha);
            let month = begin_moth.getFullYear()+'/'+(begin_moth.getMonth()+1)+'/01';
            period = "Anual"
            interval = month + " - " + now;
            break; 
        case 5:
            reports =JSON.parse( fs.readFileSync(url+folder+'/decada.json'));
            production = reports.map((report) => report.produccion );
            date_production =  reports.map( (report) => new Date(report.fecha).toLocaleDateString() );

            let begin_year = new Date(reports[0].fecha);
            let final_year = new Date(reports[reports.length -1].fecha);
            let year = begin_year.getFullYear()+'/01/01';
            let end_year = final_year.getFullYear()+'/01/01';
            period = "Decada"
            interval = year + " - " + end_year;
            break;        
    }
    
    let ejs_options = {
        logoPath: path.join('file://',__dirname,'..','public','logo2.png'),
        logoQR: path.join('file://',__dirname,'..','public','SmartGrid.png'),
        y_production: production,
        x_date: date_production,
        production_sum: (production.reduce( (sum, currentValue) => sum + currentValue)).toFixed(3),
        period: period,
        voltage: voltage || false,
        current: current || false,
        apparent_power: apparent_power || false,
        active_power: active_power || false,
        frequency: frequency || false,
        module: folder,
        interval: interval
    };   

    utils.create_pdf_report(ejs_options,res);

});

router.get("/json/:reportId", (req, res) => {

    const token = req.headers['x-request-id'];
    const url = process.env.SAMPLES_URL;
    const reportId = parseInt(req.params.reportId);
    
    let nodes = JSON.parse(fs.readFileSync(url + '/nodes-description.json'));
    let folder = nodes.find(node => node.token === token);
    folder = folder.module_id;
    

    //read json reports
    let reports =JSON.parse( fs.readFileSync(url+folder+'/always-reports.json'));
    let id_exists = reports.find(report => report.id === reportId);
    
    if( id_exists ){
        let nowDate = new Date();
        let json , tittle;
        switch( reportId ){
            case 0:
                json = JSON.parse( fs.readFileSync(url+folder+'/day.json'));
                tittle = 'day.json';
                break;
            case 1:
                let day = JSON.parse( fs.readFileSync(url+folder+'/day.json'));
                let yesterday = JSON.parse( fs.readFileSync(url+folder+'/yesterday.json'));
                json = [...yesterday,...day];
                tittle = 'day-yes.json';
                break;
            case 2:
                let month_reports = JSON.parse( fs.readFileSync(url+folder+'/month.json'));
                nowDate.setDate(nowDate.getDate() - 7);
                nowDate.setHours(0,0,0,0);

                json = month_reports.filter( (report) => new Date(report.fecha) >= nowDate);
                tittle = 'week.json';
                break;
            case 3:
                json = JSON.parse( fs.readFileSync(url+folder+'/month.json'));
                tittle = 'month.json';
                break;
            case 4:
                json = JSON.parse( fs.readFileSync(url+folder+'/year.json'));
                tittle = 'year.json';
                break;
            case 5:
                json =  JSON.parse( fs.readFileSync(url+folder+'/decada.json'));
                tittle = 'decade.json';
                break;
        }

        res.setHeader('Content-disposition', 'attachment; filename="' + tittle + '"')
        res.header('content-type','application/json');
        res.status(200).send(JSON.stringify(json));
    }else{
        res.status(404).send('ReportId not found');
    }

});

router.delete('/:reportId', function (req,res) {

    const token = req.headers['x-request-id'];
    const url = process.env.SAMPLES_URL;
    const reportId = parseInt(req.params.reportId);
    
    let nodes = JSON.parse(fs.readFileSync(url + '/nodes-description.json'));
    let folder = nodes.filter(node => node.token === token)[0];
    folder = folder.module_id;
    

    //read json reports
    let reports =JSON.parse( fs.readFileSync(url+folder+'/always-reports.json'));
    let id_exists = reports.filter(report => report.id === reportId).length;
    
    if( id_exists !== 0){
        //modifying report wit id requested
        reports.forEach(report => report.show = (report.id === reportId) ? false  : report.show);

        //saving report
        fs.writeFile(url + folder +'/always-reports.json', JSON.stringify(reports, null, '\t'), function (err) {
            if(err){
                res.status(400).send('Something went wrong');
            }else{
                res.status(200).send('PDF report deleted');
            }
        });
    }else{
        res.status(404).send('ReportId not found');
    }
    
    
})
module.exports = router;