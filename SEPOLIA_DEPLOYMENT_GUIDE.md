# Deploying to Sepolia Testnet

## Step 1: Get Sepolia Test ETH

You need Sepolia ETH for gas fees. Get free test ETH from:
- https://sepoliafaucet.com/
- https://faucet.quicknode.com/ethereum/sepolia
- https://www.alchemy.com/faucets/ethereum-sepolia

**You need at least 0.01 ETH for deployment.**

## Step 2: Get RPC URL

Choose one:
- **Infura**: https://infura.io (create account, get Sepolia endpoint)
- **Alchemy**: https://alchemy.com (create account, get Sepolia endpoint)

## Step 3: Create .env File

Create a `.env` file in the project root:

```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your_wallet_private_key_here
```

**To get your private key from MetaMask:**
1. Open MetaMask
2. Click account icon → Account Details
3. Export Private Key (enter password)
4. Copy the private key

⚠️ **NEVER commit .env to git!** It's already in .gitignore.

## Step 4: Deploy to Sepolia

```bash
npx hardhat run scripts/deploy-sepolia.cjs --network sepolia
```

This will:
- Deploy the contract to Sepolia
- Save the address to `deployments/sepolia.json`
- Show you the contract address

## Step 5: Update Frontend

After deployment, update `client/src/lib/contracts.ts`:

```typescript
export const CONTRACT_ADDRESSES = {
  hardhat: "0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1", // Local
  sepolia: "YOUR_NEW_SEPOLIA_ADDRESS_HERE", // ← Update this
  mainnet: "",
} as const;
```

## Step 6: Switch MetaMask to Sepolia

1. Open MetaMask
2. Click network dropdown
3. Select "Sepolia test network"
4. If not listed, add it:
   - Network Name: Sepolia
   - RPC URL: https://sepolia.infura.io/v3/YOUR_KEY
   - Chain ID: 11155111
   - Currency Symbol: ETH

## Step 7: Test the App

1. Make sure you have Sepolia ETH in your wallet
2. Open the app
3. Connect MetaMask (should be on Sepolia)
4. Make a deposit
5. Wait 1 minute (demo lock period)
6. Withdraw

## Step 8: View on Etherscan

Go to: https://sepolia.etherscan.io/address/YOUR_CONTRACT_ADDRESS

You'll see:
- All deposits
- All withdrawals
- Contract events
- Everything is traceable (as we discussed)

## Getting More Test ETH

If you run out of Sepolia ETH:
- Use the faucets listed above
- Some faucets have daily limits
- You may need to wait 24 hours between requests

## Troubleshooting

**"Insufficient funds" error:**
- Get more Sepolia ETH from faucets

**"Contract not deployed" error:**
- Make sure you updated the contract address in `contracts.ts`
- Make sure MetaMask is on Sepolia network

**"Wrong network" error:**
- Switch MetaMask to Sepolia testnet







