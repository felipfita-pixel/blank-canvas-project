import { useState, useRef, useEffect, useMemo } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Suggestion {
  label: string;
  type: "bairro" | "cidade" | "imóvel";
}

interface SearchAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  neighborhoods: string[];
  cities: string[];
  propertyTitles: string[];
  className?: string;
  placeholder?: string;
}

const SearchAutocomplete = ({
  value,
  onChange,
  neighborhoods,
  cities,
  propertyTitles,
  className,
  placeholder = "Buscar por título, bairro ou cidade...",
}: SearchAutocompleteProps) => {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const suggestions = useMemo<Suggestion[]>(() => {
    if (!value || value.length < 2) return [];
    const q = value.toLowerCase();
    const results: Suggestion[] = [];

    cities
      .filter((c) => c.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach((c) => results.push({ label: c, type: "cidade" }));

    neighborhoods
      .filter((n) => n.toLowerCase().includes(q))
      .slice(0, 4)
      .forEach((n) => results.push({ label: n, type: "bairro" }));

    propertyTitles
      .filter((t) => t.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach((t) => results.push({ label: t, type: "imóvel" }));

    return results.slice(0, 8);
  }, [value, neighborhoods, cities, propertyTitles]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    setOpen(focused && suggestions.length > 0);
  }, [focused, suggestions]);

  const typeLabels: Record<string, string> = {
    bairro: "Bairro",
    cidade: "Cidade",
    imóvel: "Imóvel",
  };

  const typeColors: Record<string, string> = {
    bairro: "bg-blue-100 text-blue-700",
    cidade: "bg-green-100 text-green-700",
    imóvel: "bg-orange-100 text-orange-700",
  };

  return (
    <div ref={ref} className={cn("relative flex-1", className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 200)}
        className="pl-10 pr-9 h-11 bg-background"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          {suggestions.map((s, i) => (
            <button
              key={`${s.type}-${s.label}-${i}`}
              className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left"
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(s.label);
                setOpen(false);
              }}
            >
              <span className={cn("text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded", typeColors[s.type])}>
                {typeLabels[s.type]}
              </span>
              <span className="text-sm text-foreground truncate">{s.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchAutocomplete;
