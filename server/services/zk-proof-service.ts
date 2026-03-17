/**
 * ZK Proof Generation Service
 * 
 * Generates zero-knowledge proofs for private withdrawals using snarkjs and circomlib.
 * Maximum privacy: hides depositor address, amount, and links deposits to withdrawals.
 */

import { randomBytes } from "crypto";
import { ethers } from "ethers";
import * as snarkjs from "snarkjs";
import { buildPoseidon } from "circomlibjs";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "../..");

// Paths to ZK circuit artifacts
const CIRCUIT_WASM_PATH = path.join(PROJECT_ROOT, "circuits", "build", "withdraw_js", "withdraw.wasm");
const ZKEY_PATH = path.join(PROJECT_ROOT, "circuits", "build", "withdraw_final.zkey");
const VERIFICATION_KEY_PATH = path.join(PROJECT_ROOT, "circuits", "build", "verification_key.json");

// Poseidon hash instance (initialized lazily)
let poseidon: any = null;

async function getPoseidon() {
  if (!poseidon) {
    poseidon = await buildPoseidon();
  }
  return poseidon;
}

export interface DepositCommitment {
  commitment: string; // bytes32 hex string
  nullifier: string; // bytes32 hex string
  nullifierKey: string; // Secret key for generating nullifier (hex)
  amount: string; // Amount in wei
  poolId: number;
  timestamp: number;
  recipientSecret?: string; // Secret for stealth address generation
  note: string; // Encoded secret note for client-side storage
}

export interface WithdrawalProof {
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

export class ZKProofService {
  // Backward compat: old flow stored commitments in-memory, which breaks after restarts.
  // New flow uses an encoded "note" that contains all secrets needed to regenerate proof inputs.
  private deposits: Map<string, DepositCommitment> = new Map();
  private circuit: any = null;
  private provingKey: any = null;
  private verifierKey: any = null;

  /**
   * Initialize the ZK proof system
   * Loads circuit artifacts if available, otherwise uses fallback mode
   */
  async initialize() {
    const hasCircuit = fs.existsSync(CIRCUIT_WASM_PATH) && fs.existsSync(ZKEY_PATH);
    
    if (hasCircuit) {
      console.log("ZK Proof Service initialized with real circuit artifacts");
      console.log(`Circuit WASM: ${CIRCUIT_WASM_PATH}`);
      console.log(`Proving Key: ${ZKEY_PATH}`);
      
      // Load verification key if available
      if (fs.existsSync(VERIFICATION_KEY_PATH)) {
        try {
          const vkeyData = fs.readFileSync(VERIFICATION_KEY_PATH, "utf-8");
          this.verifierKey = JSON.parse(vkeyData);
          console.log("Verification key loaded");
        } catch (error) {
          console.warn("Could not load verification key:", error);
        }
      }
    } else {
      console.warn("⚠️  ZK circuit artifacts not found!");
      console.warn("⚠️  Run 'npm run zk:setup' to generate circuit artifacts");
      console.warn("⚠️  Falling back to mock proof generation (NOT SECURE FOR PRODUCTION)");
    }
  }
  
  /**
   * Check if real circuit is available
   */
  private hasRealCircuit(): boolean {
    return fs.existsSync(CIRCUIT_WASM_PATH) && fs.existsSync(ZKEY_PATH);
  }

  /**
   * Hash data using Poseidon (ZK-friendly hash)
   */
  private async poseidonHash(inputs: bigint[]): Promise<bigint> {
    const poseidon = await getPoseidon();
    // Convert bigints to the format Poseidon expects
    const hashInputs = inputs.map(input => poseidon.F.e(input.toString()));
    const hash = poseidon(hashInputs);
    // Convert back to bigint
    return BigInt(poseidon.F.toString(hash));
  }

  /**
   * Convert hex string to bigint
   */
  private hexToBigInt(hex: string): bigint {
    return BigInt(hex.startsWith("0x") ? hex : `0x${hex}`);
  }

  /**
   * Convert bigint to hex string
   */
  private bigIntToHex(value: bigint): string {
    return `0x${value.toString(16).padStart(64, "0")}`;
  }

