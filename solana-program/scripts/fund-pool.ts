import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress, transfer, getAccount } from "@solana/spl-token";

// CONFIGURATION
const PLUGU_TOKEN_MINT = new PublicKey("12EU3xpACKJEZoSZgQUGnv1NgFucRNDdJaPgwuicpump");
const REWARD_WALLET = new PublicKey("HaLue8w9EcBS4j3vTzHoyBcTvZCV6dWPd9YQce7S2QZZ");

// How many PLUGU tokens to fund the pool with (in smallest units)
// Example: 10,000,000 PLUGU = 10_000_000 * 10^9 = 10_000_000_000_000_000
const AMOUNT_TO_FUND = new anchor.BN("10000000000000000"); // 10M PLUGU tokens

async function fundPool() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.PlugumonsStaking as Program;
  const authority = provider.wallet;

  console.log("💰 Funding Staking Pool with Rewards...");
  console.log("👤 Authority:", authority.publicKey.toBase58());

  // Derive staking pool PDA
  const [stakingPoolPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("staking_pool")],
    program.programId
  );

  // Get token accounts
  const authorityTokenAccount = await getAssociatedTokenAddress(
    PLUGU_TOKEN_MINT,
    authority.publicKey
  );

  const poolTokenAccount = await getAssociatedTokenAddress(
    PLUGU_TOKEN_MINT,
    stakingPoolPda,
    true // allowOwnerOffCurve
  );

  console.log("\n📦 Token Accounts:");
  console.log("   Authority Token Account:", authorityTokenAccount.toBase58());
  console.log("   Pool Token Account:", poolTokenAccount.toBase58());

  // Check authority balance
  try {
    const authorityBalance = await getAccount(provider.connection, authorityTokenAccount);
    console.log("\n💵 Authority Balance:", (Number(authorityBalance.amount) / 1e9).toLocaleString(), "PLUGU");
    console.log("💸 Amount to Transfer:", (Number(AMOUNT_TO_FUND.toString()) / 1e9).toLocaleString(), "PLUGU");

    if (authorityBalance.amount < BigInt(AMOUNT_TO_FUND.toString())) {
      console.error("❌ Insufficient balance!");
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Failed to fetch authority token account:", error);
    process.exit(1);
  }

  // Transfer tokens to pool
  console.log("\n🚀 Transferring tokens to pool...");
  
  try {
    const signature = await transfer(
      provider.connection,
      authority.payer,
      authorityTokenAccount,
      poolTokenAccount,
      authority.publicKey,
      BigInt(AMOUNT_TO_FUND.toString())
    );

    console.log("✅ Transfer signature:", signature);

    // Check pool balance
    const poolBalance = await getAccount(provider.connection, poolTokenAccount);
    console.log("\n🏊 Pool Balance:", (Number(poolBalance.amount) / 1e9).toLocaleString(), "PLUGU");

    console.log("\n🎉 Pool Funded Successfully!");
    console.log("\n📝 The staking pool now has rewards to distribute to stakers.");

  } catch (error) {
    console.error("❌ Transfer failed:", error);
    throw error;
  }
}

// Run
fundPool()
  .then(() => {
    console.log("\n✅ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Script failed:", error);
    process.exit(1);
  });
