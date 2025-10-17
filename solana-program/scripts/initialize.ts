import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, createAccount, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import { PlugumonsStaking } from "../target/types/plugumons_staking";

// CONFIGURATION
const PLUGU_TOKEN_MINT = new PublicKey("12EU3xpACKJEZoSZgQUGnv1NgFucRNDdJaPgwuicpump");
const REWARD_WALLET = new PublicKey("HaLue8w9EcBS4j3vTzHoyBcTvZCV6dWPd9YQce7S2QZZ");

async function initialize() {
  // Configure the client
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.PlugumonsStaking as Program<PlugumonsStaking>;
  const authority = provider.wallet;

  console.log("🚀 Initializing Plugumons Staking Program...");
  console.log("📍 Program ID:", program.programId.toBase58());
  console.log("👤 Authority:", authority.publicKey.toBase58());

  // Derive PDAs
  const [stakingPoolPda, stakingPoolBump] = PublicKey.findProgramAddressSync(
    [Buffer.from("staking_pool")],
    program.programId
  );

  console.log("🏊 Staking Pool PDA:", stakingPoolPda.toBase58());

  // Create or get pool token account (to hold staked tokens)
  console.log("\n📦 Creating pool token account...");
  const poolTokenAccount = await getOrCreateAssociatedTokenAccount(
    provider.connection,
    authority.payer,
    PLUGU_TOKEN_MINT,
    stakingPoolPda,
    true // allowOwnerOffCurve - PDA can own token accounts
  );

  console.log("✅ Pool Token Account:", poolTokenAccount.address.toBase58());

  // Initialize the staking pool
  console.log("\n🎯 Initializing staking pool...");
  
  try {
    const tx = await program.methods
      .initialize(
        new anchor.BN(0) // reward_rate parameter (not used in current implementation)
      )
      .accounts({
        stakingPool: stakingPoolPda,
        authority: authority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("✅ Initialize transaction signature:", tx);
    
    // Fetch and display pool info
    const poolAccount = await program.account.stakingPool.fetch(stakingPoolPda);
    console.log("\n📊 Staking Pool Info:");
    console.log("   Authority:", poolAccount.authority.toBase58());
    console.log("   Total Staked:", poolAccount.totalStaked.toString());
    console.log("   Grid Target:", poolAccount.gridTarget.toString());
    console.log("   Grid Boost Active:", poolAccount.gridBoostActive);
    
    console.log("\n🎉 Initialization Complete!");
    console.log("\n📝 Next Steps:");
    console.log("1. Fund the pool token account with PLUGU for rewards:");
    console.log(`   Pool Token Account: ${poolTokenAccount.address.toBase58()}`);
    console.log("2. Update frontend with Program ID:", program.programId.toBase58());
    console.log("3. Test staking on devnet before mainnet deployment");

  } catch (error) {
    console.error("❌ Initialization failed:", error);
    throw error;
  }
}

// Run initialization
initialize()
  .then(() => {
    console.log("\n✅ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Script failed:", error);
    process.exit(1);
  });
