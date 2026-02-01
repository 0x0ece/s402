/**
 * Payment type enum for future extensibility
 */
export enum PaymentType {
  SOL = 'SOL',
  USDC = 'USDC',
  STAKE = 'STAKE'
}

/**
 * Configuration for payment requirements
 */
export interface PaymentConfig {
  /** Solana wallet address to receive payment */
  payTo: string;
  /** Type of payment */
  paymentType: PaymentType;
  /** Subscription price (in SOL, USDC, etc.) */
  subscriptionPrice: number;
  /** Subscription time in seconds */
  subscriptionTime: number;
  /** Network identifier (e.g., 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp', 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1') */
  network: string;
  
  // USDC-specific
  /** Token mint address for USDC payments */
  tokenMint?: string;
  
  // Staking-specific
  /** Validator vote account for stake verification */
  validatorVoteAccount?: string;
  /** Minimum stake amount in SOL */
  minimumStakeAmount?: number;
  
  // Legacy fields (deprecated, for backward compatibility)
  /** @deprecated Use subscriptionPrice instead */
  price?: string;
}

/**
 * Components of an RFC 9421 HTTP signature
 */
export interface SignatureComponents {
  /** Signature input parameters */
  signatureInput: string;
  /** Base64-encoded signature */
  signature: string;
  /** Key identifier */
  keyId: string;
  /** Algorithm used (e.g., 'ed25519') */
  algorithm: string;
}

/**
 * Result of signature verification
 */
export interface VerificationResult {
  /** Whether the signature is valid */
  valid: boolean;
  /** Error message if verification failed */
  error?: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * HTTP request structure for signing/verification
 */
export interface HttpRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: string;
  /** Client public key for payment verification */
  clientPublicKey?: string;
}

/**
 * Payment option details
 */
export interface PaymentOption {
  /** Payment type */
  paymentType: PaymentType;
  /** Server public key to send payment to */
  serverPublicKey: string;
  /** Required subscription price in SOL/USDC */
  subscriptionPrice: number;
  /** Subscription time in seconds */
  subscriptionTime: number;
  /** Network to use */
  network: string;
  /** Token mint address (for USDC) */
  tokenMint?: string;
  /** Validator vote account (for staking) */
  validatorVoteAccount?: string;
  /** Minimum stake amount (for staking) */
  minimumStakeAmount?: number;
}

/**
 * Response for 402 Payment Required
 */
export interface PaymentRequiredResponse {
  error: string;
  message: string;
  paymentOptions: PaymentOption[];
}

/**
 * Credit information for a client
 */
export interface ClientCredits {
  /** Time remaining in seconds */
  timeRemaining: number;
  /** When credits expire */
  expiresAt: Date;
  /** Last transaction details */
  lastTransaction?: {
    signature: string;
    amount: number;
    timestamp: Date;
  };
}

/**
 * Ed25519 key pair
 */
export interface KeyPair {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
}
