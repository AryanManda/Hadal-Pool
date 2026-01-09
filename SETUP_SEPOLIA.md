# Quick Sepolia Setup - Fix Your Deposit Error

## The Problem
Your deposit is failing because:
1. ✅ The app now supports Sepolia (I just fixed the deposit card)
2. ❌ The Sepolia contract address is empty in `client/src/lib/contracts.ts`
3. ❌ The contract needs to be deployed to Sepolia OR you need to provide the address

## Option 1: If You Already Deployed to Sepolia

If you already deployed the contract, just provide the contract address and I'll update it.

**To find your contract address:**
- Check `deployments/sepolia.json` if it exists
- Or check your deployment transaction on Sepolia Etherscan
- Or check your deployment script output

Then update `client/src/lib/contracts.ts`:
```typescript
sepolia: "YOUR_CONTRACT_ADDRESS_HERE",
```

## Option 2: Deploy to Sepolia Now

### Step 1: Create .env file
Create `.env` in project root:
```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
PRIVATE_KEY=0x_your_private_key_here
```

**Get RPC URL:**
- Infura: https://infura.io → Create project → Get Sepolia endpoint
- Alchemy: https://alchemy.com → Create app → Get Sepolia endpoint

**Get Private Key:**
- MetaMask → Account → Account Details → Export Private Key

### Step 2: Deploy
```bash
npx hardhat run deploy-sepolia.cjs --network sepolia
```

### Step 3: Update Frontend
```bash
node update-sepolia-address.js
```

### Step 4: Restart Server
```bash
npm run dev
```

## Option 3: Use Hardhat Local (For Testing)

If you want to test locally first:
1. Start Hardhat node: `npx hardhat node`
2. Deploy locally: `npx hardhat run scripts/deploy.cjs --network localhost`
3. Switch MetaMask to Hardhat (Chain ID: 1337, RPC: http://localhost:8545)

## After Setup

1. Make sure MetaMask is on Sepolia (Chain ID: 11155111)
2. Make sure you have Sepolia ETH (get from faucets)
3. Connect wallet in the app
4. Try deposit again






