export interface PrivacyScoreData {
  depositAmount: number;
  lockDuration: number; // in seconds
  userBalance?: number;
  anonymitySetSize?: number;
  currency?: string; // "ETH", "USDC", "USDT", "WBTC"
}

/**
 * Convert amount to ETH equivalent for privacy scoring
 * This ensures USDC/USDT amounts are scored appropriately
 */
function convertToETHEquivalent(amount: number, currency?: string): number {
  if (!currency || currency === "ETH") return amount;
  
  // Approximate conversions (for privacy scoring purposes)
  // USDC/USDT: 1:1 with USD, assume ~$2000-3000 per ETH
  if (currency === "USDC" || currency === "USDT") {
    return amount / 2500; // Convert USDC/USDT to ETH equivalent (~$2500/ETH)
  }
  
  // WBTC: 1 WBTC ≈ 30-60 ETH (depending on BTC price)
  if (currency === "WBTC") {
    return amount * 40; // Approximate: 1 WBTC ≈ 40 ETH
  }
  
  return amount; // Default: assume already in ETH
}

/**
 * Get AmountLevel (1-4) based on deposit amount (in ETH equivalent)
 * Level 1 = smallest (best for privacy), Level 4 = largest (worst)
 */
function getAmountLevel(depositAmount: number, currency?: string): number {
  const ethEquivalent = convertToETHEquivalent(depositAmount, currency);
  
  if (ethEquivalent < 0.5) return 1;      // < 0.5 ETH equivalent (best)
  if (ethEquivalent < 2) return 2;        // 0.5 - 2 ETH equivalent
  if (ethEquivalent < 10) return 3;        // 2 - 10 ETH equivalent
  return 4;                                // 10+ ETH equivalent (worst)
}

/**
 * Get TimeLevel (1-3) based on lock duration
 * Level 1 = shortest (worst), Level 3 = longest (best)
 */
function getTimeLevel(lockDuration: number): number {
  // Pool durations: 3600s (1 hour), 14400s (4 hours), 86400s (24 hours)
  if (lockDuration <= 3600) return 1;       // 1 hour (worst)
  if (lockDuration <= 14400) return 2;      // 4 hours
  return 3;                                  // 24 hours (best)
}

export function calculatePrivacyScore(data: PrivacyScoreData): number {
  const { depositAmount, lockDuration, currency } = data;
  
  // Get levels
  const amountLevel = getAmountLevel(depositAmount, currency);
  const timeLevel = getTimeLevel(lockDuration);
  
  // Calculate scores
  // AmountScore = (AmountLevel - 1) / (4 - 1)
  // Note: Since lower amount is more hidden (better), we invert the result
  // Formula gives: Level 1 → 0, Level 4 → 1
  // We want: Level 1 (smallest) → 1, Level 4 (largest) → 0
  const amountScore = 1 - ((amountLevel - 1) / 3);
  
  // TimeScore = (TimeLevel - 1) / (3 - 1)
  const timeScore = (timeLevel - 1) / 2;
  
  // Weighted calculation (equal weights for amount and time)
  const w_amount = 0.5;
  const w_time = 0.5;
  
  // PrivacyScore = 100 × (w_amount × AmountScore + w_time × TimeScore)
  const score = 100 * (w_amount * amountScore + w_time * timeScore);
  
  // Never let the score be 0; the lowest should be 40
  return Math.round(Math.min(100, Math.max(40, score)));
}

export function getPrivacyScoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  if (score >= 20) return "Poor";
  return "Very Poor";
}

export function getPrivacyScoreColor(score: number): string {
  if (score >= 80) return "text-green-500";
  if (score >= 60) return "text-blue-500";
  if (score >= 40) return "text-yellow-500";
  if (score >= 20) return "text-orange-500";
  return "text-red-500";
}
