import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import type { PoolStats } from "@shared/schema";

export default function PrivacyFundInfo() {
  const { data: poolStats } = useQuery<PoolStats>({
    queryKey: ["/api/pool-stats"],
    enabled: true,
  });

  return (
    <div className="mt-8 glass-effect rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
        <i className="fas fa-piggy-bank text-accent"></i>
        <span>Privacy Fund</span>
      </h3>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            0.3% of all deposits contribute to the Privacy Fund, which is used to:
          </p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li className="flex items-center space-x-2">
              <i className="fas fa-check text-primary text-xs"></i>
              <span>Incentivize liquidity providers</span>
            </li>
            <li className="flex items-center space-x-2">
              <i className="fas fa-check text-primary text-xs"></i>
              <span>Fund protocol development</span>
            </li>
            <li className="flex items-center space-x-2">
              <i className="fas fa-check text-primary text-xs"></i>
              <span>Enhance privacy research</span>
            </li>
          </ul>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-accent mb-2" data-testid="text-fund-balance">
            {poolStats?.privacyFundBalance || "0"} ETH
          </div>
          <div className="text-sm text-muted-foreground mb-4">Current Fund Balance</div>
          <Button 
            className="bg-accent text-accent-foreground px-4 py-2 rounded-lg text-sm hover:opacity-90 transition-all"
            data-testid="button-fund-details"
          >
            View Fund Details
          </Button>
        </div>
      </div>
    </div>
  );
}
