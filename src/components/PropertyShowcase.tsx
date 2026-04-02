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
    <section className="relative w-full bg-background">
      <div className="relative flex flex-col lg:flex-row min-h-[420px] lg:min-h-[520px]">
        {/* Image side */}
        <div className="relative lg:w-[60%] w-full h-[300px] sm:h-[380px] lg:h-auto overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={p.id}
              src={image}
              alt={p.title}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </AnimatePresence>

          {/* Nav arrows on image */}
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/50 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background/80 transition-colors z-10"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/50 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background/80 transition-colors z-10 lg:hidden"
            aria-label="Próximo"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Counter */}
          <div className="absolute bottom-4 left-4 bg-background/60 backdrop-blur-sm text-foreground text-xs px-3 py-1.5 rounded-full z-10">
            {current + 1} / {properties.length}
          </div>
        </div>

        {/* Details side */}
        <div className="lg:w-[40%] w-full bg-cream-100 flex flex-col items-center justify-center px-6 sm:px-10 lg:px-12 py-8 lg:py-12 relative" style={{ backgroundColor: "hsl(30, 30%, 95%)" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="text-center max-w-sm"
            >
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight mb-3 uppercase tracking-wide">
                {p.title}
              </h2>

              {tagline && (
                <p className="text-muted-foreground text-xs sm:text-sm uppercase tracking-[0.15em] mb-5 leading-relaxed">
                  {tagline.length > 80 ? tagline.slice(0, 80) + "…" : tagline}
                </p>
              )}

              {specs.length > 0 && (
                <p className="text-foreground font-semibold text-sm sm:text-base tracking-wide mb-2 uppercase">
                  {specs.join(" | ")}
                </p>
              )}

              {p.neighborhood && (
                <p className="text-muted-foreground text-xs uppercase tracking-[0.15em] mb-6">
                  {p.neighborhood}{p.city ? `, ${p.city}` : ""}
                </p>
              )}

              {p.price > 0 && (
                <p className="text-secondary font-bold text-lg mb-6">{formatPrice(p.price)}</p>
              )}

              <Link
                to={`/imovel/${p.id}`}
                className="inline-block bg-primary text-primary-foreground font-semibold text-sm px-8 py-3 rounded-lg hover:bg-navy-light transition-colors"
              >
                Ver Detalhes
              </Link>
            </motion.div>
          </AnimatePresence>

          {/* Right arrow on details panel (desktop) */}
          <button
            onClick={next}
            className="hidden lg:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/50 backdrop-blur-sm items-center justify-center text-foreground hover:bg-background/80 transition-colors"
            aria-label="Próximo"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots */}
          <div className="flex gap-1.5 mt-6">
            {properties.slice(0, 12).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === current ? "bg-secondary w-5" : "bg-foreground/20"}`}
                aria-label={`Ir para ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PropertyShowcase;
