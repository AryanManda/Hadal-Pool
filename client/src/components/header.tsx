import { Link, useLocation } from "wouter";
import { useWallet } from "@/hooks/use-wallet";
import { Button } from "@/components/ui/button";

export default function Header() {
  const { isConnected, address, connect, disconnect } = useWallet();
  const [location] = useLocation();

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <i className="fas fa-shield-alt text-primary-foreground text-sm"></i>
              </div>
              <h1 className="text-lg font-semibold">Hadal Pool</h1>
            </Link>
            {location === "/app" && (
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  About
                </Button>
              </Link>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => isConnected ? disconnect() : connect()}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              data-testid="button-connect-wallet"
            >
              {isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : "Connect Wallet"}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
