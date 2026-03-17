const { ethers } = require("hardhat");

async function main() {
  const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🔍 CHECKING LOCALHOST CONTRACT");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  
  const provider = ethers.provider;
  const contractABI = [
    "function totalPools() external view returns (uint256)",
    "function initialize() external",
    "function getPoolInfo(uint256 poolId) external view returns (tuple(uint256 lockDuration, uint256 maxDeposit, uint256 feeRate, bool active, uint256 totalDeposits))",
  ];
  
  const contract = new ethers.Contract(contractAddress, contractABI, provider);
  
  // Check if initialized
  try {
    const totalPools = await contract.totalPools();
    console.log("✅ Contract is initialized!");
    console.log("   Total pools:", totalPools.toString());
    
    // Show pool info
    for (let i = 0; i < totalPools; i++) {
      const poolInfo = await contract.getPoolInfo(i);
      console.log(`\n   Pool ${i}:`);
      console.log(`     Lock Duration: ${poolInfo.lockDuration.toString()} seconds`);
      console.log(`     Max Deposit: ${ethers.formatEther(poolInfo.maxDeposit)} ETH`);
      console.log(`     Fee Rate: ${poolInfo.feeRate.toString()} basis points`);
      console.log(`     Active: ${poolInfo.active}`);
    }
    
    console.log("\n✅ Contract is ready to use on localhost!");
  } catch (error) {
    console.log("❌ Contract is NOT initialized!");
    console.log("\n🔧 Initializing now...\n");
    
    const [deployer] = await ethers.getSigners();
    const contractWithSigner = contract.connect(deployer);
    
    const tx = await contractWithSigner.initialize();
    console.log("⏳ Transaction sent:", tx.hash);
    await tx.wait();
    console.log("✅ Contract initialized!");
    
    const totalPools = await contract.totalPools();
    console.log("   Total pools created:", totalPools.toString());
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
