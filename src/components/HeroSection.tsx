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
    <section className="relative min-h-[45svh] flex items-center justify-center bg-primary overflow-hidden">
      {/* Subtle decorative elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-secondary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-56 h-56 bg-secondary/5 rounded-full blur-3xl" />

      <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <span className="text-xs sm:text-sm text-secondary tracking-[0.3em] uppercase font-body font-medium">
            Lançamentos Exclusivos
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-3xl sm:text-5xl lg:text-6xl font-display font-bold text-primary-foreground leading-[1.15] mb-6"
        >
          Encontre o imóvel dos seus{" "}
          <span className="text-secondary italic">sonhos</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="text-primary-foreground/60 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto mb-10 font-body leading-relaxed"
        >
          Seleção com curadoria dos melhores lançamentos imobiliários.
          <br className="hidden sm:block" />
          Atendimento personalizado e consultoria especializada.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button
            asChild
            className="bg-secondary text-secondary-foreground hover:bg-orange-hover font-semibold rounded-lg px-8 py-3 shadow-md shadow-secondary/20 hover:shadow-lg hover:shadow-secondary/30 transition-all duration-300 text-sm sm:text-base"
          >
            <Link to="/imoveis">Ver Imóveis</Link>
          </Button>

          <Button
            onClick={handleContact}
            className="bg-primary-foreground text-primary font-semibold rounded-lg px-8 py-3 hover:bg-primary-foreground/90 shadow-md transition-all duration-300 text-sm sm:text-base"
          >
            Falar Conosco
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
