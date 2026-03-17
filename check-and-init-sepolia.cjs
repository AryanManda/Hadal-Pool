const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  const contractAddress = "0xBF0B842259D654159D37AD88FafaE694FdE95AA3";
  const rpcUrl = process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org";
  
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🔍 CHECKING SEPOLIA CONTRACT STATUS");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  
  // Connect to Sepolia
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const contractABI = [
    "function totalPools() external view returns (uint256)",
    "function initialize() external",
    "function getPoolInfo(uint256 poolId) external view returns (tuple(uint256 lockDuration, uint256 maxDeposit, uint256 feeRate, bool active, uint256 totalDeposits))",
  ];
  
  const contract = new ethers.Contract(contractAddress, contractABI, provider);
  
  // Check if contract exists
  const code = await provider.getCode(contractAddress);
  if (code === "0x" || code === "0x0") {
    console.log("❌ No contract found at this address!");
    console.log("   The contract needs to be deployed first.");
    process.exit(1);
  }
  
  console.log("✅ Contract exists at:", contractAddress);
  
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
    
    console.log("\n✅ Contract is ready to use!");
  } catch (error) {
    console.log("❌ Contract is NOT initialized!");
    console.log("\n⚠️  To initialize, you need to:");
    console.log("   1. Have a wallet with Sepolia ETH");
    console.log("   2. Call initialize() function");
    console.log("   3. This will create the 3 pools");
    console.log("\n💡 You can initialize via:");
    console.log("   - Remix IDE: https://remix.ethereum.org");
    console.log("   - Etherscan: https://sepolia.etherscan.io/address/" + contractAddress + "#writeContract");
    console.log("   - Or ask me to create an initialization script!");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
