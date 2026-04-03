import { useState, useEffect, useRef } from "react";
import { Users } from "lucide-react";

/**
 * Contador de visitas simulado:
 * - Base: 120.000 visitas
 * - Incrementa +1 a cada:
 *   • 15 min entre 10h–12h (horário de pico)
 *   • 20 min entre 12h–15h
 *   • 30 min nos demais horários
 * - Usa a data de hoje como referência (acumula apenas dentro do dia)
 * - Salva no localStorage para manter consistência entre reloads
 */

const STORAGE_KEY = "site_visit_counter";
const BASE_VISITS = 120000;

function getIntervalMs(): number {
  const hour = new Date().getHours();
  if (hour >= 10 && hour < 12) return 15 * 60 * 1000;
  if (hour >= 12 && hour < 15) return 20 * 60 * 1000;
  return 30 * 60 * 1000;
}

function getTodayIncrements(): number {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const todayMin = h * 60 + m;

  let increments = 0;
  const ranges = [
    { start: 0, end: 600, interval: 30 },    // 00:00–10:00
    { start: 600, end: 720, interval: 15 },   // 10:00–12:00
    { start: 720, end: 900, interval: 20 },   // 12:00–15:00
    { start: 900, end: 1440, interval: 30 },  // 15:00–24:00
  ];

  for (const r of ranges) {
    if (todayMin <= r.start) break;
    const effectiveEnd = Math.min(todayMin, r.end);
    increments += Math.floor((effectiveEnd - r.start) / r.interval);
  }
  return increments;
}

function loadCounter(): number {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const { date, value } = JSON.parse(stored);
      const today = new Date().toDateString();
      if (date === today) return value;
    }
  } catch {}
  // New day or first visit: base + today's accumulated increments
  const value = BASE_VISITS + getTodayIncrements();
  saveCounter(value);
  return value;
}

function saveCounter(value: number) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ date: new Date().toDateString(), value })
  );
}

function formatNumber(n: number): string {
  return n.toLocaleString("pt-BR");
}

interface SiteVisitCounterProps {
  className?: string;
}

const SiteVisitCounter = ({ className = "" }: SiteVisitCounterProps) => {
  const [visits, setVisits] = useState(loadCounter);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    function scheduleNext() {
      const ms = getIntervalMs();
      timerRef.current = setTimeout(() => {
        setVisits((prev) => {
          const next = prev + 1;
          saveCounter(next);
          return next;
        });
        scheduleNext();
      }, ms);
    }
    scheduleNext();
    return () => clearTimeout(timerRef.current);
  }, []);

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 border border-secondary/20 ${className}`}
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
      </span>
      <Users className="w-3.5 h-3.5 text-secondary" />
      <span className="text-primary-foreground/70 text-xs tracking-wider font-medium tabular-nums">
        {formatNumber(visits)} visitas
      </span>
    </div>
  );
};

export default SiteVisitCounter;
