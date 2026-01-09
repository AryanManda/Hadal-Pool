import { useState } from "react";
import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PrivacyScore from "@/components/privacy-score";
import { calculatePrivacyScore, type PrivacyScoreData } from "@/lib/privacy-score";
import { ContractService, POOL_IDS, type PoolId } from "@/lib/contract-service";
import { ERC20Service } from "@/lib/erc20-service";
import { ethers } from "ethers";
import { apiRequest } from "@/lib/queryClient";
import { getMetaMaskProvider } from "@/lib/wallet-utils";
import { DEMO_MODE, simulateDeposit } from "@/lib/demo-mode";

import { useCurrency, CURRENCIES, type Currency } from "@/contexts/currency-context";

const TIME_LOCK_OPTIONS = [
  { value: POOL_IDS.ONE_HOUR, label: "1 hour", description: "Minimum" },
  { value: POOL_IDS.FOUR_HOURS, label: "4 hours", description: "Recommended" },
  { value: POOL_IDS.TWENTY_FOUR_HOURS, label: "24 hours", description: "Maximum privacy" },
] as const;

export default function DepositCard() {
  const { selectedCurrency, setSelectedCurrency } = useCurrency();
  const [amount, setAmount] = useState("");
  const [selectedTimeLock, setSelectedTimeLock] = useState<PoolId>(POOL_IDS.ONE_HOUR); // Default to 1 hour
  const [userBalance] = useState(0.5); // Mock user balance
  const { isConnected, address } = useWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Reset amount when currency changes
  React.useEffect(() => {
    setAmount("");
  }, [selectedCurrency]);

  const depositMutation = useMutation({
    mutationFn: async (data: { amount: string; currency: Currency }) => {
      // DEMO MODE: Simulate transaction without blockchain
      if (DEMO_MODE) {
        // Use actual durations (1 hour = 3600 seconds, 4 hours = 14400 seconds, 24 hours = 86400 seconds)
        const lockDuration = selectedTimeLock === POOL_IDS.ONE_HOUR ? 3600 : 
                            selectedTimeLock === POOL_IDS.FOUR_HOURS ? 14400 : 86400;
        const tx = await simulateDeposit(data.amount, data.currency, lockDuration);
        return {
          success: true,
          transactionHash: tx.hash,
          blockNumber: tx.blockNumber,
        };
      }
      
      // REAL MODE: Use actual blockchain
      if (!address) throw new Error("Wallet not connected");
      
      // Get MetaMask provider specifically
      const ethereumProvider = getMetaMaskProvider();
      if (!ethereumProvider) {
        throw new Error("MetaMask not found. Please install MetaMask.");
      }
      
      // Get provider and signer from wallet
      const provider = new ethers.BrowserProvider(ethereumProvider);
      const signer = await provider.getSigner();
      
      // Handle ETH deposits
      if (data.currency === "ETH") {
        const contractService = new ContractService(provider, signer);
        
        // Verify network before depositing - support Sepolia (11155111), Mainnet (1), Arbitrum (42161), Arbitrum Sepolia (421614)
        const network = await provider.getNetwork();
        const isSepolia = network.chainId === 11155111n;
        const isMainnet = network.chainId === 1n;
        const isArbitrum = network.chainId === 42161n;
        const isArbitrumSepolia = network.chainId === 421614n;
        
        if (!isSepolia && !isMainnet && !isArbitrum && !isArbitrumSepolia) {
          // Try to switch to Sepolia (testnet) first
          try {
            await ethereumProvider.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: "0xAA36A7" }], // 11155111 in hex
            });
            // Wait a moment for the switch
            await new Promise(resolve => setTimeout(resolve, 1000));
            // Re-check network after switch
            const newNetwork = await provider.getNetwork();
            if (newNetwork.chainId !== 11155111n && newNetwork.chainId !== 1n && newNetwork.chainId !== 42161n && newNetwork.chainId !== 421614n) {
              throw new Error("Network switch failed");
            }
          } catch (switchError: any) {
            // If switch fails, show error
            toast({
              title: "Wrong Network",
              description: `Please switch MetaMask to Sepolia (Chain ID: 11155111), Mainnet (Chain ID: 1), Arbitrum (Chain ID: 42161), or Arbitrum Sepolia (Chain ID: 421614).\n\nCurrently on Chain ID: ${network.chainId.toString()}.`,
              variant: "destructive",
            });
            throw new Error(`Unsupported network. Please switch to Sepolia (Chain ID: 11155111), Mainnet (Chain ID: 1), Arbitrum (Chain ID: 42161), or Arbitrum Sepolia (Chain ID: 421614)`);
          }
        }
        
        console.log("Depositing to contract...");
        const receipt = await contractService.deposit(selectedTimeLock, data.amount);
        console.log("Deposit transaction receipt:", receipt);
        console.log("Deposit transaction hash:", receipt.hash);
        console.log("Deposit transaction status:", receipt.status);
        
        // Verify the deposit was successful by checking the user's deposit info
        try {
          const userAddress = await signer.getAddress();
          const userDepositInfo = await contractService.getUserDepositInfo(userAddress);
          console.log("User deposit info after deposit:", userDepositInfo);
          
          // getUserDepositInfo already returns depositAmount as a formatted string (e.g., "1.2961")
          // So we just need to parse it as a float
          const depositAmountEth = parseFloat(userDepositInfo.depositAmount || "0");
          
          if (depositAmountEth === 0) {
            console.warn("Deposit transaction succeeded but contract shows 0 balance. This might be a timing issue.");
          } else {
            console.log("✅ Deposit verified! Contract balance:", depositAmountEth, "ETH");
          }
        } catch (verifyError: any) {
          console.error("Could not verify deposit:", verifyError);
          // Don't fail the whole flow, but log the error
        }
        
        return {
          success: true,
          transactionHash: receipt.hash,
          blockNumber: receipt.blockNumber,
        };
      } 
      // Handle ERC20 token deposits (USDC, USDT, etc.)
      else {
        const tokenService = new ERC20Service(provider, data.currency, signer);
        
        // For demo: Transfer tokens to the contract address
        // Note: In production, the contract would need to accept ERC20 tokens
        // For now, we transfer to the contract address as a demonstration
        const { CONTRACT_ADDRESSES } = await import("@/lib/contracts");
        const network = await provider.getNetwork();
        const networkName = network.chainId === 1n ? "mainnet" : 
                            network.chainId === 11155111n ? "sepolia" :
                            network.chainId === 42161n ? "arbitrum" :
                            network.chainId === 421614n ? "arbitrumSepolia" : "sepolia";
        const contractAddress = CONTRACT_ADDRESSES[networkName as keyof typeof CONTRACT_ADDRESSES];
        
        if (!contractAddress) {
          throw new Error(`Contract not deployed on ${networkName}. Please deploy the contract first.`);
        }
        
        // Transfer tokens to the contract
        const receipt = await tokenService.transfer(contractAddress, data.amount);
        
        return {
          success: true,
          transactionHash: receipt.hash,
          blockNumber: receipt.blockNumber,
        };
      }
    },
    onSuccess: async (data) => {
      // Save deposit to backend
      try {
        // Use actual durations (1 hour = 3600 seconds, 4 hours = 14400 seconds, 24 hours = 86400 seconds)
        const lockDuration = selectedTimeLock === POOL_IDS.ONE_HOUR ? 3600 : 
                            selectedTimeLock === POOL_IDS.FOUR_HOURS ? 14400 : 86400;
        
        await apiRequest("POST", "/api/deposits", {
          userAddress: address!,
          currency: selectedCurrency,
          amount: amount,
          transactionHash: data.transactionHash,
          lockDuration: lockDuration,
        });
      } catch (error) {
        console.error("Failed to save deposit to backend:", error);
        // Don't fail the whole flow if backend save fails
      }
      
      toast({
        title: "Deposit Successful",
        description: `Your funds have been deposited. Transaction: ${data.transactionHash.slice(0, 10)}...`,
      });
      setAmount("");
      queryClient.invalidateQueries({ queryKey: ["/api/deposits", address] });
      queryClient.invalidateQueries({ queryKey: ["/api/pool-stats"] });
    },
    onError: (error: any) => {
      let errorMessage = error.message || "Transaction failed";
      
      // Log the full error for debugging
      console.error("Deposit error:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        data: error.data,
        stack: error.stack
      });
      
      // Make error messages more user-friendly
      if (errorMessage.includes("insufficient funds") || errorMessage.includes("INSUFFICIENT_FUNDS") || errorMessage.includes("Insufficient balance")) {
        errorMessage = errorMessage; // Keep the detailed message from contract-service
      } else if (errorMessage.includes("user rejected") || errorMessage.includes("User denied")) {
        errorMessage = "Transaction was cancelled.";
      } else if (errorMessage.includes("No contract found") || errorMessage.includes("Contract not deployed") || errorMessage.includes("not initialized")) {
        errorMessage = errorMessage; // Keep the improved message from contract-service
      } else if (errorMessage.includes("Contract is paused")) {
        errorMessage = errorMessage; // Keep the message from contract-service
      } else if (errorMessage.includes("Invalid pool ID") || errorMessage.includes("Pool") && errorMessage.includes("not active")) {
        errorMessage = errorMessage; // Keep the detailed pool error
      } else if (errorMessage.includes("exceeds maximum deposit") || errorMessage.includes("Minimum deposit")) {
        errorMessage = errorMessage; // Keep the detailed amount error
      } else if (errorMessage.includes("Deposit simulation failed")) {
        // The contract-service already provides detailed context, keep it
        errorMessage = errorMessage;
      } else if (errorMessage.includes("network") || error.code === "NETWORK_ERROR" || error.code === "SERVER_ERROR") {
        // More specific network error messages
        if (errorMessage.includes("chain")) {
          errorMessage = "Network mismatch. Please switch MetaMask to Sepolia (Chain ID: 11155111), Mainnet (Chain ID: 1), Arbitrum (Chain ID: 42161), or Arbitrum Sepolia (Chain ID: 421614)";
        } else {
          errorMessage = `Network error: ${errorMessage}. Please ensure you're connected to a supported network.`;
        }
      } else if (errorMessage.includes("missing revert data") || errorMessage.includes("CALL_EXCEPTION")) {
        // This should now be handled by contract-service, but keep as fallback
        errorMessage = errorMessage || "Transaction failed. Please check that the contract is deployed and you have sufficient balance.";
      }
      
      toast({
        title: "Deposit Failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleDeposit = async () => {
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

    // Validate amount
    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount.",
        variant: "destructive",
      });
      return;
    }

    // Check minimum amounts
    if (selectedCurrency === "ETH" && depositAmount < 0.1) {
      toast({
        title: "Minimum Amount",
        description: "Minimum deposit is 0.1 ETH.",
        variant: "destructive",
      });
      return;
    }

    if (selectedCurrency === "USDC" && depositAmount < 10) {
      toast({
        title: "Minimum Amount",
        description: "Minimum deposit is 10 USDC.",
        variant: "destructive",
      });
      return;
    }

    // DEMO MODE: Skip balance check, always allow
    if (DEMO_MODE) {
      depositMutation.mutate({ amount, currency: selectedCurrency });
      return;
    }
    
    // REAL MODE: Check wallet balance before attempting deposit
    try {
      const ethereumProvider = getMetaMaskProvider();
      if (!ethereumProvider) {
        toast({
          title: "MetaMask Not Found",
          description: "Please install MetaMask browser extension.",
          variant: "destructive",
        });
        return;
      }
      const provider = new ethers.BrowserProvider(ethereumProvider);
      
      // Verify we're on the correct network (Sepolia, Mainnet, Arbitrum, or Arbitrum Sepolia)
      const network = await provider.getNetwork();
      console.log("Current network:", network.chainId.toString());
      
      const isSepolia = network.chainId === 11155111n;
      const isMainnet = network.chainId === 1n;
      const isArbitrum = network.chainId === 42161n;
      const isArbitrumSepolia = network.chainId === 421614n;
      
      if (!isSepolia && !isMainnet && !isArbitrum && !isArbitrumSepolia) {
        // Try to switch to Sepolia (testnet)
        try {
          await ethereumProvider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xAA36A7' }], // 11155111 in hex
          });
          // Wait a moment for the switch
          await new Promise(resolve => setTimeout(resolve, 1000));
          // Re-check network
          const newNetwork = await provider.getNetwork();
          if (newNetwork.chainId !== 11155111n && newNetwork.chainId !== 1n && newNetwork.chainId !== 42161n && newNetwork.chainId !== 421614n) {
            throw new Error("Network switch failed");
          }
        } catch (switchError: any) {
          console.error("Network switch error:", switchError);
          // If user rejected or switch failed, show manual instructions
          toast({
            title: "Wrong Network",
            description: `Please switch MetaMask to Sepolia (Chain ID: 11155111), Mainnet (Chain ID: 1), Arbitrum (Chain ID: 42161), or Arbitrum Sepolia (Chain ID: 421614). Currently on Chain ID: ${network.chainId.toString()}.`,
            variant: "destructive",
          });
          return;
        }
        
        // Final check after switch attempt
        const finalNetwork = await provider.getNetwork();
        if (finalNetwork.chainId !== 11155111n && finalNetwork.chainId !== 1n && finalNetwork.chainId !== 42161n && finalNetwork.chainId !== 421614n) {
          toast({
            title: "Wrong Network",
            description: `Please switch MetaMask to Sepolia (Chain ID: 11155111), Mainnet (Chain ID: 1), Arbitrum (Chain ID: 42161), or Arbitrum Sepolia (Chain ID: 421614). Currently on Chain ID: ${finalNetwork.chainId.toString()}`,
            variant: "destructive",
          });
          return;
        }
      }
      
      if (selectedCurrency === "ETH") {
        const balance = await provider.getBalance(address!);
        const balanceInEth = parseFloat(ethers.formatEther(balance));
        
        console.log("Balance check:", { balanceInEth, depositAmount, address });
        
        // Estimate gas cost
        let estimatedGasCost = 0.0002; // Default gas estimate
        try {
          const gasPrice = await provider.getFeeData();
          const estimatedGas = 100000n;
          if (gasPrice.gasPrice && gasPrice.gasPrice > 0n) {
            estimatedGasCost = parseFloat(ethers.formatEther(estimatedGas * gasPrice.gasPrice));
          }
        } catch (gasError) {
          console.warn("Gas estimation failed, using default:", gasError);
        }
        
        // Need deposit amount + minimal gas buffer
        const totalNeeded = depositAmount + estimatedGasCost;
        
        console.log("Balance comparison:", { balanceInEth, totalNeeded, depositAmount, estimatedGasCost });
        
        if (balanceInEth < totalNeeded) {
          // Get network info to provide helpful guidance
          const network = await provider.getNetwork();
          const isSepolia = network.chainId === 11155111n;
          const isMainnet = network.chainId === 1n;
          const isArbitrum = network.chainId === 42161n;
          const isArbitrumSepolia = network.chainId === 421614n;
          
          let helpMessage = `You need ${totalNeeded.toFixed(4)} ETH (${depositAmount} ETH deposit + ~${estimatedGasCost.toFixed(4)} ETH gas). Your balance: ${balanceInEth.toFixed(4)} ETH`;
          
          if (isSepolia) {
            if (balanceInEth === 0) {
              helpMessage += `\n\nYou're on Sepolia testnet with 0 ETH. Get free test ETH from a Sepolia faucet:`;
            } else {
              helpMessage += `\n\nYou're on Sepolia testnet but don't have enough ETH. Get more free test ETH from a Sepolia faucet:`;
            }
            helpMessage += `\n• https://sepoliafaucet.com/\n• https://faucet.quicknode.com/ethereum/sepolia\n• https://www.alchemy.com/faucets/ethereum-sepolia\n• https://sepolia-faucet.pk910.de/`;
          } else if (isArbitrumSepolia) {
            if (balanceInEth === 0) {
              helpMessage += `\n\nYou're on Arbitrum Sepolia testnet with 0 ETH. Get free test ETH from an Arbitrum Sepolia faucet:`;
            } else {
              helpMessage += `\n\nYou're on Arbitrum Sepolia testnet but don't have enough ETH. Get more free test ETH from an Arbitrum Sepolia faucet:`;
            }
            helpMessage += `\n• https://faucet.quicknode.com/arbitrum/sepolia\n• https://www.alchemy.com/faucets/arbitrum-sepolia`;
          } else if (isMainnet && balanceInEth === 0) {
            helpMessage += `\n\nYou're on Ethereum Mainnet with 0 ETH. You need to purchase ETH from an exchange to use on Mainnet.`;
          } else if (isMainnet) {
            helpMessage += `\n\nYou're on Ethereum Mainnet but don't have enough ETH. You need to purchase more ETH from an exchange.`;
          } else if (isArbitrum && balanceInEth === 0) {
            helpMessage += `\n\nYou're on Arbitrum One with 0 ETH. Bridge ETH from Ethereum Mainnet to Arbitrum using:\n• https://bridge.arbitrum.io/`;
          } else if (isArbitrum) {
            helpMessage += `\n\nYou're on Arbitrum One but don't have enough ETH. Bridge more ETH from Ethereum Mainnet using:\n• https://bridge.arbitrum.io/`;
          }
          
          toast({
            title: "Insufficient Funds",
            description: helpMessage,
            variant: "destructive",
          });
          return;
        }
      } else {
        // Check ERC20 token balance
        const tokenService = new ERC20Service(provider, selectedCurrency);
        const tokenBalance = parseFloat(await tokenService.getBalance(address!));
        
        // Still need ETH for gas
        const ethBalance = await provider.getBalance(address!);
        const ethBalanceAmount = parseFloat(ethers.formatEther(ethBalance));
        const minGasNeeded = 0.001; // Minimum gas for ERC20 transfer
        
        if (tokenBalance < depositAmount) {
          toast({
            title: "Insufficient Token Balance",
            description: `You need ${depositAmount} ${selectedCurrency}. Your balance: ${tokenBalance} ${selectedCurrency}`,
            variant: "destructive",
          });
          return;
        }
        
        if (ethBalanceAmount < minGasNeeded) {
          // Check network to provide helpful guidance
          const network = await provider.getNetwork();
          const isSepolia = network.chainId === 11155111n;
          const isArbitrumSepolia = network.chainId === 421614n;
          const isArbitrum = network.chainId === 42161n;
          
          let helpMessage = `You need at least ${minGasNeeded} ETH for gas fees. Your ETH balance: ${ethBalanceAmount.toFixed(4)} ETH`;
          if (isSepolia) {
            helpMessage += `\n\nGet more free Sepolia ETH from a faucet:\n• https://sepoliafaucet.com/\n• https://faucet.quicknode.com/ethereum/sepolia\n• https://www.alchemy.com/faucets/ethereum-sepolia`;
          } else if (isArbitrumSepolia) {
            helpMessage += `\n\nGet more free Arbitrum Sepolia ETH from a faucet:\n• https://faucet.quicknode.com/arbitrum/sepolia\n• https://www.alchemy.com/faucets/arbitrum-sepolia`;
          } else if (isArbitrum) {
            helpMessage += `\n\nBridge ETH from Ethereum Mainnet to Arbitrum:\n• https://bridge.arbitrum.io/`;
          }
          
          toast({
            title: "Insufficient ETH for Gas",
            description: helpMessage,
            variant: "destructive",
            duration: 10000,
          });
          return;
        }
      }
    } catch (error: any) {
      console.error("Error checking balance:", error);
      console.error("Error details:", { message: error.message, stack: error.stack });
      
      // If token doesn't exist or network issue, show helpful error
      if (error.message?.includes("not configured") || error.message?.includes("network")) {
        toast({
          title: "Network Error",
          description: `${selectedCurrency} may not be available on this network. Try switching networks or using ETH.`,
          variant: "destructive",
        });
        return;
      }
      
      // If balance check fails, warn but don't block - let transaction proceed
      // This handles cases where balance reading fails
      console.warn("Balance check failed, proceeding with transaction anyway");
      // Don't show error toast - just proceed silently
      // The transaction will fail naturally if there are actually insufficient funds
    }

    // Proceed with deposit - if balance is actually insufficient, the transaction will fail
    depositMutation.mutate({ amount, currency: selectedCurrency });
  };

  // Calculate privacy score data
  const privacyScoreData: PrivacyScoreData = {
    depositAmount: parseFloat(amount) || 0,
    // Use actual durations (1 hour = 3600 seconds, 4 hours = 14400 seconds, 24 hours = 86400 seconds)
    lockDuration: selectedTimeLock === POOL_IDS.ONE_HOUR ? 3600 : 
                  selectedTimeLock === POOL_IDS.FOUR_HOURS ? 14400 : 86400,
    userBalance: userBalance,
    anonymitySetSize: 47, // Mock anonymity set size
    currency: selectedCurrency, // Include currency for proper scoring
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Privacy Score */}
        <div className="lg:col-span-1">
          <PrivacyScore data={privacyScoreData} />
        </div>

        {/* Right Column - Deposit Form */}
        <div className="lg:col-span-2 space-y-6">
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

        {/* Amount Selection - Preset Amounts */}
        <div>
          <Label className="block text-sm font-medium mb-2">Amount</Label>
          <div className="grid grid-cols-4 gap-2 mb-2">
            {(() => {
              // Define preset amounts based on currency
              const presets: Record<Currency, string[]> = {
                ETH: ["0.1", "0.5", "1.0", "5.0"],
                USDC: ["10", "100", "500", "1000"],
                WBTC: ["0.001", "0.005", "0.01", "1.0"],
                USDT: ["10", "100", "500", "1000"],
              };
              return presets[selectedCurrency].map((presetAmount) => (
                <Button
                  key={presetAmount}
                  type="button"
                  variant={amount === presetAmount ? "default" : "outline"}
                  onClick={() => setAmount(presetAmount)}
                  className={`${
                    amount === presetAmount
                      ? "bg-primary text-primary-foreground"
                      : ""
                  }`}
                >
                  {presetAmount} {selectedCurrency}
                </Button>
              ));
            })()}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Min: {selectedCurrency === "ETH" ? "0.1" : selectedCurrency === "USDC" ? "10" : selectedCurrency === "WBTC" ? "0.001" : "10"} {selectedCurrency}</span>
            <span>Fee: 1.5%</span>
          </div>
        </div>

        {/* Time Lock Selection */}
        <div>
          <Label className="block text-sm font-medium mb-2">Time Lock Duration</Label>
          <div className="grid grid-cols-3 gap-2">
            {TIME_LOCK_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={selectedTimeLock === option.value ? "default" : "outline"}
                className={`w-full ${
                  selectedTimeLock === option.value
                    ? "bg-primary text-primary-foreground"
                    : ""
                }`}
                onClick={() => setSelectedTimeLock(option.value)}
                data-testid={`button-timelock-${option.value}`}
              >
                <span className="text-sm">{option.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Deposit Button */}
        <Button
          onClick={handleDeposit}
          disabled={!isConnected || depositMutation.isPending}
          className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
          data-testid="button-deposit"
        >
          {depositMutation.isPending ? "Processing..." : "Deposit"}
        </Button>
        </div>
      </div>
    </div>
  );
}
