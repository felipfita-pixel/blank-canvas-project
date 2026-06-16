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

// Exemplos realistas (estilo ficha Lopes) para o usuário ver o formato preenchido
const TEMPLATE_EXAMPLES: string[][] = [
  [
    "Apartamento 3 quartos com vista mar - Barra da Tijuca",
    "Apartamento alto padrão na Av. Lúcio Costa, 3 quartos sendo 1 suíte, sala ampla com varanda, cozinha planejada, 2 vagas. Prédio com piscina, academia e segurança 24h.",
    "apartment", "sale", "1450000", "120", "3", "2", "2", "1",
    "Barra da Tijuca", "Av. Lúcio Costa, 3600", "Rio de Janeiro", "RJ", "22630-010",
    "https://exemplo.com/barra-1.jpg|https://exemplo.com/barra-2.jpg|https://exemplo.com/barra-3.jpg",
    "true",
  ],
  [
    "Cobertura duplex 4 quartos - Ipanema",
    "Cobertura duplex 4 quartos, 3 suítes, terraço com piscina privativa e vista para o mar de Ipanema. 3 vagas. Acabamento de luxo.",
    "apartment", "sale", "8900000", "320", "4", "4", "3", "3",
    "Ipanema", "Rua Vinícius de Moraes, 200", "Rio de Janeiro", "RJ", "22411-010",
    "https://exemplo.com/ipanema-1.jpg|https://exemplo.com/ipanema-2.jpg",
    "true",
  ],
  [
    "Casa 4 quartos em condomínio - Recreio",
    "Casa em condomínio fechado, 4 quartos, 2 suítes, quintal amplo, churrasqueira, 4 vagas. Próximo à praia.",
    "house", "sale", "1950000", "280", "4", "3", "4", "2",
    "Recreio dos Bandeirantes", "Rua Professor Henrique Costa, 1500", "Rio de Janeiro", "RJ", "22790-000",
    "https://exemplo.com/recreio-1.jpg|https://exemplo.com/recreio-2.jpg",
    "false",
  ],
  [
    "Apartamento 2 quartos para alugar - Botafogo",
    "Apartamento reformado, 2 quartos, sala, cozinha americana, 1 vaga. Próximo ao metrô Botafogo.",
    "apartment", "rent", "4500", "75", "2", "1", "1", "0",
    "Botafogo", "Rua Voluntários da Pátria, 300", "Rio de Janeiro", "RJ", "22270-010",
    "https://exemplo.com/botafogo-1.jpg|https://exemplo.com/botafogo-2.jpg",
    "false",
  ],
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
  brokenImages: string[];
  data: Record<string, unknown>;
};
type SkippedRow = { line: number; title: string; neighborhood: string | null; reason: string };
type InvalidRow = { line: number; title: string; issues: string[]; brokenImages?: string[] };

interface Analysis {
  fileName: string;
  totalRows: number;
  valid: ValidRow[];
  duplicates: SkippedRow[];
  invalid: InvalidRow[];
  totalImages: number;
  brokenImageCount: number;
}

// Validate image URL by trying to load it (bypasses CORS). Resolves to true if reachable.
const checkImageUrl = (url: string, timeoutMs = 8000): Promise<boolean> =>
  new Promise((resolve) => {
    const img = new Image();
    const timer = setTimeout(() => {
      img.src = "";
      resolve(false);
    }, timeoutMs);
    img.onload = () => { clearTimeout(timer); resolve(img.naturalWidth > 0); };
    img.onerror = () => { clearTimeout(timer); resolve(false); };
    img.src = url;
  });

