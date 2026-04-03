import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Home, LogOut, Wifi, WifiOff, User, MessageSquare, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import BrokerMetricsPanel from "@/components/BrokerMetricsPanel";

interface ClientHistory {
  conversation_id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  last_message: string;
  date: string;
  message_count: number;
}

const BrokerDashboard = () => {
  const { user, signOut, role } = useAuth();
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [brokerName, setBrokerName] = useState("");
  const [stats, setStats] = useState({ conversations: 0, unread: 0 });
  const [history, setHistory] = useState<ClientHistory[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const { data: presence } = await supabase
        .from("broker_presence")
        .select("is_online")
        .eq("user_id", user.id)
        .maybeSingle();
      setIsOnline(presence?.is_online ?? false);

      const { data: broker } = await supabase
        .from("brokers")
        .select("full_name, id")
        .eq("user_id", user.id)
        .maybeSingle();
      setBrokerName(broker?.full_name ?? "Corretor");

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

        setStats({ conversations: totalCount ?? 0, unread: unreadCount ?? 0 });

        // Fetch client history
        const { data: msgs } = await supabase
          .from("chat_messages")
          .select("conversation_id, sender_name, sender_email, sender_phone, message, created_at, is_from_client")
          .eq("broker_id", broker.id)
          .eq("is_from_client", true)
          .neq("conversation_id", "")
          .order("created_at", { ascending: false })
          .limit(200);

        if (msgs) {
          const convMap = new Map<string, ClientHistory>();
          for (const m of msgs) {
            const cid = m.conversation_id as string;
            if (!convMap.has(cid)) {
              convMap.set(cid, {
                conversation_id: cid,
                client_name: m.sender_name,
                client_email: m.sender_email,
                client_phone: m.sender_phone,
                last_message: m.message,
                date: m.created_at,
                message_count: 1,
              });
            } else {
              convMap.get(cid)!.message_count++;
            }
          }
          setHistory(Array.from(convMap.values()));
        }
      }

      setLoading(false);
    };

    fetchData();

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

  const formatDate = (d: string) => new Date(d).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit",
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
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

      <main className="max-w-3xl mx-auto p-6 space-y-6">
        {/* Availability Toggle Card */}
        <Card className="border-2 overflow-hidden">
          <CardHeader className={`transition-colors duration-300 ${
            isOnline ? "bg-emerald-50 border-b border-emerald-100" : "bg-muted/50 border-b"
          }`}>
            <CardTitle className="text-lg flex items-center gap-2">
              {isOnline ? <Wifi className="w-5 h-5 text-emerald-600" /> : <WifiOff className="w-5 h-5 text-muted-foreground" />}
              Status de Disponibilidade
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1 text-center sm:text-left">
                <p className="text-sm text-muted-foreground mb-1">Você está atualmente:</p>
                <p className={`text-xl font-bold ${isOnline ? "text-emerald-600" : "text-muted-foreground"}`}>
                  {isOnline ? "🟢 Disponível para Atendimento" : "🔴 Indisponível"}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {isOnline ? "Clientes podem ver você online e iniciar conversas." : "Você não aparece como disponível para os clientes."}
                </p>
              </div>
              <button
                onClick={toggleAvailability}
                className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 min-w-[180px] shadow-md hover:shadow-lg ${
                  isOnline ? "bg-red-500 hover:bg-red-600 text-white" : "bg-emerald-500 hover:bg-emerald-600 text-white"
                }`}
              >
                {isOnline ? "Ficar Indisponível" : "Ficar Disponível"}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Métricas */}
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3">📊 Suas Métricas</h2>
          <BrokerMetricsPanel />
        </div>

        {/* Stats */}
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

        {/* Histórico de Atendimentos */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Histórico de Atendimentos
              <Badge variant="outline" className="ml-auto text-xs">{history.length} clientes</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="max-h-[400px]">
              {history.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhum atendimento registrado ainda.</p>
              ) : (
                <div className="divide-y divide-border">
                  {history.map((h) => (
                    <div key={h.conversation_id} className="px-5 py-3 hover:bg-muted/30 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground">{h.client_name}</p>
                          <p className="text-[11px] text-muted-foreground">{h.client_phone} · {h.client_email}</p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1 italic">"{h.last_message}"</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1 justify-end">
                            <Clock className="w-3 h-3" /> {formatDate(h.date)}
                          </p>
                          <Badge variant="outline" className="text-[9px] mt-1">{h.message_count} msg</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default BrokerDashboard;