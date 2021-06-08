const path = require("path");
const ejs = require('ejs');
const pdf = require('html-pdf');


const create_pdf_report = (ejs_options, res) => {


    
    let max_value = Math.max(...ejs_options.y_production);
    
    let max_value_index = ejs_options.y_production.findIndex( prod => max_value === prod );
    console.log(max_value_index);
    let colors_bars = ejs_options.y_production.map( (prod) => {
        if( prod > (max_value / 2))
            return "rgb(81,209,71)";
        else if( prod > (max_value / 4))
            return "rgb(249,228,74)";
        else                   
            return "rgb(249,74,74)";

    });
    colors_bars[max_value_index] = "rgb(74, 233,249)";
    ejs_options.colors_bars = colors_bars;

    // let max_value = Math.max(...ejs_options.y_production);
    
    // let max_value_index = ejs_options.y_production.findIndex( prod => max_value === prod );
    // console.log(max_value_index);
    // let green_bars = ejs_options.y_production.map( (prod) => ( prod >= (max_value / 2)) ? prod : 0);
    // green_bars = green_bars.map( (prod,index) => index !== max_value_index ? prod : 0 )
    // let yellow_bars = ejs_options.y_production.map( (prod) => ( prod >= (max_value / 4) && prod < (max_value / 2)) ? prod : 0);
    // let red_bars = ejs_options.y_production.map( (prod) => ( prod < (max_value / 4)) ? prod : 0);
    // let blue_bars = ejs_options.y_production.map( (prod,index) => index !== max_value_index ? 0 : prod );


    // ejs_options.green_bars = green_bars;
    // ejs_options.yellow_bars = yellow_bars;
    // ejs_options.red_bars = red_bars;
    // ejs_options.blue_bars = blue_bars;

    
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