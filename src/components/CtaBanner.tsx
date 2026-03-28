import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSiteContent } from "@/hooks/useSiteContent";
import { UserPlus, Building2 } from "lucide-react";
import CompanyRegisterModal from "@/components/CompanyRegisterModal";

const CtaBanner = () => {
  const { get } = useSiteContent();
  const cta = get("cta_banner");
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [companyType, setCompanyType] = useState<"imobiliaria" | "construtora">("imobiliaria");

  const openCompanyModal = (type: "imobiliaria" | "construtora") => {
    setCompanyType(type);
    setCompanyModalOpen(true);
  };

  return (
    <section className="bg-navy py-10">
      <div className="container-main px-4 sm:px-6 lg:px-8">
        <div className="border border-primary-foreground/20 rounded-2xl bg-navy-light/30 backdrop-blur-sm px-8 py-8 sm:px-12 sm:py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-6">
            <div className="flex-1">
              <h3 className="text-primary-foreground font-heading font-bold text-xl sm:text-2xl leading-snug">{cta.title}</h3>
              <p className="text-primary-foreground/70 font-body text-sm sm:text-base mt-2">{cta.subtitle}</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="bg-secondary text-secondary-foreground hover:bg-orange-hover rounded-xl px-6 py-3 font-semibold text-base h-auto">
              <Link to="/broker-register">
                <UserPlus className="w-4 h-4 mr-2" />
                Quero ser Corretor Associado
              </Link>
            </Button>
            <Button onClick={() => openCompanyModal("imobiliaria")} className="bg-primary-foreground text-navy hover:bg-primary-foreground/90 rounded-xl px-6 py-3 font-semibold text-base h-auto">
              <Building2 className="w-4 h-4 mr-2" />
              Cadastrar Imobiliária
            </Button>
            <Button onClick={() => openCompanyModal("construtora")} variant="outline" className="border-primary-foreground/40 text-primary hover:text-primary-foreground hover:bg-primary/80 rounded-xl px-6 py-3 font-semibold text-base h-auto hover:scale-105 transition-all duration-300">
              <Building2 className="w-4 h-4 mr-2" />
              Cadastrar Construtora
            </Button>
          </div>
        </div>
      </div>

      <CompanyRegisterModal open={companyModalOpen} onOpenChange={setCompanyModalOpen} type={companyType} />
    </section>
  );
};

export default CtaBanner;
