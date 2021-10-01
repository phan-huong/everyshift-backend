const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const localhost = require('../config/localhost');
const Schema = mongoose.Schema;

const userSchema = new Schema({

    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true, 
        minlength: 6 
    },
    role: {
        type: String,
        required: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: false
    },
    streetHouseNr: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    postalCode: {
        type: Number,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    salary: {
        type: Number,
        required: true
    },
    image: { 
        type: String, 
        required: false,
        default: `https://${localhost.get_ip(localhost.device_type)}/public/icons/user.png`
    },
    entryDate: {
        type: Date,
        required: true
    },
    shifts: 
    [{ 
        type: mongoose.Types.ObjectId, 
        required: true, 
        ref: 'Shift'
    }],
    color_bkgr: {
        type: String,
        required: false,
        default: "#274B7D"
    },
    color_text: {
        type: String,
        required: false,
        default: "#FFFFFF"
    },
    daysOffCount: {
        type: Number,
        required: false,
        default: 24
    },
    daysOff: 
    [{ 
        type: Date, 
        required: false
    }]
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);


