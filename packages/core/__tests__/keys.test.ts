import { generateKeyPair, exportPublicKey, importPublicKey } from '../src/keys';

describe('Key Management', () => {
  test('generateKeyPair returns valid key pair', async () => {
    const keyPair = await generateKeyPair();
    expect(keyPair.publicKey).toBeInstanceOf(Uint8Array);
    expect(keyPair.privateKey).toBeInstanceOf(Uint8Array);
    expect(keyPair.publicKey.length).toBe(32);
    expect(keyPair.privateKey.length).toBe(32); // private key is 32 bytes for ed25519
  });

  test('exportPublicKey and importPublicKey are reversible', async () => {
    const keyPair = await generateKeyPair();
    const exported = exportPublicKey(keyPair.publicKey);
    const imported = importPublicKey(exported);
    expect(imported).toEqual(keyPair.publicKey);
  });
});
