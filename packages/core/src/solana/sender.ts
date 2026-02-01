import { SolanaClient } from './client';

/**
 * Send payment result
 */
export interface PaymentResult {
  success: boolean;
  signature?: string;
  error?: string;
}

/**
 * Send SOL payment from client to server
 */
export async function sendPayment(
  fromPrivateKeyHex: string,
  toPublicKey: string,
  amountSol: number,
  network: string = 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1' // devnet
): Promise<PaymentResult> {
  try {
    console.log(`[Payment Sender] Sending ${amountSol} SOL to ${toPublicKey}`);
    
    const client = new SolanaClient(network);
    
    const signature = await client.sendTransaction(
      fromPrivateKeyHex,
      toPublicKey,
      amountSol
    );

    console.log(`[Payment Sender] Payment sent! Signature: ${signature}`);

    return {
      success: true,
      signature
    };
  } catch (error) {
    console.error('[Payment Sender] Error sending payment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send payment'
    };
  }
}

/**
 * Get balance for a public key
 */
export async function getBalance(
  publicKey: string,
  network: string = 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1'
): Promise<number> {
  try {
    const client = new SolanaClient(network);
    return await client.getBalance(publicKey);
  } catch (error) {
    console.error('[Payment Sender] Error getting balance:', error);
    return 0;
  }
}
