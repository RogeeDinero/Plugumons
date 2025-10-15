const express = require("express");
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Initialize services
const stakingService = require('./staking-service');
const solanaService = require('./solana-service');

const app = express();

// Enable CORS
app.use(cors());

// Parse JSON requests
app.use(express.json());

// Serve static files from root directory
app.use(express.static(__dirname));

// Page routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/mystery-box", (req, res) => {
  res.sendFile(path.join(__dirname, "mystery-box.html"));
});

app.get("/energy-grid", (req, res) => {
  res.sendFile(path.join(__dirname, "energy-grid.html"));
});

// ============ STAKING API ENDPOINTS ============

// Get grid statistics
app.get("/api/grid/stats", (req, res) => {
  try {
    const stats = stakingService.getGridStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get leaderboard
app.get("/api/leaderboard", (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const leaderboard = stakingService.getLeaderboard(limit);
    res.json({ success: true, data: leaderboard });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user stakes
app.get("/api/stakes/:walletAddress", (req, res) => {
  try {
    const { walletAddress } = req.params;
    const stakes = stakingService.getUserStakes(walletAddress);
    res.json({ success: true, data: stakes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user statistics
app.get("/api/user/stats/:walletAddress", (req, res) => {
  try {
    const { walletAddress } = req.params;
    const stats = stakingService.getUserStats(walletAddress);
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Check NFT ownership
app.get("/api/nft/check/:walletAddress", async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const result = await solanaService.checkNFTOwnership(walletAddress);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get token balance
app.get("/api/balance/:walletAddress", async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const balance = await solanaService.getTokenBalance(walletAddress);
    res.json({ success: true, balance });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create stake transaction (returns unsigned transaction)
app.post("/api/create-stake-transaction", async (req, res) => {
  try {
    const { walletAddress, amount, lockPeriod } = req.body;
    
    // Validate inputs
    if (!walletAddress || !amount || !lockPeriod) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: walletAddress, amount, lockPeriod' 
      });
    }

    // Import Solana libraries
    const { Connection, PublicKey, Transaction, TransactionInstruction } = require('@solana/web3.js');
    
    const STAKING_WALLET = 'HaLue8w9EcBS4j3vTzHoyBcTvZCV6dWPd9YQce7S2QZZ';
    const PLUGU_TOKEN_MINT = '12EU3xpACKJEZoSZgQUGnv1NgFucRNDdJaPgwuicpump';
    const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
    
    const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
    
    const fromPubkey = new PublicKey(walletAddress);
    const toPubkey = new PublicKey(STAKING_WALLET);
    const mintPubkey = new PublicKey(PLUGU_TOKEN_MINT);
    
    // Get token accounts
    const fromTokenAccounts = await connection.getParsedTokenAccountsByOwner(fromPubkey, { mint: mintPubkey });
    const toTokenAccounts = await connection.getParsedTokenAccountsByOwner(toPubkey, { mint: mintPubkey });
    
    if (fromTokenAccounts.value.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'No PLUGU tokens found in your wallet' 
      });
    }
    
    if (toTokenAccounts.value.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Staking wallet not configured properly' 
      });
    }
    
    const userTokenAccount = fromTokenAccounts.value[0].pubkey;
    const stakingTokenAccount = toTokenAccounts.value[0].pubkey;
    
    // Create transfer instruction
    const tokenAmount = BigInt(Math.floor(amount * 1_000_000_000));
    const data = new Uint8Array(9);
    data[0] = 3; // Transfer instruction
    new DataView(data.buffer, 1).setBigUint64(0, tokenAmount, true);
    
    const transferInstruction = new TransactionInstruction({
      keys: [
        { pubkey: userTokenAccount, isSigner: false, isWritable: true },
        { pubkey: stakingTokenAccount, isSigner: false, isWritable: true },
        { pubkey: fromPubkey, isSigner: true, isWritable: false }
      ],
      programId: TOKEN_PROGRAM_ID,
      data
    });
    
    // Create transaction
    const transaction = new Transaction().add(transferInstruction);
    transaction.feePayer = fromPubkey;
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    
    // Serialize and send to frontend
    const serializedTransaction = transaction.serialize({ requireAllSignatures: false }).toString('base64');
    
    res.json({ 
      success: true, 
      transaction: serializedTransaction 
    });
    
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Confirm stake after transaction
app.post("/api/confirm-stake", async (req, res) => {
  try {
    const { walletAddress, amount, lockPeriod, signature } = req.body;
    
    // Validate inputs
    if (!walletAddress || !amount || !lockPeriod || !signature) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }

    // Verify transaction
    try {
      const verification = await solanaService.verifyStakeTransaction(signature);
      if (!verification.valid) {
        return res.status(400).json({ 
          success: false, 
          error: 'Transaction verification failed' 
        });
      }
    } catch (verifyError) {
      console.error('Verification error:', verifyError);
      // Continue anyway - can verify manually
    }

    // Create stake in database
    const result = await stakingService.createStake(walletAddress, amount, lockPeriod);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error confirming stake:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Unstake tokens
app.post("/api/unstake", async (req, res) => {
  try {
    const { stakeId, walletAddress } = req.body;
    
    if (!stakeId || !walletAddress) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: stakeId, walletAddress' 
      });
    }

    const result = await stakingService.unstake(stakeId, walletAddress);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Claim rewards
app.post("/api/claim", async (req, res) => {
  try {
    const { stakeId, walletAddress } = req.body;
    
    if (!stakeId || !walletAddress) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: stakeId, walletAddress' 
      });
    }

    const result = await stakingService.claimRewards(stakeId, walletAddress);
    
    if (result.success) {
      // Send actual tokens (PRODUCTION MODE)
      // Comment out the line below to return to demo mode
      try {
        const transferResult = await solanaService.sendRewards(walletAddress, result.amount);
        if (transferResult.success) {
          result.transactionSignature = transferResult.signature;
          result.message += `\n\nTokens sent! Signature: ${transferResult.signature}`;
        } else {
          // Token transfer failed, but rewards were tracked
          result.warning = `Rewards claimed in database but token transfer failed: ${transferResult.error}`;
        }
      } catch (transferError) {
        console.error('Token transfer error:', transferError);
        result.warning = 'Rewards claimed but token transfer encountered an error. Contact support.';
      }
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Plugumons Staking Server running on port ${PORT}`);
  console.log(`📊 Energy Grid: http://localhost:${PORT}/energy-grid`);
});
