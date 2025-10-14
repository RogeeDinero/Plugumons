const db = require('./database');
const solana = require('./solana-service');

// APR rates based on lock periods
const APR_RATES = {
  30: 0.05,   // 5% for 30 days
  90: 0.10,   // 10% for 90 days
  365: 0.20   // 20% for 365 days
};

// Grid charge target
const GRID_CHARGE_TARGET = 200000000; // 200M PLUGU tokens

/**
 * Calculate rewards for a stake
 */
function calculateRewards(amount, apr, startDate, isNFTHolder, gridBoostActive = false) {
  const now = Math.floor(Date.now() / 1000);
  const daysStaked = (now - startDate) / (24 * 60 * 60);
  
  let effectiveAPR = apr;
  
  // NFT holder bonus: 2x multiplier after halfway point
  if (isNFTHolder) {
    effectiveAPR = apr * 2;
  }
  
  // Grid boost: 2x multiplier when grid is at 100%
  if (gridBoostActive) {
    effectiveAPR = effectiveAPR * 2;
  }
  
  // Calculate rewards: (amount × APR × days) / 365
  const rewards = (amount * effectiveAPR * daysStaked) / 365;
  
  return Math.floor(rewards);
}

/**
 * Calculate if NFT holder has reached halfway point for bonus
 */
function hasReachedHalfway(startDate, lockPeriod) {
  const now = Math.floor(Date.now() / 1000);
  const daysStaked = (now - startDate) / (24 * 60 * 60);
  return daysStaked >= (lockPeriod / 2);
}

/**
 * Get current APR for a stake
 */
function getCurrentAPR(stake, gridBoostActive = false) {
  let apr = stake.apr;
  
  // NFT holder bonus after halfway
  if (stake.is_nft_holder && hasReachedHalfway(stake.start_date, stake.lock_period)) {
    apr = apr * 2;
  }
  
  // Grid boost
  if (gridBoostActive) {
    apr = apr * 2;
  }
  
  return apr;
}

/**
 * Create a new stake
 */
