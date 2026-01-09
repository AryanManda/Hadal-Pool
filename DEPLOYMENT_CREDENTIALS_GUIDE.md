# 🔑 Where to Find Deployment Credentials

Quick guide to find everything you need for Arbitrum Sepolia deployment.

---

## 1. RPC URL (Arbitrum Sepolia)

### Option A: Infura (Recommended - Free)
1. Go to: **https://infura.io**
2. Sign up or log in
3. Click **"Create New Key"** or **"Create Project"**
4. Select network: **"Arbitrum Sepolia"**
5. Copy the **HTTPS endpoint**
   - Format: `https://arbitrum-sepolia.infura.io/v3/YOUR_PROJECT_ID`

### Option B: Alchemy (Recommended - Free)
1. Go to: **https://alchemy.com**
2. Sign up or log in
3. Click **"Create App"**
4. Select network: **"Arbitrum Sepolia"**
5. Copy the **HTTPS URL**
   - Format: `https://arb-sepolia.g.alchemy.com/v2/YOUR_API_KEY`

### Option C: Public RPC (No Signup - Less Reliable)
- Use: `https://sepolia-rollup.arbitrum.io/rpc`
- ⚠️ May be slower or rate-limited

---

## 2. Private Key (From MetaMask)

### Steps:
1. Open **MetaMask** browser extension
2. Click your **account icon** (top right)
3. Click **"Account details"**
4. Click **"Show private key"**
5. Enter your MetaMask password
6. **Copy the private key**

### ⚠️ IMPORTANT:
- Use a **test wallet** only (create a new account for testing)
- **Never share** your private key
- **Never use** your main wallet's private key
- This key will be in `.env` file (already in `.gitignore`)

### Create Test Wallet (Recommended):
1. In MetaMask, click account icon → **"Create Account"**
2. Name it "Test Deployer" or similar
3. Use this account's private key for deployment

---

## 3. Arbiscan API Key (Optional - For Contract Verification)

### Steps:
1. Go to: **https://arbiscan.io**
2. Sign up or log in (free account)
3. Click your profile icon (top right)
4. Go to **"API-KEYs"** section
5. Click **"Add"** button
6. Name it (e.g., "Privacy Mixer")
7. **Copy the API key**

### Note:
- This is **optional** - only needed to verify contracts on Arbiscan
- You can deploy without it, but verification helps users trust your contract

---

## 4. Test ETH (Arbitrum Sepolia)

### You Need:
- MetaMask connected to **Arbitrum Sepolia** network
- At least **0.1-0.2 ETH** for gas fees

### Get Free Test ETH:

#### Option 1: QuickNode Faucet
1. Go to: **https://faucet.quicknode.com/arbitrum/sepolia**
2. Enter your MetaMask wallet address
3. Complete captcha
4. Click **"Send Me ETH"**
5. Wait 1-2 minutes

#### Option 2: Alchemy Faucet
1. Go to: **https://www.alchemy.com/faucets/arbitrum-sepolia**
2. Connect wallet or enter address
3. Complete any required steps
4. Receive test ETH

### Switch MetaMask to Arbitrum Sepolia:
1. Open MetaMask
2. Click network dropdown (top)
3. If not listed, click **"Add Network"**:
   - **Network Name:** Arbitrum Sepolia
   - **RPC URL:** `https://sepolia-rollup.arbitrum.io/rpc`
   - **Chain ID:** `421614`
   - **Currency Symbol:** ETH
   - **Block Explorer:** `https://sepolia.arbiscan.io`
4. Save and switch to it

---

## 5. Create `.env` File

Once you have all credentials, create `.env` file in project root:

```env
# Arbitrum Sepolia RPC URL
ARBITRUM_SEPOLIA_RPC_URL=https://arbitrum-sepolia.infura.io/v3/YOUR_PROJECT_ID
# OR
# ARBITRUM_SEPOLIA_RPC_URL=https://arb-sepolia.g.alchemy.com/v2/YOUR_API_KEY

# Private Key (from MetaMask - test wallet only!)
PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE

# Arbiscan API Key (optional)
ARBISCAN_API_KEY=your_arbiscan_api_key

# Gas Reporting
REPORT_GAS=true
```

### ⚠️ Security:
- `.env` is already in `.gitignore` (won't be committed)
- Never share your private key
- Never commit `.env` to git

---

## Quick Checklist

- [ ] Got RPC URL (Infura or Alchemy)
- [ ] Got Private Key (from MetaMask test wallet)
- [ ] Got Arbiscan API Key (optional)
- [ ] Got Test ETH on Arbitrum Sepolia (from faucet)
- [ ] Created `.env` file with credentials
- [ ] MetaMask connected to Arbitrum Sepolia network

---

## Next Steps

Once you have everything:
1. Create `.env` file with your credentials
2. Run: `npx hardhat run scripts/deploy.cjs --network arbitrumSepolia`
3. Copy the deployed contract address
4. Update `client/src/lib/contracts.ts` with the address
5. Test the app!

---

## Need Help?

- **Infura Support:** https://infura.io/docs
- **Alchemy Support:** https://docs.alchemy.com
- **Arbitrum Docs:** https://docs.arbitrum.io
- **MetaMask Support:** https://support.metamask.io

