const { Router } = require("express");
const path = require('path');
const ejs = require('ejs');
const fs = require("fs");
const router = Router();
const wkhtmltopdf = require('wkhtmltopdf');
let options = { format: 'A4' };
wkhtmltopdf.command = "C:\\Program Files\\wkhtmltopdf\\bin\\wkhtmltopdf.exe";

router.get("/:reportId", (req, res) => {

    const folder = req.headers['x-request-id'];
    const url = process.env.SAMPLES_URL;

    //let htmlContent = fs.readFileSync("./models/prueba.html",'utf-8');

    
    // ejs.renderFile(path.join(__dirname, '../views/', "report.ejs"), {data:options }, (err, data) => {
    //     if (err) {
    //           res.send(err);
    //     } else {
    //         let options = {
    //             "height": "11.25in",
    //             "width": "8.5in"                
    //         };
    //         pdf.create(data, options).toStream( function (err, stream) {
    //             if (err) {
    //                 res.send(err);
    //             } else {
    //                 res.setHeader('Content-disposition', 'attachment; filename="' + 'outoput.pdf' + '"')
    //                 res.header('content-type','application/pdf');
    //                 stream.pipe(res);   
                               
    //             }
    //         });
    //     }
    // });
    ejs.renderFile(path.join(__dirname, '../views/', "report.ejs"), {data:options }, (err, data) => {
        if (err) {
              res.send(err);
        } else {
            let options = {
                "height": "11.25in",
                "width": "8.5in"                
            };
            res.setHeader('Content-disposition', 'attachment; filename="' + 'outoput.pdf' + '"')
            res.header('content-type','application/pdf');
            //use wkhtmltopdf to create pdf
            wkhtmltopdf(data, {
                pageSize: 'letter'
            }).pipe(res);
        }
    });
    
    

});
module.exports = router;