import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Users, Mail, TrendingUp, Landmark, BarChart3, MessageSquare } from "lucide-react";

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

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-foreground mb-6">Dashboard</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <StatCard icon={Building2} label="Imóveis cadastrados" value={stats.properties} color="bg-navy" onClick={() => navigate("/admin/properties")} />
        <StatCard icon={Users} label="Corretores aprovados" value={stats.brokers} color="bg-secondary" onClick={() => navigate("/admin/brokers")} />
        <StatCard icon={TrendingUp} label="Corretores pendentes" value={stats.pendingBrokers} color="bg-orange-hover" onClick={() => navigate("/admin/brokers")} />
        <StatCard icon={Mail} label="Mensagens não lidas" value={stats.messages} color="bg-destructive" onClick={() => navigate("/admin/messages")} />
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard icon={MessageSquare} label="Chats não lidos" value={stats.chatMessages} color="bg-navy-light" onClick={() => navigate("/admin/messages")} />
        <StatCard icon={Landmark} label="Empresas cadastradas" value={stats.companies} color="bg-navy-light" onClick={() => navigate("/admin/companies")} />
        <StatCard icon={Landmark} label="Empresas pendentes" value={stats.pendingCompanies} color="bg-orange-hover" onClick={() => navigate("/admin/companies")} />
        <StatCard icon={BarChart3} label="Total de leads" value={stats.totalLeads} color="bg-secondary" />
      </div>
    </div>
  );
};

export default AdminDashboard;
