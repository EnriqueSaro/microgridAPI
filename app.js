/*Configuración de variables de entorno, puertos, recursos*/

require('dotenv').config();

/******************************************/

/*Importación de modulos (Propios o Externos)*/

const bodyParser = require("body-parser"); //Importamos la libreria Body Parser para leer parametros
const express = require("express"); //Importamos el middleware de express.js (node_modules)
const fs = require("fs");  //Importamos file system para leer archivos
const app = express(); //Indicamos que nuestra app funcionara bajo Express

/******************************************/
app.set('views', './views'); 
app.set('view engine', 'ejs');

//se definen recursos estáticos
app.use("/public", express.static(__dirname + "/public/"));
//Se declara que la App podra extraer parametros
app.use(bodyParser.json({limit:'100kb'})) //Formato JSON
app.use(bodyParser.json({parameterLimit:'1000' })) //Formato JSON
app.use(bodyParser.urlencoded({extended: true}))//Encoded

 //to convert html to pdf
//app.use(session({secret: "f156e7995d521f30e6c59a3d6c75e1e5"})); //Palabra secreta para sesiones
//Oscar en MD5 = f156e7995d521f30e6c59a3d6c75e1e5
/******************************************/

/*Routing*/
app.post('/login', function(req,res) {
    
    let token = req.body.password;
    let device_token = req.body.token;

    const url = process.env.SAMPLES_URL;

    let nodes = JSON.parse(fs.readFileSync(url + '/nodes-description.json'));
    let folder = nodes.filter(node => node.token === token);

    if (!token ||  folder.length ===0 || !fs.existsSync(url + folder[0].module_id) ){
        res.status(200).json({ accept: false });
    }else{
        let devices = JSON.parse(fs.readFileSync(url + '/devices.json'));
        let device_index = devices.findIndex( device => device.token === device_token);

        if(device_index > -1){
            devices[device_index].module_id = folder;
        }else{
            devices.push({
                token: device_token,
                module_id: folder
            });
        }
        fs.writeFileSync(url  +'/devices.json', JSON.stringify(devices, null, '\t'));
        res.status(200).json({ accept: true });
    }        
});
app.use(function(req, res, next){

    const token = req.headers['x-request-id'];
    const url = process.env.SAMPLES_URL;

    let nodes = JSON.parse(fs.readFileSync(url + '/nodes-description.json'));
    let folder = nodes.filter(node => node.token === token);

    if (!token || folder.length ===0 || !fs.existsSync(url + folder[0].module_id) )
        res.status(400).send("Endpoint notFound");
    else
        next();
    
 });

 //app.use("/", require("./routes/index"));
app.use("/dashboard", require("./routes/dashboard"));
app.use("/reports", require("./routes/reports"));
app.use("/charts", require("./routes/charts"));
app.use("/notifications", require("./routes/notifications"));

//app.use("/users", require("./deployments/session"));
/******************************************/

/*Exportamos servidor y canales*/
module.exports = app;