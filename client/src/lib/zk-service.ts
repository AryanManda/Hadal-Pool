/**
 * ZK Service for Frontend
 * Handles ZK commitment creation and proof generation
 */

import { apiRequest } from "./queryClient";

export interface ZKCommitment {
  commitment: string;
  note: string;
}

export interface ZKProof {
  proof: {
    pi_a: [string, string, string];
    pi_b: [[string, string], [string, string], [string, string]];
    pi_c: [string, string, string];
    protocol: string;
    curve: string;
  };
  publicSignals: string[];
  nullifier: string;
  commitment: string;
  recipient: string;
  amount: string;
}

export class ZKService {
  /**
   * Create a ZK commitment for a deposit
   * @param amount Amount in wei
   * @param poolId Pool ID
   * @param depositorAddress Depositor address
   * @returns Commitment hash
   */
  static async createCommitment(
    amount: string,
    poolId: number,
    depositorAddress: string
  ): Promise<ZKCommitment> {
    const response = await apiRequest(
      "POST",
      "/api/zk/commitment/create",
      {
        amount,
        poolId,
        depositorAddress,
      }
    );
    
    const data: ZKCommitment = await response.json();
    return data;
  }

  /**
   * Generate ZK proof for withdrawal
   * @param commitment Commitment hash
   * @param recipient Recipient address
   * @param amount Amount to withdraw in wei
   * @param lockDuration Lock duration in seconds
   * @returns ZK proof data
   */
  static async generateProof(
    commitmentOrNote: string,
    recipient: string,
    amount: string,
    lockDuration: number
  ): Promise<ZKProof> {
    const response = await apiRequest(
      "POST",
      "/api/zk/proof/generate",
      {
        commitment: commitmentOrNote,
        note: commitmentOrNote,
        recipient,
        amount,
        lockDuration,
      }
    );
    
    const data: ZKProof = await response.json();
    return data;
  }
}
