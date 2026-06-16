import { useState, useRef } from "react";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, FileDown, Loader2, CheckCircle2, AlertTriangle, Copy, XCircle } from "lucide-react";

interface Props {
  onImported?: () => void;
}

const REQUIRED = ["title", "property_type", "transaction_type", "price"] as const;

const TEMPLATE_HEADERS = [
  "title", "description", "property_type", "transaction_type", "price",
  "area", "bedrooms", "bathrooms", "parking_spots", "suites",
  "neighborhood", "address", "city", "state", "zip_code",
  "images", "featured",
];

const TEMPLATE_SAMPLE = [
  "Apartamento 3 quartos Barra",
  "Vista mar, andar alto, 2 vagas",
  "apartment",
  "sale",
  "1250000",
  "120",
  "3",
  "2",
  "2",
  "1",
  "Barra da Tijuca",
  "Av. Lúcio Costa, 1000",
  "Rio de Janeiro",
  "RJ",
  "22620-000",
  "https://exemplo.com/foto1.jpg|https://exemplo.com/foto2.jpg",
  "false",
];

const num = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const s = String(v).replace(/[^\d,.-]/g, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".");
  const n = parseFloat(s);
  return isFinite(n) ? n : null;
};
const int = (v: unknown): number | null => {
  const n = num(v);
  return n === null ? null : Math.round(n);
};
const bool = (v: unknown): boolean => {
  const s = String(v ?? "").trim().toLowerCase();
  return ["true", "1", "sim", "yes", "y", "s"].includes(s);
};
const splitImages = (v: unknown): string[] => {
  if (!v) return [];
  return String(v).split(/[|;\n]+/).map((s) => s.trim()).filter((s) => /^https?:\/\//i.test(s));
};

type ValidRow = {
  line: number;
  title: string;
  neighborhood: string | null;
  price: number;
  data: Record<string, unknown>;
};
type SkippedRow = { line: number; title: string; neighborhood: string | null; reason: string };
type InvalidRow = { line: number; title: string; issues: string[] };

interface Analysis {
  fileName: string;
  totalRows: number;
  valid: ValidRow[];
  duplicates: SkippedRow[];
  invalid: InvalidRow[];
}

const PropertyCsvImport = ({ onImported }: Props) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const csv = Papa.unparse({ fields: [...TEMPLATE_HEADERS], data: [TEMPLATE_SAMPLE] });
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "modelo-importacao-imoveis.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    setAnalyzing(true);
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, "_"),
      complete: async (result) => {
        try {
          const rows = result.data.filter((r) => r && Object.values(r).some((v) => v));
          if (rows.length === 0) {
            toast.error("CSV vazio ou sem dados válidos");
            return;
          }

          const { data: existing } = await supabase.from("properties").select("title, neighborhood");
          const existingKeys = new Set(
            (existing ?? []).map(
              (p) => `${(p.title ?? "").trim().toLowerCase()}|${(p.neighborhood ?? "").trim().toLowerCase()}`
            )
          );

          const valid: ValidRow[] = [];
          const duplicates: SkippedRow[] = [];
          const invalid: InvalidRow[] = [];
          const seenInFile = new Set<string>();

          rows.forEach((row, i) => {
            const line = i + 2;
            const title = row.title?.toString().trim() || "(sem título)";
            const neighborhood = row.neighborhood?.toString().trim() || null;
            const issues: string[] = [];

            const missing = REQUIRED.filter((k) => !row[k]?.toString().trim());
            if (missing.length) issues.push(`campos obrigatórios faltando: ${missing.join(", ")}`);

            const price = num(row.price);
            if (row.price && (price === null || price <= 0)) issues.push("preço inválido");

            const images = splitImages(row.images);
            if (images.length === 0) issues.push("sem foto válida (URL http/https)");

            if (issues.length) {
              invalid.push({ line, title, issues });
              return;
            }

            const key = `${title.toLowerCase()}|${(neighborhood ?? "").toLowerCase()}`;
            if (existingKeys.has(key)) {
              duplicates.push({ line, title, neighborhood, reason: "já existe no banco" });
              return;
            }
            if (seenInFile.has(key)) {
              duplicates.push({ line, title, neighborhood, reason: "duplicado dentro do CSV" });
              return;
            }
            seenInFile.add(key);

            valid.push({
              line, title, neighborhood, price: price!,
              data: {
                title,
                description: row.description?.trim() || null,
                property_type: row.property_type.trim().toLowerCase(),
                transaction_type: row.transaction_type.trim().toLowerCase(),
                price,
                area: num(row.area),
                bedrooms: int(row.bedrooms),
                bathrooms: int(row.bathrooms),
                parking_spots: int(row.parking_spots),
                suites: int(row.suites),
                neighborhood,
                address: row.address?.trim() || null,
                city: row.city?.trim() || null,
                state: row.state?.trim() || null,
                zip_code: row.zip_code?.trim() || null,
                images,
                featured: bool(row.featured),
                active: true,
              },
            });
          });

          setAnalysis({ fileName: file.name, totalRows: rows.length, valid, duplicates, invalid });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Erro desconhecido";
          toast.error(`Falha ao analisar CSV: ${message}`);
        } finally {
          setAnalyzing(false);
        }
      },
      error: (err) => {
        toast.error(`Erro ao ler CSV: ${err.message}`);
        setAnalyzing(false);
      },
    });
  };

  const confirmImport = async () => {
    if (!analysis || analysis.valid.length === 0) return;
    setImporting(true);
    const toInsert = analysis.valid.map((v) => v.data);
    let inserted = 0;
    const errors: string[] = [];
    for (let i = 0; i < toInsert.length; i += 50) {
      const batch = toInsert.slice(i, i + 50);
      setProgress(`Importando ${inserted + 1}–${inserted + batch.length} de ${toInsert.length}...`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await supabase.from("properties").insert(batch as any);
      if (error) {
        errors.push(`Lote ${i / 50 + 1}: ${error.message}`);
        break;
      }
      inserted += batch.length;
    }
    setImporting(false);
    setProgress("");
    if (errors.length) toast.error(`Importação parcial: ${inserted} inseridos. Erro: ${errors[0]}`);
    else toast.success(`${inserted} imóvel(is) importado(s) com sucesso!`);
    setAnalysis(null);
    onImported?.();
  };

  const copyIssues = () => {
    if (!analysis) return;
    const lines = [
      `# Análise do CSV: ${analysis.fileName}`,
      `Total de linhas: ${analysis.totalRows}`,
      `Válidos: ${analysis.valid.length} | Duplicados: ${analysis.duplicates.length} | Com erro: ${analysis.invalid.length}`,
      "",
      "## Duplicados",
      ...analysis.duplicates.map((d) => `Linha ${d.line}: ${d.title} (${d.neighborhood ?? "-"}) — ${d.reason}`),
      "",
      "## Com erro",
      ...analysis.invalid.map((i) => `Linha ${i.line}: ${i.title} — ${i.issues.join("; ")}`),
    ].join("\n");
    navigator.clipboard.writeText(lines).then(() => toast.success("Relatório copiado"));
  };

  return (
    <>
      <div className="border border-border rounded-xl p-4 bg-card">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div>
            <h3 className="font-semibold text-foreground">Importar imóveis via CSV</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Você verá uma pré-visualização com válidos, duplicados e erros antes de confirmar.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={downloadTemplate} disabled={analyzing || importing}>
              <FileDown className="w-4 h-4 mr-2" /> Baixar modelo
            </Button>
            <Button size="sm" onClick={() => inputRef.current?.click()} disabled={analyzing || importing}>
              {analyzing ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analisando...</>
              ) : (
                <><Upload className="w-4 h-4 mr-2" /> Analisar CSV</>
              )}
            </Button>
            <input ref={inputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} />
          </div>
        </div>
      </div>

      <Dialog open={!!analysis} onOpenChange={(o) => !o && !importing && setAnalysis(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Pré-visualização da importação</DialogTitle>
          </DialogHeader>

          {analysis && (
            <div className="space-y-4 mt-2">
              <p className="text-xs text-muted-foreground">
                Arquivo: <span className="font-mono">{analysis.fileName}</span> · {analysis.totalRows} linha(s)
              </p>

              <div className="grid grid-cols-3 gap-3">
                <div className="border border-emerald-500/30 bg-emerald-500/5 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase">Serão importados</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground mt-1">{analysis.valid.length}</p>
                </div>
                <div className="border border-amber-500/30 bg-amber-500/5 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-amber-600">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase">Duplicados</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground mt-1">{analysis.duplicates.length}</p>
                </div>
                <div className="border border-destructive/30 bg-destructive/5 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-destructive">
                    <XCircle className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase">Com erro</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground mt-1">{analysis.invalid.length}</p>
                </div>
              </div>

              {analysis.valid.length > 0 && (
                <details className="border border-border rounded-lg p-3" open>
                  <summary className="cursor-pointer text-sm font-semibold text-emerald-600">
                    ✓ {analysis.valid.length} imóvel(is) prontos para importar
                  </summary>
                  <div className="mt-2 max-h-48 overflow-y-auto text-xs space-y-1">
                    {analysis.valid.slice(0, 100).map((v) => (
                      <div key={v.line} className="flex justify-between gap-2 py-1 border-b border-border/50">
                        <span className="truncate">L{v.line} · {v.title} {v.neighborhood && <span className="text-muted-foreground">({v.neighborhood})</span>}</span>
                        <span className="text-muted-foreground shrink-0">R$ {v.price.toLocaleString("pt-BR")}</span>
                      </div>
                    ))}
                    {analysis.valid.length > 100 && <p className="text-muted-foreground italic">+ {analysis.valid.length - 100} restantes...</p>}
                  </div>
                </details>
              )}

              {analysis.duplicates.length > 0 && (
                <details className="border border-amber-500/30 rounded-lg p-3">
                  <summary className="cursor-pointer text-sm font-semibold text-amber-600">
                    ⚠ {analysis.duplicates.length} duplicado(s) — serão pulados
                  </summary>
                  <div className="mt-2 max-h-48 overflow-y-auto text-xs space-y-1">
                    {analysis.duplicates.map((d) => (
                      <div key={d.line} className="py-1 border-b border-border/50">
                        <span className="font-medium">L{d.line}:</span> {d.title}
                        {d.neighborhood && <span className="text-muted-foreground"> ({d.neighborhood})</span>}
                        <span className="text-amber-600 ml-2">— {d.reason}</span>
                      </div>
                    ))}
                  </div>
                </details>
              )}

              {analysis.invalid.length > 0 && (
                <details className="border border-destructive/30 rounded-lg p-3" open>
                  <summary className="cursor-pointer text-sm font-semibold text-destructive">
                    ✕ {analysis.invalid.length} linha(s) com erro — não serão importadas
                  </summary>
                  <div className="mt-2 max-h-48 overflow-y-auto text-xs space-y-1">
                    {analysis.invalid.map((it) => (
                      <div key={it.line} className="py-1 border-b border-border/50">
                        <span className="font-medium">L{it.line}:</span> {it.title}
                        <ul className="ml-4 list-disc text-destructive">
                          {it.issues.map((iss, idx) => <li key={idx}>{iss}</li>)}
                        </ul>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-2">
            {analysis && (analysis.duplicates.length > 0 || analysis.invalid.length > 0) && (
              <Button variant="outline" size="sm" onClick={copyIssues} disabled={importing}>
                <Copy className="w-4 h-4 mr-2" /> Copiar relatório
              </Button>
            )}
            <Button variant="outline" onClick={() => setAnalysis(null)} disabled={importing}>
              Cancelar
            </Button>
            <Button
              onClick={confirmImport}
              disabled={importing || !analysis || analysis.valid.length === 0}
              className="bg-secondary text-secondary-foreground hover:bg-orange-hover"
            >
              {importing ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {progress || "Importando..."}</>
              ) : (
                <>Confirmar e importar {analysis?.valid.length ?? 0}</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PropertyCsvImport;
