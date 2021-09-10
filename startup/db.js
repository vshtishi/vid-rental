const mongoose = require('mongoose');

module.exports = function () {
    mongoose.connect('mongodb://localhost/video-rental')
        .then(() => console.log('Connected to MongoDB...'))
    
}