import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { staticProperties } from "@/data/staticProperties";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bed, Bath, Maximize, Car, Search, SlidersHorizontal, Share2, CalendarDays, MapPin, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [filterBedrooms, setFilterBedrooms] = useState("all");
  const [filterPrice, setFilterPrice] = useState("all");
  const [neighborhoods, setNeighborhoods] = useState<string[]>([]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterType, filterTransaction, filterNeighborhood, filterBedrooms, filterPrice]);
  const [showFilters, setShowFilters] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<{ src: string; alt: string }[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxTitle, setLightboxTitle] = useState("");

  const openLightbox = (p: Property, imgIndex = 0) => {
    const imgs = p.images && p.images.length > 0
      ? p.images.map((src, i) => ({ src, alt: `${p.title} - Foto ${i + 1}` }))
      : [{ src: propertyCondo, alt: p.title }];
    setLightboxImages(imgs);
    setLightboxIndex(imgIndex);
    setLightboxTitle(p.title);
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

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  const filtered = properties.filter((p) => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.neighborhood?.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterType !== "all" && p.property_type !== filterType) return false;
    if (filterTransaction !== "all" && p.transaction_type !== filterTransaction) return false;
    if (filterNeighborhood !== "all" && p.neighborhood !== filterNeighborhood) return false;
    if (filterBedrooms !== "all") {
      const beds = p.bedrooms ?? 0;
      if (filterBedrooms === "4" && beds < 4) return false;
      if (filterBedrooms !== "4" && beds !== parseInt(filterBedrooms)) return false;
    }
    if (filterPrice !== "all") {
      if (filterPrice === "above" && p.price <= 5000000) return false;
      if (filterPrice !== "above" && p.price > parseInt(filterPrice)) return false;
    }
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
      <div className="bg-card border-b border-border sticky top-16 sm:sticky sm:top-20 z-30">
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
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-3">
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
              <Select value={filterBedrooms} onValueChange={setFilterBedrooms}>
                <SelectTrigger><SelectValue placeholder="Quartos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="1">1 quarto</SelectItem>
                  <SelectItem value="2">2 quartos</SelectItem>
                  <SelectItem value="3">3 quartos</SelectItem>
                  <SelectItem value="4">4+ quartos</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPrice} onValueChange={setFilterPrice}>
                <SelectTrigger><SelectValue placeholder="Preço" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Qualquer preço</SelectItem>
                  <SelectItem value="500000">Até R$ 500 mil</SelectItem>
                  <SelectItem value="1000000">Até R$ 1 milhão</SelectItem>
                  <SelectItem value="2000000">Até R$ 2 milhões</SelectItem>
                  <SelectItem value="5000000">Até R$ 5 milhões</SelectItem>
                  <SelectItem value="above">Acima de R$ 5 milhões</SelectItem>
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
          (() => {
            const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
            const safePage = Math.min(currentPage, totalPages);
            const paginated = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

            const goToPage = (page: number) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            };

            const getPageNumbers = () => {
              const pages: (number | 'ellipsis')[] = [];
              if (totalPages <= 5) {
                for (let i = 1; i <= totalPages; i++) pages.push(i);
              } else {
                pages.push(1);
                if (safePage > 3) pages.push('ellipsis');
                for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) pages.push(i);
                if (safePage < totalPages - 2) pages.push('ellipsis');
                pages.push(totalPages);
              }
              return pages;
            };

            return (
              <>
                <p className="text-sm text-muted-foreground mb-6">
                  {filtered.length} imóvel(is) encontrado(s)
                  {totalPages > 1 && <span className="ml-2">· Página {safePage} de {totalPages}</span>}
                </p>
                <div className="flex flex-col divide-y divide-border">
                  {paginated.map((p) => (
                    <div key={p.id} className="group py-6 first:pt-0">
                      <div className="flex flex-col sm:flex-row gap-5 items-start">
                        {/* Image */}
                        <div
                          className="relative w-full sm:w-72 md:w-80 shrink-0 aspect-[4/3] sm:aspect-[4/3] rounded-xl overflow-hidden cursor-pointer"
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
                          {p.images && p.images.length > 1 && (
                            <span className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                              {p.images.length} fotos
                            </span>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
                          <div>
                            <h3 className="text-xl font-heading font-bold text-foreground mb-1 line-clamp-1">{p.title}</h3>
                            <p className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                              <MapPin className="w-3.5 h-3.5 shrink-0" />
                              {p.neighborhood ? `${p.neighborhood}${p.city ? `, ${p.city}` : ''}` : p.city || ''}
                            </p>
                            {p.description && (
                              <p className="text-sm text-muted-foreground/80 line-clamp-1 mb-3">{p.description}</p>
                            )}
                            <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
                              {p.parking_spots ? <span className="flex items-center gap-1.5"><Car className="w-4 h-4" /> {p.parking_spots} vaga{p.parking_spots > 1 ? 's' : ''}</span> : null}
                              {p.bedrooms ? <span className="flex items-center gap-1.5"><Bed className="w-4 h-4" /> {p.bedrooms} quarto{p.bedrooms > 1 ? 's' : ''}</span> : null}
                              {p.area ? <span className="flex items-center gap-1.5"><Maximize className="w-4 h-4" /> {p.area}m²</span> : null}
                            </div>
                          </div>
                        </div>

                        {/* Arrow button */}
                        <div className="hidden sm:flex items-center self-center">
                          <Link to={`/imovel/${p.id}`}>
                            <Button
                              size="icon"
                              className="w-12 h-12 rounded-full bg-foreground text-background hover:bg-foreground/80"
                            >
                              <ArrowRight className="w-5 h-5" />
                            </Button>
                          </Link>
                        </div>

                        {/* Mobile: full-width button */}
                        <div className="sm:hidden w-full">
                          <Link to={`/imovel/${p.id}`} className="w-full">
                            <Button className="w-full bg-primary text-primary-foreground hover:bg-navy-light rounded-lg">
                              Ver Detalhes
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <nav className="flex items-center justify-center gap-2 mt-10 mb-4" aria-label="Paginação">
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-10 h-10 rounded-full"
                      onClick={() => goToPage(safePage - 1)}
                      disabled={safePage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>

                    {getPageNumbers().map((page, i) =>
                      page === 'ellipsis' ? (
                        <span key={`ellipsis-${i}`} className="w-10 h-10 flex items-center justify-center text-muted-foreground">…</span>
                      ) : (
                        <Button
                          key={page}
                          variant={page === safePage ? "default" : "outline"}
                          size="icon"
                          className={`w-10 h-10 rounded-full ${page === safePage ? 'bg-primary text-primary-foreground' : ''}`}
                          onClick={() => goToPage(page)}
                        >
                          {page}
                        </Button>
                      )
                    )}

                    <Button
                      variant="outline"
                      size="icon"
                      className="w-10 h-10 rounded-full"
                      onClick={() => goToPage(safePage + 1)}
                      disabled={safePage === totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </nav>
                )}
              </>
            );
          })()
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

      <Footer />
    </div>
  );
};

export default Properties;
