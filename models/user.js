const mongoose = require('mongoose');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const config = require('config');


const userSchema = new mongoose.Schema({
    name:
    {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255
    },
    email:
    {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255,
        unique: true
    },
    password:
    {
        type: String,
        required: true,
        minlength: 6,
        maxlength: 1024
    },
    isAdmin: Boolean
});

userSchema.methods.generateAuthToken = function(){
    const token = jwt.sign({ _id: this._id, isAdmin: this.isAdmin }, config.get('jwtPrivateKey'));

    return token;
}

const User = mongoose.model('User', userSchema);

function validateUser(user) {
    const schema = Joi.object({
        name: Joi.string().min(5).max(255).required(),
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(6).max(255).required()
    });

    return schema.validate(user);
}


exports.User = User;
exports.validateUser = validateUser;
