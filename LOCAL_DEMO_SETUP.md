# Local Demo Setup - No Real Money Needed! 🎉

## Quick Start (3 Steps)

### Step 1: Start Hardhat Local Blockchain

Open a **NEW terminal window** and run:

```bash
npx hardhat node
```

**What this does:**
- Creates a local blockchain on `http://localhost:8545`
- Generates 20 test accounts
- Each account has **10,000 free ETH** (not real money!)
- Transactions are instant

**Keep this terminal open!** The blockchain runs here.

### Step 2: Connect MetaMask to Local Network

1. **Open MetaMask**
2. **Click the network dropdown** (top of MetaMask, shows "Ethereum Mainnet" or similar)
3. **Click "Add Network"** or "Add a network manually"
4. **Enter these exact values:**
   ```
   Network Name: Hardhat Local
   RPC URL: http://localhost:8545
   Chain ID: 1337
   Currency Symbol: ETH
   Block Explorer URL: (leave empty)
   ```
5. **Click "Save"**
6. **Switch to "Hardhat Local" network** (select it from dropdown)

### Step 3: Import Test Account with Free ETH

1. **Look at the terminal** where `npx hardhat node` is running
2. You'll see output like:
   ```
   Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
   Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```
3. **Copy the private key** of Account #0 (or any account)
4. **In MetaMask:**
   - Click the account icon (top right)
   - Click "Import Account"
   - Paste the private key
   - Click "Import"
5. ✅ **You now have 10,000 ETH!** (fake, for demo only)

---

## Verify Contract is Deployed

The contract should already be deployed. Check:

```bash
cat deployments/hardhat.json
```

If you see a proxy address, you're good! If not, deploy it:

```bash
npx hardhat run scripts/deploy.cjs --network hardhat
```

---

## You're Ready to Demo! 🚀

Now you can:
- ✅ Make deposits with fake ETH
- ✅ Test withdrawals
- ✅ See all features working
- ✅ **No real money involved!**

---

## For Your Boss Demo

**What to Say:**
- "We're using a local test network for this demonstration"
- "All transactions use test ETH - no real money"
- "In production, this works identically on Ethereum mainnet"
- "The functionality is the same, we're just using test funds for safety"

**Benefits to Highlight:**
- Instant transactions (no waiting)
- Unlimited test funds for testing
- Perfect for demonstrations
- Zero risk

---

## Troubleshooting

**"Contract not deployed" error?**
- Run: `npx hardhat run scripts/deploy.cjs --network hardhat`
- Make sure Hardhat node is running first

**MetaMask can't connect?**
- Make sure `npx hardhat node` is running
- Check RPC URL is exactly `http://localhost:8545`
- Chain ID must be `1337`

**No ETH showing?**
- Import a Hardhat account (see Step 3)
- Check you're on "Hardhat Local" network in MetaMask

**App not working?**
- Make sure the main app is still running: `npm run dev`
- Refresh your browser
- Check browser console for errors

---

## Current Application Status

✅ **Your app is still running** on http://localhost:5000
✅ **No changes to existing functionality**
✅ **Just connect MetaMask to local network** and you're ready!

**The app will automatically:**
- Detect you're on Hardhat network (Chain ID 1337)
- Use the correct contract address
- Work exactly as before, just with test ETH

---

**Everything is ready! Just connect MetaMask to localhost:8545 and start your demo! 🎉**

