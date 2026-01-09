# 🔑 Wallet Setup for Deployment

## Two Wallets Needed

### 1. **Master Wallet (Gas Fees Wallet)**
- **Purpose:** Pay for contract deployment gas fees
- **Needs:** 
  - Private key (for deployment)
  - ETH on Arbitrum Mainnet (~0.01 ETH for gas)
- **Used for:** Deploying contracts, paying transaction fees

### 2. **Funds Wallet (Operations Wallet)**
- **Purpose:** Hold funds for contract operations
- **Needs:**
  - Address (to receive/transfer funds)
  - May need initial funding depending on your setup
- **Used for:** Contract operations, managing funds

---

## What I'll Need From You

### From Master Wallet (Gas Wallet):
1. **Private Key** - This goes in `.env` file as `PRIVATE_KEY`
2. **Address** - To verify it has ETH for gas
3. **Confirmation** - That it has ETH on Arbitrum Mainnet

### From Funds Wallet:
1. **Address** - For contract operations (if needed)
2. **Any initial funding requirements** - If the contract needs initial funds

---

## What I'll Do

Once you provide the wallet details:

1. **Update `.env` file:**
   ```env
   PRIVATE_KEY=0x[MASTER_WALLET_PRIVATE_KEY]
   ARBITRUM_RPC_URL=https://arbitrum-mainnet.infura.io/v3/b56cd0d408e24fd0a686ecb470e28cc3
   ARBISCAN_API_KEY=ATD2NVVZFAQ4YKB3VNTN6CA1Z82GIH2ASH
   ```

2. **Verify Master Wallet has ETH:**
   - Check balance on Arbitrum Mainnet
   - Confirm it has enough for gas (~0.01 ETH)

3. **Deploy Contract:**
   ```bash
   npx hardhat run scripts/deploy.cjs --network arbitrum
   ```

4. **Update Contract Address:**
   - Copy the deployed Proxy address
   - Update `client/src/lib/contracts.ts` with the new address

5. **Verify Deployment:**
   - Check contract on Arbiscan
   - Test basic functionality

---

## Security Notes

- ✅ `.env` file is already in `.gitignore` (won't be committed)
- ✅ Private keys stay local on your machine
- ✅ Only the Master Wallet private key is needed for deployment
- ✅ Funds Wallet only needs address (no private key needed)

---

## Quick Checklist

Before deployment:
- [ ] Master Wallet created
- [ ] Master Wallet has ETH on Arbitrum Mainnet
- [ ] Master Wallet private key ready
- [ ] Funds Wallet address ready (if needed)
- [ ] RPC URL configured (already done ✅)
- [ ] Arbiscan API key ready (already done ✅)

---

## After You Provide Wallets

Just give me:
1. **Master Wallet Private Key:** `0x...`
2. **Master Wallet Address:** `0x...` (to verify balance)
3. **Funds Wallet Address:** `0x...` (if needed)

Then I'll:
1. Update `.env` file
2. Verify everything is ready
3. Deploy the contract
4. Update your code with the contract address
5. You're done! 🚀

---

**Everything else is already configured!** Just need the wallet details and we're good to go.

