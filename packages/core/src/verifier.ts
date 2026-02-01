import { verify } from '@ltonetwork/http-message-signatures';
import * as ed25519 from '@noble/ed25519';
import { HttpRequest, VerificationResult } from './types';

/**
 * Verify an HTTP request signature with RFC 9421 using @ltonetwork/http-message-signatures + @noble/ed25519
 */
export async function verifyRequest(
  request: HttpRequest,
  publicKey: Uint8Array,
  keyId?: string
): Promise<VerificationResult> {
  // Check if signature headers are present
  const signatureInput = request.headers['signature-input'];
  const signature = request.headers['signature'];
  
  if (!signatureInput || !signature) {
    return {
      valid: false,
      error: 'Missing signature headers (signature-input or signature)'
    };
  }

  // Create verifier callback for @ltonetwork/http-message-signatures
  const verifyCallback = async (
    data: string, 
    sig: Uint8Array, 
    params: any
  ): Promise<any> => {
    try {
      // Convert string data to Uint8Array for ed25519
      const dataBytes = new TextEncoder().encode(data);
      // Verify the signature using @noble/ed25519
      const isValid = await ed25519.verifyAsync(sig, dataBytes, publicKey);
      
      if (!isValid) {
        throw new Error('Invalid signature');
      }
      
      // Return account/key info on success
      return {
        keyId: params.keyid || keyId || 'unknown',
        algorithm: params.algorithm || 'ed25519'
      };
    } catch (error) {
      throw new Error(`Signature verification failed: ${error}`);
    }
  };

  try {
    // Verify the request using @ltonetwork/http-message-signatures
    const result = await verify(request, verifyCallback);
    
    return {
      valid: true,
      metadata: {
        algorithm: 'ed25519',
        verified: true,
        ...result
      }
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Verification failed'
    };
  }
}

/**
 * Parse signature headers from request
 */
export function parseSignatureHeaders(
  headers: Record<string, string>
): { signatureInput?: string; signature?: string } {
  return {
    signatureInput: headers['signature-input'],
    signature: headers['signature']
  };
}