  /**
   * Create a commitment for a deposit
   * @param amount Deposit amount in wei
   * @param poolId Pool ID
   * @param depositorAddress Depositor address (not stored, only used for generation)
   * @returns Commitment data
   */
  async createCommitment(
    amount: string,
    poolId: number,
    depositorAddress: string
  ): Promise<DepositCommitment> {
    // Generate nullifier key (secret - 32 bytes)
    const nullifierKeyBytes = randomBytes(32);
    const nullifierKey = `0x${nullifierKeyBytes.toString("hex")}`;
    
    // Generate nullifier (hash of nullifier key using Poseidon)
    const nullifierKeyBigInt = this.hexToBigInt(nullifierKey);
    const nullifier = await this.poseidonHash([nullifierKeyBigInt, 0n]);
    
    // Generate recipient secret for stealth address (optional)
    const recipientSecretBytes = randomBytes(32);
    const recipientSecret = `0x${recipientSecretBytes.toString("hex")}`;
    
    // Create commitment (hash of nullifier + amount + poolId + timestamp)
    const timestamp = Math.floor(Date.now() / 1000); // Unix timestamp in seconds
    const amountBigInt = BigInt(amount);
    const poolIdBigInt = BigInt(poolId);
    const timestampBigInt = BigInt(timestamp);
    
    const commitment = await this.poseidonHash([
      nullifier,
      amountBigInt,
      poolIdBigInt,
      timestampBigInt,
      0n, // Padding
    ]);
    
    const depositCommitment: DepositCommitment = {
      commitment: this.bigIntToHex(commitment),
      nullifier: this.bigIntToHex(nullifier),
      nullifierKey,
      amount,
      poolId,
      timestamp,
      recipientSecret,
      note: "",
    };

    // Create a compact "secret note" that contains everything needed to regenerate proofs later.
    // Format: pm2:<base64url(JSON)>
    const notePayload = {
      v: 1,
      commitment: depositCommitment.commitment,
      nullifier: depositCommitment.nullifier,
      nullifierKey: depositCommitment.nullifierKey,
      amount: depositCommitment.amount,
      poolId: depositCommitment.poolId,
      timestamp: depositCommitment.timestamp,
      recipientSecret: depositCommitment.recipientSecret,
    };
    const json = JSON.stringify(notePayload);
    const b64 = Buffer.from(json, "utf8").toString("base64url");
    depositCommitment.note = `pm2:${b64}`;

    // Backward compat: keep in memory for same-session withdrawals, but do not rely on it.
    this.deposits.set(depositCommitment.commitment, depositCommitment);
    
    return depositCommitment;
  }

  private decodeNote(noteOrCommitment: string): DepositCommitment | null {
    if (noteOrCommitment.startsWith("pm2:")) {
      const b64 = noteOrCommitment.slice(4);
      const json = Buffer.from(b64, "base64url").toString("utf8");
      const parsed = JSON.parse(json);
      if (!parsed?.commitment || !parsed?.nullifier || !parsed?.nullifierKey) return null;
      return {
        commitment: parsed.commitment,
        nullifier: parsed.nullifier,
        nullifierKey: parsed.nullifierKey,
        amount: parsed.amount,
        poolId: parsed.poolId,
        timestamp: parsed.timestamp,
        recipientSecret: parsed.recipientSecret,
        note: noteOrCommitment,
      } as DepositCommitment;
    }
    return null;
  }

  async generateProofFromNoteOrCommitment(
    noteOrCommitment: string,
    recipient: string,
    amount: string,
    lockDuration: number
  ): Promise<WithdrawalProof> {
    const decoded = this.decodeNote(noteOrCommitment);
    if (decoded) {
      // Validate commitment matches the secrets (prevents tampering)
      const nullifierKeyBigInt = this.hexToBigInt(decoded.nullifierKey);
      const derivedNullifier = await this.poseidonHash([nullifierKeyBigInt, 0n]);
      const amountBigInt = BigInt(decoded.amount);
      const poolIdBigInt = BigInt(decoded.poolId);
      const timestampBigInt = BigInt(decoded.timestamp);
      const derivedCommitment = await this.poseidonHash([derivedNullifier, amountBigInt, poolIdBigInt, timestampBigInt, 0n]);
      const derivedCommitmentHex = this.bigIntToHex(derivedCommitment);
      if (derivedCommitmentHex.toLowerCase() !== decoded.commitment.toLowerCase()) {
        throw new Error("Invalid secret note (commitment mismatch).");
      }
      // Use decoded deposit data by temporarily caching it for generateProof()
      this.deposits.set(decoded.commitment, decoded);
      return await this.generateProof(decoded.commitment, recipient, amount, lockDuration);
    }

    // Fallback: old flow expects a commitment that exists in memory map
    return await this.generateProof(noteOrCommitment, recipient, amount, lockDuration);
  }

  /**
   * Generate stealth address from recipient secret and commitment
   */
  private async generateStealthAddress(
    recipientSecret: string,
    commitment: string
  ): Promise<string> {
    const secretBigInt = this.hexToBigInt(recipientSecret);
    const commitmentBigInt = this.hexToBigInt(commitment);
    const hash = await this.poseidonHash([secretBigInt, commitmentBigInt]);
    
    // Convert to Ethereum address (20 bytes)
    const addressBytes = hash.toString(16).slice(0, 40).padStart(40, "0");
    return `0x${addressBytes}`;
  }

