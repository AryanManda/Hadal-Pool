// Quick script to update Sepolia address after deployment
const fs = require('fs');
const path = require('path');

const sepoliaDeployment = path.join(__dirname, 'deployments', 'sepolia.json');
const contractsFile = path.join(__dirname, 'client', 'src', 'lib', 'contracts.ts');

if (!fs.existsSync(sepoliaDeployment)) {
  console.error('❌ Sepolia deployment file not found. Deploy to Sepolia first.');
  process.exit(1);
}

const deployment = JSON.parse(fs.readFileSync(sepoliaDeployment, 'utf8'));
const proxyAddress = deployment.proxy;

console.log('📝 Updating contract address in frontend...');
console.log('   New Sepolia address:', proxyAddress);

// Read contracts.ts
let contractsContent = fs.readFileSync(contractsFile, 'utf8');

// Update the sepolia address
const regex = /sepolia:\s*"[^"]*"/;
const replacement = `sepolia: "${proxyAddress}"`;

if (regex.test(contractsContent)) {
  contractsContent = contractsContent.replace(regex, replacement);
  fs.writeFileSync(contractsFile, contractsContent);
  console.log('✅ Updated client/src/lib/contracts.ts');
  console.log('\n📋 Next steps:');
  console.log('   1. Restart your dev server (npm run dev)');
  console.log('   2. Switch MetaMask to Sepolia network');
  console.log('   3. Test the app!');
} else {
  console.error('❌ Could not find sepolia address in contracts.ts');
  process.exit(1);
}







