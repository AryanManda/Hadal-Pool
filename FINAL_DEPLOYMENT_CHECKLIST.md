# 🚀 Final Deployment Checklist - Arbitrum Mainnet

**Date:** _______________  
**Network:** Arbitrum One (Mainnet)  
**Chain ID:** 42161

---

## ✅ Pre-Deployment Checklist

### 1. Set Up Ledger Hardware Wallets

#### Gas Wallet (Ledger) - For Deployment
**Purpose:** This Ledger wallet pays for contract deployment gas fees.

**Step-by-Step Setup:**

1. **Set Up Ledger Nano:**
   - Connect your Ledger Nano device to computer via USB
   - Unlock Ledger with your PIN
   - Open **"Ethereum"** app on Ledger (or install it from Ledger Live if not installed)
   - Make sure Ledger shows **"Application is ready"**
   - **IMPORTANT:** Use a dedicated Ledger account/derivation path for deployment

2. **Install Required Software:**
   ```bash
   # Install Ledger support for Hardhat
   npm install --save-dev @ledgerhq/hw-transport-node-hid @ledgerhq/hw-app-eth
   ```

3. **Connect Ledger via MetaMask (Easier Method):**
   - Open MetaMask browser extension
   - Click account icon → "Connect Hardware Wallet"
   - Select "Ledger"
   - Follow prompts to connect your Ledger
   - Select the account you want to use for deployment
   - **Name it "Gas Wallet" or "Deployment Wallet"** in MetaMask
   - ⚠️ **IMPORTANT:** Ledger private keys are NEVER exposed - transactions must be approved on Ledger

4. **Get the Wallet Address:**
   - In MetaMask, the connected Ledger account will show the address
   - Copy the wallet address (starts with `0x...`)
   - You'll need this to verify balance and for deployment records
   - **Note:** You cannot export private key from Ledger (this is by design for security)

5. **For Deployment:**
   - You'll use Ledger Live or Ledger with MetaMask for transactions
   - Each transaction must be approved on the Ledger device itself
   - Deployment will require multiple approvals (one for each contract deployment)

#### Funds Wallet (Ledger) - For Contract Operations
**Purpose:** This Ledger wallet holds funds for contract operations (if needed).

**Step-by-Step Setup:**

1. **Set Up Second Ledger Account (or use different device):**
   - Use a different account on the same Ledger (different derivation path)
   - OR use a separate Ledger device (recommended for separation)
   - Open Ethereum app on Ledger
   - Make sure it shows "Application is ready"

2. **Connect Funds Wallet:**
   - In MetaMask → "Connect Hardware Wallet" → "Ledger"
   - Select a different account or use the second Ledger device
   - **Name it "Funds Wallet" or "Operations Wallet"** in MetaMask

3. **Get the Wallet Address:**
   - Copy the wallet address (starts with `0x...`)
   - You'll need this address for operations
   - **Note:** Private key is never exposed (hardware wallet security)

**✅ Checklist:**
- [ ] Ledger Nano connected and unlocked
- [ ] Ethereum app installed and open on Ledger (shows "Application is ready")
- [ ] Gas Wallet (Ledger) connected to MetaMask
- [ ] Gas Wallet address copied: `0x...`
- [ ] Funds Wallet (Ledger) connected to MetaMask (if separate)
- [ ] Funds Wallet address copied: `0x...` (if separate)
- [ ] Ledger hardware support installed: `@ledgerhq/hw-transport-node-hid`

---

### 2. Add ETH to Arbitrum Mainnet

**You need ETH on Arbitrum Mainnet for gas fees (~0.01-0.05 ETH recommended)**

#### Option A: Bridge ETH from Ethereum Mainnet (If you have ETH there)

**Step-by-Step:**

1. **Make sure you have ETH on Ethereum Mainnet:**
   - Check your wallet balance on Ethereum Mainnet
   - You need at least 0.01-0.02 ETH to bridge (plus gas for bridging)

