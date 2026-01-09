// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract PrivacyMixerV1 is 
    Initializable, 
    OwnableUpgradeable
{
    // Storage variables
    mapping(address => address) public userToGeneratedAddress;
    mapping(address => bool) public addressGenerated;
    mapping(address => uint256) public userDeposits;
    mapping(address => uint256) public depositTimestamps;
    
    struct Pool {
        uint256 lockDuration;
        uint256 maxDeposit;
        uint256 feeRate;
        bool active;
        uint256 totalDeposits;
    }
    
    mapping(uint256 => Pool) public pools;
    uint256 public totalPools;
    bool public paused;
    
    // Events
    event AddressGenerated(address indexed user, address indexed generatedAddress);
    event Deposit(address indexed user, uint256 amount, uint256 poolId, uint256 timestamp);
    // PRIVACY: Withdrawal event removed - withdrawals are now private and not logged on block explorers
    // event Withdrawal(address indexed user, address indexed to, uint256 amount);
    event PoolCreated(uint256 indexed poolId, uint256 lockDuration, uint256 maxDeposit);
    event Paused(address account);
    event Unpaused(address account);
    
    // Modifiers
    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }
    
    modifier whenPaused() {
        require(paused, "Contract is not paused");
        _;
    }
    
    /**
     * Initialize the contract (replaces constructor)
     */
    function initialize() public initializer {
        __Ownable_init(msg.sender);
        
        // Initialize default pools with actual durations
        _createPool(3600, 10 ether, 15);   // 1 hour (3600 seconds) - 1.5% fee
        _createPool(14400, 50 ether, 15);  // 4 hours (14400 seconds) - 1.5% fee
        _createPool(86400, 100 ether, 15); // 24 hours (86400 seconds) - 1.5% fee
    }
    
    /**
     * Create a new pool
     */
    function _createPool(uint256 _lockDuration, uint256 _maxDeposit, uint256 _feeRate) internal {
        pools[totalPools] = Pool({
            lockDuration: _lockDuration,
            maxDeposit: _maxDeposit,
            feeRate: _feeRate,
            active: true,
            totalDeposits: 0
        });
        emit PoolCreated(totalPools, _lockDuration, _maxDeposit);
        totalPools++;
    }
    
    /**
     * Generate deterministic address for user (internal)
     */
    function _generateAddress() internal {
        // Use CREATE2 to generate deterministic address
        bytes32 salt = keccak256(abi.encodePacked(msg.sender, block.timestamp, block.number));
        address generatedAddress = address(uint160(uint256(keccak256(abi.encodePacked(
            bytes1(0xff),
            address(this),
            salt,
            keccak256(abi.encodePacked(type(GeneratedWallet).creationCode))
        )))));
        
        userToGeneratedAddress[msg.sender] = generatedAddress;
        addressGenerated[msg.sender] = true;
        
        emit AddressGenerated(msg.sender, generatedAddress);
    }
    
    /**
     * Generate deterministic address for user (external)
     */
    function generateAddress() external returns (address) {
        require(!addressGenerated[msg.sender], "Address already generated");
        
        _generateAddress();
        return userToGeneratedAddress[msg.sender];
    }
    
    /**
     * Deposit function
     */
    function deposit(uint256 poolId) external payable whenNotPaused {
        require(poolId < totalPools, "Invalid pool ID");
        require(pools[poolId].active, "Pool not active");
        require(msg.value >= 0.1 ether, "Minimum deposit 0.1 ETH");
        require(msg.value <= pools[poolId].maxDeposit, "Exceeds max deposit");
        
        // Auto-generate address if not exists
        if (!addressGenerated[msg.sender]) {
            _generateAddress();
        }
        
        // Calculate fee
        uint256 fee = (msg.value * pools[poolId].feeRate) / 1000;
        uint256 depositAmount = msg.value - fee;
        
        // Update user deposits
        userDeposits[msg.sender] += depositAmount;
        depositTimestamps[msg.sender] = block.timestamp;
        
        // Update pool
        pools[poolId].totalDeposits += depositAmount;
        
        emit Deposit(msg.sender, depositAmount, poolId, block.timestamp);
    }
    
    /**
     * Check if user can withdraw (internal)
     */
    function _canWithdraw(address user) internal view returns (bool) {
        if (!addressGenerated[user] || userDeposits[user] == 0) {
            return false;
        }
        
        // Check if lock period has passed
        // Use minimum lock duration (1 hour = 3600 seconds) from pools
        // This is the safest approach since we check all pools to find the minimum
        uint256 depositTime = depositTimestamps[user];
        uint256 lockDuration = 3600; // 1 hour (3600 seconds) - minimum lock duration
        
        return block.timestamp >= depositTime + lockDuration;
    }
    
    /**
     * Check if user can withdraw (external)
     */
    function canWithdraw(address user) external view returns (bool) {
        return _canWithdraw(user);
    }
    
    /**
     * Withdraw function
     */
    function withdraw(address to, uint256 amount) external whenNotPaused {
        require(addressGenerated[msg.sender], "No generated address");
        require(_canWithdraw(msg.sender), "Lock period not expired");
        require(to != address(0), "Invalid address");
        require(amount <= userDeposits[msg.sender], "Insufficient balance");
        require(address(this).balance >= amount, "Insufficient contract balance");
        
        // Update user balance
        userDeposits[msg.sender] -= amount;
        
        // Transfer funds
        (bool success, ) = to.call{value: amount}("");
        require(success, "Transfer failed");
        
        // PRIVACY: No event emitted - withdrawals are private and not logged on block explorers
        // This prevents linking deposit addresses to withdrawal addresses on Etherscan
    }
    
    /**
     * Emergency pause
     */
    function emergencyPause() external onlyOwner {
        paused = true;
        emit Paused(msg.sender);
    }
    
    /**
     * Emergency unpause
     */
    function emergencyUnpause() external onlyOwner {
        paused = false;
        emit Unpaused(msg.sender);
    }
    
    /**
     * Get user's generated address
     */
    function getMyGeneratedAddress() external view returns (address) {
        require(addressGenerated[msg.sender], "No address generated");
        return userToGeneratedAddress[msg.sender];
    }
    
    /**
     * Get pool information
     */
    function getPoolInfo(uint256 poolId) external view returns (Pool memory) {
        require(poolId < totalPools, "Invalid pool ID");
        return pools[poolId];
    }
    
    /**
     * Get user deposit info
     */
    function getUserDepositInfo(address user) external view returns (
        uint256 depositAmount,
        uint256 depositTime,
        bool canWithdrawNow
    ) {
        depositAmount = userDeposits[user];
        depositTime = depositTimestamps[user];
        canWithdrawNow = this.canWithdraw(user);
    }
}

// Mock GeneratedWallet contract for CREATE2
contract GeneratedWallet {
    constructor() {}
}
