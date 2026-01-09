import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDepositSchema, insertPoolStatsSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get pool statistics
  app.get("/api/pool-stats", async (req, res) => {
    try {
      const currency = req.query.currency as string | undefined;
      const stats = await storage.getPoolStats(currency);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pool statistics" });
    }
  });
  
  // Get all pool statistics (for all currencies)
  app.get("/api/pool-stats/all", async (req, res) => {
    try {
      const currencies = ["ETH", "USDC", "WBTC", "USDT"];
      const allStats = await Promise.all(
        currencies.map(currency => storage.getPoolStats(currency))
      );
      res.json(allStats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pool statistics" });
    }
  });

  // Get user deposits
  app.get("/api/deposits/:address", async (req, res) => {
    try {
      const { address } = req.params;
      const deposits = await storage.getDepositsByAddress(address);
      res.json(deposits);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch deposits" });
    }
  });

  // Create new deposit
  app.post("/api/deposits", async (req, res) => {
    try {
      const depositData = insertDepositSchema.parse(req.body);
      const deposit = await storage.createDeposit(depositData);
      
      // Update pool statistics
      await storage.updatePoolStats({
        currency: depositData.currency || "ETH",
        liquidityChange: parseFloat(depositData.amount),
        anonymitySetChange: 1,
        feeAmount: parseFloat(depositData.amount) * 0.015, // 1.5% fee
      });

      res.json(deposit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid deposit data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create deposit" });
      }
    }
  });

  // Check wallet balance and gas requirements
  app.post("/api/check-wallet", async (req, res) => {
    try {
      const { address } = req.body;
      
      if (!address) {
        return res.status(400).json({ message: "Address is required" });
      }

      // Dynamic gas price estimation
      // In production, this would fetch real-time gas prices from a provider
      // For now, we use a base estimate that adjusts based on network conditions
      const baseGasLimit = 21000; // Standard ETH transfer gas limit
      const estimatedGasLimit = baseGasLimit * 1.2; // Add 20% buffer for safety
      
      // Estimate gas price (in gwei) - adjust based on network conditions
      // These values can be fetched from providers like Infura/Alchemy in production
      // Using realistic estimates: 20-50 gwei for mainnet, 0.5-2 gwei for testnets
      const estimatedGasPriceGwei = 30; // Default estimate (can be fetched dynamically)
      const gasPriceWei = BigInt(estimatedGasPriceGwei) * BigInt(1e9); // Convert gwei to wei
      
      // Calculate estimated gas cost in ETH
      const estimatedGasCostWei = gasPriceWei * BigInt(Math.round(estimatedGasLimit));
      const estimatedGasCostEth = Number(estimatedGasCostWei) / 1e18;
      const estimatedGasCost = estimatedGasCostEth.toFixed(6);

      // Check wallet balance (mock implementation - in production, query actual balance)
      const mockBalance = "0"; // New wallets typically have 0 ETH
      const hasSufficientGas = parseFloat(mockBalance) >= parseFloat(estimatedGasCost);
      
      // Relayer fee (typically a small percentage or fixed fee)
      // Adjust relayer fee based on current gas prices to ensure profitability
      const relayerFeeMultiplier = 1.5; // 50% markup to cover gas costs and service
      const relayerFee = (parseFloat(estimatedGasCost) * relayerFeeMultiplier).toFixed(6);
      const totalCost = hasSufficientGas ? estimatedGasCost : (parseFloat(estimatedGasCost) + parseFloat(relayerFee)).toFixed(6);

      res.json({
        address,
        balance: mockBalance,
        estimatedGasCost,
        hasSufficientGas,
        requiresRelayer: !hasSufficientGas,
        relayerFee,
        totalCost
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to check wallet" });
    }
  });

  // Process withdrawal
  app.post("/api/withdrawals", async (req, res) => {
    try {
      const { depositId, withdrawAddress, useRelayer } = req.body;
      
      if (!depositId || !withdrawAddress) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const deposit = await storage.getDeposit(depositId);
      if (!deposit) {
        return res.status(404).json({ message: "Deposit not found" });
      }

      if (deposit.isWithdrawn) {
        return res.status(400).json({ message: "Deposit already withdrawn" });
      }

      // Check if time lock has passed
      const unlockTime = new Date(deposit.depositTime).getTime() + (deposit.lockDuration * 1000);
      if (Date.now() < unlockTime) {
        return res.status(400).json({ message: "Time lock has not expired" });
      }

      // Process withdrawal
      const withdrawal = await storage.processWithdrawal(depositId, withdrawAddress, useRelayer);
      
      // Update pool statistics
      await storage.updatePoolStats({
        currency: deposit.currency,
        liquidityChange: -parseFloat(deposit.amount),
        anonymitySetChange: -1,
        feeAmount: 0,
      });

      res.json(withdrawal);
    } catch (error) {
      res.status(500).json({ message: "Failed to process withdrawal" });
    }
  });


  const httpServer = createServer(app);
  return httpServer;
}