  /**
   * Generate ZK proof for withdrawal
   * @param commitment Commitment hash
   * @param recipient Recipient address (or use stealth address)
   * @param amount Amount to withdraw
   * @param lockDuration Lock duration in seconds
   * @returns Proof data
   */
  async generateProof(
    commitment: string,
    recipient: string,
    amount: string,
    lockDuration: number
  ): Promise<WithdrawalProof> {
    const deposit = this.deposits.get(commitment);
    
    if (!deposit) {
      throw new Error("Commitment not found");
    }
    
    // Check if lock period has expired
    const currentTime = Math.floor(Date.now() / 1000);
    const elapsed = currentTime - deposit.timestamp;
    
    if (elapsed < lockDuration) {
      throw new Error(
        `Lock period not expired. Wait ${lockDuration - elapsed} more seconds.`
      );
    }
    
    // Prepare circuit inputs
    const nullifierKeyBigInt = this.hexToBigInt(deposit.nullifierKey);
    const amountBigInt = BigInt(amount);
    const poolIdBigInt = BigInt(deposit.poolId);
    const timestampBigInt = BigInt(deposit.timestamp);
    const recipientSecretBigInt = deposit.recipientSecret
      ? this.hexToBigInt(deposit.recipientSecret)
      : 0n;
    
    // Public inputs (must match contract: [nullifier, commitment, recipient, amount])
    const nullifierBigInt = this.hexToBigInt(deposit.nullifier);
    const commitmentBigInt = this.hexToBigInt(commitment);
    const recipientBigInt = this.hexToBigInt(recipient);
    
    // Circuit input format (matches withdraw.circom)
    const circuitInput = {
      // Private inputs
      nullifierKey: nullifierKeyBigInt.toString(),
      poolId: poolIdBigInt.toString(),
      timestamp: timestampBigInt.toString(),
      recipientSecret: recipientSecretBigInt.toString(),
      // Public inputs (these will be in publicSignals)
      nullifier: nullifierBigInt.toString(),
      commitment: commitmentBigInt.toString(),
      recipient: recipientBigInt.toString(),
      amount: amountBigInt.toString(),
    };
    
    let proofResult: { proof: any; publicSignals: string[] };
    
    // Use real circuit if available, otherwise fallback to mock
    if (this.hasRealCircuit()) {
      try {
        // Generate real Groth16 proof using snarkjs
        proofResult = await snarkjs.groth16.fullProve(
          circuitInput,
          CIRCUIT_WASM_PATH,
          ZKEY_PATH
        );
        
        // Verify public signals match expected format
        // Expected: [nullifier, commitment, recipient, amount]
        if (proofResult.publicSignals.length !== 4) {
          throw new Error(`Expected 4 public signals, got ${proofResult.publicSignals.length}`);
        }
        
        // Verify public signals match our inputs
        if (proofResult.publicSignals[0] !== nullifierBigInt.toString()) {
          throw new Error("Public signal nullifier mismatch");
        }
        if (proofResult.publicSignals[1] !== commitmentBigInt.toString()) {
          throw new Error("Public signal commitment mismatch");
        }
        // Note: recipient is converted to uint160 in contract, so we check the bigint value
        if (proofResult.publicSignals[2] !== recipientBigInt.toString()) {
          throw new Error("Public signal recipient mismatch");
        }
        if (proofResult.publicSignals[3] !== amountBigInt.toString()) {
          throw new Error("Public signal amount mismatch");
        }
        
        console.log("✅ Real ZK proof generated successfully");
      } catch (error: any) {
        console.error("❌ Failed to generate real ZK proof:", error.message);
        throw new Error(`ZK proof generation failed: ${error.message}`);
      }
    } else {
      // Fallback to mock proof (for development/testing only)
      console.warn("⚠️  Using mock proof generation (NOT SECURE)");
      proofResult = await this.generateSimplifiedProof(circuitInput);
    }
    
    // Format proof for contract (Groth16 format)
    // snarkjs returns pi_b in format [[x1, y1], [x2, y2]]
    // Contract expects [[x1, y1], [x2, y2]] but encoded as uint256[2][2]
    // Note: pi_b needs to be transposed for Solidity (swap x/y coordinates)
    const formattedProof: WithdrawalProof["proof"] = {
      pi_a: [
        proofResult.proof.pi_a[0],
        proofResult.proof.pi_a[1],
        "1" // Third element is always 1 for Groth16
      ] as [string, string, string],
      pi_b: [
        [proofResult.proof.pi_b[0][1], proofResult.proof.pi_b[0][0]], // Transpose: swap x/y
        [proofResult.proof.pi_b[1][1], proofResult.proof.pi_b[1][0]], // Transpose: swap x/y
        ["1", "0"] // Third element (not used in contract but kept for compatibility)
      ] as [[string, string], [string, string], [string, string]],
      pi_c: [
        proofResult.proof.pi_c[0],
        proofResult.proof.pi_c[1],
        "1" // Third element
      ] as [string, string, string],
      protocol: proofResult.proof.protocol || "groth16",
      curve: proofResult.proof.curve || "bn128",
    };
    
    const withdrawalProof: WithdrawalProof = {
      proof: formattedProof,
      publicSignals: proofResult.publicSignals,
      nullifier: deposit.nullifier,
      commitment: deposit.commitment,
      recipient,
      amount,
    };
    
    return withdrawalProof;
  }

