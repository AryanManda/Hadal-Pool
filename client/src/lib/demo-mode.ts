// Demo mode - works without blockchain connection
// Perfect for presentations and demos

export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true" || 
                         localStorage.getItem("demoMode") === "true";

export interface DemoTransaction {
  hash: string;
  blockNumber: number;
  timestamp: number;
}

// Generate a fake transaction hash
function generateFakeTxHash(): string {
  return "0x" + Array.from({ length: 64 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join("");
}

// Simulate a deposit transaction
export async function simulateDeposit(
  amount: string,
  currency: string,
  timeLock: number
): Promise<DemoTransaction> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return {
    hash: generateFakeTxHash(),
    blockNumber: Math.floor(Math.random() * 1000000) + 1000000,
    timestamp: Date.now(),
  };
}

// Simulate a withdrawal transaction
export async function simulateWithdraw(
  depositId: string,
  recipient: string
): Promise<DemoTransaction> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return {
    hash: generateFakeTxHash(),
    blockNumber: Math.floor(Math.random() * 1000000) + 1000000,
    timestamp: Date.now(),
  };
}

// Generate a fake wallet address
export function generateFakeAddress(): string {
  return "0x" + Array.from({ length: 40 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join("");
}

// Get demo balance (always has enough)
export function getDemoBalance(): number {
  return 10000; // Always have 10,000 ETH in demo mode
}











