declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      isMetaMask?: boolean;
      isPhantom?: boolean;
      selectedAddress?: string;
      chainId?: string;
      providers?: any[];
    };
  }
}

export {};