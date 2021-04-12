const { Router } = require("express");
const fs = require("fs"); 
const router = Router();
const wkhtmltopdf = require('wkhtmltopdf');
wkhtmltopdf.command = "C:\\Program Files\\wkhtmltopdf\\bin\\wkhtmltopdf.exe";

router.get("/", async (req,res) => {

    res.writeHead(200, {
        'Content-Type': 'application/pdf'
    });

    let htmlContent = fs.readFileSync("./models/prueba.html", "utf8");

    wkhtmltopdf(htmlContent, {
        pageSize: 'letter'
    }).pipe(res);
    console.log(htmlContent);        


});





module.exports = router;