// client/src/lib/contracts.ts
export const CONTRACT_ADDRESSES = {
  sepolia: "0xBF0B842259D654159D37AD88FafaE694FdE95AA3", // Sepolia deployment (deployed 2025-12-28)
  mainnet: "", // Will be filled after mainnet deployment
  arbitrum: "", // Arbitrum One (Chain ID: 42161) - Will be filled after deployment
  arbitrumSepolia: "", // Arbitrum Sepolia testnet (Chain ID: 421614) - Will be filled after deployment
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
  
  // Events
  "event AddressGenerated(address indexed user, address indexed generatedAddress)",
  "event Deposit(address indexed user, uint256 amount, uint256 poolId, uint256 timestamp)",
  // PRIVACY: Withdrawal event removed - withdrawals are now private
  "event PoolCreated(uint256 indexed poolId, uint256 lockDuration, uint256 maxDeposit)",
  "event Paused(address account)",
  "event Unpaused(address account)",
];

export const POOL_IDS = {
  ONE_HOUR: 0,
  FOUR_HOURS: 1,
  TWENTY_FOUR_HOURS: 2,
} as const;

export type PoolId = typeof POOL_IDS[keyof typeof POOL_IDS];
