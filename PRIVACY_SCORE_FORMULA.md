# 🔒 Privacy Score Formula

## Overview

The Privacy Score is a **0-100** rating that measures how private your deposit will be. Higher scores indicate better privacy protection.

---

## Formula

```
Privacy Score = (
  balanceFactor × 0.3 +
  timeFactor × 0.3 +
  amountFactor × 0.2 +
  anonymityFactor × 0.2
) × 100
```

**Final Score:** Rounded and clamped between 0 and 100

---

## Component Factors

### 1. Balance Factor (30% weight)

**Formula:**
```
balanceFactor = max(0, 1 - (userBalance / 1000))
```

**Explanation:**
- Lower wallet balance = Higher privacy score
- If balance ≥ 1000 ETH: `balanceFactor = 0`
- If balance = 0 ETH: `balanceFactor = 1` (maximum)
- If balance = 500 ETH: `balanceFactor = 0.5`

**Why:** Users with lower balances are harder to track and link to specific transactions.

**Example:**
- Balance = 0 ETH → `balanceFactor = 1.0` → 30 points
- Balance = 500 ETH → `balanceFactor = 0.5` → 15 points
- Balance = 1000+ ETH → `balanceFactor = 0.0` → 0 points

---

### 2. Time Factor (30% weight)

**Formula:**
```
timeFactor = min(1, lockDuration / (72 × 3600))
```

**Explanation:**
- Longer lock duration = Higher privacy score
- Maximum score at 72 hours (259,200 seconds)
- Normalized to 0-1 range

**Why:** Longer time locks make it harder to correlate deposits with withdrawals.

**Example:**
- 1 hour (3600s) → `timeFactor = 3600/259200 = 0.014` → 0.4 points
- 4 hours (14400s) → `timeFactor = 14400/259200 = 0.056` → 1.7 points
- 24 hours (86400s) → `timeFactor = 86400/259200 = 0.333` → 10 points
- 72+ hours → `timeFactor = 1.0` → 30 points (maximum)

---

### 3. Amount Factor (20% weight)

**Formula:**
```
amountFactor = min(1, depositAmount / 10)
```

**Explanation:**
- Larger deposits = Higher privacy score (up to a point)
- Maximum score at 10 ETH
- Normalized to 0-1 range

**Why:** Larger deposits mix with more funds, increasing anonymity.

**Example:**
- 0.1 ETH → `amountFactor = 0.1/10 = 0.01` → 0.2 points
- 1 ETH → `amountFactor = 1/10 = 0.1` → 2 points
- 5 ETH → `amountFactor = 5/10 = 0.5` → 10 points
- 10+ ETH → `amountFactor = 1.0` → 20 points (maximum)

---

### 4. Anonymity Factor (20% weight)

**Formula:**
```
anonymityFactor = min(1, anonymitySetSize / 100)
```

**Explanation:**
- Larger anonymity set = Higher privacy score
- Maximum score at 100 users
- Normalized to 0-1 range

**Why:** More users in the pool = harder to identify individual transactions.

**Example:**
- 10 users → `anonymityFactor = 10/100 = 0.1` → 2 points
- 50 users → `anonymityFactor = 50/100 = 0.5` → 10 points
- 100+ users → `anonymityFactor = 1.0` → 20 points (maximum)

---

## Complete Example Calculation

### Example 1: High Privacy Score

**Inputs:**
- Deposit Amount: 5 ETH
- Lock Duration: 24 hours (86,400 seconds)
- User Balance: 0.5 ETH
- Anonymity Set: 75 users

**Calculation:**
```
balanceFactor = max(0, 1 - (0.5/1000)) = 0.9995 ≈ 1.0
timeFactor = min(1, 86400/259200) = 0.333
amountFactor = min(1, 5/10) = 0.5
anonymityFactor = min(1, 75/100) = 0.75

Score = (1.0 × 0.3 + 0.333 × 0.3 + 0.5 × 0.2 + 0.75 × 0.2) × 100
     = (0.3 + 0.1 + 0.1 + 0.15) × 100
     = 0.65 × 100
     = 65
```

