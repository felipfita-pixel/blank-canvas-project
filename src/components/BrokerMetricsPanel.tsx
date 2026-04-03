import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Clock, CheckCircle, TrendingUp } from "lucide-react";

interface BrokerMetrics {
  totalChats: number;
  todayChats: number;
  avgResponseTime: string;
  claimedChats: number;
}

const BrokerMetricsPanel = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<BrokerMetrics>({
    totalChats: 0,
    todayChats: 0,
    avgResponseTime: "—",
    claimedChats: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchMetrics = async () => {
      setLoading(true);

      // Get broker's claimed conversations
      const { data: allClaimed } = await supabase
        .from("chat_messages")
        .select("conversation_id, created_at, is_from_client, claimed_by")
        .eq("claimed_by", user.id)
        .order("created_at", { ascending: true });

      if (!allClaimed) { setLoading(false); return; }

      // Unique conversations
      const convIds = new Set(allClaimed.map(m => m.conversation_id));
      const totalChats = convIds.size;

      // Today's conversations
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayConvs = new Set(
        allClaimed
          .filter(m => new Date(m.created_at) >= todayStart)
          .map(m => m.conversation_id)
      );

      // Calculate average response time per conversation
      const responseTimes: number[] = [];
      for (const convId of convIds) {
        const convMsgs = allClaimed
          .filter(m => m.conversation_id === convId)
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

        // Find first client message and first broker response
        const firstClient = convMsgs.find(m => m.is_from_client);
        const firstResponse = convMsgs.find(m => !m.is_from_client && m.created_at > (firstClient?.created_at || ""));
        
        if (firstClient && firstResponse) {
          const diff = new Date(firstResponse.created_at).getTime() - new Date(firstClient.created_at).getTime();
          if (diff > 0 && diff < 3600000) { // under 1 hour
            responseTimes.push(diff);
          }
        }
      }

      let avgLabel = "—";
      if (responseTimes.length > 0) {
        const avgMs = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        const avgSec = Math.round(avgMs / 1000);
        if (avgSec < 60) avgLabel = `${avgSec}s`;
        else avgLabel = `${Math.floor(avgSec / 60)}m${(avgSec % 60).toString().padStart(2, "0")}s`;
      }

      setMetrics({
        totalChats: totalChats,
        todayChats: todayConvs.size,
        avgResponseTime: avgLabel,
        claimedChats: totalChats,
      });
      setLoading(false);
    };

    fetchMetrics();
  }, [user]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4 h-20" />
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    { icon: MessageSquare, label: "Atendimentos hoje", value: metrics.todayChats, color: "text-secondary" },
    { icon: TrendingUp, label: "Total de atendimentos", value: metrics.totalChats, color: "text-primary" },
    { icon: Clock, label: "Tempo médio de resposta", value: metrics.avgResponseTime, color: "text-orange" },
    { icon: CheckCircle, label: "Conversas atribuídas", value: metrics.claimedChats, color: "text-green-600" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => (
        <Card key={card.label} className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <card.icon className={`w-4 h-4 ${card.color}`} />
              <p className="text-[11px] text-muted-foreground">{card.label}</p>
            </div>
            <p className="text-xl font-heading font-bold text-foreground">{card.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default BrokerMetricsPanel;
