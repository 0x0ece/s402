import { signRequest, addSignatureHeaders } from '../src/signer';
import { generateKeyPair } from '../src/keys';

describe('HTTP Request Signing', () => {
  test('signRequest generates signature components', async () => {
    const keyPair = await generateKeyPair();
    const request = {
      method: 'GET',
      url: 'http://example.com/api/data',
      headers: {}
    };

    const signature = await signRequest(request, keyPair.privateKey, 'test-key');
    
    expect(signature.signatureInput).toBeTruthy();
    expect(signature.signature).toBeTruthy();
    expect(signature.keyId).toBe('test-key');
    expect(signature.algorithm).toBe('ed25519');
  });

  test('addSignatureHeaders adds signature headers', () => {
    const headers = { 'content-type': 'application/json' };
    const components = {
      signatureInput: 'sig1=("@method" "@path");created=1234567890',
      signature: 'sig1=:base64signature:',
      keyId: 'test',
      algorithm: 'ed25519'
    };

    const result = addSignatureHeaders(headers, components);
    
    expect(result['content-type']).toBe('application/json');
    expect(result['signature-input']).toBe(components.signatureInput);
    expect(result['signature']).toBe(components.signature);
  });
});
