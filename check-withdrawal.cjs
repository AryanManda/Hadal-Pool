const { ethers } = require('hardhat');

async function main() {
  const provider = new ethers.JsonRpcProvider('http://localhost:8545');
  const contractAddress = '0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1';
  // Get address from command line or use default
  const withdrawalAddress = process.argv.length > 2 ? process.argv[2] : '0xf98E4E1dC55C4ac88d3EACEE2c7d10ca075EC6e3';
  
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🔍 CHECKING WITHDRAWAL STATUS");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  
  // Check balance of withdrawal address
  const balance = await provider.getBalance(withdrawalAddress);
  const balanceEth = ethers.formatEther(balance);
  console.log(`📍 Withdrawal Address: ${withdrawalAddress}`);
  console.log(`💰 Current Balance: ${balanceEth} ETH\n`);
  
  if (parseFloat(balanceEth) === 0) {
    console.log("⚠️  Balance is 0 ETH - funds not received!\n");
  } else {
    console.log(`✅ Funds received: ${balanceEth} ETH\n`);
  }
  
  // Check contract events
  const abi = [
    "event Deposit(address indexed user, uint256 amount, uint256 poolId, uint256 timestamp)",
    "event Withdrawal(address indexed user, address indexed to, uint256 amount)"
  ];
  
  const contract = new ethers.Contract(contractAddress, abi, provider);
  const currentBlock = await provider.getBlockNumber();
  
  // Find withdrawals to this address
  console.log("📤 Checking Withdrawal Events...");
  const withdrawalFilter = contract.filters.Withdrawal(null, withdrawalAddress);
  const withdrawals = await contract.queryFilter(withdrawalFilter, 0, currentBlock);
  
  if (withdrawals.length === 0) {
    console.log("❌ No withdrawal events found to this address!\n");
    console.log("Possible reasons:");
    console.log("  1. Withdrawal transaction failed");
    console.log("  2. Wrong network (checking Hardhat local, but withdrawal was on Sepolia?)");
    console.log("  3. Wrong withdrawal address");
    console.log("  4. Transaction not mined yet\n");
  } else {
    console.log(`✅ Found ${withdrawals.length} withdrawal(s) to this address:\n`);
    withdrawals.forEach((event, i) => {
      console.log(`  Withdrawal ${i + 1}:`);
      console.log(`    From (Deposit Address): ${event.args.user}`);
      console.log(`    To: ${event.args.to}`);
      console.log(`    Amount: ${ethers.formatEther(event.args.amount)} ETH`);
      console.log(`    Block: ${event.blockNumber}`);
      console.log(`    TX Hash: ${event.transactionHash}\n`);
    });
  }
  
  // Check all withdrawals from contract
  console.log("📊 All Recent Withdrawals from Contract:");
  const allWithdrawals = await contract.queryFilter(contract.filters.Withdrawal(), currentBlock - 100, currentBlock);
  if (allWithdrawals.length === 0) {
    console.log("  No withdrawals found in last 100 blocks\n");
  } else {
    allWithdrawals.forEach((event, i) => {
      console.log(`  ${i + 1}. ${event.args.user} → ${event.args.to}: ${ethers.formatEther(event.args.amount)} ETH`);
    });
    console.log();
  }
  
  // Check if this is Hardhat local network
  const network = await provider.getNetwork();
  console.log("🌐 Network Info:");
  console.log(`   Chain ID: ${network.chainId}`);
  if (network.chainId === 1337n) {
    console.log("   ⚠️  This is Hardhat LOCAL network - transactions won't show on Etherscan!");
    console.log("   Etherscan only shows Sepolia/Mainnet transactions\n");
  } else if (network.chainId === 11155111n) {
    console.log("   ✅ This is Sepolia Testnet - should show on sepolia.etherscan.io\n");
  } else {
    console.log(`   Network: ${network.name}\n`);
  }
  
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });

