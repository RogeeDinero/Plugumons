use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer, Mint};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod plugumons_staking {
    use super::*;

    /// Initialize the staking program
    pub fn initialize(ctx: Context<Initialize>, reward_rate: u64) -> Result<()> {
        let staking_pool = &mut ctx.accounts.staking_pool;
        staking_pool.authority = ctx.accounts.authority.key();
        staking_pool.reward_rate = reward_rate;
        staking_pool.total_staked = 0;
        staking_pool.grid_boost_active = false;
        staking_pool.grid_target = 200_000_000_000_000_000; // 200M tokens with 9 decimals
        staking_pool.bump = ctx.bumps.staking_pool;
        Ok(())
    }

    /// Stake tokens with a specific lock period
    pub fn stake(
        ctx: Context<Stake>,
        amount: u64,
        lock_period: u64, // in seconds
    ) -> Result<()> {
        require!(amount > 0, StakingError::InvalidAmount);
        require!(
            lock_period == 2_592_000 || lock_period == 7_776_000 || lock_period == 31_536_000,
            StakingError::InvalidLockPeriod
        ); // 30, 90, or 365 days

        let stake_account = &mut ctx.accounts.stake_account;
        let staking_pool = &mut ctx.accounts.staking_pool;
        
        let clock = Clock::get()?;
        
        stake_account.owner = ctx.accounts.user.key();
        stake_account.amount = amount;
        stake_account.lock_period = lock_period;
        stake_account.start_time = clock.unix_timestamp;
        stake_account.end_time = clock.unix_timestamp + lock_period as i64;
        stake_account.rewards_claimed = 0;
        stake_account.is_nft_holder = false; // Will be verified separately
        stake_account.bump = ctx.bumps.stake_account;

        // Transfer tokens from user to pool
        let cpi_accounts = Transfer {
            from: ctx.accounts.user_token_account.to_account_info(),
            to: ctx.accounts.pool_token_account.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, amount)?;

        // Update total staked
        staking_pool.total_staked = staking_pool.total_staked.checked_add(amount).unwrap();
        
        // Check if grid boost should be activated
        if staking_pool.total_staked >= staking_pool.grid_target {
            staking_pool.grid_boost_active = true;
        }

        emit!(StakeEvent {
            user: ctx.accounts.user.key(),
            amount,
            lock_period,
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }

    /// Verify NFT ownership and mark stake account
    /// Checks if user owns an NFT from the specified collection
    pub fn verify_nft_holder(ctx: Context<VerifyNftHolder>) -> Result<()> {
        let stake_account = &mut ctx.accounts.stake_account;
        let nft_token_account = &ctx.accounts.nft_token_account;
        let nft_mint = &ctx.accounts.nft_mint;
        
        // Verify the NFT mint address matches the required collection
        require!(
            nft_mint.key() == Pubkey::from_str("4Qy6grGLpMBk2q13tPt32UkCzahWCSLEBLbRvHoyBcTvHCZYket").unwrap(),
            StakingError::InvalidNftMint
        );
        
        // Verify user owns the NFT (token account has balance >= 1)
        require!(
            nft_token_account.amount >= 1,
            StakingError::NoNftOwnership
        );
        
        // Verify token account belongs to user
        require!(
            nft_token_account.owner == stake_account.owner,
            StakingError::InvalidNftOwner
        );
        
        stake_account.is_nft_holder = true;
        
        emit!(NftVerificationEvent {
            user: stake_account.owner,
            verified: true,
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        Ok(())
    }

    /// Calculate and return pending rewards
    pub fn calculate_rewards(ctx: Context<CalculateRewards>) -> Result<u64> {
        let stake_account = &ctx.accounts.stake_account;
        let staking_pool = &ctx.accounts.staking_pool;
        let clock = Clock::get()?;

        let time_staked = clock.unix_timestamp - stake_account.start_time;
        let mut apr = get_apr_for_period(stake_account.lock_period);

        // NFT holder bonus: 2x after halfway point
        if stake_account.is_nft_holder {
            let halfway = stake_account.lock_period as i64 / 2;
            if time_staked >= halfway {
                apr = apr * 2;
            }
        }

        // Grid boost: 2x when target reached
        if staking_pool.grid_boost_active {
            apr = apr * 2;
        }

        // Calculate rewards: (amount * APR * time) / (365 days * 100)
        let rewards = (stake_account.amount as u128)
            .checked_mul(apr as u128).unwrap()
            .checked_mul(time_staked as u128).unwrap()
            .checked_div(31_536_000 * 100).unwrap() as u64;

        let pending_rewards = rewards.checked_sub(stake_account.rewards_claimed).unwrap();

        Ok(pending_rewards)
    }

    /// Claim accumulated rewards
    pub fn claim_rewards(ctx: Context<ClaimRewards>) -> Result<()> {
        let stake_account = &mut ctx.accounts.stake_account;
        let staking_pool = &ctx.accounts.staking_pool;
        let clock = Clock::get()?;

        let time_staked = clock.unix_timestamp - stake_account.start_time;
        let mut apr = get_apr_for_period(stake_account.lock_period);

        // Apply bonuses
        if stake_account.is_nft_holder {
            let halfway = stake_account.lock_period as i64 / 2;
            if time_staked >= halfway {
                apr = apr * 2;
            }
        }

        if staking_pool.grid_boost_active {
            apr = apr * 2;
        }

        // Calculate total rewards
        let total_rewards = (stake_account.amount as u128)
            .checked_mul(apr as u128).unwrap()
            .checked_mul(time_staked as u128).unwrap()
            .checked_div(31_536_000 * 100).unwrap() as u64;

        let pending_rewards = total_rewards.checked_sub(stake_account.rewards_claimed).unwrap();
        
        require!(pending_rewards > 0, StakingError::NoRewards);

        // Transfer rewards from pool to user
        let seeds = &[
            b"staking_pool",
            &[staking_pool.bump],
        ];
        let signer = &[&seeds[..]];

        let cpi_accounts = Transfer {
            from: ctx.accounts.pool_token_account.to_account_info(),
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: ctx.accounts.staking_pool.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        token::transfer(cpi_ctx, pending_rewards)?;

        stake_account.rewards_claimed = total_rewards;

        emit!(ClaimEvent {
            user: ctx.accounts.user.key(),
            amount: pending_rewards,
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }

    /// Unstake tokens (must meet lock period unless NFT holder)
    pub fn unstake(ctx: Context<Unstake>) -> Result<()> {
        let stake_account = &ctx.accounts.stake_account;
        let staking_pool = &mut ctx.accounts.staking_pool;
        let clock = Clock::get()?;

        // Check if lock period has ended (unless NFT holder)
        if !stake_account.is_nft_holder {
            require!(
                clock.unix_timestamp >= stake_account.end_time,
                StakingError::StillLocked
            );
        }

        let amount = stake_account.amount;

        // Transfer staked tokens back to user
        let seeds = &[
            b"staking_pool",
            &[staking_pool.bump],
        ];
        let signer = &[&seeds[..]];

        let cpi_accounts = Transfer {
            from: ctx.accounts.pool_token_account.to_account_info(),
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: ctx.accounts.staking_pool.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        token::transfer(cpi_ctx, amount)?;

        // Update total staked
        staking_pool.total_staked = staking_pool.total_staked.checked_sub(amount).unwrap();
        
        // Check if grid boost should be deactivated
        if staking_pool.total_staked < staking_pool.grid_target {
            staking_pool.grid_boost_active = false;
        }

        emit!(UnstakeEvent {
            user: ctx.accounts.user.key(),
            amount,
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }
}

// Helper function to get APR based on lock period
fn get_apr_for_period(lock_period: u64) -> u64 {
    match lock_period {
        2_592_000 => 5,   // 30 days = 5% APR
        7_776_000 => 10,  // 90 days = 10% APR
        31_536_000 => 20, // 365 days = 20% APR
        _ => 5,
    }
}

// ==================== CONTEXTS ====================

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + StakingPool::LEN,
        seeds = [b"staking_pool"],
        bump
    )]
    pub staking_pool: Account<'info, StakingPool>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Stake<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + StakeAccount::LEN,
        seeds = [b"stake", user.key().as_ref(), &staking_pool.total_staked.to_le_bytes()],
        bump
    )]
    pub stake_account: Account<'info, StakeAccount>,
    
    #[account(
        mut,
        seeds = [b"staking_pool"],
        bump = staking_pool.bump
    )]
    pub staking_pool: Account<'info, StakingPool>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub pool_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct VerifyNftHolder<'info> {
    #[account(
        mut,
        constraint = stake_account.owner == user.key() @ StakingError::InvalidOwner
    )]
    pub stake_account: Account<'info, StakeAccount>,
    
    pub user: Signer<'info>,
    
    /// User's NFT token account
    #[account(
        constraint = nft_token_account.owner == user.key() @ StakingError::InvalidNftOwner,
        constraint = nft_token_account.mint == nft_mint.key() @ StakingError::InvalidNftMint
    )]
    pub nft_token_account: Account<'info, TokenAccount>,
    
    /// NFT mint account
    pub nft_mint: Account<'info, Mint>,
}

