// ERC20 Token Service for USDC and other tokens
import { ethers } from "ethers";

// Standard ERC20 ABI (minimal)
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
];

// Common token addresses (you may need to adjust these for your network)
const TOKEN_ADDRESSES: Record<string, Record<string, string>> = {
  // Mainnet
  mainnet: {
    USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    WBTC: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", // Wrapped Bitcoin (WBTC)
  },
  // Sepolia Testnet
  sepolia: {
    USDC: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // Sepolia USDC
    USDT: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // Sepolia USDT (same as USDC)
    WBTC: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // Sepolia WBTC (may need actual testnet WBTC address)
  },
  // Arbitrum One (Mainnet)
  arbitrum: {
    USDC: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // Arbitrum USDC
    USDT: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", // Arbitrum USDT
    WBTC: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f", // Arbitrum WBTC
  },
  // Arbitrum Sepolia (Testnet)
  arbitrumSepolia: {
    USDC: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d", // Arbitrum Sepolia USDC
    USDT: "0xEf54C221Fc94517877F0F40eCd71E0A3866D66C2", // Arbitrum Sepolia USDT
    WBTC: "0x29f2D40B0605204364af54EC677bD022dA425d03", // Arbitrum Sepolia WBTC (approximate)
  },
};

export class ERC20Service {
  private provider: ethers.Provider;
  private signer: ethers.Signer | null;
  private tokenSymbol: string;
  private tokenAddress: string = "";
  private tokenContract!: ethers.Contract;
  private decimals: number = 6; // USDC has 6 decimals
  private initialized: boolean = false;

  constructor(provider: ethers.Provider, tokenSymbol: string, signer?: ethers.Signer) {
    this.provider = provider;
    this.signer = signer || null;
    this.tokenSymbol = tokenSymbol;
  }

  private async getNetworkName(): Promise<string> {
    try {
      const network = await this.provider.getNetwork();
      // Chain ID 1 = mainnet, 11155111 = sepolia, 42161 = arbitrum, 421614 = arbitrumSepolia
      if (network.chainId === 1n) return "mainnet";
      if (network.chainId === 11155111n) return "sepolia";
      if (network.chainId === 42161n) return "arbitrum";
      if (network.chainId === 421614n) return "arbitrumSepolia";
      throw new Error(`Unsupported network with Chain ID: ${network.chainId}. Please switch to Sepolia (Chain ID: 11155111), Mainnet (Chain ID: 1), Arbitrum (Chain ID: 42161), or Arbitrum Sepolia (Chain ID: 421614).`);
    } catch (error: any) {
      if (error.message?.includes("Unsupported network")) {
        throw error;
      }
      throw new Error("Could not detect network. Please ensure you're connected to Sepolia or Mainnet.");
    }
  }

  private async initialize(): Promise<void> {
    if (this.initialized) return;
    
    const networkName = await this.getNetworkName();
    const tokenAddr = TOKEN_ADDRESSES[networkName]?.[this.tokenSymbol] || TOKEN_ADDRESSES.hardhat[this.tokenSymbol];
    
    if (!tokenAddr) {
      throw new Error(`Token ${this.tokenSymbol} not configured for network ${networkName}. Please add the token address for ${networkName} network.`);
    }

    this.tokenAddress = tokenAddr;
    this.tokenContract = new ethers.Contract(this.tokenAddress, ERC20_ABI, this.signer || this.provider);
    
    // Try to get decimals, but don't fail if it doesn't work
    try {
      await this.getDecimals();
    } catch (error) {
      console.warn(`Could not fetch decimals for ${this.tokenSymbol}, using default`);
    }
    
    this.initialized = true;
  }

  async getBalance(address: string): Promise<string> {
    if (!this.initialized) {
      await this.initialize();
    }
    const balance = await this.tokenContract.balanceOf(address);
    return ethers.formatUnits(balance, this.decimals);
  }

  async getDecimals(): Promise<number> {
    if (!this.initialized) {
      await this.initialize();
    }
    try {
      const decimals = await this.tokenContract.decimals();
      this.decimals = Number(decimals);
      return this.decimals;
    } catch {
      // Default to 6 for USDC/USDT, 8 for WBTC, 18 for most other tokens
      this.decimals = this.tokenSymbol === "USDC" || this.tokenSymbol === "USDT" ? 6 : 
                      this.tokenSymbol === "WBTC" ? 8 : 18;
      return this.decimals;
    }
  }

  async transfer(to: string, amount: string): Promise<ethers.TransactionReceipt> {
    if (!this.signer) {
      throw new Error("Signer required for transfers");
    }

    if (!this.initialized) {
      await this.initialize();
    }
    
    // Parse amount with correct decimals
    const amountInUnits = ethers.parseUnits(amount, this.decimals);
    
    // Transfer tokens
    const tx = await this.tokenContract.transfer(to, amountInUnits);
    return await tx.wait();
  }

  async approve(spender: string, amount: string): Promise<ethers.TransactionReceipt> {
    if (!this.signer) {
      throw new Error("Signer required for approvals");
    }

    await this.getDecimals();
    const amountInUnits = ethers.parseUnits(amount, this.decimals);
    
    const tx = await this.tokenContract.approve(spender, amountInUnits);
    return await tx.wait();
  }

  async checkAllowance(owner: string, spender: string): Promise<string> {
    const allowance = await this.tokenContract.allowance(owner, spender);
    return ethers.formatUnits(allowance, this.decimals);
  }
}

