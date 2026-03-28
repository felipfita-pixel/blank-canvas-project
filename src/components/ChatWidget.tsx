import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"info" | "chat">("info");
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState({ name: "", email: "", phone: "" });
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [brokerName, setBrokerName] = useState("");
  const [brokerId, setBrokerId] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Listen for programmatic clicks with broker data
  useEffect(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const handleTriggerClick = () => {
      const bid = trigger.getAttribute("data-broker-id") || "";
      const bname = trigger.getAttribute("data-broker-name") || "";
      const hood = trigger.getAttribute("data-neighborhood") || "";
      
      setBrokerId(bid);
      setBrokerName(bname);
      setNeighborhood(hood);
      setOpen(true);

      // Clean up attributes
      trigger.removeAttribute("data-broker-id");
      trigger.removeAttribute("data-broker-name");
      trigger.removeAttribute("data-neighborhood");
    };

    trigger.addEventListener("click", handleTriggerClick);
    return () => trigger.removeEventListener("click", handleTriggerClick);
  }, []);

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!info.name.trim() || !info.email.trim()) {
      toast.error("Preencha nome e e-mail.");
      return;
    }
    // Pre-fill message with neighborhood if available
    if (neighborhood && !message) {
      setMessage(`Olá! Tenho interesse em imóveis no bairro ${neighborhood}. Podem me ajudar?`);
    }
    setStep("chat");
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    setLoading(true);
    const insertData: any = {
      sender_name: info.name.trim(),
      sender_email: info.email.trim(),
      sender_phone: info.phone.trim(),
      message: message.trim(),
      is_from_client: true,
    };
    if (brokerId) {
      insertData.broker_id = brokerId;
    }
    const { error } = await supabase.from("chat_messages").insert(insertData);
    setLoading(false);
    if (error) {
      toast.error("Erro ao enviar mensagem.");
      return;
    }
    // Send email notification
    supabase.functions.invoke("send-transactional-email", {
      body: {
        templateName: "new-chat-notification",
        recipientEmail: "felipfita@gmail.com",
        idempotencyKey: `chat-notify-${Date.now()}`,
        templateData: {
          name: info.name,
          email: info.email,
          phone: info.phone,
          message: message.trim(),
        },
      },
    });
    setMessage("");
    setSent(true);
    toast.success("Mensagem enviada!");
  };

  const resetChat = () => {
    setOpen(false);
    setTimeout(() => {
      setStep("info");
      setInfo({ name: "", email: "", phone: "" });
      setMessage("");
      setSent(false);
      setBrokerName("");
      setBrokerId("");
      setNeighborhood("");
    }, 300);
  };

  const chatTitle = brokerName
    ? `Chat com ${brokerName}`
    : "Chat com Corretor";

  const chatSubtitle = neighborhood
    ? `Atendimento sobre ${neighborhood}`
    : "Estamos prontos para ajudar";

  return (
    <>
      {/* Floating chat button */}
      <motion.button
        ref={triggerRef}
        data-chat-widget-trigger
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
        className="fixed bottom-24 right-4 sm:bottom-28 sm:right-6 z-50 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
      >
        <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-4 sm:bottom-28 sm:right-6 z-50 w-[320px] sm:w-[360px] bg-background border border-border rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-primary px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-primary-foreground font-semibold text-sm">{chatTitle}</p>
                <p className="text-primary-foreground/60 text-xs">{chatSubtitle}</p>
              </div>
              <button onClick={resetChat} className="text-primary-foreground/70 hover:text-primary-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4">
              {step === "info" && (
                <form onSubmit={handleInfoSubmit} className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {brokerName
                      ? `Você será atendido por ${brokerName}. Preencha seus dados:`
                      : "Preencha seus dados para iniciar o atendimento:"}
                  </p>
                  <Input placeholder="Seu nome *" value={info.name} onChange={(e) => setInfo({ ...info, name: e.target.value })} required />
                  <Input placeholder="Seu e-mail *" type="email" value={info.email} onChange={(e) => setInfo({ ...info, email: e.target.value })} required />
                  <div>
                    <Input placeholder="Seu telefone" value={info.phone} onChange={(e) => setInfo({ ...info, phone: e.target.value })} />
                    <p className="text-[11px] text-muted-foreground/70 mt-1 flex items-center gap-1">
                      🔒 Seu número é privado — apenas o especialista que atender você terá acesso.
                    </p>
                  </div>
                  <Button type="submit" className="w-full bg-secondary text-secondary-foreground hover:bg-orange-hover">
                    Iniciar Chat
                  </Button>
                </form>
              )}

              {step === "chat" && (
                <div className="space-y-3">
                  <div className="bg-muted rounded-lg p-3 text-sm text-muted-foreground">
                    {brokerName
                      ? `Você está sendo atendido por ${brokerName}${neighborhood ? ` sobre imóveis em ${neighborhood}` : ""}. Envie sua mensagem!`
                      : "Você está sendo atendido por um de nossos especialistas, aguarde um instante..."}
                  </div>
                  {sent && (
                    <div className="bg-secondary/10 rounded-lg p-3 text-sm text-foreground">
                      ✅ Mensagem enviada! {brokerName || "Um corretor"} responderá em breve.
                    </div>
                  )}
                  <Textarea
                    placeholder="Digite sua mensagem..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={loading || !message.trim()}
                    className="w-full bg-primary text-primary-foreground hover:bg-navy-light"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                    Enviar
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;
