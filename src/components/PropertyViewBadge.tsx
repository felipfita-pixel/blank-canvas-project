import { Eye } from "lucide-react";
import { usePropertyViewCount } from "@/hooks/usePropertyViews";

interface Props {
  propertyId: string;
  count?: number;
  className?: string;
  variant?: "overlay" | "inline";
}

const PropertyViewBadge = ({ propertyId, count, className = "", variant = "overlay" }: Props) => {
  // If count is provided, use it; otherwise fetch own
  const fetched = usePropertyViewCount(count === undefined ? propertyId : undefined);
  const value = count !== undefined ? count : fetched.count;

  const base =
    variant === "overlay"
      ? "inline-flex items-center gap-1 px-2 py-1 rounded-full bg-black/55 backdrop-blur-sm text-white text-[11px] font-medium"
      : "inline-flex items-center gap-1 text-xs text-muted-foreground";

  return (
    <span className={`${base} ${className}`} title={`${value} visualizações`}>
      <Eye className="w-3 h-3" />
      <span className="tabular-nums">{value.toLocaleString("pt-BR")}</span>
    </span>
  );
};

export default PropertyViewBadge;
