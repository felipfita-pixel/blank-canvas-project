import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { staticProperties } from "@/data/staticProperties";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ChatWidget from "@/components/ChatWidget";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bed, Bath, Maximize, Car, Search, SlidersHorizontal } from "lucide-react";
import ImageLightbox from "@/components/ImageLightbox";
import propertyCondo from "@/assets/property-condo.jpg";

interface Property {
  id: string;
  title: string;
  description: string | null;
  price: number;
  property_type: string;
  transaction_type: string;
  neighborhood: string | null;
  city: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  parking_spots: number | null;
  area: number | null;
  images: string[] | null;
  featured: boolean | null;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(price);

const propertyTypeLabels: Record<string, string> = {
  apartment: "Apartamento",
  house: "Casa",
  penthouse: "Cobertura",
  commercial: "Comercial",
  land: "Terreno",
};

const Properties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterTransaction, setFilterTransaction] = useState("all");
  const [filterNeighborhood, setFilterNeighborhood] = useState("all");
  const [neighborhoods, setNeighborhoods] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<{ src: string; alt: string }[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (p: Property, imgIndex = 0) => {
    const imgs = p.images && p.images.length > 0
      ? p.images.map((src, i) => ({ src, alt: `${p.title} - Foto ${i + 1}` }))
      : [{ src: propertyCondo, alt: p.title }];
    setLightboxImages(imgs);
    setLightboxIndex(imgIndex);
    setLightboxOpen(true);
  };

  useEffect(() => {
    const fetchProps = async () => {
      const { data } = await supabase
        .from("properties")
        .select("*")
        .eq("active", true)
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false });

      // Convert static properties to Property format
      const staticAsProperties: Property[] = staticProperties.map((sp) => ({
        id: sp.id,
        title: sp.title,
        description: sp.description,
        price: sp.price,
        property_type: sp.property_type,
        transaction_type: sp.transaction_type,
        neighborhood: sp.neighborhood,
        city: sp.city,
        bedrooms: sp.bedrooms,
        bathrooms: sp.bathrooms,
        parking_spots: sp.parking_spots,
        area: sp.area,
        images: sp.images,
        featured: true,
      }));

      const dbProperties = (data as Property[]) || [];
      // Merge: DB first, then static (skip duplicates by title)
      const merged = [
        ...dbProperties,
        ...staticAsProperties.filter(
          (sp) => !dbProperties.some((dp) => dp.title === sp.title)
        ),
      ];

      setProperties(merged);
      const hoods = [...new Set(merged.map((p) => p.neighborhood).filter(Boolean))] as string[];
      setNeighborhoods(hoods.sort());
      setLoading(false);
    };
    fetchProps();
  }, []);

  const filtered = properties.filter((p) => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.neighborhood?.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterType !== "all" && p.property_type !== filterType) return false;
    if (filterTransaction !== "all" && p.transaction_type !== filterTransaction) return false;
    if (filterNeighborhood !== "all" && p.neighborhood !== filterNeighborhood) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <div className="bg-primary pt-24 pb-12">
        <div className="container-main">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-primary-foreground mb-2">Imóveis Disponíveis</h1>
          <p className="text-primary-foreground/70">Encontre o imóvel ideal para você.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border-b border-border sticky top-0 z-30">
        <div className="container-main py-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título ou bairro..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)} className="shrink-0">
              <SlidersHorizontal className="w-4 h-4" />
            </Button>
          </div>
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="apartment">Apartamento</SelectItem>
                  <SelectItem value="house">Casa</SelectItem>
                  <SelectItem value="penthouse">Cobertura</SelectItem>
                  <SelectItem value="commercial">Comercial</SelectItem>
                  <SelectItem value="land">Terreno</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterTransaction} onValueChange={setFilterTransaction}>
                <SelectTrigger><SelectValue placeholder="Transação" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Venda e Aluguel</SelectItem>
                  <SelectItem value="sale">Venda</SelectItem>
                  <SelectItem value="rent">Aluguel</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterNeighborhood} onValueChange={setFilterNeighborhood}>
                <SelectTrigger><SelectValue placeholder="Bairro" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os bairros</SelectItem>
                  {neighborhoods.map((n) => (
                    <SelectItem key={n} value={n}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="container-main py-10">
        {loading ? (
          <div className="text-center py-20 text-muted-foreground">Carregando imóveis...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg font-semibold mb-2">Nenhum imóvel encontrado</p>
            <p className="text-sm">Tente ajustar os filtros ou volte mais tarde.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-6">{filtered.length} imóvel(is) encontrado(s)</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((p) => (
                <div key={p.id} className="group">
                  <div className="bg-card rounded-xl overflow-hidden shadow-md border border-border hover:shadow-xl transition-shadow">
                    <div
                      className="relative aspect-[4/3] cursor-pointer"
                      onClick={() => openLightbox(p)}
                    >
                      <img
                        src={p.images && p.images.length > 0 ? p.images[0] : propertyCondo}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      {p.featured && (
                        <Badge className="absolute top-3 left-3 bg-secondary text-secondary-foreground">Destaque</Badge>
                      )}
                      <Badge variant="outline" className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm text-foreground text-[10px]">
                        {p.transaction_type === "rent" ? "Aluguel" : "Venda"}
                      </Badge>
                      {p.images && p.images.length > 1 && (
                        <span className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                          {p.images.length} fotos
                        </span>
                      )}
                    </div>
                    <div className="p-5">
                      <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">
                        {propertyTypeLabels[p.property_type] || p.property_type} · {p.neighborhood || p.city}
                      </p>
                      <h3 className="font-semibold text-foreground mb-2 line-clamp-1">{p.title}</h3>
                      <p className="text-lg font-bold text-secondary mb-4">{formatPrice(p.price)}</p>
                      <div className="flex flex-wrap items-center gap-3 text-muted-foreground text-xs mb-4">
                        {p.bedrooms ? <span className="flex items-center gap-1"><Bed className="w-4 h-4" /> {p.bedrooms} quartos</span> : null}
                        {p.bathrooms ? <span className="flex items-center gap-1"><Bath className="w-4 h-4" /> {p.bathrooms} ban.</span> : null}
                        {p.area ? <span className="flex items-center gap-1"><Maximize className="w-4 h-4" /> {p.area}m²</span> : null}
                        {p.parking_spots ? <span className="flex items-center gap-1"><Car className="w-4 h-4" /> {p.parking_spots} vaga(s)</span> : null}
                      </div>
                      <Link to={`/imovel/${p.id}`}>
                        <Button className="w-full bg-primary text-primary-foreground hover:bg-navy-light rounded-lg">
                          Ver Detalhes
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <ImageLightbox
        images={lightboxImages}
        currentIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={setLightboxIndex}
      />

      <Footer />
      <WhatsAppButton />
      <ChatWidget />
    </div>
  );
};

export default Properties;
