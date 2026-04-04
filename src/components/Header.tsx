import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Building, Settings, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, isAdmin, signOut } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSectionNavigation = (sectionId: string) => {
    setMobileOpen(false);
    if (location.pathname === "/") {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    sessionStorage.setItem("pendingScrollSection", sectionId);
    navigate("/");
  };

  const handleSignOut = async () => {
    setMobileOpen(false);
    await signOut();
    navigate("/");
  };

  const renderAuthActions = (mobile = false) => {
    if (loading || !user) return null;

    const sharedLoginClassName = mobile
      ? "w-full justify-start rounded-lg px-3"
      : "h-9 rounded-full px-4";

    return (
      <>
        {isAdmin && (
          <Button variant="secondary" asChild className={sharedLoginClassName}>
            <Link to="/admin" onClick={() => setMobileOpen(false)}>
              <Settings className="w-4 h-4" />
              Painel Admin
            </Link>
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          onClick={() => void handleSignOut()}
          className={mobile
            ? "w-full justify-start rounded-lg px-3 text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground"
            : "h-9 rounded-full border border-primary-foreground/15 px-4 text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground"
          }
        >
          <LogOut className="w-4 h-4" />
          Sair
        </Button>
      </>
    );
  };

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-primary backdrop-blur-xl shadow-lg shadow-primary/30"
          : "bg-transparent"
      }`}
    >
      <div className="container-main flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16 sm:h-20">
        <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
          <Building className="w-8 h-8 text-secondary" />
          <div className="flex flex-col leading-none">
            <span className="font-display text-base sm:text-lg font-bold text-primary-foreground tracking-normal italic">
              Corretores Associados & FF
            </span>
            <span className="font-display text-[9px] sm:text-[10px] text-primary-foreground/50 tracking-[0.2em] uppercase mt-0.5">
              Consultor Imobiliário
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/imoveis"
            className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors duration-300 font-body font-medium"
          >
            Imóveis
          </Link>
          <button
            type="button"
            onClick={() => handleSectionNavigation("contact")}
            className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors duration-300 font-body font-medium"
          >
            Contato
          </button>
          <div className="flex items-center gap-2">{renderAuthActions()}</div>
        </nav>

        <button
          type="button"
          className="md:hidden w-9 h-9 rounded-lg bg-primary-foreground/10 flex items-center justify-center text-primary-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-primary backdrop-blur-xl border-t border-primary-foreground/10 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              <Link
                to="/imoveis"
                className="block text-primary-foreground/80 hover:text-primary-foreground py-2.5 px-3 rounded-lg transition-colors text-sm"
                onClick={() => setMobileOpen(false)}
              >
                Imóveis
              </Link>
              <button
                type="button"
                className="block w-full text-left text-primary-foreground/80 hover:text-primary-foreground py-2.5 px-3 rounded-lg transition-colors text-sm"
                onClick={() => handleSectionNavigation("contact")}
              >
                Contato
              </button>
              <div className="space-y-1 pt-2">{renderAuthActions(true)}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
