import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import CustomCaptcha, { type CustomCaptchaRef } from "@/components/CustomCaptcha";
import { z } from "zod";

const brokerSchema = z.object({
  full_name: z.string().trim().min(1, "Nome completo é obrigatório").max(100),
  email: z.string().trim().email("E-mail inválido").max(255),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres").regex(/[a-zA-Z]/, "A senha deve conter pelo menos uma letra"),
  confirmPassword: z.string().min(1, "Confirme sua senha"),
  phone: z.string().max(20).optional(),
  creci: z.string().max(30).optional(),
  bio: z.string().max(1000).optional(),
  manager_name: z.string().trim().min(1, "Nome do gerente é obrigatório").max(100),
  company_name: z.string().trim().min(1, "Nome da empresa é obrigatório").max(200),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

const BrokerRegister = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const captchaRef = useRef<CustomCaptchaRef>(null);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    creci: "",
    bio: "",
    manager_name: "",
    company_name: "",
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) {
      toast.error("Você deve aceitar o Termo de Uso para se cadastrar.");
      return;
    }
    if (!captchaVerified) {
      toast.error("Por favor, confirme que você não é um robô");
      return;
    }
    const result = brokerSchema.safeParse(form);
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }
    setLoading(true);

    let authData;
    try {
      const result = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          data: { full_name: form.full_name },
          emailRedirectTo: window.location.origin,
        },
      });

      if (result.error) {
        const msg = result.error.message.toLowerCase();
        if (msg.includes("captcha") || msg.includes("security")) {
          toast.error("Erro de verificação de segurança. Tente novamente.");
        } else {
          toast.error("Erro no cadastro: " + result.error.message);
        }
        setLoading(false);
        captchaRef.current?.reset();
        setCaptchaVerified(false);
        return;
      }
      authData = result.data;
    } catch (err: any) {
      toast.error("Erro inesperado no cadastro. Tente novamente.");
      setLoading(false);
      captchaRef.current?.reset();
      setCaptchaVerified(false);
      return;
    }

    if (authData.user) {
      const { error: brokerError } = await supabase.from("brokers").insert({
        user_id: authData.user.id,
        full_name: form.full_name,
        email: form.email.trim(),
        phone: form.phone,
        creci: form.creci,
        bio: form.bio,
        manager_name: form.manager_name,
        company_name: form.company_name,
        status: "pending",
      });

      if (brokerError) {
        toast.error("Erro ao criar perfil de corretor: " + brokerError.message);
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    toast.success("Cadastro realizado! Verifique seu e-mail e aguarde a aprovação do administrador.");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-bold text-primary-foreground">
            Cadastro de Corretor
          </h1>
          <p className="text-primary-foreground/60 mt-2 font-body">
            Preencha seus dados para solicitar acesso
          </p>
        </div>

        <form onSubmit={handleRegister} className="bg-card rounded-2xl p-8 shadow-2xl space-y-4">
          <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Dados obrigatórios para aprovação
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-foreground uppercase tracking-wider mb-1.5 block">
                  Nome Completo do Corretor *
                </label>
                <Input value={form.full_name} onChange={(e) => update("full_name", e.target.value)} required className="h-11 rounded-lg" placeholder="Nome completo do corretor" />
              </div>
              <div>
                <label className="text-xs font-bold text-foreground uppercase tracking-wider mb-1.5 block">
                  Nome do Gerente *
                </label>
                <Input value={form.manager_name} onChange={(e) => update("manager_name", e.target.value)} required className="h-11 rounded-lg" placeholder="Nome do gerente responsável" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-foreground uppercase tracking-wider mb-1.5 block">
                Empresa que o Corretor Representa *
              </label>
              <Input value={form.company_name} onChange={(e) => update("company_name", e.target.value)} required className="h-11 rounded-lg" placeholder="Nome da empresa / imobiliária" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-foreground uppercase tracking-wider mb-1.5 block">
                E-mail *
              </label>
              <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required className="h-11 rounded-lg" placeholder="joao@email.com" />
            </div>
            <div>
              <label className="text-xs font-bold text-foreground uppercase tracking-wider mb-1.5 block">
                Senha *
              </label>
              <Input type="password" value={form.password} onChange={(e) => update("password", e.target.value)} required className="h-11 rounded-lg" placeholder="Mín. 6 caracteres com letra" />
            </div>
            <div>
              <label className="text-xs font-bold text-foreground uppercase tracking-wider mb-1.5 block">
                Confirmar Senha *
              </label>
              <Input type="password" value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} required className="h-11 rounded-lg" placeholder="Repita a senha" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-foreground uppercase tracking-wider mb-1.5 block">
                Telefone
              </label>
              <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} className="h-11 rounded-lg" placeholder="(21) 99999-9999" />
            </div>
            <div>
              <label className="text-xs font-bold text-foreground uppercase tracking-wider mb-1.5 block">
                CRECI
              </label>
              <Input value={form.creci} onChange={(e) => update("creci", e.target.value)} className="h-11 rounded-lg" placeholder="Número do CRECI" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-foreground uppercase tracking-wider mb-1.5 block">
              Sobre você
            </label>
            <Textarea value={form.bio} onChange={(e) => update("bio", e.target.value)} className="rounded-lg min-h-[80px]" placeholder="Conte um pouco sobre sua experiência..." />
          </div>

          <CustomCaptcha ref={captchaRef} onChange={setCaptchaVerified} />

          <Button type="submit" disabled={loading || !captchaVerified} className="w-full bg-secondary text-secondary-foreground hover:bg-orange-hover rounded-xl h-12 font-semibold text-base">
            <UserPlus className="w-4 h-4 mr-2" />
            {loading ? "Cadastrando..." : "Solicitar Cadastro"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Já tem conta?{" "}
            <Link to="/login" className="text-secondary hover:underline font-semibold">
              Fazer Login
            </Link>
          </p>
          <p className="text-center text-sm text-muted-foreground">
            <Link to="/forgot-password" className="text-secondary hover:underline font-semibold">
              Esqueceu sua senha?
            </Link>
          </p>
        </form>

        <div className="text-center mt-6">
          <Link to="/" className="text-primary-foreground/60 hover:text-primary-foreground text-sm transition-colors">
            ← Voltar ao site
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BrokerRegister;
