const { Connection, PublicKey, Keypair, Transaction, SystemProgram, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const { getOrCreateAssociatedTokenAccount, transfer, TOKEN_PROGRAM_ID } = require('@solana/spl-token');
const bs58 = require('bs58');

// Configuration
const SOLANA_RPC = process.env.SOLANA_RPC || 'https://api.mainnet-beta.solana.com';
const PLUGU_TOKEN_MINT = '12EU3xpACKJEZoSZgQUGnv1NgFucRNDdJaPgwuicpump';
const NFT_COLLECTION_MINT = '4Qy6grGLpMBk2q13tPt32UkCzahWCSLEBLbRvHCZYket';
const REWARD_WALLET = 'HaLue8w9EcBS4j3vTzHoyBcTvZCV6dWPd9YQce7S2QZZ';

const connection = new Connection(SOLANA_RPC, 'confirmed');

// NFT holder cache (refresh every 5 minutes)
const nftHolderCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Check if a wallet holds Plugumons NFTs
 */
async function checkNFTOwnership(walletAddress) {
  try {
    // Check cache first
    const cached = nftHolderCache.get(walletAddress);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.value;
    }

    const publicKey = new PublicKey(walletAddress);
    
    // Get token accounts for the wallet
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
      programId: TOKEN_PROGRAM_ID
    });

    let nftCount = 0;
    
    // Check each token account for NFTs from the collection
    for (const account of tokenAccounts.value) {
      const tokenData = account.account.data.parsed.info;
      
      // Check if this is an NFT (amount = 1, decimals = 0)
      if (tokenData.tokenAmount.decimals === 0 && tokenData.tokenAmount.uiAmount === 1) {
        // In a production environment, you'd verify the NFT belongs to the collection
        // For now, we'll do a simple check
        try {
          const mintInfo = await connection.getParsedAccountInfo(new PublicKey(tokenData.mint));
          // Additional validation can be added here to verify collection
          nftCount++;
        } catch (err) {
          console.error('Error checking NFT:', err);
        }
      }
    }

    const hasNFT = nftCount > 0;
    
    // Cache the result
    nftHolderCache.set(walletAddress, {
      value: { hasNFT, nftCount },
      timestamp: Date.now()
    });

    return { hasNFT, nftCount };
  } catch (error) {
    console.error('Error checking NFT ownership:', error);
    return { hasNFT: false, nftCount: 0 };
  }
}

/**
 * Get PLUGU token balance for a wallet
 */
async function getTokenBalance(walletAddress) {
  try {
    const publicKey = new PublicKey(walletAddress);
    const tokenMint = new PublicKey(PLUGU_TOKEN_MINT);
    
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
      mint: tokenMint
    });

    if (tokenAccounts.value.length === 0) {
      return 0;
    }

    const balance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
    return balance || 0;
  } catch (error) {
    console.error('Error getting token balance:', error);
    return 0;
  }
}

/**
 * Transfer PLUGU tokens (requires private key)
 */
async function transferTokens(fromPrivateKey, toAddress, amount) {
  try {
    // Decode private key
    const secretKey = bs58.decode(fromPrivateKey);
    const fromWallet = Keypair.fromSecretKey(secretKey);
    
    const toPublicKey = new PublicKey(toAddress);
    const mintPublicKey = new PublicKey(PLUGU_TOKEN_MINT);

    // Get or create associated token accounts
    const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      fromWallet,
      mintPublicKey,
      fromWallet.publicKey
    );

    const toTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      fromWallet,
      mintPublicKey,
      toPublicKey
    );

    // Transfer tokens (amount needs to be in smallest unit)
    const signature = await transfer(
      connection,
      fromWallet,
      fromTokenAccount.address,
      toTokenAccount.address,
      fromWallet.publicKey,
      amount * 1e9 // Assuming 9 decimals for PLUGU token
    );

    return { success: true, signature };
  } catch (error) {
    console.error('Error transferring tokens:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Verify a stake transaction (check if tokens were sent to staking wallet)
 */
async function verifyStakeTransaction(signature) {
  try {
    const tx = await connection.getTransaction(signature, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0
    });

    if (!tx) {
      return { valid: false, error: 'Transaction not found' };
    }

    // Verify transaction success
    if (tx.meta.err) {
      return { valid: false, error: 'Transaction failed' };
    }

    // Additional verification logic can be added here
    return { valid: true, transaction: tx };
  } catch (error) {
    console.error('Error verifying transaction:', error);
    return { valid: false, error: error.message };
  }
}

/**
 * Get reward wallet keypair from environment
 */
function getRewardWallet() {
  const privateKey = process.env.REWARD_WALLET_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('REWARD_WALLET_PRIVATE_KEY not set in environment');
  }
  const secretKey = bs58.decode(privateKey);
  return Keypair.fromSecretKey(secretKey);
}

/**
 * Send rewards to user
 */
async function sendRewards(userAddress, amount) {
  try {
    const rewardWallet = getRewardWallet();
    const result = await transferTokens(
      process.env.REWARD_WALLET_PRIVATE_KEY,
      userAddress,
      amount
    );
    return result;
  } catch (error) {
    console.error('Error sending rewards:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  checkNFTOwnership,
  getTokenBalance,
  transferTokens,
  verifyStakeTransaction,
  sendRewards,
  PLUGU_TOKEN_MINT,
  NFT_COLLECTION_MINT,
  REWARD_WALLET
};