2. **Go to Arbitrum Bridge:**
   - Visit: **https://bridge.arbitrum.io/**
   - Connect your MetaMask wallet (which is connected to your Ledger)
   - **Make sure Ledger is connected and Ethereum app is open**
   - Make sure you're connected to **Ethereum Mainnet** (not a testnet)

3. **Bridge ETH:**
   - Select **"Ethereum"** as source network
   - Select **"Arbitrum One"** as destination network
   - Enter amount: **0.01-0.05 ETH** (enough for deployment + some buffer)
   - Click **"Move funds to Arbitrum One"** or **"Bridge"**

4. **Approve Transaction on Ledger:**
   - MetaMask will pop up asking to approve
   - **On your Ledger device**, review the transaction details displayed
   - **Press both buttons on Ledger** to approve the transaction
   - Make sure transaction details match (amount, destination, network)
   - Wait for transaction to be confirmed on Ethereum (~1-2 minutes)
   - **Note:** All transactions require physical approval on Ledger device

5. **Wait for Bridge:**
   - Bridge takes **7-10 minutes** to complete
   - You'll see a progress indicator on the bridge page
   - Don't close the page until bridge completes

6. **Verify ETH Arrived:**
   - Switch MetaMask to **Arbitrum One** network (Ledger should still be connected)
   - Check your Ledger wallet balance - you should see ETH
   - Or check on Arbiscan: https://arbiscan.io/address/YOUR_LEDGER_WALLET_ADDRESS
   - **Note:** Same Ledger address works on all networks (Arbitrum, Ethereum, etc.)

**Alternative Bridges (if Arbitrum bridge is slow):**
- **Hop Protocol:** https://app.hop.exchange/
- **Across Protocol:** https://across.to/
- **Orbiter Finance:** https://www.orbiter.finance/

#### Option B: Buy ETH and Send to Arbitrum

**Step-by-Step:**

1. **Buy ETH on an Exchange:**
   - Use Coinbase, Binance, Kraken, or any exchange
   - Buy at least 0.02-0.05 ETH (to cover bridging fees + deployment)

2. **Withdraw to Your Wallet:**
   - Withdraw ETH to your Ledger Gas Wallet address
   - Make sure to withdraw to **Ethereum Mainnet** (not Arbitrum directly)
   - Wait for withdrawal to complete (usually 5-30 minutes)

3. **Bridge to Arbitrum:**
   - Follow **Option A** steps 2-6 above
   - Bridge your ETH from Ethereum Mainnet to Arbitrum One

#### Option C: Use a DEX on Arbitrum (If you have other tokens)

**If you already have USDC, USDT, or other tokens on Arbitrum:**

1. **Go to Uniswap on Arbitrum:**
   - Visit: https://app.uniswap.org/
   - Connect your wallet
   - Make sure you're on **Arbitrum One** network

2. **Swap Tokens for ETH:**
   - Select your token (USDC, USDT, etc.) as "From"
   - Select ETH as "To"
   - Enter amount (swap enough for gas: ~0.01-0.05 ETH)
   - Click "Swap"
   - Approve and confirm transaction

3. **Verify ETH Balance:**
   - Check your wallet now has ETH on Arbitrum

**✅ Checklist:**
- [ ] Ledger Gas Wallet has ETH on Arbitrum Mainnet
- [ ] Balance: **~0.01 ETH minimum** (0.02-0.05 ETH recommended)
- [ ] Verified balance on Arbiscan: https://arbiscan.io/address/YOUR_LEDGER_WALLET_ADDRESS
- [ ] MetaMask connected to Arbitrum One network (Chain ID: 42161)
- [ ] Ledger connected via MetaMask and showing correct address

---

### 3. Credentials Ready
- [ ] **Ledger Nano (Gas Wallet)** - Connected and ready for deployment
- [ ] **Gas Wallet (Ledger) Address** - To verify ETH balance
- [ ] **Funds Wallet (Ledger) Address** - For operations (if needed)
- [ ] **RPC URL** - Already configured ✅
- [ ] **Arbiscan API Key** - Already configured ✅
- [ ] **Ledger Hardware Support Installed** - `@ledgerhq/hw-transport-node-hid` ✅

