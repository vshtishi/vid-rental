const express = require('express')
const Joi = require('joi')

const router = express.Router()
const mongoose = require('mongoose')

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
        maxLenght: 10
    },
    isGold: {
        default: false,
        type: Boolean
    }
}))


router.get('/', async (req, res) => {
    const customers = await Customer.find().sort('name');
    res.send(customers)
});

router.post('/', async (req, res) => {
    const { error } = validateCustomer(req.body);

    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    let customer = new Customer({
        name: req.body.name,
        phone: req.body.name,
        isGold: req.body.isGold
    });

    customer = await customer.save()

    res.send(customer)
});

router.get('/:id', async (req, res) => {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
        return res.status(404).send('The customer with the given ID was not found');
    }

    res.send(customer);
})

router.put('/:id', async (req, res) => {
    const { error } = validateCustomer(req.body);

    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    customer = await Customer.findByIdandUpdate(
        req.params.id,
        { name: req.body.name },
        { new: true });


    //404 - Not Found
    if (!customer) {
        return res.status(404).send('The customer with the given ID was not found');
    }

    res.send(customer);
})

router.delete('/:id', async (req, res) => {
    const customer = await Customer.findByIdAndRemove(req.params.id);

    if (!customer) {
        return res.status(404).send('The customer with the given ID was not found');
    }

    res.send(customer);

})

function validateCustomer(customer) {
    const schema = Joi.object({
        name: Joi.string().min(5).max(50).required(),
        phone: Joi.string().length(10).required(),
        isGold: Joi.boolean()
    })

    return schema.validate(customer)

}

module.exports = router