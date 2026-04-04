import { useEffect, useMemo, useState } from "react";
import { staticProperties } from "@/data/staticProperties";
import { Button } from "@/components/ui/button";
import { Users, Phone, MessageCircle, User, Bed, Bath, Car, Maximize, MapPin, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ScheduleModal from "@/components/ScheduleModal";
import { useSiteContent } from "@/hooks/useSiteContent";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import SearchFilters from "@/components/SearchFilters";
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

const propertyTypeLabels: Record<string, string> = {
  apartment: "Apartamento",
  house: "Casa",
  penthouse: "Cobertura",
  commercial: "Comercial",
  land: "Terreno",
};

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

const generateBotBrokers = (): BrokerBot[] => {
  return BOT_FIRST_NAMES.map((firstName, i) => ({
    id: `bot-${i}`,
    full_name: `${firstName} ${BOT_LAST_NAMES[i % BOT_LAST_NAMES.length]}`,
    avatar_url: `https://i.pravatar.cc/80?img=${(i % 70) + 1}`,
    isBot: true,
    isAttending: i < 15,
  }));
};

const shuffleArray = <T,>(arr: T[]): T[] => {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const normalizeText = (value?: string | null) =>
  (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

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
  description?: string | null;
  address?: string | null;
}

const CAMPAIGN_PER_PAGE = 12;

const CampaignResults = ({ properties, navigate }: { properties: FeaturedProperty[]; navigate: (path: string) => void }) => {
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [properties]);

  const totalPages = Math.ceil(properties.length / CAMPAIGN_PER_PAGE);
  const safePage = Math.min(currentPage, Math.max(totalPages, 1));
  const paginated = properties.slice((safePage - 1) * CAMPAIGN_PER_PAGE, safePage * CAMPAIGN_PER_PAGE);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    document.getElementById("campaign-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safePage > 3) pages.push("ellipsis");
      for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) pages.push(i);
      if (safePage < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(price);

  return (
    <div id="campaign-results">
      <p className="text-xs text-muted-foreground mb-3">
        {properties.length} imóvel(is) encontrado(s)
        {totalPages > 1 && <span className="ml-2">· Página {safePage} de {totalPages}</span>}
      </p>

      {properties.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">
          Nenhum imóvel encontrado com os filtros selecionados.
        </p>
      ) : (
        <>
          <div className="flex flex-col divide-y divide-border">
            {paginated.map((property, index) => {
              const image = property.images && property.images.length > 0 ? property.images[0] : fallbackImages[index % fallbackImages.length];

              return (
                <div key={property.id} className="group py-5 first:pt-0">
                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    {/* Image */}
                    <div
                      className="relative w-full sm:w-56 md:w-64 shrink-0 aspect-[4/3] rounded-xl overflow-hidden cursor-pointer"
                      onClick={() => navigate(`/imovel/${property.id}`)}
                    >
                      <img
                        src={image}
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      {property.images && property.images.length > 1 && (
                        <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                          {property.images.length} fotos
                        </span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
                      <div>
                        <h4 className="text-base font-heading font-bold text-foreground mb-0.5 line-clamp-1">{property.title}</h4>
                        <p className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <MapPin className="w-3 h-3 shrink-0" />
                          {property.neighborhood ? `${property.neighborhood}${property.city ? `, ${property.city}` : ""}` : property.city || ""}
                        </p>
                        {property.description && (
                          <p className="text-xs text-muted-foreground/80 line-clamp-1 mb-2">{property.description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-3 text-muted-foreground text-xs">
                          {property.bedrooms != null && property.bedrooms > 0 && (
                            <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5" /> {property.bedrooms} Qts</span>
                          )}
                          {property.bathrooms != null && property.bathrooms > 0 && (
                            <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" /> {property.bathrooms} Ban</span>
                          )}
                          {property.parking_spots != null && property.parking_spots > 0 && (
                            <span className="flex items-center gap-1"><Car className="w-3.5 h-3.5" /> {property.parking_spots} Vaga</span>
                          )}
                          {property.area != null && property.area > 0 && (
                            <span className="flex items-center gap-1"><Maximize className="w-3.5 h-3.5" /> {property.area}m²</span>
                          )}
                        </div>
                      </div>
                      {property.price > 0 && (
                        <p className="text-sm font-bold text-secondary mt-2">{formatPrice(property.price)}</p>
                      )}
                      {/* Mobile button */}
                      <Button
                        className="sm:hidden mt-3 w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-xs"
                        onClick={() => navigate(`/imovel/${property.id}`)}
                      >
                        Ver Detalhes
                      </Button>
                    </div>

                    {/* Arrow - desktop */}
                    <div className="hidden sm:flex items-center self-center">
                      <Button
                        size="icon"
                        className="w-10 h-10 rounded-full bg-foreground text-background hover:bg-foreground/80"
                        onClick={() => navigate(`/imovel/${property.id}`)}
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-6">
              <Button variant="outline" size="icon" className="w-8 h-8" disabled={safePage <= 1} onClick={() => goToPage(safePage - 1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {getPageNumbers().map((p, i) =>
                p === "ellipsis" ? (
                  <span key={`e-${i}`} className="px-1 text-muted-foreground text-xs">…</span>
                ) : (
                  <Button key={p} variant={p === safePage ? "default" : "outline"} size="icon" className="w-8 h-8 text-xs" onClick={() => goToPage(p as number)}>
                    {p}
                  </Button>
                )
              )}
              <Button variant="outline" size="icon" className="w-8 h-8" disabled={safePage >= totalPages} onClick={() => goToPage(safePage + 1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const AboutSection = () => {
  const { get } = useSiteContent();
  const about = get("about");
  const navigate = useNavigate();
  const [realBrokers, setRealBrokers] = useState<RealBroker[]>([]);
  const [featuredProperties, setFeaturedProperties] = useState<FeaturedProperty[]>([]);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [shuffledBots, setShuffledBots] = useState<BrokerBot[]>(() => shuffleArray(generateBotBrokers()));
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCity, setFilterCity] = useState("all");
  const [filterNeighborhood, setFilterNeighborhood] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterTransaction, setFilterTransaction] = useState("all");
  const [filterBedrooms, setFilterBedrooms] = useState("all");
  const [filterPrice, setFilterPrice] = useState("all");
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
        .select("id, title, images, neighborhood, price, bedrooms, bathrooms, parking_spots, area, suites, city, property_type, description, address")
        .eq("active", true)
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false });

      if (data) setFeaturedProperties(data);
    };

    fetchBrokers();
    fetchProperties();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setShuffledBots(shuffleArray(generateBotBrokers()));
    }, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const staticCampaignProperties = useMemo<FeaturedProperty[]>(
    () =>
      staticProperties.map((property) => ({
        id: property.id,
        title: property.title,
        images: property.images,
        neighborhood: property.neighborhood,
        price: property.price,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        parking_spots: property.parking_spots,
        area: property.area,
        suites: null,
        city: property.city,
        property_type: property.property_type,
        description: property.description,
        address: property.address,
      })),
    []
  );

  const mergedProperties = useMemo(() => {
    const dbTitles = new Set(featuredProperties.map((property) => normalizeText(property.title)));

    return [
      ...staticCampaignProperties.filter((property) => !dbTitles.has(normalizeText(property.title))),
      ...featuredProperties,
    ];
  }, [featuredProperties, staticCampaignProperties]);

  const cityOptions = useMemo(
    () =>
      [...new Set(mergedProperties.map((property) => property.city).filter(Boolean) as string[])].sort((a, b) =>
        a.localeCompare(b, "pt-BR")
      ),
    [mergedProperties]
  );

  const allNeighborhoodOptions = useMemo(
    () =>
      [...new Set(mergedProperties.map((property) => property.neighborhood).filter(Boolean) as string[])].sort((a, b) =>
        a.localeCompare(b, "pt-BR")
      ),
    [mergedProperties]
  );

  const neighborhoodOptions = useMemo(() => {
    const source =
      filterCity === "all"
        ? mergedProperties
        : mergedProperties.filter((property) => property.city === filterCity);

    return [...new Set(source.map((property) => property.neighborhood).filter(Boolean) as string[])].sort((a, b) =>
      a.localeCompare(b, "pt-BR")
    );
  }, [filterCity, mergedProperties]);

  const typeOptions = useMemo(
    () =>
      [...new Set(mergedProperties.map((property) => property.property_type).filter(Boolean) as string[])].sort((a, b) =>
        (propertyTypeLabels[a] ?? a).localeCompare(propertyTypeLabels[b] ?? b, "pt-BR")
      ),
    [mergedProperties]
  );

  useEffect(() => {
    if (filterNeighborhood !== "all" && !neighborhoodOptions.includes(filterNeighborhood)) {
      setFilterNeighborhood("all");
    }
  }, [filterNeighborhood, neighborhoodOptions]);

  const filteredProperties = useMemo(() => {
    const normalizedSearch = normalizeText(searchQuery);

    return mergedProperties.filter((property) => {
      const matchesCity = filterCity === "all" || property.city === filterCity;
      const matchesNeighborhood = filterNeighborhood === "all" || property.neighborhood === filterNeighborhood;
      const matchesType = filterType === "all" || property.property_type === filterType;

      // Transaction filter (property needs a transaction_type-like field; skip if not available)
      const matchesTransaction = filterTransaction === "all";

      // Bedrooms filter
      let matchesBedrooms = true;
      if (filterBedrooms !== "all") {
        const beds = property.bedrooms ?? 0;
        if (filterBedrooms === "4") matchesBedrooms = beds >= 4;
        else matchesBedrooms = beds === parseInt(filterBedrooms);
      }

      // Price filter
      let matchesPrice = true;
      if (filterPrice !== "all") {
        if (filterPrice === "above") matchesPrice = property.price > 5000000;
        else matchesPrice = property.price <= parseInt(filterPrice);
      }

      const searchableContent = [
        property.title,
        property.neighborhood,
        property.city,
        property.address,
        property.description,
        property.property_type ? propertyTypeLabels[property.property_type] ?? property.property_type : "",
      ]
        .map((value) => normalizeText(value))
        .join(" ");

      const matchesSearch = !normalizedSearch || searchableContent.includes(normalizedSearch);

      const hasValidImage = property.images?.some(img => img && img.trim() !== "");

      return matchesCity && matchesNeighborhood && matchesType && matchesTransaction && matchesBedrooms && matchesPrice && matchesSearch && hasValidImage;
    });
  }, [filterCity, filterNeighborhood, filterType, filterTransaction, filterBedrooms, filterPrice, mergedProperties, searchQuery]);

  const allBrokersList: BrokerBot[] = [
    ...realBrokers.map((broker) => ({
      id: broker.id,
      full_name: broker.full_name,
      avatar_url: broker.avatar_url,
      isBot: false,
      isAttending: false,
    })),
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

  const handleSearchButtonClick = () => {
    document.getElementById("campaign-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setFilterCity("all");
    setFilterNeighborhood("all");
    setFilterType("all");
  };

  return (
    <section id="about" className="section-padding bg-cream">
      <div className="container-main">
        <div className="grid lg:grid-cols-[1fr_260px] gap-6 items-start">
          <div>
            <h2 className="text-3xl font-heading font-bold text-primary mb-1 italic">{about.title}</h2>
            <div className="w-12 h-1 bg-secondary rounded mb-4" />
            <p className="text-muted-foreground mb-6 leading-relaxed text-sm">{about.subtitle}</p>

            <h3 className="text-2xl font-heading font-bold text-foreground mb-1">
              {about.content.campaign_title || "Escolha sua Campanha"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">{about.content.campaign_subtitle || ""}</p>

            <div className="bg-card rounded-xl border border-border p-4 mb-4 shadow-sm">
              <SearchFilters
                search={searchQuery}
                onSearchChange={setSearchQuery}
                filterType={filterType}
                onFilterTypeChange={setFilterType}
                filterTransaction={filterTransaction}
                onFilterTransactionChange={setFilterTransaction}
                filterNeighborhood={filterNeighborhood}
                onFilterNeighborhoodChange={setFilterNeighborhood}
                filterBedrooms={filterBedrooms}
                onFilterBedroomsChange={setFilterBedrooms}
                filterPrice={filterPrice}
                onFilterPriceChange={setFilterPrice}
                neighborhoods={neighborhoodOptions}
                typeOptions={typeOptions}
              />
            </div>

            <CampaignResults properties={filteredProperties} navigate={navigate} />

            <ScheduleModal open={scheduleOpen} onOpenChange={setScheduleOpen} />
          </div>

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

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{broker.full_name}</p>
                      {broker.isAttending ? (
                        <Badge className="bg-secondary/20 text-secondary text-[8px] px-1 py-0 h-3.5">Atendendo</Badge>
                      ) : (
                        <Badge className="bg-emerald-100 text-emerald-700 text-[8px] px-1 py-0 h-3.5">Disponível</Badge>
                      )}
                    </div>

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
