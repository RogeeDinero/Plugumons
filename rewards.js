const { PublicKey, Transaction, SystemProgram, sendAndConfirmTransaction } = require('@solana/web3.js');
const { Token, TOKEN_PROGRAM_ID } = require('@solana/spl-token');

// Send SOL
async function sendSol(connection, fromWallet, toAddress, amount) {
    const transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: fromWallet.publicKey,
            toPubkey: new PublicKey(toAddress),
            lamports: amount * 1e9, // convert SOL to lamports
        })
    );

    await sendAndConfirmTransaction(connection, transaction, [fromWallet]);
}

// Send SPL token
async function sendSplToken(connection, fromWallet, toAddress, tokenMintAddress, amount) {
    const token = new Token(connection, new PublicKey(tokenMintAddress), TOKEN_PROGRAM_ID, fromWallet);

    const toTokenAccount = await token.getOrCreateAssociatedAccountInfo(new PublicKey(toAddress));
    const fromTokenAccount = await token.getOrCreateAssociatedAccountInfo(fromWallet.publicKey);

    const transaction = new Transaction().add(
        Token.createTransferInstruction(
            TOKEN_PROGRAM_ID,
            fromTokenAccount.address,
            toTokenAccount.address,
            fromWallet.publicKey,
            [],
            amount
        )
    );

    await sendAndConfirmTransaction(connection, transaction, [fromWallet]);
}

module.exports = { sendSol, sendSplToken };
