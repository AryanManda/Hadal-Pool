import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface WalletBalanceInfo {
  address: string;
  balance: string;
  estimatedGasCost: string;
  hasSufficientGas: boolean;
  requiresRelayer: boolean;
  relayerFee: string;
  totalCost: string;
}

export function useWalletBalance(address: string | null) {
  const [shouldFetch, setShouldFetch] = useState(false);

  useEffect(() => {
    // Only fetch if address is valid and not empty
    setShouldFetch(!!address && address.length === 42 && address.startsWith('0x'));
  }, [address]);

  return useQuery<WalletBalanceInfo>({
    queryKey: ["/api/check-wallet", address],
    queryFn: async () => {
      if (!address) throw new Error("No address provided");
      
      const response = await apiRequest("POST", "/api/check-wallet", { address });
      return response.json();
    },
    enabled: shouldFetch,
    staleTime: 30000, // Cache for 30 seconds
    retry: 2,
  });
}
