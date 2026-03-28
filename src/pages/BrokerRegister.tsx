import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import CustomCaptcha, { type CustomCaptchaRef } from "@/components/CustomCaptcha";

const BrokerRegister = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const captchaRef = useRef<CustomCaptchaRef>(null);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
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
    if (!captchaVerified) {
      toast.error("Por favor, confirme que você não é um robô");
      return;
    }
    if (form.password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        data: { full_name: form.full_name },
        emailRedirectTo: window.location.origin,
      },
    });

    if (authError) {
      toast.error("Erro no cadastro: " + authError.message);
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
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-foreground uppercase tracking-wider mb-1.5 block">
                Nome Completo *
              </label>
              <Input value={form.full_name} onChange={(e) => update("full_name", e.target.value)} required className="h-11 rounded-lg" placeholder="João Silva" />
            </div>
            <div>
              <label className="text-xs font-bold text-foreground uppercase tracking-wider mb-1.5 block">
                E-mail *
              </label>
              <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required className="h-11 rounded-lg" placeholder="joao@email.com" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-foreground uppercase tracking-wider mb-1.5 block">
                Senha *
              </label>
              <Input type="password" value={form.password} onChange={(e) => update("password", e.target.value)} required className="h-11 rounded-lg" placeholder="Mínimo 6 caracteres" />
            </div>
            <div>
              <label className="text-xs font-bold text-foreground uppercase tracking-wider mb-1.5 block">
                Telefone
              </label>
              <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} className="h-11 rounded-lg" placeholder="(21) 99999-9999" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-foreground uppercase tracking-wider mb-1.5 block">
              CRECI
            </label>
            <Input value={form.creci} onChange={(e) => update("creci", e.target.value)} className="h-11 rounded-lg" placeholder="Número do CRECI" />
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
