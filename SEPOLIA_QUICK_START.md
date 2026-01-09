# Sepolia Testnet Quick Start Guide

This guide will help you deploy the Privacy Mixer to Sepolia testnet and perform real deposits and withdrawals.

## Prerequisites

1. **MetaMask installed** in your browser
2. **Sepolia test ETH** (get from faucets)
3. **RPC URL** from Infura or Alchemy (free)

---

## Step 1: Get Sepolia Test ETH

You need Sepolia ETH for gas fees. Get free test ETH from:

- **https://sepoliafaucet.com/**
- **https://faucet.quicknode.com/ethereum/sepolia**
- **https://www.alchemy.com/faucets/ethereum-sepolia**

**You need at least 0.01 ETH for deployment and testing.**

---

## Step 2: Get an RPC URL

Choose one provider (both are free):

### Option A: Infura
1. Go to https://infura.io
2. Create a free account
3. Create a new project
4. Select "Ethereum" network
5. Copy the Sepolia endpoint URL (looks like: `https://sepolia.infura.io/v3/YOUR_KEY`)

### Option B: Alchemy
1. Go to https://alchemy.com
2. Create a free account
3. Create a new app
4. Select "Ethereum" and "Sepolia" network
5. Copy the HTTP URL (looks like: `https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY`)

---

## Step 3: Get Your Wallet Private Key

**⚠️ WARNING: Never share your private key or commit it to git!**

1. Open MetaMask
2. Click your account icon (top right)
3. Click "Account Details"
4. Click "Export Private Key"
5. Enter your MetaMask password
6. Copy the private key (starts with `0x`)

---

## Step 4: Create .env File

Create a `.env` file in the project root:

```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=0x_your_private_key_here
```

**Replace:**
- `YOUR_INFURA_KEY` with your actual Infura key (or Alchemy URL)
- `0x_your_private_key_here` with your MetaMask private key

---

## Step 5: Deploy Contract to Sepolia

Run the deployment script:

```bash
npx hardhat run deploy-sepolia.cjs --network sepolia
```

This will:
- Deploy the contract to Sepolia
- Save the address to `deployments/sepolia.json`
- Show you the contract address

**Expected output:**
```
✅ DEPLOYMENT COMPLETE!
Network: Sepolia Testnet
Proxy (Contract Address): 0x...
```

---

## Step 6: Update Frontend Contract Address

After deployment, automatically update the frontend:

```bash
node update-sepolia-address.js
```

This updates `client/src/lib/contracts.ts` with your deployed contract address.

**OR manually update** `client/src/lib/contracts.ts`:
```typescript
export const CONTRACT_ADDRESSES = {
  hardhat: "0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1",
  sepolia: "YOUR_DEPLOYED_ADDRESS_HERE", // ← Update this
  mainnet: "",
} as const;
```

---

## Step 7: Disable Demo Mode

The app runs in demo mode by default. To use real Sepolia transactions:

**Option A: Set environment variable**
Create or update `.env`:
```env
VITE_DEMO_MODE=false
```

**Option B: Disable in browser**
1. Open browser console (F12)
2. Run: `localStorage.setItem('demoMode', 'false')`
3. Refresh the page

---

## Step 8: Add Sepolia Network to MetaMask

If Sepolia isn't in your MetaMask:

1. Open MetaMask
2. Click network dropdown (top)
3. Click "Add Network" → "Add a network manually"
4. Enter:
   - **Network Name:** Sepolia
   - **RPC URL:** `https://sepolia.infura.io/v3/YOUR_KEY` (or your Alchemy URL)
   - **Chain ID:** `11155111`
   - **Currency Symbol:** `ETH`
   - **Block Explorer:** `https://sepolia.etherscan.io`
5. Click "Save"

---

## Step 9: Restart the Application

Restart your dev server to pick up changes:

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

---

## Step 10: Connect MetaMask to Sepolia

1. Make sure MetaMask is on **Sepolia test network**
2. Open the app: `http://localhost:5000`
3. Click "Connect Wallet"
4. Approve the connection in MetaMask
5. You should see your wallet address in the header

---

## Step 11: Make a Deposit

1. **Check your balance** - Make sure you have Sepolia ETH
2. **Enter deposit amount** - e.g., `0.01 ETH`
3. **Select time lock** - Choose 1 hour, 4 hours, or 24 hours
4. **Click "Generate Wallet"** - Creates a new address for your deposit
5. **Click "Deposit"**
6. **Approve transaction** in MetaMask
7. **Wait for confirmation** - Transaction will appear in MetaMask

**Note:** In demo mode, time locks are shortened (1 hour = 60 seconds). On real Sepolia, they use full durations.

---

## Step 12: Wait for Time Lock

- **1 hour pool:** Wait 1 hour (or 60 seconds in demo mode)
- **4 hour pool:** Wait 4 hours (or 240 seconds in demo mode)
- **24 hour pool:** Wait 24 hours (or 1440 seconds in demo mode)

You can check the countdown timer on the deposit card.

---

## Step 13: Make a Withdrawal

1. **Wait for time lock to expire** (see countdown timer)
2. **Enter withdrawal address** - Any Ethereum address you control
3. **Click "Withdraw"**
4. **Approve transaction** in MetaMask
5. **Wait for confirmation**

The funds will be sent to your withdrawal address!

---

## Step 14: View on Etherscan

View your transactions on Sepolia Etherscan:

1. Go to: `https://sepolia.etherscan.io/address/YOUR_CONTRACT_ADDRESS`
2. Click "Transactions" tab
3. See all deposits and withdrawals
4. Click any transaction to see details

---

## Troubleshooting

### "Contract not deployed on Sepolia"
- Make sure you deployed the contract (Step 5)
- Make sure you updated the contract address (Step 6)
- Restart the dev server

### "Insufficient funds"
- Get more Sepolia ETH from faucets
- Make sure you're on Sepolia network in MetaMask

### "Wrong network"
- Switch MetaMask to Sepolia testnet
- The app detects network automatically

### "Transaction failed"
- Check you have enough ETH for gas
- Make sure time lock has expired
- Check contract address is correct

### Demo mode still active
- Set `VITE_DEMO_MODE=false` in `.env`
- Or run `localStorage.setItem('demoMode', 'false')` in browser console
- Restart dev server

---

## Quick Reference

- **Sepolia Chain ID:** `11155111`
- **Sepolia Etherscan:** `https://sepolia.etherscan.io`
- **Contract Address:** Check `deployments/sepolia.json` after deployment
- **RPC URLs:** 
  - Infura: `https://sepolia.infura.io/v3/YOUR_KEY`
  - Alchemy: `https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY`

---

## Next Steps

- View transactions on Etherscan
- Trace withdrawals (see `HOW_TO_TRACE_ON_ETHERSCAN.md`)
- Test with different amounts
- Try different time lock durations






