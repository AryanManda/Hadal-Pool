import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDepositSchema, insertPoolStatsSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get pool statistics
  app.get("/api/pool-stats", async (req, res) => {
    try {
      const stats = await storage.getPoolStats();
      res.json(stats);
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
        feeAmount: parseFloat(depositData.amount) * 0.003, // 0.3% fee
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
