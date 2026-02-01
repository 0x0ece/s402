import {
  Connection,
  PublicKey,
  ParsedTransactionWithMeta,
  ConfirmedSignatureInfo
} from '@solana/web3.js';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { ClientCredits } from '../types';

// USDC Devnet mint
export const USDC_DEVNET_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
export const USDC_DECIMALS = 6;

/**
 * USDC transaction info
 */
export interface USDCTransaction {
  signature: string;
  amount: number; // in USDC (not lamports)
  timestamp: Date;
  from: string;
  to: string;
}

/**
 * Get USDC token transactions between client and server
 */
export async function getUSDCTransactions(
  connection: Connection,
  clientPublicKey: string,
  serverPublicKey: string,
  usdcMint: string,
  limit: number = 10
): Promise<USDCTransaction[]> {
  try {
    const clientPubkey = new PublicKey(clientPublicKey);
    const serverPubkey = new PublicKey(serverPublicKey);
    const mintPubkey = new PublicKey(usdcMint);

    // Get associated token accounts
    const clientTokenAccount = await getAssociatedTokenAddress(
      mintPubkey,
      clientPubkey
    );

    const serverTokenAccount = await getAssociatedTokenAddress(
      mintPubkey,
      serverPubkey
    );

    // Get signatures for the client's token account
    const signatures = await connection.getSignaturesForAddress(
      clientTokenAccount,
      { limit }
    );

    const transactions: USDCTransaction[] = [];

    for (const sig of signatures) {
      const tx = await connection.getParsedTransaction(sig.signature, {
        maxSupportedTransactionVersion: 0
      });

      if (!tx || !tx.meta || tx.meta.err) continue;

      // Parse token transfer amount
      const amount = extractUSDCTransferAmount(
        tx,
        clientTokenAccount,
        serverTokenAccount
      );

      if (amount > 0) {
        transactions.push({
          signature: sig.signature,
          amount: amount / Math.pow(10, USDC_DECIMALS), // Convert to USDC
          timestamp: new Date((sig.blockTime || 0) * 1000),
          from: clientPublicKey,
          to: serverPublicKey
        });
      }
    }

    return transactions;
  } catch (error) {
    console.error('[USDC Verifier] Error fetching transactions:', error);
    return [];
  }
}

/**
 * Extract USDC transfer amount from parsed transaction
 */
function extractUSDCTransferAmount(
  tx: ParsedTransactionWithMeta,
  fromTokenAccount: PublicKey,
  toTokenAccount: PublicKey
): number {
  if (!tx.meta || !tx.meta.postTokenBalances || !tx.meta.preTokenBalances) {
    return 0;
  }

  // Find token balance changes
  const fromAccountIndex = tx.transaction.message.accountKeys.findIndex(
    key => key.pubkey.equals(fromTokenAccount)
  );

  const toAccountIndex = tx.transaction.message.accountKeys.findIndex(
    key => key.pubkey.equals(toTokenAccount)
  );

  if (fromAccountIndex === -1 || toAccountIndex === -1) {
    return 0;
  }

  // Get pre and post balances
  const fromPreBalance = tx.meta.preTokenBalances.find(
    b => b.accountIndex === fromAccountIndex
  );
  const fromPostBalance = tx.meta.postTokenBalances.find(
    b => b.accountIndex === fromAccountIndex
  );

  const toPreBalance = tx.meta.preTokenBalances.find(
    b => b.accountIndex === toAccountIndex
  );
  const toPostBalance = tx.meta.postTokenBalances.find(
    b => b.accountIndex === toAccountIndex
  );

  if (!fromPreBalance || !fromPostBalance || !toPreBalance || !toPostBalance) {
    return 0;
  }

  // Calculate amount transferred
  const fromDecrease = 
    Number(fromPreBalance.uiTokenAmount.amount) - 
    Number(fromPostBalance.uiTokenAmount.amount);

  const toIncrease = 
    Number(toPostBalance.uiTokenAmount.amount) - 
    Number(toPreBalance.uiTokenAmount.amount);

  // Return the positive transfer amount
  return Math.max(0, Math.min(fromDecrease, toIncrease));
}

/**
 * Calculate credits based on USDC transactions
 */
export function calculateUSDCCredits(
  transactions: USDCTransaction[],
  subscriptionPrice: number,
  subscriptionTime: number
): ClientCredits | null {
  if (transactions.length === 0) {
    return null;
  }

  // Sum all transaction amounts
  const totalPaid = transactions.reduce((sum, tx) => sum + tx.amount, 0);

  // Calculate time credits: (totalPaid / subscriptionPrice) * subscriptionTime
  const totalTimeSeconds = (totalPaid / subscriptionPrice) * subscriptionTime;

  // Find the most recent transaction
  const sortedTxs = [...transactions].sort((a, b) =>
    b.timestamp.getTime() - a.timestamp.getTime()
  );
  const latestTx = sortedTxs[0];

  // Calculate when credits expire
  const expiresAt = new Date(latestTx.timestamp.getTime() + totalTimeSeconds * 1000);

  // Calculate remaining time
  const now = new Date();
  const timeRemaining = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));

  return {
    timeRemaining,
    expiresAt,
    lastTransaction: {
      signature: latestTx.signature,
      amount: latestTx.amount,
      timestamp: latestTx.timestamp
    }
  };
}
