import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Users, Mail, TrendingUp, Landmark, BarChart3, MessageSquare, Phone, AtSign, Home as HomeIcon, Printer, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

const StatCard = ({ icon: Icon, label, value, color, onClick }: { icon: any; label: string; value: number; color: string; onClick?: () => void }) => (
  <div
    className={`bg-card rounded-xl p-6 shadow-sm border border-border transition-all ${onClick ? "cursor-pointer hover:shadow-md hover:border-secondary/40" : ""}`}
    onClick={onClick}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-3xl font-heading font-bold text-foreground mt-1">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6 text-primary-foreground" />
      </div>
    </div>
  </div>
);

interface LeadEntry {
  id: string;
  client_name: string;
  client_phone: string;
  client_email: string;
  property_info: string;
  broker_name: string;
  broker_phone: string;
  broker_email: string;
  source: "chat" | "contact" | "scheduling";
  date: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    properties: 0,
    brokers: 0,
    pendingBrokers: 0,
    messages: 0,
    chatMessages: 0,
    companies: 0,
    pendingCompanies: 0,
    totalLeads: 0,
  });
  const [leads, setLeads] = useState<LeadEntry[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [props, brokers, pending, msgs, chatMsgs, companies, pendingCompanies] = await Promise.all([
        supabase.from("properties").select("id", { count: "exact", head: true }),
        supabase.from("brokers").select("id", { count: "exact", head: true }).eq("status", "approved"),
        supabase.from("brokers").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("read", false),
        supabase.from("chat_messages").select("id", { count: "exact", head: true }).eq("read", false),
        supabase.from("companies" as any).select("id", { count: "exact", head: true }),
        supabase.from("companies" as any).select("id", { count: "exact", head: true }).eq("status", "pending"),
      ]);
      setStats({
        properties: props.count ?? 0,
        brokers: brokers.count ?? 0,
        pendingBrokers: pending.count ?? 0,
        messages: msgs.count ?? 0,
        chatMessages: chatMsgs.count ?? 0,
        companies: companies.count ?? 0,
        pendingCompanies: pendingCompanies.count ?? 0,
        totalLeads: (msgs.count ?? 0) + (chatMsgs.count ?? 0) + (pending.count ?? 0) + (pendingCompanies.count ?? 0),
      });
    };
    fetchStats();
  }, []);

  // Fetch leads list
  useEffect(() => {
    const fetchLeads = async () => {
      setLeadsLoading(true);

      // Fetch brokers for mapping
      const { data: brokersData } = await supabase
        .from("brokers")
        .select("id, user_id, full_name, phone, email")
        .eq("status", "approved");
      const brokersMap = new Map(
        (brokersData ?? []).map(b => [b.id, b])
      );
      const brokersByUserId = new Map(
        (brokersData ?? []).filter(b => b.user_id).map(b => [b.user_id!, b])
      );

      const allLeads: LeadEntry[] = [];

      // 1. Chat conversations (grouped by conversation_id)
      const { data: chatMsgs } = await supabase
        .from("chat_messages")
        .select("conversation_id, sender_name, sender_email, sender_phone, message, created_at, is_from_client, broker_id, claimed_by")
        .neq("conversation_id", "")
        .order("created_at", { ascending: false })
        .limit(500);

      if (chatMsgs) {
        const convMap = new Map<string, {
          client_name: string; client_email: string; client_phone: string;
          message: string; broker_id: string | null; claimed_by: string | null; date: string;
        }>();

        for (const msg of chatMsgs) {
          const cid = msg.conversation_id as string;
          if (!convMap.has(cid) && msg.is_from_client) {
            convMap.set(cid, {
              client_name: msg.sender_name,
              client_email: msg.sender_email,
              client_phone: msg.sender_phone,
              message: msg.message,
              broker_id: msg.broker_id,
              claimed_by: msg.claimed_by as string | null,
              date: msg.created_at,
            });
          }
          const conv = convMap.get(cid);
          if (conv && msg.broker_id) conv.broker_id = msg.broker_id;
          if (conv && msg.claimed_by) conv.claimed_by = msg.claimed_by as string;
        }

        for (const [cid, conv] of convMap) {
          const broker = conv.broker_id ? brokersMap.get(conv.broker_id) : 
                         conv.claimed_by ? brokersByUserId.get(conv.claimed_by) : null;
          allLeads.push({
            id: `chat-${cid}`,
            client_name: conv.client_name,
            client_phone: conv.client_phone,
            client_email: conv.client_email,
            property_info: conv.message.length > 60 ? conv.message.slice(0, 60) + "…" : conv.message,
            broker_name: broker?.full_name || "—",
            broker_phone: broker?.phone || "—",
            broker_email: broker?.email || "—",
            source: "chat",
            date: conv.date,
          });
        }
      }

      // 2. Contact messages
      const { data: contacts } = await supabase
        .from("contact_messages")
        .select("id, name, email, phone, message, neighborhood, created_at")
        .order("created_at", { ascending: false })
        .limit(50);

      if (contacts) {
        for (const c of contacts) {
          const propertyInfo = [c.neighborhood, c.message].filter(Boolean).join(" — ");
          allLeads.push({
            id: `contact-${c.id}`,
            client_name: c.name,
            client_phone: c.phone || "—",
            client_email: c.email,
            property_info: propertyInfo.length > 60 ? propertyInfo.slice(0, 60) + "…" : (propertyInfo || "—"),
            broker_name: "—",
            broker_phone: "—",
            broker_email: "—",
            source: "contact",
            date: c.created_at,
          });
        }
      }

      // 3. Scheduling requests
      const { data: schedules } = await supabase
        .from("scheduling_requests")
        .select("id, name, email, phone, message, created_at")
        .order("created_at", { ascending: false })
        .limit(50);

      if (schedules) {
        for (const s of schedules) {
          allLeads.push({
            id: `sched-${s.id}`,
            client_name: s.name,
            client_phone: s.phone || "—",
            client_email: s.email,
            property_info: s.message ? (s.message.length > 60 ? s.message.slice(0, 60) + "…" : s.message) : "Agendamento",
            broker_name: "—",
            broker_phone: "—",
            broker_email: "—",
            source: "scheduling",
            date: s.created_at,
          });
        }
      }

      // Sort by date descending
      allLeads.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setLeads(allLeads);
      setLeadsLoading(false);
    };

    fetchLeads();
  }, []);

  const sourceLabel = (source: LeadEntry["source"]) => {
    const map = { chat: "Chat", contact: "Contato", scheduling: "Agendamento" };
    const colors = {
      chat: "bg-secondary/20 text-secondary border-secondary/30",
      contact: "bg-primary/10 text-primary border-primary/20",
      scheduling: "bg-orange/20 text-orange border-orange/30",
    };
    return <Badge variant="outline" className={`text-[9px] ${colors[source]}`}>{map[source]}</Badge>;
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
  });

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-foreground mb-6 print:text-lg print:mb-2">Dashboard</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6 print:hidden">
        <StatCard icon={Building2} label="Imóveis cadastrados" value={stats.properties} color="bg-navy" onClick={() => navigate("/admin/properties")} />
        <StatCard icon={Users} label="Corretores aprovados" value={stats.brokers} color="bg-secondary" onClick={() => navigate("/admin/brokers")} />
        <StatCard icon={TrendingUp} label="Corretores pendentes" value={stats.pendingBrokers} color="bg-orange-hover" onClick={() => navigate("/admin/brokers")} />
        <StatCard icon={Mail} label="Mensagens não lidas" value={stats.messages} color="bg-destructive" onClick={() => navigate("/admin/messages")} />
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8 print:hidden">
        <StatCard icon={MessageSquare} label="Chats não lidos" value={stats.chatMessages} color="bg-navy-light" onClick={() => navigate("/admin/messages")} />
        <StatCard icon={Landmark} label="Empresas cadastradas" value={stats.companies} color="bg-navy-light" onClick={() => navigate("/admin/companies")} />
        <StatCard icon={Landmark} label="Empresas pendentes" value={stats.pendingCompanies} color="bg-orange-hover" onClick={() => navigate("/admin/companies")} />
        <StatCard icon={BarChart3} label="Total de leads" value={stats.totalLeads} color="bg-secondary" />
      </div>

      {/* Lista de Atendimentos */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between print:border-0">
          <div>
            <h2 className="text-base font-heading font-bold text-foreground">Lista de Atendimentos</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Clientes, imóveis solicitados e corretores responsáveis</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs print:hidden">{leads.length} registros</Badge>
            <Button size="sm" variant="outline" className="gap-1.5 print:hidden" onClick={() => window.print()}>
              <Printer className="w-3.5 h-3.5" />
              Imprimir
            </Button>
          </div>
        </div>
        <ScrollArea className="max-h-[500px]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50 sticky top-0">
                  <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-4 py-2.5">Cliente</th>
                  <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-4 py-2.5">Contato Cliente</th>
                  <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-4 py-2.5">Imóvel / Solicitação</th>
                  <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-4 py-2.5">Corretor</th>
                  <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-4 py-2.5">Contato Corretor</th>
                  <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-4 py-2.5">Origem</th>
                  <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-4 py-2.5">Data</th>
                </tr>
              </thead>
              <tbody>
                {leadsLoading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-sm text-muted-foreground">Carregando atendimentos...</td>
                  </tr>
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-sm text-muted-foreground">Nenhum atendimento registrado.</td>
                  </tr>
                ) : leads.map((lead) => (
                  <tr key={lead.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2.5">
                      <p className="text-sm font-medium text-foreground">{lead.client_name}</p>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="space-y-0.5">
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Phone className="w-3 h-3 shrink-0" /> {lead.client_phone}
                        </p>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <AtSign className="w-3 h-3 shrink-0" /> {lead.client_email}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <p className="text-xs text-muted-foreground flex items-center gap-1 max-w-[200px]">
                        <HomeIcon className="w-3 h-3 shrink-0" />
                        <span className="truncate">{lead.property_info}</span>
                      </p>
                    </td>
                    <td className="px-4 py-2.5">
                      <p className="text-sm font-medium text-foreground">{lead.broker_name}</p>
                    </td>
                    <td className="px-4 py-2.5">
                      {lead.broker_name !== "—" ? (
                        <div className="space-y-0.5">
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Phone className="w-3 h-3 shrink-0" /> {lead.broker_phone}
                          </p>
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <AtSign className="w-3 h-3 shrink-0" /> {lead.broker_email}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">—</p>
                      )}
                    </td>
                    <td className="px-4 py-2.5">{sourceLabel(lead.source)}</td>
                    <td className="px-4 py-2.5">
                      <p className="text-[11px] text-muted-foreground whitespace-nowrap">{formatDate(lead.date)}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default AdminDashboard;
