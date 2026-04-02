import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { staticProperties } from "@/data/staticProperties";
import { Bed, Bath, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ImageLightbox from "@/components/ImageLightbox";
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
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(price);

const FeaturedProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
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
        .select("id, title, neighborhood, price, bedrooms, bathrooms, area, images, featured, transaction_type")
        .eq("active", true)
        .eq("featured", true)
        .order("created_at", { ascending: false })
        .limit(6);

      // Merge DB featured + static featured (60)
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

  return (
    <section id="featured" className="section-padding">
      <div className="container-main text-center">
        <h2 className="text-3xl font-heading font-bold text-secondary mb-3 italic">
          Imóveis em Destaque
        </h2>
        <p className="text-muted-foreground mb-10 max-w-xl mx-auto">
          Os melhores imóveis selecionados para você. Alto padrão, localização privilegiada e excelente custo-benefício.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((p) => (
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
                  <Badge className="absolute top-3 left-3 bg-secondary text-secondary-foreground">Destaque</Badge>
                  {p.images && p.images.length > 1 && (
                    <span className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                      {p.images.length} fotos
                    </span>
                  )}
                </div>
                <div className="p-5 text-left">
                  <h3 className="font-semibold text-foreground mb-1 line-clamp-1">{p.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{p.neighborhood || ""}</p>
                  {p.price > 0 && (
                    <p className="text-lg font-bold text-secondary mb-4">{formatPrice(p.price)}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-muted-foreground text-xs mb-4">
                    {p.bedrooms ? <span className="flex items-center gap-1"><Bed className="w-4 h-4" /> {p.bedrooms} quartos</span> : null}
                    {p.bathrooms ? <span className="flex items-center gap-1"><Bath className="w-4 h-4" /> {p.bathrooms} banheiros</span> : null}
                    {p.area ? <span className="flex items-center gap-1"><Maximize className="w-4 h-4" /> {p.area}m²</span> : null}
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
        <div className="mt-8">
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