**Result:** Privacy Score = **65/100** (Good)

---

### Example 2: Low Privacy Score

**Inputs:**
- Deposit Amount: 0.1 ETH
- Lock Duration: 1 hour (3,600 seconds)
- User Balance: 2000 ETH
- Anonymity Set: 5 users

**Calculation:**
```
balanceFactor = max(0, 1 - (2000/1000)) = max(0, -1) = 0
timeFactor = min(1, 3600/259200) = 0.014
amountFactor = min(1, 0.1/10) = 0.01
anonymityFactor = min(1, 5/100) = 0.05

Score = (0 × 0.3 + 0.014 × 0.3 + 0.01 × 0.2 + 0.05 × 0.2) × 100
     = (0 + 0.004 + 0.002 + 0.01) × 100
     = 0.016 × 100
     = 1.6 ≈ 2
```

**Result:** Privacy Score = **2/100** (Very Poor)

---

### Example 3: Maximum Privacy Score

**Inputs:**
- Deposit Amount: 10+ ETH
- Lock Duration: 72+ hours
- User Balance: 0 ETH
- Anonymity Set: 100+ users

**Calculation:**
```
balanceFactor = max(0, 1 - (0/1000)) = 1.0
timeFactor = min(1, 259200/259200) = 1.0
amountFactor = min(1, 10/10) = 1.0
anonymityFactor = min(1, 100/100) = 1.0

Score = (1.0 × 0.3 + 1.0 × 0.3 + 1.0 × 0.2 + 1.0 × 0.2) × 100
     = (0.3 + 0.3 + 0.2 + 0.2) × 100
     = 1.0 × 100
     = 100
```

**Result:** Privacy Score = **100/100** (Excellent)

---

## Score Labels

| Score Range | Label | Color |
|-------------|-------|-------|
| 80-100 | Excellent | Green |
| 60-79 | Good | Blue |
| 40-59 | Fair | Yellow |
| 20-39 | Poor | Orange |
| 0-19 | Very Poor | Red |

---

## How to Improve Your Privacy Score

### 1. **Lower Your Wallet Balance** (30% impact)
- Use a fresh wallet with minimal balance
- Transfer most funds out before depositing
- **Best:** 0 ETH balance = 30 points

### 2. **Choose Longer Time Locks** (30% impact)
- 1 hour = ~0.4 points
- 4 hours = ~1.7 points
- 24 hours = ~10 points
- **Best:** 72+ hours = 30 points

### 3. **Deposit Larger Amounts** (20% impact)
- 0.1 ETH = ~0.2 points
- 1 ETH = ~2 points
- 5 ETH = ~10 points
- **Best:** 10+ ETH = 20 points

### 4. **Wait for Larger Anonymity Set** (20% impact)
- 10 users = ~2 points
- 50 users = ~10 points
- **Best:** 100+ users = 20 points

---

## Mathematical Summary

```
Privacy Score = 100 × min(1, max(0, 
  0.3 × max(0, 1 - balance/1000) +
  0.3 × min(1, lockDuration/259200) +
  0.2 × min(1, depositAmount/10) +
  0.2 × min(1, anonymitySet/100)
))
```

**Where:**
- `balance` = User's wallet balance in ETH
- `lockDuration` = Time lock duration in seconds
- `depositAmount` = Deposit amount in ETH
- `anonymitySet` = Number of users in the pool

---

## Code Reference

The formula is implemented in:
- `client/src/lib/privacy-score.ts` - Calculation logic
- `client/src/components/privacy-score.tsx` - UI display

---

**💡 Tip:** For maximum privacy (100/100), use a fresh wallet with 0 balance, deposit 10+ ETH, choose 72+ hour lock, and wait for 100+ users in the pool!



