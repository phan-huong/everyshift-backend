const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Create Schema
const shiftSchema = new Schema({
    date: {
        type: Date,
        required: true
    },
    job: {
        type: String,
        required: false,
        default: ''
    },
    start_time: {
        type: String,
        required: true
    },
    end_time: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'pending',
        required: true
    },
    worker: {
        type: mongoose.Types.ObjectId, 
        required: true, 
        ref: 'User'
    }
});

module.exports = mongoose.model('Shift', shiftSchema);