#[derive(Accounts)]
pub struct CalculateRewards<'info> {
    pub stake_account: Account<'info, StakeAccount>,
    
    #[account(
        seeds = [b"staking_pool"],
        bump = staking_pool.bump
    )]
    pub staking_pool: Account<'info, StakingPool>,
}

#[derive(Accounts)]
pub struct ClaimRewards<'info> {
    #[account(mut)]
    pub stake_account: Account<'info, StakeAccount>,
    
    #[account(
        mut,
        seeds = [b"staking_pool"],
        bump = staking_pool.bump
    )]
    pub staking_pool: Account<'info, StakingPool>,
    
    pub user: Signer<'info>,
    
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub pool_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct Unstake<'info> {
    #[account(
        mut,
        close = user,
        constraint = stake_account.owner == user.key()
    )]
    pub stake_account: Account<'info, StakeAccount>,
    
    #[account(
        mut,
        seeds = [b"staking_pool"],
        bump = staking_pool.bump
    )]
    pub staking_pool: Account<'info, StakingPool>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub pool_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

// ==================== ACCOUNTS ====================

#[account]
pub struct StakingPool {
    pub authority: Pubkey,
    pub reward_rate: u64,
    pub total_staked: u64,
    pub grid_target: u64,
    pub grid_boost_active: bool,
    pub bump: u8,
}

