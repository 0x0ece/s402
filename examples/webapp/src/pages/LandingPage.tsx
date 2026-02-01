import React from 'react';
import { Link } from 'react-router-dom';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const LandingPage: React.FC = () => {
  return (
    <div className="landing-page">
      <header className="header">
        <h1>S402</h1>
        <WalletMultiButton />
      </header>

      <main className="landing-content">
        <section className="hero">
          <h2>Solana Payment Middleware for APIs</h2>
          <p className="subtitle">
            Protect your APIs with blockchain-based payments. 
            Pay-per-use with SOL, USDC, or staking.
          </p>
        </section>

        <section className="features">
          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3>Multiple Payment Options</h3>
            <p>Accept SOL, USDC, or require staking for access</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Instant Verification</h3>
            <p>Real-time blockchain verification with server-side caching</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔐</div>
            <h3>Secure & Decentralized</h3>
            <p>Built on Solana with RFC 9421 HTTP signatures</p>
          </div>
        </section>

        <section className="payment-options">
          <h3>Payment Methods</h3>
          <div className="payment-grid">
            <div className="payment-method">
              <div className="payment-icon sol">◎</div>
              <h4>SOL</h4>
              <p>0.001 SOL / 60 seconds</p>
            </div>

            <div className="payment-method">
              <div className="payment-icon usdc">$</div>
              <h4>USDC</h4>
              <p>0.01 USDC / 60 seconds</p>
            </div>

            <div className="payment-method">
              <div className="payment-icon stake">+</div>
              <h4>Staking</h4>
              <p>1 SOL staked = unlimited access</p>
            </div>
          </div>
        </section>

        <section className="cta">
          <Link to="/protected" className="cta-button">
            Try Protected Content →
          </Link>
          <p className="cta-note">
            Connect your wallet and choose a payment method
          </p>
        </section>

        <section className="how-it-works">
          <h3>How It Works</h3>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h4>Connect Wallet</h4>
              <p>Connect your Solana wallet (Phantom, Solflare, etc.)</p>
            </div>

            <div className="step">
              <div className="step-number">2</div>
              <h4>Access Protected Content</h4>
              <p>Navigate to protected pages that require payment</p>
            </div>

            <div className="step">
              <div className="step-number">3</div>
              <h4>Choose Payment Method</h4>
              <p>Select SOL, USDC, or stake to access content</p>
            </div>

            <div className="step">
              <div className="step-number">4</div>
              <h4>Enjoy Access</h4>
              <p>Your payment is verified and you get instant access</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>Built with S402 - Solana Payment Middleware</p>
        <p>
          <a href="https://github.com/yourusername/s402" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          {' · '}
          <a href="https://docs.s402.org" target="_blank" rel="noopener noreferrer">
            Documentation
          </a>
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
