import { Building, Users, MapPin, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { useSiteContent } from "@/hooks/useSiteContent";
import heroImageFallback from "@/assets/hero-building.jpg";

const iconMap: Record<string, any> = { Users, Building, MapPin };

const HeroSection = () => {
  const { get, loading } = useSiteContent();
  const hero = get("hero");

  const heroImage = hero.content.hero_image || heroImageFallback;
  const titleParts = hero.title?.split(hero.content.title_highlight || "") || [hero.title];
  const stats = hero.content.stats || [];

  return (
    <>
      <section className="relative min-h-[92svh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Edifício de luxo" className="w-full h-full object-cover scale-105" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-to-b from-navy-dark/60 via-navy-dark/70 to-navy-dark/90" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-dark/50 to-transparent" />
        </div>

        <div className="absolute top-20 right-10 w-48 sm:w-72 h-48 sm:h-72 bg-secondary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-10 w-36 sm:w-56 h-36 sm:h-56 bg-secondary/5 rounded-full blur-3xl" />

        <div className="relative z-10 text-center px-4 sm:px-6 max-w-5xl mx-auto pt-20 pb-24">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-md border border-primary-foreground/10 rounded-full px-4 py-1.5 mb-8">
            <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span className="text-xs text-primary-foreground/80 font-body tracking-wide">{hero.content.badge_text}</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-heading font-bold text-primary-foreground leading-[1.1] mb-6">
            {titleParts[0]}
            {hero.content.title_highlight && (
              <>
                <br />
                <span className="text-secondary">{hero.content.title_highlight}</span>
              </>
            )}
            {titleParts[1] || ""}
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.45 }}
            className="text-primary-foreground/60 text-base sm:text-lg max-w-2xl mx-auto mb-6 font-body leading-relaxed">
            {hero.subtitle}
          </motion.p>


        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-2 cursor-pointer group">
            <span className="text-[10px] text-primary-foreground/40 tracking-widest uppercase font-body">Explorar</span>
            <ChevronDown className="w-4 h-4 text-primary-foreground/40 group-hover:text-secondary transition-colors" />
          </motion.div>
        </motion.div>
      </section>

      <section className="relative z-20 bg-primary" aria-label="Números da imobiliária">
        <div className="container-main px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.8 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 lg:gap-12">
            {stats.map((stat: any, i: number) => {
              const Icon = iconMap[Object.keys(iconMap)[i % Object.keys(iconMap).length]] || Building;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.9 + i * 0.1 }}
                  className="flex flex-col items-center text-center group">
                  <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl bg-primary-foreground/10 flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-primary-foreground/15 transition-colors">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-secondary" />
                  </div>
                  <span className="text-xl sm:text-2xl lg:text-3xl font-heading font-bold text-primary-foreground">{stat.value}</span>
                  <span className="text-[10px] sm:text-[11px] text-primary-foreground/50 mt-1 font-body tracking-widest">{stat.label}</span>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default HeroSection;
