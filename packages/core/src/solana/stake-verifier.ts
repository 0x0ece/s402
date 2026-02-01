import {
  Connection,
  PublicKey,
  StakeProgram,
  LAMPORTS_PER_SOL
} from '@solana/web3.js';
import { ClientCredits } from '../types';

/**
 * Stake verification result
 */
export interface StakeVerificationResult {
  hasValidStake: boolean;
  stakeAmount?: number;
  stakeAccounts?: string[];
  credits?: ClientCredits;
}

/**
 * Stake account info
 */
interface StakeAccountInfo {
  pubkey: string;
  stakeAmount: number;
  voter: string;
  state: 'active' | 'activating' | 'deactivating' | 'inactive';
}

/**
 * Verify that client has valid stake with specified validator
 */
export async function verifyStake(
  connection: Connection,
  clientPublicKey: string,
  validatorVoteAccount: string,
  minimumStake: number
): Promise<StakeVerificationResult> {
  try {
    const clientPubkey = new PublicKey(clientPublicKey);
    const validatorPubkey = new PublicKey(validatorVoteAccount);

    // Get all stake accounts owned by client
    const stakeAccounts = await connection.getParsedProgramAccounts(
      StakeProgram.programId,
      {
        filters: [
          {
            memcmp: {
              offset: 12, // Offset for stake authority in stake account
              bytes: clientPubkey.toBase58()
            }
          }
        ]
      }
    );

    const validStakeAccounts: StakeAccountInfo[] = [];
    let totalStakeAmount = 0;

    for (const account of stakeAccounts) {
      const accountData = account.account.data;
      
      if ('parsed' in accountData && accountData.parsed) {
        const parsed = accountData.parsed;
        const info = parsed.info;

        // Check if account is staked to our validator
        if (
          info.stake &&
          info.stake.delegation &&
          info.stake.delegation.voter === validatorVoteAccount
        ) {
          const stakeAmount = info.stake.delegation.stake / LAMPORTS_PER_SOL;
          const state = info.stake.delegation.activationEpoch ? 'active' : 'inactive';

          validStakeAccounts.push({
            pubkey: account.pubkey.toBase58(),
            stakeAmount,
            voter: info.stake.delegation.voter,
            state
          });

          totalStakeAmount += stakeAmount;
        }
      }
    }

    // Check if total stake meets minimum requirement
    const hasValidStake = totalStakeAmount >= minimumStake;

    if (hasValidStake) {
      // For staking, provide very long credit expiry (1 year)
      // As long as stake is active, access is granted
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

      return {
        hasValidStake: true,
        stakeAmount: totalStakeAmount,
        stakeAccounts: validStakeAccounts.map(a => a.pubkey),
        credits: {
          timeRemaining: 365 * 24 * 60 * 60, // 1 year in seconds
          expiresAt: oneYearFromNow,
          lastTransaction: {
            signature: 'stake-account',
            amount: totalStakeAmount,
            timestamp: new Date()
          }
        }
      };
    }

    return {
      hasValidStake: false,
      stakeAmount: totalStakeAmount,
      stakeAccounts: validStakeAccounts.map(a => a.pubkey)
    };
  } catch (error) {
    console.error('[Stake Verifier] Error verifying stake:', error);
    return {
      hasValidStake: false
    };
  }
}

/**
 * Get a default devnet validator vote account for testing
 */
export async function getDefaultValidator(connection: Connection): Promise<string> {
  try {
    // Get vote accounts
    const voteAccounts = await connection.getVoteAccounts();
    
    // Return first active validator
    if (voteAccounts.current.length > 0) {
      return voteAccounts.current[0].votePubkey;
    }
    
    // Fallback to any validator
    if (voteAccounts.delinquent.length > 0) {
      return voteAccounts.delinquent[0].votePubkey;
    }
    
    throw new Error('No validators found');
  } catch (error) {
    console.error('[Stake Verifier] Error getting default validator:', error);
    // Return a known devnet validator as fallback
    return 'CertusDeBmqN8ZawdkxK5kFGMwBXdudvWHYwtNgNhvLu';
  }
}
