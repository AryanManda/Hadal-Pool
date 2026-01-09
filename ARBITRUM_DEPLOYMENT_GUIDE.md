# 🚀 Arbitrum Deployment Guide

## Overview

Your Privacy Mixer now supports **Arbitrum** networks:
- ✅ **Arbitrum One** (Chain ID: 42161) - Mainnet
- ✅ **Arbitrum Sepolia** (Chain ID: 421614) - Testnet

## Benefits of Arbitrum

- **Lower Gas Fees**: ~90% cheaper than Ethereum Mainnet
- **Faster Transactions**: Better user experience
- **Ethereum Security**: Uses Ethereum's security model
- **Growing Ecosystem**: Many users prefer Layer 2 solutions

---

## Prerequisites

### 1. Get RPC URLs

**Option A: Infura**
1. Sign up at https://infura.io
2. Create a new project
3. Select "Arbitrum One" or "Arbitrum Sepolia"
4. Copy the RPC URL

**Option B: Alchemy**
1. Sign up at https://alchemy.com
2. Create a new app
3. Select "Arbitrum" network
4. Copy the RPC URL

**Option C: Public RPC (Not Recommended for Production)**
- Arbitrum One: `https://arb1.arbitrum.io/rpc`
- Arbitrum Sepolia: `https://sepolia-rollup.arbitrum.io/rpc`

### 2. Get Arbiscan API Key

1. Sign up at https://arbiscan.io
2. Go to API-KEYs section
3. Create a new API key
4. Copy the API key

### 3. Get Test ETH (for Arbitrum Sepolia)

**Arbitrum Sepolia Faucets:**
- https://faucet.quicknode.com/arbitrum/sepolia
- https://www.alchemy.com/faucets/arbitrum-sepolia

**Note:** You need ETH on Arbitrum Sepolia for gas fees (not regular Sepolia ETH).

---

## Environment Setup

### Update `.env` File

Add these variables to your `.env` file:

```env
# Arbitrum RPC URLs
ARBITRUM_RPC_URL=https://arbitrum-mainnet.infura.io/v3/YOUR_INFURA_KEY
ARBITRUM_SEPOLIA_RPC_URL=https://arbitrum-sepolia.infura.io/v3/YOUR_INFURA_KEY

# Arbiscan API Key (for contract verification)
ARBISCAN_API_KEY=your_arbiscan_api_key

# Your existing variables
PRIVATE_KEY=your_private_key_here
```

---

## Deployment Steps

### Step 1: Deploy to Arbitrum Sepolia (Testnet)

**Recommended:** Test on Arbitrum Sepolia first!

```bash
npx hardhat run scripts/deploy.cjs --network arbitrumSepolia
```

**What happens:**
1. Deploys implementation contract
2. Deploys proxy contract
3. Initializes the contract
4. Creates 3 pools (1 hour, 4 hours, 24 hours)

**After deployment, you'll see:**
```
✅ DEPLOYMENT COMPLETE!
Network: Arbitrum Sepolia
Proxy (Contract Address): 0x...
```

### Step 2: Update Frontend Contract Address

After deployment, update `client/src/lib/contracts.ts`:

```typescript
export const CONTRACT_ADDRESSES = {
  sepolia: "0xBF0B842259D654159D37AD88FafaE694FdE95AA3",
  mainnet: "",
  arbitrum: "", // Will be filled after Arbitrum One deployment
  arbitrumSepolia: "0x...", // ← Add your Arbitrum Sepolia address here
} as const;
```

### Step 3: Verify Contracts on Arbiscan

```bash
# Verify implementation
npx hardhat verify --network arbitrumSepolia <IMPLEMENTATION_ADDRESS>

# Verify proxy
npx hardhat verify --network arbitrumSepolia <PROXY_ADDRESS> <IMPLEMENTATION_ADDRESS> "0x"
```

### Step 4: Test on Arbitrum Sepolia

1. **Connect MetaMask to Arbitrum Sepolia:**
   - Network Name: `Arbitrum Sepolia`
   - RPC URL: `https://sepolia-rollup.arbitrum.io/rpc`
   - Chain ID: `421614`
   - Currency Symbol: `ETH`
   - Block Explorer: `https://sepolia.arbiscan.io`

2. **Get Test ETH:**
   - Use faucets listed above
   - Or bridge from Sepolia (if available)

3. **Test the App:**
   - Make a deposit
   - Test withdrawal
   - Verify everything works

### Step 5: Deploy to Arbitrum One (Mainnet)

⚠️ **Before deploying to Arbitrum One:**
- ✅ Test thoroughly on Arbitrum Sepolia
- ✅ Complete security audit (recommended)
- ✅ Have sufficient ETH for gas fees (~0.01-0.1 ETH)
- ✅ Understand Arbitrum bridging

