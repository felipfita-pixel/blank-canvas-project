import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import PropertyShowcase from "@/components/PropertyShowcase";
import AboutSection from "@/components/AboutSection";
import CtaBanner from "@/components/CtaBanner";
import LifestyleSection from "@/components/LifestyleSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import ServicesSection from "@/components/ServicesSection";
import FeaturedProperties from "@/components/FeaturedProperties";
import WhereWeOperate from "@/components/WhereWeOperate";
import NeighborhoodsSection from "@/components/NeighborhoodsSection";
import ContactSection from "@/components/ContactSection";
import VideosSection from "@/components/VideosSection";
import Footer from "@/components/Footer";
import PageMeta from "@/components/PageMeta";


const Index = () => {
  const location = useLocation();

  useEffect(() => {
    const pendingSection = sessionStorage.getItem("pendingScrollSection");
    if (!pendingSection) return;

    const timeout = window.setTimeout(() => {
      document.getElementById(pendingSection)?.scrollIntoView({ behavior: "smooth", block: "start" });
      sessionStorage.removeItem("pendingScrollSection");
    }, 150);

    return () => window.clearTimeout(timeout);
  }, [location.pathname]);

  return (
    <div className="min-h-screen">
      <PageMeta
        title="Corretores Associados & FF | Imóveis Barra da Tijuca, Recreio e Zona Sul RJ"
        description="Especialistas em imóveis prontos e lançamentos na Barra da Tijuca, Recreio, Ilha Pura, Península e Zona Sul do Rio de Janeiro."
        path="/"
      />
      <Header />
      <HeroSection />
      <PropertyShowcase />
      <AboutSection />
      <CtaBanner />
      <LifestyleSection />
      <TestimonialsSection />
      <ServicesSection />
      <FeaturedProperties />
      <NeighborhoodsSection />
      <VideosSection />
      <ContactSection />
      <WhereWeOperate />
      <Footer />
    </div>
  );
};

export default Index;
