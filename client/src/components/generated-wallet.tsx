import { useState } from "react";
import { WalletGenerator, type GeneratedWallet } from "@/lib/wallet-generator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface GeneratedWalletProps {
  onWalletGenerated: (wallet: GeneratedWallet) => void;
  onUseWallet: (address: string) => void;
}

export default function GeneratedWalletComponent({ onWalletGenerated, onUseWallet }: GeneratedWalletProps) {
  const [generatedWallet, setGeneratedWallet] = useState<GeneratedWallet | null>(null);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [showMnemonic, setShowMnemonic] = useState(false);
  const { toast } = useToast();

  const generateNewWallet = () => {
    try {
      const wallet = WalletGenerator.generateWallet();
      setGeneratedWallet(wallet);
      onWalletGenerated(wallet);
      
      toast({
        title: "Wallet Generated",
        description: "A new privacy wallet has been created for you.",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate wallet. Please try again.",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${label} copied to clipboard`,
    });
  };

  const useThisWallet = () => {
    if (generatedWallet) {
      onUseWallet(generatedWallet.address);
      toast({
        title: "Wallet Selected",
        description: "Using generated wallet for withdrawal",
      });
    }
  };

  return (
    <Card className="glass-effect border-border">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <i className="fas fa-wallet text-primary"></i>
          <span>Hadal Wallet Generator</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!generatedWallet ? (
          <div className="text-center space-y-4">
            <div className="bg-muted/50 rounded-lg p-6">
              <i className="fas fa-shield-alt text-4xl text-primary mb-4"></i>
              <h3 className="text-lg font-semibold mb-2">Generate Fresh Wallet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create a new wallet with no transaction history for maximum privacy
              </p>
              <Button onClick={generateNewWallet} className="w-full">
                <i className="fas fa-plus mr-2"></i>
                Generate New Wallet
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Alert>
              <i className="fas fa-info-circle"></i>
              <AlertDescription>
                <strong>Important:</strong> Save your private key and mnemonic phrase securely. 
                You'll need them to access your funds.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Wallet Address:</span>
                <Badge variant="secondary" className="font-mono">
                  {WalletGenerator.formatAddress(generatedWallet.address)}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="font-medium">Private Key:</span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPrivateKey(!showPrivateKey)}
                  >
                    {showPrivateKey ? "Hide" : "Show"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(generatedWallet.privateKey, "Private key")}
                  >
                    <i className="fas fa-copy"></i>
                  </Button>
                </div>
              </div>
              
              {showPrivateKey && (
                <div className="bg-muted p-3 rounded-lg font-mono text-xs break-all">
                  {generatedWallet.privateKey}
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="font-medium">Mnemonic Phrase:</span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMnemonic(!showMnemonic)}
                  >
                    {showMnemonic ? "Hide" : "Show"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(generatedWallet.mnemonic, "Mnemonic phrase")}
                  >
                    <i className="fas fa-copy"></i>
                  </Button>
                </div>
              </div>
              
              {showMnemonic && (
                <div className="bg-muted p-3 rounded-lg font-mono text-xs">
                  {generatedWallet.mnemonic}
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <Button onClick={useThisWallet} className="w-full">
                <i className="fas fa-check mr-2"></i>
                Use This Wallet
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
