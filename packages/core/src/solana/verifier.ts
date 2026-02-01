import { SolanaTransaction } from './client';
import { ClientCredits } from '../types';

/**
 * Calculate credits based on transactions and subscription config
 */
export function calculateCredits(
  transactions: SolanaTransaction[],
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

/**
 * Check if credits are valid for current request
 */
export function hasValidCredits(credits: ClientCredits | null, requestTime: Date = new Date()): boolean {
  if (!credits) {
    return false;
  }

  // Check if credits have expired
  if (requestTime >= credits.expiresAt) {
    return false;
  }

  // Check if there's time remaining
  if (credits.timeRemaining <= 0) {
    return false;
  }

  return true;
}

/**
 * Calculate how much time a payment would provide
 */
export function calculateTimeForPayment(
  amount: number,
  subscriptionPrice: number,
  subscriptionTime: number
): number {
  return (amount / subscriptionPrice) * subscriptionTime;
}

/**
 * Calculate minimum payment needed for a subscription period
 */
export function calculateMinimumPayment(
  subscriptionPrice: number,
  subscriptionTime: number
): number {
  return subscriptionPrice;
}
