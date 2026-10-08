const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Station = require('../models/Station');
const { protect } = require('../middleware/authMiddleware');
const Session = require('../models/Session');

router.post('/seed', async (req, res) => {
    try {
        await Station.deleteMany({});

        const station1 = await Station.create({ vendorName: "Tata Power", locationName: "Highway Hub-A, Surat", coordinates: { latitude: 21.17, longitude: 72.83 }, pricePerKwh: 15 });
        const station2 = await Station.create({ vendorName: "ChargeZone", locationName: "Expressway-B, Vadodara", coordinates: { latitude: 22.30, longitude: 73.18 }, pricePerKwh: 18 });

        res.status(201).json({ message: "Stations seeded!", testStations: [station1, station2] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/start-charging', protect, async (req, res) => {
    const { stationId } = req.body;
    const userId = req.user.userId; 
    try {
        const user = await User.findById(userId);
        const station = await Station.findById(stationId);

        if (!user || !station) return res.status(404).json({ success: false, message: "User or Station missing." });
        if (station.status !== 'Available') return res.status(400).json({ success: false, message: "Station is in use." });
        
        const ESTIMATED_MIN_KWH = 5;
        const estimatedMinCost = station.pricePerKwh * ESTIMATED_MIN_KWH;

       if (user.walletBalance < estimatedMinCost) {
            return res.status(400).json({
                success: false,
                message: `Add funds! You need at least ₹${estimatedMinCost} to safely start a session at this station's rate.`
            });
        }

        station.status = 'Charging';
        await station.save();

        res.status(200).json({ success: true, message: `Charging initiated at ${station.vendorName} station.`, currentWallet: user.walletBalance });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/stop-charging', protect, async (req, res) => {
    const { stationId, kwhConsumed } = req.body;
    const userId = req.user.userId;
    try {
        const user = await User.findById(userId);
        const station = await Station.findById(stationId);

        if (!user || !station) return res.status(404).json({ success: false, message: "Invalid references." });

        if (!kwhConsumed || kwhConsumed <= 0) {
            return res.status(400).json({ success: false, message: "Invalid kWh amount." });
        }

        if (station.status !== 'Charging') {
            return res.status(400).json({ success: false, message: "This station doesn't have an active session to stop." });
        }

        const finalBill = kwhConsumed * station.pricePerKwh;
        user.walletBalance -= finalBill;
        await user.save();

        await Session.create({
            userId,
            stationId,
            vendorName: station.vendorName,
            kwhConsumed,
            totalCost: finalBill
        });

        station.status = 'Available';
        await station.save();

        res.status(200).json({
            success: true,
            message: "Session ended. Balance settled seamlessly with no vendor residue.",
            summary: { vendor: station.vendorName, unitsUsed: `${kwhConsumed} kWh`, deducted: `₹${finalBill}`, dynamicRemainingWallet: `₹${user.walletBalance}` }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Fetch Charging History Ledger for the Logged-in User (Secured)
router.get('/history', protect, async (req, res) => {
    try {
        // Find all records belonging to this specific user and sort by newest first
        const history = await Session.find({ userId: req.user.userId }).sort({ chargedAt: -1 });
        
        res.status(200).json({ 
            success: true, 
            count: history.length, 
            history 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;