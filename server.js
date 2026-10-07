const express = require('express');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();
app.use(express.json());

connectDB();

app.use('/api/charging', require('./routes/charging'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/wallet', require('./routes/wallet'));
app.use('/api/stations', require('./routes/station'));

app.get('/', (req, res) => res.send('UniCharge Aggregator Engine API Running...'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server spinning up smoothly on port ${PORT}`));