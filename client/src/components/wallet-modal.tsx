import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/use-wallet";

export default function WalletModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { connect } = useWallet();

  const handleConnect = async (walletType: string) => {
    try {
      await connect(walletType);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-all"
        data-testid="button-open-wallet-modal"
      >
        Connect Wallet
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="glass-effect border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Connect Wallet</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-3">
            <Button
              onClick={() => handleConnect("metamask")}
              className="w-full bg-card border border-border rounded-lg p-4 hover:bg-muted/50 transition-all flex items-center space-x-3 justify-start"
              variant="ghost"
              data-testid="button-connect-metamask"
            >
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <i className="fab fa-ethereum text-white"></i>
              </div>
              <span className="font-medium">MetaMask</span>
              <div className="ml-auto text-primary text-sm">Popular</div>
            </Button>
            
            <Button
              onClick={() => handleConnect("walletconnect")}
              className="w-full bg-card border border-border rounded-lg p-4 hover:bg-muted/50 transition-all flex items-center space-x-3 justify-start"
              variant="ghost"
              data-testid="button-connect-walletconnect"
            >
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <i className="fas fa-qrcode text-white"></i>
              </div>
              <span className="font-medium">WalletConnect</span>
            </Button>
            
            <Button
              onClick={() => handleConnect("coinbase")}
              className="w-full bg-card border border-border rounded-lg p-4 hover:bg-muted/50 transition-all flex items-center space-x-3 justify-start"
              variant="ghost"
              data-testid="button-connect-coinbase"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-wallet text-white"></i>
              </div>
              <span className="font-medium">Coinbase Wallet</span>
            </Button>
          </div>
          
          <div className="mt-6 text-xs text-muted-foreground text-center">
            By connecting a wallet, you agree to our Terms of Service and Privacy Policy
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
