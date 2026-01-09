# 💰 How to Get ETH on Arbitrum Mainnet

You need ETH on Arbitrum Mainnet to pay for gas fees. Here are your options:

---

## Option 1: Bridge ETH from Ethereum Mainnet (If you have ETH)

### Using Arbitrum Bridge:
1. Go to: **https://bridge.arbitrum.io/**
2. Connect your wallet
3. Select **"Ethereum Mainnet"** → **"Arbitrum One"**
4. Enter amount (you only need ~0.001-0.01 ETH for gas)
5. Click "Move funds to Arbitrum One"
6. Approve transaction in MetaMask
7. Wait 7-10 minutes for bridge to complete

### Using Other Bridges:
- **Hop Protocol:** https://app.hop.exchange/
- **Across Protocol:** https://across.to/
- **Orbiter Finance:** https://www.orbiter.finance/

---

## Option 2: Buy ETH and Send to Arbitrum

1. **Buy ETH** on an exchange (Coinbase, Binance, etc.)
2. **Withdraw to Ethereum Mainnet** (your wallet address)
3. **Bridge to Arbitrum** using Option 1 above

---

## Option 3: Use a DEX on Arbitrum (If you have other tokens)

If you have USDC, USDT, or other tokens on Arbitrum:
1. Use a DEX like Uniswap on Arbitrum
2. Swap some tokens for ETH
3. You'll have ETH for gas

---

## ⚡ Quickest Option

**If you already have ETH on Ethereum Mainnet:**
1. Go to: https://bridge.arbitrum.io/
2. Bridge ~0.01 ETH to Arbitrum (takes 7-10 minutes)
3. Then deploy!

**If you don't have ETH:**
1. Buy ETH on an exchange
2. Send to your wallet on Ethereum Mainnet
3. Bridge to Arbitrum
4. Deploy!

---

## 💡 Gas Cost Estimate

- **Deployment:** ~$2-5 on Arbitrum (much cheaper than Ethereum!)
- **You need:** ~0.001-0.01 ETH on Arbitrum for deployment

---

## ✅ After You Have ETH

Once you have ETH on Arbitrum Mainnet:

1. **Verify balance:**
   - Check MetaMask shows ETH on Arbitrum One
   - Or check: https://arbiscan.io/address/0xa9bFCC0B69f8F5e431B244eA8B766187716Dc5eB

2. **Deploy:**
   ```bash
   npx hardhat run scripts/deploy.cjs --network arbitrum
   ```

3. **Update contract address** in `client/src/lib/contracts.ts`

---

**Your wallet address:** `0xa9bFCC0B69f8F5e431B244eA8B766187716Dc5eB`

Make sure this address has ETH on Arbitrum Mainnet before deploying!

