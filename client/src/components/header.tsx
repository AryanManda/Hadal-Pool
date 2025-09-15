import { useWallet } from "@/hooks/use-wallet";
import { useQuery } from "@tanstack/react-query";
import type { PoolStats } from "@shared/schema";

export default function Header() {
  const { isConnected, address, connect, disconnect } = useWallet();
  
  const { data: poolStats } = useQuery<PoolStats>({
    queryKey: ["/api/pool-stats"],
    enabled: true,
  });

  return (
    <header className="border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <i className="fas fa-tornado text-primary-foreground text-lg"></i>
            </div>
            <h1 className="text-xl font-bold">Privacy Mixer</h1>
            <span className="bg-accent px-2 py-1 rounded text-xs text-accent-foreground">BETA</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-muted-foreground">
              Pool Liquidity: <span className="text-primary font-mono">{poolStats?.totalLiquidity || "0"} ETH</span>
            </div>
            <button 
              onClick={() => isConnected ? disconnect() : connect()}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-all"
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