**⚠️ IMPORTANT:** Ledger wallets do NOT use private keys. All transactions require physical approval on the Ledger device.

### 3. Code Ready
- [ ] All code changes committed
- [ ] Privacy score fixed for USDC/USDT ✅
- [ ] Arbitrum token addresses added ✅
- [ ] Privacy Fund info updated ✅
- [ ] App tested locally ✅

---

## 📋 Deployment Steps

### Step 1: Prepare Ledger for Deployment

**⚠️ IMPORTANT:** With Ledger, you cannot use a private key in `.env` file. Instead, we'll use Ledger directly for signing transactions.

**Option A: Use Ledger with MetaMask (Recommended - Easier)**

1. **Connect Ledger to MetaMask:**
   - [ ] Open MetaMask → "Connect Hardware Wallet" → "Ledger"
   - [ ] Follow prompts to connect
   - [ ] Select your Gas Wallet account
   - [ ] Verify address matches your intended deployment wallet

2. **Update Hardhat Config for Ledger (if needed):**
   - [ ] Hardhat will use MetaMask provider, which will prompt Ledger for approval
   - [ ] Each deployment transaction will require Ledger approval

**Option B: Use Ledger Directly with Hardhat (Advanced)**

1. **Install Ledger Support:**
   ```bash
   npm install --save-dev @ledgerhq/hw-transport-node-hid @ledgerhq/hw-app-eth
   ```

2. **Update Hardhat Config:**
   - We'll need to configure Hardhat to use Ledger directly
   - This requires modifying `hardhat.config.cjs` to use Ledger signer

**For Now:** We'll use MetaMask with Ledger (Option A) as it's simpler.

- [ ] Verify RPC URL is correct:
  ```env
  ARBITRUM_RPC_URL=https://arbitrum-mainnet.infura.io/v3/b56cd0d408e24fd0a686ecb470e28cc3
  ```
- [ ] Verify Arbiscan API Key:
  ```env
  ARBISCAN_API_KEY=ATD2NVVZFAQ4YKB3VNTN6CA1Z82GIH2ASH
  ```

### Step 2: Verify Ledger Gas Wallet Balance

**How to Check Balance:**

1. **In MetaMask (with Ledger connected):**
   - Switch to **Arbitrum One** network (Chain ID: 42161)
   - Select your Ledger Gas Wallet account (connected via hardware wallet)
   - Check ETH balance displayed
   - **Note:** Make sure Ledger is connected and Ethereum app is open

2. **On Arbiscan:**
   - Go to: https://arbiscan.io/address/YOUR_LEDGER_WALLET_ADDRESS
   - Replace `YOUR_LEDGER_WALLET_ADDRESS` with your Ledger address
   - Check "Balance" section

**Requirements:**
- [ ] Ledger Gas Wallet has ETH on Arbitrum Mainnet
- [ ] Minimum: **0.01 ETH** (for basic deployment)
- [ ] Recommended: **0.02-0.05 ETH** (for deployment + buffer)
- [ ] If no ETH: Follow "Add ETH to Arbitrum Mainnet" instructions above
- [ ] Ledger connected and Ethereum app open ("Application is ready")

### Step 3: Deploy Contract with Ledger

**Before Deploying:**
- [ ] Ledger Nano is connected via USB
- [ ] Ledger is unlocked with PIN
- [ ] Ethereum app is open on Ledger (shows "Application is ready")
- [ ] Ledger Gas Wallet is connected via MetaMask (if using MetaMask method)
- [ ] MetaMask is connected to Arbitrum One network

**Deployment Steps:**

**Method 1: Using MetaMask with Ledger (Recommended - Easier)**

