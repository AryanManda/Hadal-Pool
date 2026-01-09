import { useQuery } from "@tanstack/react-query";
import type { PoolStats } from "@shared/schema";
import { useCurrency } from "@/contexts/currency-context";

export default function PoolStats() {
  const { selectedCurrency } = useCurrency();
  
  const { data: poolStats } = useQuery<PoolStats>({
    queryKey: ["/api/pool-stats", selectedCurrency],
    queryFn: async () => {
      const response = await fetch(`/api/pool-stats?currency=${selectedCurrency}`);
      return response.json();
    },
    enabled: true,
  });

  return (
    <div className="mt-8">
      {/* Stats Display - Automatically shows stats for currency selected in deposit card */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <div className="text-xl font-semibold text-primary" data-testid="text-total-liquidity">
            {poolStats?.totalLiquidity || "0"} {selectedCurrency}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Total Liquidity</div>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <div className="text-xl font-semibold text-accent" data-testid="text-anonymity-set">
            {poolStats?.anonymitySetSize || "0"}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Anonymity Set</div>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <div className="text-xl font-semibold text-secondary" data-testid="text-privacy-fund">
            {poolStats?.privacyFundBalance || "0"} {selectedCurrency}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Hadal Fund</div>
        </div>
      </div>
    </div>
  );
}
