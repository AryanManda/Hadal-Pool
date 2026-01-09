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
        <span>Hadal Fund</span>
      </h3>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            The Hadal Fund ensures your privacy and security by:
          </p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li className="flex items-center space-x-2">
              <i className="fas fa-check text-primary text-xs"></i>
              <span>Protecting your deposits with enhanced security measures</span>
            </li>
            <li className="flex items-center space-x-2">
              <i className="fas fa-check text-primary text-xs"></i>
              <span>Maintaining protocol stability for reliable withdrawals</span>
            </li>
            <li className="flex items-center space-x-2">
              <i className="fas fa-check text-primary text-xs"></i>
              <span>Growing the anonymity set for better privacy protection</span>
            </li>
          </ul>
          <p className="text-xs text-muted-foreground mt-4 italic">
            Only 1.5% of deposits go to the fund, ensuring maximum value for you
          </p>
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
