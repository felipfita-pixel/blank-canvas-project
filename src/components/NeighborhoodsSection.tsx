import { useSiteContent } from "@/hooks/useSiteContent";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Home, MessageCircle } from "lucide-react";
import bairroLeblon from "@/assets/bairro-leblon.jpg";
import bairroBotafogo from "@/assets/bairro-botafogo.jpg";
import bairroBarra from "@/assets/bairro-barra.jpg";

const fallbackImages = [bairroLeblon, bairroBotafogo, bairroBarra];



const NeighborhoodsSection = () => {
  const { get } = useSiteContent();
  const section = get("neighborhoods_guide");
  const items = section.content.items || [];

  const handleCardClick = (item: any) => {
    const name = item.name || "";
    const desc = item.desc || "";
    const trigger = document.getElementById("chat-trigger");
    if (trigger) {
      trigger.setAttribute("data-neighborhood", name);
      trigger.setAttribute("data-broker-name", "");
      trigger.setAttribute("data-broker-id", "");
      trigger.setAttribute("data-prefill-message", `Olá, tenho interesse no lançamento ${name}${desc ? ` (${desc})` : ""}. Gostaria de mais informações.`);
      trigger.click();
    }
  };

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
                    onClick={() => handleCardClick(b)}
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
                        <MessageCircle className="w-4 h-4" />
                        Falar com corretor
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
    </section>
  );
};

export default NeighborhoodsSection;