1. **Prepare:**
   - [ ] Connect Ledger to MetaMask (if not already)
   - [ ] Select Gas Wallet account in MetaMask
   - [ ] Make sure MetaMask is on Arbitrum One network

2. **Deploy:**
   - [ ] Open terminal in project root
   - [ ] Run deployment command:
     ```bash
     npx hardhat run scripts/deploy.cjs --network arbitrum
     ```
   - [ ] **For each deployment transaction:**
     - MetaMask will pop up asking for approval
     - **On your Ledger device**, review the transaction details
     - **Approve on Ledger** (press both buttons)
     - Verify transaction details match before approving
     - Wait for transaction confirmation

3. **Wait for Deployment:**
   - [ ] Implementation contract deployment (1 transaction - approve on Ledger)
   - [ ] Proxy contract deployment (1 transaction - approve on Ledger)
   - [ ] Contract initialization (1 transaction - approve on Ledger)
   - [ ] Total: ~3 transactions, each requiring Ledger approval
   - [ ] Wait for all confirmations (~2-5 minutes total)

4. **Get Contract Address:**
   - [ ] **Copy the Proxy Address** from output (this is your contract address!)
   - [ ] Also copy Implementation address (for verification)

**Method 2: Using Ledger Directly with Hardhat (Advanced)**

If you prefer to use Ledger directly without MetaMask, you'll need to:
- [ ] Configure `hardhat.config.cjs` to use Ledger transport
- [ ] This requires more setup but gives more control
- [ ] Contact for detailed instructions if needed

**✅ Checkpoint:** Contract deployed, all transactions approved on Ledger

### Step 4: Update Contract Address
- [ ] Open `client/src/lib/contracts.ts`
- [ ] Find line 5: `arbitrum: ""`
- [ ] Replace with: `arbitrum: "0x[YOUR_PROXY_ADDRESS]"`
- [ ] Save file

### Step 5: Verify Deployment
- [ ] Check contract on Arbiscan:
  - Go to: https://arbiscan.io/address/YOUR_PROXY_ADDRESS
  - Verify contract is verified (or verify it manually)
- [ ] Test contract functions:
  - Check `totalPools()` returns 3
  - Check pools are active

### Step 6: Verify Contract (Optional but Recommended)
- [ ] Get Implementation address from deployment output
- [ ] Run verification:
  ```bash
  npx hardhat verify --network arbitrum <IMPLEMENTATION_ADDRESS>
  ```
- [ ] Verify Proxy:
  ```bash
  npx hardhat verify --network arbitrum <PROXY_ADDRESS> <IMPLEMENTATION_ADDRESS> "0x"
  ```

---

## 🌐 Cloudflare Pages Deployment (Frontend)

### Step 7: Build Application for Production
- [ ] Open terminal in project root
- [ ] Run build command:
  ```bash
  npm run build
  ```
- [ ] Wait for build to complete (~1-3 minutes)
- [ ] Verify build output exists in `dist/public/` folder
- [ ] Check for build errors (should see "✓ built in Xs")

### Step 8: Set Up Cloudflare Account

**Option A: Using Existing Account**
- [ ] Go to Cloudflare Dashboard: https://dash.cloudflare.com/
- [ ] Login with your Cloudflare account
- [ ] Navigate to "Workers & Pages" in left sidebar
- [ ] Click "Create application"
- [ ] Click "Pages" tab

**Option B: Create New Account (Free)**
- [ ] Go to: https://dash.cloudflare.com/sign-up
- [ ] Sign up with email (free plan is fine)
- [ ] Verify email if needed
- [ ] Navigate to "Workers & Pages" → "Create application" → "Pages"

**✅ Checkpoint:** Cloudflare account ready, Pages section open

### Step 9: Deploy to Cloudflare Pages

**Method 1: Direct Upload (Easiest for Today)**

1. **Prepare Build Folder:**
   - [ ] Navigate to `dist/public` folder in File Explorer
   - [ ] Verify all files are there (index.html, assets folder, etc.)
   - [ ] You can zip this folder if needed (optional)

