import { PaymentConfig, ClientCredits, PaymentType, PaymentOption, X402AcceptEntry } from './types';
import { SolanaClient } from './solana/client';
import { calculateCredits, hasValidCredits } from './solana/verifier';
import { getCreditCache } from './solana/cache';
import { getUSDCTransactions, calculateUSDCCredits, USDC_DEVNET_MINT } from './solana/usdc-verifier';
import { verifyStake } from './solana/stake-verifier';

/**
 * Payment verification result
 */
export interface PaymentVerificationResult {
  valid: boolean;
  credits?: ClientCredits;
  error?: string;
  requiresPayment?: boolean;
}

/**
 * Verify payment and credits for a client
 */
export async function verifyPayment(
  config: PaymentConfig,
  clientPublicKey: string,
  options: { forceRefresh?: boolean } = {}
): Promise<PaymentVerificationResult> {
  try {
    const cache = getCreditCache();
    const cacheKey = `${config.paymentType}:${clientPublicKey}`;

    // Check cache first unless force refresh
    if (!options.forceRefresh) {
      const cachedCredits = cache.getCredits(cacheKey);
      
      if (cachedCredits && hasValidCredits(cachedCredits)) {
        console.log(`[Payment] Using cached credits for ${clientPublicKey} (${config.paymentType})`);
        return {
          valid: true,
          credits: cachedCredits
        };
      }
    }

    // Route to appropriate verifier based on payment type
    let credits: ClientCredits | null = null;

    switch (config.paymentType) {
      case PaymentType.SOL:
        credits = await verifySolPayment(config, clientPublicKey);
        break;
      case PaymentType.USDC:
        credits = await verifyUsdcPayment(config, clientPublicKey);
        break;
      case PaymentType.STAKE:
        credits = await verifyStakePayment(config, clientPublicKey);
        break;
      default:
        return {
          valid: false,
          error: `Unsupported payment type: ${config.paymentType}`
        };
    }

    // Check if valid
    if (!credits || !hasValidCredits(credits)) {
      return {
        valid: false,
        requiresPayment: true,
        error: 'No valid payment found or credits expired'
      };
    }

    // Cache the credits
    cache.setCredits(cacheKey, credits);

    return {
      valid: true,
      credits
    };
  } catch (error) {
    console.error('[Payment] Error verifying payment:', error);
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Payment verification failed'
    };
  }
}

/**
 * Verify SOL payment
 */
async function verifySolPayment(
  config: PaymentConfig,
  clientPublicKey: string
): Promise<ClientCredits | null> {
  console.log('[Payment] Checking SOL transactions for', clientPublicKey);
  const solanaClient = new SolanaClient(config.network);
  
  const transactions = await solanaClient.getRecentTransactions(
    clientPublicKey,
    config.payTo,
    20
  );

  return calculateCredits(
    transactions,
    config.subscriptionPrice,
    config.subscriptionTime
  );
}

/**
 * Verify USDC payment
 */
async function verifyUsdcPayment(
  config: PaymentConfig,
  clientPublicKey: string
): Promise<ClientCredits | null> {
  console.log('[Payment] Checking USDC transactions for', clientPublicKey);
  const solanaClient = new SolanaClient(config.network);
  const connection = solanaClient.getConnection();
  
  const usdcMint = config.tokenMint || USDC_DEVNET_MINT;
  
  const transactions = await getUSDCTransactions(
    connection,
    clientPublicKey,
    config.payTo,
    usdcMint,
    20
  );

  return calculateUSDCCredits(
    transactions,
    config.subscriptionPrice,
    config.subscriptionTime
  );
}

/**
 * Verify staking payment
 */
async function verifyStakePayment(
  config: PaymentConfig,
  clientPublicKey: string
): Promise<ClientCredits | null> {
  console.log('[Payment] Checking stake accounts for', clientPublicKey);
  
  if (!config.validatorVoteAccount) {
    console.error('[Payment] No validator vote account configured for stake verification');
    return null;
  }

  if (!config.minimumStakeAmount) {
    console.error('[Payment] No minimum stake amount configured');
    return null;
  }

  const solanaClient = new SolanaClient(config.network);
  const connection = solanaClient.getConnection();
  
  const result = await verifyStake(
    connection,
    clientPublicKey,
    config.validatorVoteAccount,
    config.minimumStakeAmount
  );

  return result.credits || null;
}

/**
 * Format amount as decimal string for x402 (no scientific notation)
 */
function amountToDecimalString(n: number): string {
  const s = n.toFixed(12);
  return s.replace(/\.?0+$/, '') || '0';
}

/**
 * Convert a payment option to x402-compatible accept entry.
 * SOL and USDC are mapped; STAKE is included with same destination/amount.
 */
export function paymentOptionToX402Accept(opt: PaymentOption): X402AcceptEntry {
  const requirements: X402AcceptEntry['paymentRequirements'] = {
    scheme: 'exact',
    network: opt.network,
    amount: amountToDecimalString(opt.subscriptionPrice),
    destination: opt.serverPublicKey
  };
  if (opt.paymentType === PaymentType.USDC && opt.tokenMint) {
    requirements.asset = opt.tokenMint;
  }
  return { paymentRequirements: requirements };
}

/**
 * Create payment configuration
 */
export function createPaymentConfig(
  payTo: string,
  subscriptionPrice: number,
  subscriptionTime: number,
  network: string = 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1', // devnet
  paymentType: PaymentType = PaymentType.SOL
): PaymentConfig {
  return {
    payTo,
    paymentType,
    subscriptionPrice,
    subscriptionTime,
    network
  };
}
