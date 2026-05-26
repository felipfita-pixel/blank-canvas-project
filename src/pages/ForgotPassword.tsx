import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Mail, MessageCircle, Copy, Check } from "lucide-react";

type Channel = "email" | "whatsapp";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [channel, setChannel] = useState<Channel>("email");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [waLink, setWaLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (cleanEmail.length < 5 || !cleanEmail.includes("@")) {
      toast.error("Informe um e-mail válido");
      return;
    }
    setLoading(true);
    const redirectTo = `${window.location.origin}/reset-password`;

    if (channel === "email") {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, { redirectTo });
      setLoading(false);
      if (error) {
        toast.error(error.message);
      } else {
        setSent(true);
        toast.success("E-mail de recuperação enviado!");
      }
      return;
    }

    // WhatsApp
    const { data, error } = await supabase.functions.invoke("generate-reset-link", {
      body: { email: cleanEmail, redirectTo },
    });
    setLoading(false);
    if (error) {
      toast.error("Não foi possível gerar o link. Tente novamente.");
      return;
    }
    const link = (data as { link?: string | null })?.link ?? null;
    if (!link) {
      // Same UX as success to avoid revealing whether the email exists
      setSent(true);
      toast.success("Se a conta existir, o link estará disponível.");
      return;
    }
    const text = `Recuperação de senha — Corretores RJ:\n${link}\n\nO link expira em alguns minutos. Após abrir, cadastre uma nova senha.`;
    const waHref = `https://wa.me/?text=${encodeURIComponent(text)}`;
    setWaLink(link);
    setSent(true);
    window.open(waHref, "_blank", "noopener,noreferrer");
  };

  const copyLink = async () => {
    if (!waLink) return;
    await navigator.clipboard.writeText(waLink);
    setCopied(true);
    toast.success("Link copiado");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-bold text-primary-foreground">Recuperar Senha</h1>
          <p className="text-primary-foreground/60 mt-2 font-body text-sm">
            Escolha como deseja receber o link e cadastre uma nova senha
          </p>
        </div>
        <div className="bg-card rounded-2xl p-8 shadow-2xl">
          {sent ? (
            <div className="text-center space-y-4">
              {channel === "email" ? (
                <>
                  <Mail className="w-12 h-12 text-secondary mx-auto" />
                  <p className="text-foreground">Verifique seu e-mail para redefinir a senha.</p>
                </>
              ) : (
                <>
                  <MessageCircle className="w-12 h-12 text-secondary mx-auto" />
                  <p className="text-foreground">
                    {waLink
                      ? "Abrimos o WhatsApp com o link pronto. Envie para você mesmo e abra para cadastrar a nova senha."
                      : "Se a conta existir, geramos o link. Tente novamente caso o WhatsApp não tenha aberto."}
                  </p>
                  {waLink && (
                    <div className="space-y-2">
                      <Button
                        type="button"
                        onClick={() =>
                          window.open(
                            `https://wa.me/?text=${encodeURIComponent(`Recuperação de senha — Corretores RJ:\n${waLink}`)}`,
                            "_blank",
                            "noopener,noreferrer",
                          )
                        }
                        className="w-full bg-secondary text-secondary-foreground hover:bg-orange-hover rounded-xl"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" /> Abrir WhatsApp novamente
                      </Button>
                      <Button type="button" variant="outline" onClick={copyLink} className="w-full rounded-xl">
                        {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                        {copied ? "Copiado" : "Copiar link"}
                      </Button>
                    </div>
                  )}
                </>
              )}
              <Link to="/login" className="text-secondary hover:underline text-sm font-semibold inline-block">
                Voltar ao login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-xs font-bold text-foreground uppercase tracking-wider mb-2 block">E-mail</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  maxLength={255}
                  className="h-11 rounded-lg"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground uppercase tracking-wider mb-2 block">
                  Como receber o link
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setChannel("email")}
                    className={`flex items-center justify-center gap-2 h-11 rounded-lg border-2 text-sm font-semibold transition-colors ${
                      channel === "email"
                        ? "border-secondary bg-secondary/10 text-secondary"
                        : "border-border text-muted-foreground hover:border-secondary/50"
                    }`}
                  >
                    <Mail className="w-4 h-4" /> E-mail
                  </button>
                  <button
                    type="button"
                    onClick={() => setChannel("whatsapp")}
                    className={`flex items-center justify-center gap-2 h-11 rounded-lg border-2 text-sm font-semibold transition-colors ${
                      channel === "whatsapp"
                        ? "border-secondary bg-secondary/10 text-secondary"
                        : "border-border text-muted-foreground hover:border-secondary/50"
                    }`}
                  >
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </button>
                </div>
                {channel === "whatsapp" && (
                  <p className="text-xs text-muted-foreground mt-2">
                    O WhatsApp abrirá com o link pronto para você enviar para si mesmo.
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-secondary text-secondary-foreground hover:bg-orange-hover rounded-xl h-12 font-semibold"
              >
                {loading ? "Aguarde..." : channel === "email" ? "Enviar por e-mail" : "Gerar link no WhatsApp"}
              </Button>
              <div className="text-center">
                <Link to="/login" className="text-sm text-muted-foreground hover:text-secondary">
                  ← Voltar ao login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
