import { writeFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import { staticProperties } from "../src/data/staticProperties";

const BASE_URL = "https://corretoresrj.com";

const SUPABASE_URL = "https://ujhjvktafstsxcycubau.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqaGp2a3RhZnN0c3hjeWN1YmF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MDU2NTIsImV4cCI6MjA5MDI4MTY1Mn0.64a09-9dGxx64JzITSisPesDKzSwhw0BwlhF8U4pwoE";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

function generateSitemap(entries: SitemapEntry[]) {
  const urls = entries.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n")
  );

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

async function main() {
  const entries: SitemapEntry[] = [
    { path: "/", changefreq: "weekly", priority: "1.0" },
    { path: "/imoveis", changefreq: "daily", priority: "0.9" },
    { path: "/anunciar-imovel", changefreq: "monthly", priority: "0.7" },
    { path: "/landing", changefreq: "weekly", priority: "0.6" },
    { path: "/favoritos", changefreq: "weekly", priority: "0.5" },
  ];

  // Static properties
  for (const p of staticProperties) {
    entries.push({
      path: `/imovel/${p.id}`,
      changefreq: "weekly",
      priority: "0.8",
    });
  }

  // Dynamic properties from Supabase
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data: dbProperties, error } = await supabase
    .from("properties")
    .select("id, updated_at")
    .eq("active", true)
    .limit(1000);

  if (error) {
    console.warn("Failed to fetch properties from Supabase:", error.message);
  } else if (dbProperties) {
    for (const p of dbProperties) {
      entries.push({
        path: `/imovel/${p.id}`,
        lastmod: p.updated_at ? new Date(p.updated_at).toISOString().split("T")[0] : undefined,
        changefreq: "weekly",
        priority: "0.8",
      });
    }
  }

  const xml = generateSitemap(entries);
  writeFileSync(resolve("public/sitemap.xml"), xml);
  console.log(`sitemap.xml written with ${entries.length} entries`);
}

main().catch((err) => {
  console.error("Sitemap generation failed:", err);
  process.exit(1);
});
