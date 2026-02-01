import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useS402 } from '@s402/react';
import { PaymentModal } from '@s402/react';
import { PaymentOption } from '@s402/core';

interface ProtectedData {
  success: boolean;
  message: string;
  data: {
    timestamp: number;
    content: string;
    features: string[];
  };
}

const ProtectedPage: React.FC = () => {
  const { publicKey } = useWallet();
  const { sendPayment } = useS402();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ProtectedData | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentPaymentOptions, setCurrentPaymentOptions] = useState<PaymentOption[]>([]);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const fetchProtectedContent = async () => {
    if (!publicKey) {
      setError('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/protected', {
        headers: {
          'x-client-pubkey': publicKey.toBase58()
        }
      });

      if (response.status === 402) {
        // Payment required
        const paymentData = await response.json();
        setCurrentPaymentOptions(paymentData.paymentOptions);
        setShowPaymentModal(true);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch protected content');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSelect = async (option: PaymentOption) => {
    setIsProcessingPayment(true);
    setError(null);

    try {
      console.log('[ProtectedPage] Sending payment:', option.paymentType);
      const signature = await sendPayment(option);
      console.log('[ProtectedPage] Payment successful:', signature);

      // Wait a bit for transaction confirmation
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Close modal and retry fetching content
      setShowPaymentModal(false);
      setCurrentPaymentOptions([]);
      
      // Retry fetching protected content
      await fetchProtectedContent();
    } catch (err) {
      console.error('[ProtectedPage] Payment error:', err);
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleCancelPayment = () => {
    setShowPaymentModal(false);
    setCurrentPaymentOptions([]);
    setError('Payment cancelled');
  };

  useEffect(() => {
    if (publicKey && !data) {
      fetchProtectedContent();
    }
  }, [publicKey]);

  return (
    <div className="protected-page">
      <header className="header">
        <Link to="/" className="back-link">← Back to Home</Link>
        <h1>Protected Content</h1>
        <WalletMultiButton />
      </header>

      <main className="protected-content">
        {!publicKey && (
          <div className="message-box info">
            <h2>Wallet Required</h2>
            <p>Please connect your Solana wallet to access this content.</p>
          </div>
        )}

        {publicKey && loading && (
          <div className="message-box loading">
            <div className="spinner"></div>
            <p>Loading protected content...</p>
          </div>
        )}

        {error && (
          <div className="message-box error">
            <h3>Error</h3>
            <p>{error}</p>
            {!showPaymentModal && (
              <button onClick={fetchProtectedContent} className="retry-button">
                Try Again
              </button>
            )}
          </div>
        )}

        {data && (
          <div className="success-content">
            <div className="success-header">
              <div className="success-icon">✓</div>
              <h2>{data.message}</h2>
            </div>

            <div className="content-card">
              <h3>Exclusive Content</h3>
              <p>{data.data.content}</p>

              <h4>Premium Features:</h4>
              <ul>
                {data.data.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>

              <div className="content-meta">
                <p>Access granted at: {new Date(data.data.timestamp).toLocaleString()}</p>
              </div>
            </div>

            <button onClick={fetchProtectedContent} className="refresh-button">
              Refresh Content
            </button>
          </div>
        )}
      </main>

      <PaymentModal
        isOpen={showPaymentModal}
        options={currentPaymentOptions}
        onSelect={handlePaymentSelect}
        onCancel={handleCancelPayment}
        isProcessing={isProcessingPayment}
      />
    </div>
  );
};

export default ProtectedPage;
