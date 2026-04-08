import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { staticProperties } from "@/data/staticProperties";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageMeta from "@/components/PageMeta";
import { useFavorites } from "@/hooks/useFavorites";
import FavoriteButton from "@/components/FavoriteButton";
import WatermarkImage from "@/components/WatermarkImage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bed, Maximize, Car, MapPin, ArrowRight, Heart } from "lucide-react";
import { getPropertyStatus, statusConfig } from "@/lib/propertyStatus";
import PropertyShareButtons from "@/components/PropertyShareButtons";
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

const Favorites = () => {
  const { favoriteIds, isFavorite, toggleFavorite, loading: favsLoading } = useFavorites();
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProps = async () => {
      const { data } = await supabase
        .from("properties")
        .select("*")
        .eq("active", true);

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
      const merged = [
        ...dbProperties,
        ...staticAsProperties.filter(
          (sp) => !dbProperties.some((dp) => dp.title === sp.title)
        ),
      ];
      setAllProperties(merged);
      setLoading(false);
    };
    fetchProps();
  }, []);

  const favoriteProperties = useMemo(() => {
    return allProperties.filter((p) => favoriteIds.has(p.id));
  }, [allProperties, favoriteIds]);

  return (
    <div className="min-h-screen bg-background">
      <PageMeta
        title="Meus Favoritos | Corretores Associados & FF"
        description="Veja os imóveis que você salvou como favoritos."
        path="/favoritos"
      />
      <Header />

      <div className="bg-primary pt-24 pb-12">
        <div className="container-main">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-primary-foreground mb-2 flex items-center gap-3">
            <Heart className="w-8 h-8 fill-current" /> Meus Favoritos
          </h1>
          <p className="text-primary-foreground/70">Imóveis que você salvou para ver depois.</p>
        </div>
      </div>

      <div className="container-main py-10">
        {loading || favsLoading ? (
          <div className="text-center py-20 text-muted-foreground">Carregando...</div>
        ) : favoriteProperties.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Heart className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-semibold mb-2">Nenhum favorito salvo</p>
            <p className="text-sm mb-6">Clique no ❤️ nos imóveis para salvá-los aqui.</p>
            <Link to="/imoveis">
              <Button>Ver Imóveis</Button>
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-6">
              {favoriteProperties.length} imóvel(is) salvo(s)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteProperties.map((p) => (
                <div key={p.id} className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <WatermarkImage
                      src={p.images && p.images.length > 0 ? p.images[0] : propertyCondo}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    {(() => {
                      const status = getPropertyStatus(p.title, p.description);
                      if (status) return (
                        <Badge className={`absolute top-3 left-3 ${statusConfig[status].className}`}>
                          {statusConfig[status].label}
                        </Badge>
                      );
                      return null;
                    })()}
                    <FavoriteButton
                      isFavorite={isFavorite(p.id)}
                      onToggle={() => toggleFavorite(p.id)}
                      className="absolute top-3 right-3"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-heading font-bold text-foreground mb-1 line-clamp-1">{p.title}</h3>
                    <p className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      {p.neighborhood ? `${p.neighborhood}${p.city ? `, ${p.city}` : ''}` : p.city || ''}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-muted-foreground text-xs mb-3">
                      {p.bedrooms ? <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5" /> {p.bedrooms}q</span> : null}
                      {p.area ? <span className="flex items-center gap-1"><Maximize className="w-3.5 h-3.5" /> {p.area}m²</span> : null}
                      {p.parking_spots ? <span className="flex items-center gap-1"><Car className="w-3.5 h-3.5" /> {p.parking_spots}v</span> : null}
                    </div>
                    <div className="flex items-center justify-between">
                      {p.price > 0 && (
                        <p className="text-lg font-bold text-secondary">{formatPrice(p.price)}</p>
                      )}
                      <Link to={`/imovel/${p.id}`}>
                        <Button size="sm" variant="outline" className="rounded-full">
                          <ArrowRight className="w-4 h-4" />
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

      <Footer />
    </div>
  );
};

export default Favorites;
