import { useState } from "react";
import { motion } from "framer-motion";
import { useSiteContent } from "@/hooks/useSiteContent";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";
import SearchFilters from "@/components/SearchFilters";

const HeroSection = () => {
  const { get } = useSiteContent();
  const hero = get("hero");
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterTransaction, setFilterTransaction] = useState("all");
  const [filterNeighborhood, setFilterNeighborhood] = useState("all");
  const [filterBedrooms, setFilterBedrooms] = useState("all");
  const [filterPrice, setFilterPrice] = useState("all");

  const handleContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (search.trim()) params.set("q", search.trim());
    if (filterType !== "all") params.set("type", filterType);
    if (filterTransaction !== "all") params.set("transaction", filterTransaction);
    if (filterNeighborhood !== "all") params.set("neighborhood", filterNeighborhood);
    if (filterBedrooms !== "all") params.set("bedrooms", filterBedrooms);
    if (filterPrice !== "all") params.set("price", filterPrice);
    const qs = params.toString();
    navigate(qs ? `/imoveis?${qs}` : "/imoveis");
  };

  return (
    <section className="relative min-h-[55svh] flex items-center justify-center overflow-hidden">
      <img
        src={heroBg}
        alt="Imóveis de luxo no Rio de Janeiro"
        width={1920}
        height={1080}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-primary/75" />

      <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6"
        >
          <span className="text-xs sm:text-sm text-secondary tracking-[0.3em] uppercase font-body font-medium">
            Lançamentos Exclusivos
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-3xl sm:text-5xl lg:text-6xl font-display font-bold text-primary-foreground leading-[1.15] mb-4"
        >
          Encontre o imóvel dos seus{" "}
          <span className="text-secondary italic">sonhos</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="text-primary-foreground/70 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto mb-8 font-body leading-relaxed"
        >
          Seleção com curadoria dos melhores lançamentos imobiliários.
          <br className="hidden sm:block" />
          Atendimento personalizado e consultoria especializada.
        </motion.p>

        {/* Search filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="max-w-4xl mx-auto mb-8"
        >
          <div className="bg-card/95 backdrop-blur-sm rounded-xl shadow-xl p-4 border border-border/50">
            <SearchFilters
              search={search}
              onSearchChange={setSearch}
              filterType={filterType}
              onFilterTypeChange={setFilterType}
              filterTransaction={filterTransaction}
              onFilterTransactionChange={setFilterTransaction}
              filterNeighborhood={filterNeighborhood}
              onFilterNeighborhoodChange={setFilterNeighborhood}
              filterBedrooms={filterBedrooms}
              onFilterBedroomsChange={setFilterBedrooms}
              filterPrice={filterPrice}
              onFilterPriceChange={setFilterPrice}
              neighborhoods={[]}
              hideSearch
            />
            <Button
              onClick={handleSearch}
              className="w-full mt-3 bg-secondary text-secondary-foreground hover:bg-orange-hover font-semibold rounded-lg py-3 shadow-md"
            >
              Buscar Imóveis
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button
            asChild
            className="bg-secondary text-secondary-foreground hover:bg-orange-hover font-semibold rounded-lg px-8 py-3 shadow-md shadow-secondary/20 hover:shadow-lg hover:shadow-secondary/30 transition-all duration-300 text-sm sm:text-base"
          >
            <Link to="/imoveis">Ver Todos os Imóveis</Link>
          </Button>

          <Button
            onClick={handleContact}
            className="bg-primary-foreground/15 text-primary-foreground font-semibold rounded-lg px-8 py-3 hover:bg-primary-foreground/25 border border-primary-foreground/20 backdrop-blur-sm transition-all duration-300 text-sm sm:text-base"
          >
            Falar Conosco
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
