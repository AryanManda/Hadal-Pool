# ✅ Friday Deployment Checklist - Hadal Pool

## 📋 Before the Call (Do This Now!)

### Preparation:
- [ ] Code committed to Git
- [ ] All branding changed to "Hadal Pool" ✅
- [ ] Test build locally: `npm run build`
- [ ] Verify build output in `dist/public/` folder
- [ ] Have Cloudflare account ready (or get access from boss)
- [ ] Have RPC URLs ready (Infura/Alchemy keys)
- [ ] Have Ledger Nano ready (charged, PIN known)
- [ ] Test Ledger connection (connect and unlock)
- [ ] Read deployment guide: `CLOUDFLARE_DEPLOYMENT_FRIDAY.md`

### Information to Get from Boss:
- [ ] Cloudflare account access (email/password or invite)
- [ ] Domain name (if they have one)
- [ ] Deployment network preference (Arbitrum recommended)
- [ ] RPC provider keys (Infura/Alchemy)
- [ ] Block explorer API keys (Arbiscan/Etherscan)

---

## 🚀 During the Call (Step-by-Step)

### Step 1: Build Application (5 min)
```bash
npm run build
```
- [ ] Build completes successfully
- [ ] Check `dist/public/` folder has files

### Step 2: Cloudflare Setup (10 min)
- [ ] Login to Cloudflare dashboard
- [ ] Navigate to Pages
- [ ] Create new project
- [ ] Choose upload method (direct upload recommended for demo)

### Step 3: Deploy Frontend (10 min)
- [ ] Upload `dist/public` folder to Cloudflare Pages
- [ ] Wait for deployment
- [ ] Get deployment URL (e.g., `your-project.pages.dev`)
- [ ] Test site loads correctly

### Step 4: Custom Domain (10 min) - Optional
- [ ] Add custom domain in Cloudflare
- [ ] Configure DNS records
- [ ] Wait for SSL certificate
- [ ] Test domain works

### Step 5: Smart Contract Deployment (20 min)
- [ ] Connect Ledger Nano
- [ ] Open Ethereum app on Ledger
- [ ] Deploy contract: `npx hardhat run scripts/deploy.cjs --network arbitrum`
- [ ] Copy contract address
- [ ] Verify contract on block explorer

### Step 6: Connect Frontend to Contract (5 min)
- [ ] Update `client/src/lib/contracts.ts` with contract address
- [ ] Rebuild: `npm run build`
- [ ] Redeploy to Cloudflare

### Step 7: Final Testing (5 min)
- [ ] Test site loads
- [ ] Test wallet connection
- [ ] Test deposit flow (small test amount)
- [ ] Verify contract interaction works

---

## 📝 Quick Commands Reference

```bash
# Build frontend
npm run build

# Deploy contract (Arbitrum)
npx hardhat run scripts/deploy.cjs --network arbitrum

# Verify contract
npx hardhat verify --network arbitrum <ADDRESS> <IMPLEMENTATION> "0x"

# Test locally
npm run dev
```

---

## 🎯 Success Criteria

At the end of the call, you should have:

- [ ] ✅ Frontend deployed to Cloudflare Pages
- [ ] ✅ Site accessible via URL
- [ ] ✅ HTTPS enabled (if domain configured)
- [ ] ✅ Smart contract deployed
- [ ] ✅ Contract verified on block explorer
- [ ] ✅ Frontend connected to contract
- [ ] ✅ Basic functionality tested
- [ ] ✅ Boss has access/credentials saved

---

## ⏱️ Time Estimate

- **Total:** 65-75 minutes
- **Recommended call length:** 90 minutes (with buffer)

---

## 🆘 Troubleshooting Quick Reference

### Build Fails
- Check TypeScript errors
- Clear node_modules: `rm -rf node_modules && npm install`
- Try again

### Deployment Fails
- Verify build output directory is `dist/public`
- Check file sizes (shouldn't be empty)
- Try uploading again

### Contract Deployment Fails
- Verify Ledger is connected and Ethereum app is open
- Check RPC URL is correct
- Verify sufficient ETH for gas
- Try Arbitrum instead of Mainnet (cheaper)

### Domain Not Working
- Check DNS records
- Wait 10-15 minutes for propagation
- Verify SSL/TLS settings in Cloudflare

---

## 📧 After the Call

- [ ] Send summary email with:
  - Deployment URLs
  - Contract addresses
  - Access credentials
  - Next steps
- [ ] Document any issues encountered
- [ ] Save all credentials securely

---

**🎉 You're ready! Good luck with the deployment!**

For detailed steps, see: `CLOUDFLARE_DEPLOYMENT_FRIDAY.md`


