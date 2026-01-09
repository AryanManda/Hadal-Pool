# Quick Sepolia Testnet Setup

## 1. Create .env File

Create `.env` in the project root:

```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
PRIVATE_KEY=your_private_key_here
```

**Get RPC URL:**
- Infura: https://infura.io → Create project → Get Sepolia endpoint
- Alchemy: https://alchemy.com → Create app → Get Sepolia endpoint

**Get Private Key:**
- MetaMask → Account → Account Details → Export Private Key

## 2. Get Sepolia Test ETH

Get free test ETH from:
- https://sepoliafaucet.com/
- https://faucet.quicknode.com/ethereum/sepolia
- https://www.alchemy.com/faucets/ethereum-sepolia

**Need at least 0.01 ETH for deployment**

## 3. Deploy to Sepolia

```bash
npx hardhat run deploy-sepolia.cjs --network sepolia
```

This will:
- Deploy contract to Sepolia
- Save address to `deployments/sepolia.json`
- Show you the contract address

## 4. Update Frontend

After deployment, run:

```bash
node update-sepolia-address.js
```

This automatically updates the contract address in the frontend.

Or manually update `client/src/lib/contracts.ts`:
```typescript
sepolia: "YOUR_DEPLOYED_ADDRESS_HERE",
```

## 5. Switch MetaMask to Sepolia

1. MetaMask → Networks → Sepolia test network
2. If not listed, add it:
   - Network Name: Sepolia
   - RPC URL: https://sepolia.infura.io/v3/YOUR_KEY
   - Chain ID: 11155111
   - Currency: ETH

## 6. Test the App

1. Make sure you have Sepolia ETH
2. Open app → Connect MetaMask (on Sepolia)
3. Make deposit
4. Wait 1 minute
5. Withdraw

## 7. View on Etherscan

Go to: https://sepolia.etherscan.io/address/YOUR_CONTRACT_ADDRESS

You can see all transactions and trace withdrawals!







