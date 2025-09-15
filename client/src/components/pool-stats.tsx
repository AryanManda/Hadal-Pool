import { useQuery } from "@tanstack/react-query";
import type { PoolStats } from "@shared/schema";

export default function PoolStats() {
  const { data: poolStats } = useQuery<PoolStats>({
    queryKey: ["/api/pool-stats"],
    enabled: true,
  });

  return (
    <div className="mt-8 grid md:grid-cols-3 gap-6">
      <div className="glass-effect rounded-lg p-4 text-center">
        <div className="text-2xl font-bold text-primary" data-testid="text-total-liquidity">
          {poolStats?.totalLiquidity || "0"} ETH
        </div>
        <div className="text-sm text-muted-foreground">Total Pool Liquidity</div>
      </div>
      
      <div className="glass-effect rounded-lg p-4 text-center">
        <div className="text-2xl font-bold text-accent" data-testid="text-anonymity-set">
          {poolStats?.anonymitySetSize || "0"}
        </div>
        <div className="text-sm text-muted-foreground">Anonymity Set Size</div>
      </div>
      
      <div className="glass-effect rounded-lg p-4 text-center">
        <div className="text-2xl font-bold text-secondary" data-testid="text-privacy-fund">
          {poolStats?.privacyFundBalance || "0"} ETH
        </div>
        <div className="text-sm text-muted-foreground">Privacy Fund Balance</div>
      </div>
    </div>
  );
}
