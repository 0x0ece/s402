import { useState, useCallback } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import {
  Transaction,
  SystemProgram,
  PublicKey,
  LAMPORTS_PER_SOL
} from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  TOKEN_PROGRAM_ID
} from '@solana/spl-token';
import { PaymentRequiredResponse, PaymentOption, PaymentType } from '@s402/core';

export function useS402() {
  const { publicKey, signTransaction, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentOptions, setPaymentOptions] = useState<PaymentOption[]>([]);
  const [pendingRequest, setPendingRequest] = useState<{
    url: string;
    options?: RequestInit;
  } | null>(null);

  const sendPayment = useCallback(
    async (option: PaymentOption): Promise<string> => {
      if (!publicKey || !signTransaction) {
        throw new Error('Wallet not connected');
      }

      console.log(`[useS402] Sending payment: ${option.paymentType}`);

      switch (option.paymentType) {
        case PaymentType.SOL:
          return sendSOLPayment(option);
        case PaymentType.USDC:
          return sendUSDCPayment(option);
        case PaymentType.STAKE:
          return createStakeAccount(option);
        default:
          throw new Error(`Unsupported payment type: ${option.paymentType}`);
      }
    },
    [publicKey, signTransaction, connection]
  );

  const sendSOLPayment = async (option: PaymentOption): Promise<string> => {
    if (!publicKey || !sendTransaction) {
      throw new Error('Wallet not connected');
    }

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: new PublicKey(option.serverPublicKey),
        lamports: option.subscriptionPrice * LAMPORTS_PER_SOL
      })
    );

    const signature = await sendTransaction(transaction, connection);
    await connection.confirmTransaction(signature, 'confirmed');

    console.log(`[useS402] SOL payment sent: ${signature}`);
    return signature;
  };

  const sendUSDCPayment = async (option: PaymentOption): Promise<string> => {
    if (!publicKey || !sendTransaction) {
      throw new Error('Wallet not connected');
    }

    if (!option.tokenMint) {
      throw new Error('Token mint not specified for USDC payment');
    }

    const mintPubkey = new PublicKey(option.tokenMint);
    const serverPubkey = new PublicKey(option.serverPublicKey);

    // Get associated token accounts
    const fromTokenAccount = await getAssociatedTokenAddress(
      mintPubkey,
      publicKey
    );

    const toTokenAccount = await getAssociatedTokenAddress(
      mintPubkey,
      serverPubkey
    );

    // Create transfer instruction
    const transaction = new Transaction().add(
      createTransferInstruction(
        fromTokenAccount,
        toTokenAccount,
        publicKey,
        option.subscriptionPrice * Math.pow(10, 6), // USDC has 6 decimals
        [],
        TOKEN_PROGRAM_ID
      )
    );

    const signature = await sendTransaction(transaction, connection);
    await connection.confirmTransaction(signature, 'confirmed');

    console.log(`[useS402] USDC payment sent: ${signature}`);
    return signature;
  };

  const createStakeAccount = async (option: PaymentOption): Promise<string> => {
    // Staking is more complex and would require multiple transactions
    // For now, throw an error indicating it's not yet implemented
    throw new Error('Stake account creation not yet implemented in React hook');
  };

  const fetchWithPayment = useCallback(
    async (url: string, options?: RequestInit): Promise<Response> => {
      // Add client public key to request
      const enhancedOptions = {
        ...options,
        headers: {
          ...options?.headers,
          'x-client-pubkey': publicKey?.toBase58() || ''
        }
      };

      // Make initial request
      const response = await fetch(url, enhancedOptions);

      // If 402, show payment modal
      if (response.status === 402) {
        const data = await response.json() as PaymentRequiredResponse;

        setPaymentOptions(data.paymentOptions);
        setIsPaymentModalOpen(true);
        setPendingRequest({ url, options: enhancedOptions });

        // Return a promise that will be resolved when payment is complete
        return new Promise((resolve, reject) => {
          // This will be resolved by the payment modal callback
          const checkPayment = setInterval(async () => {
            if (!isPaymentModalOpen && pendingRequest) {
              clearInterval(checkPayment);
              // Retry the request
              const retryResponse = await fetch(url, enhancedOptions);
              resolve(retryResponse);
            }
          }, 500);
        });
      }

      return response;
    },
    [publicKey, isPaymentModalOpen, pendingRequest]
  );

  const closePaymentModal = useCallback(() => {
    setIsPaymentModalOpen(false);
    setPaymentOptions([]);
    setPendingRequest(null);
  }, []);

  return {
    fetchWithPayment,
    sendPayment,
    isPaymentModalOpen,
    paymentOptions,
    closePaymentModal
  };
}
