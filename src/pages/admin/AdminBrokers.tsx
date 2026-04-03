import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Check, X, Trash2, RotateCcw, Archive } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Broker {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  creci: string;
  bio: string;
  status: string;
  created_at: string;
  deleted_at: string | null;
}

const AdminBrokers = () => {
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [deletedBrokers, setDeletedBrokers] = useState<Broker[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBrokers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("brokers")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setBrokers((data as Broker[]) ?? []);

    const { data: deleted, error: delErr } = await supabase
      .from("brokers")
      .select("*")
      .not("deleted_at", "is", null)
      .order("deleted_at", { ascending: false });
    if (delErr) toast.error(delErr.message);
    else setDeletedBrokers((deleted as Broker[]) ?? []);

    setLoading(false);
  };

  useEffect(() => { fetchBrokers(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("brokers").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success(status === "approved" ? "Corretor aprovado!" : "Corretor rejeitado.");
      fetchBrokers();
    }
  };

  const softDeleteBroker = async (id: string) => {
    const { error } = await supabase
      .from("brokers")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Corretor movido para a lixeira."); fetchBrokers(); }
  };

  const restoreBroker = async (id: string) => {
    const { error } = await supabase
      .from("brokers")
      .update({ deleted_at: null })
      .eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Corretor reintegrado ao sistema!"); fetchBrokers(); }
  };

  const permanentDeleteBroker = async (id: string) => {
    if (!confirm("Tem certeza? Esta ação é irreversível.")) return;
    const { error } = await supabase.from("brokers").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Corretor excluído permanentemente."); fetchBrokers(); }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: "bg-orange/20 text-orange border-orange/30",
      approved: "bg-green-100 text-green-700 border-green-200",
      rejected: "bg-destructive/20 text-destructive border-destructive/30",
    };
    const labels: Record<string, string> = { pending: "Pendente", approved: "Aprovado", rejected: "Rejeitado" };
    return <Badge variant="outline" className={map[status]}>{labels[status]}</Badge>;
  };

  const BrokerTable = ({ data, isTrash }: { data: Broker[]; isTrash?: boolean }) => (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left text-xs font-bold text-muted-foreground uppercase tracking-wider px-4 py-3">Nome</th>
              <th className="text-left text-xs font-bold text-muted-foreground uppercase tracking-wider px-4 py-3">E-mail</th>
              <th className="text-left text-xs font-bold text-muted-foreground uppercase tracking-wider px-4 py-3">Telefone</th>
              <th className="text-left text-xs font-bold text-muted-foreground uppercase tracking-wider px-4 py-3">CRECI</th>
              <th className="text-left text-xs font-bold text-muted-foreground uppercase tracking-wider px-4 py-3">Status</th>
              <th className="text-right text-xs font-bold text-muted-foreground uppercase tracking-wider px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-muted-foreground">
                  {isTrash ? "Nenhum corretor na lixeira." : "Nenhum corretor cadastrado."}
                </td>
              </tr>
            ) : data.map((b) => (
              <tr key={b.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-foreground">{b.full_name}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{b.email}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{b.phone}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{b.creci || "—"}</td>
                <td className="px-4 py-3">{statusBadge(b.status)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    {isTrash ? (
                      <>
                        <Button size="sm" variant="ghost" onClick={() => restoreBroker(b.id)} className="text-green-600 hover:text-green-700 hover:bg-green-50" title="Reintegrar">
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => permanentDeleteBroker(b.id)} className="text-destructive hover:bg-destructive/10" title="Excluir permanentemente">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        {b.status === "pending" && (
                          <>
                            <Button size="sm" variant="ghost" onClick={() => updateStatus(b.id, "approved")} className="text-green-600 hover:text-green-700 hover:bg-green-50">
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => updateStatus(b.id, "rejected")} className="text-destructive hover:bg-destructive/10">
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => softDeleteBroker(b.id)} className="text-destructive hover:bg-destructive/10" title="Mover para lixeira">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-foreground mb-6">Corretores</h1>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando...</div>
      ) : (
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="active">
              Ativos ({brokers.length})
            </TabsTrigger>
            <TabsTrigger value="trash" className="gap-1.5">
              <Archive className="w-3.5 h-3.5" />
              Lixeira ({deletedBrokers.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="active">
            <BrokerTable data={brokers} />
          </TabsContent>
          <TabsContent value="trash">
            <BrokerTable data={deletedBrokers} isTrash />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default AdminBrokers;
