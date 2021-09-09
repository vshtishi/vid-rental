const mongoose = require('mongoose');
const Joi = require('joi');

const Customer = mongoose.model('Customer', new mongoose.Schema({
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
        maxlength: 11
    },
    isGold: {
        default: false,
        type: Boolean
    }
}));


function validateCustomer(customer) {
    const schema = Joi.object({
        name: Joi.string().min(5).max(50).required(),
        phone: Joi.string().length(10).required(),
        isGold: Joi.boolean()
    });

    return schema.validate(customer);

}

exports.Customer = Customer;
exports.validateCustomer = validateCustomer;