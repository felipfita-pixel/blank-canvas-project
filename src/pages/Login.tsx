import { useState, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { LogIn, Eye, EyeOff } from "lucide-react";
import CustomCaptcha, { type CustomCaptchaRef } from "@/components/CustomCaptcha";

type LoginLocationState = {
  roleHint?: "broker" | "admin";
};

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const captchaRef = useRef<CustomCaptchaRef>(null);
  const roleHint = (location.state as LoginLocationState | null)?.roleHint;

  const loginTitle =
    roleHint === "admin"
      ? "Acesso do Administrador"
      : roleHint === "broker"
        ? "Acesso do Corretor"
        : "Acesso de Corretores e Administradores";

  const loginDescription =
    roleHint === "admin"
      ? "Faça login para acessar o painel de controle"
      : roleHint === "broker"
        ? "Faça login para acessar seu atendimento"
        : "Faça login para acessar sua área";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaVerified) {
      toast.error("Por favor, confirme que você não é um robô");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      setLoading(false);
      toast.error("Erro ao fazer login: " + error.message);
      captchaRef.current?.reset();
      setCaptchaVerified(false);
      return;
    }
    const { data: roleRows, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id);

    if (roleError) {
      setLoading(false);
      toast.error("Não foi possível validar suas permissões. Tente novamente.");
      return;
    }

    const roles = (roleRows ?? []).map((entry) => entry.role);

    setLoading(false);
    toast.success("Login realizado com sucesso!");
    if (roles.includes("admin")) {
      navigate("/admin");
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-bold text-primary-foreground">
            {loginTitle}
          </h1>
          <p className="text-primary-foreground/60 mt-2 font-body">
            {loginDescription}
          </p>
        </div>

        <form onSubmit={handleLogin} className="bg-card rounded-2xl p-8 shadow-2xl space-y-5">
          <div>
            <label className="text-xs font-bold text-foreground uppercase tracking-wider mb-2 block">E-mail</label>
            <Input type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11 rounded-lg" />
          </div>
          <div>
            <label className="text-xs font-bold text-foreground uppercase tracking-wider mb-2 block">Senha</label>
            <div className="relative">
              <Input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-11 rounded-lg pr-10" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <CustomCaptcha ref={captchaRef} onChange={setCaptchaVerified} />

          <Button type="submit" disabled={loading || !captchaVerified} className="w-full bg-secondary text-secondary-foreground hover:bg-orange-hover rounded-xl h-12 font-semibold text-base">
            <LogIn className="w-4 h-4 mr-2" />
            {loading ? "Aguarde..." : "Entrar"}
          </Button>

          <div className="text-center space-y-2">
            <Link to="/forgot-password" className="text-sm text-muted-foreground hover:text-secondary transition-colors">
              Esqueceu a senha?
            </Link>
            <p className="text-sm text-muted-foreground">
              É corretor?{" "}
              <Link to="/broker-register" className="text-secondary hover:underline font-semibold">Cadastre-se aqui</Link>
            </p>
          </div>
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

export default Login;
