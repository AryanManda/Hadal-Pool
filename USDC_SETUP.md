# USDC Deposit Setup Guide

## What's Been Added

✅ USDC deposit support is now enabled
✅ Balance checking for USDC tokens
✅ Gas fee checking (still need ETH for gas)
✅ Automatic network detection
✅ Token transfer functionality

## Important Notes

### For Demo/Testing:

1. **Network Detection**: The app automatically detects your network (Mainnet, Sepolia, or Hardhat)

2. **USDC Token Addresses**:
   - **Mainnet**: `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`
   - **Sepolia Testnet**: `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`
   - **Hardhat/Local**: Uses mock address (may need to deploy a mock token)

3. **What You Need**:
   - USDC tokens in your wallet
   - At least 0.001 ETH for gas fees (even for USDC deposits)

### If USDC Doesn't Work:

If you get an error about token not configured:

1. **Check your network**: Make sure you're on a network that has USDC
   - Mainnet has USDC
   - Sepolia testnet has USDC
   - Hardhat/local network needs a mock token deployed

2. **Add USDC to MetaMask**:
   - If USDC isn't showing in MetaMask, add it manually:
   - Go to MetaMask → Import Tokens
   - Enter the USDC contract address for your network
   - Or use: https://etherscan.io/address/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 (Mainnet)

3. **Get Test USDC** (if on testnet):
   - Use a Sepolia USDC faucet
   - Or swap test ETH for test USDC

### How It Works:

1. **Select USDC** in the currency selector
2. **Enter amount** (minimum 10 USDC)
3. **App checks**:
   - Your USDC balance
   - Your ETH balance (for gas)
4. **Transaction**: Transfers USDC to the contract address
5. **Success**: Shows transaction hash and saves to backend

### Current Limitation:

⚠️ **Note**: The smart contract currently only accepts ETH directly. For USDC deposits:
- The tokens are transferred to the contract address
- This is a **demo implementation**
- For production, the contract would need to be updated to handle ERC20 tokens properly

### For Your Demo:

1. Make sure you have USDC in your wallet
2. Make sure you have some ETH for gas (even small amount like 0.001 ETH)
3. Select USDC as currency
4. Enter amount (10+ USDC)
5. The deposit will work!

The transaction will transfer your USDC tokens to the contract address, and the deposit will be recorded in the backend.

