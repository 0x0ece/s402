import * as ed25519 from '@noble/ed25519';
import bs58 from 'bs58';
import { KeyPair } from './types';

/**
 * Generate an ed25519 key pair using @noble/ed25519
 */
export async function generateKeyPair(): Promise<KeyPair> {
  const privateKey = ed25519.utils.randomPrivateKey();
  const publicKey = await ed25519.getPublicKeyAsync(privateKey);
  
  return { 
    publicKey, 
    privateKey 
  };
}

/**
 * Export public key as base58 string (Solana standard)
 */
export function exportPublicKey(publicKey: Uint8Array): string {
  return bs58.encode(publicKey);
}

/**
 * Export public key as base64 string
 */
export function exportPublicKeyBase64(publicKey: Uint8Array): string {
  return Buffer.from(publicKey).toString('base64');
}

/**
 * Export public key as hex string
 */
export function exportPublicKeyHex(publicKey: Uint8Array): string {
  return Buffer.from(publicKey).toString('hex');
}

/**
 * Export private key as hex string (common format)
 */
export function exportPrivateKey(privateKey: Uint8Array): string {
  return Buffer.from(privateKey).toString('hex');
}

/**
 * Export private key as base64 string
 */
export function exportPrivateKeyBase64(privateKey: Uint8Array): string {
  return Buffer.from(privateKey).toString('base64');
}

/**
 * Import public key from base58 string (Solana standard)
 */
export function importPublicKey(base58Key: string): Uint8Array {
  return bs58.decode(base58Key);
}

/**
 * Import public key from base64 string
 */
export function importPublicKeyBase64(base64Key: string): Uint8Array {
  return new Uint8Array(Buffer.from(base64Key, 'base64'));
}

/**
 * Import public key from hex string
 */
export function importPublicKeyHex(hexKey: string): Uint8Array {
  return new Uint8Array(Buffer.from(hexKey, 'hex'));
}

/**
 * Import private key from hex string (common format)
 */
export function importPrivateKey(hexKey: string): Uint8Array {
  return new Uint8Array(Buffer.from(hexKey, 'hex'));
}

/**
 * Import private key from base64 string
 */
export function importPrivateKeyBase64(base64Key: string): Uint8Array {
  return new Uint8Array(Buffer.from(base64Key, 'base64'));
}
