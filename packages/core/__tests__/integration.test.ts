import { generateKeyPair, exportPublicKey, importPublicKey } from '../src/keys';
import { signRequest } from '../src/signer';
import { verifyRequest } from '../src/verifier';
import { HttpRequest } from '../src/types';

describe('Integration: Sign and Verify', () => {
  test('signed request can be verified successfully', async () => {
    // Generate key pair
    const keyPair = await generateKeyPair();
    
    // Create a request
    const request: HttpRequest = {
      method: 'POST',
      url: 'http://example.com/api/test',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({ test: true })
    };

    // Sign the request
    const signatureComponents = await signRequest(request, keyPair.privateKey, 'test-key');
    
    // Add signature headers to request
    const signedRequest: HttpRequest = {
      ...request,
      headers: {
        ...request.headers,
        'signature-input': signatureComponents.signatureInput,
        'signature': signatureComponents.signature
      }
    };

    // Verify the request
    const verificationResult = await verifyRequest(signedRequest, keyPair.publicKey);
    
    expect(verificationResult.valid).toBe(true);
    expect(verificationResult.error).toBeUndefined();
  });

  test('verification fails with wrong public key', async () => {
    // Generate two different key pairs
    const keyPair1 = await generateKeyPair();
    const keyPair2 = await generateKeyPair();
    
    // Create and sign request with keyPair1
    const request: HttpRequest = {
      method: 'GET',
      url: 'http://example.com/api/data',
      headers: {}
    };

    const signatureComponents = await signRequest(request, keyPair1.privateKey, 'key1');
    
    const signedRequest: HttpRequest = {
      ...request,
      headers: {
        'signature-input': signatureComponents.signatureInput,
        'signature': signatureComponents.signature
      }
    };

    // Try to verify with keyPair2's public key (should fail)
    const verificationResult = await verifyRequest(signedRequest, keyPair2.publicKey);
    
    expect(verificationResult.valid).toBe(false);
    expect(verificationResult.error).toBeTruthy();
  });

  test('verification fails with missing signature headers', async () => {
    const keyPair = await generateKeyPair();
    
    const request: HttpRequest = {
      method: 'GET',
      url: 'http://example.com/api/data',
      headers: {} // No signature headers
    };

    const verificationResult = await verifyRequest(request, keyPair.publicKey);
    
    expect(verificationResult.valid).toBe(false);
    expect(verificationResult.error).toContain('Missing signature headers');
  });
});
