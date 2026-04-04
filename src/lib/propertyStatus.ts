export type PropertyStatus = "launch" | "ready" | "construction" | null;

const LAUNCH_KEYWORDS = [
  "lançamento", "lancamento", "na planta", "pré-lançamento", "pre-lancamento",
  "pré lançamento", "pre lancamento", "breve lançamento", "em breve",
];

const READY_KEYWORDS = [
  "pronto para morar", "pronta entrega", "pronto pra morar",
  "mudança imediata", "entrega imediata", "imóvel pronto", "imovel pronto",
];

const CONSTRUCTION_KEYWORDS = [
  "em construção", "em construcao", "em obras", "previsão de entrega",
  "entrega prevista", "previsao de entrega",
];

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function getPropertyStatus(title?: string | null, description?: string | null): PropertyStatus {
  const combined = normalize(`${title ?? ""} ${description ?? ""}`);

  for (const kw of LAUNCH_KEYWORDS) {
    if (combined.includes(normalize(kw))) return "launch";
  }
  for (const kw of CONSTRUCTION_KEYWORDS) {
    if (combined.includes(normalize(kw))) return "construction";
  }
  for (const kw of READY_KEYWORDS) {
    if (combined.includes(normalize(kw))) return "ready";
  }

  return null;
}

export const statusConfig: Record<NonNullable<PropertyStatus>, { label: string; className: string }> = {
  launch: {
    label: "Lançamento",
    className: "bg-emerald-500 text-white hover:bg-emerald-600",
  },
  ready: {
    label: "Pronto para Morar",
    className: "bg-sky-500 text-white hover:bg-sky-600",
  },
  construction: {
    label: "Em Construção",
    className: "bg-amber-500 text-white hover:bg-amber-600",
  },
};
