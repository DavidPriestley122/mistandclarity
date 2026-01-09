const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const paintingsRouter = require('./routes/paintings');
const collectionsRouter = require('./routes/collections');
const artistsRouter = require('./routes/artists');

app.use('/api/paintings', paintingsRouter);
app.use('/api/collections', collectionsRouter);
app.use('/api/artists', artistsRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Mist and Clarity API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
