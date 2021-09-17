const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Rental } = require('../models/rental');
const moment = require('moment');
const { Movie } = require('../models/movie');
const Joi = require('joi');
const validate = require('../middleware/validate');


router.post('/', [auth, validate(validateReturn)], async (req, res) => {


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

function validateReturn(req) {
    const schema = Joi.object({
        customerId: Joi.objectId().required(),
        movieId: Joi.objectId().required()
    });

    return schema.validate(req);
}


module.exports = router;