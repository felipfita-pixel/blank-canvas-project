import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Printer, Mail, MessageCircle, FileText, RefreshCw, CheckCircle2, Clock, Users, Building2, MessageSquare, ShieldCheck, Landmark, Settings, BarChart3, Image, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface SystemStats {
  totalBrokers: number;
  approvedBrokers: number;
  pendingBrokers: number;
  totalProperties: number;
  activeProperties: number;
  totalMessages: number;
  totalChats: number;
  totalCompanies: number;
  totalScheduling: number;
  totalAdmins: number;
}

const SYSTEM_FEATURES = [
  {
    category: "Autenticação & Segurança",
    icon: ShieldCheck,
    items: [
      "Login e registro de usuários com Supabase Auth",
      "Sistema de roles (admin, broker) com tabela user_roles",
      "Rotas protegidas com ProtectedRoute",
      "Recuperação de senha (forgot/reset password)",
      "Row-Level Security (RLS) em todas as tabelas",
      "Função has_role() para verificação segura de permissões",
    ],
  },
  {
    category: "Gestão de Corretores",
    icon: Users,
    items: [
      "Cadastro de corretores com auto-registro",
      "Aprovação/rejeição de corretores pelo admin",
      "Perfil com CRECI, bio, avatar, bairros de atuação",
      "Sistema de presença online (broker_presence)",
      "Toggle de disponibilidade no painel admin",
      "Dashboard individual do corretor",
    ],
  },
  {
    category: "Chat em Tempo Real",
    icon: MessageSquare,
    items: [
      "Widget de chat integrado em todas as páginas",
      "Persistência de sessão de 5 minutos",
      "Indicadores de status online e digitação",
      "Notificações sonoras (notification.wav)",
      "Sistema de atribuição automática por fila (FIFO)",
      "Botão 'Assumir' para corretores",
      "Escalação automática após 30 segundos sem atendimento",
      "Histórico de chats com filtros avançados (/admin/chat)",
      "Envio de arquivos no chat",
    ],
  },
  {
    category: "Imóveis",
    icon: Building2,
    items: [
      "CRUD completo de imóveis pelo admin",
      "Upload de múltiplas imagens com storage Supabase",
      "Galeria com lightbox para visualização",
      "Filtros por tipo, transação, bairro, faixa de preço",
      "Imóveis em destaque (featured)",
      "Página de detalhe do imóvel com informações completas",
      "Dados estáticos de fallback (staticProperties)",
    ],
  },
  {
    category: "Imobiliárias / Empresas",
    icon: Landmark,
    items: [
      "Cadastro de imobiliárias com modal no site",
      "Campos: CNPJ, tipo, responsável, telefone, email",
      "Aprovação/rejeição pelo admin",
      "Listagem e gestão no painel administrativo",
    ],
  },
  {
    category: "Mensagens & Contato",
    icon: Mail,
    items: [
      "Formulário de contato no site",
      "Agendamento de visitas (scheduling_requests)",
      "Painel de mensagens do admin com marcação de lidas",
      "Notificações por email para novas mensagens",
    ],
  },
  {
    category: "Email & Notificações",
    icon: Bell,
    items: [
      "Infraestrutura de email com fila pgmq",
      "Templates transacionais (novo chat, contato, agendamento)",
      "Sistema de supressão de emails (bounces, complaints)",
      "Unsubscribe com tokens seguros",
      "Processamento via Edge Function (process-email-queue)",
      "Retry automático com dead-letter queue",
    ],
  },
  {
    category: "Conteúdo do Site",
    icon: Image,
    items: [
      "Edição dinâmica de seções via site_content",
      "Hero section customizável",
      "Seção de serviços",
      "Seção de bairros de atuação",
      "Seção de depoimentos",
      "Seção de estilo de vida",
      "Banner CTA",
      "Footer editável",
      "Corretores online exibidos no site",
    ],
  },
  {
    category: "Painel Administrativo",
    icon: Settings,
    items: [
      "Dashboard com métricas e estatísticas",
      "Gestão de corretores, imóveis, mensagens",
      "Gestão de imobiliárias",
      "Histórico de chat ao vivo",
      "Gestão de administradores",
      "Configurações do sistema",
      "Layout responsivo com sidebar",
      "Documentação do sistema (esta página)",
    ],
  },
  {
    category: "Infraestrutura & Técnico",
    icon: BarChart3,
    items: [
      "React 18 + Vite + TypeScript",
      "Tailwind CSS com design system customizado",
      "Supabase (Auth, Database, Storage, Edge Functions)",
      "Realtime subscriptions para chat e presença",
      "React Query para cache e sincronização",
      "Framer Motion para animações",
      "Deploy com Vercel (vercel.json configurado)",
      "SEO com sitemap.xml e robots.txt",
    ],
  },
];

