const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying PrivacyMixerV2 to Base Mainnet...\n");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  
  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH");
  
  if (balance < hre.ethers.parseEther("0.01")) {
    throw new Error("❌ Insufficient balance! Need at least 0.01 ETH for deployment.");
  }

  // Deploy PrivacyMixerV2
  console.log("\n📦 Deploying PrivacyMixerV2 contract...");
  const PrivacyMixerV2 = await hre.ethers.getContractFactory("PrivacyMixerV2");
  const privacyMixer = await PrivacyMixerV2.deploy();
  
  console.log("⏳ Waiting for deployment transaction...");
  await privacyMixer.waitForDeployment();
  
  const contractAddress = await privacyMixer.getAddress();
  console.log("✅ Contract deployed to:", contractAddress);
  console.log("🔗 View on Basescan: https://basescan.org/address/" + contractAddress);

  // Initialize the contract
  console.log("\n🔧 Initializing contract (creating pools)...");
  const initTx = await privacyMixer.initialize();
  console.log("⏳ Waiting for initialization transaction...");
  await initTx.wait();
  console.log("✅ Contract initialized!");

  // Verify pools were created
  const totalPools = await privacyMixer.totalPools();
  console.log("\n📊 Total pools created:", totalPools.toString());
  
  for (let i = 0; i < totalPools; i++) {
    const poolInfo = await privacyMixer.getPoolInfo(i);
    console.log(`\n  Pool ${i}:`);
    console.log(`    Lock Duration: ${poolInfo.lockDuration.toString()} seconds`);
    console.log(`    Max Deposit: ${hre.ethers.formatEther(poolInfo.maxDeposit)} ETH`);
    console.log(`    Fee Rate: ${poolInfo.feeRate.toString()} (${Number(poolInfo.feeRate) / 10}%)`);
    console.log(`    Active: ${poolInfo.active}`);
  }

  // Save deployment info
  const deploymentInfo = {
    network: "base",
    chainId: 8453,
    contractAddress: contractAddress,
    deployer: deployer.address,
    deploymentTx: privacyMixer.deploymentTransaction()?.hash,
    initTx: initTx.hash,
    timestamp: new Date().toISOString(),
    totalPools: totalPools.toString(),
  };

  const deploymentFile = path.join(__dirname, "..", "deployments", "base.json");
  const deploymentsDir = path.dirname(deploymentFile);
  
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log("\n💾 Deployment info saved to:", deploymentFile);

  console.log("\n" + "=".repeat(60));
  console.log("✅ DEPLOYMENT COMPLETE!");
  console.log("=".repeat(60));
  console.log("\n📋 Next Steps:");
  console.log("1. Update client/src/lib/contracts.ts:");
  console.log(`   base: "${contractAddress}",`);
  console.log("\n2. Verify contract on Basescan (optional):");
  console.log(`   npx hardhat verify --network base ${contractAddress}`);
  console.log("\n3. Test the deployment:");
  console.log("   - Start dev server: npm run dev");
  console.log("   - Connect MetaMask to Base Mainnet");
  console.log("   - Make a test deposit");
  console.log("\n🔗 Contract Address:", contractAddress);
  console.log("🔗 Basescan:", `https://basescan.org/address/${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
