import { useState } from "react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Home, MessageCircle, X, ChevronLeft, ChevronRight } from "lucide-react";
import bairroLeblon from "@/assets/bairro-leblon.jpg";
import bairroBotafogo from "@/assets/bairro-botafogo.jpg";
import bairroBarra from "@/assets/bairro-barra.jpg";

const fallbackImages = [bairroLeblon, bairroBotafogo, bairroBarra];

const NeighborhoodsSection = () => {
  const { get } = useSiteContent();
  const section = get("neighborhoods_guide");
  const items = section.content.items || [];
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const images = items.map((b: any, i: number) => ({
    src: b.image || fallbackImages[i % fallbackImages.length],
    alt: b.name,
  }));

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const handleContactBroker = () => {
    const item = items[lightboxIndex];
    const name = item?.name || "";
    const desc = item?.desc || "";
    setLightboxOpen(false);

    setTimeout(() => {
      const trigger = document.getElementById("chat-trigger");
      if (trigger) {
        trigger.setAttribute("data-neighborhood", name);
        trigger.setAttribute("data-broker-name", "");
        trigger.setAttribute("data-broker-id", "");
        trigger.setAttribute("data-prefill-message", `Olá, tenho interesse no lançamento ${name}${desc ? ` (${desc})` : ""}. Gostaria de mais informações.`);
        trigger.click();
      }
    }, 350);
  };

  const currentItem = items[lightboxIndex];

  return (
    <section id="neighborhoods" className="section-padding bg-cream">
      <div className="container-main text-center">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-3">
          <h2 className="text-3xl font-heading font-bold text-primary italic">{section.title}</h2>
          <div className="flex items-center gap-2">
            <a href="https://consultor.patrimovel.com.br/felipefita/imoveis/Venda/Tipo/Lan%C3%A7amento/Bairro/0/busca.aspx" target="_blank" rel="noopener noreferrer">
              <Button size="sm" className="bg-emerald-600 text-primary-foreground hover:bg-emerald-700 rounded-lg hover:scale-105 transition-all">
                <Home className="w-4 h-4 mr-1" />
                Todos os Imóveis
              </Button>
            </a>
            <a href="https://wa.me/5521975316631?text=Ol%C3%A1%2C%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es%20sobre%20im%C3%B3veis." target="_blank" rel="noopener noreferrer">
              <Button size="sm" className="bg-[#25D366] text-primary-foreground hover:bg-[#1da851] rounded-lg hover:scale-105 transition-all">
                <MessageCircle className="w-4 h-4 mr-1" />
                WhatsApp
              </Button>
            </a>
          </div>
        </div>
        <p className="text-muted-foreground mb-10 max-w-xl mx-auto">{section.subtitle}</p>
        <div className="px-12">
          <Carousel opts={{ align: "start", loop: true }} className="w-full">
            <CarouselContent className="-ml-4">
              {items.map((b: any, i: number) => (
                <CarouselItem key={i} className="pl-4 basis-1/2 sm:basis-1/3 lg:basis-1/4">
                  <div
                    className="group relative rounded-xl overflow-hidden aspect-[4/5] cursor-pointer shadow-lg"
                    onClick={() => openLightbox(i)}
                  >
                    <img src={b.image || fallbackImages[i % fallbackImages.length]} alt={b.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/80 via-transparent to-transparent" />
                    <div className="absolute bottom-6 left-6 text-left">
                      <h3 className="text-xl font-heading font-bold text-primary-foreground">{b.name}</h3>
                      <p className="text-primary-foreground/70 text-sm">{b.desc}</p>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/30">
                      <span className="bg-white/90 text-foreground px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 group-hover:scale-105 transition-transform">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M11 8v6"/><path d="M8 11h6"/></svg>
                        Ampliar imagem
                      </span>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="bg-primary text-primary-foreground hover:bg-primary/90 border-none" />
            <CarouselNext className="bg-primary text-primary-foreground hover:bg-primary/90 border-none" />
          </Carousel>
        </div>
      </div>

      {/* Lightbox with broker contact button */}
      {lightboxOpen && images.length > 0 && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90" onClick={() => setLightboxOpen(false)}>
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex - 1 + images.length) % images.length); }}
                className="absolute left-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex + 1) % images.length); }}
                className="absolute right-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div className="max-w-[90vw] max-h-[80vh] flex flex-col items-center gap-4" onClick={(e) => e.stopPropagation()}>
            <img
              src={images[lightboxIndex].src}
              alt={images[lightboxIndex].alt}
              className="max-w-full max-h-[65vh] object-contain rounded-lg shadow-2xl"
            />
            <div className="text-center">
              {currentItem && (
                <div className="mb-3">
                  <h3 className="text-xl font-heading font-bold text-white">{currentItem.name}</h3>
                  <p className="text-white/70 text-sm">{currentItem.desc}</p>
                </div>
              )}
              <Button
                onClick={handleContactBroker}
                className="bg-secondary text-secondary-foreground hover:bg-orange-hover rounded-full px-8 py-3 text-base font-semibold"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Falar com Corretor
              </Button>
            </div>
          </div>

          {images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(i); }}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${i === lightboxIndex ? "bg-white" : "bg-white/40 hover:bg-white/60"}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default NeighborhoodsSection;
