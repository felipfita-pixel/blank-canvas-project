import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Bed, Bath, Maximize, Car } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { featuredStaticProperties } from "@/data/staticProperties";
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
      const staticAsProps: Property[] = featuredStaticProperties.map((sp) => ({
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
      <div className="relative flex flex-col lg:flex-row h-[340px] sm:h-[380px] lg:h-[420px]">
        {/* Details side — dark navy overlay */}
        <div className="relative lg:w-[42%] w-full bg-primary flex flex-col justify-center px-8 sm:px-12 lg:px-14 py-8 lg:py-10 z-10">
          {/* Subtle texture overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80 pointer-events-none" />

          <AnimatePresence mode="wait">
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
              className="relative z-10 max-w-md"
            >
              <h2 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-primary-foreground leading-tight mb-3 tracking-wide">
                {p.title}
              </h2>

              {tagline && (
                <p className="text-primary-foreground/60 text-xs uppercase tracking-[0.18em] mb-5 leading-relaxed font-light">
                  {tagline.length > 80 ? tagline.slice(0, 80) + "…" : tagline}
                </p>
              )}

              <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4">
                {p.bedrooms && (
                  <div className="flex items-center gap-1.5 text-primary-foreground/80">
                    <Bed className="w-4 h-4 text-secondary" />
                    <span className="text-sm font-medium">{p.bedrooms} Quarto{p.bedrooms > 1 ? "s" : ""}</span>
                  </div>
                )}
                {p.bathrooms && (
                  <div className="flex items-center gap-1.5 text-primary-foreground/80">
                    <Bath className="w-4 h-4 text-secondary" />
                    <span className="text-sm font-medium">{p.bathrooms} Banheiro{p.bathrooms > 1 ? "s" : ""}</span>
                  </div>
                )}
                {p.area && (
                  <div className="flex items-center gap-1.5 text-primary-foreground/80">
                    <Maximize className="w-4 h-4 text-secondary" />
                    <span className="text-sm font-medium">{p.area} m²</span>
                  </div>
                )}
                {p.parking_spots && (
                  <div className="flex items-center gap-1.5 text-primary-foreground/80">
                    <Car className="w-4 h-4 text-secondary" />
                    <span className="text-sm font-medium">{p.parking_spots} Vaga{p.parking_spots > 1 ? "s" : ""}</span>
                  </div>
                )}
              </div>

              {p.neighborhood && (
                <p className="text-primary-foreground/50 text-xs tracking-[0.12em] mb-5 italic">
                  {p.neighborhood}{p.city ? ` – ${p.city}` : ""}
                </p>
              )}

              {p.price > 0 && (
                <p className="text-secondary font-bold text-lg mb-5 tracking-wide">{formatPrice(p.price)}</p>
              )}

              <Link
                to={`/imovel/${p.id}`}
                className="inline-block border border-secondary text-secondary font-semibold text-xs uppercase tracking-widest px-6 py-2.5 hover:bg-secondary hover:text-primary transition-colors duration-300"
              >
                Ver Detalhes
              </Link>
            </motion.div>
          </AnimatePresence>

          {/* Nav arrows */}
          <div className="absolute bottom-6 left-8 sm:left-12 flex items-center gap-3 z-10">
            <button
              onClick={prev}
              className="w-8 h-8 border border-primary-foreground/20 flex items-center justify-center text-primary-foreground/60 hover:text-secondary hover:border-secondary transition-colors"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-primary-foreground/40 text-xs tracking-widest font-light">
              {String(current + 1).padStart(2, "0")} / {String(properties.length).padStart(2, "0")}
            </span>
            <button
              onClick={next}
              className="w-8 h-8 border border-primary-foreground/20 flex items-center justify-center text-primary-foreground/60 hover:text-secondary hover:border-secondary transition-colors"
              aria-label="Próximo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Image side */}
        <div className="relative lg:w-[58%] w-full h-full overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={p.id}
              src={image}
              alt={p.title}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </AnimatePresence>
          {/* Subtle gradient overlay on image edge */}
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-primary/30 to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
};

export default PropertyShowcase;
