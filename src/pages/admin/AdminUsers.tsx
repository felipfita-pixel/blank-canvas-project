import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ShieldCheck, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface AdminUser {
  user_id: string;
  email: string;
  full_name: string;
}

const AdminUsers = () => {
  const { user } = useAuth();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [adding, setAdding] = useState(false);

  const fetchAdmins = async () => {
    const { data: roles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    if (!roles || roles.length === 0) {
      setAdmins([]);
      setLoading(false);
      return;
    }

    const userIds = roles.map((r) => r.user_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, email, full_name")
      .in("user_id", userIds);

    setAdmins(profiles || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleAdd = async () => {
    if (!email.trim()) return;
    setAdding(true);

    // Find user by email in profiles
    const { data: profile } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("email", email.trim())
      .maybeSingle();

    if (!profile) {
      toast.error("Usuário não encontrado. Ele precisa criar uma conta primeiro.");
      setAdding(false);
      return;
    }

    // Check if already admin
    const { data: existing } = await supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", profile.user_id)
      .eq("role", "admin")
      .maybeSingle();

    if (existing) {
      toast.error("Este usuário já é admin.");
      setAdding(false);
      return;
    }

    const { error } = await supabase.from("user_roles").insert({
      user_id: profile.user_id,
      role: "admin" as const,
    });

    setAdding(false);
    if (error) {
      toast.error("Erro ao adicionar admin: " + error.message);
    } else {
      toast.success("Admin adicionado com sucesso!");
      setEmail("");
      fetchAdmins();
    }
  };

  const handleRemove = async (userId: string) => {
    if (userId === user?.id) {
      toast.error("Você não pode remover a si mesmo.");
      return;
    }

    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId)
      .eq("role", "admin");

    if (error) {
      toast.error("Erro ao remover admin: " + error.message);
    } else {
      toast.success("Admin removido.");
      fetchAdmins();
    }
  };

  if (loading) return <div className="text-center py-12 text-muted-foreground">Carregando...</div>;

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-foreground mb-6">Administradores</h1>

      <div className="bg-card rounded-xl border border-border p-6 mb-6">
        <h3 className="font-bold text-foreground mb-3">Adicionar novo admin</h3>
        <p className="text-sm text-muted-foreground mb-4">
          O usuário precisa já ter uma conta criada no sistema. Informe o e-mail dele abaixo.
        </p>
        <div className="flex gap-3">
          <Input
            placeholder="E-mail do novo admin"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="max-w-sm rounded-lg"
          />
          <Button onClick={handleAdd} disabled={adding} className="bg-secondary text-secondary-foreground hover:bg-orange-hover rounded-xl">
            <Plus className="w-4 h-4 mr-2" />
            {adding ? "Adicionando..." : "Adicionar"}
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="divide-y divide-border">
          {admins.map((admin) => (
            <div key={admin.user_id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-navy flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{admin.full_name || "Sem nome"}</p>
                  <p className="text-xs text-muted-foreground">{admin.email}</p>
                </div>
              </div>
              {admin.user_id !== user?.id && (
                <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => handleRemove(admin.user_id)}>
                  <Trash2 className="w-4 h-4 mr-1" /> Remover
                </Button>
              )}
            </div>
          ))}
          {admins.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm">Nenhum admin encontrado.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
