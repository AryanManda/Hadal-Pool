import { useState, useEffect, createContext, useContext } from "react";
import { useToast } from "@/hooks/use-toast";
import { getMetaMaskProvider } from "@/lib/wallet-utils";
import { DEMO_MODE, generateFakeAddress } from "@/lib/demo-mode";

interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  connect: (walletType?: string) => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // DEMO MODE: Auto-connect with fake address
    if (DEMO_MODE) {
      const demoAddress = generateFakeAddress();
      setAddress(demoAddress);
      setIsConnected(true);
      return;
    }
    
    // REAL MODE: Check if wallet is already connected
    checkConnection();
  }, []);

  const checkConnection = async () => {
    if (DEMO_MODE) return; // Skip in demo mode
    
    const provider = getMetaMaskProvider();
    if (provider) {
      try {
        const accounts = await provider.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          setIsConnected(true);
        }
      } catch (error) {
        console.error("Failed to check wallet connection:", error);
      }
    }
  };

  const connect = async (walletType: string = "metamask") => {
    // DEMO MODE: Auto-connect with fake address
    if (DEMO_MODE) {
      const demoAddress = generateFakeAddress();
      setAddress(demoAddress);
      setIsConnected(true);
      toast({
        title: "Demo Mode Active",
        description: `Connected in demo mode: ${demoAddress.slice(0, 6)}...${demoAddress.slice(-4)}`,
      });
      return;
    }
    
    // REAL MODE: Connect to MetaMask
    const provider = getMetaMaskProvider();
    
    if (!provider) {
      toast({
        title: "MetaMask Not Found",
        description: "Please install MetaMask browser extension to continue.",
        variant: "destructive",
      });
      return;
    }

    try {
      const accounts = await provider.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        setAddress(accounts[0]);
        setIsConnected(true);
        toast({
          title: "MetaMask Connected",
          description: `Connected to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect MetaMask",
        variant: "destructive",
      });
    }
  };

  const disconnect = () => {
    setAddress(null);
    setIsConnected(false);
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected.",
    });
  };

  return (
    <WalletContext.Provider value={{ isConnected, address, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
