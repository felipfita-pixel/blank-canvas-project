import { useState } from "react";
import { motion } from "framer-motion";
import { useSiteContent } from "@/hooks/useSiteContent";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  const { get } = useSiteContent();
  const hero = get("hero");
  const navigate = useNavigate();

  const [transaction, setTransaction] = useState<"sale" | "rent">("sale");
  const [query, setQuery] = useState("");
  const [propType, setPropType] = useState("all");

  const quickCities = [
    { label: "Rio de Janeiro", short: "RJ" },
    { label: "São Paulo", short: "SP" },
    { label: "Belo Horizonte", short: "BH" },
    { label: "Minas Gerais", short: "MG" },
  ];

  const propertyTypes = [
    { value: "all", label: "Todos os tipos" },
    { value: "apartment", label: "Apartamento" },
    { value: "house", label: "Casa" },
    { value: "commercial", label: "Comercial" },
    { value: "land", label: "Terreno" },
  ];

  const handleContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const params = new URLSearchParams();
    params.set("transaction", transaction);
    if (query.trim()) params.set("q", query.trim());
    if (propType !== "all") params.set("type", propType);
    navigate(`/imoveis?${params.toString()}`);
  };

  return (
    <section className="relative min-h-[60svh] flex items-center justify-center overflow-hidden">
      <img
        src={heroBg}
        alt="Imóveis de luxo no Rio de Janeiro"
        width={1920}
        height={1080}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-primary/75" />

      <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto w-full py-16">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-2"
        >
          <span className="text-xs sm:text-sm text-secondary tracking-[0.3em] uppercase font-body font-medium">
            Lançamentos Exclusivos
          </span>
        </motion.div>

        <motion.a
          href="https://ilhapura.app"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="inline-flex items-center gap-2 mb-6 text-primary-foreground/90 hover:text-secondary text-sm font-body tracking-wide underline underline-offset-4 decoration-secondary/60 hover:decoration-secondary transition-colors"
        >
          <img
            src="https://ilhapura.app/favicon.ico"
            alt="Ilha Pura"
            className="w-5 h-5 rounded-full object-cover border border-secondary/40"
          />
          Ilha Pura — Conheça o lançamento
        </motion.a>

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

        {/* Sawala-style search */}
        <motion.form
          onSubmit={handleSearch}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="bg-primary-foreground/10 backdrop-blur-md border border-primary-foreground/15 rounded-2xl p-3 sm:p-4 mb-6 shadow-xl shadow-primary/40"
        >
          {/* Transaction tabs */}
          <div className="flex items-center gap-1 mb-3 bg-primary/40 rounded-full p-1 w-fit mx-auto">
            <button
              type="button"
              onClick={() => setTransaction("sale")}
              className={`px-5 py-1.5 text-xs sm:text-sm font-semibold rounded-full transition-all ${
                transaction === "sale"
                  ? "bg-secondary text-secondary-foreground shadow-md"
                  : "text-primary-foreground/70 hover:text-primary-foreground"
              }`}
            >
              Venda
            </button>
            <button
              type="button"
              onClick={() => setTransaction("rent")}
              className={`px-5 py-1.5 text-xs sm:text-sm font-semibold rounded-full transition-all ${
                transaction === "rent"
                  ? "bg-secondary text-secondary-foreground shadow-md"
                  : "text-primary-foreground/70 hover:text-primary-foreground"
              }`}
            >
              Locação
            </button>
          </div>

          {/* Search row */}
          <div className="flex flex-col sm:flex-row gap-2 items-stretch">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cidade, bairro ou condomínio"
                className="pl-9 h-11 bg-background border-0 text-foreground placeholder:text-muted-foreground rounded-lg"
              />
            </div>
            <select
              value={propType}
              onChange={(e) => setPropType(e.target.value)}
              className="h-11 px-3 rounded-lg bg-background border-0 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-secondary sm:w-44"
            >
              {propertyTypes.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <Button
              type="submit"
              className="h-11 bg-secondary text-secondary-foreground hover:bg-orange-hover font-semibold rounded-lg px-6 shadow-md shadow-secondary/20"
            >
              <Search className="w-4 h-4 mr-2" />
              Buscar
            </Button>
          </div>
        </motion.form>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="flex flex-wrap items-center justify-center gap-2 mb-6"
        >
          <span className="text-primary-foreground/60 text-xs font-body mr-1">Cidades:</span>
          {quickCities.map((c) => (
            <button
              key={c.short}
              type="button"
              onClick={() => navigate(`/imoveis?q=${encodeURIComponent(c.label)}`)}
              className="px-3 py-1 rounded-full text-xs font-semibold bg-primary-foreground/15 text-primary-foreground border border-primary-foreground/20 hover:bg-secondary hover:text-secondary-foreground hover:border-secondary transition-all duration-200 backdrop-blur-sm"
            >
              {c.short}
            </button>
          ))}
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
