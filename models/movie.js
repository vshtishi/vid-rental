const mongoose = require('mongoose');
const Joi = require('joi');
const { genreSchema } = require('./genre');

const Movie = mongoose.model('Movie', new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 100
    },
    genre: {
        type: genreSchema,
        required: true
    },
    numberInStock: {
        type: Number,
        default: 0,
        min: 0

    },
    dailyRentalRate: {
        type: Number,
        default: 0,
        min: 0
    }
}));


function validateMovie(movie) {
    const schema = Joi.object({
        title: Joi.string().min(5).max(100).required(),
        genreId: Joi.objectId().required(),
        numberInStock: Joi.number().min(0),
        dailyRentalRate: Joi.number().min(0)
    });

    return schema.validate(movie);
}


exports.Movie = Movie;
exports.validateMovie = validateMovie;