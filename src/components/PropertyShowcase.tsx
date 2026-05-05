import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Bed, Bath, Maximize, Car } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { staticProperties } from "@/data/staticProperties";
import SiteVisitCounter from "@/components/SiteVisitCounter";
import WatermarkImage from "@/components/WatermarkImage";
import ImageLightbox from "@/components/ImageLightbox";
import propertyCondo from "@/assets/property-condo.jpg";

interface Property {
  id: string;
  title: string;
  description: string;
  neighborhood: string | null;
  city?: string | null;
  price: number;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number | null;
  parking_spots?: number | null;
  images: string[] | null;
  transaction_type: string;
  property_type?: string;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(price);

const PropertyShowcase = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("properties")
        .select("id, title, description, neighborhood, city, price, bedrooms, bathrooms, area, parking_spots, images, transaction_type, property_type")
        .eq("active", true)
        .eq("featured", true)
        .order("created_at", { ascending: false })
        .limit(10);

      const dbProps = (data as Property[]) || [];
      const staticAsProps: Property[] = staticProperties.slice(0, 60).map((sp) => ({
        id: sp.id,
        title: sp.title,
        description: sp.description,
        neighborhood: sp.neighborhood,
        city: sp.city,
        price: sp.price,
        bedrooms: sp.bedrooms,
        bathrooms: sp.bathrooms,
        area: sp.area,
        parking_spots: sp.parking_spots,
        images: sp.images,
        transaction_type: sp.transaction_type,
        property_type: sp.property_type,
      }));
      const merged = [
        ...dbProps,
        ...staticAsProps.filter((sp) => !dbProps.some((dp) => dp.title === sp.title)),
      ];
      setProperties(merged);
      setLoading(false);
    };
    load();
  }, []);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % properties.length);
  }, [properties.length]);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + properties.length) % properties.length);
  }, [properties.length]);

  // Auto-advance every 6s
  useEffect(() => {
    if (properties.length <= 1) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next, properties.length]);

  if (loading || properties.length === 0) return null;

  const p = properties[current];
  const image = p.images && p.images.length > 0 ? p.images[0] : propertyCondo;

  // Extract a short tagline from description (first line or first sentence)
  const tagline = p.description
    ? p.description.split("\n")[0].replace(/[!]+$/, "").trim()
    : "";

  // Build specs line
  const specs: string[] = [];
  if (p.bedrooms) specs.push(`${p.bedrooms} Quarto${p.bedrooms > 1 ? "s" : ""}`);
  if (p.area) specs.push(`${p.area}m²`);
  if (p.bathrooms) specs.push(`${p.bathrooms} Banheiro${p.bathrooms > 1 ? "s" : ""}`);
  if (p.parking_spots) specs.push(`${p.parking_spots} Vaga${p.parking_spots > 1 ? "s" : ""}`);

  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative flex flex-col lg:flex-row h-[380px] sm:h-[420px] lg:h-[480px]">
        {/* Details side — dark navy */}
        <div className="relative lg:w-[35%] w-full bg-primary flex flex-col justify-center px-8 sm:px-10 lg:px-12 py-8 lg:py-10 z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80 pointer-events-none" />

          <AnimatePresence mode="wait">
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
              className="relative z-10"
            >
              {/* Title */}
              <h2 className="font-display text-2xl sm:text-3xl lg:text-[2.2rem] font-bold text-primary-foreground leading-[1.15] mb-4 tracking-wide">
                {p.title}
              </h2>

              {/* Tagline with decorative line */}
              {tagline && (
                <div className="mb-5">
                  <div className="w-10 h-[2px] bg-secondary mb-3" />
                  <p className="text-primary-foreground/70 text-[13px] uppercase tracking-[0.15em] leading-relaxed font-light">
                    {tagline.length > 100 ? tagline.slice(0, 100) + "…" : tagline}
                  </p>
                </div>
              )}

              {/* Specs with larger icons */}
              <div className="flex flex-wrap gap-x-5 gap-y-3 mb-5">
                {p.bedrooms && (
                  <div className="flex items-center gap-2 text-primary-foreground/90">
                    <Bed className="w-[18px] h-[18px] text-secondary" />
                    <span className="text-[13px] font-medium">{p.bedrooms} Quarto{p.bedrooms > 1 ? "s" : ""}</span>
                  </div>
                )}
                {p.bathrooms && (
                  <div className="flex items-center gap-2 text-primary-foreground/90">
                    <Bath className="w-[18px] h-[18px] text-secondary" />
                    <span className="text-[13px] font-medium">{p.bathrooms} Banheiro{p.bathrooms > 1 ? "s" : ""}</span>
                  </div>
                )}
                {p.area && (
                  <div className="flex items-center gap-2 text-primary-foreground/90">
                    <Maximize className="w-[18px] h-[18px] text-secondary" />
                    <span className="text-[13px] font-medium">{p.area} m²</span>
                  </div>
                )}
                {p.parking_spots && (
                  <div className="flex items-center gap-2 text-primary-foreground/90">
                    <Car className="w-[18px] h-[18px] text-secondary" />
                    <span className="text-[13px] font-medium">{p.parking_spots} Vaga{p.parking_spots > 1 ? "s" : ""}</span>
                  </div>
                )}
              </div>

              {/* Location */}
              {p.neighborhood && (
                <p className="text-primary-foreground/50 text-[12px] tracking-[0.1em] mb-5 italic font-light">
                  {p.neighborhood}{p.city ? ` – ${p.city}` : ""}
                </p>
              )}

              {/* Price */}
              {p.price > 0 && (
                <p className="text-secondary font-bold text-xl mb-6 tracking-wide">{formatPrice(p.price)}</p>
              )}

              {/* CTA Button */}
              <Link
                to={`/imovel/${p.id}`}
                className="inline-block bg-secondary text-secondary-foreground font-bold text-xs uppercase tracking-[0.2em] px-7 py-3 hover:bg-secondary/90 transition-colors duration-300 rounded-sm"
              >
                Ver Detalhes
              </Link>
            </motion.div>
          </AnimatePresence>

          {/* Nav arrows */}
          <div className="absolute bottom-5 left-8 sm:left-10 flex items-center gap-3 z-10">
            <button
              onClick={prev}
              className="w-9 h-9 border border-primary-foreground/20 flex items-center justify-center text-primary-foreground/60 hover:text-secondary hover:border-secondary transition-colors"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <SiteVisitCounter />
            <button
              onClick={next}
              className="w-9 h-9 border border-primary-foreground/20 flex items-center justify-center text-primary-foreground/60 hover:text-secondary hover:border-secondary transition-colors"
              aria-label="Próximo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Image side — larger */}
        <div className="relative lg:w-[65%] w-full h-full overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={p.id}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 w-full h-full"
            >
              <WatermarkImage
                src={image}
                alt={p.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-primary/40 to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
};

export default PropertyShowcase;
