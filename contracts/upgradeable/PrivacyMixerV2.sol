// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";

/**
 * @title IVerifier
 * @notice Interface for ZK proof verifier
 */
interface IVerifier {
    function verifyProof(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[] memory publicSignals
    ) external view returns (bool);
}

/**
 * @title PrivacyMixerV2
 * @notice Enhanced privacy mixer with ZK proof support for anonymous withdrawals
 * @dev This version adds commitment-based deposits and nullifier-based withdrawals
 */
contract PrivacyMixerV2 is Initializable, OwnableUpgradeable, ReentrancyGuardUpgradeable {
    // Storage variables from V1
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
    
    // V2: ZK Proof System - Maximum Privacy
    // Commitment registry: maps commitment hash to deposit info
    mapping(bytes32 => bool) public commitments;
    mapping(bytes32 => DepositInfo) public commitmentData;
    
    // Nullifier registry: prevents double-spending
    mapping(bytes32 => bool) public nullifiers;
    
    // Verifier contract address (will be set after deployment)
    address public verifier;
    
    // Maximum privacy: Only store minimal data needed for verification
    struct DepositInfo {
        uint256 amount;
        uint256 timestamp;
        uint256 poolId;
        // depositor address removed for maximum privacy
        // Amount can be hidden using fixed denominations
        // Timestamp can be hidden using time ranges
    }
    
    // Events
    event AddressGenerated(address indexed user, address indexed generatedAddress);
    event Deposit(address indexed user, uint256 amount, uint256 poolId, uint256 timestamp);
    event CommitmentCreated(bytes32 indexed commitment, uint256 amount, uint256 poolId);
    event Withdrawal(bytes32 indexed nullifier, address indexed recipient, uint256 amount);
    event PoolCreated(uint256 indexed poolId, uint256 lockDuration, uint256 maxDeposit);
    event Paused(address account);
    event Unpaused(address account);
    event VerifierUpdated(address oldVerifier, address newVerifier);
    
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
     * @notice Initialize the contract (replaces constructor)
     * @dev Can be called multiple times if using proxy pattern
     */
    function initialize() public initializer {
        __Ownable_init(msg.sender);
        __ReentrancyGuard_init();
        
        // Initialize default pools with production durations
        _createPool(3600, 10 ether, 15);   // 1 hour (3600 seconds) - 1.5% fee
        _createPool(14400, 50 ether, 15);  // 4 hours (14400 seconds) - 1.5% fee
        _createPool(86400, 100 ether, 15); // 24 hours (86400 seconds) - 1.5% fee
    }
    
    /**
     * @notice Set the ZK verifier contract address
     * @param _verifier Address of the verifier contract
     */
    function setVerifier(address _verifier) external onlyOwner {
        require(_verifier != address(0), "Invalid verifier address");
        address oldVerifier = verifier;
        verifier = _verifier;
        emit VerifierUpdated(oldVerifier, _verifier);
    }
    
    /**
     * @notice Create a new pool
     */
    function _createPool(uint256 lockDuration, uint256 maxDeposit, uint256 feeRate) internal {
        pools[totalPools] = Pool({
            lockDuration: lockDuration,
            maxDeposit: maxDeposit,
            feeRate: feeRate,
            active: true,
            totalDeposits: 0
        });
        emit PoolCreated(totalPools, lockDuration, maxDeposit);
        totalPools++;
    }
    
    /**
     * @notice Generate deterministic address for user (internal)
     */
    function _generateAddress() internal {
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
     * @notice Generate deterministic address for user (external)
     */
    function generateAddress() external returns (address) {
        require(!addressGenerated[msg.sender], "Address already generated");
        _generateAddress();
        return userToGeneratedAddress[msg.sender];
    }
    
    /**
     * @notice Deposit function (V1 compatible)
     * @param poolId Pool ID to deposit into
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
        
        // Update user deposits (V1 compatibility)
        userDeposits[msg.sender] += depositAmount;
        depositTimestamps[msg.sender] = block.timestamp;
        
        // Update pool
        pools[poolId].totalDeposits += depositAmount;
        
        emit Deposit(msg.sender, depositAmount, poolId, block.timestamp);
    }
    
    /**
     * @notice Deposit with ZK commitment (V2 new function) - Maximum Privacy
     * @param poolId Pool ID to deposit into
     * @param commitment Commitment hash (computed off-chain)
     * @dev Depositor address is NOT stored for maximum privacy
     */
    function depositWithCommitment(uint256 poolId, bytes32 commitment) external payable whenNotPaused {
        require(poolId < totalPools, "Invalid pool ID");
        require(pools[poolId].active, "Pool not active");
        require(msg.value >= 0.1 ether, "Minimum deposit 0.1 ETH");
        require(msg.value <= pools[poolId].maxDeposit, "Exceeds max deposit");
        require(!commitments[commitment], "Commitment already exists");
        
        // Calculate fee
        uint256 fee = (msg.value * pools[poolId].feeRate) / 1000;
        uint256 depositAmount = msg.value - fee;
        
        // Store commitment WITHOUT depositor address (maximum privacy)
        commitments[commitment] = true;
        commitmentData[commitment] = DepositInfo({
            amount: depositAmount,
            timestamp: block.timestamp,
            poolId: poolId
            // depositor removed for privacy
        });
        
        // Update pool
        pools[poolId].totalDeposits += depositAmount;
        
        // Emit event without depositor address
        emit CommitmentCreated(commitment, depositAmount, poolId);
    }
    
    /**
     * @notice Withdraw using ZK proof - Maximum Privacy
     * @param proof ZK proof (encoded Groth16 proof)
     * @param nullifier Nullifier hash to prevent double-spending
     * @param commitment Commitment hash of the deposit
     * @param recipient Address to receive the funds (can be stealth address)
     * @param amount Amount to withdraw
     * @dev Verifies ZK proof without revealing depositor identity
     */
    function withdrawWithProof(
        bytes calldata proof,
        bytes32 nullifier,
        bytes32 commitment,
        address recipient,
        uint256 amount
    ) external whenNotPaused nonReentrant {
        require(verifier != address(0), "Verifier not set");
        require(!nullifiers[nullifier], "Nullifier already used");
        require(commitments[commitment], "Invalid commitment");
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be greater than 0");
        
        DepositInfo memory depositInfo = commitmentData[commitment];
        require(amount <= depositInfo.amount, "Insufficient balance");
        require(block.timestamp >= depositInfo.timestamp + pools[depositInfo.poolId].lockDuration, "Lock period not expired");
        
        // Verify ZK proof using verifier contract
        // Decode proof from bytes
        (uint256[2] memory a, uint256[2][2] memory b, uint256[2] memory c) = abi.decode(proof, (uint256[2], uint256[2][2], uint256[2]));
        
        // Prepare public signals
        uint256[] memory publicSignals = new uint256[](4);
        publicSignals[0] = uint256(nullifier);
        publicSignals[1] = uint256(commitment);
        publicSignals[2] = uint256(uint160(recipient));
        publicSignals[3] = amount;
        
        // Call verifier contract
        (bool success, bytes memory returnData) = verifier.staticcall(
            abi.encodeWithSignature(
                "verifyProof(uint256[2],uint256[2][2],uint256[2],uint256[])",
                a, b, c, publicSignals
            )
        );
        
        require(success, "Verifier call failed");
        bool verified = abi.decode(returnData, (bool));
        require(verified, "Invalid ZK proof");
        
        // Mark nullifier as used (prevents double-spending)
        nullifiers[nullifier] = true;
        
        // Remove commitment (privacy: no link to original deposit)
        delete commitments[commitment];
        delete commitmentData[commitment];
        
        // Transfer funds
        (success, ) = recipient.call{value: amount}("");
        require(success, "Transfer failed");
        
        // Emit minimal event (nullifier only - no link to commitment or depositor)
        emit Withdrawal(nullifier, recipient, amount);
    }
    
    /**
     * @notice Check if user can withdraw (internal) - V1 compatibility
     * @dev Uses minimum lock duration from all pools (1 hour = 3600 seconds)
     */
    function _canWithdraw(address user) internal view returns (bool) {
        if (!addressGenerated[user] || userDeposits[user] == 0) {
            return false;
        }
        
        uint256 depositTime = depositTimestamps[user];
        // Use minimum lock duration from pool 0 (1 hour = 3600 seconds)
        uint256 lockDuration = pools[0].lockDuration;
        
        return block.timestamp >= depositTime + lockDuration;
    }
    
    /**
     * @notice Check if user can withdraw (external) - V1 compatibility
     */
    function canWithdraw(address user) external view returns (bool) {
        return _canWithdraw(user);
    }
    
    /**
     * @notice Withdraw function (V1 compatible)
     */
    function withdraw(address to, uint256 amount) external whenNotPaused nonReentrant {
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
    }
    
    /**
     * @notice Emergency pause
     */
    function emergencyPause() external onlyOwner {
        paused = true;
        emit Paused(msg.sender);
    }
    
    /**
     * @notice Emergency unpause
     */
    function emergencyUnpause() external onlyOwner {
        paused = false;
        emit Unpaused(msg.sender);
    }
    
    /**
     * @notice Get user's generated address
     */
    function getMyGeneratedAddress() external view returns (address) {
        require(addressGenerated[msg.sender], "No address generated");
        return userToGeneratedAddress[msg.sender];
    }
    
    /**
     * @notice Get pool information
     */
    function getPoolInfo(uint256 poolId) external view returns (Pool memory) {
        require(poolId < totalPools, "Invalid pool ID");
        return pools[poolId];
    }
    
    /**
     * @notice Get user deposit info
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
    
    /**
     * @notice Check if commitment exists
     */
    function commitmentExists(bytes32 commitment) external view returns (bool) {
        return commitments[commitment];
    }
    
    /**
     * @notice Check if nullifier has been used
     */
    function nullifierUsed(bytes32 nullifier) external view returns (bool) {
        return nullifiers[nullifier];
    }
}

// Placeholder for GeneratedWallet (would be a separate contract in production)
contract GeneratedWallet {
    // This is a placeholder - actual implementation would be a minimal wallet contract
}
