import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import CtaBanner from "@/components/CtaBanner";
import LifestyleSection from "@/components/LifestyleSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import ServicesSection from "@/components/ServicesSection";
import FeaturedProperties from "@/components/FeaturedProperties";
import WhereWeOperate from "@/components/WhereWeOperate";
import NeighborhoodsSection from "@/components/NeighborhoodsSection";
import ContactSection from "@/components/ContactSection";
import WhatsAppButton from "@/components/WhatsAppButton";
import ChatWidget from "@/components/ChatWidget";
import BrokerChatPanel from "@/components/BrokerChatPanel";

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
      <Header />
      <HeroSection />
      <AboutSection />
      <CtaBanner />
      <LifestyleSection />
      <TestimonialsSection />
      <ServicesSection />
      <FeaturedProperties />
      <NeighborhoodsSection />
      <ContactSection />
      <WhereWeOperate />
      <WhatsAppButton />
      <ChatWidget />
      <BrokerChatPanel />
    </div>
  );
};

export default Index;
