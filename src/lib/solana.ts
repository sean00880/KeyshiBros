import { PublicKey, Transaction, SystemProgram, Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';

// Presale collection wallet — not displayed to user, only used in transaction signing
const PRESALE_WALLET = new PublicKey(
  process.env.NEXT_PUBLIC_PRESALE_SOL_WALLET || '11111111111111111111111111111111'
);

const SOLANA_RPC = process.env.NEXT_PUBLIC_SOLANA_RPC || 'https://api.mainnet-beta.solana.com';

// $9,000 USD equivalent in SOL — updated periodically
// For MVP, we use a fixed SOL amount. Production should use an oracle.
const PRESALE_SOL_AMOUNT = parseFloat(process.env.NEXT_PUBLIC_PRESALE_SOL_AMOUNT || '60');

export function getConnection() {
  return new Connection(SOLANA_RPC, 'confirmed');
}

export function getPresaleAmountSOL() {
  return PRESALE_SOL_AMOUNT;
}

export async function buildPresaleTransaction(
  senderPubkey: PublicKey
): Promise<Transaction> {
  const connection = getConnection();
  const lamports = Math.floor(PRESALE_SOL_AMOUNT * LAMPORTS_PER_SOL);

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: senderPubkey,
      toPubkey: PRESALE_WALLET,
      lamports,
    })
  );

  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = senderPubkey;

  return transaction;
}
