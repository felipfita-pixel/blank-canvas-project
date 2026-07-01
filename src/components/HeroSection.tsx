import { motion } from "framer-motion";
import { useSiteContent } from "@/hooks/useSiteContent";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  const { get } = useSiteContent();
  const hero = get("hero");

  const handleContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-primary">
      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-navy-dark/80" />

      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-16">
        <div className="container-main">
          <div className="max-w-xl mx-auto text-center">
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

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-primary-foreground/80 text-sm sm:text-base lg:text-lg max-w-lg mx-auto mb-8 font-body leading-relaxed"
            >
              Consultoria especializada em imóveis de alto padrão. Atendimento
              personalizado com curadoria dos melhores lançamentos.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3"
            >
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
