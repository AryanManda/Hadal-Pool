# Wallet Import Instructions

## Your Generated Wallet

**⚠️ KEEP THIS PRIVATE - NEVER SHARE THESE DETAILS!**

### Wallet Details:
- **Address:** `0x12B0F5e867230FA2cA412373D8895F8BE62E6749`
- **Private Key:** `0x9af9bfe5b00c89ef6f6b19cb4eb6e8d9360f658243a8c934331f18cca1343ce5`
- **Mnemonic (12 words):** `outer open blush shed armor bottom tackle depend space keen cattle patrol`

---

## Step 1: Import Wallet to MetaMask

### Option A: Import with Private Key (Easiest)
1. Open MetaMask
2. Click account icon (top right) → **"Import Account"**
3. Select **"Private Key"**
4. Paste: `0x9af9bfe5b00c89ef6f6b19cb4eb6e8d9360f658243a8c934331f18cca1343ce5`
5. Click **"Import"**

### Option B: Import with Mnemonic
1. Open MetaMask
2. Click account icon → **"Import Account"**
3. Select **"Mnemonic"**
4. Paste: `outer open blush shed armor bottom tackle depend space keen cattle patrol`
5. Click **"Import"**

---

## Step 2: Get Sepolia Test ETH

**This wallet is empty - you need to fund it with test ETH!**

### Method 1: Use Sepolia Faucets
Go to these faucets and request test ETH to your address:

**Your Address:** `0x12B0F5e867230FA2cA412373D8895F8BE62E6749`

**Faucet Links:**
- https://sepoliafaucet.com/
- https://faucet.quicknode.com/ethereum/sepolia
- https://www.alchemy.com/faucets/ethereum-sepolia
- https://www.infura.io/faucet/sepolia

**Instructions:**
1. Paste your address: `0x12B0F5e867230FA2cA412373D8895F8BE62E6749`
2. Complete any captcha/verification
3. Wait for test ETH (usually 0.1-0.5 ETH)
4. Some faucets have daily limits

### Method 2: Transfer from Another Wallet
If you have Sepolia ETH in another wallet, send it to:
`0x12B0F5e867230FA2cA412373D8895F8BE62E6749`

---

## Step 3: Switch to Sepolia Network

1. In MetaMask, click network dropdown (top)
2. Select **"Sepolia test network"**
3. If not listed, add it:
   - Network Name: `Sepolia`
   - RPC URL: `https://sepolia.infura.io/v3/YOUR_KEY` (or use Alchemy)
   - Chain ID: `11155111`
   - Currency Symbol: `ETH`
   - Block Explorer: `https://sepolia.etherscan.io`

---

## Step 4: Verify Balance

1. Make sure you're on Sepolia network
2. Check your balance in MetaMask
3. You should see your test ETH (after funding from faucets)

---

## Step 5: Use in Privacy Mixer App

1. Open the app: `http://localhost:5000`
2. Click **"Connect Wallet"**
3. Select the imported wallet
4. Approve connection
5. You should see your address and balance
6. Now you can make deposits!

---

## Security Notes

⚠️ **IMPORTANT:**
- This is a TEST wallet - only use on testnets
- Never use this wallet on mainnet
- Never share your private key or mnemonic
- This wallet was generated for testing only
- Delete this file after importing if you want extra security

---

## Troubleshooting

**"Insufficient funds" error:**
- Make sure you got test ETH from faucets
- Check you're on Sepolia network (not mainnet)
- Wait a few minutes for faucet transactions to confirm

**"Wrong network" error:**
- Switch MetaMask to Sepolia (Chain ID: 11155111)
- Make sure the app detects Sepolia network

**"Contract not deployed" error:**
- You still need to deploy the contract to Sepolia
- See `SEPOLIA_QUICK_START.md` for deployment instructions






