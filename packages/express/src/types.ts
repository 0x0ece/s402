import { PaymentConfig } from '@s402/core';

/**
 * Configuration for the payment middleware
 */
export interface MiddlewareConfig {
  /** Payment configurations (multiple options supported) */
  paymentOptions: PaymentConfig[];
  /** Public key for signature verification (base58 format) */
  publicKey?: string;
  /** Whether to require signatures */
  requireSignature?: boolean;
  /** Custom error handler */
  onError?: (error: Error) => void;
  
  /** @deprecated Use paymentOptions instead */
  payment?: PaymentConfig;
}

/**
 * Options for individual routes
 */
export interface RouteConfig extends MiddlewareConfig {
  /** Route path */
  path: string;
  /** HTTP method */
  method?: string;
}