2. **In Cloudflare Dashboard:**
   - [ ] Click "Create a project"
   - [ ] Choose "Upload assets" (not Git)
   - [ ] Drag and drop the entire `dist/public` folder contents
   - [ ] OR click "Browse" and select the `dist/public` folder
   - [ ] Click "Deploy site" or "Upload and Deploy"

3. **Wait for Deployment:**
   - [ ] Cloudflare will process files (30 seconds - 2 minutes)
   - [ ] You'll see a progress indicator
   - [ ] When complete, you'll get a URL like: `your-project-abc123.pages.dev`

4. **Test the Site:**
   - [ ] Click the deployment URL
   - [ ] Site should load
   - [ ] Check that app loads without errors
   - [ ] Try connecting MetaMask (on Arbitrum One network)
   - [ ] Verify contract address shows correctly

**Method 2: Git Integration (Better for Future Updates)**

1. **Push Code to GitHub (if not already):**
   ```bash
   git add .
   git commit -m "Ready for Cloudflare deployment"
   git push origin main
   ```

2. **In Cloudflare Dashboard:**
   - [ ] Click "Create a project"
   - [ ] Choose "Connect to Git"
   - [ ] Authorize GitHub/GitLab (if first time)
   - [ ] Select your repository
   - [ ] Click "Begin setup"

3. **Configure Build Settings:**
   - [ ] **Framework preset:** Vite (should auto-detect)
   - [ ] **Build command:** `npm run build`
   - [ ] **Build output directory:** `dist/public`
   - [ ] **Root directory:** `/` (leave empty or set to root)

4. **Environment Variables (Optional):**
   - [ ] Click "Environment variables" (if needed)
   - [ ] Add any custom variables (usually not needed for static build)
   - [ ] Note: Contract addresses are already in the built code

5. **Deploy:**
   - [ ] Click "Save and Deploy"
   - [ ] Wait for build and deployment (~2-5 minutes)
   - [ ] Site will be live at `your-project.pages.dev`

**✅ Checkpoint:** Frontend deployed and accessible at Cloudflare Pages URL

### Step 10: Configure Custom Domain (Optional)

**If you have a domain:**

1. **Add Domain in Cloudflare:**
   - [ ] Go to your Pages project
   - [ ] Click "Custom domains" tab
   - [ ] Click "Set up a custom domain"
   - [ ] Enter your domain: `yourdomain.com` (or `www.yourdomain.com`)
   - [ ] Click "Continue"

2. **DNS Configuration:**
   - [ ] Cloudflare will show DNS records needed
   - [ ] **Option A: Use Cloudflare Nameservers (Recommended)**
     - Cloudflare will provide nameservers (e.g., `lara.ns.cloudflare.com`)
     - Go to your domain registrar
     - Update nameservers to Cloudflare's provided ones
     - Wait 5-15 minutes for propagation
   - [ ] **Option B: Add CNAME Record (If domain managed elsewhere)**
     - Type: `CNAME`
     - Name: `@` or `www`
     - Target: `your-project.pages.dev`
     - Proxy: ✅ (orange cloud) - Enable this

3. **SSL/TLS Setup (Automatic):**
   - [ ] Cloudflare automatically provisions SSL certificate (free)
   - [ ] Go to SSL/TLS settings in Cloudflare dashboard
   - [ ] Set encryption mode: **Full (strict)**
   - [ ] Enable "Always Use HTTPS"
   - [ ] SSL is usually active within 5 minutes

4. **Verify Domain:**
   - [ ] Wait 5-15 minutes for DNS propagation
   - [ ] Visit `https://yourdomain.com`
   - [ ] Should redirect to HTTPS automatically
   - [ ] Site should load correctly

**✅ Checkpoint:** Custom domain configured and working with HTTPS

### Step 11: Configure Cloudflare Settings (Optimization)

