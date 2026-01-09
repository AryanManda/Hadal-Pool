import { type User, type InsertUser, type Deposit, type InsertDeposit, type PoolStats, type InsertPoolStats } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Deposit operations
  getDeposit(id: string): Promise<Deposit | undefined>;
  getDepositsByAddress(address: string): Promise<Deposit[]>;
  createDeposit(deposit: InsertDeposit): Promise<Deposit>;
  processWithdrawal(depositId: string, withdrawAddress: string, useRelayer: boolean): Promise<Deposit>;
  
  // Pool statistics
  getPoolStats(): Promise<PoolStats>;
  updatePoolStats(update: {
    currency: string;
    liquidityChange: number;
    anonymitySetChange: number;
    feeAmount: number;
  }): Promise<void>;
  
  // Reset
  reset(): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private deposits: Map<string, Deposit>;
  private poolStats: Map<string, PoolStats>; // Track stats per currency

  constructor() {
    this.users = new Map();
    this.deposits = new Map();
    this.poolStats = new Map();
    
    // Initialize pool stats for different currencies
    this.poolStats.set("ETH", {
      id: randomUUID(),
      currency: "ETH",
      totalLiquidity: "124.5",
      anonymitySetSize: 47,
      privacyFundBalance: "2.34",
      updatedAt: new Date(),
    });
    
    this.poolStats.set("USDC", {
      id: randomUUID(),
      currency: "USDC",
      totalLiquidity: "45000",
      anonymitySetSize: 23,
      privacyFundBalance: "135",
      updatedAt: new Date(),
    });
    
    this.poolStats.set("WBTC", {
      id: randomUUID(),
      currency: "WBTC",
      totalLiquidity: "2.5",
      anonymitySetSize: 12,
      privacyFundBalance: "0.075",
      updatedAt: new Date(),
    });
    
    this.poolStats.set("USDT", {
      id: randomUUID(),
      currency: "USDT",
      totalLiquidity: "38000",
      anonymitySetSize: 18,
      privacyFundBalance: "114",
      updatedAt: new Date(),
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getDeposit(id: string): Promise<Deposit | undefined> {
    return this.deposits.get(id);
  }

  async getDepositsByAddress(address: string): Promise<Deposit[]> {
    return Array.from(this.deposits.values()).filter(
      (deposit) => deposit.userAddress.toLowerCase() === address.toLowerCase()
    );
  }

  async createDeposit(insertDeposit: InsertDeposit): Promise<Deposit> {
    const id = randomUUID();
    const deposit: Deposit = {
      id,
      userAddress: insertDeposit.userAddress,
      currency: insertDeposit.currency || "ETH",
      amount: insertDeposit.amount,
      transactionHash: insertDeposit.transactionHash,
      lockDuration: insertDeposit.lockDuration || 86400,
      depositTime: new Date(),
      isWithdrawn: false,
      withdrawnAt: null,
      withdrawAddress: null,
    };
    this.deposits.set(id, deposit);
    return deposit;
  }

  async processWithdrawal(depositId: string, withdrawAddress: string, useRelayer: boolean): Promise<Deposit> {
    const deposit = this.deposits.get(depositId);
    if (!deposit) {
      throw new Error("Deposit not found");
    }

    const updatedDeposit: Deposit = {
      ...deposit,
      isWithdrawn: true,
      withdrawnAt: new Date(),
      withdrawAddress,
    };

    this.deposits.set(depositId, updatedDeposit);
    return updatedDeposit;
  }

  async getPoolStats(currency?: string): Promise<PoolStats> {
    // If currency specified, return stats for that currency
    if (currency) {
      const stats = this.poolStats.get(currency);
      if (stats) return stats;
    }
    // Default to ETH if no currency specified or not found
    return this.poolStats.get("ETH") || {
      id: randomUUID(),
      currency: "ETH",
      totalLiquidity: "0",
      anonymitySetSize: 0,
      privacyFundBalance: "0",
      updatedAt: new Date(),
    };
  }

  async updatePoolStats(update: {
    currency: string;
    liquidityChange: number;
    anonymitySetChange: number;
    feeAmount: number;
  }): Promise<void> {
    // Get or create stats for this currency
    let stats = this.poolStats.get(update.currency);
    if (!stats) {
      stats = {
        id: randomUUID(),
        currency: update.currency,
        totalLiquidity: "0",
        anonymitySetSize: 0,
        privacyFundBalance: "0",
        updatedAt: new Date(),
      };
    }

    const currentLiquidity = parseFloat(stats.totalLiquidity);
    const currentFund = parseFloat(stats.privacyFundBalance);

    const updatedStats: PoolStats = {
      ...stats,
      totalLiquidity: (currentLiquidity + update.liquidityChange).toFixed(8),
      anonymitySetSize: Math.max(0, stats.anonymitySetSize + update.anonymitySetChange),
      privacyFundBalance: (currentFund + update.feeAmount).toFixed(8),
      updatedAt: new Date(),
    };

    this.poolStats.set(update.currency, updatedStats);
  }

  // Reset all test data
  async reset(): Promise<void> {
    this.deposits.clear();
    this.users.clear();
    // Reset pool stats to initial state for all currencies
    this.poolStats.clear();
    this.poolStats.set("ETH", {
      id: randomUUID(),
      currency: "ETH",
      totalLiquidity: "124.5",
      anonymitySetSize: 47,
      privacyFundBalance: "2.34",
      updatedAt: new Date(),
    });
    this.poolStats.set("USDC", {
      id: randomUUID(),
      currency: "USDC",
      totalLiquidity: "45000",
      anonymitySetSize: 23,
      privacyFundBalance: "135",
      updatedAt: new Date(),
    });
    this.poolStats.set("WBTC", {
      id: randomUUID(),
      currency: "WBTC",
      totalLiquidity: "2.5",
      anonymitySetSize: 12,
      privacyFundBalance: "0.075",
      updatedAt: new Date(),
    });
    this.poolStats.set("USDT", {
      id: randomUUID(),
      currency: "USDT",
      totalLiquidity: "38000",
      anonymitySetSize: 18,
      privacyFundBalance: "114",
      updatedAt: new Date(),
    });
  }
}

export const storage = new MemStorage();
