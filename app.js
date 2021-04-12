/*Configuración de variables de entorno, puertos, recursos*/

require('dotenv').config();

/******************************************/

/*Importación de modulos (Propios o Externos)*/

const bodyParser = require("body-parser"); //Importamos la libreria Body Parser para leer parametros
const express = require("express"); //Importamos el middleware de express.js (node_modules)
const fs = require("fs");  //Importamos file system para leer archivos
const app = express(); //Indicamos que nuestra app funcionara bajo Express
const main_port = process.env.MAIN_PORT;

/******************************************/


//Se declara que la App podra extraer parametros
app.use(bodyParser.json({limit:'100kb'})) //Formato JSON
app.use(bodyParser.json({parameterLimit:'1000' })) //Formato JSON
app.use(bodyParser.urlencoded({extended: true}))//Encoded
//app.use(session({secret: "f156e7995d521f30e6c59a3d6c75e1e5"})); //Palabra secreta para sesiones
//Oscar en MD5 = f156e7995d521f30e6c59a3d6c75e1e5
/******************************************/

/*Routing*/

app.use(function(req, res, next){

    const folder = req.headers['x-request-id'];
    const url = process.env.SAMPLES_URL;

    if (!folder || !fs.existsSync(url + folder))
        res.status(404).send("Endpoint notFound");
    else
        next();
    
 });

 //app.use("/", require("./routes/index"));
app.use("/dashboard", require("./routes/dashboard"));
app.use("/reports", require("./routes/reports"));
//app.use("/users", require("./deployments/session"));
/******************************************/

/*Lanzamiento de servidor y canales*/

app.listen(main_port);