const Database = require('better-sqlite3');
const path = require('path');

// Initialize database
const db = new Database(path.join(__dirname, 'staking.db'));

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS stakes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    wallet_address TEXT NOT NULL,
    amount REAL NOT NULL,
    lock_period INTEGER NOT NULL,
    apr REAL NOT NULL,
    start_date INTEGER NOT NULL,
    end_date INTEGER NOT NULL,
    rewards_claimed REAL DEFAULT 0,
    is_nft_holder INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
  );

  CREATE TABLE IF NOT EXISTS nft_holders (
    wallet_address TEXT PRIMARY KEY,
    last_verified INTEGER,
    nft_count INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS reward_claims (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stake_id INTEGER NOT NULL,
    wallet_address TEXT NOT NULL,
    amount REAL NOT NULL,
    claimed_at INTEGER DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (stake_id) REFERENCES stakes(id)
  );

  CREATE INDEX IF NOT EXISTS idx_wallet ON stakes(wallet_address);
  CREATE INDEX IF NOT EXISTS idx_status ON stakes(status);
`);

// Helper functions
const stakeTokens = db.prepare(`
  INSERT INTO stakes (wallet_address, amount, lock_period, apr, start_date, end_date, is_nft_holder)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const getActiveStakes = db.prepare(`
  SELECT * FROM stakes 
  WHERE wallet_address = ? AND status = 'active'
  ORDER BY created_at DESC
`);

const getStakeById = db.prepare(`
  SELECT * FROM stakes WHERE id = ?
`);

const updateStakeStatus = db.prepare(`
  UPDATE stakes SET status = ? WHERE id = ?
`);

const updateRewardsClaimed = db.prepare(`
  UPDATE stakes SET rewards_claimed = rewards_claimed + ? WHERE id = ?
`);

const recordRewardClaim = db.prepare(`
  INSERT INTO reward_claims (stake_id, wallet_address, amount)
  VALUES (?, ?, ?)
`);

const getTotalStaked = db.prepare(`
  SELECT COALESCE(SUM(amount), 0) as total
  FROM stakes
  WHERE status = 'active'
`);

const getActiveStakersCount = db.prepare(`
  SELECT COUNT(DISTINCT wallet_address) as count
  FROM stakes
  WHERE status = 'active'
`);

const getLeaderboard = db.prepare(`
  SELECT 
    wallet_address,
    SUM(amount) as total_staked,
    SUM(rewards_claimed) as total_rewards
  FROM stakes
  WHERE status = 'active'
  GROUP BY wallet_address
  ORDER BY total_staked DESC
  LIMIT ?
`);

const updateNFTHolder = db.prepare(`
  INSERT OR REPLACE INTO nft_holders (wallet_address, last_verified, nft_count)
  VALUES (?, ?, ?)
`);

const getNFTHolder = db.prepare(`
  SELECT * FROM nft_holders WHERE wallet_address = ?
`);

const getUserStats = db.prepare(`
  SELECT 
    COUNT(*) as active_stakes,
    COALESCE(SUM(amount), 0) as total_staked,
    COALESCE(SUM(rewards_claimed), 0) as total_claimed
  FROM stakes
  WHERE wallet_address = ? AND status = 'active'
`);

module.exports = {
  db,
  stakeTokens,
  getActiveStakes,
  getStakeById,
  updateStakeStatus,
  updateRewardsClaimed,
  recordRewardClaim,
  getTotalStaked,
  getActiveStakersCount,
  getLeaderboard,
  updateNFTHolder,
  getNFTHolder,
  getUserStats
};
