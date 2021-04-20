const { Router } = require("express");
const path = require("path");
const fs = require("fs");
const router = Router();


router.get("/", (req, res) => {

    const token = req.headers['x-request-id'];
    const url = process.env.SAMPLES_URL;
    
    let nodes = JSON.parse(fs.readFileSync(url + '/nodes-description.json'));
    let folder = nodes.filter(node => node.token === token)[0];
    folder = folder.module_id;
   
    let notifications =JSON.parse( fs.readFileSync(url+folder+'/notifications.json'));   
                    
    if (notifications.length === 0)
        res.status(404).send("There are no notifications yet")
    else
        res.status(200).json(notifications);
    
});

module.exports = router;