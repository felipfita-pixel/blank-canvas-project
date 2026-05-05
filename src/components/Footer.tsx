import { MapPin, Phone, Mail, LogIn, Settings } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useAuth } from "@/hooks/useAuth";
import SiteShareButtons from "@/components/SiteShareButtons";

const Footer = () => {
  const { get } = useSiteContent();
  const section = get("footer");
  const c = section.content;
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSectionNavigation = (sectionId: string) => {
    if (location.pathname === "/") {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    sessionStorage.setItem("pendingScrollSection", sectionId);
    navigate("/");
  };

  return (
    <footer className="bg-primary">
      <div className="container-main px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-12">
          <div>
            <h3 className="font-heading text-xl font-bold mb-1">
              <span className="text-secondary italic">CORRETORES</span>{" "}
              <span className="text-primary-foreground">ASSOCIADOS</span>
            </h3>
            <p className="text-primary-foreground/40 text-xs tracking-[0.2em] uppercase mb-4">{section.subtitle}</p>
            <p className="text-primary-foreground/60 text-sm leading-relaxed mb-6 max-w-sm">{c.description}</p>
            <div>
              <p className="text-primary-foreground/80 text-xs uppercase tracking-wider mb-3 font-semibold">Compartilhe nosso site</p>
              <SiteShareButtons />
            </div>
          </div>

          <div>
            <h4 className="font-heading font-bold text-primary-foreground text-lg mb-5">Links Rápidos</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/60">
              <li><button type="button" onClick={() => handleSectionNavigation("about")} className="hover:text-secondary transition-colors">Apresentação</button></li>
              <li><button type="button" onClick={() => handleSectionNavigation("lifestyle")} className="hover:text-secondary transition-colors">Ilha Pura</button></li>
              <li><button type="button" onClick={() => handleSectionNavigation("services")} className="hover:text-secondary transition-colors">Serviços</button></li>
              <li><Link to="/imoveis" className="hover:text-secondary transition-colors">Ver Imóveis</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-bold text-primary-foreground text-lg mb-5">Contato</h4>
            <ul className="space-y-4 text-sm text-primary-foreground/60">
              <li className="flex items-start gap-3"><MapPin className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" /><span>{c.address}</span></li>
              <li className="flex items-center gap-3"><Phone className="w-4 h-4 text-secondary flex-shrink-0" /><span>{c.phone}</span></li>
              <li className="flex items-center gap-3"><Mail className="w-4 h-4 text-secondary flex-shrink-0" /><span>{c.email}</span></li>
            </ul>
          </div>

          {/* Área do Corretor / Admin */}
          <div>
            <h4 className="font-heading font-bold text-primary-foreground text-lg mb-5">Área Restrita</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/60">
              {!user && (
                <>
                  <li>
                    <Link to="/login" state={{ roleHint: "broker" }} className="flex items-center gap-2 hover:text-secondary transition-colors">
                      <LogIn className="w-4 h-4" />
                      Login Corretor
                    </Link>
                  </li>
                  <li>
                    <Link to="/login" state={{ roleHint: "admin" }} className="flex items-center gap-2 hover:text-secondary transition-colors">
                      <Settings className="w-4 h-4" />
                      Painel Admin
                    </Link>
                  </li>
                </>
              )}
              <li>
                <Link to="/broker-register" className="flex items-center gap-2 hover:text-secondary transition-colors">
                  <LogIn className="w-4 h-4" />
                  Cadastrar como Corretor
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-primary-foreground/10">
        <div className="container-main px-4 sm:px-6 lg:px-8 py-6 text-center">
          <p className="text-xs text-primary-foreground/40">© 2026 Corretores Associados. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
