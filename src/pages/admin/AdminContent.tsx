import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Save, ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";
import { siteContentDefaults, type SiteSection } from "@/hooks/useSiteContent";

const AdminContent = () => {
  const [sections, setSections] = useState<Record<string, SiteSection>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("site_content").select("*");
      const map: Record<string, SiteSection> = {};
      for (const key of Object.keys(siteContentDefaults)) {
        map[key] = { ...siteContentDefaults[key] };
      }
      if (data) {
        for (const row of data) {
          const def = siteContentDefaults[row.section_key];
          map[row.section_key] = {
            id: row.id,
            section_key: row.section_key,
            title: row.title ?? def?.title ?? "",
            subtitle: row.subtitle ?? def?.subtitle ?? "",
            content: { ...(def?.content ?? {}), ...((row.content as Record<string, any>) ?? {}) },
          };
        }
      }
      setSections(map);
      setLoading(false);
    };
    load();
  }, []);

  const update = useCallback((key: string, field: string, value: any) => {
    setSections((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  }, []);

  const updateContent = useCallback((key: string, contentKey: string, value: any) => {
    setSections((prev) => ({
      ...prev,
      [key]: { ...prev[key], content: { ...prev[key].content, [contentKey]: value } },
    }));
  }, []);

  const updateContentArrayItem = useCallback((sectionKey: string, contentKey: string, index: number, field: string, value: any) => {
    setSections((prev) => {
      const arr = [...(prev[sectionKey].content[contentKey] || [])];
      arr[index] = { ...arr[index], [field]: value };
      return {
        ...prev,
        [sectionKey]: { ...prev[sectionKey], content: { ...prev[sectionKey].content, [contentKey]: arr } },
      };
    });
  }, []);

  const addContentArrayItem = useCallback((sectionKey: string, contentKey: string, template: any) => {
    setSections((prev) => {
      const arr = [...(prev[sectionKey].content[contentKey] || []), template];
      return {
        ...prev,
        [sectionKey]: { ...prev[sectionKey], content: { ...prev[sectionKey].content, [contentKey]: arr } },
      };
    });
  }, []);

  const removeContentArrayItem = useCallback((sectionKey: string, contentKey: string, index: number) => {
    setSections((prev) => {
      const arr = [...(prev[sectionKey].content[contentKey] || [])];
      arr.splice(index, 1);
      return {
        ...prev,
        [sectionKey]: { ...prev[sectionKey], content: { ...prev[sectionKey].content, [contentKey]: arr } },
      };
    });
  }, []);

  const toggle = (key: string) => setOpenSections((p) => ({ ...p, [key]: !p[key] }));

  const handleSave = async () => {
    setSaving(true);
    for (const section of Object.values(sections)) {
      if (section.id) {
        await supabase.from("site_content").update({
          title: section.title,
          subtitle: section.subtitle,
          content: section.content,
        }).eq("id", section.id);
      } else {
        await supabase.from("site_content").upsert({
          section_key: section.section_key,
          title: section.title,
          subtitle: section.subtitle,
          content: section.content,
        }, { onConflict: "section_key" });
      }
    }
    setSaving(false);
    toast.success("Conteúdo salvo com sucesso!");
  };

  const sectionConfig = [
    { key: "hero", label: "🏠 Hero (Banner Principal)" },
    { key: "about", label: "ℹ️ Quem Somos / Campanhas" },
    { key: "cta_banner", label: "📢 Banner CTA" },
    { key: "lifestyle", label: "🏡 Estilo de Vida" },
    
    { key: "videos", label: "🎬 Vídeos do YouTube" },
    { key: "testimonials", label: "⭐ Depoimentos" },
    { key: "services", label: "🛎️ Serviços" },
    { key: "where_we_operate", label: "📍 Onde Atuamos" },
    { key: "contact", label: "📞 Contato" },
    { key: "footer", label: "🔻 Rodapé" },
  ];

  if (loading) return <div className="text-center py-12 text-muted-foreground">Carregando...</div>;

  const s = (key: string) => sections[key] || siteContentDefaults[key];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold text-foreground">Conteúdo do Site</h1>
        <Button onClick={handleSave} disabled={saving} className="bg-secondary text-secondary-foreground hover:bg-orange-hover rounded-xl">
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Salvando..." : "Salvar Tudo"}
        </Button>
      </div>

      <div className="space-y-3">
        {sectionConfig.map(({ key, label }) => {
          const isOpen = openSections[key] ?? false;
          const sec = s(key);
          return (
            <div key={key} className="bg-card rounded-xl border border-border overflow-hidden">
              <button
                onClick={() => toggle(key)}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <span className="font-heading font-bold text-foreground">{label}</span>
                {isOpen ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
              </button>

              {isOpen && (
                <div className="px-4 pb-5 space-y-4 border-t border-border pt-4">
                  {/* Common fields */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Título" value={sec.title} onChange={(v) => update(key, "title", v)} />
                    <Field label="Subtítulo" value={sec.subtitle} onChange={(v) => update(key, "subtitle", v)} />
                  </div>

                  {/* Hero */}
                  {key === "hero" && (
                    <>
                      <ImageUpload
                        label="Imagem de fundo do Hero"
                        value={sec.content.hero_image || ""}
                        onChange={(v) => updateContent(key, "hero_image", v)}
                        folder="hero"
                      />
                      <Field label="Texto do badge" value={sec.content.badge_text || ""} onChange={(v) => updateContent(key, "badge_text", v)} />
                      <Field label="Destaque do título" value={sec.content.title_highlight || ""} onChange={(v) => updateContent(key, "title_highlight", v)} />
                      <h4 className="font-bold text-sm text-foreground mt-4">Estatísticas</h4>
                      {(sec.content.stats || []).map((stat: any, i: number) => (
                        <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-3 items-end">
                          <Field label="Valor" value={stat.value} onChange={(v) => updateContentArrayItem(key, "stats", i, "value", v)} />
                          <Field label="Legenda" value={stat.label} onChange={(v) => updateContentArrayItem(key, "stats", i, "label", v)} />
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeContentArrayItem(key, "stats", i)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" onClick={() => addContentArrayItem(key, "stats", { value: "", label: "" })}>
                        <Plus className="w-3 h-3 mr-1" /> Estatística
                      </Button>
                    </>
                  )}

                  {/* About */}
                  {key === "about" && (
                    <>
                      <Field label="Título das campanhas" value={sec.content.campaign_title || ""} onChange={(v) => updateContent(key, "campaign_title", v)} />
                      <Field label="Subtítulo das campanhas" value={sec.content.campaign_subtitle || ""} onChange={(v) => updateContent(key, "campaign_subtitle", v)} />
                      <h4 className="font-bold text-sm text-foreground mt-4">Bairros (cards)</h4>
                      {(sec.content.neighborhoods || []).map((n: any, i: number) => (
                        <div key={i} className="flex gap-3 items-start border border-border rounded-lg p-3">
                          <ImageUpload
                            label={`Imagem ${i + 1}`}
                            value={n.image || ""}
                            onChange={(v) => updateContentArrayItem(key, "neighborhoods", i, "image", v)}
                            folder="about"
                          />
                          <div className="flex-1 space-y-2">
                            <Field label="Nome" value={n.name} onChange={(v) => updateContentArrayItem(key, "neighborhoods", i, "name", v)} />
                          </div>
                          <Button variant="ghost" size="icon" className="text-destructive mt-5" onClick={() => removeContentArrayItem(key, "neighborhoods", i)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" onClick={() => addContentArrayItem(key, "neighborhoods", { name: "", image: "" })}>
                        <Plus className="w-3 h-3 mr-1" /> Bairro
                      </Button>
                    </>
                  )}

                  {/* Lifestyle */}
                  {key === "lifestyle" && (
                    <ImageUpload
                      label="Imagem principal"
                      value={sec.content.image || ""}
                      onChange={(v) => updateContent(key, "image", v)}
                      folder="lifestyle"
                    />
                  )}

                  {/* Videos */}
                  {key === "videos" && (
                    <>
                      {(sec.content.items || []).map((vid: any, i: number) => (
                        <div key={i} className="border border-border rounded-lg p-3 space-y-2">
                          <div className="grid sm:grid-cols-2 gap-3">
                            <Field label="Título do vídeo" value={vid.title} onChange={(v) => updateContentArrayItem(key, "items", i, "title", v)} />
                            <Field label="URL do YouTube" value={vid.url} onChange={(v) => updateContentArrayItem(key, "items", i, "url", v)} />
                          </div>
                          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => removeContentArrayItem(key, "items", i)}><Trash2 className="w-3 h-3 mr-1" /> Remover</Button>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" onClick={() => addContentArrayItem(key, "items", { title: "", url: "" })}>
                        <Plus className="w-3 h-3 mr-1" /> Adicionar Vídeo
                      </Button>
                    </>
                  )}

                  {key === "testimonials" && (
                    <>
                      {(sec.content.items || []).map((t: any, i: number) => (
                        <div key={i} className="border border-border rounded-lg p-3 space-y-2">
                          <div className="grid sm:grid-cols-2 gap-3">
                            <Field label="Nome" value={t.name} onChange={(v) => updateContentArrayItem(key, "items", i, "name", v)} />
                            <Field label="Nota (1-5)" value={String(t.rating || 5)} onChange={(v) => updateContentArrayItem(key, "items", i, "rating", Number(v))} />
                          </div>
                          <AreaField label="Depoimento" value={t.text} onChange={(v) => updateContentArrayItem(key, "items", i, "text", v)} />
                          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => removeContentArrayItem(key, "items", i)}><Trash2 className="w-3 h-3 mr-1" /> Remover</Button>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" onClick={() => addContentArrayItem(key, "items", { name: "", text: "", rating: 5 })}>
                        <Plus className="w-3 h-3 mr-1" /> Depoimento
                      </Button>
                    </>
                  )}

                  {/* Services */}
                  {key === "services" && (
                    <>
                      {(sec.content.items || []).map((svc: any, i: number) => (
                        <div key={i} className="border border-border rounded-lg p-3 space-y-2">
                          <div className="grid sm:grid-cols-2 gap-3">
                            <Field label="Título" value={svc.title} onChange={(v) => updateContentArrayItem(key, "items", i, "title", v)} />
                            <Field label="Ícone (Home, FileText, Search, etc)" value={svc.icon} onChange={(v) => updateContentArrayItem(key, "items", i, "icon", v)} />
                          </div>
                          <AreaField label="Descrição" value={svc.desc} onChange={(v) => updateContentArrayItem(key, "items", i, "desc", v)} />
                          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => removeContentArrayItem(key, "items", i)}><Trash2 className="w-3 h-3 mr-1" /> Remover</Button>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" onClick={() => addContentArrayItem(key, "items", { icon: "Home", title: "", desc: "" })}>
                        <Plus className="w-3 h-3 mr-1" /> Serviço
                      </Button>
                    </>
                  )}

                  {/* Where we operate */}
                  {key === "where_we_operate" && (
                    <>
                      <AreaField label="Descrição" value={sec.content.description || ""} onChange={(v) => updateContent(key, "description", v)} />
                      <Field label="Bairros" value={sec.content.locations || ""} onChange={(v) => updateContent(key, "locations", v)} />
                      <div className="grid sm:grid-cols-2 gap-4">
                        <Field label="Telefone" value={sec.content.phone || ""} onChange={(v) => updateContent(key, "phone", v)} />
                        <Field label="E-mail" value={sec.content.email || ""} onChange={(v) => updateContent(key, "email", v)} />
                      </div>
                    </>
                  )}

                  {/* Contact */}
                  {key === "contact" && (
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Field label="Telefone" value={sec.content.phone || ""} onChange={(v) => updateContent(key, "phone", v)} />
                      <Field label="E-mail" value={sec.content.email || ""} onChange={(v) => updateContent(key, "email", v)} />
                      <Field label="Instagram URL" value={sec.content.instagram || ""} onChange={(v) => updateContent(key, "instagram", v)} />
                      <Field label="Facebook URL" value={sec.content.facebook || ""} onChange={(v) => updateContent(key, "facebook", v)} />
                    </div>
                  )}

                  {/* Footer */}
                  {key === "footer" && (
                    <>
                      <AreaField label="Descrição" value={sec.content.description || ""} onChange={(v) => updateContent(key, "description", v)} />
                      <div className="grid sm:grid-cols-2 gap-4">
                        <Field label="Endereço" value={sec.content.address || ""} onChange={(v) => updateContent(key, "address", v)} />
                        <Field label="Telefone" value={sec.content.phone || ""} onChange={(v) => updateContent(key, "phone", v)} />
                        <Field label="E-mail" value={sec.content.email || ""} onChange={(v) => updateContent(key, "email", v)} />
                        <Field label="Instagram URL" value={sec.content.instagram || ""} onChange={(v) => updateContent(key, "instagram", v)} />
                        <Field label="Facebook URL" value={sec.content.facebook || ""} onChange={(v) => updateContent(key, "facebook", v)} />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Field = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <div>
    <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block text-foreground">{label}</label>
    <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-10 rounded-lg" />
  </div>
);

const AreaField = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <div>
    <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block text-foreground">{label}</label>
    <Textarea value={value} onChange={(e) => onChange(e.target.value)} className="rounded-lg min-h-[80px]" />
  </div>
);

export default AdminContent;
