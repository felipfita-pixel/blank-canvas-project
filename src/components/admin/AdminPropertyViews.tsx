import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchTopViewedProperties, fetchTotalPropertyViews } from "@/lib/propertyViews";
import { supabase } from "@/integrations/supabase/client";
import { getStaticProperty } from "@/data/staticProperties";

interface Row {
  property_id: string;
  views: number;
  title?: string;
}

const AdminPropertyViews = () => {
  const [total, setTotal] = useState(0);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [t, top] = await Promise.all([
        fetchTotalPropertyViews(),
        fetchTopViewedProperties(10),
      ]);
      setTotal(t);

      // Try to resolve titles
      const dbIds = top.map((r) => r.property_id).filter((id) => /^[0-9a-f-]{36}$/i.test(id));
      let dbTitles: Record<string, string> = {};
      if (dbIds.length > 0) {
        const { data } = await supabase
          .from("properties")
          .select("id, title")
          .in("id", dbIds);
        (data ?? []).forEach((p: any) => (dbTitles[p.id] = p.title));
      }
      setRows(
        top.map((r) => ({
          ...r,
          title: dbTitles[r.property_id] ?? getStaticProperty(r.property_id)?.title ?? r.property_id,
        }))
      );
      setLoading(false);
    })();
  }, []);

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <Eye className="w-5 h-5 text-secondary" />
          Visualizações de Imóveis
        </CardTitle>
        <span className="text-sm text-muted-foreground">
          Total geral:{" "}
          <span className="font-bold text-foreground tabular-nums">
            {total.toLocaleString("pt-BR")}
          </span>
        </span>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma visualização registrada ainda.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b">
                  <th className="py-2 pr-4">#</th>
                  <th className="py-2 pr-4">Imóvel</th>
                  <th className="py-2 text-right">Visitas</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.property_id} className="border-b last:border-0">
                    <td className="py-2 pr-4 text-muted-foreground">{i + 1}</td>
                    <td className="py-2 pr-4">
                      <Link
                        to={`/imovel/${r.property_id}`}
                        className="text-foreground hover:text-secondary"
                      >
                        {r.title}
                      </Link>
                    </td>
                    <td className="py-2 text-right font-semibold tabular-nums">
                      {r.views.toLocaleString("pt-BR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminPropertyViews;
