# How Anyone Can Trace Withdrawals on Testnet/Mainnet

## Overview
This guide shows how **anyone** (not just you) can trace withdrawals from Address A to Address B using public block explorers like Etherscan, without any special access or scripts.

---

## Step-by-Step: Tracing on Etherscan (Sepolia Testnet)

### Step 1: Find the Contract Address
1. Go to **Sepolia Etherscan**: https://sepolia.etherscan.io
2. Search for your contract address (e.g., `0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1`)
3. Click on the contract address

### Step 2: View All Events
1. On the contract page, click the **"Events"** tab
2. You'll see all events emitted by the contract:
   - `Deposit` events
   - `Withdrawal` events
   - `AddressGenerated` events

### Step 3: Filter Deposits by User Address
1. In the Events tab, use the filter: **"Filter by topics"**
2. For Deposit events, filter by:
   - **Topic 0**: `Deposit` event signature
   - **Topic 1**: The user's deposit address (Address A)
3. You'll see all deposits from that address

**What you'll see:**
```
Deposit Event:
- User: 0xYourDepositAddress...
- Amount: 1.0 ETH
- Pool ID: 0
- Timestamp: [exact time]
- Transaction Hash: 0x...
```

### Step 4: Filter Withdrawals by User Address
1. In the Events tab, filter for `Withdrawal` events
2. Filter by:
   - **Topic 0**: `Withdrawal` event signature
   - **Topic 1**: The same user's deposit address (Address A)
3. You'll see all withdrawals from that address

**What you'll see:**
```
Withdrawal Event:
- User (Deposit Address): 0xYourDepositAddress...  ← THIS IS THE PROBLEM!
- To (Withdrawal Address): 0xFreshWalletAddress...
- Amount: 0.997 ETH
- Transaction Hash: 0x...
```

### Step 5: Link Deposit to Withdrawal
**The privacy breach happens here:**

1. You see: `Deposit(user=AddressA, amount=1.0 ETH)`
2. You see: `Withdrawal(user=AddressA, to=AddressB, amount=0.997 ETH)`
3. **Direct link**: Address A → Address B is now public!

---

## Alternative: Using Transaction Hash

### Method 1: From Deposit Transaction
1. Find the deposit transaction hash
2. Click on it in Etherscan
3. Scroll to "Logs" section
4. See the `Deposit` event with user address
5. Note the user address (Address A)

### Method 2: Find Related Withdrawals
1. Go back to contract page
2. Filter `Withdrawal` events by the user address (Address A)
3. See all withdrawals from that address
4. Each withdrawal shows the `to` address (Address B)

---

## Using Public Contract Functions

Anyone can also query the contract's public mappings directly:

### On Etherscan:
1. Go to contract page
2. Click **"Contract"** tab
3. Click **"Read Contract"**
4. Scroll to public functions:
   - `userDeposits(address)` - Enter any address, see their deposit balance
   - `depositTimestamps(address)` - See when they deposited
   - `userToGeneratedAddress(address)` - See their generated address
   - `addressGenerated(address)` - Check if address has been generated

### Example Query:
1. Enter any user's deposit address
2. Call `userDeposits(address)`
3. See: `1000000000000000000` (1 ETH in wei)
4. Call `depositTimestamps(address)`
5. See: `1734567890` (Unix timestamp)
6. **All this data is PUBLIC!**

---

## Using Other Block Explorers

### Blockscout (Alternative Explorer)
1. Go to: https://sepolia.blockscout.com
2. Search contract address
3. Same process as Etherscan
4. All events and public data visible

### Alchemy Explorer
1. Go to: https://eth-sepolia.g.alchemy.com
2. Search contract address
3. View events and transactions
4. Same privacy issues

---

## What Information is Public

### ✅ Visible to Everyone:
- **All deposit addresses** (who deposited)
- **All withdrawal addresses** (where funds went)
- **Direct links** between deposit and withdrawal addresses
- **Deposit amounts** and timestamps
- **Withdrawal amounts** and timestamps
- **User deposit balances** (via public mappings)
- **Deposit timestamps** (via public mappings)
- **Generated addresses** (via public mappings)

### ❌ What Should Be Private (But Isn't):
- Link between deposit address and withdrawal address
- User deposit balances
- Deposit timestamps
- Generated addresses

---

## Real-World Example

### Scenario:
1. **Alice** deposits 1 ETH from `0xAlice...`
2. **Bob** deposits 1 ETH from `0xBob...`
3. **Alice** withdraws to `0xAliceFresh...`
4. **Bob** withdraws to `0xBobFresh...`

### What Anyone Can See on Etherscan:

**Deposit Events:**
```
Deposit(user=0xAlice..., amount=1.0 ETH, ...)
Deposit(user=0xBob..., amount=1.0 ETH, ...)
```

**Withdrawal Events:**
```
Withdrawal(user=0xAlice..., to=0xAliceFresh..., amount=0.997 ETH)
Withdrawal(user=0xBob..., to=0xBobFresh..., amount=0.997 ETH)
```

**Result:**
- Anyone can see: `0xAlice...` → `0xAliceFresh...`
- Anyone can see: `0xBob...` → `0xBobFresh...`
- **No privacy at all!**

---

## How to Test This Yourself

### On Sepolia Testnet:
1. Deploy your contract to Sepolia
2. Make a deposit from Address A
3. Wait for lock period
4. Withdraw to Address B
5. Go to: https://sepolia.etherscan.io
6. Search your contract address
7. Click "Events" tab
8. Filter by your deposit address
9. See the direct link: Address A → Address B

### On Mainnet (Same Process):
1. Deploy to mainnet
2. Same steps as above
3. Use: https://etherscan.io
4. **Everything is public and traceable**

---

## Summary

**Anyone can trace withdrawals by:**
1. Going to Etherscan/block explorer
2. Searching the contract address
3. Viewing Events tab
4. Filtering by user address
5. Seeing direct links: Deposit Address → Withdrawal Address

**No special tools needed** - just a web browser and the contract address!

**The privacy issue:** The `Withdrawal` event includes the deposit address (`user` parameter), making all withdrawals directly traceable.





