import { useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Headset } from "lucide-react";
import WatermarkImage from "@/components/WatermarkImage";

interface ImageLightboxProps {
  images: { src: string; alt: string }[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
  propertyTitle?: string;
  propertyId?: string;
}

const ImageLightbox = ({ images, currentIndex, isOpen, onClose, onNavigate, propertyTitle, propertyId }: ImageLightboxProps) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onNavigate((currentIndex - 1 + images.length) % images.length);
      if (e.key === "ArrowRight") onNavigate((currentIndex + 1) % images.length);
    },
    [isOpen, currentIndex, images.length, onClose, onNavigate]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen || images.length === 0) return null;

  const current = images[currentIndex];

  const handleSpecialist = (e: React.MouseEvent) => {
    e.stopPropagation();
    const chatBtn = document.querySelector('[data-chat-widget-trigger]') as HTMLButtonElement;
    if (chatBtn) {
      if (propertyTitle) {
        chatBtn.setAttribute('data-prefill-message', `Olá! Tenho interesse no imóvel "${propertyTitle}". Gostaria de mais informações.`);
      }
      chatBtn.click();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90" onClick={onClose}>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Specialist button inside lightbox */}
      <button
        onClick={handleSpecialist}
        className="absolute top-4 left-4 z-10 flex items-center gap-2 px-4 py-2.5 rounded-full bg-secondary text-secondary-foreground font-semibold text-sm shadow-lg hover:scale-105 transition-transform"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
        </span>
        <Headset className="w-5 h-5" />
        <span className="hidden sm:inline">Fale com Especialista</span>
      </button>

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onNavigate((currentIndex - 1 + images.length) % images.length); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onNavigate((currentIndex + 1) % images.length); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      <div className="max-w-[90vw] max-h-[85vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        <WatermarkImage
          src={current.src}
          alt={current.alt}
          className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
        />
      </div>

      {/* Counter + dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        {images.length > 1 && (
          <span className="text-white/80 text-sm font-medium">{currentIndex + 1} / {images.length}</span>
        )}
        {images.length > 1 && images.length <= 20 && (
          <div className="flex items-center gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); onNavigate(i); }}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${i === currentIndex ? "bg-white" : "bg-white/40 hover:bg-white/60"}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageLightbox;
