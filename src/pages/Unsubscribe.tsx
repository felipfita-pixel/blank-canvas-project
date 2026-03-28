import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { MailX, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "valid" | "already" | "invalid" | "success" | "error">("loading");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }
    const validate = async () => {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        const res = await fetch(`${supabaseUrl}/functions/v1/handle-email-unsubscribe?token=${token}`, {
          headers: { apikey: anonKey },
        });
        const data = await res.json();
        if (res.ok && data.valid === true) setStatus("valid");
        else if (data.reason === "already_unsubscribed") setStatus("already");
        else setStatus("invalid");
      } catch {
        setStatus("invalid");
      }
    };
    validate();
  }, [token]);

  const handleUnsubscribe = async () => {
    setProcessing(true);
    try {
      const { error } = await supabase.functions.invoke("handle-email-unsubscribe", {
        body: { token },
      });
      if (error) throw error;
      setStatus("success");
    } catch {
      setStatus("error");
    }
    setProcessing(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card rounded-2xl border p-8 text-center space-y-4">
        {status === "loading" && (
          <>
            <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
            <p className="text-muted-foreground">Verificando...</p>
          </>
        )}
        {status === "valid" && (
          <>
            <MailX className="w-12 h-12 text-primary mx-auto" />
            <h1 className="text-xl font-bold text-foreground">Cancelar inscrição</h1>
            <p className="text-muted-foreground text-sm">Deseja parar de receber e-mails de notificação?</p>
            <Button onClick={handleUnsubscribe} disabled={processing} className="w-full bg-destructive text-destructive-foreground">
              {processing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Confirmar cancelamento
            </Button>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
            <h1 className="text-xl font-bold text-foreground">Inscrição cancelada</h1>
            <p className="text-muted-foreground text-sm">Você não receberá mais e-mails de notificação.</p>
          </>
        )}
        {status === "already" && (
          <>
            <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto" />
            <h1 className="text-xl font-bold text-foreground">Já cancelado</h1>
            <p className="text-muted-foreground text-sm">Sua inscrição já foi cancelada anteriormente.</p>
          </>
        )}
        {(status === "invalid" || status === "error") && (
          <>
            <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
            <h1 className="text-xl font-bold text-foreground">Link inválido</h1>
            <p className="text-muted-foreground text-sm">Este link de cancelamento é inválido ou expirou.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default Unsubscribe;
