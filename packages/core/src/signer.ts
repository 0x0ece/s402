import { sign } from '@ltonetwork/http-message-signatures';
import * as ed25519 from '@noble/ed25519';
import { HttpRequest, SignatureComponents } from './types';

/**
 * Sign an HTTP request with RFC 9421 using @ltonetwork/http-message-signatures + @noble/ed25519
 */
export async function signRequest(
  request: HttpRequest,
  privateKey: Uint8Array,
  keyId: string = 'default'
): Promise<SignatureComponents> {
  // Create signer object for @ltonetwork/http-message-signatures
  const signer = {
    keyid: keyId,
    alg: 'ed25519',
    sign: async (data: string): Promise<Uint8Array> => {
      // Convert string data to Uint8Array for ed25519
      const dataBytes = new TextEncoder().encode(data);
      // Use @noble/ed25519 to sign the data
      const signature = await ed25519.signAsync(dataBytes, privateKey);
      return signature;
    }
  };

  // Parse URL to get components
  const url = new URL(request.url);
  
  // Create request object for signing
  const requestForSigning: any = {
    method: request.method,
    url: request.url,
    headers: {
      ...request.headers,
      // Ensure required headers are present
      '@authority': url.host,
    }
  };

  // Sign the request using @ltonetwork/http-message-signatures
  const signedRequest: any = await sign(requestForSigning, { signer });

  // Extract signature components from headers
  // Try both lowercase and capitalized versions
  const signatureInput = (signedRequest.headers?.['signature-input'] || 
                         signedRequest.headers?.['Signature-Input'] || '') as string;
  const signature = (signedRequest.headers?.['signature'] || 
                    signedRequest.headers?.['Signature'] || '') as string;

  return {
    signatureInput,
    signature,
    keyId,
    algorithm: 'ed25519'
  };
}

/**
 * Add signature headers to a request
 */
export function addSignatureHeaders(
  headers: Record<string, string>,
  components: SignatureComponents
): Record<string, string> {
  return {
    ...headers,
    'signature-input': components.signatureInput,
    'signature': components.signature,
  };
}
