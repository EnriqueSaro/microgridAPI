const { Router } = require("express");
const path = require("path");
const fs = require("fs"); 
const router = Router();



router.get('/range', (req,res) => {

  const token = req.headers['x-request-id'];
  const url = process.env.SAMPLES_URL;
  
  let nodes = JSON.parse( fs.readFileSync( path.join(url,'nodes-description.json') ) );
  let folder = nodes.find(node => node.token === token);
  let ranges = folder.ranges;

  if ( ranges.length !== 0 ){
    res.status(200).send(ranges);
  }else{
    res.status(404).send("Not ranges found for this module");
  }

});

router.post('/range', (req,res) => {

  const token = req.headers['x-request-id'];
  const url = process.env.SAMPLES_URL;
  const init = req.body.init;
  const final = req.body.final;
  
  let nodes = JSON.parse( fs.readFileSync( path.join(url,'nodes-description.json') ) );
  let index = nodes.findIndex(node => node.token === token);
  let ranges =  nodes[index].ranges;

  let values_valid = (init >= 0 && init <= 23) && (final >= 0 && final <= 23);  
  let ranges_exists = ranges.find( range => range.init === init && range.final === final);

  if ( values_valid && !ranges_exists ){

    let range_id = ( ranges.length === 0 ) ? 0 : ranges[ranges.length - 1].idRange + 1 ;
    
    let new_range = {
      idRange: range_id,
      init: init,
      final: final
    }
    ranges.push(new_range);
    nodes[index].ranges = ranges;

    fs.writeFile( path.join(url,'nodes-description.json'), JSON.stringify(nodes, null, '\t'), function (err) {
      if(err){
          res.status(400).send('Something went wrong');
      }else{
          res.status(200).send('Range added');
      }
    });

  }else{
    res.status(404).send("Ranges are not valid or already exists");
  }

});

router.delete('/range/:idRange', (req,res) => {

  const token = req.headers['x-request-id'];
  const url = process.env.SAMPLES_URL;
  const idRange = parseInt(req.params.idRange);

  let nodes = JSON.parse( fs.readFileSync( path.join(url,'nodes-description.json') ) );
  let index = nodes.findIndex(node => node.token === token);
  let ranges =  nodes[index].ranges;

  let range_id_exists = ranges.find( range => range.idRange === idRange);
  

  if ( range_id_exists ){

    nodes[index].ranges = ranges.filter( range => range.idRange !== idRange);

    fs.writeFile( path.join(url,'nodes-description.json'), JSON.stringify(nodes, null, '\t'), function (err) {
      if(err){
          res.status(400).send('Something went wrong');
      }else{
          res.status(200).send('Range deleted');
      }
    });

  }else{
    res.status(404).send("Range ID doesn't exist");
  }

});


module.exports = router;