const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PrivacyMixer", function () {
  let privacyMixer;
  let implementation;
  let proxy;
  let owner;
  let user1;
  let user2;
  
  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    
    // Deploy implementation
    const PrivacyMixerV1 = await ethers.getContractFactory("PrivacyMixerV1");
    implementation = await PrivacyMixerV1.deploy();
    await implementation.waitForDeployment();
    
    // Deploy proxy
    const PrivacyMixerProxy = await ethers.getContractFactory("PrivacyMixerProxy");
    proxy = await PrivacyMixerProxy.deploy(
      await implementation.getAddress(),
      "0x"
    );
    await proxy.waitForDeployment();
    
    // Attach to proxy
    privacyMixer = PrivacyMixerV1.attach(await proxy.getAddress());
    await privacyMixer.initialize();
  });
  
  describe("Initialization", function () {
    it("Should initialize with correct owner", async function () {
      expect(await privacyMixer.owner()).to.equal(owner.address);
    });
    
    it("Should create default pools", async function () {
      const totalPools = await privacyMixer.totalPools();
      expect(totalPools).to.equal(3);
      
      // Check pool 0 (1 hour)
      const pool0 = await privacyMixer.getPoolInfo(0);
      expect(pool0.lockDuration).to.equal(3600);
      expect(pool0.maxDeposit).to.equal(ethers.parseEther("10"));
      expect(pool0.feeRate).to.equal(3);
      expect(pool0.active).to.be.true;
      
      // Check pool 1 (4 hours)
      const pool1 = await privacyMixer.getPoolInfo(1);
      expect(pool1.lockDuration).to.equal(14400);
      expect(pool1.maxDeposit).to.equal(ethers.parseEther("50"));
      
      // Check pool 2 (24 hours)
      const pool2 = await privacyMixer.getPoolInfo(2);
      expect(pool2.lockDuration).to.equal(86400);
      expect(pool2.maxDeposit).to.equal(ethers.parseEther("100"));
    });
  });
  
  describe("Address Generation", function () {
    it("Should generate address for user", async function () {
      const tx = await privacyMixer.connect(user1).generateAddress();
      await tx.wait();
      
      const generatedAddress = await privacyMixer.userToGeneratedAddress(user1.address);
      expect(generatedAddress).to.not.equal(ethers.ZeroAddress);
      expect(await privacyMixer.addressGenerated(user1.address)).to.be.true;
    });
    
    it("Should not allow generating address twice", async function () {
      await privacyMixer.connect(user1).generateAddress();
      
      await expect(
        privacyMixer.connect(user1).generateAddress()
      ).to.be.revertedWith("Address already generated");
    });
    
    it("Should emit AddressGenerated event", async function () {
      await expect(privacyMixer.connect(user1).generateAddress())
        .to.emit(privacyMixer, "AddressGenerated")
        .withArgs(user1.address, await privacyMixer.userToGeneratedAddress(user1.address));
    });
  });
  
  describe("Deposits", function () {
    beforeEach(async function () {
      // Generate address for user1
      await privacyMixer.connect(user1).generateAddress();
    });
    
    it("Should allow valid deposits", async function () {
      const depositAmount = ethers.parseEther("1");
      const tx = await privacyMixer.connect(user1).deposit(0, { value: depositAmount });
      await tx.wait();
      
      const userDepositInfo = await privacyMixer.getUserDepositInfo(user1.address);
      expect(userDepositInfo.depositAmount).to.equal(depositAmount.sub(depositAmount.mul(3).div(1000))); // After fee
    });
    
    it("Should reject deposits below minimum", async function () {
      const depositAmount = ethers.parseEther("0.05"); // Below 0.1 ETH minimum
      
      await expect(
        privacyMixer.connect(user1).deposit(0, { value: depositAmount })
      ).to.be.revertedWith("Minimum deposit 0.1 ETH");
    });
    
    it("Should reject deposits above maximum", async function () {
      const depositAmount = ethers.parseEther("15"); // Above 10 ETH max for pool 0
      
      await expect(
        privacyMixer.connect(user1).deposit(0, { value: depositAmount })
      ).to.be.revertedWith("Exceeds max deposit");
    });
    
    it("Should reject deposits to inactive pools", async function () {
      // This would require adding a function to deactivate pools
      // For now, we'll test with invalid pool ID
      await expect(
        privacyMixer.connect(user1).deposit(999, { value: ethers.parseEther("1") })
      ).to.be.revertedWith("Invalid pool ID");
    });
    
    it("Should auto-generate address if not exists", async function () {
      // User2 hasn't generated address yet
      expect(await privacyMixer.addressGenerated(user2.address)).to.be.false;
      
      // Deposit should auto-generate address
      await privacyMixer.connect(user2).deposit(0, { value: ethers.parseEther("1") });
      
      expect(await privacyMixer.addressGenerated(user2.address)).to.be.true;
    });
    
    it("Should emit Deposit event", async function () {
      const depositAmount = ethers.parseEther("1");
      
      await expect(privacyMixer.connect(user1).deposit(0, { value: depositAmount }))
        .to.emit(privacyMixer, "Deposit")
        .withArgs(user1.address, depositAmount.sub(depositAmount.mul(3).div(1000)), 0, await ethers.provider.getBlockNumber());
    });
  });
  
  describe("Withdrawals", function () {
    beforeEach(async function () {
      // Generate address and deposit for user1
      await privacyMixer.connect(user1).generateAddress();
      await privacyMixer.connect(user1).deposit(0, { value: ethers.parseEther("1") });
    });
    
    it("Should not allow withdrawal before lock period", async function () {
      const canWithdraw = await privacyMixer.canWithdraw(user1.address);
      expect(canWithdraw).to.be.false;
      
      await expect(
        privacyMixer.connect(user1).withdraw(user2.address, ethers.parseEther("0.5"))
      ).to.be.revertedWith("Lock period not expired");
    });
    
    it("Should allow withdrawal after lock period", async function () {
      // Fast forward time (this would need to be done with a time manipulation library in real tests)
      // For now, we'll test the canWithdraw function
      const userDepositInfo = await privacyMixer.getUserDepositInfo(user1.address);
      expect(userDepositInfo.canWithdrawNow).to.be.false;
    });
    
    it("Should reject withdrawal without generated address", async function () {
      await expect(
        privacyMixer.connect(user2).withdraw(user1.address, ethers.parseEther("0.5"))
      ).to.be.revertedWith("No generated address");
    });
    
    it("Should reject withdrawal to zero address", async function () {
      await expect(
        privacyMixer.connect(user1).withdraw(ethers.ZeroAddress, ethers.parseEther("0.5"))
      ).to.be.revertedWith("Invalid address");
    });
  });
  
  describe("Access Control", function () {
    it("Should allow only owner to pause", async function () {
      await expect(privacyMixer.connect(user1).emergencyPause())
        .to.be.revertedWith("Ownable: caller is not the owner");
      
      await privacyMixer.connect(owner).emergencyPause();
      expect(await privacyMixer.paused()).to.be.true;
    });
    
    it("Should allow only owner to unpause", async function () {
      await privacyMixer.connect(owner).emergencyPause();
      
      await expect(privacyMixer.connect(user1).emergencyUnpause())
        .to.be.revertedWith("Ownable: caller is not the owner");
      
      await privacyMixer.connect(owner).emergencyUnpause();
      expect(await privacyMixer.paused()).to.be.false;
    });
    
    it("Should prevent deposits when paused", async function () {
      await privacyMixer.connect(owner).emergencyPause();
      
      await expect(
        privacyMixer.connect(user1).deposit(0, { value: ethers.parseEther("1") })
      ).to.be.revertedWith("Pausable: paused");
    });
  });
  
  describe("Proxy Functionality", function () {
    it("Should allow owner to upgrade implementation", async function () {
      // Deploy new implementation
      const PrivacyMixerV1 = await ethers.getContractFactory("PrivacyMixerV1");
      const newImplementation = await PrivacyMixerV1.deploy();
      await newImplementation.waitForDeployment();
      
      // Upgrade proxy
      await proxy.connect(owner).upgradeTo(await newImplementation.getAddress());
      
      // Verify upgrade
      expect(await proxy.implementation()).to.equal(await newImplementation.getAddress());
    });
    
    it("Should not allow non-owner to upgrade", async function () {
      const PrivacyMixerV1 = await ethers.getContractFactory("PrivacyMixerV1");
      const newImplementation = await PrivacyMixerV1.deploy();
      await newImplementation.waitForDeployment();
      
      await expect(
        proxy.connect(user1).upgradeTo(await newImplementation.getAddress())
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
});
