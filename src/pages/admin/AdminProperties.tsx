import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Upload, X, ImageIcon, Link } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Property {
  id: string;
  title: string;
  description: string;
  property_type: string;
  transaction_type: string;
  price: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  parking_spots: number;
  suites: number;
  neighborhood: string;
  address: string;
  active: boolean;
  featured: boolean;
  images: string[];
}

const emptyProperty = {
  title: "", description: "", property_type: "apartment", transaction_type: "sale",
  price: 0, area: 0, bedrooms: 0, bathrooms: 0, parking_spots: 0, suites: 0,
  neighborhood: "", address: "", active: true, featured: false, images: [] as string[],
};

const AdminProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Property | null>(null);
  const [form, setForm] = useState(emptyProperty);
  const [uploading, setUploading] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const fetchProperties = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("properties").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setProperties((data as Property[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchProperties(); }, []);

  const openNew = () => { setEditing(null); setForm(emptyProperty); setDialogOpen(true); };
  const openEdit = (p: Property) => { setEditing(p); setForm({ ...p, images: p.images || [] }); setDialogOpen(true); };

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newUrls: string[] = [];

    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${ext}`;
      const filePath = `properties/${fileName}`;

      const { error } = await supabase.storage
        .from("property-images")
        .upload(filePath, file, { upsert: true });

      if (error) {
        toast.error(`Erro ao enviar ${file.name}: ${error.message}`);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from("property-images")
        .getPublicUrl(filePath);

      newUrls.push(urlData.publicUrl);
    }

    if (newUrls.length > 0) {
      setForm((prev) => ({ ...prev, images: [...prev.images, ...newUrls] }));
      toast.success(`${newUrls.length} imagem(ns) adicionada(s)`);
    }

    setUploading(false);
    e.target.value = "";
  }, []);

  const removeImage = (index: number) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("Título é obrigatório"); return; }

    const payload = { ...form };

    if (editing) {
      const { error } = await supabase.from("properties").update(payload).eq("id", editing.id);
      if (error) toast.error(error.message);
      else { toast.success("Imóvel atualizado!"); setDialogOpen(false); fetchProperties(); }
    } else {
      const { error } = await supabase.from("properties").insert(payload);
      if (error) toast.error(error.message);
      else { toast.success("Imóvel cadastrado!"); setDialogOpen(false); fetchProperties(); }
    }
  };

  const deleteProperty = async (id: string) => {
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Imóvel removido."); fetchProperties(); }
  };

  const update = (field: string, value: any) => setForm((prev) => ({ ...prev, [field]: value }));

  const formatPrice = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold text-foreground">Imóveis</h1>
        <Button onClick={openNew} className="bg-secondary text-secondary-foreground hover:bg-orange-hover rounded-xl">
          <Plus className="w-4 h-4 mr-2" /> Novo Imóvel
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando...</div>
      ) : properties.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">Nenhum imóvel cadastrado.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {properties.map((p) => (
            <div key={p.id} className="bg-card rounded-xl border border-border overflow-hidden">
              {p.images && p.images.length > 0 ? (
                <div className="aspect-[16/10] overflow-hidden">
                  <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="aspect-[16/10] bg-muted flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-muted-foreground/40" />
                </div>
              )}
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-foreground text-sm line-clamp-1">{p.title}</h3>
                  {p.featured && <span className="text-xs bg-secondary/20 text-secondary px-2 py-0.5 rounded-full">Destaque</span>}
                </div>
                <p className="text-lg font-bold text-secondary">{formatPrice(p.price)}</p>
                <p className="text-xs text-muted-foreground mt-1">{p.neighborhood} • {p.transaction_type === "sale" ? "Venda" : "Aluguel"}</p>
                <div className="flex gap-3 mt-3 text-xs text-muted-foreground">
                  <span>{p.bedrooms} quartos</span>
                  <span>{p.area}m²</span>
                  <span>{p.parking_spots} vagas</span>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline" onClick={() => openEdit(p)} className="flex-1">
                    <Pencil className="w-3 h-3 mr-1" /> Editar
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => deleteProperty(p.id)} className="text-destructive hover:bg-destructive/10">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Imóvel" : "Novo Imóvel"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block">Título *</label>
              <Input value={form.title} onChange={(e) => update("title", e.target.value)} className="h-10 rounded-lg" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block">Tipo</label>
                <select value={form.property_type} onChange={(e) => update("property_type", e.target.value)} className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm">
                  <option value="apartment">Apartamento</option>
                  <option value="house">Casa</option>
                  <option value="commercial">Comercial</option>
                  <option value="land">Terreno</option>
                  <option value="penthouse">Cobertura</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block">Transação</label>
                <select value={form.transaction_type} onChange={(e) => update("transaction_type", e.target.value)} className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm">
                  <option value="sale">Venda</option>
                  <option value="rent">Aluguel</option>
                </select>
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block">Preço (R$)</label>
                <Input type="number" value={form.price} onChange={(e) => update("price", Number(e.target.value))} className="h-10 rounded-lg" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block">Área (m²)</label>
                <Input type="number" value={form.area} onChange={(e) => update("area", Number(e.target.value))} className="h-10 rounded-lg" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block">Quartos</label>
                <Input type="number" value={form.bedrooms} onChange={(e) => update("bedrooms", Number(e.target.value))} className="h-10 rounded-lg" />
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block">Banheiros</label>
                <Input type="number" value={form.bathrooms} onChange={(e) => update("bathrooms", Number(e.target.value))} className="h-10 rounded-lg" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block">Suítes</label>
                <Input type="number" value={form.suites} onChange={(e) => update("suites", Number(e.target.value))} className="h-10 rounded-lg" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block">Vagas</label>
                <Input type="number" value={form.parking_spots} onChange={(e) => update("parking_spots", Number(e.target.value))} className="h-10 rounded-lg" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block">Bairro</label>
                <Input value={form.neighborhood} onChange={(e) => update("neighborhood", e.target.value)} className="h-10 rounded-lg" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block">Endereço</label>
                <Input value={form.address} onChange={(e) => update("address", e.target.value)} className="h-10 rounded-lg" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block">Descrição</label>
              <Textarea value={form.description} onChange={(e) => update("description", e.target.value)} className="rounded-lg min-h-[80px]" />
            </div>

            {/* Image Upload */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block">Imagens</label>
              {form.images.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
                  {form.images.map((url, i) => (
                    <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <label className="flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg p-4 cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors">
                <Upload className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {uploading ? "Enviando..." : "Clique para adicionar imagens"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.active} onChange={(e) => update("active", e.target.checked)} className="rounded" />
                Ativo
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.featured} onChange={(e) => update("featured", e.target.checked)} className="rounded" />
                Destaque
              </label>
            </div>
            <Button onClick={handleSave} className="w-full bg-secondary text-secondary-foreground hover:bg-orange-hover rounded-xl h-11 font-semibold">
              {editing ? "Salvar Alterações" : "Cadastrar Imóvel"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProperties;
