const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const asyncMiddleware = require('../middleware/async');
const express = require('express');
const { Customer, validateCustomer } = require('../models/customer');
const _ = require('lodash');

const router = express.Router();
const mongoose = require('mongoose');

router.get('/', asyncMiddleware(async (req, res) => {
    const customers = await Customer.find().sort('name');
    res.send(customers);
}));

router.post('/', auth, asyncMiddleware(async (req, res) => {
    const { error } = validateCustomer(req.body);

    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    const customer = new Customer({
        name: req.body.name,
        phone: req.body.phone,
        isGold: req.body.isGold
    });

    await customer.save();

    res.send(customer);
}));

router.get('/:id', asyncMiddleware(async (req, res) => {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
        return res.status(404).send('The customer with the given ID was not found');
    }

    res.send(customer);
}));

router.put('/:id', auth, asyncMiddleware(async (req, res) => {
    const { error } = validateCustomer(req.body);

    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    const customer = await Customer.findByIdAndUpdate(
        req.params.id,
        _.pick(req.body, ['name', 'phone', 'isGold']),
        { new: true });


    //404 - Not Found
    if (!customer) {
        return res.status(404).send('The customer with the given ID was not found');
    }

    res.send(customer);
}));

router.delete('/:id', [auth, admin], asyncMiddleware(async (req, res) => {
    const customer = await Customer.findByIdAndRemove(req.params.id);

    if (!customer) {
        return res.status(404).send('The customer with the given ID was not found');
    }

    res.send(customer);

}));



module.exports = router;