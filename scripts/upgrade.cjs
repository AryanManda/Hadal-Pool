const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Upgrading contracts with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");
  
  // Load deployment info
  const networkName = hre.network.name;
  const deploymentPath = path.join(__dirname, "..", "deployments", `${networkName}.json`);
  
  if (!fs.existsSync(deploymentPath)) {
    throw new Error(`Deployment info not found for network: ${networkName}. Please deploy first.`);
  }
  
  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  const proxyAddress = deploymentInfo.proxy;
  
  if (!proxyAddress) {
    throw new Error("Proxy address not found in deployment info");
  }
  
  console.log("\n1. Loading existing proxy...");
  console.log("Proxy address:", proxyAddress);
  
  // Get current implementation
  const proxy = await ethers.getContractAt("ERC1967Proxy", proxyAddress);
  const currentImplementation = await ethers.provider.getStorage(
    proxyAddress,
    "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc" // ERC1967_IMPLEMENTATION_SLOT
  );
  console.log("Current implementation:", currentImplementation);
  
  // 2. Deploy new V2 implementation
  console.log("\n2. Deploying PrivacyMixerV2 Implementation...");
  const PrivacyMixerV2 = await ethers.getContractFactory("PrivacyMixerV2");
  const newImplementation = await PrivacyMixerV2.deploy();
  await newImplementation.waitForDeployment();
  const newImplementationAddress = await newImplementation.getAddress();
  console.log("New V2 implementation deployed to:", newImplementationAddress);
  
  // 3. Attach to proxy as V1 to check current state
  console.log("\n3. Checking current contract state...");
  const PrivacyMixerV1 = await ethers.getContractFactory("PrivacyMixerV1");
  const currentContract = PrivacyMixerV1.attach(proxyAddress);
  
  try {
    const totalPools = await currentContract.totalPools();
    console.log("Current total pools:", totalPools.toString());
    const owner = await currentContract.owner();
    console.log("Current owner:", owner);
    console.log("Owner matches deployer:", owner.toLowerCase() === deployer.address.toLowerCase());
  } catch (error) {
    console.error("Error checking current state:", error.message);
  }
  
  // 4. Deploy or get ProxyAdmin
  console.log("\n4. Setting up ProxyAdmin for upgrade...");
  
  let proxyAdminAddress = deploymentInfo.proxyAdmin;
  let proxyAdmin;
  
  if (!proxyAdminAddress) {
    console.log("Deploying new ProxyAdmin contract...");
    const ProxyAdmin = await ethers.getContractFactory("ProxyAdmin");
    proxyAdmin = await ProxyAdmin.deploy();
    await proxyAdmin.waitForDeployment();
    proxyAdminAddress = await proxyAdmin.getAddress();
    console.log("ProxyAdmin deployed to:", proxyAdminAddress);
    
    // Transfer proxy ownership to ProxyAdmin
    console.log("Transferring proxy ownership to ProxyAdmin...");
    const transferTx = await currentContract.transferOwnership(proxyAdminAddress);
    await transferTx.wait();
    console.log("✅ Ownership transferred to ProxyAdmin");
  } else {
    console.log("Using existing ProxyAdmin:", proxyAdminAddress);
    const ProxyAdmin = await ethers.getContractFactory("ProxyAdmin");
    proxyAdmin = ProxyAdmin.attach(proxyAdminAddress);
  }
  
  // 5. Upgrade proxy to new implementation
  console.log("\n5. Upgrading proxy to V2...");
  try {
    const upgradeTx = await proxyAdmin.upgrade(proxyAddress, newImplementationAddress);
    console.log("Upgrade transaction sent:", upgradeTx.hash);
    await upgradeTx.wait();
    console.log("✅ Proxy upgraded successfully!");
  } catch (error) {
    console.error("\n❌ Upgrade failed:", error.message);
    console.log("\nTrying alternative method using TransparentUpgradeableProxy pattern...");
    
    // Alternative: Try using the proxy's upgrade function if it's a TransparentUpgradeableProxy
    try {
      const TransparentProxy = await ethers.getContractFactory("TransparentUpgradeableProxy");
      const transparentProxy = TransparentProxy.attach(proxyAddress);
      const upgradeTx = await transparentProxy.upgradeTo(newImplementationAddress);
      console.log("Upgrade transaction sent:", upgradeTx.hash);
      await upgradeTx.wait();
      console.log("✅ Proxy upgraded successfully!");
    } catch (error2) {
      console.error("Alternative upgrade method also failed:", error2.message);
      throw new Error("Could not upgrade proxy. Please check proxy type and ownership.");
    }
  }
  
  // 5. Initialize version in V2 contract
  console.log("\n5. Initializing V2 version...");
  const upgradedContract = PrivacyMixerV2.attach(proxyAddress);
  try {
    const versionInitTx = await upgradedContract.initializeVersion();
    await versionInitTx.wait();
    console.log("✅ V2 version initialized");
  } catch (error) {
    console.warn("Version initialization failed (may already be set):", error.message);
  }
  
  // 6. Verify upgrade
  console.log("\n6. Verifying upgrade...");
  try {
    const version = await upgradedContract.version();
    console.log("Contract version:", version.toString());
    
    if (version.toString() === "2") {
      console.log("✅ Upgrade verified! Contract is now V2");
    } else {
      console.warn("⚠️  Version mismatch. Expected 2, got:", version.toString());
    }
    
    // Verify implementation address
    const newImpl = await ethers.provider.getStorage(
      proxyAddress,
      "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc"
    );
    console.log("New implementation address:", newImpl);
    
    if (newImpl.toLowerCase() === newImplementationAddress.toLowerCase()) {
      console.log("✅ Implementation address matches!");
    } else {
      console.warn("⚠️  Implementation address mismatch");
    }
    
    // Test that existing functionality still works
    const totalPools = await upgradedContract.totalPools();
    console.log("Total pools (should be preserved):", totalPools.toString());
    
  } catch (error) {
    console.error("Error verifying upgrade:", error.message);
  }
  
  // 8. Update deployment info
  console.log("\n8. Updating deployment info...");
  deploymentInfo.upgradedAt = new Date().toISOString();
  deploymentInfo.v2Implementation = newImplementationAddress;
  deploymentInfo.version = 2;
  if (proxyAdminAddress && !deploymentInfo.proxyAdmin) {
    deploymentInfo.proxyAdmin = proxyAdminAddress;
  }
  
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("Deployment info updated:", deploymentPath);
  
  console.log("\n✅ Upgrade completed successfully!");
  console.log("\nSummary:");
  console.log("========================");
  console.log("Network:", networkName);
  console.log("Proxy:", proxyAddress);
  console.log("Old Implementation:", currentImplementation);
  console.log("New V2 Implementation:", newImplementationAddress);
  console.log("Version: 2");
  console.log("\nNext steps:");
  console.log("1. Test the upgraded contract functionality");
  console.log("2. Verify the frontend still works correctly");
  console.log("3. Check that all existing deposits are preserved");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Upgrade failed:", error);
    process.exit(1);
  });

