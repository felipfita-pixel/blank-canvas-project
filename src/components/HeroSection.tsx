import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSiteContent } from "@/hooks/useSiteContent";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  const { get } = useSiteContent();
  const hero = get("hero");
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [neighborhoods, setNeighborhoods] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  const quickCities = [
    { label: "Rio de Janeiro", short: "RJ" },
    { label: "São Paulo", short: "SP" },
    { label: "Belo Horizonte", short: "BH" },
    { label: "Minas Gerais", short: "MG" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from("properties")
        .select("neighborhood, city")
        .eq("active", true);
      const all = [...(data || []), ...staticProperties.map(p => ({ neighborhood: p.neighborhood, city: (p as any).city || null }))];
      setNeighborhoods([...new Set(all.map(p => p.neighborhood).filter(Boolean) as string[])].sort());
      setCities([...new Set(all.map(p => p.city).filter(Boolean) as string[])].sort());
    };
    fetchData();
  }, []);

  const handleSearch = (val: string) => {
    setSearch(val);
    if (val.length >= 2) {
      navigate(`/imoveis?search=${encodeURIComponent(val)}`);
    }
  };

  const handleContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
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



        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="max-w-2xl mx-auto mb-6"
        >
          <SearchAutocomplete
            value={search}
            onChange={handleSearch}
            neighborhoods={neighborhoods}
            cities={cities}
            propertyTitles={[]}
            placeholder="Buscar por bairro ou cidade..."
            className="[&_input]:bg-primary-foreground/15 [&_input]:text-primary-foreground [&_input]:placeholder:text-primary-foreground/50 [&_input]:border-primary-foreground/20 [&_input]:backdrop-blur-sm [&_svg]:text-primary-foreground/60"
          />
          <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
            <span className="text-primary-foreground/60 text-xs font-body mr-1">Cidades:</span>
            {quickCities.map((c) => (
              <button
                key={c.short}
                onClick={() => navigate(`/imoveis?search=${encodeURIComponent(c.label)}`)}
                className="px-3 py-1 rounded-full text-xs font-semibold bg-primary-foreground/15 text-primary-foreground border border-primary-foreground/20 hover:bg-secondary hover:text-secondary-foreground hover:border-secondary transition-all duration-200 backdrop-blur-sm"
              >
                {c.short}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.75 }}
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
