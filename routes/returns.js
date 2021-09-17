const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Rental } = require('../models/rental');
const moment = require('moment');
const { Movie } = require('../models/movie');

router.post('/', auth, async (req, res) => {

    if (!req.body.customerId) {
        return res.status(400).send('Customer Id was not provided');
    }
    if (!req.body.movieId) {
        return res.status(400).send('Movie Id was not provided');
    }

    const rental = await Rental.findOne({ 'customer._id': req.body.customerId, 'movie._id': req.body.movieId })

    if (!rental) {
        return res.status(404).send('No rental found');
    }

    if (rental.returnDate) {
        return res.status(400).send('Rental has been processed');
    }

    rental.returnDate = new Date();
    days = moment().diff(rental.orderDate, 'days');
    rental.rentalFee = days * rental.movie.dailyRentalRate;
    await rental.save();

    await Movie.updateOne({ _id: rental.movie._id }, {
        $inc: { numberInStock: 1 }
    })

    return res.send(rental);
});


module.exports = router;