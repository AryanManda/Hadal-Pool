import { calculatePrivacyScore, getPrivacyScoreLabel, getPrivacyScoreColor, type PrivacyScoreData } from "@/lib/privacy-score";

interface PrivacyScoreProps {
  data: PrivacyScoreData;
  className?: string;
}

export default function PrivacyScore({ data, className = "" }: PrivacyScoreProps) {
  const score = calculatePrivacyScore(data);
  const label = getPrivacyScoreLabel(score);
  const colorClass = getPrivacyScoreColor(score);

  return (
    <div className={`bg-muted/50 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium">Privacy Score</span>
        <div className={`text-lg font-semibold ${colorClass}`}>
          {score}/100
        </div>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${
            score >= 80 ? 'bg-green-500' :
            score >= 60 ? 'bg-blue-500' :
            score >= 40 ? 'bg-yellow-500' :
            score >= 20 ? 'bg-orange-500' : 'bg-red-500'
          }`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
