/**
 * Generate ed25519 keys for testing
 */
import { generateKeyPair, exportPublicKey, exportPrivateKey } from '@s402/core';

async function main() {
  console.log('Generating ed25519 key pair...\n');
  
  const keyPair = await generateKeyPair();
  const publicKey = exportPublicKey(keyPair.publicKey);
  const privateKey = exportPrivateKey(keyPair.privateKey);
  
  console.log('Generated keys:');
  console.log('================\n');
  console.log('// Test private key (hex format)');
  console.log(`export const PRIVATE_KEY = '${privateKey}';`);
  console.log('');
  console.log('// Test public key (base58 format - Solana standard)');
  console.log(`export const PUBLIC_KEY = '${publicKey}';`);
  console.log('');
  console.log('// Key ID for signature identification');
  console.log(`export const KEY_ID = 'test-key-1';`);
  console.log('\nCopy these values to keys.ts');
}

main();