1. **Security Settings:**
   - [ ] Go to your domain → SSL/TLS
   - [ ] Encryption mode: **Full (strict)**
   - [ ] Always Use HTTPS: **On**
   - [ ] Go to Security → Security level: **Medium**
   - [ ] Bot Fight Mode: **On** (helps prevent spam)

2. **Performance Settings:**
   - [ ] Go to Speed → Auto Minify
   - [ ] Enable: **JavaScript, CSS, HTML** (all three)
   - [ ] Brotli: **On**
   - [ ] Go to Caching → Caching level: **Standard**
   - [ ] Browser Cache TTL: **4 hours**

3. **Cache Rules (Optional):**
   - [ ] Create cache rule for static assets:
     - URL pattern: `*/assets/*`
     - Cache TTL: 1 year
   - [ ] Create cache rule for HTML:
     - URL pattern: `/*.html` or `/`
     - Cache TTL: 4 hours

**✅ Checkpoint:** Cloudflare optimized for security and performance

### Step 12: Update Frontend with Contract Address

**After contract deployment, update the frontend:**

1. **Update Contract Address in Code:**
   - [ ] Open `client/src/lib/contracts.ts`
   - [ ] Find line with `arbitrum: ""`
   - [ ] Replace with: `arbitrum: "0x[YOUR_PROXY_ADDRESS]"`
   - [ ] Save file

2. **Rebuild:**
   ```bash
   npm run build
   ```

3. **Redeploy to Cloudflare:**
   - [ ] If using Direct Upload: Upload `dist/public` again
   - [ ] If using Git: Push changes, Cloudflare auto-deploys

**✅ Checkpoint:** Frontend updated with deployed contract address

---

## 📝 Cloudflare Deployment Information to Record

After Cloudflare deployment, fill in:

- [ ] **Cloudflare Pages URL:** `https://your-project.pages.dev`
- [ ] **Custom Domain (if configured):** `https://yourdomain.com`
- [ ] **Deployment Date:** _______________
- [ ] **Cloudflare Account Email:** _______________
- [ ] **Project Name:** _______________
- [ ] **SSL Status:** ✅ Active (automatic)
- [ ] **HTTPS Enabled:** ✅ Yes

---

## 🧪 Post-Deployment Testing

### Test 1: Cloudflare Deployment (Frontend)
- [ ] Visit Cloudflare Pages URL: `https://your-project.pages.dev`
- [ ] Site loads correctly (no 404 errors)
- [ ] Check browser console (F12) - no errors
- [ ] Verify HTTPS is enabled (padlock icon in browser)
- [ ] Test on mobile device (responsive design)
- [ ] Verify custom domain works (if configured): `https://yourdomain.com`

### Test 2: App Connection
- [ ] Open Cloudflare Pages URL (not localhost)
- [ ] Connect MetaMask to Arbitrum One (Chain ID: 42161)
- [ ] Verify app loads without errors
- [ ] Check that contract address shows correctly (should be your deployed Arbitrum address)

### Test 3: ETH Deposit
- [ ] Select ETH currency
- [ ] Enter amount (minimum 0.1 ETH)
- [ ] Select time lock (1 hour, 4 hours, or 24 hours)
- [ ] Click "Deposit"
- [ ] Approve transaction in MetaMask
- [ ] Verify transaction succeeds
- [ ] Check transaction on Arbiscan

### Test 4: USDC Deposit
- [ ] Select USDC currency
- [ ] Enter amount (minimum 10 USDC)
- [ ] Verify privacy score calculates correctly
- [ ] Click "Deposit"
- [ ] Approve transaction in MetaMask
- [ ] Verify transaction succeeds

### Test 5: USDT Deposit
- [ ] Select USDT currency
- [ ] Enter amount (minimum 10 USDT)
- [ ] Verify privacy score calculates correctly
- [ ] Click "Deposit"
- [ ] Approve transaction in MetaMask
- [ ] Verify transaction succeeds

