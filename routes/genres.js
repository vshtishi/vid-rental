const auth = require('../middleware/auth');
const express = require('express');
const { Genre, validateGenre } = require('../models/genre');
const router = express.Router();
const mongoose = require('mongoose');

router.get('/', async (req, res) => {
    const genres = await Genre.find().sort('name');
    res.send(genres);
});

router.post('/', auth, async (req, res) => {
    const { error } = validateGenre(req.body);

    //400 - Bad Request
    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    const genre = new Genre({
        name: req.body.name
    });

    await genre.save();

    res.send(genre);

});

router.put('/:id', auth, async (req, res) => {
    const { error } = validateGenre(req.body);

    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    const genre = await Genre.findByIdAndUpdate(
        req.params.id,
        { name: req.body.name },
        { new: true }
    );

    //404 - Not Found
    if (!genre) {
        return res.status(404).send('The genre with the given ID was not found');
    }

    res.send(genre);
});

router.get('/:id', async (req, res) => {
    const genre = await Genre.findById(req.params.id);

    if (!genre) {
        return res.status(404).send('The genre with the given ID was not found');
    }

    res.send(genre);
});

router.delete('/:id', auth, async (req, res) => {
    const genre = await Genre.findByIdAndRemove(req.params.id);

    if (!genre) {
        return res.status(404).send('The genre with the given ID was not found');
    }


    res.send(genre);

});


module.exports = router