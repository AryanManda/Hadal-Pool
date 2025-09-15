import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const deposits = pgTable("deposits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userAddress: text("user_address").notNull(),
  currency: text("currency").notNull().default("ETH"),
  amount: decimal("amount", { precision: 18, scale: 8 }).notNull(),
  transactionHash: text("transaction_hash").notNull(),
  depositTime: timestamp("deposit_time").notNull().defaultNow(),
  lockDuration: integer("lock_duration").notNull().default(86400), // 24 hours in seconds
  isWithdrawn: boolean("is_withdrawn").notNull().default(false),
  withdrawnAt: timestamp("withdrawn_at"),
  withdrawAddress: text("withdraw_address"),
});

export const poolStats = pgTable("pool_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  currency: text("currency").notNull().default("ETH"),
  totalLiquidity: decimal("total_liquidity", { precision: 18, scale: 8 }).notNull().default("0"),
  anonymitySetSize: integer("anonymity_set_size").notNull().default(0),
  privacyFundBalance: decimal("privacy_fund_balance", { precision: 18, scale: 8 }).notNull().default("0"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertDepositSchema = createInsertSchema(deposits).pick({
  userAddress: true,
  currency: true,
  amount: true,
  transactionHash: true,
  lockDuration: true,
});

export const insertPoolStatsSchema = createInsertSchema(poolStats).pick({
  currency: true,
  totalLiquidity: true,
  anonymitySetSize: true,
  privacyFundBalance: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertDeposit = z.infer<typeof insertDepositSchema>;
export type Deposit = typeof deposits.$inferSelect;
export type InsertPoolStats = z.infer<typeof insertPoolStatsSchema>;
export type PoolStats = typeof poolStats.$inferSelect;