### Test 6: WBTC Deposit
- [ ] Select WBTC currency
- [ ] Enter amount (minimum 0.001 WBTC)
- [ ] Verify privacy score calculates correctly
- [ ] Click "Deposit"
- [ ] Approve transaction in MetaMask
- [ ] Verify transaction succeeds

### Test 7: Privacy Fund Info
- [ ] Scroll to bottom of deposit page
- [ ] Verify "Hadal Fund" section appears
- [ ] Verify user-beneficial messaging displays
- [ ] Verify fund balance shows correctly

---

## 📝 Deployment Information to Record

After deployment, fill in:

- [ ] **Deployment Date:** _______________
- [ ] **Network:** Arbitrum One (Mainnet)
- [ ] **Chain ID:** 42161
- [ ] **Implementation Address:** `0x...`
- [ ] **Proxy Address (Contract Address):** `0x...`
- [ ] **Deployer Address:** `0x...`
- [ ] **Gas Used:** _______________
- [ ] **Transaction Hash:** `0x...`
- [ ] **Arbiscan Link:** https://arbiscan.io/address/0x...

---

## 🔍 Verification Checklist

- [ ] Contract deployed successfully
- [ ] Contract address updated in code
- [ ] Contract verified on Arbiscan (optional)
- [ ] App connects to Arbitrum network
- [ ] ETH deposits work
- [ ] USDC deposits work
- [ ] USDT deposits work
- [ ] WBTC deposits work
- [ ] Privacy scores calculate correctly for all currencies
- [ ] Privacy Fund info displays correctly
- [ ] All transactions appear on Arbiscan

---

## 🚨 Troubleshooting

### Cloudflare Deployment Issues

**Build Fails on Cloudflare:**
- [ ] Check build command is correct: `npm run build`
- [ ] Verify build output directory: `dist/public`
- [ ] Check Node.js version (should be 18+)
- [ ] Review build logs in Cloudflare dashboard
- [ ] **Solution:** Build locally first to catch errors: `npm run build`

**Upload Fails:**
- [ ] Check file size (Cloudflare has limits)
- [ ] Verify you're uploading the `dist/public` folder contents
- [ ] Try zipping the folder first (if large)
- [ ] **Solution:** Use Git integration instead if files are too large

**Site Shows 404 Errors:**
- [ ] Verify `index.html` is in the root of `dist/public`
- [ ] Check Cloudflare build output directory setting
- [ ] Verify all asset paths are correct
- [ ] **Solution:** Rebuild and redeploy

**Site Loads but Shows White Screen:**
- [ ] Check browser console for JavaScript errors (F12)
- [ ] Verify contract address is set correctly
- [ ] Check network tab for failed requests
- [ ] Verify MetaMask is connected to correct network (Arbitrum One)
- [ ] **Solution:** Check console errors, update contract address if needed

**Custom Domain Not Working:**
- [ ] Verify DNS records are correct (check Cloudflare DNS dashboard)
- [ ] Wait 15-30 minutes for DNS propagation
- [ ] Check SSL/TLS settings (should be "Full (strict)")
- [ ] Verify nameservers are set correctly at domain registrar
- [ ] **Solution:** Use `nslookup yourdomain.com` to verify DNS

**HTTPS Not Working:**
- [ ] Check SSL/TLS mode is "Full (strict)"
- [ ] Verify "Always Use HTTPS" is enabled
- [ ] Wait 5-10 minutes after enabling (certificate provisioning)
- [ ] **Solution:** Check SSL/TLS settings, wait a few minutes

### If Contract Deployment Fails:

**"Insufficient funds for gas" Error:**
- [ ] Ledger Gas Wallet doesn't have enough ETH on Arbitrum Mainnet
- [ ] **Solution:** Add more ETH to Arbitrum Mainnet (see "Add ETH to Arbitrum Mainnet" section)
- [ ] Minimum needed: 0.01 ETH, recommended: 0.02-0.05 ETH
- [ ] Verify balance on Arbiscan: https://arbiscan.io/address/YOUR_LEDGER_WALLET_ADDRESS

