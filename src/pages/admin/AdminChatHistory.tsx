import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MessageSquare, User, Clock, Circle, Filter } from "lucide-react";

interface ConversationSummary {
  conversation_id: string;
  sender_name: string;
  sender_email: string;
  sender_phone: string;
  message_count: number;
  last_message: string;
  last_time: string;
  claimed_by: string | null;
  broker_name: string | null;
}

interface ChatMsg {
  id: string;
  message: string;
  is_from_client: boolean;
  created_at: string;
  file_url: string;
  file_name: string;
  file_type: string;
  sender_name: string;
}

interface BrokerOption {
  id: string;
  full_name: string;
  user_id: string | null;
}

const AdminChatHistory = () => {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [filteredConvs, setFilteredConvs] = useState<ConversationSummary[]>([]);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [search, setSearch] = useState("");
  const [brokerFilter, setBrokerFilter] = useState("all");
  const [brokers, setBrokers] = useState<BrokerOption[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBrokers = useCallback(async () => {
    const { data } = await supabase.from("brokers").select("id, full_name, user_id").eq("status", "approved");
    if (data) setBrokers(data);
  }, []);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("chat_messages")
      .select("conversation_id, sender_name, sender_email, sender_phone, message, created_at, is_from_client, claimed_by")
      .neq("conversation_id", "")
      .order("created_at", { ascending: false });

    if (!data) { setLoading(false); return; }

    const convMap = new Map<string, ConversationSummary>();
    for (const msg of data) {
      const cid = msg.conversation_id as string;
      if (!convMap.has(cid)) {
        convMap.set(cid, {
          conversation_id: cid,
          sender_name: msg.is_from_client ? msg.sender_name : "",
          sender_email: msg.is_from_client ? msg.sender_email : "",
          sender_phone: msg.is_from_client ? msg.sender_phone : "",
          message_count: 0,
          last_message: msg.message,
          last_time: msg.created_at,
          claimed_by: msg.claimed_by as string | null,
          broker_name: null,
        });
      }
      const conv = convMap.get(cid)!;
      conv.message_count++;
      if (msg.is_from_client && !conv.sender_name) {
        conv.sender_name = msg.sender_name;
        conv.sender_email = msg.sender_email;
        conv.sender_phone = msg.sender_phone;
      }
      if (msg.claimed_by) conv.claimed_by = msg.claimed_by as string;
    }

    const allConvs = Array.from(convMap.values());

    // Map claimed_by user_id to broker name
    for (const conv of allConvs) {
      if (conv.claimed_by) {
        const broker = brokers.find(b => b.user_id === conv.claimed_by);
        conv.broker_name = broker?.full_name || "Admin";
      }
    }

    setConversations(allConvs);
    setLoading(false);
  }, [brokers]);

  useEffect(() => { fetchBrokers(); }, [fetchBrokers]);
  useEffect(() => { if (brokers.length >= 0) fetchConversations(); }, [fetchConversations, brokers]);

  // Filter logic
  useEffect(() => {
    let filtered = conversations;
    if (search.trim()) {
      const s = search.toLowerCase();
      filtered = filtered.filter(c =>
        c.sender_name.toLowerCase().includes(s) ||
        c.sender_email.toLowerCase().includes(s)
      );
    }
    if (brokerFilter === "unclaimed") {
      filtered = filtered.filter(c => !c.claimed_by);
    } else if (brokerFilter !== "all") {
      filtered = filtered.filter(c => c.claimed_by === brokerFilter);
    }
    setFilteredConvs(filtered);
  }, [conversations, search, brokerFilter]);

  const fetchMessages = async (convId: string) => {
    const { data } = await supabase
      .from("chat_messages")
      .select("id, message, is_from_client, created_at, file_url, file_name, file_type, sender_name")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });
    if (data) setMessages(data as ChatMsg[]);
  };

  const handleSelectConv = (convId: string) => {
    setSelectedConv(convId);
    fetchMessages(convId);
  };

  const formatDate = (d: string) => new Date(d).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit",
  });

  const formatTime = (d: string) => new Date(d).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Histórico de Chat</h1>
        <p className="text-muted-foreground text-sm">Visualize todas as conversas do chat ao vivo</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={brokerFilter} onValueChange={setBrokerFilter}>
          <SelectTrigger className="w-[200px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filtrar por corretor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as conversas</SelectItem>
            <SelectItem value="unclaimed">Não atribuídas</SelectItem>
            {brokers.map(b => (
              <SelectItem key={b.user_id || b.id} value={b.user_id || b.id}>{b.full_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" style={{ minHeight: 500 }}>
        {/* Conversation list */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Conversas ({filteredConvs.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[450px]">
              {loading && <p className="text-sm text-muted-foreground p-4">Carregando...</p>}
              {!loading && filteredConvs.length === 0 && (
                <p className="text-sm text-muted-foreground p-4">Nenhuma conversa encontrada.</p>
              )}
              {filteredConvs.map((conv) => (
                <button
                  key={conv.conversation_id}
                  onClick={() => handleSelectConv(conv.conversation_id)}
                  className={`w-full text-left p-3 border-b border-border hover:bg-muted/50 transition-colors ${selectedConv === conv.conversation_id ? "bg-muted" : ""}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-foreground truncate flex items-center gap-1">
                      <User className="w-3 h-3 shrink-0" />
                      {conv.sender_name || "Cliente"}
                    </p>
                    <Badge variant={conv.claimed_by ? "default" : "outline"} className="text-[9px] shrink-0">
                      {conv.claimed_by ? (conv.broker_name || "Atribuída") : "Nova"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{conv.sender_email}</p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{conv.last_message}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {formatDate(conv.last_time)}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60">{conv.message_count} msgs</p>
                  </div>
                </button>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Message viewer */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">
              {selectedConv ? "Mensagens da Conversa" : "Selecione uma conversa"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedConv ? (
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">Clique em uma conversa para ver as mensagens</p>
                </div>
              </div>
            ) : (
              <ScrollArea className="h-[430px] pr-3">
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.is_from_client ? "justify-start" : "justify-end"}`}>
                      <div className={`max-w-[75%] rounded-xl px-3 py-2 text-sm ${msg.is_from_client ? "bg-muted text-foreground" : "bg-primary text-primary-foreground"}`}>
                        <p className="text-[10px] font-semibold mb-0.5 opacity-70">{msg.sender_name || (msg.is_from_client ? "Cliente" : "Corretor")}</p>
                        {msg.file_type === "image" && msg.file_url && (
                          <img src={msg.file_url} alt={msg.file_name || "imagem"} className="rounded-lg mb-1 max-w-full max-h-40 object-cover cursor-pointer" onClick={() => window.open(msg.file_url, "_blank")} />
                        )}
                        {msg.file_type === "file" && msg.file_url && (
                          <a href={msg.file_url} target="_blank" rel="noopener noreferrer" className="underline text-xs block mb-1">📎 {msg.file_name || "Arquivo"}</a>
                        )}
                        {msg.message && <p className="whitespace-pre-wrap">{msg.message}</p>}
                        <p className={`text-[10px] mt-0.5 ${msg.is_from_client ? "text-muted-foreground/50" : "text-primary-foreground/50"}`}>{formatTime(msg.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminChatHistory;
