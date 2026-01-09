# ✅ Today's Todo List - Prepare for Tomorrow's Deployment

**Goal:** Get everything ready today so tomorrow's deployment is smooth and fast!

---

## 📍 File Locations Reference

| What | Where |
|------|-------|
| **Deployment Script** | `scripts/deploy.cjs` |
| **Contract Addresses** | `client/src/lib/contracts.ts` |
| **Environment Variables** | `.env` (create this file) |
| **Example Env File** | `env.example` |
| **Hardhat Config** | `hardhat.config.cjs` |
| **Credentials Guide** | `DEPLOYMENT_CREDENTIALS_GUIDE.md` |
| **This Todo List** | `TODAY_TODO_LIST.md` |

---

## 🎯 MUST DO TODAY (30-45 minutes)

### ✅ 1. Get Your Credentials (15 minutes)

- [ ] **Get RPC URL** (choose one):
  - [ ] Option A: Infura → https://infura.io → Create project → Select "Arbitrum Sepolia" → Copy URL
  - [ ] Option B: Alchemy → https://alchemy.com → Create app → Select "Arbitrum Sepolia" → Copy URL
  - [ ] Option C: Use public RPC: `https://sepolia-rollup.arbitrum.io/rpc`
  
- [ ] **Get Private Key**:
  - [ ] Open MetaMask
  - [ ] Create a NEW test account (don't use main wallet!)
  - [ ] Account icon → Account details → Show private key → Copy it
  
- [ ] **Get Arbiscan API Key** (optional but recommended):
  - [ ] Go to https://arbiscan.io → Sign up → API-KEYs → Add → Copy key
  
- [ ] **Get Test ETH**:
  - [ ] Switch MetaMask to Arbitrum Sepolia network (Chain ID: 421614)
  - [ ] Go to https://faucet.quicknode.com/arbitrum/sepolia
  - [ ] Enter your wallet address → Get free test ETH
  - [ ] Wait 1-2 minutes for ETH to arrive

**📝 Location:** See `DEPLOYMENT_CREDENTIALS_GUIDE.md` for detailed steps

---

### ✅ 2. Create `.env` File (5 minutes)

- [ ] Create `.env` file in project root (same folder as `package.json`)
- [ ] Copy this template and fill in your values:

```env
# Arbitrum Sepolia RPC URL
ARBITRUM_SEPOLIA_RPC_URL=https://arbitrum-sepolia.infura.io/v3/YOUR_PROJECT_ID
# OR use Alchemy: https://arb-sepolia.g.alchemy.com/v2/YOUR_API_KEY
# OR use public: https://sepolia-rollup.arbitrum.io/rpc

# Private Key (from MetaMask test wallet - NEVER use main wallet!)
PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE

# Arbiscan API Key (optional - for contract verification)
ARBISCAN_API_KEY=your_arbiscan_api_key

# Gas Reporting
REPORT_GAS=true
```

**📝 Location:** Create `.env` in root folder (next to `package.json`)

---

### ✅ 3. Test Build (5 minutes)

- [ ] Open terminal in project folder
- [ ] Run: `npm run build`
- [ ] Check for errors
- [ ] Verify `dist/public/` folder was created

**📝 Location:** Run command in project root

---

### ✅ 4. Test App Locally (5 minutes)

- [ ] Make sure app is running: `npm run dev`
- [ ] Open browser to: http://localhost:5000
- [ ] Verify:
  - [ ] App loads without errors
  - [ ] Deposit page shows "Hadal Pool" branding
  - [ ] Privacy Fund info appears at bottom of deposit page
  - [ ] No console errors

**📝 Location:** App runs on http://localhost:5000

---

### ✅ 5. Test Deployment to Arbitrum Sepolia (15-20 minutes)

- [ ] Make sure `.env` file is created with your credentials
- [ ] Run deployment: `npx hardhat run scripts/deploy.cjs --network arbitrumSepolia`
- [ ] Wait for deployment to complete
- [ ] Copy the **Proxy address** from the output (this is your contract address)
- [ ] Update contract address:
  - [ ] Open `client/src/lib/contracts.ts`
  - [ ] Find `arbitrumSepolia: ""`
  - [ ] Replace with: `arbitrumSepolia: "0xYOUR_PROXY_ADDRESS"`
- [ ] Restart app: Stop current `npm run dev`, then run `npm run dev` again
- [ ] Test in browser:
  - [ ] Connect MetaMask to Arbitrum Sepolia
  - [ ] Try making a small deposit (0.1 ETH)
  - [ ] Verify transaction works

**📝 Location:** 
- Deployment: Run `npx hardhat run scripts/deploy.cjs --network arbitrumSepolia` in terminal
- Contract address: `client/src/lib/contracts.ts` (line 6)

---

## 🟡 SHOULD DO TODAY (15-20 minutes)

### ✅ 6. Verify Everything Works (10 minutes)

- [ ] Test deposit flow on Arbitrum Sepolia
- [ ] Verify transaction appears on Arbiscan
- [ ] Check that Privacy Fund info displays correctly
- [ ] Test with different amounts
- [ ] Verify no errors in browser console

**📝 Location:** Test at http://localhost:5000

---

### ✅ 7. Document Deployment Info (5 minutes)

- [ ] Open `PREPARE_TODAY_CHECKLIST.md` (line 148)
- [ ] Create `DEPLOYMENT_INFO.md` file
- [ ] Fill in:
  - [ ] Date: Tomorrow's date
  - [ ] Network: Arbitrum Sepolia (for testing) or Arbitrum One (for production)
  - [ ] Contract Address: (fill after deployment)
  - [ ] RPC URL: (your RPC URL)
  - [ ] Deployer Address: (your MetaMask test wallet address)

**📝 Location:** Create `DEPLOYMENT_INFO.md` in project root

---

## 🟢 NICE TO HAVE (Optional - 10 minutes)

### ✅ 8. Prepare for Tomorrow (Optional)

- [ ] Read `DEPLOYMENT_CREDENTIALS_GUIDE.md` fully
- [ ] Bookmark important links:
  - [ ] Infura/Alchemy dashboard
  - [ ] Arbiscan: https://arbiscan.io
  - [ ] Arbitrum Sepolia faucet
- [ ] Test screen sharing (if doing remote deployment)
- [ ] Have coffee/water ready 😊

**📝 Location:** All guides are in project root folder

---

## 📋 Quick Command Reference

```bash
# Test build
npm run build

# Run app locally
npm run dev

# Deploy to Arbitrum Sepolia
npx hardhat run scripts/deploy.cjs --network arbitrumSepolia

# Verify contract (after deployment)
npx hardhat verify --network arbitrumSepolia <IMPLEMENTATION_ADDRESS>
npx hardhat verify --network arbitrumSepolia <PROXY_ADDRESS> <IMPLEMENTATION_ADDRESS> "0x"
```

---

## ✅ Final Checklist Before Tomorrow

- [ ] ✅ Got all credentials (RPC URL, Private Key, API Key)
- [ ] ✅ Created `.env` file with credentials
- [ ] ✅ Test build works (`npm run build`)
- [ ] ✅ App runs locally (`npm run dev`)
- [ ] ✅ Deployed to Arbitrum Sepolia testnet
- [ ] ✅ Updated contract address in `client/src/lib/contracts.ts`
- [ ] ✅ Tested deposit flow on testnet
- [ ] ✅ Everything works!

---

## 🚨 If Something Fails

**Build fails?**
- Check for TypeScript errors: `npx tsc --noEmit`
- Fix errors before tomorrow

**Deployment fails?**
- Check `.env` file has correct values
- Verify you have test ETH on Arbitrum Sepolia
- Check RPC URL is correct

**App won't start?**
- Make sure port 5000 is not in use
- Check `node_modules` exists: `npm install`
- Restart terminal and try again

---

## 📞 Need Help?

- **Credentials Guide:** `DEPLOYMENT_CREDENTIALS_GUIDE.md`
- **Full Checklist:** `PREPARE_TODAY_CHECKLIST.md`
- **Arbitrum Guide:** `ARBITRUM_DEPLOYMENT_GUIDE.md`

---

**🎯 Goal:** By end of today, you should be able to deploy in your sleep! 💪

Good luck! You've got this! 🚀

