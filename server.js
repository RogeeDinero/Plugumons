import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bs58 from "bs58";
import { Connection, Keypair, PublicKey, Transaction, SystemProgram } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, transfer as splTransfer } from "@solana/spl-token";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Connect to Solana
const connection = new Connection(process.env.SOLANA_RPC);

// Decode rewards wallet from Base58
const rewardsWallet = Keypair.fromSecretKey(bs58.decode(process.env.REWARDS_WALLET_SECRET));

// Public keys for NFT and PLUGU
const nftMint = new PublicKey(process.env.NFT_MINT_ADDRESS);
const pluguMint = new PublicKey(process.env.PLUGU_MINT_ADDRESS);

// Reward types
const rewards = ["NFT", "SOL", "PLUGU", "EMPTY"];

// Simulate a mystery box play
app.post("/api/open-box", async (req, res) => {
  try {
    const { userPublicKey } = req.body;

    if (!userPublicKey) return res.status(400).json({ error: "User wallet address required." });

    const userKey = new PublicKey(userPublicKey);

    // Pick a reward randomly
    const reward = rewards[Math.floor(Math.random() * rewards.length)];

    let message = "";

    if (reward === "NFT") {
      // Transfer 1 NFT
      const userNftAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        rewardsWallet,
        nftMint,
        userKey
      );

      const rewardsNftAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        rewardsWallet,
        nftMint,
        rewardsWallet.publicKey
      );

      await splTransfer(
        connection,
        rewardsWallet,
        rewardsNftAccount.address,
        userNftAccount.address,
        rewardsWallet.publicKey,
        1
      );

      message = "You won a Plugumon NFT!";
    } else if (reward === "SOL") {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: rewardsWallet.publicKey,
          toPubkey: userKey,
          lamports: 0.03 * 1e9, // 0.03 SOL
        })
      );
      await connection.sendTransaction(transaction, [rewardsWallet]);
      message = "You won 0.03 SOL!";
    } else if (reward === "PLUGU") {
      // Transfer PLUGU tokens
      const userPluguAccount = await getOrCreateAssociatedTokenAccount(connection, rewardsWallet, pluguMint, userKey);
      const rewardsPluguAccount = await getOrCreateAssociatedTokenAccount(connection, rewardsWallet, pluguMint, rewardsWallet.publicKey);

      await splTransfer(connection, rewardsWallet, rewardsPluguAccount.address, userPluguAccount.address, rewardsWallet.publicKey, 100_000); // 100,000 PLUGU

      mes
