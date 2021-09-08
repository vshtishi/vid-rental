const express = require('express');
const { Rental, validateRental } = require('../models/rental');
const router = express.Router();
const mongoose = require('mongoose');
const Fawn = require('fawn');
const { Customer } = require('../models/customer');

Fawn.init(mongoose);

router.get('/', async (req, res) => {
    const rentals = await Rental.find().sort('-orderDate');
    res.send(rentals);
});

router.post('/', async (req, res) => {
    const { error } = validateRental(req.body);

    //400 - Bad Request
    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    const customer = await Customer.findById(req.body.customerId);
    if (!customer) {
        return res.status(400).send('Invalid customer.');
    }

    const movie = await Movie.findById(req.body.movieId);

    if (movie.numberInStock == 0) {
        return res.status(400).send('Movie out of stock!');
    }
    if (!movie) {
        return res.status(400).send('Invalid movie.');
    }

    let rental = new Rental({
        customer: {
            _id: customer._id,
            name: customer.name,
            phone: customer.phone,
            isGold: customer.isGold
        },
        movie: {
            _id: movie._id,
            title: movie.title,
            dailyRentalRate: movie.dailyRentalRate
        },
        orderDate: req.body.orderDate
    });

    try {
        new Fawn.Task()
            .save('rentals', rental)
            .update('movies', { _id: movie._id }, {
                $inc: { numberInStock: -1 }
            })
            .run();

    }
    catch (ex) {
         res.status(500).send('Something went wrong.');
    }
    res.send(rental);

});