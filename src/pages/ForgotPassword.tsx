import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Mail } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
      toast.success("E-mail de recuperação enviado!");
    }
  };

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-bold text-primary-foreground">Recuperar Senha</h1>
        </div>
        <div className="bg-card rounded-2xl p-8 shadow-2xl">
          {sent ? (
            <div className="text-center space-y-4">
              <Mail className="w-12 h-12 text-secondary mx-auto" />
              <p className="text-foreground">Verifique seu e-mail para redefinir a senha.</p>
              <Link to="/login" className="text-secondary hover:underline text-sm font-semibold">Voltar ao login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-xs font-bold text-foreground uppercase tracking-wider mb-2 block">E-mail</label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11 rounded-lg" placeholder="seu@email.com" />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-secondary text-secondary-foreground hover:bg-orange-hover rounded-xl h-12 font-semibold">
                {loading ? "Enviando..." : "Enviar link de recuperação"}
              </Button>
              <div className="text-center">
                <Link to="/login" className="text-sm text-muted-foreground hover:text-secondary">← Voltar ao login</Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
