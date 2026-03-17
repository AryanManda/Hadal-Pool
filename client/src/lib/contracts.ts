// client/src/lib/contracts.ts
export const CONTRACT_ADDRESSES = {
  localhost: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512", // Localhost/Hardhat deployment
  sepolia: "0xBF0B842259D654159D37AD88FafaE694FdE95AA3", // Sepolia deployment (deployed 2025-12-28)
  mainnet: "", // Will be filled after mainnet deployment
  arbitrum: "", // Arbitrum One (Chain ID: 42161) - Will be filled after deployment
  arbitrumSepolia: "", // Arbitrum Sepolia testnet (Chain ID: 421614) - Will be filled after deployment
  base: "0x2ea9a9CC49e565fC1247BD1C59C04cfaFBCa18E1", // Base Mainnet (Chain ID: 8453) - Deployed via Remix
  baseSepolia: "", // Base Sepolia testnet (Chain ID: 84532) - Will be filled after deployment
} as const;

export const CONTRACT_ABI = [
  // PrivacyMixerV1 ABI
  "function initialize() external",
  "function generateAddress() external returns (address)",
  "function deposit(uint256 poolId) external payable",
  "function withdraw(address to, uint256 amount) external",
  "function canWithdraw(address user) external view returns (bool)",
  "function getMyGeneratedAddress() external view returns (address)",
  "function getPoolInfo(uint256 poolId) external view returns (tuple(uint256 lockDuration, uint256 maxDeposit, uint256 feeRate, bool active, uint256 totalDeposits))",
  "function getUserDepositInfo(address user) external view returns (uint256 depositAmount, uint256 depositTime, bool canWithdrawNow)",
  "function userToGeneratedAddress(address) external view returns (address)",
  "function addressGenerated(address) external view returns (bool)",
  "function totalPools() external view returns (uint256)",
  "function owner() external view returns (address)",
  "function emergencyPause() external",
  "function emergencyUnpause() external",
  "function paused() external view returns (bool)",
  
  // PrivacyMixerV2 ABI - ZK Proof Functions
  "function depositWithCommitment(uint256 poolId, bytes32 commitment) external payable",
  "function withdrawWithProof(bytes calldata proof, bytes32 nullifier, bytes32 commitment, address recipient, uint256 amount) external",
  "function setVerifier(address _verifier) external",
  "function commitmentExists(bytes32 commitment) external view returns (bool)",
  "function nullifierUsed(bytes32 nullifier) external view returns (bool)",
  "function commitments(bytes32) external view returns (bool)",
  "function nullifiers(bytes32) external view returns (bool)",
  "function verifier() external view returns (address)",
  
  // Events
  "event AddressGenerated(address indexed user, address indexed generatedAddress)",
  "event Deposit(address indexed user, uint256 amount, uint256 poolId, uint256 timestamp)",
  "event CommitmentCreated(bytes32 indexed commitment, uint256 amount, uint256 poolId)",
  "event Withdrawal(bytes32 indexed nullifier, address indexed recipient, uint256 amount)",
  // PRIVACY: Withdrawal event removed - withdrawals are now private
  "event PoolCreated(uint256 indexed poolId, uint256 lockDuration, uint256 maxDeposit)",
  "event Paused(address account)",
  "event Unpaused(address account)",
  "event VerifierUpdated(address oldVerifier, address newVerifier)",
];

export const POOL_IDS = {
  ONE_HOUR: 0,
  FOUR_HOURS: 1,
  TWENTY_FOUR_HOURS: 2,
} as const;

export type PoolId = typeof POOL_IDS[keyof typeof POOL_IDS];
