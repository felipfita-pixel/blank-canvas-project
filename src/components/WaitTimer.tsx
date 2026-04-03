import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface WaitTimerProps {
  since: string;
  compact?: boolean;
}

const WaitTimer = ({ since, compact }: WaitTimerProps) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = new Date(since).getTime();
    const update = () => setElapsed(Math.floor((Date.now() - start) / 1000));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [since]);

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  const label = minutes > 0
    ? `${minutes}m${seconds.toString().padStart(2, "0")}s`
    : `${seconds}s`;

  // Color based on urgency
  let colorClass = "text-green-600"; // < 30s
  if (elapsed >= 120) colorClass = "text-destructive"; // > 2min
  else if (elapsed >= 60) colorClass = "text-orange"; // > 1min  
  else if (elapsed >= 30) colorClass = "text-yellow-600"; // > 30s

  if (compact) {
    return (
      <span className={`text-[9px] font-mono font-semibold ${colorClass} flex items-center gap-0.5`}>
        <Clock className="w-2.5 h-2.5" />
        {label}
      </span>
    );
  }

  return (
    <div className={`flex items-center gap-1.5 text-xs font-mono font-semibold ${colorClass}`}>
      <div className={`w-2 h-2 rounded-full animate-pulse ${
        elapsed >= 120 ? "bg-destructive" :
        elapsed >= 60 ? "bg-orange" :
        elapsed >= 30 ? "bg-yellow-500" :
        "bg-green-500"
      }`} />
      <Clock className="w-3 h-3" />
      <span>{label}</span>
    </div>
  );
};

export default WaitTimer;
