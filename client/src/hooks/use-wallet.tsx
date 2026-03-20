import { useState, useEffect, createContext, useContext } from "react";
import { useToast } from "@/hooks/use-toast";
import { getCoinbaseProvider, getMetaMaskProvider, getWalletConnectProvider, type Eip1193Provider } from "@/lib/wallet-utils";
import { DEMO_MODE, generateFakeAddress } from "@/lib/demo-mode";

interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  provider: Eip1193Provider | null;
  walletType: "metamask" | "walletconnect" | "coinbase" | null;
  connect: (walletType?: string) => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<Eip1193Provider | null>(null);
  const [walletType, setWalletType] = useState<WalletContextType["walletType"]>(null);
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

    // Try restoring last used wallet type
    const lastType = (localStorage.getItem("walletType") as WalletContextType["walletType"]) || "metamask";

    let p: Eip1193Provider | null = null;
    try {
      if (lastType === "walletconnect") {
        p = await getWalletConnectProvider();
      } else if (lastType === "coinbase") {
        p = getCoinbaseProvider();
      } else {
        p = getMetaMaskProvider();
      }
    } catch (e) {
      p = getMetaMaskProvider();
    }

    if (p) {
      try {
        const accounts = await p.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          setIsConnected(true);
          setProvider(p);
          setWalletType(lastType || "metamask");
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
    
    try {
      let p: Eip1193Provider | null = null;

      if (walletType === "walletconnect") {
        p = await getWalletConnectProvider();
      } else if (walletType === "coinbase") {
        p = getCoinbaseProvider();
      } else {
        p = getMetaMaskProvider();
      }

      if (!p) {
        toast({
          title: "Wallet Not Found",
          description:
            walletType === "metamask"
              ? "Please install MetaMask browser extension to continue."
              : walletType === "coinbase"
                ? "Could not initialize Coinbase Wallet. Please try again."
                : "Could not initialize WalletConnect. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // WalletConnect provider requires establishing a WC session before request()
      if (walletType === "walletconnect" && typeof (p as any).connect === "function") {
        await (p as any).connect();
      }

      const accounts = await p.request({ method: "eth_requestAccounts" });

      if (accounts.length > 0) {
        setAddress(accounts[0]);
        setIsConnected(true);
        setProvider(p);
        setWalletType(walletType as WalletContextType["walletType"]);
        localStorage.setItem("walletType", walletType);
        toast({
          title:
            walletType === "walletconnect"
              ? "WalletConnect Connected"
              : walletType === "coinbase"
                ? "Coinbase Wallet Connected"
                : "MetaMask Connected",
          description: `Connected to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      });
    }
  };

  const disconnect = () => {
    setAddress(null);
    setIsConnected(false);
    setProvider(null);
    setWalletType(null);
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected.",
    });
  };

  return (
    <WalletContext.Provider value={{ isConnected, address, provider, walletType, connect, disconnect }}>
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
