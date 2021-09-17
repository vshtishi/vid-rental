const express = require('express');
const app = express();

require('./startup/logging')();
require('./startup/routes')(app);
require('./startup/db')();
require('./startup/validation')();
require('./startup/prod')(app);

app.set('view engine', 'pug');
app.set('views', './views');


const port = process.env.PORT || 3000;
const server = app.listen(port, () => console.log(`Listening on Port ${port}...`));

module.exports = server;