// Run an async mapper with concurrency limit
async function pMap<T, R>(items: T[], limit: number, mapper: (item: T, idx: number) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const i = cursor++;
      if (i >= items.length) return;
      results[i] = await mapper(items[i], i);
    }
  });
  await Promise.all(workers);
  return results;
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

  const downloadExample = () => {
    const csv = Papa.unparse({ fields: [...TEMPLATE_HEADERS], data: TEMPLATE_EXAMPLES });
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "exemplo-imoveis-preenchido.csv";
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
              brokenImages: [],
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

          // Validate all image URLs (with concurrency + cache)
          const allUrls = new Set<string>();
          valid.forEach((v) => (v.data.images as string[]).forEach((u) => allUrls.add(u)));
          const urlList = [...allUrls];
          const urlStatus = new Map<string, boolean>();

          if (urlList.length > 0) {
            setProgress(`Validando 0/${urlList.length} imagens...`);
            let done = 0;
            await pMap(urlList, 8, async (u) => {
              const ok = await checkImageUrl(u);
              urlStatus.set(u, ok);
              done++;
              if (done % 5 === 0 || done === urlList.length) {
                setProgress(`Validando ${done}/${urlList.length} imagens...`);
              }
            });
          }

          let brokenImageCount = 0;
          const stillValid: ValidRow[] = [];
          valid.forEach((v) => {
            const imgs = v.data.images as string[];
            const broken = imgs.filter((u) => urlStatus.get(u) === false);
            const working = imgs.filter((u) => urlStatus.get(u) !== false);
            brokenImageCount += broken.length;
            if (working.length === 0) {
              invalid.push({
                line: v.line,
                title: v.title,
                issues: ["todas as fotos estão quebradas/inacessíveis"],
                brokenImages: broken,
              });
              return;
            }
            v.data.images = working;
            v.brokenImages = broken;
            stillValid.push(v);
          });

          setProgress("");
          setAnalysis({
            fileName: file.name,
            totalRows: rows.length,
            valid: stillValid,
            duplicates,
            invalid,
            totalImages: allUrls.size,
            brokenImageCount,
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Erro desconhecido";
          toast.error(`Falha ao analisar CSV: ${message}`);
        } finally {
          setAnalyzing(false);
          setProgress("");
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
            <Button variant="outline" size="sm" onClick={downloadExample} disabled={analyzing || importing}>
              <FileDown className="w-4 h-4 mr-2" /> Baixar exemplo preenchido
            </Button>
            <Button size="sm" onClick={() => inputRef.current?.click()} disabled={analyzing || importing}>
              {analyzing ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {progress || "Analisando..."}</>
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
                Arquivo: <span className="font-mono">{analysis.fileName}</span> · {analysis.totalRows} linha(s) ·
                {" "}{analysis.totalImages} imagem(ns) verificada(s)
                {analysis.brokenImageCount > 0 && (
                  <span className="text-destructive font-semibold"> · {analysis.brokenImageCount} quebrada(s)</span>
                )}
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
                    {analysis.valid.some((v) => v.brokenImages.length > 0) && (
                      <span className="text-amber-600 ml-2 font-normal">
                        (alguns com fotos quebradas — serão removidas)
                      </span>
                    )}
                  </summary>
                  <div className="mt-2 max-h-56 overflow-y-auto text-xs space-y-1">
                    {analysis.valid.slice(0, 100).map((v) => (
                      <div key={v.line} className="py-1 border-b border-border/50">
                        <div className="flex justify-between gap-2">
                          <span className="truncate">L{v.line} · {v.title} {v.neighborhood && <span className="text-muted-foreground">({v.neighborhood})</span>}</span>
                          <span className="text-muted-foreground shrink-0">R$ {v.price.toLocaleString("pt-BR")}</span>
                        </div>
                        {v.brokenImages.length > 0 && (
                          <div className="text-amber-600 mt-0.5 pl-3">
                            ⚠ {v.brokenImages.length} foto(s) quebrada(s) ignorada(s):
                            <ul className="list-disc ml-4 break-all">
                              {v.brokenImages.slice(0, 3).map((u, i) => <li key={i} className="font-mono">{u}</li>)}
                              {v.brokenImages.length > 3 && <li>+ {v.brokenImages.length - 3}...</li>}
                            </ul>
                          </div>
                        )}
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
                  <div className="mt-2 max-h-56 overflow-y-auto text-xs space-y-1">
                    {analysis.invalid.map((it) => (
                      <div key={it.line} className="py-1 border-b border-border/50">
                        <span className="font-medium">L{it.line}:</span> {it.title}
                        <ul className="ml-4 list-disc text-destructive">
                          {it.issues.map((iss, idx) => <li key={idx}>{iss}</li>)}
                        </ul>
                        {it.brokenImages && it.brokenImages.length > 0 && (
                          <ul className="ml-4 list-disc text-destructive/80 break-all">
                            {it.brokenImages.slice(0, 5).map((u, i) => <li key={i} className="font-mono text-[10px]">{u}</li>)}
                            {it.brokenImages.length > 5 && <li>+ {it.brokenImages.length - 5}...</li>}
                          </ul>
                        )}
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
