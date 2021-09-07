const mongoose = require('mongoose');
const express = require('express');
const genres = require('./routes/genres');
const customers = require('./routes/customers')

mongoose.connect('mongodb://localhost/video-rental')
    .then(() => console.log('connected to MongoDB...'))
    .catch((err) => console.log(err.message));

const app = express();

app.set('view engine', 'pug');
app.set('views', './views');

app.use(express.json());
app.use('/api/genres', genres);
app.use('/api/customers', customers)


const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on Port ${port}...`));