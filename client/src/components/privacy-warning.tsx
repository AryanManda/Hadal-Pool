import { useQuery } from "@tanstack/react-query";
import type { PoolStats } from "@shared/schema";

export default function PrivacyWarning() {
  const { data: poolStats } = useQuery<PoolStats>({
    queryKey: ["/api/pool-stats"],
    enabled: true,
  });

  const anonymitySetSize = poolStats?.anonymitySetSize || 0;
  const isLowAnonymity = anonymitySetSize < 50;

  if (!isLowAnonymity) return null;

  return (
    <div className="mb-8 bg-amber-500/10 border border-amber-500/20 rounded-lg p-4" data-testid="warning-anonymity">
      <div className="flex items-start space-x-3">
        <i className="fas fa-exclamation-triangle text-amber-500 mt-1"></i>
        <div>
          <h3 className="text-amber-500 font-medium mb-1">Low Anonymity Set Warning</h3>
          <p className="text-sm text-muted-foreground">
            Current anonymity set: <span className="font-mono" data-testid="text-anonymity-count">{anonymitySetSize} deposits</span>. For better privacy, consider waiting for more users to join the pool.
          </p>
        </div>
      </div>
    </div>
  );
}
