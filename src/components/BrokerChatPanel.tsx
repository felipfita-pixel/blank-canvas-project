import { useState, useEffect, useRef, useCallback } from "react";
import { MessageSquare, Send, Loader2, Paperclip, X, User, Clock, Shield, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useBrokerPresence } from "@/hooks/useBrokerPresence";
import { toast } from "sonner";

interface Conversation {
  conversation_id: string;
  sender_name: string;
  sender_email: string;
  sender_phone: string;
  last_message: string;
  last_time: string;
  unread: number;
  broker_id: string | null;
  claimed_by: string | null;
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

const notificationSound = typeof window !== "undefined" ? new Audio("/notification.wav") : null;

const BrokerChatPanel = () => {
  const { user, isAdmin } = useAuth();
  const { setTyping } = useBrokerPresence();
  const [brokerId, setBrokerId] = useState<string | null>(null);
  const [isAdminOnly, setIsAdminOnly] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [minimized, setMinimized] = useState(true);
  const [typingIndicator, setTypingIndicator] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastMsgCountRef = useRef(0);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  // Get broker ID for current user (or set admin-only mode)
  useEffect(() => {
    if (!user) return;
    const fetchBroker = async () => {
      const { data } = await supabase.from("brokers").select("id").eq("user_id", user.id).eq("status", "approved").maybeSingle();
      if (data) {
        setBrokerId(data.id);
      } else if (isAdmin) {
        setIsAdminOnly(true);
        setBrokerId("admin");
      }
    };
    fetchBroker();
  }, [user, isAdmin]);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    if (!brokerId || !user) return;
    
    const { data } = await supabase
      .from("chat_messages")
      .select("conversation_id, sender_name, sender_email, sender_phone, message, created_at, read, broker_id, is_from_client, claimed_by")
      .neq("conversation_id", "")
      .order("created_at", { ascending: false });

    if (!data) return;

    const convMap = new Map<string, Conversation>();
    for (const msg of data) {
      const cid = msg.conversation_id as string;
      if (!convMap.has(cid)) {
        convMap.set(cid, {
          conversation_id: cid,
          sender_name: msg.is_from_client ? msg.sender_name : "",
          sender_email: msg.is_from_client ? msg.sender_email : "",
          sender_phone: msg.is_from_client ? msg.sender_phone : "",
          last_message: msg.message,
          last_time: msg.created_at,
          unread: 0,
          broker_id: msg.broker_id,
          claimed_by: msg.claimed_by as string | null,
        });
      }
      const conv = convMap.get(cid)!;
      if (msg.is_from_client && !msg.read) conv.unread++;
      if (msg.is_from_client && !conv.sender_name) {
        conv.sender_name = msg.sender_name;
        conv.sender_email = msg.sender_email;
        conv.sender_phone = msg.sender_phone;
      }
      // Track claimed_by from any message in conversation
      if (msg.claimed_by) conv.claimed_by = msg.claimed_by as string;
    }

    // Filter: admin sees all; broker sees unclaimed OR claimed by self
    const allConvs = Array.from(convMap.values());
    if (isAdminOnly) {
      setConversations(allConvs);
    } else {
      setConversations(allConvs.filter(c => !c.claimed_by || c.claimed_by === user?.id));
    }
  }, [brokerId, isAdminOnly, user]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  // Subscribe to new messages globally + play notification sound
  useEffect(() => {
    if (!brokerId) return;
    const channel = supabase
      .channel("broker-chat-global")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, (payload) => {
        const newMsg = payload.new as Record<string, unknown>;
        // Play sound for new client messages
        if (newMsg.is_from_client && notificationSound) {
          notificationSound.play().catch(() => {});
        }
        fetchConversations();
        if (selectedConv) fetchMessages(selectedConv);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [brokerId, fetchConversations, selectedConv]);

  // Subscribe to typing indicators from broker_presence (client typing not tracked yet)
  useEffect(() => {
    if (!selectedConv) return;
    // We don't have client presence yet, so skip for now
    // Future: subscribe to a client_presence table
  }, [selectedConv]);

  const fetchMessages = async (convId: string) => {
    const { data } = await supabase
      .from("chat_messages")
      .select("id, message, is_from_client, created_at, file_url, file_name, file_type, sender_name")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });
    if (data) setMessages(data as ChatMsg[]);

    // Mark as read
    await supabase
      .from("chat_messages")
      .update({ read: true })
      .eq("conversation_id", convId)
      .eq("is_from_client", true)
      .eq("read", false);
  };

