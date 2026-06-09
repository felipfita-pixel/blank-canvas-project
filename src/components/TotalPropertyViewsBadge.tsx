import { Eye } from "lucide-react";
import { useTotalPropertyViews } from "@/hooks/usePropertyViews";

const TotalPropertyViewsBadge = () => {
  const total = useTotalPropertyViews();
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 border border-secondary/20">
      <Eye className="w-3.5 h-3.5 text-secondary" />
      <span className="text-primary-foreground/80 text-xs tracking-wider font-medium tabular-nums">
        {total.toLocaleString("pt-BR")} imóveis visualizados
      </span>
    </div>
  );
};

export default TotalPropertyViewsBadge;
