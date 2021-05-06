const { Router } = require("express");
const path = require('path');
const ejs = require('ejs');
const fs = require("fs");
const pdf = require('html-pdf');
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

    let current_month = nowDate.getFullYear()+'/'+(nowDate.getMonth()+1)+'/01';
    let current_year = nowDate.getFullYear()+'/01/01';
    
    nowDate.setDate(nowDate.getDate() - 1);
    let twodays = nowDate.getFullYear()+'/'+(nowDate.getMonth()+1)+'/'+nowDate.getDate();

    nowDate.setDate(nowDate.getDate() - 6);
    let lastweek = nowDate.getFullYear()+'/'+(nowDate.getMonth()+1)+'/'+nowDate.getDate();   

    let dates = [now,twodays,lastweek,current_month,current_year]
    
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
            period = "del día: " + now;
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
            period = "de los días: " + yesterday + " y " + now;
            break;
        case 2:
            let month_reports =JSON.parse( fs.readFileSync(url+folder+'/month.json'));
            nowDate.setDate(nowDate.getDate() - 7);
            nowDate.setHours(0,0,0,0);

            reports = month_reports.filter( (report) => new Date(report.fecha) >= nowDate);
            production = reports.map((report) => report.produccion );
            apparent_power = (production.reduce((sum,currentValue) => sum + currentValue)).toFixed(3);
            date_production =  reports.map( (report) => new Date(report.fecha).toLocaleString() );
            
            let lastweek = nowDate.getFullYear()+'/'+(nowDate.getMonth()+1)+'/'+nowDate.getDate();
            period = "de la semana: " + lastweek + " a " + now;
            break;
        case 3:
            reports =JSON.parse( fs.readFileSync(url+folder+'/month.json'));
            production = reports.map((report) => report.produccion );
            apparent_power = (production.reduce((sum,currentValue) => sum + currentValue)).toFixed(3);
            date_production =  reports.map( (report) => new Date(report.fecha).toLocaleString() );

            let month = nowDate.getFullYear()+'/'+(nowDate.getMonth()+1)+'/01';
            period = "del mes: " + month + " a " + now;

            break;
        case 4:
            break;
        
    }
    
    let ejs_options = {
        logoPath: path.join('file://',__dirname,'..','public','logo2.png'),
        y_production: production,
        x_date: date_production,
        production_sum: (production.reduce( (sum, currentValue) => sum + currentValue)).toFixed(3),
        period: period,
        voltage: voltage || false,
        current: current || false,
        apparent_power: apparent_power || false,
        active_power: active_power || false,
        frequency: frequency || false
    };
    ejs.renderFile(path.join(__dirname, '../views/', "report.ejs"), ejs_options,null, (err, data) => {
        if (err) {
              res.send(err);
        } else {
            let options = {
                "format": "Letter",
                "paginationOffset": 1,
                "renderDelay": 2000,
               // "orientation": "landscape",
                "border": {
                    "top": "2cm",            // default is 0, units: mm, cm, in, px
                    "right": "1cm",
                    "bottom": "2cm",
                    "left": "1.5cm"
                  }                                             
            };
            console.log(data);
            pdf.create(data, options).toFile('./html-pdf.pdf', function (err, response) {
                if (err) {
                   console.log(err);
                } else {
                    console.log(response);      
                    res.send('ok');                         
                }
            });

            // pdf.create(data, options).toStream( function (err, stream) {
            //     if (err) {
            //         res.send(err);
            //     } else {
            //         res.setHeader('Content-disposition', 'attachment; filename="' + 'outoput.pdf' + '"')
            //         res.header('content-type','application/pdf');
            //         stream.pipe(res);   
                               
            //     }
            // });
        }
    });
    // ejs.renderFile(path.join(__dirname, '../views/', "report.ejs"), {data:options }, (err, data) => {
    //     if (err) {
    //           res.send(err);
    //     } else {
    //         let options = {
    //             "height": "11.25in",
    //             "width": "8.5in"                
    //         };
    //         res.setHeader('Content-disposition', 'attachment; filename="' + 'outoput.pdf' + '"')
    //         res.header('content-type','application/pdf');
    //         //use wkhtmltopdf to create pdf
    //         wkhtmltopdf(data, {
    //             pageSize: 'letter'
    //         }).pipe(res);
    //     }
    // });
    
    

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