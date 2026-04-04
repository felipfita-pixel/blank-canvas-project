import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, CheckCircle2, Megaphone, HeartHandshake } from "lucide-react";

const formSchema = z.object({
  name: z.string().trim().min(2, "Nome é obrigatório").max(100),
  phone: z.string().trim().min(8, "Telefone inválido").max(20),
  email: z.string().trim().email("E-mail inválido").max(255),
  cep: z.string().trim().min(8, "CEP inválido").max(10),
  property_type: z.string().min(1, "Selecione o tipo do imóvel"),
  bedrooms: z.number().min(0).max(20),
  area: z.number().min(0).max(100000),
  price_range: z.string().optional(),
  description: z.string().max(1000).optional(),
});

const benefits = [
  { icon: FileText, title: "Anuncie grátis e", subtitle: "em poucos cliques" },
  { icon: CheckCircle2, title: "Equipe dedicada para", subtitle: "cuidar do seu imóvel." },
  { icon: Megaphone, title: "Divulgação ampla", subtitle: "e segmentada." },
  { icon: HeartHandshake, title: "Atendimento humano", subtitle: "do início ao fim." },
];

const propertyTypes = [
  { value: "apartment", label: "Apartamento" },
  { value: "house", label: "Casa" },
  { value: "penthouse", label: "Cobertura" },
  { value: "land", label: "Terreno" },
  { value: "commercial", label: "Comercial" },
  { value: "other", label: "Outro" },
];

const priceRanges = [
  { value: "ate-300k", label: "Até R$ 300.000" },
  { value: "300k-500k", label: "R$ 300.000 - R$ 500.000" },
  { value: "500k-1m", label: "R$ 500.000 - R$ 1.000.000" },
  { value: "1m-2m", label: "R$ 1.000.000 - R$ 2.000.000" },
  { value: "acima-2m", label: "Acima de R$ 2.000.000" },
];

const initialForm = {
  name: "",
  phone: "",
  email: "",
  cep: "",
  property_type: "apartment",
  bedrooms: 0,
  area: 0,
  price_range: "",
  description: "",
};

const AnunciarForm = () => {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string | number) =>
    setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = formSchema.safeParse(form);
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    setLoading(true);
    const id = crypto.randomUUID();
    try {
      const { error } = await supabase.from("property_listings" as any).insert({
        id,
        name: form.name,
        email: form.email,
        phone: form.phone,
        cep: form.cep,
        property_type: form.property_type,
        bedrooms: form.bedrooms,
        area: form.area,
        price_range: form.price_range,
        description: form.description,
      } as any);
      if (error) throw error;

      // Send confirmation email
      await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "property-listing-confirmation",
          recipientEmail: form.email,
          idempotencyKey: `listing-confirm-${id}`,
          templateData: { name: form.name },
        },
      });

      toast.success("Dados enviados com sucesso! Entraremos em contato em breve.");
      setForm(initialForm);
    } catch {
      toast.error("Erro ao enviar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-primary py-16 sm:py-20 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-secondary/30 blur-3xl" />
      </div>

      <div className="container-main px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-primary-foreground mb-8">
              Preencha os dados abaixo
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Row 1: Name + Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="border-b border-primary-foreground/30 pb-2">
                  <input
                    type="text"
                    placeholder="Nome"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    className="w-full bg-transparent text-primary-foreground placeholder:text-primary-foreground/60 font-body text-sm sm:text-base outline-none"
                    required
                  />
                </div>
                <div className="border-b border-primary-foreground/30 pb-2 flex items-center gap-2">
                  <span className="text-primary-foreground/60 text-sm">+55</span>
                  <input
                    type="tel"
                    placeholder="Telefone"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    className="w-full bg-transparent text-primary-foreground placeholder:text-primary-foreground/60 font-body text-sm sm:text-base outline-none"
                    required
                  />
                </div>
              </div>

              {/* Row 2: Email */}
              <div className="border-b border-primary-foreground/30 pb-2">
                <input
                  type="email"
                  placeholder="Seu melhor e-mail"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  className="w-full bg-transparent text-primary-foreground placeholder:text-primary-foreground/60 font-body text-sm sm:text-base outline-none"
                  required
                />
              </div>

              {/* Row 3: CEP + Property Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="border-b border-primary-foreground/30 pb-2">
                  <input
                    type="text"
                    placeholder="CEP do Imóvel"
                    value={form.cep}
                    onChange={(e) => update("cep", e.target.value)}
                    className="w-full bg-transparent text-primary-foreground placeholder:text-primary-foreground/60 font-body text-sm sm:text-base outline-none"
                    required
                  />
                </div>
                <Select
                  value={form.property_type}
                  onValueChange={(v) => update("property_type", v)}
                >
                  <SelectTrigger className="bg-transparent border-0 border-b border-primary-foreground/30 rounded-none text-primary-foreground font-body text-sm sm:text-base h-auto pb-2 px-0 focus:ring-0 shadow-none">
                    <SelectValue placeholder="Tipo do imóvel" />
                  </SelectTrigger>
                  <SelectContent>
                    {propertyTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Row 4: Bedrooms + Area */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="border-b border-primary-foreground/30 pb-2">
                  <input
                    type="number"
                    placeholder="Quartos"
                    min={0}
                    max={20}
                    value={form.bedrooms || ""}
                    onChange={(e) => update("bedrooms", parseInt(e.target.value) || 0)}
                    className="w-full bg-transparent text-primary-foreground placeholder:text-primary-foreground/60 font-body text-sm sm:text-base outline-none"
                  />
                </div>
                <div className="border-b border-primary-foreground/30 pb-2">
                  <input
                    type="number"
                    placeholder="Área (m²)"
                    min={0}
                    value={form.area || ""}
                    onChange={(e) => update("area", parseFloat(e.target.value) || 0)}
                    className="w-full bg-transparent text-primary-foreground placeholder:text-primary-foreground/60 font-body text-sm sm:text-base outline-none"
                  />
                </div>
              </div>

              {/* Row 5: Price Range */}
              <Select
                value={form.price_range}
                onValueChange={(v) => update("price_range", v)}
              >
                <SelectTrigger className="bg-transparent border-0 border-b border-primary-foreground/30 rounded-none text-primary-foreground font-body text-sm sm:text-base h-auto pb-2 px-0 focus:ring-0 shadow-none">
                  <SelectValue placeholder="Faixa de preço estimada" />
                </SelectTrigger>
                <SelectContent>
                  {priceRanges.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Row 6: Description */}
              <div className="border-b border-primary-foreground/30 pb-2">
                <textarea
                  placeholder="Descrição do imóvel (opcional)"
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  rows={3}
                  className="w-full bg-transparent text-primary-foreground placeholder:text-primary-foreground/60 font-body text-sm sm:text-base outline-none resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 rounded-full px-8 py-3 font-semibold text-base h-auto"
              >
                {loading ? "Enviando..." : "Quero anunciar"}
              </Button>
            </form>
          </motion.div>

          {/* Benefits Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-2 gap-4"
          >
            {benefits.map((b, i) => (
              <div
                key={i}
                className="border border-primary-foreground/20 rounded-xl p-5 sm:p-6 flex items-start gap-3 backdrop-blur-sm bg-primary-foreground/5"
              >
                <b.icon className="w-7 h-7 text-secondary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-primary-foreground font-heading font-semibold text-sm sm:text-base leading-tight">
                    {b.title}
                  </p>
                  <p className="text-primary-foreground/70 font-body text-xs sm:text-sm mt-0.5">
                    {b.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AnunciarForm;
