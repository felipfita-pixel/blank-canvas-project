import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import CtaBanner from "@/components/CtaBanner";
import LifestyleSection from "@/components/LifestyleSection";

import TestimonialsSection from "@/components/TestimonialsSection";
import ServicesSection from "@/components/ServicesSection";
import FeaturedProperties from "@/components/FeaturedProperties";
import WhereWeOperate from "@/components/WhereWeOperate";


import WhatsAppButton from "@/components/WhatsAppButton";
import ChatWidget from "@/components/ChatWidget";


const Index = () => {
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
      <WhereWeOperate />
      
      
      <WhatsAppButton />
      <ChatWidget />
    </div>
  );
};

export default Index;
