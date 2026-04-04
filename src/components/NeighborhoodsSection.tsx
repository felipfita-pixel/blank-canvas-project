import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { MapPin, Bed, Bath, Maximize, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ImageLightbox from "@/components/ImageLightbox";
import WatermarkImage from "@/components/WatermarkImage";
import { getPropertyStatus, statusConfig } from "@/lib/propertyStatus";
import bairroLeblon from "@/assets/bairro-leblon.jpg";
import bairroBotafogo from "@/assets/bairro-botafogo.jpg";
import bairroBarra from "@/assets/bairro-barra.jpg";

const fallbackImages = [bairroLeblon, bairroBotafogo, bairroBarra];
const ITEMS_PER_PAGE = 12;

interface PropertyItem {
  id: string;
  title: string;
  neighborhood: string | null;
  price: number;
  images: string[] | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  area?: number | null;
  description?: string | null;
  city?: string | null;
}

const formatPrice = (price: number) =>
  price > 0
    ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(price)
    : null;

const NeighborhoodsSection = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<{ src: string; alt: string }[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxTitle, setLightboxTitle] = useState("");

  useEffect(() => {
    const fetchProperties = async () => {
      const { data } = await supabase
        .from("properties")
        .select("id, title, neighborhood, price, images, bedrooms, bathrooms, area, description, city")
        .eq("active", true)
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(60);
      if (data) setProperties(data);
    };
    fetchProperties();
  }, []);

  const getImage = (prop: PropertyItem, i: number) =>
    prop.images && prop.images.length > 0 ? prop.images[0] : fallbackImages[i % fallbackImages.length];

  const openLightbox = (p: PropertyItem) => {
    const imgs = p.images && p.images.length > 0
      ? p.images.map((src, i) => ({ src, alt: `${p.title} - Foto ${i + 1}` }))
      : [{ src: fallbackImages[0], alt: p.title }];
    setLightboxImages(imgs);
    setLightboxIndex(0);
    setLightboxTitle(p.title);
    setLightboxOpen(true);
  };

  if (properties.length === 0) {
    return (
      <section id="neighborhoods" className="section-padding bg-cream">
        <div className="container-main">
          <p className="text-sm text-muted-foreground py-12 text-center">Nenhum imóvel disponível no momento.</p>
        </div>
      </section>
    );
  }

  const totalPages = Math.ceil(properties.length / ITEMS_PER_PAGE);
  const safePage = Math.min(currentPage, totalPages);
  const paginated = properties.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    document.getElementById("neighborhoods")?.scrollIntoView({ behavior: "smooth", block: "start" });
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
    <section id="neighborhoods" className="section-padding bg-cream">
      <div className="container-main">
        <div className="flex flex-col divide-y divide-border">
          {paginated.map((p, i) => (
            <div key={p.id} className="group py-6 first:pt-0">
              <div className="flex flex-col sm:flex-row gap-5 items-start">
                {/* Image */}
                <div
                  className="relative w-full sm:w-56 md:w-64 shrink-0 aspect-[4/3] rounded-xl overflow-hidden cursor-pointer"
                  onClick={() => openLightbox(p)}
                >
                  <WatermarkImage
                    src={getImage(p, (safePage - 1) * ITEMS_PER_PAGE + i)}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  {(() => {
                    const status = getPropertyStatus(p.title, p.description);
                    return status ? (
                      <Badge className={`absolute top-3 left-3 ${statusConfig[status].className}`}>
                        {statusConfig[status].label}
                      </Badge>
                    ) : null;
                  })()}
                  {p.images && p.images.length > 1 && (
                    <span className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                      {p.images.length} fotos
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
                  <div>
                    <h3 className="text-lg font-heading font-bold text-foreground mb-1 line-clamp-1">{p.title}</h3>
                    <p className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      {p.neighborhood ? `${p.neighborhood}${p.city ? `, ${p.city}` : ""}` : p.city || ""}
                    </p>
                    {p.description && (
                      <p className="text-sm text-muted-foreground/80 line-clamp-1 mb-3">{p.description}</p>
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
                  <Link to={`/imovel/${p.id}`} className="sm:hidden mt-4">
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg">
                      Ver Detalhes
                    </Button>
                  </Link>
                </div>

                {/* Arrow - desktop */}
                <div className="hidden sm:flex items-center self-center">
                  <Link to={`/imovel/${p.id}`}>
                    <Button size="icon" className="w-12 h-12 rounded-full bg-foreground text-background hover:bg-foreground/80">
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
            <Button variant="outline" size="icon" className="w-9 h-9" disabled={safePage <= 1} onClick={() => goToPage(safePage - 1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {getPageNumbers().map((p, i) =>
              p === "ellipsis" ? (
                <span key={`e-${i}`} className="px-1 text-muted-foreground">…</span>
              ) : (
                <Button key={p} variant={p === safePage ? "default" : "outline"} size="icon" className="w-9 h-9" onClick={() => goToPage(p as number)}>
                  {p}
                </Button>
              )
            )}
            <Button variant="outline" size="icon" className="w-9 h-9" disabled={safePage >= totalPages} onClick={() => goToPage(safePage + 1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
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
    </section>
  );
};

export default NeighborhoodsSection;
