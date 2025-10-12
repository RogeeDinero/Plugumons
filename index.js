// index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS so frontend can call backend
app.use(cors());
app.use(express.json());

// Example rewards pool
// In production, this could come from a database or preloaded wallet
const rewardsPool = [
  { type: 'NFT', message: '⚡ You won a Plugumon NFT!' },
  { type: 'SOL', message: '💎 You won 0.03 $SOL!' },
  { type: 'PLUGU', message: '🔌 You won 100,000 $PLUGU!' },
  { type: 'EMPTY', message: '📦 Empty box. Better luck next time!' },
];

// Endpoint to get a random reward
app.get('/api/reward', (req, res) => {
  try {
    // Randomly select reward
    const reward = rewardsPool[Math.floor(Math.random() * rewardsPool.length)];

    // TODO: Add logic to check wallet balances, transfer NFT/SOL/PLUGU

    res.json(reward);
  } catch (err) {
    console.error('Error selecting reward:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.listen(PORT, () => {
  console.log(`Mystery Box backend running on port ${PORT}`);
});
