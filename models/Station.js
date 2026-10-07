const mongoose = require('mongoose');

const StationSchema = new mongoose.Schema({
    vendorName: { type: String, required: true }, 
    locationName: { type: String, required: true },
    coordinates: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true }
    },
    status: { type: String, enum: ['Available', 'Charging', 'Offline'], default: 'Available' },
    pricePerKwh: { type: Number, required: true }
});

module.exports = mongoose.model('Station', StationSchema);