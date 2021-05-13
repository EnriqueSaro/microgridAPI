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

router.delete('/:notificationId', function (req,res) {

    const token = req.headers['x-request-id'];
    const url = process.env.SAMPLES_URL;
    const notificationId = parseInt(req.params.notificationId);
    
    let nodes = JSON.parse(fs.readFileSync(url + '/nodes-description.json'));
    let folder = nodes.find(node => node.token === token);
    folder = folder.module_id;
    

    //read json reports
    let notifications =JSON.parse( fs.readFileSync(url+folder+'/notifications.json'));
    let id_exists = notifications.filter(notification => notification.id === notificationId).length;
    
    if( id_exists !== 0){
        //modifying report wit id requested
        let new_notifications = notifications.filter(notification => notification.id !== notificationId );

        //saving report
        fs.writeFile(url + folder +'/notifications.json', JSON.stringify(new_notifications, null, '\t'), function (err) {
            if(err){
                res.status(400).send('Something went wrong');
            }else{
                res.status(200).send('Notification deleted');
            }
        });
    }else{
        res.status(404).send('Notification ID not found');
    }
    
    
});

router.get('/disabled', (req,res) => {

    const token = req.headers['x-request-id'];
    const url = process.env.SAMPLES_URL;
    
    let nodes = JSON.parse( fs.readFileSync( path.join(url,'nodes-description.json') ) );
    let module = nodes.find(node => node.token === token);

    res.status(200).send(module.enable_notifications);

});

router.put('/disabled', (req,res) => {

    const token = req.headers['x-request-id'];
    const url = process.env.SAMPLES_URL;
    
    let nodes = JSON.parse( fs.readFileSync( path.join(url,'nodes-description.json') ) );
    let node_index = nodes.findIndex(node => node.token === token);
    let enable_notifications = nodes[node_index].enable_notifications;
    nodes[node_index].enable_notifications = !enable_notifications;

    fs.writeFile( path.join(url,'nodes-description.json') , JSON.stringify(nodes, null, '\t'), function (err) {
        if(err){
            res.status(400).send('Something went wrong');
        }else{
            res.status(200).send('Notifications ' + (!enable_notifications ? 'enabled': 'disabled' ));
        }
    });
});

module.exports = router;