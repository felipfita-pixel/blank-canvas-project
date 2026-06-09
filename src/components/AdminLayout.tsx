import { NavLink, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard, Users, Building2, FileText, Mail, ShieldCheck, LogOut, Settings, Landmark, Home, MessageSquare,
  Wifi, WifiOff, Menu as MenuIcon, X as CloseIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReactNode, useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const menuItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Corretores", url: "/admin/brokers", icon: Users },
  { title: "Imobiliárias", url: "/admin/companies", icon: Landmark },
  { title: "Imóveis", url: "/admin/properties", icon: Building2 },
  { title: "Conteúdo do Site", url: "/admin/content", icon: FileText },
  { title: "Mensagens", url: "/admin/messages", icon: Mail },
  { title: "Chat ao Vivo", url: "/admin/chat", icon: MessageSquare },
  { title: "Administradores", url: "/admin/users", icon: ShieldCheck },
  { title: "Configurações", url: "/admin/settings", icon: Settings },
  { title: "Documentação", url: "/admin/documentation", icon: FileText },
];

function BrokerAvailabilityToggle() {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchStatus = async () => {
      const { data } = await supabase
        .from("broker_presence")
        .select("is_online")
        .eq("user_id", user.id)
        .maybeSingle();
      setIsOnline(data?.is_online ?? false);
      setLoading(false);
    };
    fetchStatus();

    const channel = supabase
      .channel("my-presence-status")
      .on("postgres_changes", {
        event: "*", schema: "public", table: "broker_presence",
        filter: `user_id=eq.${user.id}`,
      }, (payload: any) => {
        if (payload.new?.is_online !== undefined) {
          setIsOnline(payload.new.is_online);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const toggle = useCallback(async () => {
    if (!user) return;
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    await supabase.from("broker_presence").upsert(
      { user_id: user.id, is_online: newStatus, last_seen_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );
  }, [user, isOnline]);

  if (loading || !user) return null;

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 border ${
        isOnline
          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
          : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
      }`}
    >
      {isOnline ? (
        <>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <Wifi className="w-3.5 h-3.5" />
          Disponível
        </>
      ) : (
        <>
          <span className="relative flex h-2 w-2">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-muted-foreground/40" />
          </span>
          <WifiOff className="w-3.5 h-3.5" />
          Indisponível
        </>
      )}
    </button>
  );
}

function AdminSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-navy text-white flex flex-col border-r border-white/10 transform transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-5 border-b border-white/10 flex items-start justify-between">
          <div>
            <h2 className="font-heading font-bold text-lg text-white">FF Imobiliária</h2>
            <p className="text-xs text-white/50 mt-1 truncate">{user?.email}</p>
          </div>
          <button onClick={onClose} className="md:hidden text-white/70 hover:text-white" aria-label="Fechar">
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="px-3 pt-4 pb-2">
          <p className="text-white/40 text-xs uppercase tracking-wider px-2">Menu</p>
        </div>

        <nav className="flex-1 px-3 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.title}>
                <NavLink
                  to={item.url}
                  end={item.url === "/admin"}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm ${
                      isActive
                        ? "bg-secondary text-secondary-foreground font-semibold"
                        : "text-white/80 hover:bg-white/10 hover:text-white"
                    }`
                  }
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span>{item.title}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/80 hover:bg-destructive/20 hover:text-destructive w-full transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
}

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen flex w-full">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 flex items-center justify-between border-b border-border bg-card px-4">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden mr-3 p-2 rounded-md hover:bg-muted"
              aria-label="Abrir menu"
            >
              <MenuIcon className="w-5 h-5" />
            </button>
            <span className="text-sm font-semibold text-foreground">Painel Administrativo</span>
          </div>
          <div className="flex items-center gap-3">
            <BrokerAvailabilityToggle />
            <Button variant="outline" size="sm" asChild>
              <Link to="/">
                <Home className="w-4 h-4 mr-1" />
                Voltar ao Site
              </Link>
            </Button>
          </div>
        </header>
        <main className="flex-1 p-6 bg-muted/30 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