**Deploy:**
```bash
npx hardhat run scripts/deploy.cjs --network arbitrum
```

**Update contract address:**
```typescript
export const CONTRACT_ADDRESSES = {
  arbitrum: "0x...", // ← Add your Arbitrum One address here
} as const;
```

**Verify on Arbiscan:**
```bash
npx hardhat verify --network arbitrum <IMPLEMENTATION_ADDRESS>
npx hardhat verify --network arbitrum <PROXY_ADDRESS> <IMPLEMENTATION_ADDRESS> "0x"
```

---

## MetaMask Setup

### Add Arbitrum Sepolia to MetaMask

1. Open MetaMask
2. Click network dropdown
3. Click "Add Network" or "Add a network manually"
4. Enter:
   - **Network Name:** Arbitrum Sepolia
   - **RPC URL:** `https://sepolia-rollup.arbitrum.io/rpc`
   - **Chain ID:** `421614`
   - **Currency Symbol:** `ETH`
   - **Block Explorer URL:** `https://sepolia.arbiscan.io`
5. Click "Save"

### Add Arbitrum One to MetaMask

1. Open MetaMask
2. Click network dropdown
3. Click "Add Network" or "Add a network manually"
4. Enter:
   - **Network Name:** Arbitrum One
   - **RPC URL:** `https://arb1.arbitrum.io/rpc`
   - **Chain ID:** `42161`
   - **Currency Symbol:** `ETH`
   - **Block Explorer URL:** `https://arbiscan.io`
5. Click "Save"

---

## Bridging ETH to Arbitrum

### For Arbitrum One (Mainnet)

Users need to bridge ETH from Ethereum Mainnet to Arbitrum:

1. **Official Arbitrum Bridge:**
   - https://bridge.arbitrum.io/
   - Connect wallet
   - Select amount
   - Bridge ETH

2. **Third-Party Bridges:**
   - https://app.hop.exchange/
   - https://portal.polygon.technology/

**Note:** Bridging takes ~10 minutes and requires ETH on Ethereum Mainnet for gas.

### For Arbitrum Sepolia (Testnet)

Use testnet faucets (no bridging needed):
- https://faucet.quicknode.com/arbitrum/sepolia
- https://www.alchemy.com/faucets/arbitrum-sepolia

---

## Gas Costs Comparison

| Network | Average Gas Cost | Example Transaction |
|---------|------------------|-------------------|
| Ethereum Mainnet | $5-50 | Deposit: ~$10-30 |
| Arbitrum One | $0.10-1 | Deposit: ~$0.20-0.50 |
| Sepolia Testnet | Free (test ETH) | Free |
| Arbitrum Sepolia | Free (test ETH) | Free |

**Savings:** Arbitrum is ~90% cheaper than Ethereum Mainnet!

---

## Supported Networks Summary

| Network | Chain ID | Status | Contract Address |
|---------|----------|--------|------------------|
| Sepolia | 11155111 | ✅ Deployed | `0xBF0B842259D654159D37AD88FafaE694FdE95AA3` |
| Ethereum Mainnet | 1 | ⏳ Not Deployed | (empty) |
| Arbitrum One | 42161 | ⏳ Not Deployed | (empty) |
| Arbitrum Sepolia | 421614 | ⏳ Not Deployed | (empty) |

---

## Troubleshooting

### "Contract not deployed on Arbitrum"
- Make sure you've deployed the contract to Arbitrum
- Check that the contract address is correct in `contracts.ts`
- Verify you're connected to the correct network in MetaMask

### "Insufficient funds"
- For Arbitrum Sepolia: Get test ETH from faucets
- For Arbitrum One: Bridge ETH from Ethereum Mainnet

### "Network not supported"
- Make sure you're on Chain ID 42161 (Arbitrum One) or 421614 (Arbitrum Sepolia)
- Check that your MetaMask is connected to the correct network

### Contract Verification Fails
- Make sure `ARBISCAN_API_KEY` is set in `.env`
- Wait a few minutes after deployment before verifying
- Check that the contract address is correct

---

## Next Steps

1. ✅ Deploy to Arbitrum Sepolia
2. ✅ Test thoroughly
3. ✅ Deploy to Arbitrum One (if ready)
4. ✅ Update frontend with contract addresses
5. ✅ Verify contracts on Arbiscan
6. ✅ Announce to users!

---

## Resources

- **Arbitrum Docs:** https://docs.arbitrum.io/
- **Arbiscan:** https://arbiscan.io/
- **Arbitrum Bridge:** https://bridge.arbitrum.io/
- **Arbitrum Sepolia Faucet:** https://faucet.quicknode.com/arbitrum/sepolia

---

**🎉 Your Privacy Mixer now supports Arbitrum! Deploy and enjoy lower gas fees!**



