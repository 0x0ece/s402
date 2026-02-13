import React, { useState, useRef, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { encodeURL, createQR } from '@solana/pay';
import BigNumber from 'bignumber.js';
import { PaymentModalProps } from './types';
import { PaymentType, PaymentOption } from '@s402/core';
import { SolanaClient, getUSDCTransactions } from '@s402/core';

const LAMPORTS_PER_SOL = 1e9;
const USDC_DECIMALS = 6;

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  options,
  onSelect,
  onCancel,
  isProcessing = false,
  onPaymentDetected
}) => {
  const { publicKey } = useWallet();
  const [selectedOptionForQr, setSelectedOptionForQr] = useState<PaymentOption | null>(null);
  const [qrShownAt, setQrShownAt] = useState<number>(0);
  const qrContainerRef = useRef<HTMLDivElement>(null);

  // Show QR code when an option is selected for QR payment
  useEffect(() => {
    if (!selectedOptionForQr || !qrContainerRef.current) return;

    const recipient = new PublicKey(selectedOptionForQr.serverPublicKey);
    const isUSDC = selectedOptionForQr.paymentType === PaymentType.USDC;

    const amount = isUSDC
      ? new BigNumber(selectedOptionForQr.subscriptionPrice * Math.pow(10, USDC_DECIMALS))
      : new BigNumber(selectedOptionForQr.subscriptionPrice * LAMPORTS_PER_SOL);

    const params: Parameters<typeof encodeURL>[0] = {
      recipient,
      amount,
      label: 'S402 Payment',
      message: `${selectedOptionForQr.subscriptionPrice} ${selectedOptionForQr.paymentType} for ${selectedOptionForQr.subscriptionTime}s access`
    };
    if (isUSDC && selectedOptionForQr.tokenMint) {
      params.splToken = new PublicKey(selectedOptionForQr.tokenMint);
    }

    const url = encodeURL(params);
    const qr = createQR(url, 280, 'white', '#000000');
    qrContainerRef.current.innerHTML = '';
    qr.append(qrContainerRef.current);

    return () => {
      const el = qrContainerRef.current;
      if (el && el.replaceChildren) el.replaceChildren();
    };
  }, [selectedOptionForQr]);

  // Poll for payment when QR view is active (same wallet)
  useEffect(() => {
    if (!selectedOptionForQr || !publicKey || !onPaymentDetected) return;

    const since = qrShownAt - 5000;

    const checkPayment = async () => {
      try {
        if (selectedOptionForQr.paymentType === PaymentType.SOL) {
          const client = new SolanaClient(selectedOptionForQr.network);
          const txs = await client.getRecentTransactions(
            publicKey.toBase58(),
            selectedOptionForQr.serverPublicKey,
            5
          );
          const recent = txs.filter((tx) => tx.timestamp.getTime() >= since);
          if (recent.length > 0 && recent.some((tx) => tx.amount >= selectedOptionForQr.subscriptionPrice)) {
            onPaymentDetected(selectedOptionForQr);
            setSelectedOptionForQr(null);
          }
        } else if (selectedOptionForQr.paymentType === PaymentType.USDC && selectedOptionForQr.tokenMint) {
          const client = new SolanaClient(selectedOptionForQr.network);
          const conn = client.getConnection();
          const txs = await getUSDCTransactions(
            conn,
            publicKey.toBase58(),
            selectedOptionForQr.serverPublicKey,
            selectedOptionForQr.tokenMint,
            5
          );
          const recent = txs.filter((tx) => tx.timestamp.getTime() >= since);
          if (recent.length > 0 && recent.some((tx) => tx.amount >= selectedOptionForQr.subscriptionPrice)) {
            onPaymentDetected(selectedOptionForQr);
            setSelectedOptionForQr(null);
          }
        }
      } catch {
        // ignore polling errors
      }
    };

    const interval = setInterval(checkPayment, 2500);
    checkPayment();
    return () => clearInterval(interval);
  }, [selectedOptionForQr, publicKey, onPaymentDetected, qrShownAt]);

  // Reset QR view when modal closes
  useEffect(() => {
    if (!isOpen) setSelectedOptionForQr(null);
  }, [isOpen]);

  const handleShowQr = (option: PaymentOption) => {
    setSelectedOptionForQr(option);
    setQrShownAt(Date.now());
  };

  if (!isOpen) return null;

  const showQrView = selectedOptionForQr !== null;
  const supportsQr = (option: PaymentOption) =>
    option.paymentType === PaymentType.SOL || option.paymentType === PaymentType.USDC;

  return (
    <div className="s402-modal-overlay" onClick={onCancel}>
      <div className="s402-modal" onClick={(e) => e.stopPropagation()}>
        <div className="s402-modal-header">
          <h2>{showQrView ? 'Pay with QR code' : 'Payment Required'}</h2>
          <button className="s402-modal-close" onClick={onCancel}>
            ×
          </button>
        </div>

        <div className="s402-modal-body">
          {showQrView ? (
            <>
              <p className="s402-qr-instruction">
                Scan with your Solana wallet (e.g. Phantom). Use the same wallet as connected here.
              </p>
              <div className="s402-qr-wrapper" ref={qrContainerRef} />
              <p className="s402-qr-amount">
                {selectedOptionForQr.subscriptionPrice} {selectedOptionForQr.paymentType} → {selectedOptionForQr.subscriptionTime}s access
              </p>
              <button
                type="button"
                className="s402-button-back"
                onClick={() => setSelectedOptionForQr(null)}
              >
                ← Back to payment options
              </button>
            </>
          ) : (
            <>
              <p>Choose a payment method to access this content:</p>

              <div className="s402-payment-options">
                {options.map((option, index) => (
                  <div key={index} className="s402-payment-option-wrapper">
                    <button
                      className="s402-payment-option"
                      onClick={() => onSelect(option)}
                      disabled={isProcessing}
                    >
                      <div className="s402-payment-icon">
                        <PaymentIcon type={option.paymentType} />
                      </div>
                      <div className="s402-payment-details">
                        <strong>{option.paymentType}</strong>
                        <span className="s402-payment-price">
                          {option.subscriptionPrice} {option.paymentType}
                        </span>
                        <span className="s402-payment-duration">
                          {option.subscriptionTime}s access
                        </span>
                      </div>
                    </button>
                    {supportsQr(option) && (
                      <button
                        type="button"
                        className="s402-pay-with-qr"
                        onClick={() => handleShowQr(option)}
                        disabled={isProcessing}
                      >
                        Pay with QR code
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="s402-modal-footer">
          <button
            className="s402-button-secondary"
            onClick={onCancel}
            disabled={isProcessing}
          >
            Cancel
          </button>
        </div>
      </div>

      <style>{`
        .s402-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }

        .s402-modal {
          background: white;
          border-radius: 12px;
          max-width: 500px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        }

        .s402-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #e0e0e0;
        }

        .s402-modal-header h2 {
          margin: 0;
          font-size: 24px;
          color: #333;
        }

        .s402-modal-close {
          background: none;
          border: none;
          font-size: 32px;
          cursor: pointer;
          color: #999;
          line-height: 1;
          padding: 0;
          width: 32px;
          height: 32px;
        }

        .s402-modal-close:hover {
          color: #333;
        }

        .s402-modal-body {
          padding: 20px;
        }

        .s402-modal-body p {
          margin: 0 0 20px 0;
          color: #666;
        }

        .s402-payment-options {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .s402-payment-option-wrapper {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .s402-payment-option {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
          width: 100%;
          text-align: left;
        }

        .s402-payment-option:hover:not(:disabled) {
          border-color: #9945FF;
          background: #f9f9ff;
        }

        .s402-payment-option:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .s402-pay-with-qr {
          background: none;
          border: none;
          color: #9945FF;
          cursor: pointer;
          font-size: 14px;
          padding: 4px 0;
          text-align: left;
        }

        .s402-pay-with-qr:hover:not(:disabled) {
          text-decoration: underline;
        }

        .s402-pay-with-qr:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .s402-payment-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .s402-payment-details {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          flex: 1;
        }

        .s402-payment-details strong {
          font-size: 18px;
          color: #333;
          margin-bottom: 4px;
        }

        .s402-payment-price {
          font-size: 16px;
          color: #9945FF;
          font-weight: 600;
        }

        .s402-payment-duration {
          font-size: 14px;
          color: #999;
        }

        .s402-qr-instruction {
          margin-bottom: 16px;
        }

        .s402-qr-wrapper {
          display: flex;
          justify-content: center;
          margin: 16px 0;
          min-height: 280px;
        }

        .s402-qr-wrapper canvas,
        .s402-qr-wrapper img {
          display: block;
        }

        .s402-qr-amount {
          text-align: center;
          font-weight: 600;
          color: #333;
        }

        .s402-button-back {
          margin-top: 16px;
          padding: 10px 16px;
          background: #f0f0f0;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          width: 100%;
        }

        .s402-button-back:hover {
          background: #e5e5e5;
        }

        .s402-modal-footer {
          padding: 20px;
          border-top: 1px solid #e0e0e0;
          display: flex;
          justify-content: flex-end;
        }

        .s402-button-secondary {
          padding: 10px 20px;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          background: white;
          color: #666;
          cursor: pointer;
          font-size: 16px;
        }

        .s402-button-secondary:hover:not(:disabled) {
          background: #f5f5f5;
        }

        .s402-button-secondary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

const PaymentIcon: React.FC<{ type: PaymentType }> = ({ type }) => {
  switch (type) {
    case PaymentType.SOL:
      return (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="24" fill="#9945FF" />
          <path
            d="M16 28L24 20L32 28"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case PaymentType.USDC:
      return (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="24" fill="#2775CA" />
          <text
            x="24"
            y="32"
            textAnchor="middle"
            fill="white"
            fontSize="20"
            fontWeight="bold"
          >
            $
          </text>
        </svg>
      );
    case PaymentType.STAKE:
      return (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="24" fill="#14F195" />
          <path
            d="M24 14V34M18 24H30"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      );
    default:
      return null;
  }
};
