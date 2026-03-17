// Utilities for selecting wallet providers (EIP-1193)

import EthereumProvider from "@walletconnect/ethereum-provider";
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";

export type Eip1193Provider = {
  request: (args: { method: string; params?: any[] | object }) => Promise<any>;
  on?: (event: string, listener: (...args: any[]) => void) => void;
  removeListener?: (event: string, listener: (...args: any[]) => void) => void;
  disconnect?: () => Promise<void> | void;
};

// Utility to get MetaMask provider specifically, avoiding Phantom and other wallets
export function getMetaMaskProvider(): Eip1193Provider | null {
  if (typeof window === "undefined" || typeof (window as any).ethereum === "undefined") {
    return null;
  }

  const ethereum = (window as any).ethereum;

  // Check if it's MetaMask specifically
  if (ethereum.isMetaMask) return ethereum;

  // If multiple providers exist (EIP-6963), try to find MetaMask
  if (ethereum.providers) {
    const metaMaskProvider = ethereum.providers.find((p: any) => p.isMetaMask);
    if (metaMaskProvider) return metaMaskProvider;
  }

  // Fallback: if only one provider and it's not explicitly Phantom, use it
  if (!ethereum.isPhantom) return ethereum;

  return null;
}

let walletConnectProviderSingleton: Eip1193Provider | null = null;

export async function getWalletConnectProvider(): Promise<Eip1193Provider> {
  if (walletConnectProviderSingleton) return walletConnectProviderSingleton;

  const projectId = (import.meta as any).env?.VITE_WALLETCONNECT_PROJECT_ID as string | undefined;
  if (!projectId) {
    throw new Error("WalletConnect is not configured. Set VITE_WALLETCONNECT_PROJECT_ID in your environment.");
  }

  // Support the networks your app supports; WalletConnect requires explicit chain list.
  const chains = [1, 11155111, 8453, 84532, 42161, 421614, 31337] as const;
  const optionalChains = chains as unknown as [number, ...number[]];

  const provider = (await EthereumProvider.init({
    projectId,
    chains: chains as unknown as number[],
    showQrModal: true,
    optionalChains,
    methods: [
      "eth_requestAccounts",
      "eth_accounts",
      "eth_chainId",
      "wallet_switchEthereumChain",
      "eth_sendTransaction",
      "personal_sign",
      "eth_signTypedData_v4",
    ],
    events: ["accountsChanged", "chainChanged", "disconnect"],
  })) as unknown as Eip1193Provider;

  walletConnectProviderSingleton = provider;
  return provider;
}

export function getCoinbaseProvider(): Eip1193Provider {
  const appName = "Privacy Mixer";

  const sdk = new CoinbaseWalletSDK({
    appName,
  });

  // Coinbase SDK supports multiple chains via JSON-RPC; if rpcUrl is not provided it can still connect
  // but may be less reliable for chain switching.
  const provider = sdk.makeWeb3Provider() as unknown as Eip1193Provider;
  return provider;
}











