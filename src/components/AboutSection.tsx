import { useEffect, useState, useMemo } from "react";
import { staticProperties } from "@/data/staticProperties";
import { Button } from "@/components/ui/button";
import { Users, Phone, MessageCircle, User, Home, Bed, Bath, Car, Maximize, Search, SlidersHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ScheduleModal from "@/components/ScheduleModal";
import { useSiteContent } from "@/hooks/useSiteContent";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import bairroLeblon from "@/assets/bairro-leblon.jpg";
import bairroBarra from "@/assets/bairro-barra.jpg";
import bairroBotafogo from "@/assets/bairro-botafogo.jpg";
import propertyKitchen from "@/assets/property-kitchen.jpg";
import propertyCondo from "@/assets/property-condo.jpg";
import propertyLiving from "@/assets/property-living.jpg";

const fallbackImages = [bairroLeblon, bairroBotafogo, bairroBarra, propertyKitchen, propertyCondo, propertyLiving];

const WHATSAPP_ADMIN = "5521975316631";

const BOT_FIRST_NAMES = [
  "Carlos", "Fernanda", "Ricardo", "Juliana", "André", "Patrícia", "Marcos",
  "Camila", "Roberto", "Luciana", "Eduardo", "Beatriz", "Paulo", "Mariana",
  "Gustavo", "Aline", "Thiago", "Renata", "Diego", "Vanessa", "Bruno",
  "Tatiana", "Rafael", "Débora", "Leonardo", "Cristina", "Henrique",
  "Sabrina", "Vinícius", "Priscila"
];

const BOT_LAST_NAMES = [
  "Silva", "Santos", "Oliveira", "Souza", "Pereira", "Costa", "Rodrigues",
  "Almeida", "Nascimento", "Lima", "Araújo", "Fernandes", "Carvalho",
  "Gomes", "Martins", "Rocha", "Ribeiro", "Barros", "Freitas", "Moreira"
];

interface BrokerBot {
  id: string;
  full_name: string;
  avatar_url: string | null;
  isBot: boolean;
  isAttending: boolean;
}

interface RealBroker {
  id: string;
  full_name: string;
  creci: string | null;
  avatar_url: string | null;
  status: string;
}

const BOT_AVATAR_SEEDS = [
  "Carlos", "Fernanda", "Ricardo", "Juliana", "Andre", "Patricia", "Marcos",
  "Camila", "Roberto", "Luciana", "Eduardo", "Beatriz", "Paulo", "Mariana",
  "Gustavo", "Aline", "Thiago", "Renata", "Diego", "Vanessa", "Bruno",
  "Tatiana", "Rafael", "Debora", "Leonardo", "Cristina", "Henrique",
  "Sabrina", "Vinicius", "Priscila"
];

const generateBotBrokers = (): BrokerBot[] => {
  return BOT_FIRST_NAMES.map((firstName, i) => ({
    id: `bot-${i}`,
    full_name: `${firstName} ${BOT_LAST_NAMES[i % BOT_LAST_NAMES.length]}`,
    avatar_url: `https://i.pravatar.cc/80?img=${(i % 70) + 1}`,
    isBot: true,
    isAttending: i < 15,
  }));
};

// Shuffle array using Fisher-Yates
const shuffleArray = <T,>(arr: T[]): T[] => {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

interface FeaturedProperty {
  id: string;
  title: string;
  images: string[] | null;
  neighborhood: string | null;
  price: number;
  bedrooms?: number | null;
  bathrooms?: number | null;
  parking_spots?: number | null;
  area?: number | null;
  suites?: number | null;
  city?: string | null;
  property_type?: string | null;
}

const AboutSection = () => {
  const { get } = useSiteContent();
  const about = get("about");
  const navigate = useNavigate();
  const [realBrokers, setRealBrokers] = useState<RealBroker[]>([]);
  const [featuredProperties, setFeaturedProperties] = useState<FeaturedProperty[]>([]);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [shuffledBots, setShuffledBots] = useState<BrokerBot[]>(() => shuffleArray(generateBotBrokers()));
  const [filterCity, setFilterCity] = useState("all");
  const [filterNeighborhood, setFilterNeighborhood] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  useEffect(() => {
    const fetchBrokers = async () => {
      const { data } = await supabase
        .from("brokers_public")
        .select("id, full_name, creci, avatar_url, status")
        .order("full_name");
      if (data) setRealBrokers(data);
    };

    const fetchProperties = async () => {
      const { data } = await supabase
        .from("properties")
        .select("id, title, images, neighborhood, price, bedrooms, bathrooms, parking_spots, area, suites, city, property_type")
        .eq("active", true)
        .order("created_at", { ascending: false })
        .limit(6);
      if (data) setFeaturedProperties(data);
    };

    fetchBrokers();
    fetchProperties();
  }, []);

  // Shuffle bot brokers every 30 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setShuffledBots(shuffleArray(generateBotBrokers()));
    }, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Real brokers always on top, then shuffled bots
  const allBrokersList: BrokerBot[] = [
    ...realBrokers.map(b => ({ id: b.id, full_name: b.full_name, avatar_url: b.avatar_url, isBot: false, isAttending: false })),
    ...shuffledBots,
  ];

  const totalOnline = allBrokersList.length;
  const totalAttending = realBrokers.length + 15;

  const handleWhatsApp = (broker: BrokerBot) => {
    const msg = encodeURIComponent(`Olá, gostaria de falar com ${broker.full_name} sobre imóveis.`);
    window.open(`https://wa.me/${WHATSAPP_ADMIN}?text=${msg}`, "_blank");
  };

  const handleChat = () => {
    const chatBtn = document.querySelector('[data-chat-widget-trigger]') as HTMLButtonElement;
    if (chatBtn) chatBtn.click();
  };

  return (
    <section id="about" className="section-padding bg-cream">
      <div className="container-main">
        <div className="grid lg:grid-cols-[1fr_260px] gap-6 items-start">
          {/* Left: About + Campaign */}
          <div>
            <h2 className="text-3xl font-heading font-bold text-primary mb-1 italic">{about.title}</h2>
            <div className="w-12 h-1 bg-secondary rounded mb-4" />
            <p className="text-muted-foreground mb-6 leading-relaxed text-sm">{about.subtitle}</p>

            <h3 className="text-2xl font-heading font-bold text-foreground mb-1">{about.content.campaign_title || "Escolha sua Campanha"}</h3>
            <p className="text-sm text-muted-foreground mb-4">{about.content.campaign_subtitle || ""}</p>
            {(() => {
              const staticProps: FeaturedProperty[] = staticProperties.map(sp => ({
                id: sp.id,
                title: sp.title,
                images: sp.images,
                neighborhood: sp.neighborhood,
                price: sp.price,
                bedrooms: sp.bedrooms,
                bathrooms: sp.bathrooms,
                parking_spots: sp.parking_spots,
                area: sp.area,
                suites: null,
                city: sp.city,
                property_type: sp.property_type,
              }));
              const mergedProps = [
                ...staticProps.filter(sp => !featuredProperties.some(fp => fp.title === sp.title)),
                ...featuredProperties,
              ];

              // Extract unique cities & neighborhoods for filters
              const cities = [...new Set(mergedProps.map(p => (p as any).city).filter(Boolean))].sort() as string[];
              const hoods = [...new Set(mergedProps.map(p => p.neighborhood).filter(Boolean))].sort() as string[];

              // Apply filters
              const filteredProps = mergedProps.filter(p => {
                if (filterCity !== "all" && (p as any).city !== filterCity) return false;
                if (filterNeighborhood !== "all" && p.neighborhood !== filterNeighborhood) return false;
                if (filterType !== "all" && (p as any).property_type !== filterType) return false;
                return true;
              });

              return (
                <>
                  {/* Filter Bar */}
                  <div className="bg-card rounded-xl border border-border p-4 mb-4 shadow-sm">
                    <h4 className="text-sm font-bold text-foreground mb-3">Resultado de Busca</h4>
                    <div className="flex flex-wrap items-center gap-3">
                      <Select value={filterCity} onValueChange={setFilterCity}>
                        <SelectTrigger className="w-[160px] bg-background"><SelectValue placeholder="Cidade" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas as Cidades</SelectItem>
                          {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Select value={filterNeighborhood} onValueChange={setFilterNeighborhood}>
                        <SelectTrigger className="w-[160px] bg-background"><SelectValue placeholder="Bairro" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os Bairros</SelectItem>
                          {hoods.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="w-[160px] bg-background"><SelectValue placeholder="Tipo de Imóvel" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os Tipos</SelectItem>
                          <SelectItem value="apartment">Apartamento</SelectItem>
                          <SelectItem value="house">Casa</SelectItem>
                          <SelectItem value="penthouse">Cobertura</SelectItem>
                          <SelectItem value="commercial">Comercial</SelectItem>
                          <SelectItem value="land">Terreno</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowMoreFilters(!showMoreFilters)}
                        className="bg-foreground text-background hover:bg-foreground/90 font-semibold"
                      >
                        <SlidersHorizontal className="w-4 h-4 mr-1" /> Mais Filtros
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => { setFilterCity("all"); setFilterNeighborhood("all"); setFilterType("all"); }}
                        className="bg-foreground text-background hover:bg-foreground/90 font-semibold"
                      >
                        <Search className="w-4 h-4 mr-1" /> Pesquisar
                      </Button>
                    </div>
                    {showMoreFilters && (
                      <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-border">
                        <p className="text-xs text-muted-foreground">Filtros ativos: {filterCity !== "all" ? filterCity : ""} {filterNeighborhood !== "all" ? filterNeighborhood : ""} {filterType !== "all" ? filterType : ""} {filterCity === "all" && filterNeighborhood === "all" && filterType === "all" ? "Nenhum" : ""}</p>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground mb-3">{filteredProps.length} imóvel(is) encontrado(s)</p>

                  {filteredProps.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-12">Nenhum imóvel encontrado com os filtros selecionados.</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {filteredProps.map((prop, i) => {
                        const image = prop.images && prop.images.length > 0 ? prop.images[0] : fallbackImages[i % fallbackImages.length];
                        const formattedPrice = prop.price > 0
                          ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(prop.price)
                          : null;
                        return (
                          <div
                            key={prop.id}
                            className="rounded-lg overflow-hidden group cursor-pointer shadow-sm bg-card border border-border"
                            onClick={() => navigate(`/imovel/${prop.id}`)}
                          >
                            <div className="relative aspect-[4/3] overflow-hidden">
                              <img src={image} alt={prop.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                              <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/60 via-transparent to-transparent" />
                              <div className="absolute bottom-2 left-2 right-2">
                                <span className="text-primary-foreground font-bold text-xs tracking-wide font-heading line-clamp-2">{prop.title}</span>
                              </div>
                              <button className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary/80 backdrop-blur-sm flex items-center justify-center text-primary-foreground hover:bg-primary transition-colors">
                                <Home className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="p-2 space-y-1">
                              {prop.neighborhood && <p className="text-[10px] text-muted-foreground font-medium">{prop.neighborhood}</p>}
                              <div className="flex items-center gap-2 flex-wrap text-[9px] text-muted-foreground">
                                {prop.bedrooms != null && prop.bedrooms > 0 && <span className="flex items-center gap-0.5"><Bed className="w-3 h-3" />{prop.bedrooms} Qts</span>}
                                {prop.suites != null && prop.suites > 0 && <span className="flex items-center gap-0.5"><Bed className="w-3 h-3 text-secondary" />{prop.suites} Suíte</span>}
                                {prop.bathrooms != null && prop.bathrooms > 0 && <span className="flex items-center gap-0.5"><Bath className="w-3 h-3" />{prop.bathrooms} Ban</span>}
                                {prop.parking_spots != null && prop.parking_spots > 0 && <span className="flex items-center gap-0.5"><Car className="w-3 h-3" />{prop.parking_spots} Vaga</span>}
                                {prop.area != null && prop.area > 0 && <span className="flex items-center gap-0.5"><Maximize className="w-3 h-3" />{prop.area}m²</span>}
                              </div>
                              {formattedPrice && <p className="text-secondary font-bold text-xs">{formattedPrice}</p>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              );
            })()}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
              <Button onClick={() => navigate("/imoveis")} className="bg-emerald-600 text-primary-foreground hover:bg-emerald-700 rounded-full px-8 py-4 font-semibold text-sm shadow-lg hover:scale-105 transition-all">
                <Home className="w-4 h-4 mr-2" />Todos os Imóveis
              </Button>
              <Button onClick={() => setScheduleOpen(true)} className="bg-secondary text-secondary-foreground hover:bg-orange-hover rounded-full px-8 py-4 font-semibold text-sm shadow-lg hover:scale-105 transition-all">
                <MessageCircle className="w-4 h-4 mr-2" />Agendar Consultoria
              </Button>
            </div>
            <ScheduleModal open={scheduleOpen} onOpenChange={setScheduleOpen} />
          </div>

          {/* Right: Brokers Online compact list - sticky */}
          <div className="bg-card rounded-xl border border-border shadow-sm sticky top-20 z-30">
            <div className="p-3 border-b border-border">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-primary" />
                <span className="font-bold text-sm text-foreground">Corretores Online</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-[10px] font-semibold text-emerald-600">
                  {totalOnline} online • {totalAttending} atendendo
                </span>
              </div>
            </div>

            <ScrollArea className="h-[420px]">
              <div className="p-2 space-y-1.5">
                {allBrokersList.slice(0, 30).map((broker) => (
                  <div key={broker.id} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted/50 transition-colors">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                        {broker.avatar_url ? (
                          <img src={broker.avatar_url} alt={broker.full_name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-card" />
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{broker.full_name}</p>
                      {broker.isAttending ? (
                        <Badge className="bg-secondary/20 text-secondary text-[8px] px-1 py-0 h-3.5">Atendendo</Badge>
                      ) : (
                        <Badge className="bg-emerald-100 text-emerald-700 text-[8px] px-1 py-0 h-3.5">Disponível</Badge>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-0.5 flex-shrink-0">
                      <button
                        onClick={() => handleWhatsApp(broker)}
                        className="w-6 h-6 rounded-full bg-[#25D366] flex items-center justify-center text-white hover:bg-[#1da851] transition-colors"
                      >
                        <Phone className="w-3 h-3" />
                      </button>
                      <button
                        onClick={handleChat}
                        className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:bg-navy-light transition-colors"
                      >
                        <MessageCircle className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