impl StakingPool {
    pub const LEN: usize = 32 + 8 + 8 + 8 + 1 + 1;
}

#[account]
pub struct StakeAccount {
    pub owner: Pubkey,
    pub amount: u64,
    pub lock_period: u64,
    pub start_time: i64,
    pub end_time: i64,
    pub rewards_claimed: u64,
    pub is_nft_holder: bool,
    pub bump: u8,
}

impl StakeAccount {
    pub const LEN: usize = 32 + 8 + 8 + 8 + 8 + 8 + 1 + 1;
}

// ==================== EVENTS ====================

#[event]
pub struct StakeEvent {
    pub user: Pubkey,
    pub amount: u64,
    pub lock_period: u64,
    pub timestamp: i64,
}

#[event]
pub struct ClaimEvent {
    pub user: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct UnstakeEvent {
    pub user: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct NftVerificationEvent {
    pub user: Pubkey,
    pub verified: bool,
    pub timestamp: i64,
}

// ==================== ERRORS ====================

#[error_code]
pub enum StakingError {
    #[msg("Invalid stake amount")]
    InvalidAmount,
    #[msg("Invalid lock period. Must be 30, 90, or 365 days")]
    InvalidLockPeriod,
    #[msg("Tokens are still locked")]
    StillLocked,
    #[msg("No rewards to claim")]
    NoRewards,
}
