import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Home, LogOut, Wifi, WifiOff, User, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BrokerMetricsPanel from "@/components/BrokerMetricsPanel";

const BrokerDashboard = () => {
  const { user, signOut, role } = useAuth();
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [brokerName, setBrokerName] = useState("");
  const [stats, setStats] = useState({ conversations: 0, unread: 0 });

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      // Fetch presence
      const { data: presence } = await supabase
        .from("broker_presence")
        .select("is_online")
        .eq("user_id", user.id)
        .maybeSingle();
      setIsOnline(presence?.is_online ?? false);

      // Fetch broker info
      const { data: broker } = await supabase
        .from("brokers")
        .select("full_name, id")
        .eq("user_id", user.id)
        .maybeSingle();
      setBrokerName(broker?.full_name ?? "Corretor");

      // Fetch chat stats
      if (broker?.id) {
        const { count: totalCount } = await supabase
          .from("chat_messages")
          .select("conversation_id", { count: "exact", head: true })
          .eq("broker_id", broker.id);

        const { count: unreadCount } = await supabase
          .from("chat_messages")
          .select("id", { count: "exact", head: true })
          .eq("broker_id", broker.id)
          .eq("read", false)
          .eq("is_from_client", true);

        setStats({
          conversations: totalCount ?? 0,
          unread: unreadCount ?? 0,
        });
      }

      setLoading(false);
    };

    fetchData();

    // Listen for presence changes
    const channel = supabase
      .channel("broker-dashboard-presence")
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

  const toggleAvailability = useCallback(async () => {
    if (!user) return;
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    await supabase.from("broker_presence").upsert(
      { user_id: user.id, is_online: newStatus, last_seen_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );
  }, [user, isOnline]);

  const handleSignOut = async () => {
    if (user) {
      await supabase.from("broker_presence").upsert(
        { user_id: user.id, is_online: false, last_seen_at: new Date().toISOString() },
        { onConflict: "user_id" }
      );
    }
    await signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="h-16 flex items-center justify-between border-b border-border bg-card px-6 shadow-sm">
        <div className="flex items-center gap-3">
          <User className="w-5 h-5 text-primary" />
          <div>
            <h1 className="text-sm font-bold text-foreground">Painel do Corretor</h1>
            <p className="text-xs text-muted-foreground">{brokerName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link to="/">
              <Home className="w-4 h-4 mr-1" />
              Site
            </Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-1" />
            Sair
          </Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Availability Toggle Card */}
        <Card className="border-2 overflow-hidden">
          <CardHeader className={`transition-colors duration-300 ${
            isOnline ? "bg-emerald-50 border-b border-emerald-100" : "bg-muted/50 border-b"
          }`}>
            <CardTitle className="text-lg flex items-center gap-2">
              {isOnline ? (
                <Wifi className="w-5 h-5 text-emerald-600" />
              ) : (
                <WifiOff className="w-5 h-5 text-muted-foreground" />
              )}
              Status de Disponibilidade
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1 text-center sm:text-left">
                <p className="text-sm text-muted-foreground mb-1">
                  Você está atualmente:
                </p>
                <p className={`text-xl font-bold ${
                  isOnline ? "text-emerald-600" : "text-muted-foreground"
                }`}>
                  {isOnline ? "🟢 Disponível para Atendimento" : "🔴 Indisponível"}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {isOnline
                    ? "Clientes podem ver você online e iniciar conversas."
                    : "Você não aparece como disponível para os clientes."}
                </p>
              </div>

              <button
                onClick={toggleAvailability}
                className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 min-w-[180px] shadow-md hover:shadow-lg ${
                  isOnline
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-emerald-500 hover:bg-emerald-600 text-white"
                }`}
              >
                {isOnline ? "Ficar Indisponível" : "Ficar Disponível"}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Métricas de Desempenho */}
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3">📊 Suas Métricas</h2>
          <BrokerMetricsPanel />
        </div>

        {/* Stats básicos */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <MessageSquare className="w-6 h-6 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold text-foreground">{stats.conversations}</p>
              <p className="text-xs text-muted-foreground">Mensagens totais</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <MessageSquare className="w-6 h-6 mx-auto text-orange mb-2" />
              <p className="text-2xl font-bold text-foreground">{stats.unread}</p>
              <p className="text-xs text-muted-foreground">Não lidas</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default BrokerDashboard;