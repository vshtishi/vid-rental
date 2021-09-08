const express = require('express');
const { User, validateUser } = require('../models/user');
const router = express.Router();
const mongoose = require('mongoose');
const _ = require('lodash');


router.post('/', async (req, res) => {
    const { error } = validateUser(req.body);

    //400 - Bad Request
    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    let user = await User.findOne({ email: req.body.email });
    if (user) {
        return res.status(400).send('User already exists');
    }

    user = new User(_.pick(req.body, ['name', 'email', 'password']));

    await user.save();

    res.send(_.pick(user, ['name', 'email']));

});

module.exports = router