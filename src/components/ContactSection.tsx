import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Send, Phone, Mail, Instagram, Facebook } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import CustomCaptcha, { type CustomCaptchaRef } from "@/components/CustomCaptcha";

const ContactSection = () => {
  const { get } = useSiteContent();
  const section = get("contact");
  const c = section.content;

  const [formData, setFormData] = useState({ name: "", email: "", phone: "", neighborhood: "", message: "" });
  const [sending, setSending] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const captchaRef = useRef<CustomCaptchaRef>(null);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error("Preencha nome e e-mail");
      return;
    }
    if (!emailRegex.test(formData.email.trim())) {
      toast.error("Informe um e-mail válido");
      return;
    }
    if (!captchaVerified) {
      toast.error("Por favor, confirme que você não é um robô");
      return;
    }
    setSending(true);
    const id = crypto.randomUUID();
    const { error } = await supabase.from("contact_messages").insert({
      id,
      name: formData.name,
      email: formData.email,
      phone: formData.phone || null,
      neighborhood: formData.neighborhood || null,
      message: formData.message || null,
    });
    if (error) {
      setSending(false);
      toast.error("Erro ao enviar mensagem");
      return;
    }
    // Send email notification
    supabase.functions.invoke("send-transactional-email", {
      body: {
        templateName: "new-contact-notification",
        recipientEmail: "felipfita@gmail.com",
        idempotencyKey: `contact-notify-${id}`,
        templateData: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          neighborhood: formData.neighborhood,
          message: formData.message,
        },
      },
    });
    setSending(false);
    toast.success("Mensagem enviada com sucesso!");
    setFormData({ name: "", email: "", phone: "", neighborhood: "", message: "" });
    setCaptchaVerified(false);
    captchaRef.current?.reset();
  };

  return (
    <section id="contact" className="section-padding bg-muted/30">
      <div className="container-main">
        <div className="max-w-5xl mx-auto bg-card rounded-3xl overflow-hidden shadow-2xl shadow-navy-dark/10">
          <div className="grid lg:grid-cols-[380px_1fr]">
            <div className="bg-gradient-to-b from-navy to-navy-dark p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
              <div>
                <h2 className="text-3xl font-heading font-bold text-primary-foreground mb-4">{section.title}</h2>
                <p className="text-primary-foreground/70 text-sm leading-relaxed">{section.subtitle}</p>
                <div className="mt-8 space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center"><Phone className="w-4 h-4 text-secondary" /></div>
                    <div>
                      <span className="text-xs font-semibold text-secondary uppercase tracking-wider">Telefone</span>
                      <p className="text-primary-foreground font-semibold text-sm">{c.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center"><Mail className="w-4 h-4 text-secondary" /></div>
                    <div>
                      <span className="text-xs font-semibold text-secondary uppercase tracking-wider">E-mail</span>
                      <p className="text-primary-foreground font-semibold text-sm">{c.email}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-10">
                <div className="border-t border-primary-foreground/10 pt-6 flex gap-3">
                  {c.instagram && (
                    <a href={c.instagram} target="_blank" rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center text-primary-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors">
                      <Instagram className="w-4 h-4" />
                    </a>
                  )}
                  {c.facebook && (
                    <a href={c.facebook} target="_blank" rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center text-primary-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors">
                      <Facebook className="w-4 h-4" />
                    </a>
                  )}
                  {!c.instagram && !c.facebook && (
                    <>
                      <a href="#" className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center text-primary-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors"><Instagram className="w-4 h-4" /></a>
                      <a href="#" className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center text-primary-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors"><Facebook className="w-4 h-4" /></a>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 lg:p-10">
              <div className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-bold text-foreground uppercase tracking-wider mb-2 block">Nome Completo</label>
                    <Input placeholder="Ex: João Silva" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="border-border rounded-lg h-11" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-foreground uppercase tracking-wider mb-2 block">E-mail</label>
                    <Input type="email" placeholder="Ex: joao@email.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="border-border rounded-lg h-11" />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-bold text-foreground uppercase tracking-wider mb-2 block">Telefone / WhatsApp</label>
                    <Input placeholder="Ex: (21) 99999-9999" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="border-border rounded-lg h-11" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-foreground uppercase tracking-wider mb-2 block">Bairro de Interesse</label>
                    <Input placeholder="Barra da Tijuca" value={formData.neighborhood} onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })} className="border-border rounded-lg h-11" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider mb-2 block">Sua Mensagem</label>
                  <Textarea placeholder="Como podemos te ajudar?" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="border-border rounded-lg min-h-[120px]" />
                </div>
                <CustomCaptcha ref={captchaRef} onChange={setCaptchaVerified} />
                <Button onClick={handleSubmit} disabled={sending || !captchaVerified} className="w-full bg-secondary text-secondary-foreground hover:bg-orange-hover rounded-xl font-semibold py-6 text-base h-auto shadow-lg shadow-secondary/30">
                  {sending ? "Enviando..." : "Enviar Mensagem"}
                  <Send className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
