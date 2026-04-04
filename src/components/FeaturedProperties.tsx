import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { staticProperties } from "@/data/staticProperties";
import { Bed, Bath, Maximize, MapPin, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ImageLightbox from "@/components/ImageLightbox";
import WatermarkImage from "@/components/WatermarkImage";
import propertyCondo from "@/assets/property-condo.jpg";

interface Property {
  id: string;
  title: string;
  neighborhood: string | null;
  price: number;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number | null;
  images: string[] | null;
  featured: boolean | null;
  transaction_type: string;
  description?: string | null;
  city?: string | null;
}

const ITEMS_PER_PAGE = 12;

const formatPrice = (price: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(price);

const FeaturedProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
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
    const fetch = async () => {
      const { data } = await supabase
        .from("properties")
        .select("id, title, neighborhood, price, bedrooms, bathrooms, area, images, featured, transaction_type, description, city")
        .eq("active", true)
        .eq("featured", true)
        .order("created_at", { ascending: false })
        .limit(60);

      const dbProps = (data as Property[]) || [];
      const staticAsProps: Property[] = staticProperties.slice(0, 60).map((sp) => ({
        id: sp.id,
        title: sp.title,
        neighborhood: sp.neighborhood,
        price: sp.price,
        bedrooms: sp.bedrooms,
        bathrooms: sp.bathrooms,
        area: sp.area,
        images: sp.images,
        featured: true,
        transaction_type: sp.transaction_type,
        description: (sp as any).description || null,
        city: (sp as any).city || null,
      }));
      const merged = [
        ...dbProps,
        ...staticAsProps.filter((sp) => !dbProps.some((dp) => dp.title === sp.title)),
      ];
      setProperties(merged);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return null;
  if (properties.length === 0) return null;

  const totalPages = Math.ceil(properties.length / ITEMS_PER_PAGE);
  const safePage = Math.min(currentPage, totalPages);
  const paginated = properties.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    document.getElementById("featured")?.scrollIntoView({ behavior: "smooth", block: "start" });
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

  return (
    <section id="featured" className="section-padding">
      <div className="container-main">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-heading font-bold text-secondary italic">
              Imóveis em Destaque
            </h2>
            <p className="text-muted-foreground mt-2 max-w-xl">
              Os melhores imóveis selecionados para você. Alto padrão, localização privilegiada e excelente custo-benefício.
            </p>
          </div>
          <Link to="/imoveis" className="hidden sm:flex items-center gap-1 text-secondary font-medium hover:underline whitespace-nowrap">
            Ver mais imóveis <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex flex-col divide-y divide-border">
          {paginated.map((p) => (
            <div key={p.id} className="group py-6 first:pt-0">
              <div className="flex flex-col sm:flex-row gap-5 items-start">
                {/* Image */}
                <div
                  className="relative w-full sm:w-72 md:w-80 shrink-0 aspect-[4/3] rounded-xl overflow-hidden cursor-pointer"
                  onClick={() => openLightbox(p)}
                >
                  <WatermarkImage
                    src={p.images && p.images.length > 0 ? p.images[0] : propertyCondo}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <Badge className="absolute top-3 left-3 bg-secondary text-secondary-foreground">Destaque</Badge>
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
                      {p.neighborhood ? `${p.neighborhood}${p.city ? `, ${p.city}` : ""}` : p.city || ""}
                    </p>
                    {(p as any).description && (
                      <p className="text-sm text-muted-foreground/80 line-clamp-1 mb-3">{(p as any).description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
                      {p.bedrooms ? <span className="flex items-center gap-1.5"><Bed className="w-4 h-4" /> {p.bedrooms} quarto{p.bedrooms > 1 ? "s" : ""}</span> : null}
                      {p.bathrooms ? <span className="flex items-center gap-1.5"><Bath className="w-4 h-4" /> {p.bathrooms} banheiro{p.bathrooms > 1 ? "s" : ""}</span> : null}
                      {p.area ? <span className="flex items-center gap-1.5"><Maximize className="w-4 h-4" /> {p.area}m²</span> : null}
                    </div>
                  </div>
                  {p.price > 0 && (
                    <p className="text-lg font-bold text-secondary mt-3">{formatPrice(p.price)}</p>
                  )}
                  {/* Mobile button */}
                  <Link to={`/imovel/${p.id}`} className="sm:hidden mt-4">
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg">
                      Ver Detalhes
                    </Button>
                  </Link>
                </div>

                {/* Arrow button - desktop */}
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
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <Button
              variant="outline"
              size="icon"
              className="w-9 h-9"
              disabled={safePage <= 1}
              onClick={() => goToPage(safePage - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {getPageNumbers().map((p, i) =>
              p === "ellipsis" ? (
                <span key={`e-${i}`} className="px-1 text-muted-foreground">…</span>
              ) : (
                <Button
                  key={p}
                  variant={p === safePage ? "default" : "outline"}
                  size="icon"
                  className="w-9 h-9"
                  onClick={() => goToPage(p as number)}
                >
                  {p}
                </Button>
              )
            )}
            <Button
              variant="outline"
              size="icon"
              className="w-9 h-9"
              disabled={safePage >= totalPages}
              onClick={() => goToPage(safePage + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Mobile link */}
        <div className="mt-8 text-center sm:hidden">
          <Link to="/imoveis">
            <Button variant="outline" className="rounded-full px-8">Ver todos os imóveis</Button>
          </Link>
        </div>
      </div>

      <ImageLightbox
        images={lightboxImages}
        currentIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={setLightboxIndex}
        propertyTitle={lightboxTitle}
      />
    </section>
  );
};

export default FeaturedProperties;
