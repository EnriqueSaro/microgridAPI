const path = require("path");
const ejs = require('ejs');
const pdf = require('html-pdf');


const create_pdf_report = (ejs_options, res) => {

    ejs.renderFile(path.join(__dirname, '../views/', "report.ejs"), ejs_options,null, (err, data) => {
        if (err) {
              res.send(err);
        } else {
            let options = {
                "paginationOffset": 1,
                "renderDelay": 2000,
                "height": "1700px",
                "width": "1200px",
                "border": {
                    "top": "2cm",            // default is 0, units: mm, cm, in, px
                    "right": "1cm",
                    "bottom": "2cm",
                    "left": "1.5cm"
                  }
            };
                
            pdf.create(data, options).toStream( function (err, stream) {
                if (err) {
                    res.send(err);
                } else {
                    res.setHeader('Content-disposition', 'attachment; filename="outoput.pdf"');
                    res.header('content-type','application/pdf');
                    stream.pipe(res);                                          
                }
            });
        }
    });
}

exports.create_pdf_report = create_pdf_report;