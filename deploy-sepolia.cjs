const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🚀 DEPLOYING TO SEPOLIA TESTNET");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  
  // Check environment variables
  if (!process.env.SEPOLIA_RPC_URL || process.env.SEPOLIA_RPC_URL.includes("YOUR_KEY")) {
    console.error("❌ ERROR: SEPOLIA_RPC_URL not set in .env file");
    console.error("Please create a .env file with your Sepolia RPC URL");
    console.error("Get one from: https://infura.io or https://alchemy.com");
    process.exit(1);
  }
  
  if (!process.env.PRIVATE_KEY) {
    console.error("❌ ERROR: PRIVATE_KEY not set in .env file");
    console.error("Please add your wallet's private key to .env file");
    process.exit(1);
  }
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  const balanceEth = ethers.formatEther(balance);
  console.log("Account balance:", balanceEth, "ETH");
  
  if (parseFloat(balanceEth) < 0.01) {
    console.error("\n❌ ERROR: Insufficient Sepolia ETH for deployment!");
    console.error("You need at least 0.01 ETH for gas fees.");
    console.error("Get free Sepolia ETH from:");
    console.error("  - https://sepoliafaucet.com/");
    console.error("  - https://faucet.quicknode.com/ethereum/sepolia");
    console.error("  - https://www.alchemy.com/faucets/ethereum-sepolia");
    process.exit(1);
  }
  
  // 1. Deploy Implementation Contract
  console.log("\n1. Deploying Implementation Contract...");
  const PrivacyMixerV1 = await ethers.getContractFactory("PrivacyMixerV1");
  const implementation = await PrivacyMixerV1.deploy();
  await implementation.waitForDeployment();
  const implAddress = await implementation.getAddress();
  console.log("✅ Implementation deployed to:", implAddress);
  
  // 2. Deploy Proxy Contract
  console.log("\n2. Deploying Proxy Contract...");
  const PrivacyMixerProxy = await ethers.getContractFactory("PrivacyMixerProxy");
  const proxy = await PrivacyMixerProxy.deploy(implAddress, "0x");
  await proxy.waitForDeployment();
  const proxyAddress = await proxy.getAddress();
  console.log("✅ Proxy deployed to:", proxyAddress);
  
  // 3. Initialize Implementation through Proxy
  console.log("\n3. Initializing Contract...");
  const privacyMixer = PrivacyMixerV1.attach(proxyAddress);
  const initTx = await privacyMixer.initialize();
  await initTx.wait();
  console.log("✅ Contract initialized successfully");
  
  // 4. Verify initialization
  console.log("\n4. Verifying Initialization...");
  const totalPools = await privacyMixer.totalPools();
  console.log("✅ Total pools created:", totalPools.toString());
  
  // 5. Save deployment addresses
  const deploymentInfo = {
    network: "sepolia",
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    implementation: implAddress,
    proxy: proxyAddress,
    admin: deployer.address,
    gasUsed: {
      implementation: (await implementation.deploymentTransaction().wait()).gasUsed.toString(),
      proxy: (await proxy.deploymentTransaction().wait()).gasUsed.toString(),
    }
  };
  
  const addressesPath = path.join(__dirname, "..", "deployments", "sepolia.json");
  fs.mkdirSync(path.dirname(addressesPath), { recursive: true });
  fs.writeFileSync(addressesPath, JSON.stringify(deploymentInfo, null, 2));
  
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ DEPLOYMENT COMPLETE!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  console.log("Network: Sepolia Testnet");
  console.log("Implementation:", implAddress);
  console.log("Proxy (Contract Address):", proxyAddress);
  console.log("Admin:", deployer.address);
  console.log("\n📝 Next steps:");
  console.log("1. Update frontend contract address to:", proxyAddress);
  console.log("2. View on Etherscan: https://sepolia.etherscan.io/address/" + proxyAddress);
  console.log("3. Get more test ETH from faucets if needed");
  console.log("4. Test deposits and withdrawals on Sepolia\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error.message);
    if (error.message.includes("insufficient funds")) {
      console.error("\n💡 Get free Sepolia ETH from faucets:");
      console.error("   https://sepoliafaucet.com/");
    }
    process.exit(1);
  });

