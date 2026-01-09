# 🚀 Deploy Privacy Mixer - Quick Start Guide

## Current Status
- ✅ Smart Contract: Already deployed on Sepolia at `0x3bD01EC9cB56600600071E9f11b551c8FE6db803`
- ⚠️ Mainnet: Not yet deployed (requires environment variables and security audit)

## Option 1: Deploy Smart Contract to Sepolia (Redeploy)

If you need to redeploy the contract to Sepolia:

### Step 1: Set Environment Variables

Create a `.env` file in the root directory:

```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your_wallet_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key
```

**Get these values:**
- **RPC URL**: Sign up at [Infura](https://infura.io) or [Alchemy](https://alchemy.com) and create a Sepolia project
- **Private Key**: Export from your MetaMask wallet (Settings → Security & Privacy → Show Private Key)
- **Etherscan API Key**: Get from [Etherscan API](https://etherscan.io/apis)

### Step 2: Deploy

```bash
npx hardhat run deploy-sepolia.cjs
```

Or use the standard deploy script:

```bash
npx hardhat run scripts/deploy.cjs --network sepolia
```

### Step 3: Update Frontend

After deployment, update `client/src/lib/contracts.ts` with the new contract address.

---

## Option 2: Deploy Smart Contract to Mainnet

⚠️ **WARNING**: Mainnet deployment requires:
- Security audit (CRITICAL)
- Extensive testnet testing
- Multi-sig wallet setup
- Sufficient ETH for gas fees (~0.1-0.5 ETH)

### Step 1: Set Environment Variables

Create a `.env` file:

```env
MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your_wallet_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### Step 2: Deploy

```bash
npx hardhat run scripts/deploy.cjs --network mainnet
```

### Step 3: Verify Contracts

```bash
npx hardhat verify --network mainnet <IMPLEMENTATION_ADDRESS>
npx hardhat verify --network mainnet <PROXY_ADDRESS> <IMPLEMENTATION_ADDRESS> "0x"
```

### Step 4: Update Frontend

Update `client/src/lib/contracts.ts` with the mainnet contract address.

---

## Option 3: Deploy Frontend/Backend Application

### Option A: Deploy to Vercel (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel --prod
   ```

3. **Add Custom Domain (Optional):**
   ```bash
   vercel domains add yourdomain.com
   ```

### Option B: Deploy to Netlify

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy:**
   ```bash
   npm i -g netlify-cli
   netlify deploy --prod --dir=dist/public
   ```

### Option C: Deploy to VPS (DigitalOcean, AWS, etc.)

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Use the deployment script:**
   ```bash
   chmod +x scripts/deploy-vps.sh
   ./scripts/deploy-vps.sh
   ```

3. **Or manually:**
   - Upload `dist/` folder to your server
   - Install Node.js and dependencies
   - Run: `npm start`

---

## Quick Deployment Commands

### For Sepolia Testnet:
```bash
# 1. Set environment variables in .env file
# 2. Deploy contract
npx hardhat run deploy-sepolia.cjs

# 3. Build frontend/backend
npm run build

# 4. Deploy to hosting (choose one):
# Vercel: vercel --prod
# Netlify: netlify deploy --prod --dir=dist/public
# VPS: Upload dist/ folder and run npm start
```

### For Mainnet:
```bash
# 1. Complete security audit first!
# 2. Set environment variables in .env file
# 3. Deploy contract
npx hardhat run scripts/deploy.cjs --network mainnet

# 4. Verify contracts
npx hardhat verify --network mainnet <ADDRESS>

# 5. Build and deploy frontend/backend (same as above)
```

---

## Environment Variables Checklist

- [ ] `SEPOLIA_RPC_URL` - For Sepolia deployment
- [ ] `MAINNET_RPC_URL` - For Mainnet deployment
- [ ] `PRIVATE_KEY` - Your wallet private key (keep secure!)
- [ ] `ETHERSCAN_API_KEY` - For contract verification

---

## Post-Deployment Checklist

- [ ] Contract deployed and verified on Etherscan
- [ ] Frontend contract address updated
- [ ] Test deposit on deployed network
- [ ] Test withdrawal on deployed network
- [ ] Monitor for any errors
- [ ] Update documentation with new addresses

---

## Need Help?

- Check `MAINNET_DEPLOYMENT_ROADMAP.md` for comprehensive mainnet deployment guide
- Check `TESTING_AND_SECURITY_CHECKLIST.md` for security requirements
- Check `DEPLOYMENT_CHECKLIST.md` for detailed deployment steps
