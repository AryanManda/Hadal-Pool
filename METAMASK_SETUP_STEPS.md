# MetaMask Setup for Local Demo - Copy & Paste Guide

## ✅ Hardhat Node is Running!

The local blockchain is now running on `http://localhost:8545`

---

## Step-by-Step MetaMask Setup

### Step 1: Add Local Network to MetaMask

1. **Open MetaMask**
2. **Click the network dropdown** (top of MetaMask - shows current network)
3. **Click "Add Network"** or "Add a network manually"
4. **Fill in these EXACT values:**

```
Network Name: Hardhat Local
RPC URL: http://localhost:8545
Chain ID: 1337
Currency Symbol: ETH
Block Explorer URL: (leave empty)
```

5. **Click "Save"**
6. **Switch to "Hardhat Local"** network (select it from dropdown)

### Step 2: Import Test Account with Free ETH

The Hardhat node creates 20 accounts. Here's **Account #0** (first account):

**Address:**
```
0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
```

**Private Key (Copy this):**
```
0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

**To Import:**
1. In MetaMask, click your **account icon** (top right)
2. Click **"Import Account"**
3. Paste the private key above
4. Click **"Import"**
5. ✅ **You now have 10,000 ETH!**

---

## 🎯 You're Ready!

Now:
1. **Open** http://localhost:5000
2. **Click "Connect Wallet"**
3. **Select your imported account**
4. **Start your demo!**

---

## 💡 Demo Tips

- You have **10,000 ETH** - use any amount!
- Transactions are **instant** (local network)
- **No real money** - all test ETH
- Perfect for live demonstrations

---

## 🔧 If You Need More Accounts

The Hardhat node has 20 accounts. If you need another one, check the terminal where `npx hardhat node` is running - all private keys are listed there.

---

**Everything is set up! Just connect MetaMask and start your demo! 🚀**











