import { useState, useEffect } from "react";
import { Eye } from "lucide-react";

const BASE_VISITS = 120000;
const BASE_DATE = new Date("2025-01-01T00:00:00");

function getIncrementIntervalMinutes(hour: number): number {
  if (hour >= 10 && hour < 12) return 15;
  if (hour >= 12 && hour < 15) return 20;
  return 30;
}

function calculateVisits(): number {
  const now = new Date();
  const elapsed = now.getTime() - BASE_DATE.getTime();
  const totalMinutes = elapsed / 60000;

  // Simulate accumulated visits based on time-of-day intervals
  // We approximate by counting total increments since base date
  let visits = BASE_VISITS;
  const totalDays = Math.floor(totalMinutes / 1440);
  const remainingMinutes = totalMinutes % 1440;

  // Each full day contributes a fixed amount:
  // 10h-12h = 2h = 120min / 15 = 8 increments
  // 12h-15h = 3h = 180min / 20 = 9 increments
  // 15h-10h(next) = 19h = 1140min / 30 = 38 increments
  const incrementsPerDay = 8 + 9 + 38; // 55 per day
  visits += totalDays * incrementsPerDay;

  // Add today's increments based on current hour/minute
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const todayMinutes = currentHour * 60 + currentMinute;

  // Calculate increments for today up to current time
  const timeRanges = [
    { startMin: 0, endMin: 600, interval: 30 },       // 0:00-10:00
    { startMin: 600, endMin: 720, interval: 15 },      // 10:00-12:00
    { startMin: 720, endMin: 900, interval: 20 },      // 12:00-15:00
    { startMin: 900, endMin: 1440, interval: 30 },     // 15:00-24:00
  ];

  for (const range of timeRanges) {
    if (todayMinutes <= range.startMin) break;
    const effectiveEnd = Math.min(todayMinutes, range.endMin);
    const minutesInRange = effectiveEnd - range.startMin;
    visits += Math.floor(minutesInRange / range.interval);
  }

  return visits;
}

function formatNumber(n: number): string {
  return n.toLocaleString("pt-BR");
}

interface SiteVisitCounterProps {
  className?: string;
}

const SiteVisitCounter = ({ className = "" }: SiteVisitCounterProps) => {
  const [visits, setVisits] = useState(calculateVisits);

  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    const intervalMs = getIncrementIntervalMinutes(hour) * 60 * 1000;

    const timer = setInterval(() => {
      setVisits(calculateVisits());
    }, intervalMs);

    return () => clearInterval(timer);
  }, []);

  // Recalculate interval when hour changes
  useEffect(() => {
    const checkHour = setInterval(() => {
      setVisits(calculateVisits());
    }, 60000); // check every minute for hour transitions
    return () => clearInterval(checkHour);
  }, []);

  return (
    <div className={`flex items-center gap-2 text-primary-foreground/60 text-xs tracking-wider font-light ${className}`}>
      <Eye className="w-3.5 h-3.5" />
      <span className="tabular-nums">{formatNumber(visits)} visitas</span>
    </div>
  );
};

export default SiteVisitCounter;
