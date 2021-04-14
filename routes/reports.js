const { Router } = require("express");
const path = require('path');
const ejs = require('ejs');
const fs = require("fs");
const pdf = require('html-pdf');
const wkhtmltopdf = require('wkhtmltopdf');

const router = Router();
let options = { format: 'A4' };
wkhtmltopdf.command = "C:\\Program Files\\wkhtmltopdf\\bin\\wkhtmltopdf.exe";


router.get("/", (req, res) => {

    const folder = req.headers['x-request-id'];
    const url = process.env.SAMPLES_URL;
   
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

    const folder = req.headers['x-request-id'];
    const url = process.env.SAMPLES_URL;

    const reportId = req.params.reportId;

    //let htmlContent = fs.readFileSync("./models/prueba.html",'utf-8');

    
    ejs.renderFile(path.join(__dirname, '../views/', "report.ejs"), {data:options }, (err, data) => {
        if (err) {
              res.send(err);
        } else {
            let options = {
                "format": "Letter",
                "renderDelay": 1000,
                "border": {
                    "top": "2cm",            // default is 0, units: mm, cm, in, px
                    "right": "1cm",
                    "bottom": "2cm",
                    "left": "1.5cm"
                  },
                                             
            };
            pdf.create(data, options).toStream( function (err, stream) {
                if (err) {
                    res.send(err);
                } else {
                    res.setHeader('Content-disposition', 'attachment; filename="' + 'outoput.pdf' + '"')
                    res.header('content-type','application/pdf');
                    stream.pipe(res);   
                               
                }
            });
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

    const folder = req.headers['x-request-id'];
    const url = process.env.SAMPLES_URL;
    const reportId = parseInt(req.params.reportId);

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