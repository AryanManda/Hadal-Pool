import { useCountdown } from "@/hooks/use-countdown";

interface CountdownTimerProps {
  targetTime: number;
}

export default function CountdownTimer({ targetTime }: CountdownTimerProps) {
  const timeLeft = useCountdown(targetTime);

  if (timeLeft <= 0) {
    return (
      <div className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">
        READY
      </div>
    );
  }

  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  return (
    <div className="bg-accent/20 text-accent px-2 py-1 rounded text-xs font-mono countdown-pulse">
      {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  );
}