**"Invalid private key" or "Wrong private key" Error:**
- [ ] **With Ledger, you should NOT use private keys in `.env`**
- [ ] If using MetaMask + Ledger: Make sure Ledger is connected via MetaMask
- [ ] If deploying directly: Check Ledger is connected and Ethereum app is open
- [ ] **Solution:** Use MetaMask with Ledger (Method 1 above) - this avoids private key issues
- [ ] If using direct Ledger method: Verify `hardhat.config.cjs` is configured correctly for Ledger

**"Network error" or "RPC error":**
- [ ] Verify RPC URL is correct in `.env` file
- [ ] Check internet connection
- [ ] Try using a different RPC endpoint (Alchemy, public RPC)
- [ ] **Solution:** Update `ARBITRUM_RPC_URL` in `.env` if needed

**"Contract deployment failed":**
- [ ] Check Ledger Gas Wallet has enough ETH for gas
- [ ] Verify network is Arbitrum One (not testnet)
- [ ] Check Ledger is connected and Ethereum app is open
- [ ] Verify all transactions were approved on Ledger device
- [ ] Check Hardhat configuration is correct
- [ ] **Solution:** Review error message, check Ledger connection, add more ETH if needed, try again

**"Transaction was rejected" or "User denied transaction":**
- [ ] Transaction was rejected on Ledger device
- [ ] **Solution:** Review transaction details on Ledger screen, approve if correct
- [ ] Make sure you're pressing both buttons on Ledger to approve
- [ ] Verify transaction details match before approving

### If Contract Address Not Found:
- [ ] Verify contract address in `client/src/lib/contracts.ts`
- [ ] Make sure you're on Arbitrum One network in MetaMask
- [ ] Restart the app after updating contract address

### If Deposits Fail:
- [ ] Verify contract is deployed and active
- [ ] Check you have enough token balance
- [ ] Check you have ETH for gas fees
- [ ] Verify you're on Arbitrum One network
- [ ] Check transaction on Arbiscan for error details

---

## ✅ Final Sign-Off

- [ ] Contract deployed to Arbitrum Mainnet
- [ ] Contract verified on Arbiscan
- [ ] Frontend deployed to Cloudflare Pages
- [ ] Cloudflare Pages URL working: `https://your-project.pages.dev`
- [ ] Custom domain configured (if applicable): `https://yourdomain.com`
- [ ] HTTPS enabled and working
- [ ] All tests passed (Cloudflare deployment + contract)
- [ ] App working correctly on Cloudflare
- [ ] All currencies (ETH, USDC, USDT, WBTC) working
- [ ] Privacy scores working correctly
- [ ] Mobile responsive design works
- [ ] Ready for production use!

---

## 📞 Quick Reference

**Deployment Command:**
```bash
npx hardhat run scripts/deploy.cjs --network arbitrum
```

**Contract Address File:**
`client/src/lib/contracts.ts` (line 5)

**Arbiscan:**
https://arbiscan.io

**Arbitrum Bridge:**
https://bridge.arbitrum.io

**Alternative Bridges:**
- Hop Protocol: https://app.hop.exchange/
- Across Protocol: https://across.to/
- Orbiter Finance: https://www.orbiter.finance/

**Uniswap (for swapping tokens to ETH on Arbitrum):**
https://app.uniswap.org/

**Cloudflare:**
- Dashboard: https://dash.cloudflare.com/
- Pages: https://dash.cloudflare.com/?to=/:account/pages
- Sign up: https://dash.cloudflare.com/sign-up (free)

**Network Details:**
- Network Name: Arbitrum One
- Chain ID: 42161
- RPC URL: https://arbitrum-mainnet.infura.io/v3/b56cd0d408e24fd0a686ecb470e28cc3
- Block Explorer: https://arbiscan.io

---

**🎯 Goal:** Deploy successfully to Arbitrum Mainnet and verify all functionality works!

**Good luck! You've got this! 🚀**

