import { useState, useRef } from "react";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, FileDown, Loader2 } from "lucide-react";

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
  return String(v)
    .split(/[|;\n]+/)
    .map((s) => s.trim())
    .filter((s) => /^https?:\/\//i.test(s));
};

const PropertyCsvImport = ({ onImported }: Props) => {
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState<string>("");
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

    setImporting(true);
    setProgress("Lendo arquivo...");

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, "_"),
      complete: async (result) => {
        try {
          const rows = result.data.filter((r) => r && Object.values(r).some((v) => v));
          if (rows.length === 0) {
            toast.error("CSV vazio ou sem dados válidos");
            setImporting(false);
            return;
          }

          // Load existing for dedupe
          setProgress("Verificando duplicatas...");
          const { data: existing } = await supabase
            .from("properties")
            .select("title, neighborhood");
          const existingKeys = new Set(
            (existing ?? []).map(
              (p) => `${(p.title ?? "").trim().toLowerCase()}|${(p.neighborhood ?? "").trim().toLowerCase()}`
            )
          );

          const toInsert: Array<Record<string, unknown>> = [];
          const errors: string[] = [];
          let skipped = 0;

          rows.forEach((row, i) => {
            const lineNum = i + 2;
            const missing = REQUIRED.filter((k) => !row[k]?.toString().trim());
            if (missing.length) {
              errors.push(`Linha ${lineNum}: faltando ${missing.join(", ")}`);
              return;
            }
            const price = num(row.price);
            if (price === null || price <= 0) {
              errors.push(`Linha ${lineNum}: preço inválido`);
              return;
            }
            const title = row.title.trim();
            const neighborhood = row.neighborhood?.trim() || null;
            const key = `${title.toLowerCase()}|${(neighborhood ?? "").toLowerCase()}`;
            if (existingKeys.has(key)) {
              skipped++;
              return;
            }
            existingKeys.add(key);

            const images = splitImages(row.images);
            if (images.length === 0) {
              errors.push(`Linha ${lineNum}: sem foto válida (URL http/https)`);
              return;
            }

            toInsert.push({
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
            });
          });

          if (toInsert.length === 0) {
            toast.error(
              `Nenhum imóvel para importar. ${skipped} duplicado(s), ${errors.length} com erro.`
            );
            if (errors.length) console.warn("Erros CSV:", errors.slice(0, 20));
            setImporting(false);
            return;
          }

          setProgress(`Importando ${toInsert.length} imóveis...`);
          // Insert in batches of 50
          let inserted = 0;
          for (let i = 0; i < toInsert.length; i += 50) {
            const batch = toInsert.slice(i, i + 50);
            const { error } = await supabase.from("properties").insert(batch);
            if (error) {
              errors.push(`Lote ${i / 50 + 1}: ${error.message}`);
              break;
            }
            inserted += batch.length;
            setProgress(`Importados ${inserted}/${toInsert.length}...`);
          }

          toast.success(
            `${inserted} imóvel(is) importado(s). ${skipped} duplicado(s) ignorado(s).${
              errors.length ? ` ${errors.length} erro(s) - veja o console.` : ""
            }`
          );
          if (errors.length) console.warn("Erros CSV:", errors);
          onImported?.();
        } catch (err) {
          const message = err instanceof Error ? err.message : "Erro desconhecido";
          toast.error(`Falha na importação: ${message}`);
        } finally {
          setImporting(false);
          setProgress("");
        }
      },
      error: (err) => {
        toast.error(`Erro ao ler CSV: ${err.message}`);
        setImporting(false);
      },
    });
  };

  return (
    <div className="border border-border rounded-xl p-4 bg-card">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <h3 className="font-semibold text-foreground">Importar imóveis via CSV</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Use o modelo abaixo. Duplicatas (mesmo título + bairro) são ignoradas. Imóveis sem foto não são importados.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={downloadTemplate} disabled={importing}>
            <FileDown className="w-4 h-4 mr-2" /> Baixar modelo
          </Button>
          <Button size="sm" onClick={() => inputRef.current?.click()} disabled={importing}>
            {importing ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {progress || "Importando..."}</>
            ) : (
              <><Upload className="w-4 h-4 mr-2" /> Importar CSV</>
            )}
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleFile}
          />
        </div>
      </div>
    </div>
  );
};

export default PropertyCsvImport;
