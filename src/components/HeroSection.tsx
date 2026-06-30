import { motion } from "framer-motion";
import { useSiteContent } from "@/hooks/useSiteContent";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-palestra.png";

const HeroSection = () => {
  const { get } = useSiteContent();
  const hero = get("hero");

  const handleContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="relative min-h-[70svh] flex items-end overflow-hidden">
      <img
        src={heroBg}
        alt="Apresentação Ilha Pura Park - Barra da Tijuca"
        width={1920}
        height={1080}
        className="absolute inset-0 w-full h-full object-cover object-[20%_center] md:object-[30%_center]"
      />
      {/* Gradient overlay — darker on the right to protect text, lighter over the face on the left */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-primary/50 to-primary/85" />
      <div className="absolute inset-0 md:hidden bg-primary/55" />

      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-16">
        <div className="container-main">
          <div className="max-w-xl md:ml-auto text-center md:text-right">
            <motion.a
              href="https://ilhapura.app"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 mb-5 text-primary-foreground/90 hover:text-secondary text-xs sm:text-sm font-body tracking-[0.25em] uppercase underline underline-offset-4 decoration-secondary/60 hover:decoration-secondary transition-colors"
            >
              <img
                src="https://ilhapura.app/favicon.ico"
                alt="Ilha Pura"
                className="w-5 h-5 rounded-full object-cover border border-secondary/40"
              />
              Lançamento Ilha Pura
            </motion.a>


            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center md:justify-end justify-center gap-4"
            >
              <span className="text-xs sm:text-sm font-display font-bold text-primary-foreground leading-tight text-center sm:text-right max-w-[160px]">
                O endereço mais desejado da{" "}
                <span className="text-secondary italic">Barra da Tijuca</span>
              </span>

              <Button
                asChild
                className="bg-secondary text-secondary-foreground hover:bg-orange-hover font-semibold rounded-lg px-8 py-3 shadow-md shadow-secondary/20 hover:shadow-lg hover:shadow-secondary/30 transition-all duration-300 text-sm sm:text-base"
              >
                <Link to="/imoveis">Ver Imóveis</Link>
              </Button>

              <Button
                onClick={handleContact}
                className="bg-primary-foreground/15 text-primary-foreground font-semibold rounded-lg px-8 py-3 hover:bg-primary-foreground/25 border border-primary-foreground/20 backdrop-blur-sm transition-all duration-300 text-sm sm:text-base"
              >
                Falar Conosco
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