export default function AdminDocumentation() {
  const { user } = useAuth();
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [brokers, properties, messages, chats, companies, scheduling, admins] = await Promise.all([
        supabase.from("brokers").select("id, status", { count: "exact" }),
        supabase.from("properties").select("id, active", { count: "exact" }),
        supabase.from("contact_messages").select("id", { count: "exact" }),
        supabase.from("chat_messages").select("id", { count: "exact" }),
        supabase.from("companies").select("id", { count: "exact" }),
        supabase.from("scheduling_requests").select("id", { count: "exact" }),
        supabase.from("user_roles").select("id").eq("role", "admin"),
      ]);

      const brokersData = brokers.data || [];
      const propertiesData = properties.data || [];

      setStats({
        totalBrokers: brokersData.length,
        approvedBrokers: brokersData.filter((b) => b.status === "approved").length,
        pendingBrokers: brokersData.filter((b) => b.status === "pending").length,
        totalProperties: propertiesData.length,
        activeProperties: propertiesData.filter((p) => p.active).length,
        totalMessages: messages.count || 0,
        totalChats: chats.count || 0,
        totalCompanies: companies.count || 0,
        totalScheduling: scheduling.count || 0,
        totalAdmins: admins.data?.length || 0,
      });
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handlePrint = () => {
    fetchStats().then(() => {
      setTimeout(() => window.print(), 300);
    });
  };

  const getShareText = () => {
    const date = lastUpdated.toLocaleString("pt-BR");
    let text = `📋 DOCUMENTAÇÃO DO SISTEMA - FF Imobiliária\n`;
    text += `📅 Atualizado em: ${date}\n\n`;

    if (stats) {
      text += `📊 RESUMO DO SISTEMA:\n`;
      text += `• Corretores: ${stats.totalBrokers} (${stats.approvedBrokers} aprovados)\n`;
      text += `• Imóveis: ${stats.totalProperties} (${stats.activeProperties} ativos)\n`;
      text += `• Mensagens: ${stats.totalMessages}\n`;
      text += `• Chats: ${stats.totalChats}\n`;
      text += `• Imobiliárias: ${stats.totalCompanies}\n`;
      text += `• Agendamentos: ${stats.totalScheduling}\n`;
      text += `• Administradores: ${stats.totalAdmins}\n\n`;
    }

    SYSTEM_FEATURES.forEach((section) => {
      text += `🔹 ${section.category.toUpperCase()}\n`;
      section.items.forEach((item) => {
        text += `  • ${item}\n`;
      });
      text += `\n`;
    });

    return text;
  };

  const handleWhatsApp = async () => {
    await fetchStats();
    const text = encodeURIComponent(getShareText());
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const handleEmail = async () => {
    await fetchStats();
    const subject = encodeURIComponent("Documentação do Sistema - FF Imobiliária");
    const body = encodeURIComponent(getShareText());
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="space-y-6">
      {/* Header - hidden on print for cleaner look */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            Documentação do Sistema
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Relatório completo de funcionalidades implementadas
          </p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <Button variant="outline" size="sm" onClick={fetchStats} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-1" />
            Imprimir
          </Button>
          <Button variant="outline" size="sm" onClick={handleEmail}>
            <Mail className="w-4 h-4 mr-1" />
            Email
          </Button>
          <Button size="sm" onClick={handleWhatsApp} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <MessageCircle className="w-4 h-4 mr-1" />
            WhatsApp
          </Button>
        </div>
      </div>

      {/* Print header - only visible on print */}
      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-bold">FF Imobiliária - Documentação do Sistema</h1>
        <p className="text-sm text-gray-500">
          Atualizado em: {lastUpdated.toLocaleString("pt-BR")}
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { label: "Corretores", value: stats.totalBrokers, sub: `${stats.approvedBrokers} aprovados` },
            { label: "Imóveis", value: stats.totalProperties, sub: `${stats.activeProperties} ativos` },
            { label: "Mensagens", value: stats.totalMessages },
            { label: "Chats", value: stats.totalChats },
            { label: "Imobiliárias", value: stats.totalCompanies },
            { label: "Agendamentos", value: stats.totalScheduling },
            { label: "Admins", value: stats.totalAdmins },
          ].map((stat) => (
            <Card key={stat.label} className="print:border print:shadow-none">
              <CardContent className="p-3 text-center">
                <div className="text-2xl font-bold text-primary">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
                {stat.sub && <div className="text-[10px] text-muted-foreground/70">{stat.sub}</div>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="w-3 h-3" />
        Última atualização: {lastUpdated.toLocaleString("pt-BR")}
      </div>

      <Separator />

      {/* Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 print:grid-cols-1">
        {SYSTEM_FEATURES.map((section) => (
          <Card key={section.category} className="print:break-inside-avoid print:shadow-none print:border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <section.icon className="w-4 h-4 text-primary" />
                {section.category}
                <Badge variant="secondary" className="ml-auto text-[10px]">
                  {section.items.length} itens
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-1.5">
                {section.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 text-emerald-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Print footer */}
      <div className="hidden print:block mt-8 pt-4 border-t text-xs text-gray-400 text-center">
        Documento gerado automaticamente pelo sistema FF Imobiliária em{" "}
        {lastUpdated.toLocaleString("pt-BR")}
      </div>
    </div>
  );
}
