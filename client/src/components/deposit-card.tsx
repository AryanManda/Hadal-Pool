import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWallet } from "@/hooks/use-wallet";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CURRENCIES = ["ETH", "USDC", "BTC", "USDT"] as const;
type Currency = typeof CURRENCIES[number];

export default function DepositCard() {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("ETH");
  const [amount, setAmount] = useState("");
  const { isConnected, address } = useWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const depositMutation = useMutation({
    mutationFn: async (data: { amount: string; currency: Currency }) => {
      if (!address) throw new Error("Wallet not connected");
      
      const response = await apiRequest("POST", "/api/deposits", {
        userAddress: address,
        currency: data.currency,
        amount: data.amount,
        transactionHash: `0x${Math.random().toString(16).slice(2)}`, // Mock tx hash
        lockDuration: 86400, // 24 hours
      });
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Deposit Successful",
        description: "Your funds have been deposited and privacy timer started.",
      });
      setAmount("");
      queryClient.invalidateQueries({ queryKey: ["/api/deposits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pool-stats"] });
    },
    onError: (error) => {
      toast({
        title: "Deposit Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDeposit = () => {
    if (!isConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to make a deposit.",
        variant: "destructive",
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount.",
        variant: "destructive",
      });
      return;
    }

    if (selectedCurrency === "ETH" && parseFloat(amount) < 0.1) {
      toast({
        title: "Minimum Amount",
        description: "Minimum deposit is 0.1 ETH.",
        variant: "destructive",
      });
      return;
    }

    depositMutation.mutate({ amount, currency: selectedCurrency });
  };

  return (
    <div className="glass-effect rounded-xl p-6 neon-glow">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
          <i className="fas fa-arrow-down text-primary"></i>
        </div>
        <h2 className="text-xl font-semibold">Deposit</h2>
      </div>

      <div className="space-y-6">
        {/* Currency Selection */}
        <div>
          <Label className="block text-sm font-medium mb-2">Select Currency</Label>
          <div className="grid grid-cols-2 gap-2">
            {CURRENCIES.map((currency) => (
              <Button
                key={currency}
                variant={selectedCurrency === currency ? "default" : "secondary"}
                className={`${
                  selectedCurrency === currency
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
                onClick={() => setSelectedCurrency(currency)}
                data-testid={`button-currency-${currency.toLowerCase()}`}
              >
                {currency}
              </Button>
            ))}
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <Label className="block text-sm font-medium mb-2">Amount</Label>
          <div className="relative">
            <Input
              type="number"
              placeholder="0.1"
              step="0.001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring font-mono pr-12"
              data-testid="input-deposit-amount"
            />
            <div className="absolute right-3 top-3 text-muted-foreground text-sm">
              {selectedCurrency}
            </div>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Min: 0.1 {selectedCurrency}</span>
            <span>Fee: 0.3%</span>
          </div>
        </div>

        {/* Time Lock Info */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <i className="fas fa-clock text-accent"></i>
            <span className="font-medium">Time Lock</span>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            Minimum lock period: <span className="font-mono text-accent">24 hours</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Longer lock periods increase privacy through larger anonymity sets
          </p>
        </div>

        {/* Deposit Button */}
        <Button
          onClick={handleDeposit}
          disabled={!isConnected || depositMutation.isPending}
          className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:opacity-90 transition-all flex items-center justify-center space-x-2"
          data-testid="button-deposit"
        >
          <i className="fas fa-shield-alt"></i>
          <span>
            {depositMutation.isPending ? "Processing..." : "Deposit & Start Privacy Timer"}
          </span>
        </Button>
      </div>
    </div>
  );
}
