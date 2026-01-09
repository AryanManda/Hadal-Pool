const { ethers } = require('hardhat');

async function main() {
  const provider = new ethers.JsonRpcProvider('http://localhost:8545');
  const contractAddress = '0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1';
  
  // Contract ABI for events
  const abi = [
    "event Deposit(address indexed user, uint256 amount, uint256 poolId, uint256 timestamp)",
    "event Withdrawal(address indexed user, address indexed to, uint256 amount)",
    "event AddressGenerated(address indexed user, address indexed generatedAddress)",
    "function userDeposits(address) view returns (uint256)",
    "function depositTimestamps(address) view returns (uint256)",
    "function userToGeneratedAddress(address) view returns (address)"
  ];
  
  const contract = new ethers.Contract(contractAddress, abi, provider);
  
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🔍 TRACING WITHDRAWALS ON HARDHAT");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  
  // Get current block number
  const currentBlock = await provider.getBlockNumber();
  console.log(`Current block: ${currentBlock}`);
  console.log(`Scanning from block 0 to ${currentBlock}\n`);
  
  // Get all Deposit events
  console.log("📥 SCANNING DEPOSITS...");
  const depositFilter = contract.filters.Deposit();
  const deposits = await contract.queryFilter(depositFilter, 0, currentBlock);
  
  console.log(`Found ${deposits.length} deposits:\n`);
  deposits.forEach((event, i) => {
    const user = event.args.user;
    const amount = ethers.formatEther(event.args.amount);
    const poolId = event.args.poolId.toString();
    const timestamp = new Date(Number(event.args.timestamp) * 1000).toLocaleString();
    console.log(`  ${i + 1}. Deposit Event:`);
    console.log(`     User: ${user}`);
    console.log(`     Amount: ${amount} ETH`);
    console.log(`     Pool ID: ${poolId}`);
    console.log(`     Time: ${timestamp}`);
    console.log(`     Block: ${event.blockNumber}`);
    console.log(`     TX: ${event.transactionHash}\n`);
  });
  
  // Get all Withdrawal events
  console.log("📤 SCANNING WITHDRAWALS...");
  const withdrawalFilter = contract.filters.Withdrawal();
  const withdrawals = await contract.queryFilter(withdrawalFilter, 0, currentBlock);
  
  console.log(`Found ${withdrawals.length} withdrawals:\n`);
  withdrawals.forEach((event, i) => {
    const user = event.args.user; // THIS IS THE DEPOSIT ADDRESS!
    const to = event.args.to;      // THIS IS THE WITHDRAWAL ADDRESS!
    const amount = ethers.formatEther(event.args.amount);
    const timestamp = new Date(Number(await provider.getBlock(event.blockNumber).then(b => b.timestamp)) * 1000).toLocaleString();
    console.log(`  ${i + 1}. Withdrawal Event:`);
    console.log(`     From (Deposit Address): ${user}`);
    console.log(`     To (Withdrawal Address): ${to}`);
    console.log(`     Amount: ${amount} ETH`);
    console.log(`     Time: ${timestamp}`);
    console.log(`     Block: ${event.blockNumber}`);
    console.log(`     TX: ${event.transactionHash}\n`);
  });
  
  // TRACE THE LINK
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🔗 TRACING DEPOSIT → WITHDRAWAL LINKS");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  
  if (withdrawals.length > 0 && deposits.length > 0) {
    console.log("⚠️  PRIVACY BREACH: Direct links found!\n");
    
    withdrawals.forEach((withdrawal, i) => {
      const depositAddress = withdrawal.args.user;
      const withdrawalAddress = withdrawal.args.to;
      const amount = ethers.formatEther(withdrawal.args.amount);
      
      // Find matching deposit
      const matchingDeposit = deposits.find(d => 
        d.args.user.toLowerCase() === depositAddress.toLowerCase()
      );
      
      console.log(`Link ${i + 1}:`);
      console.log(`  📍 Deposit Address: ${depositAddress}`);
      if (matchingDeposit) {
        console.log(`  📥 Deposited: ${ethers.formatEther(matchingDeposit.args.amount)} ETH`);
        console.log(`  📅 Deposit Time: ${new Date(Number(matchingDeposit.args.timestamp) * 1000).toLocaleString()}`);
      }
      console.log(`  ➡️  Withdrew: ${amount} ETH`);
      console.log(`  📍 To Address: ${withdrawalAddress}`);
      console.log(`  ❌ TRACEABLE: ${depositAddress} → ${withdrawalAddress}\n`);
    });
  }
  
  // Query public mappings for a specific address (if provided)
  if (process.argv[2]) {
    const addressToCheck = process.argv[2];
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`🔍 QUERYING PUBLIC MAPPINGS FOR: ${addressToCheck}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    
    try {
      const userDeposit = await contract.userDeposits(addressToCheck);
      const depositTime = await contract.depositTimestamps(addressToCheck);
      const generatedAddress = await contract.userToGeneratedAddress(addressToCheck);
      
      console.log(`User Deposits: ${ethers.formatEther(userDeposit)} ETH`);
      console.log(`Deposit Timestamp: ${depositTime.toString()} (${new Date(Number(depositTime) * 1000).toLocaleString()})`);
      console.log(`Generated Address: ${generatedAddress}`);
      console.log("\n⚠️  All this data is PUBLIC and queryable by anyone!\n");
    } catch (e) {
      console.log("Address not found in contract or error:", e.message);
    }
  }
  
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📊 SUMMARY");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  console.log(`Total Deposits: ${deposits.length}`);
  console.log(`Total Withdrawals: ${withdrawals.length}`);
  console.log("\n⚠️  PRIVACY STATUS: NOT PRIVATE");
  console.log("   - All deposits are linked to user addresses");
  console.log("   - All withdrawals show deposit address → withdrawal address");
  console.log("   - Public mappings expose all user data");
  console.log("   - Anyone can trace Address A → Address B\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });







