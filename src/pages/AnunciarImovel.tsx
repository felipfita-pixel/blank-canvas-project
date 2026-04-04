import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle2, Megaphone, HeartHandshake } from "lucide-react";
import heroImg from "@/assets/anunciar-hero.jpg";

const formSchema = z.object({
  name: z.string().trim().min(2, "Nome é obrigatório").max(100),
  phone: z.string().trim().min(8, "Telefone inválido").max(20),
  email: z.string().trim().email("E-mail inválido").max(255),
  cep: z.string().trim().min(8, "CEP inválido").max(10),
});

const benefits = [
  { icon: FileText, title: "Anuncie grátis e", subtitle: "em poucos cliques" },
  { icon: CheckCircle2, title: "Equipe dedicada para", subtitle: "cuidar do seu imóvel." },
  { icon: Megaphone, title: "Divulgação ampla", subtitle: "e segmentada." },
  { icon: HeartHandshake, title: "Atendimento humano", subtitle: "do início ao fim." },
];

const AnunciarImovel = () => {
  const [form, setForm] = useState({ name: "", phone: "", email: "", cep: "" });
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = formSchema.safeParse(form);
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("contact_messages").insert({
        name: form.name,
        email: form.email,
        phone: form.phone,
        neighborhood: `CEP: ${form.cep}`,
        message: "Solicitação de anúncio de imóvel via página Anunciar Imóvel",
      });
      if (error) throw error;

      toast.success("Dados enviados com sucesso! Entraremos em contato em breve.");
      setForm({ name: "", phone: "", email: "", cep: "" });
    } catch {
      toast.error("Erro ao enviar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 pb-16 sm:pb-20 bg-background">
        <div className="container-main px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                Venda seu imóvel muito mais rápido conosco.
              </h1>
              <p className="mt-5 text-muted-foreground font-body text-base sm:text-lg leading-relaxed max-w-lg">
                Seu imóvel será avaliado por especialistas e gratuitamente divulgado nos principais
                portais imobiliários e todas as redes sociais. Tudo de forma simples, com total
                segurança e 100% digital.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex justify-center lg:justify-end"
            >
              <img
                src={heroImg}
                alt="Casal feliz em apartamento moderno"
                className="rounded-2xl shadow-xl w-full max-w-md lg:max-w-lg object-cover"
                width={800}
                height={600}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Form + Benefits Section */}
      <section className="bg-primary py-16 sm:py-20 relative overflow-hidden">
        {/* Decorative background pattern */}
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
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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

      <Footer />
    </div>
  );
};

export default AnunciarImovel;
