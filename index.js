const express = require('express');
const app = express();

require('./startup/logging')();
require('./startup/routes')(app);
require('./startup/db')();
require('./startup/validation')();

app.set('view engine', 'pug');
app.set('views', './views');

throw new Error('just a test')

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on Port ${port}...`));