import { 
  Connection, 
  PublicKey, 
  Keypair,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  ParsedTransactionWithMeta,
  ConfirmedSignatureInfo
} from '@solana/web3.js';

/**
 * Solana transaction info
 */
export interface SolanaTransaction {
  signature: string;
  amount: number; // in SOL
  timestamp: Date;
  from: string;
  to: string;
}

/**
 * Solana RPC client wrapper for devnet/mainnet interactions
 */
export class SolanaClient {
  private connection: Connection;
  private network: string;

  constructor(network: string = 'devnet') {
    this.network = network;
    
    // Map network identifier to RPC URL
    const rpcUrl = this.getRpcUrl(network);
    this.connection = new Connection(rpcUrl, 'confirmed');
  }

  /**
   * Get RPC URL for network
   */
  private getRpcUrl(network: string): string {
    // Handle CAIP-2 format: solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1
    if (network.includes(':')) {
      const parts = network.split(':');
      const chainId = parts[1];
      
      // Solana devnet chain ID
      if (chainId === 'EtWTRABZaYq6iMfeYKouRu166VU2xqa1') {
        return 'https://api.devnet.solana.com';
      }
      // Solana mainnet chain ID
      if (chainId === '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp') {
        return 'https://api.mainnet-beta.solana.com';
      }
    }
    
    // Default to devnet
    return 'https://api.devnet.solana.com';
  }

  /**
   * Get recent transactions from one address to another
   */
  async getRecentTransactions(
    fromPubkey: string,
    toPubkey: string,
    limit: number = 10
  ): Promise<SolanaTransaction[]> {
    try {
      const fromPublicKey = new PublicKey(fromPubkey);
      const toPublicKey = new PublicKey(toPubkey);

      // Get signatures for the sender
      const signatures = await this.connection.getSignaturesForAddress(
        fromPublicKey,
        { limit }
      );

      // Fetch and parse transactions
      const transactions: SolanaTransaction[] = [];

      for (const sig of signatures) {
        const tx = await this.connection.getParsedTransaction(sig.signature, {
          maxSupportedTransactionVersion: 0
        });

        if (!tx || !tx.meta || tx.meta.err) continue;

        // Check if this is a transfer to our target address
        const amount = this.extractTransferAmount(tx, fromPublicKey, toPublicKey);
        
        if (amount > 0) {
          transactions.push({
            signature: sig.signature,
            amount,
            timestamp: new Date((sig.blockTime || 0) * 1000),
            from: fromPubkey,
            to: toPubkey
          });
        }
      }

      return transactions;
    } catch (error) {
      console.error('[Solana Client] Error fetching transactions:', error);
      return [];
    }
  }

  /**
   * Extract transfer amount from a parsed transaction
   */
  private extractTransferAmount(
    tx: ParsedTransactionWithMeta,
    fromPubkey: PublicKey,
    toPubkey: PublicKey
  ): number {
    if (!tx.transaction || !tx.meta) return 0;

    // Check pre and post balances
    const accountKeys = tx.transaction.message.accountKeys;
    
    let fromIndex = -1;
    let toIndex = -1;

    accountKeys.forEach((key, index) => {
      if (key.pubkey.equals(fromPubkey)) fromIndex = index;
      if (key.pubkey.equals(toPubkey)) toIndex = index;
    });

    if (fromIndex === -1 || toIndex === -1) return 0;

    const preBalances = tx.meta.preBalances;
    const postBalances = tx.meta.postBalances;

    // Calculate the amount transferred
    const toBalanceChange = postBalances[toIndex] - preBalances[toIndex];
    
    if (toBalanceChange > 0) {
      return toBalanceChange / LAMPORTS_PER_SOL;
    }

    return 0;
  }

  /**
   * Send SOL transaction
   */
  async sendTransaction(
    fromPrivateKeyHex: string,
    toPubkey: string,
    amountSol: number
  ): Promise<string> {
    try {
      // Convert hex private key to Keypair
      // Ed25519 private key is 32 bytes - use fromSeed() which accepts 32 bytes
      const privateKeyBytes = Buffer.from(fromPrivateKeyHex, 'hex');
      const fromKeypair = Keypair.fromSeed(privateKeyBytes);
      const toPublicKey = new PublicKey(toPubkey);

      // Get recent blockhash
      const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash('confirmed');

      // Create transaction
      const transaction = new Transaction({
        feePayer: fromKeypair.publicKey,
        blockhash,
        lastValidBlockHeight
      }).add(
        SystemProgram.transfer({
          fromPubkey: fromKeypair.publicKey,
          toPubkey: toPublicKey,
          lamports: Math.floor(amountSol * LAMPORTS_PER_SOL)
        })
      );

      // Send and confirm transaction
      const signature = await this.connection.sendTransaction(
        transaction,
        [fromKeypair],
        { skipPreflight: false, preflightCommitment: 'confirmed' }
      );

      // Wait for confirmation
      await this.connection.confirmTransaction(signature, 'confirmed');

      return signature;
    } catch (error) {
      console.error('[Solana Client] Error sending transaction:', error);
      throw error;
    }
  }

  /**
   * Get balance for an address
   */
  async getBalance(pubkey: string): Promise<number> {
    try {
      const publicKey = new PublicKey(pubkey);
      const balance = await this.connection.getBalance(publicKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('[Solana Client] Error getting balance:', error);
      return 0;
    }
  }

  /**
   * Get connection instance
   */
  getConnection(): Connection {
    return this.connection;
  }
}
