import { PaymentOption } from '@s402/core';

export interface S402ContextValue {
  fetchWithPayment: (url: string, options?: RequestInit) => Promise<Response>;
  sendPayment: (option: PaymentOption) => Promise<string>;
  isPaymentModalOpen: boolean;
  paymentOptions: PaymentOption[];
  closePaymentModal: () => void;
}

export interface S402ProviderProps {
  children: React.ReactNode;
  network?: 'devnet' | 'mainnet-beta';
}

export interface PaymentModalProps {
  isOpen: boolean;
  options: PaymentOption[];
  onSelect: (option: PaymentOption) => void;
  onCancel: () => void;
  isProcessing?: boolean;
}
