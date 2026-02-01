/**
 * Configuration for the s402 fetch wrapper
 */
export interface FetchConfig {
  /** Private key for signing requests (hex format) */
  privateKey?: string;
  /** Client public key (base58 format) */
  publicKey?: string;
  /** Key identifier */
  keyId?: string;
  /** Whether to sign requests */
  signRequests?: boolean;
  /** Whether to automatically send payments on 402 responses */
  autoPayment?: boolean;
  /** Custom error handler */
  onError?: (error: Error) => void;
}

/**
 * Extended fetch options with s402 config
 */
export interface S402FetchOptions extends RequestInit {
  s402?: {
    /** Override signing for this request */
    sign?: boolean;
  };
}
