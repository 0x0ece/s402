import { Request, Response, NextFunction } from 'express';
import { verifyRequest, importPublicKey, HttpRequest, verifyPayment, PaymentRequiredResponse, PaymentType, PaymentOption } from '@s402/core';
import { MiddlewareConfig } from './types';

/**
 * Create payment middleware for Express
 * Verifies both signatures and Solana payments
 */
export function paymentMiddleware(config: MiddlewareConfig) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log(`[s402] Processing request to ${req.method} ${req.path}`);
      
      // Support legacy single payment config
      const paymentOptions = config.paymentOptions || (config.payment ? [config.payment] : []);
      
      if (paymentOptions.length === 0) {
        console.error('[s402] No payment options configured');
        return res.status(500).json({
          error: 'Server configuration error: no payment options configured'
        });
      }
      
      // Verify signatures if required
      if (config.requireSignature) {
        if (!config.publicKey) {
          console.error('[s402] Signature verification enabled but no public key provided');
          return res.status(500).json({ 
            error: 'Server configuration error: missing public key' 
          });
        }

        // Check for signature headers
        const signatureInput = req.headers['signature-input'];
        const signature = req.headers['signature'];
        
        if (!signatureInput || !signature) {
          console.log('[s402] Request rejected: missing signature headers');
          return res.status(401).json({ 
            error: 'Unauthorized: Request must be signed',
            message: 'Missing signature-input or signature headers'
          });
        }

        // Build HttpRequest object for verification
        const httpRequest: HttpRequest = {
          method: req.method,
          url: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
          headers: req.headers as Record<string, string>,
          body: req.body ? JSON.stringify(req.body) : undefined
        };

        // Verify the signature
        const publicKeyBytes = importPublicKey(config.publicKey);
        const verificationResult = await verifyRequest(httpRequest, publicKeyBytes);

        if (!verificationResult.valid) {
          console.log('[s402] Request rejected: invalid signature');
          console.log('[s402] Verification error:', verificationResult.error);
          return res.status(403).json({ 
            error: 'Forbidden: Invalid signature',
            message: verificationResult.error
          });
        }

        console.log('[s402] Signature verified successfully');
      }

      // Verify payment
      const clientPublicKey = req.body?.clientPublicKey || req.headers['x-client-pubkey'];
      
      if (!clientPublicKey) {
        console.log('[s402] No client public key provided');
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Client public key required in request body or x-client-pubkey header'
        });
      }

      // Try each payment option until one is valid
      console.log(`[s402] Verifying payment for client: ${clientPublicKey}`);
      let anyValid = false;
      
      for (const paymentConfig of paymentOptions) {
        const paymentResult = await verifyPayment(paymentConfig, clientPublicKey);
        
        if (paymentResult.valid) {
          anyValid = true;
          console.log(`[s402] Payment verified via ${paymentConfig.paymentType}`);
          if (paymentResult.credits) {
            console.log(`[s402] Time remaining: ${paymentResult.credits.timeRemaining}s`);
          }
          break;
        }
      }

      if (!anyValid) {
        console.log('[s402] Payment required - no valid payment method found');
        
        // Return 402 with ALL payment options
        const paymentResponse: PaymentRequiredResponse = {
          error: 'Payment Required',
          message: 'Please send payment using one of the available methods',
          paymentOptions: paymentOptions.map(opt => ({
            paymentType: opt.paymentType,
            serverPublicKey: opt.payTo,
            subscriptionPrice: opt.subscriptionPrice,
            subscriptionTime: opt.subscriptionTime,
            network: opt.network,
            tokenMint: opt.tokenMint,
            validatorVoteAccount: opt.validatorVoteAccount,
            minimumStakeAmount: opt.minimumStakeAmount
          }))
        };

        return res.status(402).json(paymentResponse);
      }
      
      next();
    } catch (error) {
      console.error('[s402] Middleware error:', error);
      if (config.onError) {
        config.onError(error as Error);
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}

/**
 * Create a simple payment middleware with just a payment config
 */
export function simplePaymentMiddleware(
  payTo: string,
  subscriptionPrice: number,
  subscriptionTime: number,
  network: string = 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1'
) {
  return paymentMiddleware({
    paymentOptions: [{
      payTo,
      paymentType: PaymentType.SOL,
      subscriptionPrice,
      subscriptionTime,
      network
    }]
  });
}