async function createStake(walletAddress, amount, lockPeriod) {
  try {
    // Validate lock period
    if (![30, 90, 365].includes(lockPeriod)) {
      return { success: false, error: 'Invalid lock period. Must be 30, 90, or 365 days.' };
    }

    // Check if user holds NFTs
    const { hasNFT } = await solana.checkNFTOwnership(walletAddress);
    
    const now = Math.floor(Date.now() / 1000);
    const apr = APR_RATES[lockPeriod];
    const endDate = now + (lockPeriod * 24 * 60 * 60);
    
    // Insert stake into database
    const result = db.stakeTokens.run(
      walletAddress,
      amount,
      lockPeriod,
      apr,
      now,
      endDate,
      hasNFT ? 1 : 0
    );

    return {
      success: true,
      stakeId: result.lastInsertRowid,
      message: `Successfully staked ${amount} PLUGU for ${lockPeriod} days!`,
      hasNFT
    };
  } catch (error) {
    console.error('Error creating stake:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Unstake tokens
 */
async function unstake(stakeId, walletAddress) {
  try {
    const stake = db.getStakeById.get(stakeId);
    
    if (!stake) {
      return { success: false, error: 'Stake not found' };
    }
    
    if (stake.wallet_address !== walletAddress) {
      return { success: false, error: 'Unauthorized' };
    }
    
    if (stake.status !== 'active') {
      return { success: false, error: 'Stake is not active' };
    }
    
    const now = Math.floor(Date.now() / 1000);
    
    // Check if NFT holder (they can unstake anytime)
    if (!stake.is_nft_holder && now < stake.end_date) {
      return { 
        success: false, 
        error: 'Lock period not completed. Only NFT holders can unstake early.' 
      };
    }
    
    // Calculate unclaimed rewards
    const gridBoostActive = isGridBoostActive();
    const unclaimedRewards = calculateRewards(
      stake.amount,
      stake.apr,
      stake.start_date,
      stake.is_nft_holder,
      gridBoostActive
    ) - stake.rewards_claimed;
    
    // Mark stake as completed
    db.updateStakeStatus.run('completed', stakeId);
    
    return {
      success: true,
      amount: stake.amount,
      unclaimedRewards,
      message: `Successfully unstaked ${stake.amount} PLUGU!`
    };
  } catch (error) {
    console.error('Error unstaking:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Claim rewards
 */
async function claimRewards(stakeId, walletAddress) {
  try {
    const stake = db.getStakeById.get(stakeId);
    
    if (!stake) {
      return { success: false, error: 'Stake not found' };
    }
    
    if (stake.wallet_address !== walletAddress) {
      return { success: false, error: 'Unauthorized' };
    }
    
    if (stake.status !== 'active') {
      return { success: false, error: 'Stake is not active' };
    }
    
    // Calculate total rewards
    const gridBoostActive = isGridBoostActive();
    const totalRewards = calculateRewards(
      stake.amount,
      stake.apr,
      stake.start_date,
      stake.is_nft_holder,
      gridBoostActive
    );
    
    const unclaimedRewards = totalRewards - stake.rewards_claimed;
    
    if (unclaimedRewards <= 0) {
      return { success: false, error: 'No rewards to claim' };
    }
    
    // Update database
    db.updateRewardsClaimed.run(unclaimedRewards, stakeId);
    db.recordRewardClaim.run(stakeId, walletAddress, unclaimedRewards);
    
    // Note: Actual token transfer would happen here
    // await solana.sendRewards(walletAddress, unclaimedRewards);
    
    return {
      success: true,
      amount: unclaimedRewards,
      message: `Successfully claimed ${unclaimedRewards.toFixed(2)} PLUGU rewards!`
    };
  } catch (error) {
    console.error('Error claiming rewards:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get user stakes with calculated rewards
 */
function getUserStakes(walletAddress) {
  try {
    const stakes = db.getActiveStakes.all(walletAddress);
    const gridBoostActive = isGridBoostActive();
    
    return stakes.map(stake => {
      const now = Math.floor(Date.now() / 1000);
      const totalRewards = calculateRewards(
        stake.amount,
        stake.apr,
        stake.start_date,
        stake.is_nft_holder,
        gridBoostActive
      );
      const unclaimedRewards = totalRewards - stake.rewards_claimed;
      const daysRemaining = Math.max(0, Math.ceil((stake.end_date - now) / (24 * 60 * 60)));
      const daysStaked = Math.floor((now - stake.start_date) / (24 * 60 * 60));
      const progress = Math.min(100, (daysStaked / stake.lock_period) * 100);
      const currentAPR = getCurrentAPR(stake, gridBoostActive);
      
      return {
        ...stake,
        totalRewards,
        unclaimedRewards,
        daysRemaining,
        daysStaked,
        progress,
        currentAPR,
        canUnstake: stake.is_nft_holder || now >= stake.end_date,
        hasHalfwayBonus: stake.is_nft_holder && hasReachedHalfway(stake.start_date, stake.lock_period)
      };
    });
  } catch (error) {
    console.error('Error getting user stakes:', error);
    return [];
  }
}

/**
 * Get grid statistics
 */
function getGridStats() {
  try {
    const totalStaked = db.getTotalStaked.get().total;
    const activeStakers = db.getActiveStakersCount.get().count;
    const chargePercentage = Math.min(100, (totalStaked / GRID_CHARGE_TARGET) * 100);
    const isBoostActive = chargePercentage >= 100;
    
    return {
      totalStaked,
      activeStakers,
      chargePercentage: Math.round(chargePercentage * 100) / 100,
      isBoostActive,
      targetAmount: GRID_CHARGE_TARGET
    };
  } catch (error) {
    console.error('Error getting grid stats:', error);
    return {
      totalStaked: 0,
      activeStakers: 0,
      chargePercentage: 0,
      isBoostActive: false,
      targetAmount: GRID_CHARGE_TARGET
    };
  }
}

/**
 * Check if grid boost is active
 */
function isGridBoostActive() {
  const stats = getGridStats();
  return stats.isBoostActive;
}

/**
 * Get leaderboard
 */
function getLeaderboard(limit = 5) {
  try {
    return db.getLeaderboard.all(limit);
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return [];
  }
}

/**
 * Get user statistics
 */
function getUserStats(walletAddress) {
  try {
    const stats = db.getUserStats.get(walletAddress);
    const stakes = getUserStakes(walletAddress);
    const totalPendingRewards = stakes.reduce((sum, stake) => sum + stake.unclaimedRewards, 0);
    
    return {
      ...stats,
      totalPendingRewards
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    return {
      active_stakes: 0,
      total_staked: 0,
      total_claimed: 0,
      totalPendingRewards: 0
    };
  }
}

module.exports = {
  createStake,
  unstake,
  claimRewards,
  getUserStakes,
  getGridStats,
  getLeaderboard,
  getUserStats,
  APR_RATES
};
