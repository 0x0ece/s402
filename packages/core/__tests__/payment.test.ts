import { verifyPayment, createPaymentConfig } from '../src/payment';

describe('Payment Verification', () => {
  test('verifyPayment returns success by default', async () => {
    const config = createPaymentConfig('test-address', '1000', 'solana:devnet');
    const result = await verifyPayment(config);
    
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  test('verifyPayment can simulate failure', async () => {
    const config = createPaymentConfig('test-address', '1000', 'solana:devnet');
    const result = await verifyPayment(config, undefined, { 
      shouldSucceed: false,
      errorMessage: 'Insufficient funds'
    });
    
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Insufficient funds');
  });

  test('createPaymentConfig creates valid config', () => {
    const config = createPaymentConfig('test-address', '1000');
    
    expect(config.payTo).toBe('test-address');
    expect(config.price).toBe('1000');
    expect(config.network).toBe('solana:devnet');
  });
});