  const handleSelectConversation = (convId: string) => {
    setSelectedConv(convId);
    fetchMessages(convId);
  };

  const handleClaimConversation = async () => {
    if (!selectedConv || !user) return;
    const { error } = await supabase
      .from("chat_messages")
      .update({ claimed_by: user.id })
      .eq("conversation_id", selectedConv);
    if (error) {
      toast.error("Erro ao assumir conversa.");
      return;
    }
    toast.success("Conversa assumida com sucesso!");
    fetchConversations();
  };

  const handleSendReply = async (fileUrl?: string, fileName?: string, fileType?: string) => {
    const msgText = fileUrl ? (newMessage.trim() || fileName || "Arquivo enviado") : newMessage.trim();
    if (!msgText && !fileUrl) return;
    if (!selectedConv || !brokerId) return;

    setLoading(true);
    
    let senderName = "Administrador";
    const insertData: Record<string, unknown> = {
      conversation_id: selectedConv,
      message: msgText,
      is_from_client: false,
      sender_name: senderName,
      sender_email: "",
      sender_phone: "",
      file_url: fileUrl || "",
      file_name: fileName || "",
      file_type: fileType || "",
    };

    if (!isAdminOnly) {
      const { data: brokerData } = await supabase.from("brokers").select("full_name").eq("id", brokerId!).maybeSingle();
      senderName = brokerData?.full_name || "Corretor";
      insertData.sender_name = senderName;
      insertData.broker_id = brokerId;
    }

    // Auto-claim on first reply if unclaimed
    const conv = conversations.find(c => c.conversation_id === selectedConv);
    if (!conv?.claimed_by && user) {
      insertData.claimed_by = user.id;
      // Also claim existing messages
      await supabase
        .from("chat_messages")
        .update({ claimed_by: user.id })
        .eq("conversation_id", selectedConv);
    }

    const { error } = await supabase.from("chat_messages").insert(insertData);
    setLoading(false);
    if (error) {
      toast.error("Erro ao enviar mensagem.");
      return;
    }
    setNewMessage("");
    fetchMessages(selectedConv);
    fetchConversations();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedConv) return;
    if (file.size > 10 * 1024 * 1024) { toast.error("Arquivo muito grande (máx. 10MB)."); return; }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `chat/${selectedConv}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("property-images").upload(path, file);
    if (error) { toast.error("Erro ao enviar arquivo."); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("property-images").getPublicUrl(path);
    const ft = file.type.startsWith("image/") ? "image" : "file";
    await handleSendReply(urlData.publicUrl, file.name, ft);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendReply(); }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (selectedConv) setTyping(selectedConv);
  };

  const formatTime = (d: string) => new Date(d).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const totalUnread = conversations.reduce((a, c) => a + c.unread, 0);

  if (!brokerId) return null;

  const selectedConvData = conversations.find(c => c.conversation_id === selectedConv);
  const isUnclaimed = selectedConvData && !selectedConvData.claimed_by;

  return (
    <>
      {/* Floating broker chat button */}
      <button
        onClick={() => setMinimized(!minimized)}
        data-broker-panel-trigger
        className="hidden"
        title="Painel de Atendimento Online"
      >
        <MessageSquare className="w-5 h-5" />
        {totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {totalUnread}
          </span>
        )}
      </button>

      {/* Chat panel */}
      {!minimized && (
        <div className="fixed top-16 right-4 z-50 w-[400px] bg-background border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col" style={{ height: "70vh" }}>
          {/* Header */}
          <div className="bg-secondary px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-secondary-foreground" />
              <p className="text-secondary-foreground font-semibold text-sm">Painel de Atendimento</p>
            </div>
            <button onClick={() => setMinimized(true)} className="text-secondary-foreground/70 hover:text-secondary-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Conversations list */}
            <div className="w-[140px] border-r border-border overflow-y-auto shrink-0">
              {conversations.length === 0 && (
                <p className="text-xs text-muted-foreground p-3">Sem conversas</p>
              )}
              {conversations.map((conv) => (
                <button
                  key={conv.conversation_id}
                  onClick={() => handleSelectConversation(conv.conversation_id)}
                  className={`w-full text-left p-2.5 border-b border-border hover:bg-muted/50 transition-colors ${selectedConv === conv.conversation_id ? "bg-muted" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-foreground truncate flex items-center gap-1">
                      {!conv.claimed_by && (
                        <Circle className="w-2 h-2 text-yellow-500 fill-yellow-500 shrink-0" />
                      )}
                      {conv.sender_name || "Cliente"}
                    </p>
                    {conv.unread > 0 && (
                      <Badge variant="destructive" className="text-[9px] px-1 py-0 h-4">{conv.unread}</Badge>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate mt-0.5">{conv.last_message}</p>
                  <p className="text-[9px] text-muted-foreground/50 mt-0.5 flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" /> {formatTime(conv.last_time)}
                  </p>
                </button>
              ))}
            </div>

