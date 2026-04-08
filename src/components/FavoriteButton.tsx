import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  isFavorite: boolean;
  onToggle: () => void;
  className?: string;
  size?: "sm" | "default";
}

const FavoriteButton = ({ isFavorite, onToggle, className, size = "sm" }: FavoriteButtonProps) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
      className={cn(
        "rounded-full transition-all",
        size === "sm" ? "w-9 h-9" : "w-11 h-11",
        isFavorite
          ? "text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100"
          : "text-muted-foreground hover:text-red-500 bg-background/80 hover:bg-background",
        className
      )}
      aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
    >
      <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
    </Button>
  );
};

export default FavoriteButton;
