import { MessageCircle, Share2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";

interface PropertyShareProps {
  property: {
    id: string;
    title: string;
    description?: string | null;
    price?: number;
    neighborhood?: string | null;
    city?: string | null;
    bedrooms?: number | null;
    area?: number | null;
    images?: string[] | null;
    transaction_type?: string;
  };
  variant?: "icon" | "full";
  className?: string;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(price);

const buildShareMessage = (property: PropertyShareProps["property"], url: string) => {
  const lines: string[] = [];
  lines.push(`🏠 *${property.title}*`);
  
  if (property.neighborhood || property.city) {
    lines.push(`📍 ${[property.neighborhood, property.city].filter(Boolean).join(", ")}`);
  }

  const specs: string[] = [];
  if (property.bedrooms) specs.push(`${property.bedrooms} quarto${property.bedrooms > 1 ? "s" : ""}`);
  if (property.area) specs.push(`${property.area}m²`);
  if (specs.length) lines.push(`📐 ${specs.join(" • ")}`);

  if (property.price && property.price > 0) {
    const suffix = property.transaction_type === "rent" ? "/mês" : "";
    lines.push(`💰 ${formatPrice(property.price)}${suffix}`);
  }

  if (property.description) {
    const desc = property.description.length > 120 ? property.description.slice(0, 120) + "…" : property.description;
    lines.push(`\n${desc}`);
  }

  lines.push(`\n🔗 Veja mais: ${url}`);
  return lines.join("\n");
};

const PropertyShareButtons = ({ property, variant = "icon", className = "" }: PropertyShareProps) => {
  const [copied, setCopied] = useState(false);
  const propertyUrl = `${window.location.origin}/imovel/${property.id}`;
  const message = buildShareMessage(property, propertyUrl);

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const imageUrl = property.images?.[0] || "";
    const fullMessage = imageUrl ? `${message}\n\n📷 ${imageUrl}` : message;
    window.open(`https://wa.me/?text=${encodeURIComponent(fullMessage)}`, "_blank");
  };

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      toast.success("Link e informações copiados!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar");
    }
  };

  const handleChat = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const chatEvent = new CustomEvent("open-chat-widget", {
      detail: {
        prefill: `Olá! Gostaria de saber mais sobre o imóvel "${property.title}". ${propertyUrl}`,
      },
    });
    window.dispatchEvent(chatEvent);
  };

  if (variant === "full") {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        <Button
          onClick={handleWhatsApp}
          size="sm"
          className="bg-green-600 hover:bg-green-700 text-white rounded-lg gap-1.5"
        >
          <MessageCircle className="w-4 h-4" /> WhatsApp
        </Button>
        <Button
          onClick={handleChat}
          size="sm"
          className="bg-secondary text-secondary-foreground hover:bg-orange-hover rounded-lg gap-1.5"
        >
          <MessageCircle className="w-4 h-4" /> Chat
        </Button>
        <Button
          onClick={handleCopyLink}
          size="sm"
          variant="outline"
          className="rounded-lg gap-1.5"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copiado!" : "Copiar"}
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex gap-1.5 ${className}`}>
      <button
        onClick={handleWhatsApp}
        title="Compartilhar via WhatsApp"
        className="w-9 h-9 rounded-full bg-green-600 hover:bg-green-700 flex items-center justify-center text-white transition-colors shadow-sm"
      >
        <MessageCircle className="w-4 h-4" />
      </button>
      <button
        onClick={handleChat}
        title="Enviar via Chat"
        className="w-9 h-9 rounded-full bg-secondary hover:bg-orange-hover flex items-center justify-center text-secondary-foreground transition-colors shadow-sm"
      >
        <Share2 className="w-4 h-4" />
      </button>
      <button
        onClick={handleCopyLink}
        title="Copiar link"
        className="w-9 h-9 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center text-foreground transition-colors shadow-sm"
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
};

export default PropertyShareButtons;
