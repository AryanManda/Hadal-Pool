# Demo Without Real Money - Complete Guide

## Best Option: Hardhat Local Network (Recommended)

This uses a **completely local blockchain** with **free fake ETH** - perfect for demos!

### Step 1: Start Local Hardhat Node

Open a **new terminal** and run:

```bash
npx hardhat node
```

This starts a local blockchain on `http://localhost:8545` with:
- ✅ 20 test accounts pre-funded with 10,000 ETH each
- ✅ Instant transactions (no waiting for confirmations)
- ✅ Free - no real money needed
- ✅ Perfect for demos

### Step 2: Connect MetaMask to Local Network

1. Open MetaMask
2. Click network dropdown (top of MetaMask)
3. Click "Add Network" or "Add a network manually"
4. Enter these details:
   - **Network Name**: Hardhat Local
   - **RPC URL**: `http://localhost:8545`
   - **Chain ID**: `1337`
   - **Currency Symbol**: `ETH`
   - **Block Explorer**: (leave empty)

5. Click "Save"

### Step 3: Import Test Account to MetaMask

The Hardhat node creates accounts with known private keys. Import one:

1. In the terminal running `npx hardhat node`, you'll see accounts listed
2. Copy the private key of Account #0 (first account)
3. In MetaMask: Click account icon → Import Account → Paste private key
4. You'll now have 10,000 ETH in that account!

### Step 4: Deploy Contract to Local Network

In another terminal, run:

```bash
npx hardhat run scripts/deploy.cjs --network hardhat
```

This deploys the contract to your local network (free, instant).

### Step 5: Update Contract Address (if needed)

The contract should already be deployed. Check `deployments/hardhat.json` for the address.

### Step 6: Demo!

Now you can:
- ✅ Use unlimited fake ETH
- ✅ Make deposits instantly
- ✅ Test withdrawals
- ✅ No real money involved!

---

## Alternative Option: Sepolia Testnet (Also Free)

If you prefer a testnet:

### Step 1: Switch MetaMask to Sepolia
- MetaMask → Networks → Sepolia Testnet

### Step 2: Get Free Test ETH
- Go to: https://sepoliafaucet.com/
- Or: https://www.alchemy.com/faucets/ethereum-sepolia
- Enter your wallet address
- Get free test ETH (usually 0.5-1 ETH)

### Step 3: Deploy Contract to Sepolia
```bash
npx hardhat run scripts/deploy.cjs --network sepolia
```

### Step 4: Demo with Test ETH
- Use test ETH (not real money)
- Transactions take 12-15 seconds (real testnet)
- Free from faucets

---

## Quick Start for Demo (Hardhat Local - Easiest!)

**Terminal 1:**
```bash
npx hardhat node
```

**Terminal 2:**
```bash
npm run dev
```

**Then:**
1. Connect MetaMask to `http://localhost:8545` (Chain ID: 1337)
2. Import a Hardhat account (private key from Terminal 1)
3. You'll have 10,000 ETH instantly!
4. Start demo!

---

## For USDC on Local Network

If you need USDC for demo:

1. **Deploy Mock USDC Token** (optional):
   - Create a simple ERC20 token contract
   - Deploy it to local Hardhat network
   - Mint yourself some tokens

2. **Or use ETH** - For demo purposes, ETH works perfectly!

---

## Benefits of Local Network for Demo

✅ **Instant transactions** - No waiting
✅ **Unlimited funds** - 10,000 ETH per account
✅ **No internet required** - Works offline
✅ **No real money** - Completely fake
✅ **Repeatable** - Reset anytime
✅ **Fast** - Perfect for live demos

---

## Troubleshooting

**MetaMask won't connect to localhost:8545?**
- Make sure `npx hardhat node` is running
- Check the RPC URL is exactly `http://localhost:8545`
- Chain ID must be `1337`

**Contract not found?**
- Deploy it: `npx hardhat run scripts/deploy.cjs --network hardhat`
- Check the address in `deployments/hardhat.json`

**No ETH showing?**
- Import one of the Hardhat accounts (private keys shown in terminal)
- Or use MetaMask's "Faucet" if available for localhost

---

**This is the best way to demo - completely free and instant!**

