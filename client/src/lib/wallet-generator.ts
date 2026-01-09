import { ethers } from 'ethers';

export interface GeneratedWallet {
  address: string;
  privateKey: string;
  mnemonic: string;
}

export class WalletGenerator {
  /**
   * Generate a new Ethereum wallet with mnemonic phrase
   */
  static generateWallet(): GeneratedWallet {
    const wallet = ethers.Wallet.createRandom();
    
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic: wallet.mnemonic?.phrase || '',
    };
  }

  /**
   * Generate a wallet from an existing mnemonic
   */
  static fromMnemonic(mnemonic: string): GeneratedWallet {
    const wallet = ethers.Wallet.fromPhrase(mnemonic);
    
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic: mnemonic,
    };
  }

  /**
   * Validate if an address is a valid Ethereum address
   */
  static isValidAddress(address: string): boolean {
    try {
      return ethers.isAddress(address);
    } catch {
      return false;
    }
  }

  /**
   * Format address for display (first 6 and last 4 characters)
   */
  static formatAddress(address: string): string {
    if (!this.isValidAddress(address)) return 'Invalid Address';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  /**
   * Check if a wallet has sufficient ETH for gas fees
   * This is a mock implementation - in production you'd check actual balance
   */
  static async hasSufficientGas(address: string): Promise<boolean> {
    // Mock implementation - in production, you'd check actual ETH balance
    // For now, we'll assume new wallets don't have ETH
    return false;
  }

  /**
   * Estimate gas cost for a withdrawal transaction
   */
  static estimateGasCost(): string {
    // Mock gas estimation - in production, you'd get real gas prices
    return '0.001'; // Estimated gas cost in ETH
  }
}
