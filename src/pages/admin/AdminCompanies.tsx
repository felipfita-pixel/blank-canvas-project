import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Check, X, Trash2, Building2, Filter } from "lucide-react";

interface Company {
  id: string;
  company_name: string;
  cnpj: string;
  responsible_name: string;
  phone: string;
  email: string;
  description: string;
  company_type: string;
  status: string;
  created_at: string;
}

const AdminCompanies = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const fetchCompanies = async () => {
    setLoading(true);
    let query = supabase.from("companies" as any).select("*").order("created_at", { ascending: false });
    if (filterType !== "all") query = query.eq("company_type", filterType);
    if (filterStatus !== "all") query = query.eq("status", filterStatus);
    const { data, error } = await query;
    if (error) toast.error(error.message);
    else setCompanies((data as any as Company[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchCompanies(); }, [filterType, filterStatus]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("companies" as any).update({ status } as any).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success(status === "approved" ? "Cadastro aprovado!" : "Cadastro rejeitado."); fetchCompanies(); }
  };

  const deleteCompany = async (id: string) => {
    const { error } = await supabase.from("companies" as any).delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Cadastro removido."); fetchCompanies(); }
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

  const typeLabel = (type: string) => type === "imobiliaria" ? "Imobiliária" : "Construtora";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
          <Building2 className="w-6 h-6" /> Imobiliárias & Construtoras
        </h1>
      </div>

      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="text-sm border border-input rounded-lg px-3 py-2 bg-background">
            <option value="all">Todos os tipos</option>
            <option value="imobiliaria">Imobiliárias</option>
            <option value="construtora">Construtoras</option>
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="text-sm border border-input rounded-lg px-3 py-2 bg-background">
            <option value="all">Todos os status</option>
            <option value="pending">Pendentes</option>
            <option value="approved">Aprovados</option>
            <option value="rejected">Rejeitados</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando...</div>
      ) : companies.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">Nenhum cadastro encontrado.</div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left text-xs font-bold text-muted-foreground uppercase tracking-wider px-4 py-3">Empresa</th>
                  <th className="text-left text-xs font-bold text-muted-foreground uppercase tracking-wider px-4 py-3">Tipo</th>
                  <th className="text-left text-xs font-bold text-muted-foreground uppercase tracking-wider px-4 py-3">Responsável</th>
                  <th className="text-left text-xs font-bold text-muted-foreground uppercase tracking-wider px-4 py-3">Contato</th>
                  <th className="text-left text-xs font-bold text-muted-foreground uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-right text-xs font-bold text-muted-foreground uppercase tracking-wider px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-foreground">{c.company_name}</div>
                      {c.cnpj && <div className="text-xs text-muted-foreground">{c.cnpj}</div>}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{typeLabel(c.company_type)}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{c.responsible_name}</td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-muted-foreground">{c.email}</div>
                      <div className="text-xs text-muted-foreground">{c.phone}</div>
                    </td>
                    <td className="px-4 py-3">{statusBadge(c.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {c.status === "pending" && (
                          <>
                            <Button size="sm" variant="ghost" onClick={() => updateStatus(c.id, "approved")} className="text-green-600 hover:text-green-700 hover:bg-green-50">
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => updateStatus(c.id, "rejected")} className="text-destructive hover:bg-destructive/10">
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => deleteCompany(c.id)} className="text-destructive hover:bg-destructive/10">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCompanies;
