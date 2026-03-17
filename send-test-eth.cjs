const { ethers } = require("hardhat");

async function main() {
  // Get the first account (deployer) - has 10,000 ETH
  const [sender] = await ethers.getSigners();
  const provider = ethers.provider;
  
  // Get recipient address from command line or use second account
  const recipientAddress = process.argv[2] || (await ethers.getSigners())[1].address;
  const amount = process.argv[3] || "100"; // Default 100 ETH
  
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("💰 SENDING TEST ETH");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  console.log(`From: ${sender.address}`);
  console.log(`To: ${recipientAddress}`);
  console.log(`Amount: ${amount} ETH\n`);
  
  // Check sender balance
  const senderBalance = await provider.getBalance(sender.address);
  console.log(`Sender balance: ${ethers.formatEther(senderBalance)} ETH`);
  
  // Send ETH
  const tx = await sender.sendTransaction({
    to: recipientAddress,
    value: ethers.parseEther(amount)
  });
  
  console.log(`\n📤 Transaction sent: ${tx.hash}`);
  console.log("⏳ Waiting for confirmation...");
  
  await tx.wait();
  
  // Check recipient balance
  const recipientBalance = await provider.getBalance(recipientAddress);
  console.log(`\n✅ Transaction confirmed!`);
  console.log(`Recipient balance: ${ethers.formatEther(recipientBalance)} ETH\n`);
  
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📋 Available Test Accounts (all have 10,000 ETH):");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  const accounts = await ethers.getSigners();
  for (let i = 0; i < Math.min(10, accounts.length); i++) {
    const balance = await provider.getBalance(accounts[i].address);
    console.log(`Account ${i}: ${accounts[i].address} - ${ethers.formatEther(balance)} ETH`);
  }
  console.log("\n💡 To import an account in MetaMask:");
  console.log("   1. Go to MetaMask → Import Account");
  console.log("   2. Use the private key from Hardhat node output");
  console.log("   3. Or ask me to send ETH to your current address!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