  /**
   * Generate a simplified proof (for development/testing only)
   * This is a fallback when real circuit artifacts are not available
   * WARNING: This does NOT provide real cryptographic security
   */
  private async generateSimplifiedProof(input: any): Promise<{
    proof: any;
    publicSignals: string[];
  }> {
    // Verify the witness values are correct using Poseidon
    const nullifierKeyBigInt = BigInt(input.nullifierKey);
    const nullifier = await this.poseidonHash([nullifierKeyBigInt, 0n]);
    
    if (nullifier.toString() !== input.nullifier) {
      throw new Error("Invalid nullifier");
    }
    
    const commitment = await this.poseidonHash([
      BigInt(input.nullifier),
      BigInt(input.amount),
      BigInt(input.poolId),
      BigInt(input.timestamp),
      0n,
    ]);
    
    if (commitment.toString() !== BigInt(input.commitment).toString()) {
      throw new Error("Invalid commitment");
    }
    
    // Generate mock proof structure (NOT CRYPTOGRAPHICALLY SECURE)
    // This is only for development when circuit artifacts are missing
    const proof = {
      pi_a: [
        `0x${randomBytes(32).toString("hex")}`,
        `0x${randomBytes(32).toString("hex")}`,
        "1",
      ],
      pi_b: [
        [
          `0x${randomBytes(32).toString("hex")}`,
          `0x${randomBytes(32).toString("hex")}`,
        ],
        [
          `0x${randomBytes(32).toString("hex")}`,
          `0x${randomBytes(32).toString("hex")}`,
        ],
        ["1", "0"],
      ],
      pi_c: [
        `0x${randomBytes(32).toString("hex")}`,
        `0x${randomBytes(32).toString("hex")}`,
        "1",
      ],
      protocol: "groth16",
      curve: "bn128",
    };
    
    // Public signals: [nullifier, commitment, recipient, amount]
    const publicSignals = [
      input.nullifier,
      input.commitment,
      input.recipient,
      input.amount,
    ];
    
    return { proof, publicSignals };
  }

  /**
   * Get lock duration for a pool
   */
  private getLockDuration(poolId: number): number {
    const durations: Record<number, number> = {
      0: 3600,   // 1 hour (3600 seconds)
      1: 14400,  // 4 hours
      2: 86400,  // 24 hours
    };
    return durations[poolId] || 3600; // Default to 1 hour
  }

  /**
   * Get commitment data
   */
  getCommitment(commitment: string): DepositCommitment | undefined {
    return this.deposits.get(commitment);
  }

  /**
   * Remove commitment after withdrawal
   */
  removeCommitment(commitment: string): void {
    this.deposits.delete(commitment);
  }

  /**
   * Verify a proof (for testing)
   */
  async verifyProof(proof: WithdrawalProof): Promise<boolean> {
    if (!this.verifierKey) {
      // Fallback: just check structure
      return (
        proof.proof.pi_a.length === 3 &&
        proof.proof.pi_b.length === 3 &&
        proof.proof.pi_c.length === 3 &&
        proof.publicSignals.length === 4
      );
    }
    
    try {
      // Use real verification if key is available
      const verified = await snarkjs.groth16.verify(
        this.verifierKey,
        proof.publicSignals,
        {
          pi_a: proof.proof.pi_a.slice(0, 2),
          pi_b: proof.proof.pi_b.slice(0, 2).map((pair: string[]) => [pair[1], pair[0]]),
          pi_c: proof.proof.pi_c.slice(0, 2),
        }
      );
      return verified;
    } catch (error) {
      console.error("Proof verification error:", error);
      return false;
    }
  }
}

// Export singleton instance
export const zkProofService = new ZKProofService();

// Initialize on import
zkProofService.initialize().catch(console.error);
