const app = require('./app');

const main_port = process.env.MAIN_PORT;


app.listen( main_port , () => {
    console.log(`Server listening on port ${main_port}`);
  });