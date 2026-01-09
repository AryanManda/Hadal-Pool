// client/src/lib/contract-service.ts
import { ethers } from "ethers";
import { CONTRACT_ADDRESSES, CONTRACT_ABI, POOL_IDS, type PoolId } from "./contracts";

export class ContractService {
  private provider: ethers.Provider;
  private contract!: ethers.Contract; // Initialized in initialize()
  private signer: ethers.Signer | null = null;

  private contractAddress: string = "";
  private initialized: boolean = false;
  
  // Expose contract for event parsing
  getContract(): ethers.Contract {
    return this.contract;
  }

  constructor(provider: ethers.Provider, signer?: ethers.Signer) {
    this.provider = provider;
    this.signer = signer || null;
    // Contract will be initialized on first use
  }

  private async initialize(): Promise<void> {
    if (this.initialized) return;
    
    // Get contract address based on network
    const network = await this.getNetworkName();
    const contractAddress = CONTRACT_ADDRESSES[network as keyof typeof CONTRACT_ADDRESSES];
    
      if (!contractAddress) {
        // Provide helpful error message based on detected network
        if (network === "mainnet") {
          throw new Error(
            "Contract not deployed on Ethereum Mainnet. " +
            "Please deploy the contract to Mainnet first, or switch to Sepolia testnet (Chain ID: 11155111) for testing."
          );
        } else if (network === "sepolia") {
          throw new Error(
            "Contract not deployed on Sepolia testnet. " +
            "Please deploy the contract to Sepolia first. " +
            "See SEPOLIA_DEPLOYMENT_GUIDE.md for instructions."
          );
        } else if (network === "arbitrum") {
          throw new Error(
            "Contract not deployed on Arbitrum One. " +
            "Please deploy the contract to Arbitrum (Chain ID: 42161) first."
          );
        } else if (network === "arbitrumSepolia") {
          throw new Error(
            "Contract not deployed on Arbitrum Sepolia testnet. " +
            "Please deploy the contract to Arbitrum Sepolia (Chain ID: 421614) first."
          );
        } else {
          throw new Error(`Contract not deployed on ${network}. Please switch to a supported network.`);
        }
      }

    this.contractAddress = contractAddress;
    
    // Verify contract exists at this address before creating contract instance
    try {
      const code = await this.provider.getCode(contractAddress);
      if (code === "0x" || code === "0x0") {
        const networkInfo = await this.provider.getNetwork();
        throw new Error(
          `No contract found at address ${contractAddress} on network ${networkInfo.name} (Chain ID: ${networkInfo.chainId}). ` +
          `Please ensure:\n` +
          `1. The contract is deployed to this network\n` +
          `2. You're connected to the correct network in MetaMask\n` +
          `3. The contract address is correct for this network`
        );
      }
    } catch (codeError: any) {
      // If getCode fails, it might be a network issue
      if (codeError.message?.includes("No contract found")) {
        throw codeError;
      }
      console.warn("Could not verify contract code during initialization:", codeError);
    }
    
    this.contract = new ethers.Contract(contractAddress, CONTRACT_ABI, this.signer || this.provider);
    this.initialized = true;
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  private async getNetworkName(): Promise<string> {
    try {
      const network = await this.provider.getNetwork();
      // Chain ID 1 = mainnet, 11155111 = sepolia, 42161 = arbitrum, 421614 = arbitrumSepolia
      if (network.chainId === 1n) return "mainnet";
      if (network.chainId === 11155111n) return "sepolia";
      if (network.chainId === 42161n) return "arbitrum";
      if (network.chainId === 421614n) return "arbitrumSepolia";
      // Unsupported network
      throw new Error(`Unsupported network with Chain ID: ${network.chainId}. Please switch to Sepolia (Chain ID: 11155111), Mainnet (Chain ID: 1), Arbitrum (Chain ID: 42161), or Arbitrum Sepolia (Chain ID: 421614).`);
    } catch (error: any) {
      if (error.message?.includes("Unsupported network")) {
        throw error;
      }
      throw new Error("Could not detect network. Please ensure you're connected to a supported network.");
    }
  }

  /**
   * Generate a new address for the user
   */
  async generateAddress(): Promise<string> {
    await this.ensureInitialized();
    
    if (!this.signer) {
      throw new Error("Signer required for generating address");
    }

    const tx = await this.contract.generateAddress();
    await tx.wait();
    
    return await this.contract.getMyGeneratedAddress();
  }

  /**
   * Deposit funds into a pool
   */
  async deposit(poolId: PoolId, amount: string): Promise<ethers.TransactionReceipt> {
    await this.ensureInitialized();
    
    if (!this.signer) {
      throw new Error("Signer required for deposits");
    }

    // Step 1: Check if contract exists at the address
    try {
      const code = await this.provider.getCode(this.contractAddress);
      if (code === "0x" || code === "0x0") {
        throw new Error(
          `No contract found at address ${this.contractAddress}. ` +
          `Please ensure the contract is deployed. If using Hardhat, run 'npx hardhat node' and deploy the contract.`
        );
      }
    } catch (codeError: any) {
      if (codeError.message?.includes("No contract found")) {
        throw codeError;
      }
      console.warn("Could not check contract code:", codeError);
    }

    // Step 2: Check if contract is initialized by trying to read totalPools first
    // This is a simpler check that will fail if contract isn't initialized
    let totalPools: bigint;
    try {
      totalPools = await this.contract.totalPools();
      console.log("Contract initialized - Total pools:", totalPools.toString());
    } catch (initError: any) {
      // If totalPools() fails, contract is likely not initialized
      const network = await this.provider.getNetwork();
      throw new Error(
        `Contract at ${this.contractAddress} appears to not be initialized.\n\n` +
        `To fix this:\n` +
        `1. Make sure Hardhat node is running: npx hardhat node\n` +
        `2. Deploy and initialize the contract: npx hardhat run scripts/deploy.cjs --network hardhat\n` +
        `3. Verify the contract address matches: ${this.contractAddress}\n` +
        `4. Make sure you're connected to the correct network (Chain ID: ${network.chainId})\n\n` +
        `If the contract was just deployed, wait a moment for the transaction to be mined.`
      );
    }

    // Step 3: Check if contract is paused
    try {
      const isPaused = await this.contract.paused();
      if (isPaused) {
        throw new Error("Contract is paused. Deposits are currently disabled.");
      }
    } catch (pauseError: any) {
      // If paused() call fails after totalPools() succeeded, it's a different issue
      if (pauseError.message?.includes("Contract is paused")) {
        throw pauseError;
      }
      console.warn("Could not check paused status:", pauseError);
      // Continue anyway - paused() might not be available in older contract versions
    }
    
    // Step 4: Validate pool ID and pool state
    try {
      if (totalPools === 0n) {
        throw new Error("Contract has no pools. The contract may not be initialized correctly.");
      }
      if (poolId >= totalPools) {
        throw new Error(`Invalid pool ID: ${poolId}. Contract has ${totalPools.toString()} pools (IDs 0-${(totalPools - 1n).toString()}).`);
      }
      
      // Check if the specific pool is active
      const poolInfo = await this.contract.getPoolInfo(poolId);
      if (!poolInfo.active) {
        throw new Error(`Pool ${poolId} is not active. Please select a different pool.`);
      }
      
      // Check if amount exceeds max deposit
      const amountWei = ethers.parseEther(amount);
      if (amountWei > poolInfo.maxDeposit) {
        throw new Error(
          `Deposit amount (${amount} ETH) exceeds maximum deposit for this pool (${ethers.formatEther(poolInfo.maxDeposit)} ETH).`
        );
      }
      
      // Check minimum deposit (0.1 ETH)
      if (amountWei < ethers.parseEther("0.1")) {
        throw new Error("Minimum deposit is 0.1 ETH.");
      }
    } catch (poolError: any) {
      // Don't catch initialization errors here - they're already handled above
      if (poolError.message?.includes("Contract has no pools") || 
          poolError.message?.includes("Invalid pool ID") ||
          poolError.message?.includes("not active") ||
          poolError.message?.includes("exceeds maximum") ||
          poolError.message?.includes("Minimum deposit")) {
        throw poolError;
      }
      // For other errors, provide helpful context
      if (poolError.code === "BAD_DATA" || poolError.code === "CALL_EXCEPTION") {
        throw new Error(
          `Cannot read pool information. The contract may not be fully initialized.\n` +
          `Contract address: ${this.contractAddress}\n` +
          `Try redeploying: npx hardhat run scripts/deploy.cjs --network hardhat`
        );
      }
      throw poolError;
    }

    // Step 4: Check user balance before attempting deposit
    try {
      const userAddress = await this.signer.getAddress();
      const balance = await this.provider.getBalance(userAddress);
      const amountWei = ethers.parseEther(amount);
      const estimatedGas = 200000n; // Estimate gas for deposit
      const gasPrice = await this.provider.getFeeData();
      const estimatedGasCost = gasPrice.gasPrice ? estimatedGas * gasPrice.gasPrice : 0n;
      
      if (balance < amountWei + estimatedGasCost) {
        const balanceEth = ethers.formatEther(balance);
        const neededEth = ethers.formatEther(amountWei + estimatedGasCost);
        throw new Error(
          `Insufficient balance. You need ${neededEth} ETH (${amount} ETH deposit + gas fees). ` +
          `Your balance: ${balanceEth} ETH`
        );
      }
    } catch (balanceError: any) {
      if (balanceError.message?.includes("Insufficient balance")) {
        throw balanceError;
      }
      console.warn("Could not check balance:", balanceError);
    }

    // Step 5: Simulate the deposit to check if it will succeed
    try {
      await this.contract.deposit.staticCall(poolId, {
        value: ethers.parseEther(amount)
      });
    } catch (simError: any) {
      // Try to extract meaningful error message
      let errorMsg = "Unknown error";
      
      // Check for common error patterns
      if (simError.reason) {
        errorMsg = simError.reason;
      } else if (simError.data) {
        // Try to decode the error data
        try {
          const decoded = this.contract.interface.parseError(simError.data);
          if (decoded) {
            errorMsg = decoded.name + ": " + (decoded.args.join(", ") || "");
          } else {
            errorMsg = `Contract revert: ${simError.data}`;
          }
        } catch {
          errorMsg = `Contract revert: ${simError.data}`;
        }
      } else if (simError.message) {
        errorMsg = simError.message;
      }
      
      // Provide helpful context
      if (errorMsg.includes("missing revert data") || errorMsg.includes("CALL_EXCEPTION")) {
        throw new Error(
          `Deposit simulation failed. This usually means:\n` +
          `1. The contract is not deployed at ${this.contractAddress}\n` +
          `2. The contract is not initialized\n` +
          `3. Insufficient balance (need ${amount} ETH + gas fees)\n` +
          `4. Pool requirements not met (minimum 0.1 ETH, check max deposit)\n\n` +
          `Please verify the contract is deployed and you have sufficient balance.`
        );
      }
      
      throw new Error(`Deposit simulation failed: ${errorMsg}. Please check your balance and the pool requirements.`);
    }

    const tx = await this.contract.deposit(poolId, {
      value: ethers.parseEther(amount)
    });
    
    const receipt = await tx.wait();
    
    // Decode the transaction to verify what was actually called
    try {
      const decoded = this.contract.interface.parseTransaction({
        data: tx.data,
        value: tx.value
      });
      console.log("Decoded deposit transaction:", decoded);
      console.log("Transaction to:", receipt.to);
      console.log("Transaction from:", receipt.from);
    } catch (decodeError) {
      console.warn("Could not decode transaction:", decodeError);
    }
    
    // Verify the Deposit event was emitted
    const depositEvent = receipt.logs.find((log: any) => {
      try {
        const parsed = this.contract.interface.parseLog(log);
        return parsed?.name === "Deposit";
      } catch {
        return false;
      }
    });
    
    if (!depositEvent) {
      console.error("No deposit event found in transaction logs!");
      console.error("Transaction logs:", receipt.logs);
      console.error("Contract address:", this.contractAddress);
      console.error("Transaction to:", receipt.to);
      
      // Check if we're calling the right contract
      if (receipt.to?.toLowerCase() !== this.contractAddress.toLowerCase()) {
        throw new Error(`Transaction was sent to wrong contract! Expected: ${this.contractAddress}, Got: ${receipt.to}`);
      }
      
      throw new Error("Deposit transaction succeeded but no Deposit event was emitted. The funds may not have been deposited. Please check the transaction on the blockchain.");
    }
    
    console.log("Deposit event found:", depositEvent);
    return receipt;
  }

  /**
   * Withdraw funds to an address
   */
  async withdraw(to: string, amount: string): Promise<ethers.TransactionReceipt> {
    await this.ensureInitialized();
    
    if (!this.signer) {
      throw new Error("Signer required for withdrawals");
    }

    // Try to withdraw - let the contract enforce all checks
    // If it fails, we'll get a clear error message
    const tx = await this.contract.withdraw(to, ethers.parseEther(amount));
    const receipt = await tx.wait();
    
    // PRIVACY: Withdrawal events are intentionally NOT emitted for privacy
    // We verify withdrawal success by checking transaction status and balance changes
    // No need to check for withdrawal event since we removed it from the contract
    
    // Verify transaction was successful
    if (receipt.status !== 1) {
      throw new Error(`Withdrawal transaction failed with status: ${receipt.status}`);
    }
    
    // Verify we're calling the right contract
    if (receipt.to?.toLowerCase() !== this.contractAddress.toLowerCase()) {
      throw new Error(`Transaction was sent to wrong contract! Expected: ${this.contractAddress}, Got: ${receipt.to}`);
    }
    
    console.log("Withdrawal transaction successful (no event check - privacy feature)");
    return receipt;
  }

  /**
   * Check if user can withdraw
   */
  async canWithdraw(userAddress: string): Promise<boolean> {
    await this.ensureInitialized();
    return await this.contract.canWithdraw(userAddress);
  }

  /**
   * Get user's generated address
   */
  async getGeneratedAddress(userAddress: string): Promise<string> {
    await this.ensureInitialized();
    return await this.contract.userToGeneratedAddress(userAddress);
  }

  /**
   * Check if user has generated address
   */
  async hasGeneratedAddress(userAddress: string): Promise<boolean> {
    await this.ensureInitialized();
    return await this.contract.addressGenerated(userAddress);
  }

  /**
   * Get pool information
   */
  async getPoolInfo(poolId: PoolId) {
    await this.ensureInitialized();
    const pool = await this.contract.getPoolInfo(poolId);
    return {
      lockDuration: Number(pool.lockDuration),
      maxDeposit: ethers.formatEther(pool.maxDeposit),
      feeRate: Number(pool.feeRate),
      active: pool.active,
      totalDeposits: ethers.formatEther(pool.totalDeposits),
    };
  }

  /**
   * Get user deposit information
   */
  async getUserDepositInfo(userAddress: string) {
    await this.ensureInitialized();
    const info = await this.contract.getUserDepositInfo(userAddress);
    return {
      depositAmount: ethers.formatEther(info.depositAmount),
      depositTime: Number(info.depositTime),
      canWithdrawNow: info.canWithdrawNow,
    };
  }

  /**
   * Get contract address
   */
  getContractAddress(): string {
    return this.contractAddress;
  }

  /**
   * Get total number of pools
   */
  async getTotalPools(): Promise<number> {
    await this.ensureInitialized();
    return Number(await this.contract.totalPools());
  }

  /**
   * Check if contract is paused
   */
  async isPaused(): Promise<boolean> {
    await this.ensureInitialized();
    return await this.contract.paused();
  }

  /**
   * Get contract owner
   */
  async getOwner(): Promise<string> {
    await this.ensureInitialized();
    return await this.contract.owner();
  }

  /**
   * Listen to events
   */
  async on(eventName: string, callback: (...args: any[]) => void) {
    await this.ensureInitialized();
    this.contract.on(eventName, callback);
  }

  /**
   * Remove event listeners
   */
  async off(eventName: string, callback: (...args: any[]) => void) {
    await this.ensureInitialized();
    this.contract.off(eventName, callback);
  }
}

// Export pool IDs for convenience
export { POOL_IDS, type PoolId };
