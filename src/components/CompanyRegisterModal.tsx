import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Building2 } from "lucide-react";
import { z } from "zod";

const companySchema = z.object({
  company_name: z.string().trim().min(1, "Nome da empresa é obrigatório").max(200),
  cnpj: z.string().max(20).optional(),
  responsible_name: z.string().trim().min(1, "Nome do responsável é obrigatório").max(100),
  phone: z.string().trim().min(1, "Telefone é obrigatório").max(20),
  email: z.string().trim().email("E-mail inválido").max(255),
  description: z.string().max(1000).optional(),
  company_type: z.enum(["imobiliaria", "construtora"]),
});

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "imobiliaria" | "construtora";
}

const CompanyRegisterModal = ({ open, onOpenChange, type }: Props) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    company_name: "",
    cnpj: "",
    responsible_name: "",
    phone: "",
    email: "",
    description: "",
  });

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = companySchema.safeParse({ ...form, company_type: type });
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("companies" as any).insert({
      company_name: form.company_name.trim(),
      cnpj: form.cnpj.trim(),
      responsible_name: form.responsible_name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      description: form.description.trim(),
      company_type: type,
      status: "pending",
    } as any);

    setLoading(false);
    if (error) {
      toast.error("Erro ao enviar cadastro: " + error.message);
      return;
    }

    toast.success("Cadastro enviado com sucesso! Em breve entraremos em contato.");
    setForm({ company_name: "", cnpj: "", responsible_name: "", phone: "", email: "", description: "" });
    onOpenChange(false);
  };

  const title = type === "imobiliaria" ? "Cadastrar Imobiliária" : "Cadastrar Construtora";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Building2 className="w-5 h-5 text-secondary" />
            {title}
          </DialogTitle>
          <DialogDescription>Preencha os dados para solicitar o cadastro.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-foreground uppercase tracking-wider mb-1.5 block">Nome da Empresa *</label>
            <Input value={form.company_name} onChange={(e) => update("company_name", e.target.value)} required className="h-11 rounded-lg" placeholder="Nome da empresa" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-foreground uppercase tracking-wider mb-1.5 block">CNPJ</label>
              <Input value={form.cnpj} onChange={(e) => update("cnpj", e.target.value)} className="h-11 rounded-lg" placeholder="00.000.000/0000-00" />
            </div>
            <div>
              <label className="text-xs font-bold text-foreground uppercase tracking-wider mb-1.5 block">Responsável *</label>
              <Input value={form.responsible_name} onChange={(e) => update("responsible_name", e.target.value)} required className="h-11 rounded-lg" placeholder="Nome do responsável" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-foreground uppercase tracking-wider mb-1.5 block">Telefone *</label>
              <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} required className="h-11 rounded-lg" placeholder="(21) 99999-9999" />
            </div>
            <div>
              <label className="text-xs font-bold text-foreground uppercase tracking-wider mb-1.5 block">E-mail *</label>
              <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required className="h-11 rounded-lg" placeholder="empresa@email.com" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-foreground uppercase tracking-wider mb-1.5 block">Descrição</label>
            <Textarea value={form.description} onChange={(e) => update("description", e.target.value)} className="rounded-lg min-h-[80px]" placeholder="Conte sobre sua empresa..." />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-secondary text-secondary-foreground hover:bg-orange-hover rounded-xl h-12 font-semibold text-base">
            {loading ? "Enviando..." : "Enviar Cadastro"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CompanyRegisterModal;
