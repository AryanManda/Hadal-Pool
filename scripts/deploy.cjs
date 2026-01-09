const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");
  
  // 1. Deploy Implementation Contract
  console.log("\n1. Deploying Implementation Contract...");
  const PrivacyMixerV1 = await ethers.getContractFactory("PrivacyMixerV1");
  const implementation = await PrivacyMixerV1.deploy();
  await implementation.waitForDeployment();
  console.log("Implementation deployed to:", await implementation.getAddress());
  
  // 2. Deploy Proxy Contract
  console.log("\n2. Deploying Proxy Contract...");
  const PrivacyMixerProxy = await ethers.getContractFactory("PrivacyMixerProxy");
  const proxy = await PrivacyMixerProxy.deploy(
    await implementation.getAddress(),
    "0x"
  );
  await proxy.waitForDeployment();
  console.log("Proxy deployed to:", await proxy.getAddress());
  
  // 3. Initialize Implementation through Proxy
  console.log("\n3. Initializing Contract...");
  const privacyMixer = PrivacyMixerV1.attach(await proxy.getAddress());
  const initTx = await privacyMixer.initialize();
  await initTx.wait();
  console.log("Contract initialized successfully");
  
  // 4. Verify initialization
  console.log("\n4. Verifying Initialization...");
  const totalPools = await privacyMixer.totalPools();
  console.log("Total pools created:", totalPools.toString());
  
  // 5. Save deployment addresses
  const deploymentInfo = {
    network: hre.network.name,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    implementation: await implementation.getAddress(),
    proxy: await proxy.getAddress(),
    admin: deployer.address,
    gasUsed: {
      implementation: (await implementation.deploymentTransaction().wait()).gasUsed.toString(),
      proxy: (await proxy.deploymentTransaction().wait()).gasUsed.toString(),
    }
  };
  
  const addressesPath = path.join(__dirname, "..", "deployments", `${hre.network.name}.json`);
  fs.mkdirSync(path.dirname(addressesPath), { recursive: true });
  fs.writeFileSync(addressesPath, JSON.stringify(deploymentInfo, null, 2));
  
  console.log("\n5. Deployment Summary:");
  console.log("========================");
  console.log("Network:", hre.network.name);
  console.log("Implementation:", await implementation.getAddress());
  console.log("Proxy:", await proxy.getAddress());
  console.log("Admin:", deployer.address);
  console.log("Deployment info saved to:", addressesPath);
  
  // 6. Test basic functionality
  console.log("\n6. Testing Basic Functionality...");
  try {
    const pool0 = await privacyMixer.getPoolInfo(0);
    console.log("Pool 0 - Lock Duration:", pool0.lockDuration.toString(), "seconds");
    console.log("Pool 0 - Max Deposit:", ethers.formatEther(pool0.maxDeposit), "ETH");
    console.log("Pool 0 - Fee Rate:", pool0.feeRate.toString(), "basis points");
    console.log("Pool 0 - Active:", pool0.active);
  } catch (error) {
    console.error("Error testing functionality:", error);
  }
  
  console.log("\n✅ Deployment completed successfully!");
  console.log("\nNext steps:");
  console.log("1. Verify contracts: npx hardhat verify --network", hre.network.name, await implementation.getAddress());
  console.log("2. Verify proxy: npx hardhat verify --network", hre.network.name, await proxy.getAddress(), await implementation.getAddress(), "0x");
  console.log("3. Test deposit function");
  console.log("4. Update frontend with contract address:", await proxy.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
