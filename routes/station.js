const express = require('express');
const router = express.Router();
const Station = require('../models/Station');
const { protect } = require('../middleware/authMiddleware');

// Fetch All Charging Stations (Secured)
router.get('/', protect, async (req, res) => {
    try {
        // Find every station entry in the database collection
        const stations = await Station.find({});
        res.status(200).json({ success: true, count: stations.length, stations });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;