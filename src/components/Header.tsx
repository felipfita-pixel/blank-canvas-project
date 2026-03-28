import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, User, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import ScheduleModal from "@/components/ScheduleModal";

const navLinks = [
  { label: "Apresentação", href: "#about" },
  { label: "Bairros", href: "#neighborhoods" },
  { label: "Estilo de Vida", href: "#lifestyle" },
  { label: "Serviços", href: "#services" },
  { label: "Catálogo", href: "#featured" },
  { label: "Diferenciais", href: "#testimonials" },
  { label: "Contato", href: "#contact" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-navy backdrop-blur-xl shadow-lg shadow-navy-dark/30"
            : "bg-navy/80 backdrop-blur-md"
        }`}
      >
        <div className="container-main flex items-center justify-between px-3 sm:px-6 lg:px-8 h-14 sm:h-16">
          <a href="#" className="flex items-center gap-3 group flex-shrink-0">
            <div className="flex flex-col leading-none">
              <span className="font-heading text-xs sm:text-sm font-bold text-primary-foreground tracking-wide">
                CORRETORES <span className="text-secondary">ASSOCIADOS</span>
              </span>
              <span className="text-[8px] sm:text-[9px] text-primary-foreground/50 tracking-[0.15em] uppercase font-body mt-0.5">
                Consultoria Imobiliária FF
              </span>
            </div>
          </a>

          <nav className="hidden xl:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="relative text-[13px] text-primary-foreground/70 hover:text-primary-foreground px-3 py-2 rounded-lg hover:bg-primary-foreground/5 transition-all duration-300 uppercase tracking-wide font-body font-medium whitespace-nowrap"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden xl:flex items-center gap-3 flex-shrink-0">
            <Link
              to="/login"
              className="flex items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground text-[13px] font-body uppercase tracking-wide transition-colors"
            >
              <User className="w-4 h-4" />
              <span>Painel</span>
            </Link>
            <Button
              size="sm"
              onClick={() => setScheduleOpen(true)}
              className="bg-secondary text-secondary-foreground hover:bg-orange-hover font-semibold rounded-lg px-5 shadow-md shadow-secondary/20 hover:shadow-lg hover:shadow-secondary/30 transition-all duration-300 uppercase tracking-wide text-[13px]"
            >
              <CalendarCheck className="w-4 h-4 mr-1" />
              Agendar Consultoria
            </Button>
          </div>

          <button
            className="xl:hidden w-9 h-9 rounded-lg bg-primary-foreground/5 flex items-center justify-center text-primary-foreground"
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
              className="xl:hidden bg-navy backdrop-blur-xl border-t border-primary-foreground/5 overflow-hidden"
            >
              <div className="px-4 py-5 space-y-1">
                {navLinks.map((link, i) => (
                  <motion.a
                    key={link.label}
                    href={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="block text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/5 py-2.5 px-3 rounded-lg transition-colors uppercase text-sm tracking-wide"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </motion.a>
                ))}
                <div className="pt-3 space-y-2">
                  <Link
                    to="/login"
                    className="flex items-center gap-2 text-primary-foreground/70 py-2.5 px-3"
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm uppercase tracking-wide">Painel</span>
                  </Link>
                  <Button
                    onClick={() => { setMobileOpen(false); setScheduleOpen(true); }}
                    className="w-full bg-secondary text-secondary-foreground hover:bg-orange-hover rounded-lg shadow-md uppercase tracking-wide"
                  >
                    <CalendarCheck className="w-4 h-4 mr-2" />
                    Agendar Consultoria
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <ScheduleModal open={scheduleOpen} onOpenChange={setScheduleOpen} />
    </>
  );
};

export default Header;
