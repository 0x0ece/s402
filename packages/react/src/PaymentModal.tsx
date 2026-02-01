import React, { useState } from 'react';
import { PaymentModalProps } from './types';
import { PaymentType } from '@s402/core';

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  options,
  onSelect,
  onCancel,
  isProcessing = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="s402-modal-overlay" onClick={onCancel}>
      <div className="s402-modal" onClick={(e) => e.stopPropagation()}>
        <div className="s402-modal-header">
          <h2>Payment Required</h2>
          <button className="s402-modal-close" onClick={onCancel}>
            ×
          </button>
        </div>

        <div className="s402-modal-body">
          <p>Choose a payment method to access this content:</p>

          <div className="s402-payment-options">
            {options.map((option, index) => (
              <button
                key={index}
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
            ))}
          </div>
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
        }

        .s402-payment-option:hover:not(:disabled) {
          border-color: #9945FF;
          background: #f9f9ff;
        }

        .s402-payment-option:disabled {
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
