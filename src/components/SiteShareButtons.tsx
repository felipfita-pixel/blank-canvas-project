import { useState } from "react";
import { MessageCircle, Facebook, Instagram, Send, Linkedin, Twitter, Copy, Check, Share2 } from "lucide-react";
import { toast } from "sonner";

interface SiteShareButtonsProps {
  url?: string;
  title?: string;
  message?: string;
  variant?: "footer" | "inline";
  className?: string;
  instagramUrl?: string;
}

const SiteShareButtons = ({
  url,
  title = "Corretores Associados & FF Imobiliária",
  message,
  variant = "footer",
  className = "",
  instagramUrl = "https://instagram.com/",
}: SiteShareButtonsProps) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || (typeof window !== "undefined" ? window.location.origin : "");
  const shareText = message || `Conheça os melhores imóveis com ${title}! 🏠✨`;
  const fullMessage = `${shareText}\n${shareUrl}`;

  const links = [
    {
      name: "WhatsApp",
      icon: MessageCircle,
      color: "bg-green-600 hover:bg-green-700",
      onClick: () => window.open(`https://wa.me/?text=${encodeURIComponent(fullMessage)}`, "_blank"),
    },
    {
      name: "Facebook",
      icon: Facebook,
      color: "bg-blue-600 hover:bg-blue-700",
      onClick: () =>
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
          "_blank"
        ),
    },
    {
      name: "Instagram",
      icon: Instagram,
      color: "bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 hover:opacity-90",
      onClick: async () => {
        try {
          await navigator.clipboard.writeText(fullMessage);
          toast.success("Texto copiado! Cole no Instagram Stories ou Direct.");
        } catch {}
        window.open(instagramUrl, "_blank");
      },
    },
    {
      name: "Telegram",
      icon: Send,
      color: "bg-sky-500 hover:bg-sky-600",
      onClick: () =>
        window.open(
          `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
          "_blank"
        ),
    },
    {
      name: "X (Twitter)",
      icon: Twitter,
      color: "bg-black hover:bg-neutral-800",
      onClick: () =>
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
          "_blank"
        ),
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      color: "bg-blue-700 hover:bg-blue-800",
      onClick: () =>
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
          "_blank"
        ),
    },
  ];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullMessage);
      setCopied(true);
      toast.success("Link copiado!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar");
    }
  };

  const handleNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: shareText, url: shareUrl });
      } catch {}
    } else {
      handleCopy();
    }
  };

  const sizeClass = variant === "footer" ? "w-10 h-10" : "w-9 h-9";
  const iconSize = variant === "footer" ? "w-5 h-5" : "w-4 h-4";

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {links.map((l) => (
        <button
          key={l.name}
          onClick={l.onClick}
          title={`Compartilhar no ${l.name}`}
          aria-label={`Compartilhar no ${l.name}`}
          className={`${sizeClass} rounded-full flex items-center justify-center text-white transition-all shadow-sm hover:scale-110 ${l.color}`}
        >
          <l.icon className={iconSize} />
        </button>
      ))}
      <button
        onClick={handleCopy}
        title="Copiar link"
        aria-label="Copiar link"
        className={`${sizeClass} rounded-full flex items-center justify-center bg-muted hover:bg-muted/80 text-foreground transition-all shadow-sm hover:scale-110`}
      >
        {copied ? <Check className={iconSize} /> : <Copy className={iconSize} />}
      </button>
      {typeof navigator !== "undefined" && "share" in navigator && (
        <button
          onClick={handleNative}
          title="Mais opções"
          aria-label="Mais opções de compartilhamento"
          className={`${sizeClass} rounded-full flex items-center justify-center bg-secondary hover:bg-orange-hover text-secondary-foreground transition-all shadow-sm hover:scale-110`}
        >
          <Share2 className={iconSize} />
        </button>
      )}
    </div>
  );
};

export default SiteShareButtons;
