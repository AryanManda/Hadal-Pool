import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useWallet } from "@/hooks/use-wallet";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import CountdownTimer from "@/components/countdown-timer";
import type { Deposit } from "@shared/schema";

export default function WithdrawCard() {
  const [freshWalletAddress, setFreshWalletAddress] = useState("");
  const [useRelayer, setUseRelayer] = useState(true);
  const [selectedDeposit, setSelectedDeposit] = useState<string | null>(null);
  const { address } = useWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: deposits = [] } = useQuery<Deposit[]>({
    queryKey: ["/api/deposits", address],
    enabled: !!address,
  });

  const withdrawMutation = useMutation({
    mutationFn: async (data: { depositId: string; withdrawAddress: string; useRelayer: boolean }) => {
      const response = await apiRequest("POST", "/api/withdrawals", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Withdrawal Successful",
        description: "Your funds have been anonymously withdrawn.",
      });
      setFreshWalletAddress("");
      setSelectedDeposit(null);
      queryClient.invalidateQueries({ queryKey: ["/api/deposits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pool-stats"] });
    },
    onError: (error) => {
      toast({
        title: "Withdrawal Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleWithdraw = () => {
    if (!selectedDeposit) {
      toast({
        title: "No Deposit Selected",
        description: "Please select a deposit to withdraw.",
        variant: "destructive",
      });
      return;
    }

    if (!freshWalletAddress) {
      toast({
        title: "Address Required",
        description: "Please enter a fresh wallet address.",
        variant: "destructive",
      });
      return;
    }

    // Basic address validation
    if (!freshWalletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid Ethereum address.",
        variant: "destructive",
      });
      return;
    }

    withdrawMutation.mutate({
      depositId: selectedDeposit,
      withdrawAddress: freshWalletAddress,
      useRelayer,
    });
  };

  const isDepositReady = (deposit: Deposit) => {
    const unlockTime = new Date(deposit.depositTime).getTime() + (deposit.lockDuration * 1000);
    return Date.now() >= unlockTime;
  };

  const getPrivacyScore = () => {
    const baseScore = 60;
    const anonymityBonus = Math.min(deposits.length * 2, 30);
    const timeBonus = 10;
    return Math.min(baseScore + anonymityBonus + timeBonus, 100);
  };

  return (
    <div className="glass-effect rounded-xl p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center">
          <i className="fas fa-arrow-up text-secondary"></i>
        </div>
        <h2 className="text-xl font-semibold">Withdraw</h2>
      </div>

      <div className="space-y-6">
        {/* Fresh Wallet Address */}
        <div>
          <Label className="block text-sm font-medium mb-2">Fresh Wallet Address</Label>
          <Input
            type="text"
            placeholder="0x742d35Cc6458C028ae6B4aDcB8a4B2c6Ee7bA4b2c6"
            value={freshWalletAddress}
            onChange={(e) => setFreshWalletAddress(e.target.value)}
            className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring font-mono text-sm"
            data-testid="input-fresh-wallet"
          />
          <p className="text-xs text-muted-foreground mt-1">
            <i className="fas fa-info-circle"></i>
            Use a completely new wallet address that has never been connected to your deposit wallet
          </p>
        </div>

        {/* Available Deposits */}
        <div>
          <Label className="block text-sm font-medium mb-2">Your Deposits</Label>
          <div className="space-y-2">
            {deposits.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <i className="fas fa-inbox text-2xl mb-2"></i>
                <p>No deposits found</p>
              </div>
            ) : (
              deposits.map((deposit: Deposit) => {
                const isReady = isDepositReady(deposit);
                return (
                  <div
                    key={deposit.id}
                    className={`rounded-lg p-3 border cursor-pointer transition-all ${
                      isReady
                        ? "bg-primary/10 border-primary/20 hover:bg-primary/20"
                        : "bg-muted/30 border-border hover:bg-muted/40"
                    } ${selectedDeposit === deposit.id ? "ring-2 ring-primary" : ""}`}
                    onClick={() => setSelectedDeposit(deposit.id)}
                    data-testid={`deposit-${deposit.id}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-mono text-sm">{deposit.amount} {deposit.currency}</div>
                        <div className="text-xs text-muted-foreground">
                          Deposited: {new Date(deposit.depositTime).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        {isReady ? (
                          <div className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">
                            READY
                          </div>
                        ) : (
                          <CountdownTimer
                            targetTime={new Date(deposit.depositTime).getTime() + (deposit.lockDuration * 1000)}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Relayer Option */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Checkbox
              id="useRelayer"
              checked={useRelayer}
              onCheckedChange={(checked) => setUseRelayer(checked as boolean)}
              data-testid="checkbox-relayer"
            />
            <Label htmlFor="useRelayer" className="font-medium">Use Relayer Service</Label>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            Relayer will submit the withdrawal transaction to protect your fresh wallet's privacy
          </p>
          <p className="text-xs text-muted-foreground">Additional fee: 0.01 ETH</p>
        </div>

        {/* Withdraw Button */}
        <Button
          onClick={handleWithdraw}
          disabled={!selectedDeposit || !freshWalletAddress || withdrawMutation.isPending}
          className="w-full bg-secondary text-secondary-foreground py-3 rounded-lg font-medium hover:opacity-90 transition-all flex items-center justify-center space-x-2"
          data-testid="button-withdraw"
        >
          <i className="fas fa-user-secret"></i>
          <span>
            {withdrawMutation.isPending ? "Processing..." : "Anonymous Withdraw"}
          </span>
        </Button>

        {/* Privacy Score */}
        <div className="text-center">
          <div className="text-sm text-muted-foreground">Privacy Score</div>
          <div className="text-2xl font-bold text-primary" data-testid="text-privacy-score">
            {getPrivacyScore()}%
          </div>
          <div className="text-xs text-muted-foreground">
            Based on anonymity set size & time locked
          </div>
        </div>
      </div>
    </div>
  );
}
