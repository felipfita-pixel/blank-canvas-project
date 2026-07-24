import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Building2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero-padrao.jpg";

const HeroSection = () => {
  const handleContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-primary">
      {/* Background image with parallax-like effect */}
      <motion.div 
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0 w-full h-full"
      >
        <img
          src={heroImg}
          alt="Residência de alto padrão com vista panorâmica ao entardecer"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </motion.div>

      {/* Decorative Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/40 to-transparent z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-black/20 z-10" />

      {/* Partners links - Repositioned for cleaner layout */}
      <div className="absolute bottom-12 left-4 sm:left-8 lg:left-12 z-30 flex gap-6">
        <motion.a
          href="https://ilhapura.app"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="group flex items-center gap-3 text-white/70 hover:text-secondary transition-colors"
        >
          <img
            src="https://ilhapura.app/favicon.ico"
            alt="Ilha Pura"
            className="w-6 h-6 rounded-full object-cover grayscale group-hover:grayscale-0 transition-all border border-white/20"
          />
          <span className="text-[10px] sm:text-xs font-body tracking-[0.2em] uppercase">Ilha Pura</span>
        </motion.a>

        <motion.a
          href="https://elo27.com/app/rede-social"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="group flex items-center gap-3 text-white/70 hover:text-secondary transition-colors"
        >
          <img
            src="https://elo27.com/favicon.ico"
            alt="Elo27"
            className="w-6 h-6 rounded-full object-cover grayscale group-hover:grayscale-0 transition-all border border-white/20"
          />
          <span className="text-[10px] sm:text-xs font-body tracking-[0.2em] uppercase">Elo27 Social</span>
        </motion.a>
      </div>

      {/* Main Content Area */}
      <div className="relative z-20 min-h-screen container-main flex flex-col justify-center px-4 sm:px-8 lg:px-12">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="w-12 h-[1px] bg-secondary" />
            <span className="text-secondary text-xs sm:text-sm font-body tracking-[0.4em] uppercase">Excelência Imobiliária</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-display text-5xl sm:text-7xl lg:text-8xl font-bold text-white leading-[1] tracking-tight mb-8"
          >
            Encontre seu imóvel ideal no <span className="italic font-medium text-secondary">Rio de Janeiro</span>.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-white/80 text-lg sm:text-xl font-body leading-relaxed max-w-xl mb-12"
          >
            Imóveis selecionados, lançamentos exclusivos e oportunidades de investimento com especialistas da região.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap items-center gap-4"
          >
            <Button
              asChild
              size="lg"
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold rounded-full px-8 py-6 text-xs tracking-[0.2em] uppercase shadow-2xl shadow-secondary/20 transition-all hover:scale-105 active:scale-95"
            >
              <Link to="/imoveis">Comprar Imóvel</Link>
            </Button>
            
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white/20 text-white hover:bg-white/10 font-bold rounded-full px-8 py-6 text-xs tracking-[0.2em] uppercase transition-all"
            >
              <Link to="/calculadora-investidor">Investir</Link>
            </Button>

            <Button
              asChild
              variant="ghost"
              size="lg"
              className="text-white hover:text-secondary hover:bg-transparent font-bold rounded-full px-8 py-6 text-xs tracking-[0.2em] uppercase transition-all"
            >
              <Link to="/imoveis?status=launch">Lançamentos</Link>
            </Button>

            <button
              onClick={handleContact}
              className="group flex items-center gap-3 text-white font-medium text-sm sm:text-base hover:text-secondary transition-colors px-4 py-2"
            >
              Falar com Especialista
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </button>
          </motion.div>
        </div>
      </div>

      {/* Side Brand Indicator */}
      <div className="hidden lg:block absolute right-12 top-1/2 -translate-y-1/2 z-20 [writing-mode:vertical-rl] text-white/20">
        <span className="text-[10px] font-body tracking-[1em] uppercase">FF Imobiliária Premium Services</span>
      </div>

      {/* Decorative Corner */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-white/5 to-transparent pointer-events-none" />
    </section>
  );
};

export default HeroSection;