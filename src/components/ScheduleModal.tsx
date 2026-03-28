import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CalendarCheck, Loader2 } from "lucide-react";

interface ScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ScheduleModal = ({ open, onOpenChange }: ScheduleModalProps) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", whatsapp: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Preencha nome e e-mail.");
      return;
    }
    setLoading(true);
    const id = crypto.randomUUID();
    const { error } = await supabase.from("scheduling_requests").insert({
      id,
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      whatsapp: form.whatsapp.trim(),
      message: form.message.trim(),
    });
    if (error) {
      setLoading(false);
      toast.error("Erro ao enviar. Tente novamente.");
      return;
    }
    // Send email notification
    supabase.functions.invoke("send-transactional-email", {
      body: {
        templateName: "new-scheduling-notification",
        recipientEmail: "felipfita@gmail.com",
        idempotencyKey: `sched-notify-${id}`,
        templateData: {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          whatsapp: form.whatsapp.trim(),
          message: form.message.trim(),
        },
      },
    });
    setLoading(false);
    toast.success("Solicitação enviada! Em breve entraremos em contato.");
    setForm({ name: "", email: "", phone: "", whatsapp: "", message: "" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <CalendarCheck className="w-5 h-5" />
            Agendar Consultoria
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="sched-name">Nome *</Label>
            <Input id="sched-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Seu nome completo" required />
          </div>
          <div>
            <Label htmlFor="sched-email">E-mail *</Label>
            <Input id="sched-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="seu@email.com" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="sched-phone">Telefone</Label>
              <Input id="sched-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(21) 99999-9999" />
            </div>
            <div>
              <Label htmlFor="sched-whatsapp">WhatsApp</Label>
              <Input id="sched-whatsapp" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="(21) 99999-9999" />
            </div>
          </div>
          <div>
            <Label htmlFor="sched-msg">Mensagem</Label>
            <Textarea id="sched-msg" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Qual imóvel ou bairro te interessa?" rows={3} />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-secondary text-secondary-foreground hover:bg-orange-hover">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Enviar Solicitação
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleModal;
