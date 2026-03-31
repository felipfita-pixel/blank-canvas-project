import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSiteContent } from "@/hooks/useSiteContent";
import { supabase } from "@/integrations/supabase/client";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Home, MessageCircle, X, ChevronLeft, ChevronRight } from "lucide-react";
import bairroLeblon from "@/assets/bairro-leblon.jpg";
import bairroBotafogo from "@/assets/bairro-botafogo.jpg";
import bairroBarra from "@/assets/bairro-barra.jpg";

const fallbackImages = [bairroLeblon, bairroBotafogo, bairroBarra];

interface PropertyItem {
  id: string;
  title: string;
  neighborhood: string | null;
  price: number;
  images: string[] | null;
}

const NeighborhoodsSection = () => {
  const { get } = useSiteContent();
  const section = get("neighborhoods_guide");
  const navigate = useNavigate();
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    const fetchProperties = async () => {
      const { data } = await supabase
        .from("properties")
        .select("id, title, neighborhood, price, images")
        .eq("active", true)
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(12);
      if (data) setProperties(data);
    };
    fetchProperties();
  }, []);

  const getImage = (prop: PropertyItem, i: number) =>
    prop.images && prop.images.length > 0 ? prop.images[0] : fallbackImages[i % fallbackImages.length];

  const formatPrice = (price: number) =>
    price > 0
      ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(price)
      : null;

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const handleContactBroker = () => {
    const prop = properties[lightboxIndex];
    if (!prop) return;
    setLightboxOpen(false);

    setTimeout(() => {
      const trigger = document.getElementById("chat-trigger");
      if (trigger) {
        trigger.setAttribute("data-neighborhood", prop.neighborhood || "");
        trigger.setAttribute("data-broker-name", "");
        trigger.setAttribute("data-broker-id", "");
        trigger.setAttribute("data-prefill-message", `Olá, tenho interesse no imóvel ${prop.title}${prop.neighborhood ? ` em ${prop.neighborhood}` : ""}. Gostaria de mais informações.`);
        trigger.click();
      }
    }, 350);
  };

  const currentProp = properties[lightboxIndex];

  return (
    <section id="neighborhoods" className="section-padding bg-cream">
      <div className="container-main text-center">
        {properties.length === 0 ? (
          <p className="text-sm text-muted-foreground py-12">Nenhum imóvel disponível no momento.</p>
        ) : (
          <div className="px-12">
            <Carousel opts={{ align: "start", loop: true }} className="w-full">
              <CarouselContent className="-ml-4">
                {properties.map((prop, i) => (
                  <CarouselItem key={prop.id} className="pl-4 basis-1/2 sm:basis-1/3 lg:basis-1/4">
                    <div
                      className="group relative rounded-xl overflow-hidden aspect-[4/5] cursor-pointer shadow-lg"
                      onClick={() => openLightbox(i)}
                    >
                      <img
                        src={getImage(prop, i)}
                        alt={prop.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/80 via-transparent to-transparent" />
                      <div className="absolute bottom-6 left-4 right-4 text-left">
                        <h3 className="text-base font-heading font-bold text-primary-foreground line-clamp-2">{prop.title}</h3>
                        {prop.neighborhood && (
                          <p className="text-primary-foreground/70 text-sm">{prop.neighborhood}</p>
                        )}
                        {prop.price > 0 && (
                          <p className="text-secondary font-bold text-sm mt-1">
                            {formatPrice(prop.price)}
                          </p>
                        )}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/30">
                        <span className="bg-white/90 text-foreground px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 group-hover:scale-105 transition-transform">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M11 8v6"/><path d="M8 11h6"/></svg>
                          Ver detalhes
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
        )}
      </div>

      {/* Lightbox with property details */}
      {lightboxOpen && currentProp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90" onClick={() => setLightboxOpen(false)}>
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {properties.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex - 1 + properties.length) % properties.length); }}
                className="absolute left-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex + 1) % properties.length); }}
                className="absolute right-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div className="max-w-[90vw] max-h-[80vh] flex flex-col items-center gap-4" onClick={(e) => e.stopPropagation()}>
            <img
              src={getImage(currentProp, lightboxIndex)}
              alt={currentProp.title}
              className="max-w-full max-h-[55vh] object-contain rounded-lg shadow-2xl"
            />
            <div className="text-center">
              <h3 className="text-xl font-heading font-bold text-white">{currentProp.title}</h3>
              {currentProp.neighborhood && (
                <p className="text-white/70 text-sm">{currentProp.neighborhood}</p>
              )}
              <div className="flex items-center justify-center gap-3 mt-4">
                <Button
                  onClick={() => { setLightboxOpen(false); navigate(`/imovel/${currentProp.id}`); }}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6 py-3 text-sm font-semibold"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Ver Imóvel
                </Button>
                <Button
                  onClick={handleContactBroker}
                  className="bg-secondary text-secondary-foreground hover:bg-orange-hover rounded-full px-6 py-3 text-sm font-semibold"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Falar com Corretor
                </Button>
              </div>
            </div>
          </div>

          {properties.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
              {properties.slice(0, 12).map((_, i) => (
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