            {/* Chat area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {!selectedConv ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <User className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Selecione uma conversa</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Selected conversation info */}
                  {(() => {
                    const conv = selectedConvData;
                    return conv ? (
                      <div className="px-3 py-2 border-b border-border bg-muted/30 shrink-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-foreground">{conv.sender_name}</p>
                            <p className="text-[10px] text-muted-foreground">{conv.sender_email} {conv.sender_phone ? `• ${conv.sender_phone}` : ""}</p>
                          </div>
                          {isUnclaimed && (
                            <Button size="sm" variant="outline" onClick={handleClaimConversation} className="text-xs h-7 gap-1">
                              <Shield className="w-3 h-3" />
                              Assumir
                            </Button>
                          )}
                        </div>
                        {conv.claimed_by && (
                          <p className="text-[9px] text-green-600 mt-1 flex items-center gap-1">
                            <Circle className="w-2 h-2 fill-green-500 text-green-500" />
                            Conversa atribuída
                          </p>
                        )}
                      </div>
                    ) : null;
                  })()}

                  {/* Messages */}
                  <ScrollArea className="flex-1 p-3">
                    <div className="space-y-2">
                      {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.is_from_client ? "justify-start" : "justify-end"}`}>
                          <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${msg.is_from_client ? "bg-muted text-foreground" : "bg-primary text-primary-foreground"}`}>
                            {msg.file_type === "image" && msg.file_url && (
                              <img src={msg.file_url} alt={msg.file_name || "imagem"} className="rounded-lg mb-1 max-w-full max-h-32 object-cover cursor-pointer" onClick={() => window.open(msg.file_url, "_blank")} />
                            )}
                            {msg.file_type === "file" && msg.file_url && (
                              <a href={msg.file_url} target="_blank" rel="noopener noreferrer" className="underline text-xs block mb-1">📎 {msg.file_name || "Arquivo"}</a>
                            )}
                            {msg.message && <p className="whitespace-pre-wrap">{msg.message}</p>}
                            <p className={`text-[10px] mt-0.5 ${msg.is_from_client ? "text-muted-foreground/50" : "text-primary-foreground/50"}`}>{formatTime(msg.created_at)}</p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Input */}
                  <div className="border-t border-border p-2 shrink-0">
                    <div className="flex items-center gap-2">
                      <input ref={fileInputRef} type="file" accept="image/*,.pdf,.doc,.docx" className="hidden" onChange={handleFileUpload} />
                      <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="text-muted-foreground hover:text-foreground">
                        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
                      </button>
                      <Input
                        placeholder="Responder..."
                        value={newMessage}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        className="flex-1 h-9 text-sm"
                      />
                      <Button size="icon" className="h-9 w-9 bg-primary text-primary-foreground" onClick={() => handleSendReply()} disabled={loading || !newMessage.trim()}>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BrokerChatPanel;
