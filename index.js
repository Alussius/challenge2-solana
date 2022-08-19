// Created by: Alussius Aloy
// Created: Aug 18 2022
// Module 2 - Challenge 2

import { clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, sendAndConfirmRawTransaction, sendAndConfirmTransaction, SystemProgram, Transaction } from '@solana/web3.js';

// Please Enter your Secret Key here to test this script
const SECRET_KEY = new Uint8Array(
    // Place Secret Key Here 
);

// Initialize Key Pairs
const senderKeyPair = Keypair.fromSecretKey(SECRET_KEY);
const receiverKeyPair = Keypair.generate();

// Initializing Connection
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// Funtion: logWalletBalance
// desc: log balance of wallet associated with public key
// parameters:
//   pk -> publicKey: PublicKey
//   msg -> message: string
const logWalletBalance = async (pk, msg) => {
    try {
        // get balance using public key
        const balance = await connection.getBalance(new PublicKey(pk));
        // log balance
        console.log(msg ? (msg, balance / LAMPORTS_PER_SOL) : balance / LAMPORTS_PER_SOL);
    } catch (err) {
        console.log(err.message)
    }
}

// Function: getHalfBalance
// desc: calculate and return half of wallet balance associated with the public key
// parameters:
//   pk -> publicKey: PublicKey
const getHalfBalance = async (pk) => {
    try {
        const balanceInLamports = await connection.getBalance(new PublicKey(pk));
        const balanceInSol = balanceInLamports / LAMPORTS_PER_SOL;
        return balanceInSol / 2;
    } catch (err) {
        throw new Error(err);
    }
}

// FOR DEBUGING PURPOSES
// Function: airDrop
// desc: drops specified amount to the wallet associated with public key
// parameters:
//   pk -> publicKey: PublicKey
//   amt -> amount: number
const airDrop = async (pk, amt) => {
    const airDropRequestSignature = await connection.requestAirdrop( new PublicKey(pk), amt * LAMPORTS_PER_SOL );
    let latestBlockHash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
        blackhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: airDropRequestSignature
    });
}

// Function: getTransaction
// desc: get transfer transaction associated with sender and receiver Public Key
// parameters:
//   senderPK -> senderPublicKey: PublicKey
//   receiverPK -> receiverPublicKey: PublicKey
//   amt -> amount: number
const getTransaction = (senderPK, receiverPK, amt) => {
    return new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: senderPK,
            toPubkey: receiverPK,
            lamports: LAMPORTS_PER_SOL * amt
        })
    )
}

const transferHalfWalletBalance = async () => {

    // Log Wallet Balances Pre Transaction
    await logWalletBalance(senderKeyPair.publicKey);
    await logWalletBalance(receiverKeyPair.publicKey);

    // Get Half of Senders Balance
    const senderHalfBalance = await getHalfBalance(senderKeyPair.publicKey);

    // Get Transaction
    const transaction = await getTransaction(senderKeyPair.publicKey, receiverKeyPair.publicKey, senderHalfBalance);

    // Initialize Signature - Process Transaction
    const signature = await sendAndConfirmTransaction(connection, transaction, [senderKeyPair]);

    // For Confirmation Purposes
    console.log("---AFTER TRANSACTION---");
    await logWalletBalance(senderKeyPair.publicKey);
    await logWalletBalance(receiverKeyPair.publicKey);
    console.log(signature);
}

transferHalfWalletBalance();