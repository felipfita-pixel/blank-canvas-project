import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getStaticProperty } from "@/data/staticProperties";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ChatWidget from "@/components/ChatWidget";

import BrokerChatPanel from "@/components/BrokerChatPanel";
import ImageLightbox from "@/components/ImageLightbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bed, Bath, Maximize, Car, MapPin, ArrowLeft, ChevronLeft, ChevronRight, MessageCircle, Share2, Heart } from "lucide-react";
const placeholderImage = "/placeholder.svg";

interface Property {
  id: string;
  title: string;
  description: string | null;
  price: number;
  property_type: string;
  transaction_type: string;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  address: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  suites: number | null;
  parking_spots: number | null;
  area: number | null;
  images: string[] | null;
  featured: boolean | null;
  broker_id: string | null;
}

interface Broker {
  id: string;
  full_name: string;
  creci: string | null;
  phone: string;
  avatar_url: string | null;
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

const PropertyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [broker, setBroker] = useState<Broker | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      const staticProp = getStaticProperty(id);
      if (staticProp) {
        setProperty({
          id: staticProp.id,
          title: staticProp.title,
          description: staticProp.description,
          price: staticProp.price,
          property_type: staticProp.property_type,
          transaction_type: staticProp.transaction_type,
          neighborhood: staticProp.neighborhood,
          city: staticProp.city,
          state: staticProp.state,
          address: staticProp.address,
          bedrooms: staticProp.bedrooms,
          bathrooms: staticProp.bathrooms,
          suites: null,
          parking_spots: staticProp.parking_spots,
          area: staticProp.area,
          images: staticProp.images,
          featured: true,
          broker_id: null,
        });
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("properties")
        .select("*")
        .eq("id", id)
        .eq("active", true)
        .single();

      if (data) {
        setProperty(data as Property);
        if (data.broker_id) {
          const { data: brokerData } = await supabase
            .from("brokers_public")
            .select("id, full_name, creci, avatar_url")
            .eq("id", data.broker_id)
            .single();
          if (brokerData) setBroker(brokerData as Broker);
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-24 text-center py-20 text-muted-foreground">Carregando...</div>
        <Footer />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-24 text-center py-20">
          <p className="text-xl font-semibold text-foreground mb-2">Imóvel não encontrado</p>
          <p className="text-muted-foreground mb-6">Este imóvel pode ter sido removido ou desativado.</p>
          <Link to="/imoveis">
            <Button className="bg-primary text-primary-foreground"><ArrowLeft className="w-4 h-4 mr-2" />Voltar aos imóveis</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const images = property.images && property.images.length > 0 ? property.images : [placeholderImage];
  const lightboxImages = images.map((src, i) => ({ src, alt: `${property.title} - Foto ${i + 1}` }));
  const location = [property.address, property.neighborhood, property.city, property.state].filter(Boolean).join(", ");

  const prevImage = () => setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  const nextImage = () => setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));

  const whatsappMessage = encodeURIComponent(`Olá! Tenho interesse no imóvel "${property.title}". Podemos conversar?`);
  const whatsappLink = `https://wa.me/5521975316631?text=${whatsappMessage}`;

  const details = [
    { icon: Bed, label: "Quartos", value: property.bedrooms },
    { icon: Bath, label: "Banheiros", value: property.bathrooms },
    { icon: Bed, label: "Suítes", value: property.suites },
    { icon: Car, label: "Vagas", value: property.parking_spots },
    { icon: Maximize, label: "Área", value: property.area ? `${property.area}m²` : null },
  ].filter((d) => d.value);

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-x-0 top-0 z-50 bg-primary shadow-lg shadow-primary/30">
        <Header />
      </div>

      <div className="pt-20">
        {/* Gallery */}
        <div className="relative bg-primary/5">
          <div className="container-main px-4 sm:px-6 lg:px-8 py-4">
            <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
          </div>
          <div className="container-main px-4 sm:px-6 lg:px-8">
          <div
            className="relative aspect-[16/9] max-h-[500px] overflow-hidden cursor-pointer rounded-xl"
            onClick={() => setLightboxOpen(true)}
          >
            <img
              src={images[currentImage]}
              alt={property.title}
              className="w-full h-full object-cover"
            />
            {images.length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors shadow-lg">
                  <ChevronLeft className="w-5 h-5 text-foreground" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors shadow-lg">
                  <ChevronRight className="w-5 h-5 text-foreground" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => { e.stopPropagation(); setCurrentImage(i); }}
                      className={`w-2.5 h-2.5 rounded-full transition-colors ${i === currentImage ? "bg-secondary" : "bg-card/60"}`}
                    />
                  ))}
                </div>
              </>
            )}
            <div className="absolute top-4 right-4 flex gap-2">
              <button onClick={(e) => e.stopPropagation()} className="w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors shadow-lg">
                <Heart className="w-5 h-5 text-foreground" />
              </button>
              <button onClick={(e) => e.stopPropagation()} className="w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors shadow-lg">
                <Share2 className="w-5 h-5 text-foreground" />
              </button>
            </div>
            {/* Click to enlarge hint */}
            <span className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full">
              📷 Clique para ampliar{images.length > 1 ? ` • ${images.length} fotos` : ""}
            </span>
          </div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="container-main px-4 sm:px-6 lg:px-8 py-3">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => { setCurrentImage(i); setLightboxOpen(true); }}
                    className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-colors ${i === currentImage ? "border-secondary" : "border-transparent opacity-60 hover:opacity-100"}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="container-main px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-[1fr_360px] gap-8">
            {/* Main */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant="outline" className="text-xs">{propertyTypeLabels[property.property_type] || property.property_type}</Badge>
                <Badge variant="outline" className="text-xs">{property.transaction_type === "rent" ? "Aluguel" : "Venda"}</Badge>
                {property.featured && <Badge className="bg-secondary text-secondary-foreground text-xs">Destaque</Badge>}
              </div>

              <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">{property.title}</h1>

              {location && (
                <p className="flex items-center gap-1 text-muted-foreground mb-4">
                  <MapPin className="w-4 h-4" /> {location}
                </p>
              )}

              {property.price > 0 && (
                <p className="text-3xl font-bold text-secondary mb-8">
                  {formatPrice(property.price)}{property.transaction_type === "rent" ? "/mês" : ""}
                </p>
              )}

              {/* Details grid */}
              {details.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-8">
                  {details.map((d, i) => (
                    <div key={i} className="bg-muted/50 rounded-xl p-4 text-center">
                      <d.icon className="w-5 h-5 text-primary mx-auto mb-1" />
                      <p className="text-lg font-bold text-foreground">{d.value}</p>
                      <p className="text-xs text-muted-foreground">{d.label}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Description */}
              {property.description && (
                <div className="mb-8">
                  <h2 className="text-xl font-heading font-bold text-foreground mb-3">Descrição</h2>
                  <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line">
                    {property.description}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Broker card */}
              {broker && (
                <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Corretor responsável</p>
                  <div className="flex items-center gap-3 mb-4">
                    {broker.avatar_url ? (
                      <img src={broker.avatar_url} alt={broker.full_name} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold text-lg">
                        {broker.full_name[0]}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-foreground">{broker.full_name}</p>
                      {broker.creci && <p className="text-xs text-muted-foreground">CRECI: {broker.creci}</p>}
                    </div>
                  </div>
                  <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg">
                      <MessageCircle className="w-4 h-4 mr-2" /> Falar no WhatsApp
                    </Button>
                  </a>
                </div>
              )}

              {/* CTA */}
              <div className="bg-primary rounded-xl p-5 text-primary-foreground">
                <h3 className="font-heading font-bold text-lg mb-2">Interessado neste imóvel?</h3>
                <p className="text-primary-foreground/70 text-sm mb-4">Entre em contato e agende uma visita.</p>
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full bg-secondary text-secondary-foreground hover:bg-orange-hover rounded-lg font-semibold">
                    <MessageCircle className="w-4 h-4 mr-2" /> Agendar Visita
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ImageLightbox
        images={lightboxImages}
        currentIndex={currentImage}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={(i) => { setCurrentImage(i); }}
        propertyTitle={property.title}
        propertyId={property.id}
      />

      <Footer />
      <WhatsAppButton />
      <ChatWidget />
      
      <BrokerChatPanel />
    </div>
  );
};

export default PropertyDetail;
