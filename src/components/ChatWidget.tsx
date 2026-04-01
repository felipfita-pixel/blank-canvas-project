import { useState, useEffect, useRef, useCallback } from "react";
import { MessageSquare, X, Send, Loader2, Paperclip, Circle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ChatMessage {
  id: string;
  message: string;
  is_from_client: boolean;
  created_at: string;
  file_url?: string;
  file_name?: string;
  file_type?: string;
  sender_name?: string;
}

const CHAT_SESSION_KEY = "chat_session";
const CHAT_SESSION_TTL = 5 * 60 * 1000; // 5 minutes

interface ChatSession {
  conversationId: string;
  info: { name: string; email: string; phone: string };
  brokerId: string;
  brokerName: string;
  neighborhood: string;
  savedAt: number;
}

const saveChatSession = (session: Omit<ChatSession, "savedAt">) => {
  localStorage.setItem(CHAT_SESSION_KEY, JSON.stringify({ ...session, savedAt: Date.now() }));
};

const loadChatSession = (): ChatSession | null => {
  try {
    const raw = localStorage.getItem(CHAT_SESSION_KEY);
    if (!raw) return null;
    const session: ChatSession = JSON.parse(raw);
    if (Date.now() - session.savedAt > CHAT_SESSION_TTL) {
      localStorage.removeItem(CHAT_SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    localStorage.removeItem(CHAT_SESSION_KEY);
    return null;
  }
};

const clearChatSession = () => localStorage.removeItem(CHAT_SESSION_KEY);

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"info" | "chat">("info");
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState({ name: "", email: "", phone: "" });
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState("");
  const [brokerName, setBrokerName] = useState("");
  const [brokerId, setBrokerId] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [uploading, setUploading] = useState(false);
  const [brokersOnline, setBrokersOnline] = useState(false);
  const [brokerTyping, setBrokerTyping] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Restore session from localStorage on mount
  useEffect(() => {
    const session = loadChatSession();
    if (session) {
      setInfo(session.info);
      setConversationId(session.conversationId);
      setBrokerId(session.brokerId);
      setBrokerName(session.brokerName);
      setNeighborhood(session.neighborhood);
      setStep("chat");
      setOpen(true);
    }
  }, []);

  // Check broker online status
  useEffect(() => {
    const checkOnline = async () => {
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { data } = await supabase
        .from("broker_presence")
        .select("user_id")
        .eq("is_online", true)
        .gte("last_seen_at", fiveMinAgo)
        .limit(1);
      setBrokersOnline(!!(data && data.length > 0));
    };
    checkOnline();

    // Subscribe to presence changes
    const channel = supabase
      .channel("presence-status")
      .on("postgres_changes", { event: "*", schema: "public", table: "broker_presence" }, () => {
        checkOnline();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Subscribe to typing indicator
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`typing-${conversationId}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "broker_presence" }, (payload) => {
        const row = payload.new as Record<string, unknown>;
        if (row.is_typing_conversation === conversationId) {
          setBrokerTyping(true);
          setTimeout(() => setBrokerTyping(false), 3500);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  // Listen for programmatic clicks with broker data
  useEffect(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const handleTriggerClick = () => {
      const bid = trigger.getAttribute("data-broker-id") || "";
      const bname = trigger.getAttribute("data-broker-name") || "";
      const hood = trigger.getAttribute("data-neighborhood") || "";
      const prefill = trigger.getAttribute("data-prefill-message") || "";
      setBrokerId(bid);
      setBrokerName(bname);
      setNeighborhood(hood);
      if (prefill) setMessage(prefill);
      setOpen(true);
      trigger.removeAttribute("data-broker-id");
      trigger.removeAttribute("data-broker-name");
      trigger.removeAttribute("data-neighborhood");
      trigger.removeAttribute("data-prefill-message");
    };
    trigger.addEventListener("click", handleTriggerClick);
    return () => trigger.removeEventListener("click", handleTriggerClick);
  }, []);

  // Subscribe to real-time messages
  useEffect(() => {
    if (!conversationId) return;
    
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("id, message, is_from_client, created_at, file_url, file_name, file_type, sender_name")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
      if (data) setMessages(data as ChatMessage[]);
    };
    fetchMessages();

    const channel = supabase
      .channel(`chat-${conversationId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "chat_messages",
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        const newMsg = payload.new as ChatMessage;
        setMessages((prev) => {
          if (prev.find(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId]);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!info.name.trim() || !info.email.trim()) {
      toast.error("Preencha nome e e-mail.");
      return;
    }
    if (!emailRegex.test(info.email.trim())) {
      toast.error("Informe um e-mail válido.");
      return;
    }
    const convId = `conv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setConversationId(convId);
    saveChatSession({ conversationId: convId, info, brokerId, brokerName, neighborhood });
    
    if (neighborhood && !message) {
      setMessage(`Olá! Tenho interesse em imóveis no bairro ${neighborhood}. Podem me ajudar?`);
    }
    setStep("chat");
  };

  const handleSendMessage = async (fileUrl?: string, fileName?: string, fileType?: string) => {
    const msgText = fileUrl ? (message.trim() || fileName || "Arquivo enviado") : message.trim();
    if (!msgText && !fileUrl) return;

    setLoading(true);
    const insertData: Record<string, unknown> = {
      sender_name: info.name.trim(),
      sender_email: info.email.trim(),
      sender_phone: info.phone.trim(),
      message: msgText,
      is_from_client: true,
      conversation_id: conversationId,
      file_url: fileUrl || "",
      file_name: fileName || "",
      file_type: fileType || "",
    };
    if (brokerId) insertData.broker_id = brokerId;

    const { error } = await supabase.from("chat_messages").insert(insertData);
    setLoading(false);
    if (error) {
      toast.error("Erro ao enviar mensagem.");
      return;
    }
    // Send email notification (fire-and-forget)
    supabase.functions.invoke("send-transactional-email", {
      body: {
        templateName: "new-chat-notification",
        recipientEmail: "felipe@corretoresrj.com",
        idempotencyKey: `chat-notify-${Date.now()}`,
        templateData: { name: info.name, email: info.email, phone: info.phone, message: msgText },
      },
    });

    // Auto offline message on first client message
    if (!fileUrl) {
      const { count } = await supabase
        .from("chat_messages")
        .select("id", { count: "exact", head: true })
        .eq("conversation_id", conversationId)
        .eq("is_from_client", true);
      
      if (count === 1) {
        if (!brokersOnline) {
          await supabase.from("chat_messages").insert({
            conversation_id: conversationId,
            message: "Obrigado pelo contato! 😊 No momento nossos corretores não estão online, mas responderemos o mais breve possível. Fique à vontade para deixar sua mensagem.",
            is_from_client: false,
            sender_name: "Sistema",
            sender_email: "",
            sender_phone: "",
          });
        }
      }
    }

    setMessage("");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Arquivo muito grande (máx. 10MB).");
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `chat/${conversationId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("property-images").upload(path, file);
    if (error) {
      toast.error("Erro ao enviar arquivo.");
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("property-images").getPublicUrl(path);
    const ft = file.type.startsWith("image/") ? "image" : "file";
    await handleSendMessage(urlData.publicUrl, file.name, ft);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const resetChat = () => {
    setOpen(false);
    clearChatSession();
    setTimeout(() => {
      setStep("info");
      setInfo({ name: "", email: "", phone: "" });
      setMessage("");
      setMessages([]);
      setConversationId("");
      setBrokerName("");
      setBrokerId("");
      setNeighborhood("");
    }, 300);
  };

  const chatTitle = brokerName ? `Chat com ${brokerName}` : "Chat com Corretor";
  const chatSubtitle = neighborhood ? `Atendimento sobre ${neighborhood}` : "Estamos prontos para ajudar";

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      {/* Hidden programmatic trigger */}
      <button
        id="chat-trigger"
        ref={triggerRef}
        data-chat-widget-trigger
        className="hidden"
        aria-hidden="true"
      />

      {/* Visible floating chat button */}
      {!open && (
        <motion.button
          onClick={() => setOpen(true)}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-secondary text-secondary-foreground shadow-lg hover:shadow-xl flex items-center justify-center transition-shadow"
          title="Chat com Corretor"
        >
          <MessageCircle className="w-7 h-7" />
        </motion.button>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-4 sm:bottom-28 sm:right-6 z-50 w-[320px] sm:w-[380px] bg-background border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            style={{ maxHeight: "70vh" }}
          >
            {/* Header */}
            <div className="bg-primary px-4 py-3 flex items-center justify-between shrink-0">
              <div>
                <p className="text-primary-foreground font-semibold text-sm flex items-center gap-2">
                  {chatTitle}
                  <span className="flex items-center gap-1 text-[10px] font-normal">
                    <Circle className={`w-2 h-2 ${brokersOnline ? "fill-green-400 text-green-400" : "fill-gray-400 text-gray-400"}`} />
                    {brokersOnline ? "Online" : "Offline"}
                  </span>
                </p>
                <p className="text-primary-foreground/60 text-xs">{chatSubtitle}</p>
              </div>
              <button onClick={resetChat} className="text-primary-foreground/70 hover:text-primary-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col">
              {step === "info" && (
                <form onSubmit={handleInfoSubmit} className="p-4 space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {brokerName ? `Você será atendido por ${brokerName}. Preencha seus dados:` : "Preencha seus dados para iniciar o atendimento:"}
                  </p>
                  <Input placeholder="Seu nome *" value={info.name} onChange={(e) => setInfo({ ...info, name: e.target.value })} required />
                  <Input placeholder="Seu e-mail *" type="email" value={info.email} onChange={(e) => setInfo({ ...info, email: e.target.value })} required />
                  <div>
                    <Input placeholder="Seu telefone" value={info.phone} onChange={(e) => setInfo({ ...info, phone: e.target.value })} />
                    <p className="text-[11px] text-muted-foreground/70 mt-1 flex items-center gap-1">🔒 Seu número é privado.</p>
                  </div>
                  <Button type="submit" className="w-full bg-secondary text-secondary-foreground hover:bg-orange-hover">Iniciar Chat</Button>
                </form>
              )}

              {step === "chat" && (
                <>
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ minHeight: 200, maxHeight: 350 }}>
                    <div className="bg-muted rounded-lg p-2 text-xs text-muted-foreground">
                      {brokerName ? `Conectado com ${brokerName}. Envie sua mensagem!` : "Envie sua mensagem e um corretor responderá em breve."}
                    </div>
                    {messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.is_from_client ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${msg.is_from_client ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                          {!msg.is_from_client && msg.sender_name && (
                            <p className="text-[10px] font-semibold mb-0.5 opacity-70">{msg.sender_name}</p>
                          )}
                          {msg.file_type === "image" && msg.file_url && (
                            <img src={msg.file_url} alt={msg.file_name || "imagem"} className="rounded-lg mb-1 max-w-full max-h-40 object-cover cursor-pointer" onClick={() => window.open(msg.file_url, "_blank")} />
                          )}
                          {msg.file_type === "file" && msg.file_url && (
                            <a href={msg.file_url} target="_blank" rel="noopener noreferrer" className="underline text-xs block mb-1">📎 {msg.file_name || "Arquivo"}</a>
                          )}
                          {msg.message && <p className="whitespace-pre-wrap">{msg.message}</p>}
                          <p className={`text-[10px] mt-0.5 ${msg.is_from_client ? "text-primary-foreground/50" : "text-muted-foreground/50"}`}>{formatTime(msg.created_at)}</p>
                        </div>
                      </div>
                    ))}
                    {brokerTyping && (
                      <div className="flex justify-start">
                        <div className="bg-muted text-foreground rounded-xl px-3 py-2 text-sm">
                          <p className="text-xs text-muted-foreground animate-pulse">Corretor está digitando...</p>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input area */}
                  <div className="border-t border-border p-3 shrink-0">
                    <div className="flex items-center gap-2">
                      <input ref={fileInputRef} type="file" accept="image/*,.pdf,.doc,.docx" className="hidden" onChange={handleFileUpload} />
                      <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="text-muted-foreground hover:text-foreground transition-colors" title="Enviar arquivo">
                        {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" />}
                      </button>
                      <Input
                        placeholder="Digite sua mensagem..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1"
                      />
                      <Button size="icon" onClick={() => handleSendMessage()} disabled={loading || (!message.trim() && !uploading)} className="bg-primary text-primary-foreground shrink-0">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;
