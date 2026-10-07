const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    stationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Station',
        required: true
    },
    vendorName: {
        type: String,
        required: true
    },
    kwhConsumed: {
        type: Number,
        required: true
    },
    totalCost: {
        type: Number,
        required: true
    },
    chargedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Session', SessionSchema);