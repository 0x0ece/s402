import React, { useMemo } from 'react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter
} from '@solana/wallet-adapter-wallets';
import { getRpcUrlForNetwork } from '@s402/core';
import { S402ProviderProps } from './types';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

const MAINNET_CAIP2 = 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp';
const DEVNET_CAIP2 = 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1';

export const S402Provider: React.FC<S402ProviderProps> = ({ 
  children, 
  network = 'mainnet-beta' 
}) => {
  const solanaNetwork = network === 'mainnet-beta' 
    ? WalletAdapterNetwork.Mainnet 
    : WalletAdapterNetwork.Devnet;
    
  const endpoint = useMemo(() => {
    const caip2 = network === 'mainnet-beta' ? MAINNET_CAIP2 : DEVNET_CAIP2;
    return getRpcUrlForNetwork(caip2);
  }, [network]);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter()
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
