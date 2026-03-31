import { useEffect, useMemo, useState } from "react";
import { staticProperties } from "@/data/staticProperties";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Phone, MessageCircle, User, Home, Bed, Bath, Car, Maximize, Search, SlidersHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ScheduleModal from "@/components/ScheduleModal";
import ImageLightbox from "@/components/ImageLightbox";
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
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<{ src: string; alt: string }[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxTitle, setLightboxTitle] = useState("");

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

      return matchesCity && matchesNeighborhood && matchesType && matchesSearch;
    });
  }, [filterCity, filterNeighborhood, filterType, mergedProperties, searchQuery]);

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

  const openLightbox = (property: FeaturedProperty, imgIndex = 0) => {
    const images = property.images && property.images.length > 0
      ? property.images.map((src, index) => ({ src, alt: `${property.title} - Foto ${index + 1}` }))
      : [{ src: propertyCondo, alt: property.title }];

    setLightboxImages(images);
    setLightboxIndex(imgIndex);
    setLightboxTitle(property.title);
    setLightboxOpen(true);
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
              <h4 className="text-sm font-bold text-foreground mb-3">Resultado de Busca</h4>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,180px))_auto]">
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Pesquisar por imóvel, endereço, cidade ou bairro"
                />

                <Select value={filterCity} onValueChange={setFilterCity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Cidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Cidades</SelectItem>
                    {cityOptions.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterNeighborhood} onValueChange={setFilterNeighborhood}>
                  <SelectTrigger>
                    <SelectValue placeholder="Bairro" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Bairros</SelectItem>
                    {neighborhoodOptions.map((neighborhood) => (
                      <SelectItem key={neighborhood} value={neighborhood}>
                        {neighborhood}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo de Imóvel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Tipos</SelectItem>
                    {typeOptions.map((type) => (
                      <SelectItem key={type} value={type}>
                        {propertyTypeLabels[type] ?? type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex gap-3 md:col-span-2 xl:col-span-1">
                  <Button variant="outline" type="button" onClick={() => setShowMoreFilters((value) => !value)} className="flex-1 font-semibold">
                    <SlidersHorizontal className="w-4 h-4 mr-1" />
                    Mais Filtros
                  </Button>
                  <Button type="button" onClick={handleSearchButtonClick} className="flex-1 font-semibold">
                    <Search className="w-4 h-4 mr-1" />
                    Pesquisar
                  </Button>
                </div>
              </div>

              {showMoreFilters && (
                <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-border sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-muted-foreground">
                    {cityOptions.length} cidades • {allNeighborhoodOptions.length} bairros • {typeOptions.length} tipos disponíveis
                  </p>
                  <Button variant="ghost" size="sm" type="button" onClick={clearFilters}>
                    Limpar filtros
                  </Button>
                </div>
              )}
            </div>

            <div id="campaign-results">
              <p className="text-xs text-muted-foreground mb-3">{filteredProperties.length} imóvel(is) encontrado(s)</p>

              {filteredProperties.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-12">
                  Nenhum imóvel encontrado com os filtros selecionados.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {filteredProperties.map((property, index) => {
                    const image = property.images && property.images.length > 0 ? property.images[0] : fallbackImages[index % fallbackImages.length];
                    const formattedPrice = property.price > 0
                      ? new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                          maximumFractionDigits: 0,
                        }).format(property.price)
                      : null;

                    return (
                      <div
                        key={property.id}
                        className="rounded-lg overflow-hidden group cursor-pointer shadow-sm bg-card border border-border"
                        onClick={() => navigate(`/imovel/${property.id}`)}
                      >
                        <div
                          className="relative aspect-[4/3] overflow-hidden cursor-zoom-in"
                          onClick={(event) => {
                            event.stopPropagation();
                            openLightbox(property);
                          }}
                        >
                          <img
                            src={image}
                            alt={property.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/60 via-transparent to-transparent" />
                          <div className="absolute bottom-2 left-2 right-2">
                            <span className="text-primary-foreground font-bold text-xs tracking-wide font-heading line-clamp-2">
                              {property.title}
                            </span>
                          </div>
                          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary/80 backdrop-blur-sm flex items-center justify-center text-primary-foreground">
                            <Home className="w-3 h-3" />
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/30">
                            <span className="bg-background/90 text-foreground px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 group-hover:scale-105 transition-transform">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M11 8v6"/><path d="M8 11h6"/></svg>
                              Ampliar fotos
                            </span>
                          </div>
                        </div>
                        <div className="p-2 space-y-1">
                          {property.neighborhood && (
                            <p className="text-[10px] text-muted-foreground font-medium">{property.neighborhood}</p>
                          )}
                          <div className="flex items-center gap-2 flex-wrap text-[9px] text-muted-foreground">
                            {property.bedrooms != null && property.bedrooms > 0 && (
                              <span className="flex items-center gap-0.5">
                                <Bed className="w-3 h-3" />
                                {property.bedrooms} Qts
                              </span>
                            )}
                            {property.suites != null && property.suites > 0 && (
                              <span className="flex items-center gap-0.5">
                                <Bed className="w-3 h-3 text-secondary" />
                                {property.suites} Suíte
                              </span>
                            )}
                            {property.bathrooms != null && property.bathrooms > 0 && (
                              <span className="flex items-center gap-0.5">
                                <Bath className="w-3 h-3" />
                                {property.bathrooms} Ban
                              </span>
                            )}
                            {property.parking_spots != null && property.parking_spots > 0 && (
                              <span className="flex items-center gap-0.5">
                                <Car className="w-3 h-3" />
                                {property.parking_spots} Vaga
                              </span>
                            )}
                            {property.area != null && property.area > 0 && (
                              <span className="flex items-center gap-0.5">
                                <Maximize className="w-3 h-3" />
                                {property.area}m²
                              </span>
                            )}
                          </div>
                          {formattedPrice && <p className="text-secondary font-bold text-xs">{formattedPrice}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <ImageLightbox
              images={lightboxImages}
              currentIndex={lightboxIndex}
              isOpen={lightboxOpen}
              onClose={() => setLightboxOpen(false)}
              onNavigate={setLightboxIndex}
              propertyTitle={lightboxTitle}
            />

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
