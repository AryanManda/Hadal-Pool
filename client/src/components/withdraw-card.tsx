import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useWallet } from "@/hooks/use-wallet";
import { useWalletBalance } from "@/hooks/use-wallet-balance";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import CountdownTimer from "@/components/countdown-timer";
import GeneratedWalletComponent from "@/components/generated-wallet";
import { WalletGenerator } from "@/lib/wallet-generator";
import { ContractService } from "@/lib/contract-service";
import { getMetaMaskProvider } from "@/lib/wallet-utils";
import { ethers } from "ethers";
import type { Deposit } from "@shared/schema";

export default function WithdrawCard() {
  const [freshWalletAddress, setFreshWalletAddress] = useState("");
  const [freshWalletPrivateKey, setFreshWalletPrivateKey] = useState<string | null>(null);
  const [useRelayer, setUseRelayer] = useState(true);
  const [selectedDeposit, setSelectedDeposit] = useState<string | null>(null);
  const { address } = useWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: deposits = [] } = useQuery<Deposit[]>({
    queryKey: ["/api/deposits", address],
    enabled: !!address,
  });

  // Separate active and withdrawn deposits
  const activeDeposits = deposits.filter(d => !d.isWithdrawn);
  const withdrawnDeposits = deposits.filter(d => d.isWithdrawn);

  const { data: walletBalance, isLoading: isCheckingBalance } = useWalletBalance(freshWalletAddress);

  // Auto-enable relayer if wallet requires it
  React.useEffect(() => {
    if (walletBalance?.requiresRelayer) {
      setUseRelayer(true);
    }
  }, [walletBalance?.requiresRelayer]);

  const withdrawMutation = useMutation({
    mutationFn: async (data: { depositId: string; withdrawAddress: string; useRelayer: boolean }) => {
      // First, call the smart contract to actually withdraw funds
      const ethereumProvider = getMetaMaskProvider();
      if (!ethereumProvider) {
        throw new Error("MetaMask not found. Please install MetaMask.");
      }

      const provider = new ethers.BrowserProvider(ethereumProvider);
      const signer = await provider.getSigner();
      const contractService = new ContractService(provider, signer);

      // Get the deposit details
      const deposit = deposits.find(d => d.id === data.depositId);
      if (!deposit) {
        throw new Error("Deposit not found");
      }

      // Get user deposit info from contract - just to get the amount
      const userAddress = await signer.getAddress();
      let userDepositInfo = { depositAmount: "0", depositTime: 0, canWithdrawNow: false };
      
      try {
        userDepositInfo = await contractService.getUserDepositInfo(userAddress);
        console.log("User deposit info from contract:", userDepositInfo);
      } catch (error: any) {
        console.warn("Could not get deposit info from contract:", error.message);
        // Continue anyway - we'll use the deposit amount from backend
      }
      
      // REMOVED TIME LOCK CHECK - Let the contract handle it!
      // The contract will revert if the lock period hasn't expired, giving a clear error
      console.log("Attempting withdrawal - contract will enforce time lock...");
      
      // Use the actual deposit amount from contract (after fees), not the frontend amount
      // The contract stores depositAmount = msg.value - fee, so we need to withdraw that amount
      let contractDepositAmount = "0";
      if (userDepositInfo && userDepositInfo.depositAmount) {
        contractDepositAmount = typeof userDepositInfo.depositAmount === "string" 
          ? userDepositInfo.depositAmount 
          : ethers.formatEther(userDepositInfo.depositAmount);
      }
      
      const withdrawAmount = parseFloat(contractDepositAmount) > 0 ? contractDepositAmount : deposit.amount;
      
      console.log(`Contract deposit amount: ${contractDepositAmount} ETH`);
      console.log(`Frontend deposit amount: ${deposit.amount} ETH`);
      console.log(`Will withdraw: ${withdrawAmount} ETH`);
      
      // CRITICAL: Verify the user actually has funds in the contract
      // After a withdrawal, the contract balance will be 0, so check if this deposit was already withdrawn
      if (deposit.isWithdrawn) {
        throw new Error("This deposit has already been withdrawn. Please select a different deposit.");
      }
      
      if (parseFloat(contractDepositAmount) <= 0) {
        // If contract shows 0 but backend shows deposit, it might have been withdrawn already
        // Check if we can still proceed (maybe it's a timing issue)
        console.warn(`Contract shows 0 balance for user. Deposit ID: ${data.depositId}, isWithdrawn: ${deposit.isWithdrawn}`);
        throw new Error(`Cannot withdraw: You have no funds in the contract. Contract balance: ${contractDepositAmount} ETH. This deposit may have already been withdrawn.`);
      }
      
      // Verify the contract has enough balance
      const contractAddress = contractService.getContractAddress();
      const contractBalance = await provider.getBalance(contractAddress);
      const contractBalanceEth = parseFloat(ethers.formatEther(contractBalance));
      console.log(`Contract total balance: ${contractBalanceEth} ETH`);
      
      if (contractBalanceEth < parseFloat(withdrawAmount)) {
        throw new Error(`Contract doesn't have enough funds. Contract balance: ${contractBalanceEth} ETH, Requested: ${withdrawAmount} ETH`);
      }

      // Check balance before withdrawal
      const balanceBefore = await provider.getBalance(data.withdrawAddress);
      const balanceBeforeEth = ethers.formatEther(balanceBefore);
      console.log(`Balance of ${data.withdrawAddress} before withdrawal:`, balanceBeforeEth, "ETH");

      // Withdraw from smart contract
      console.log(`Withdrawing ${withdrawAmount} ETH to ${data.withdrawAddress}`);
      console.log(`User address: ${userAddress}`);
      console.log(`Deposit amount in contract: ${userDepositInfo.depositAmount} ETH`);
      
      let receipt;
      try {
        receipt = await contractService.withdraw(data.withdrawAddress, withdrawAmount);
      } catch (withdrawError: any) {
        // Check if it's a time lock error
        if (withdrawError.message?.includes("Lock period not expired") || 
            withdrawError.message?.includes("lock period") ||
            withdrawError.reason?.includes("Lock period not expired")) {
          throw new Error("Lock period has not expired yet. Please wait 1 minute after deposit before withdrawing.");
        }
        
        // Check if it's an RPC error
        if (withdrawError.code === "INTERNAL_ERROR" || 
            withdrawError.message?.includes("Internal JSON-RPC") ||
            withdrawError.message?.includes("RPC")) {
          throw new Error(`RPC Error: ${withdrawError.message}. Please ensure you're connected to Sepolia or Mainnet.`);
        }
        
        // Re-throw with original message
        throw withdrawError;
      }
      
      console.log("Withdrawal transaction receipt:", receipt);
      console.log("Transaction hash:", receipt.hash);
      console.log("Transaction status:", receipt.status);
      console.log("Transaction logs:", receipt.logs);
      
      // PRIVACY: Withdrawal events are not emitted (for privacy), so we verify by checking balance changes
      // No need to check for withdrawal event since we removed it for privacy
      console.log("Withdrawal transaction completed (no event check - privacy feature)");
      
      // Check if transaction actually succeeded
      if (receipt.status !== 1) {
        throw new Error(`Withdrawal transaction failed with status: ${receipt.status}`);
      }
      
      // Check if transaction reverted by examining gas used
      // Note: gasLimit is not available on TransactionReceipt, only gasUsed
      if (receipt.gasUsed) {
        console.log(`Gas used: ${receipt.gasUsed.toString()}`);
      }
      
      // Verify the transaction and check what actually happened
      const tx = await provider.getTransaction(receipt.hash);
      if (!tx) {
        throw new Error("Transaction not found");
      }
      
      // Decode the transaction to see what was actually called
      try {
        const decoded = contractService.getContract().interface.parseTransaction({
          data: tx.data,
          value: tx.value
        });
        console.log("Decoded transaction:", decoded);
        console.log("Transaction to address:", tx.to);
        console.log("Transaction from address:", tx.from);
        console.log("Transaction value:", ethers.formatEther(tx.value || 0n), "ETH");
      } catch (decodeError) {
        console.warn("Could not decode transaction:", decodeError);
      }
      
      // Check if the withdrawal address matches what we sent
      if (tx.to?.toLowerCase() !== contractService.getContractAddress().toLowerCase()) {
        throw new Error(`Transaction was sent to wrong address. Expected: ${contractService.getContractAddress()}, Got: ${tx.to}`);
      }
      
      // Wait a moment for the transaction to be fully processed
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check balance of withdrawal address after transaction (with retry)
      let balanceAfter = await provider.getBalance(data.withdrawAddress);
      let balanceAfterEth = ethers.formatEther(balanceAfter);
      console.log(`Balance of ${data.withdrawAddress} after withdrawal (first check):`, balanceAfterEth, "ETH");
      
      // Retry balance check after a short delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      balanceAfter = await provider.getBalance(data.withdrawAddress);
      balanceAfterEth = ethers.formatEther(balanceAfter);
      console.log(`Balance of ${data.withdrawAddress} after withdrawal (second check):`, balanceAfterEth, "ETH");
      
      // Verify funds were actually transferred
      const expectedBalance = parseFloat(balanceBeforeEth) + parseFloat(withdrawAmount);
      if (Math.abs(parseFloat(balanceAfterEth) - expectedBalance) > 0.0001) {
        console.warn(`Balance mismatch! Expected: ${expectedBalance} ETH, Got: ${balanceAfterEth} ETH`);
        // Check contract balance to see if it has funds
        const contractAddress = contractService.getContractAddress();
        const contractBalance = await provider.getBalance(contractAddress);
        console.warn(`Contract balance: ${ethers.formatEther(contractBalance)} ETH`);
        
        if (parseFloat(ethers.formatEther(contractBalance)) < parseFloat(withdrawAmount)) {
          throw new Error(`Contract doesn't have enough funds. Contract balance: ${ethers.formatEther(contractBalance)} ETH, Requested: ${withdrawAmount} ETH. Make sure you deposited funds to the contract first.`);
        }
        
        // If contract has funds but withdrawal didn't work, check transaction details
        console.error("Transaction details:", {
          hash: receipt.hash,
          status: receipt.status,
          from: receipt.from,
          to: receipt.to,
          gasUsed: receipt.gasUsed?.toString(),
        });
        
        // PRIVACY: No withdrawal event to check (removed for privacy)
        // Verify by checking transaction status and balance changes only
        console.error("Balance mismatch detected. Checking transaction details...");
        
        throw new Error(`Withdrawal transaction completed but funds were not transferred to ${data.withdrawAddress}. Expected balance: ${expectedBalance} ETH, Got: ${balanceAfterEth} ETH. Contract balance: ${ethers.formatEther(contractBalance)} ETH. Transaction hash: ${receipt.hash}`);
      }
      
      // Final verification - check balance one more time to ensure funds are there
      await new Promise(resolve => setTimeout(resolve, 1000));
      const finalBalance = await provider.getBalance(data.withdrawAddress);
      const finalBalanceEth = ethers.formatEther(finalBalance);
      console.log(`✅ Final balance verification: ${finalBalanceEth} ETH in ${data.withdrawAddress}`);
      
      // Verify funds are actually in the wallet
      if (parseFloat(finalBalanceEth) < parseFloat(withdrawAmount) * 0.99) { // Allow 1% tolerance for fees
        throw new Error(`CRITICAL: Funds not received! Expected at least ${withdrawAmount} ETH, but wallet only has ${finalBalanceEth} ETH. Transaction hash: ${receipt.hash}`);
      }
      
      console.log(`✅ SUCCESS: ${withdrawAmount} ETH successfully transferred to ${data.withdrawAddress}`);
      
      // Then update backend - CRITICAL: This must succeed to sync state
      // If backend update fails, the withdrawal still happened on-chain but state will be out of sync
      let responseData;
      try {
        const response = await apiRequest("POST", "/api/withdrawals", {
          ...data,
          transactionHash: receipt.hash,
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
          console.error("Backend withdrawal update failed:", errorData);
          // Still return success since on-chain withdrawal succeeded
          // But log the error so we know state might be out of sync
          throw new Error(`Withdrawal succeeded on-chain but backend update failed: ${errorData.message}. State may be out of sync.`);
        }
        
        responseData = await response.json();
      } catch (backendError: any) {
        // If backend update fails, we still need to mark the withdrawal as successful
        // The on-chain transaction succeeded, so we can't roll it back
        console.error("Failed to update backend after successful withdrawal:", backendError);
        // Return a response that indicates success but warns about state sync
        responseData = {
          id: data.depositId,
          isWithdrawn: true,
          withdrawnAt: new Date().toISOString(),
          withdrawAddress: data.withdrawAddress,
          warning: "Backend update failed - withdrawal succeeded on-chain but state may be out of sync"
        };
      }
      
      return { 
        ...responseData, 
        transactionHash: receipt.hash, 
        balanceAfter: finalBalanceEth,
        withdrawalAddress: data.withdrawAddress,
        amountWithdrawn: withdrawAmount
      };
    },
    onSuccess: async (data) => {
      const deposit = deposits.find(d => d.id === selectedDeposit);
      
      // Store wallet info before clearing
      const withdrawalAddress = freshWalletAddress;
      const withdrawalPrivateKey = freshWalletPrivateKey;
      
      // Try to switch MetaMask to the withdrawal address
      try {
        const ethereumProvider = getMetaMaskProvider();
        if (ethereumProvider) {
          // Request MetaMask to switch to the withdrawal address
          // Note: MetaMask doesn't support programmatic account switching,
          // but we can prompt the user and show instructions
          toast({
            title: "Withdrawal Successful! 🎉",
            description: `${data.amountWithdrawn || deposit?.amount || 'Funds'} ${deposit?.currency || 'ETH'} successfully withdrawn!\n\nWallet: ${withdrawalAddress}\nBalance: ${data.balanceAfter} ETH\n\nCopy the address above to import it into MetaMask.`,
            duration: 20000,
          });
          
          // Show instructions to switch account
          setTimeout(() => {
            const message = `Withdrawal successful! ✅\n\n` +
              `Transaction Hash: ${data.transactionHash}\n` +
              `Withdrawal Address: ${withdrawalAddress}\n` +
              `Amount: ${data.balanceAfter} ETH\n\n` +
              `IMPORTANT: Make sure you imported the EXACT address:\n${withdrawalAddress}\n\n` +
              `Would you like to see instructions to import this wallet into MetaMask?`;
            
            const switchAccount = confirm(message);
            if (switchAccount) {
              if (withdrawalPrivateKey) {
                const importKey = confirm(
                  `To import this wallet into MetaMask:\n\n` +
                  `1. Open MetaMask\n` +
                  `2. Click your account icon (top right)\n` +
                  `3. Click "Import Account"\n` +
                  `4. Select "Private Key"\n` +
                  `5. Paste this private key:\n\n${withdrawalPrivateKey}\n\n` +
                  `6. Click "Import"\n\n` +
                  `⚠️ Make sure the address matches: ${withdrawalAddress}\n\n` +
                  `Would you like to copy the private key to clipboard?`
                );
                if (importKey) {
                  navigator.clipboard.writeText(withdrawalPrivateKey);
      toast({
                    title: "Private Key Copied",
                    description: `Private key copied! Address: ${withdrawalAddress.slice(0, 6)}...${withdrawalAddress.slice(-4)}`,
                    duration: 5000,
                  });
                }
              } else {
                alert(
                  `To view the funds in MetaMask:\n\n` +
                  `1. Click your account icon (top right in MetaMask)\n` +
                  `2. Click "Import Account"\n` +
                  `3. If you generated this wallet, use its private key\n` +
                  `4. Or manually switch to the address: ${withdrawalAddress}\n\n` +
                  `⚠️ IMPORTANT: The address must be EXACTLY:\n${withdrawalAddress}\n\n` +
                  `Current balance: ${data.balanceAfter} ETH\n` +
                  `Transaction: ${data.transactionHash}`
                );
              }
            }
          }, 2000);
        }
      } catch (error) {
        console.error("Error showing withdrawal address:", error);
      }
      
      console.log("Withdrawal successful! Transaction hash:", data.transactionHash);
      console.log("Balance after withdrawal:", data.balanceAfter, "ETH");
      console.log("Withdrawal address:", withdrawalAddress);
      
      // Clear form state
      setFreshWalletAddress("");
      setFreshWalletPrivateKey(null);
      setSelectedDeposit(null);
      
      // Refresh data to show updated deposit status
      // Use setTimeout to ensure state updates happen after the mutation completes
      setTimeout(() => {
        if (address) {
          queryClient.invalidateQueries({ queryKey: ["/api/deposits", address] });
          queryClient.invalidateQueries({ queryKey: ["/api/pool-stats"] });
          queryClient.refetchQueries({ queryKey: ["/api/deposits", address] });
        }
      }, 500);
    },
    onError: (error) => {
      toast({
        title: "Withdrawal Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleWalletGenerated = (wallet: any) => {
    setFreshWalletAddress(wallet.address);
    setFreshWalletPrivateKey(wallet.privateKey || null);
  };

  const handleUseWallet = (address: string) => {
    setFreshWalletAddress(address);
    setFreshWalletPrivateKey(null); // Clear private key if manually entered
  };

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
        description: "Please enter a fresh wallet address or generate one.",
        variant: "destructive",
      });
      return;
    }

    // Enhanced address validation using ethers
    if (!WalletGenerator.isValidAddress(freshWalletAddress)) {
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

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Fresh Wallet Generation */}
          <div>
            <Label className="block text-sm font-medium mb-2">Fresh Wallet Address</Label>
            <GeneratedWalletComponent 
              onWalletGenerated={handleWalletGenerated}
              onUseWallet={handleUseWallet}
            />
          </div>

          {/* Available Deposits */}
          <div>
            <Label className="block text-sm font-medium mb-2">Your Deposits</Label>
            <div className="space-y-2">
            {activeDeposits.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <i className="fas fa-inbox text-2xl mb-2"></i>
                <p>No active deposits found</p>
              </div>
            ) : (
              activeDeposits.map((deposit: Deposit) => {
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

          {/* Withdrawal History */}
          {withdrawnDeposits.length > 0 && (
            <div>
              <Label className="block text-sm font-medium mb-2">Withdrawal History</Label>
              <div className="space-y-2">
                {withdrawnDeposits.map((deposit: Deposit) => (
                  <div
                    key={deposit.id}
                    className="rounded-lg p-3 border bg-green-500/10 border-green-500/20"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-mono text-sm text-green-600">
                          {deposit.amount} {deposit.currency}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Withdrawn: {deposit.withdrawnAt ? new Date(deposit.withdrawnAt).toLocaleString() : 'N/A'}
                        </div>
                        {deposit.withdrawAddress && (
                          <div className="text-xs text-muted-foreground mt-1">
                            To: <span className="font-mono">{deposit.withdrawAddress.slice(0, 6)}...{deposit.withdrawAddress.slice(-4)}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="ml-2 h-4 px-2 text-xs"
                              onClick={() => {
                                navigator.clipboard.writeText(deposit.withdrawAddress!);
                                toast({
                                  title: "Address Copied",
                                  description: "Withdrawal address copied to clipboard",
                                });
                              }}
                            >
                              Copy
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                          WITHDRAWN
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Gas Requirements Info */}
        {freshWalletAddress && walletBalance && (
          <div className={`rounded-lg p-4 border ${
            walletBalance?.requiresRelayer 
              ? "bg-yellow-500/10 border-yellow-500/20" 
              : "bg-green-500/10 border-green-500/20"
          }`}>
            <div className="flex items-center justify-between text-sm">
              <span className={walletBalance.requiresRelayer ? "text-yellow-600" : "text-green-600"}>
                {walletBalance.requiresRelayer ? "Relayer Required" : "Gas Sufficient"}
              </span>
              <span className={`font-mono ${walletBalance.requiresRelayer ? "text-yellow-700" : "text-green-700"}`}>
                {walletBalance.totalCost} ETH
              </span>
            </div>
          </div>
        )}

        {/* Relayer Option */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="useRelayer"
              checked={useRelayer}
              onCheckedChange={(checked) => setUseRelayer(checked as boolean)}
              disabled={walletBalance?.requiresRelayer}
              data-testid="checkbox-relayer"
            />
            <Label htmlFor="useRelayer" className="font-medium text-sm">Use Relayer Service</Label>
          </div>
        </div>

        {/* Withdraw Button */}
        <Button
          onClick={handleWithdraw}
          disabled={!selectedDeposit || !freshWalletAddress || withdrawMutation.isPending}
          className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
          data-testid="button-withdraw"
        >
          {withdrawMutation.isPending ? "Processing..." : "Withdraw"}
        </Button>
      </div>
    </div>
  );
}
