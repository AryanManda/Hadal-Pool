const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  const contractAddress = "0xBF0B842259D654159D37AD88FafaE694FdE95AA3";
  
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🔧 INITIALIZING SEPOLIA CONTRACT");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  
  // Get signer from network config
  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);
  
  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Balance:", ethers.formatEther(balance), "ETH\n");
  
  if (balance < ethers.parseEther("0.001")) {
    throw new Error("Insufficient balance! Need at least 0.001 ETH for gas.");
  }
  
  // Contract ABI - just need initialize function
  const contractABI = [
    "function initialize() external",
    "function totalPools() external view returns (uint256)",
    "function getPoolInfo(uint256 poolId) external view returns (tuple(uint256 lockDuration, uint256 maxDeposit, uint256 feeRate, bool active, uint256 totalDeposits))",
  ];
  
  const contract = new ethers.Contract(contractAddress, contractABI, deployer);
  
  // Check if already initialized
  try {
    const totalPools = await contract.totalPools();
    console.log("✅ Contract is already initialized!");
    console.log("   Total pools:", totalPools.toString());
    return;
  } catch (error) {
    console.log("Contract not initialized, proceeding with initialization...\n");
  }
  
  // Initialize the contract
  console.log("📝 Calling initialize()...");
  const tx = await contract.initialize();
  console.log("⏳ Transaction sent:", tx.hash);
  console.log("   Waiting for confirmation...");
  
  const receipt = await tx.wait();
  console.log("✅ Transaction confirmed in block:", receipt.blockNumber);
  
  // Verify initialization
  const totalPools = await contract.totalPools();
  console.log("\n✅ Contract initialized successfully!");
  console.log("   Total pools created:", totalPools.toString());
  
  // Show pool info
  console.log("\n📊 Pool Information:");
  for (let i = 0; i < totalPools; i++) {
    const poolInfo = await contract.getPoolInfo(i);
    console.log(`\n   Pool ${i}:`);
    console.log(`     Lock Duration: ${poolInfo.lockDuration.toString()} seconds`);
    console.log(`     Max Deposit: ${ethers.formatEther(poolInfo.maxDeposit)} ETH`);
    console.log(`     Fee Rate: ${poolInfo.feeRate.toString()} basis points`);
    console.log(`     Active: ${poolInfo.active}`);
  }
  
  console.log("\n✅ Contract is now ready to use!");
  console.log("   Try making a deposit in the app now.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error:", error.message);
    if (error.message.includes("insufficient funds")) {
      console.error("\n💡 Make sure you have Sepolia ETH in your wallet for gas fees.");
    }
    process.exit(1);
  });
