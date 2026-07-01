import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero-padrao.jpg";

const HeroSection = () => {
  const handleContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-primary">
      {/* Background image */}
      <img
        src={heroImg}
        alt="Residência de alto padrão com vista panorâmica ao entardecer"
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Gradient overlays for legibility around content */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />

      {/* Top-left: Ilha Pura link */}
      <motion.a
        href="https://ilhapura.app"
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="absolute top-24 left-4 sm:left-8 lg:left-12 z-10 inline-flex items-center gap-2 text-white/95 hover:text-secondary text-xs sm:text-sm font-body tracking-[0.25em] uppercase underline underline-offset-4 decoration-secondary/70 hover:decoration-secondary transition-colors"
      >
        <img
          src="https://ilhapura.app/favicon.ico"
          alt="Ilha Pura"
          className="w-5 h-5 rounded-full object-cover border border-secondary/50"
        />
        Lançamento Ilha Pura
      </motion.a>

      {/* Left side: headline + description + buttons */}
      <div className="relative z-10 min-h-screen flex items-center px-4 sm:px-8 lg:px-12">
        <div className="max-w-xl">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-white leading-[1.1] drop-shadow-lg"
          >
            Viva o <span className="italic text-secondary">alto padrão</span> do Rio de Janeiro
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-6 text-white/90 text-sm sm:text-base lg:text-lg font-body leading-relaxed max-w-md drop-shadow"
          >
            Consultoria especializada em imóveis exclusivos. Curadoria dos
            melhores lançamentos com atendimento personalizado.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-3"
          >
            <Button
              asChild
              className="bg-secondary text-secondary-foreground hover:bg-orange-hover font-semibold rounded-lg px-8 py-3 shadow-lg shadow-secondary/30 transition-all duration-300"
            >
              <Link to="/imoveis">Ver Imóveis</Link>
            </Button>
            <Button
              onClick={handleContact}
              className="bg-white/10 text-white font-semibold rounded-lg px-8 py-3 hover:bg-white/20 border border-white/30 backdrop-blur-md transition-all duration-300"
            >
              Falar Conosco
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Bottom-right: signature tagline */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.9 }}
        className="absolute bottom-8 right-4 sm:right-8 lg:right-12 z-10 text-right"
      >
        <p className="text-white/80 text-[10px] sm:text-xs font-body tracking-[0.3em] uppercase">
          Barra da Tijuca · Leblon · Ipanema
        </p>
        <p className="text-secondary text-xs sm:text-sm font-display italic mt-1">
          FF Imobiliária — Consultoria de alto padrão
        </p>
      </motion.div>
    </section>
  );
};

export default HeroSection;
