const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// 1. Get Live Wallet Balance (Secured)
router.get('/', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        res.status(200).json({ success: true, walletBalance: user.walletBalance });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Add Mock Funds to Wallet (Secured)
router.post('/add', protect, async (req, res) => {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
        return res.status(400).json({ success: false, message: "Invalid amount specified." });
    }

    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // Add the funds to the existing balance
        user.walletBalance += Number(amount);
        await user.save();

        res.status(200).json({ 
            success: true, 
            message: `Successfully added ₹${amount} to your wallet.`, 
            newBalance: user.walletBalance 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;