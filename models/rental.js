const mongoose = require('mongoose');
const Joi = require('joi');

const Rental = new mongoose.model('Rental', new mongoose.Schema({
    customer: {
        type: new mongoose.Schema({
            name: {
                type: String,
                required: true,
                minlength: 5,
                maxlength: 50
            },
            phone: {
                type: String,
                required: true,
                minlength: 10,
                maxLenght: 10
            },
            isGold: {
                default: false,
                type: Boolean
            }
        }),
        required: true
    },
    movie: {
        type: new mongoose.Schema({
            title: {
                type: String,
                required: true,
                minlength: 5,
                maxlength: 100
            },
            dailyRentalRate: {
                type: Number,
                default: 0,
                min: 0
            }
        }),
        required: true
    },
    orderDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    returnDate: {
        type: Date
    },
    rentalFee: {
        type: Number,
        min: 0
    }

}));

function validateRental(rental) {
    const schema = Joi.object({
        customerId: Joi.string().required(),
        movieId: Joi.string.required(),
    });

    return schema.validate(rental);
}

exports.Rental = Rental;
exports.validateRental = validateRental;