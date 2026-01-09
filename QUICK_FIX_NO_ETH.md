# ⚠️ Quick Fix: You Have 0 ETH

## The Problem
You're connected to MetaMask, but you're either:
- On the wrong network (not Hardhat Local)
- Using an account without test ETH

## ✅ Quick Fix (2 Steps)

### Step 1: Switch to Hardhat Local Network

1. **Open MetaMask** (click the extension icon)
2. **Click the network dropdown** at the top (shows "Ethereum Mainnet" or similar)
3. **If you see "Hardhat Local"** → Click it to switch
4. **If you DON'T see "Hardhat Local"** → Follow Step 1A below

#### Step 1A: Add Hardhat Local Network (if not already added)

1. In MetaMask, click **"Add Network"** or **"Add a network manually"**
2. Enter these **EXACT values**:
   ```
   Network Name: Hardhat Local
   RPC URL: http://localhost:8545
   Chain ID: 1337
   Currency Symbol: ETH
   Block Explorer URL: (leave empty)
   ```
3. Click **"Save"**
4. **Switch to "Hardhat Local"** network

### Step 2: Import Test Account with 10,000 ETH

1. In MetaMask, click your **account icon** (top right, circle with your address)
2. Click **"Import Account"**
3. Select **"Private Key"**
4. **Paste this private key:**
   ```
   0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```
5. Click **"Import"**
6. ✅ **You now have 10,000 ETH!**

### Step 3: Refresh the App

1. Go back to http://localhost:5000
2. **Refresh the page** (F5 or Ctrl+R)
3. Click **"Connect Wallet"** again
4. Select the imported account (the one with 10,000 ETH)
5. ✅ **You're ready to deposit!**

---

## 🎯 What You Should See

After setup:
- **Network:** "Hardhat Local" (in MetaMask)
- **Balance:** 10,000 ETH (in MetaMask)
- **App:** Shows your balance correctly
- **Deposits:** Work perfectly!

---

## ❓ Still Not Working?

**Check:**
- ✅ Hardhat node is running (`npx hardhat node` in terminal)
- ✅ You're on "Hardhat Local" network in MetaMask
- ✅ You imported the account with the private key above
- ✅ You refreshed the app page

**If still 0 ETH:**
- Make sure you're using the imported account (not your regular MetaMask account)
- Check that Hardhat node is still running
- Try disconnecting and reconnecting in the app

---

**You should now have 10,000 ETH and be ready to demo! 🚀**











