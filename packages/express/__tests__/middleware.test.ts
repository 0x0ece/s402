import { paymentMiddleware } from '../src/middleware';

describe('Payment Middleware', () => {
  test('creates middleware function', () => {
    const middleware = paymentMiddleware({
      payment: {
        payTo: 'test-address',
        price: '1000',
        network: 'solana:devnet'
      }
    });
    
    expect(typeof middleware).toBe('function');
  });
});
