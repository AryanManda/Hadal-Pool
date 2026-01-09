// scripts/build-production.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function buildProduction() {
  console.log('🚀 Building Privacy Mixer for production...');
  
  // 1. Build frontend
  console.log('📦 Building frontend...');
  execSync('cd client && npm run build', { stdio: 'inherit' });
  
  // 2. Update contract addresses for production
  console.log('🔗 Updating contract addresses...');
  const contractAddresses = {
    mainnet: process.env.MAINNET_CONTRACT_ADDRESS || '',
    sepolia: process.env.SEPOLIA_CONTRACT_ADDRESS || '',
  };
  
  const contractsPath = path.join(__dirname, '..', 'client', 'src', 'lib', 'contracts.ts');
  let contractsContent = fs.readFileSync(contractsPath, 'utf8');
  
  // Update contract addresses
  contractsContent = contractsContent.replace(
    /sepolia: ""/,
    `sepolia: "${contractAddresses.sepolia}"`
  );
  contractsContent = contractsContent.replace(
    /mainnet: ""/,
    `mainnet: "${contractAddresses.mainnet}"`
  );
  
  fs.writeFileSync(contractsPath, contractsContent);
  
  // 3. Create production environment file
  console.log('⚙️ Creating production environment...');
  const envContent = `
# Production Environment Variables
VITE_MAINNET_CONTRACT_ADDRESS=${contractAddresses.mainnet}
VITE_SEPOLIA_CONTRACT_ADDRESS=${contractAddresses.sepolia}
VITE_NETWORK=mainnet
VITE_INFURA_KEY=${process.env.INFURA_KEY}
`;
  
  fs.writeFileSync(path.join(__dirname, '..', 'client', '.env.production'), envContent);
  
  // 4. Rebuild with production environment
  console.log('🔄 Rebuilding with production environment...');
  execSync('cd client && npm run build', { stdio: 'inherit' });
  
  console.log('✅ Production build completed!');
  console.log('📁 Build files are in: client/dist/');
}

buildProduction().catch(console.error);
