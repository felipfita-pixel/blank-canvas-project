import { NavLink, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard, Users, Building2, FileText, Mail, ShieldCheck, LogOut, Menu, Settings, Landmark, Home, MessageSquare,
  Wifi, WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger,
} from "@/components/ui/sidebar";
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

function AdminSidebar() {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <Sidebar className="border-r border-border">
      <SidebarContent className="bg-navy text-primary-foreground">
        <div className="p-5 border-b border-primary-foreground/10">
          <h2 className="font-heading font-bold text-lg text-primary-foreground">FF Imobiliária</h2>
          <p className="text-xs text-primary-foreground/50 mt-1 truncate">{user?.email}</p>
        </div>
        <SidebarGroup>
          <SidebarGroupLabel className="text-primary-foreground/40 text-xs uppercase tracking-wider">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/admin"}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm ${
                          isActive
                            ? "bg-secondary text-secondary-foreground font-semibold"
                            : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                        }`
                      }
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto p-4 border-t border-primary-foreground/10">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-primary-foreground/70 hover:bg-destructive/20 hover:text-destructive w-full transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair</span>
          </button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

const AdminLayout = ({ children }: { children: ReactNode }) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center justify-between border-b border-border bg-card px-4">
            <div className="flex items-center">
              <SidebarTrigger className="mr-4" />
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
    </SidebarProvider>
  );
};

export default AdminLayout;
