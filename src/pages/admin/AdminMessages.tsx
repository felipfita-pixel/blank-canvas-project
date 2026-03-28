import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Eye, Mail, MessageSquare } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  neighborhood: string;
  message: string;
  read: boolean;
  created_at: string;
}

interface ChatMessage {
  id: string;
  sender_name: string;
  sender_email: string;
  sender_phone: string;
  message: string;
  read: boolean;
  created_at: string;
  broker_id: string | null;
}

const AdminMessages = () => {
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    setLoading(true);
    const [contactRes, chatRes] = await Promise.all([
      supabase.from("contact_messages").select("*").order("created_at", { ascending: false }),
      supabase.from("chat_messages").select("*").order("created_at", { ascending: false }),
    ]);
    if (contactRes.error) toast.error(contactRes.error.message);
    else setContactMessages((contactRes.data as ContactMessage[]) ?? []);
    if (chatRes.error) toast.error(chatRes.error.message);
    else setChatMessages((chatRes.data as ChatMessage[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchMessages(); }, []);

  const markContactRead = async (id: string) => {
    await supabase.from("contact_messages").update({ read: true }).eq("id", id);
    fetchMessages();
  };

  const markChatRead = async (id: string) => {
    await supabase.from("chat_messages").update({ read: true }).eq("id", id);
    fetchMessages();
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const unreadContacts = contactMessages.filter(m => !m.read).length;
  const unreadChats = chatMessages.filter(m => !m.read).length;

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-foreground mb-6">Mensagens</h1>

      <Tabs defaultValue="contact">
        <TabsList className="mb-4">
          <TabsTrigger value="contact" className="gap-2">
            <Mail className="w-4 h-4" />
            Contato
            {unreadContacts > 0 && <Badge className="bg-destructive text-destructive-foreground text-xs ml-1">{unreadContacts}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="chat" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            Chat
            {unreadChats > 0 && <Badge className="bg-destructive text-destructive-foreground text-xs ml-1">{unreadChats}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="contact">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Carregando...</div>
          ) : contactMessages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">Nenhuma mensagem de contato recebida.</div>
          ) : (
            <div className="space-y-4">
              {contactMessages.map((m) => (
                <div key={m.id} className={`bg-card rounded-xl border p-5 ${m.read ? "border-border opacity-70" : "border-secondary/40 shadow-sm"}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-foreground">{m.name}</h3>
                        {!m.read && <Badge className="bg-secondary text-secondary-foreground text-xs">Nova</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{m.email} {m.phone && `• ${m.phone}`}</p>
                      {m.neighborhood && <p className="text-sm text-muted-foreground">Bairro: {m.neighborhood}</p>}
                      <p className="text-sm text-foreground mt-3 whitespace-pre-wrap">{m.message}</p>
                      <p className="text-xs text-muted-foreground mt-3">{formatDate(m.created_at)}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      {!m.read && (
                        <Button size="sm" variant="ghost" onClick={() => markContactRead(m.id)} className="text-secondary hover:bg-secondary/10">
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="chat">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Carregando...</div>
          ) : chatMessages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">Nenhuma mensagem de chat recebida.</div>
          ) : (
            <div className="space-y-4">
              {chatMessages.map((m) => (
                <div key={m.id} className={`bg-card rounded-xl border p-5 ${m.read ? "border-border opacity-70" : "border-secondary/40 shadow-sm"}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-foreground">{m.sender_name}</h3>
                        {!m.read && <Badge className="bg-secondary text-secondary-foreground text-xs">Nova</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{m.sender_email} {m.sender_phone && `• ${m.sender_phone}`}</p>
                      <p className="text-sm text-foreground mt-3 whitespace-pre-wrap">{m.message}</p>
                      <p className="text-xs text-muted-foreground mt-3">{formatDate(m.created_at)}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      {!m.read && (
                        <Button size="sm" variant="ghost" onClick={() => markChatRead(m.id)} className="text-secondary hover:bg-secondary/10">
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminMessages;
