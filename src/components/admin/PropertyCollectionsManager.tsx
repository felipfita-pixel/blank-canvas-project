import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { staticProperties } from "@/data/staticProperties";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Folder,
  FolderPlus,
  GripVertical,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface PropLite {
  id: string;
  title: string;
  neighborhood: string | null;
  price: number;
  image: string | null;
}

interface ItemRow {
  id: string;
  property_id: string;
  position: number;
}

interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  position: number;
  items: ItemRow[];
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

const fmt = (n: number) =>
  n > 0
    ? new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: 0,
      }).format(n)
    : "—";

type DragSource =
  | { kind: "item"; collectionId: string; propertyId: string }
  | { kind: "collection"; collectionId: string };

const PropertyCollectionsManager = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [allProps, setAllProps] = useState<PropLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [drag, setDrag] = useState<DragSource | null>(null);
  const [pickerOpen, setPickerOpen] = useState<string | null>(null);
  const [pickerSearch, setPickerSearch] = useState("");
  const [editing, setEditing] = useState<Collection | null>(null);
  const [editName, setEditName] = useState("");

  const loadAll = async () => {
    setLoading(true);
    const [colRes, itemRes, dbRes] = await Promise.all([
      supabase
        .from("property_collections")
        .select("*")
        .order("position", { ascending: true }),
      supabase
        .from("property_collection_items")
        .select("*")
        .order("position", { ascending: true }),
      supabase
        .from("properties")
        .select("id, title, neighborhood, price, images, active")
        .eq("active", true),
    ]);

    const cols = (colRes.data ?? []) as Omit<Collection, "items">[];
    const items = (itemRes.data ?? []) as ItemRow[];
    const dbProps = (dbRes.data ?? []) as any[];

    const merged: PropLite[] = [
      ...dbProps.map((p) => ({
        id: p.id,
        title: p.title,
        neighborhood: p.neighborhood ?? null,
        price: p.price ?? 0,
        image: p.images?.[0] ?? null,
      })),
      ...staticProperties.map((sp) => ({
        id: sp.id,
        title: sp.title,
        neighborhood: sp.neighborhood,
        price: sp.price,
        image: sp.images?.[0] ?? null,
      })),
    ];
    // dedupe by id
    const seen = new Set<string>();
    const dedup = merged.filter((p) => (seen.has(p.id) ? false : (seen.add(p.id), true)));

    setAllProps(dedup);
    setCollections(
      cols.map((c) => ({
        ...c,
        items: items.filter((it) => it.collection_id === (c as any).id) as ItemRow[],
      })),
    );
    setLoading(false);
  };

  useEffect(() => {
    void loadAll();
  }, []);

  const propById = useMemo(() => {
    const m = new Map<string, PropLite>();
    allProps.forEach((p) => m.set(p.id, p));
    return m;
  }, [allProps]);

  const assignedIds = useMemo(() => {
    const s = new Set<string>();
    collections.forEach((c) => c.items.forEach((it) => s.add(it.property_id)));
    return s;
  }, [collections]);

  const unassigned = useMemo(
    () => allProps.filter((p) => !assignedIds.has(p.id)),
    [allProps, assignedIds],
  );

  // ---------- Mutations ----------
  const createCollection = async () => {
    const name = window.prompt("Nome da pasta (ex: Lançamentos, Aluguel Zona Sul):")?.trim();
    if (!name) return;
    const baseSlug = slugify(name) || `pasta-${Date.now()}`;
    const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
    const position = collections.length;
    const { error } = await supabase
      .from("property_collections")
      .insert({ name, slug, position });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Pasta criada");
    void loadAll();
  };

  const renameCollection = async () => {
    if (!editing) return;
    const name = editName.trim();
    if (!name) {
      toast.error("Nome obrigatório");
      return;
    }
    const { error } = await supabase
      .from("property_collections")
      .update({ name })
      .eq("id", editing.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Pasta renomeada");
    setEditing(null);
    void loadAll();
  };

  const deleteCollection = async (id: string) => {
    if (!window.confirm("Excluir esta pasta? Os imóveis voltam para 'Não atribuídos'.")) return;
    const { error } = await supabase.from("property_collections").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Pasta excluída");
    void loadAll();
  };

  const persistCollectionsOrder = async (next: Collection[]) => {
    setCollections(next);
    await Promise.all(
      next.map((c, i) =>
        supabase.from("property_collections").update({ position: i }).eq("id", c.id),
      ),
    );
  };

  const persistItems = async (collectionId: string, items: ItemRow[]) => {
    // upsert positions; remove ones missing
    await Promise.all(
      items.map((it, i) =>
        supabase
          .from("property_collection_items")
          .update({ position: i })
          .eq("id", it.id),
      ),
    );
  };

  const addPropertyToCollection = async (collectionId: string, propertyId: string) => {
    const col = collections.find((c) => c.id === collectionId);
    if (!col) return;
    const position = col.items.length;
    const { error } = await supabase
      .from("property_collection_items")
      .insert({ collection_id: collectionId, property_id: propertyId, position });
    if (error) {
      toast.error(error.message);
      return;
    }
    void loadAll();
  };

  const removeItem = async (itemId: string) => {
    const { error } = await supabase
      .from("property_collection_items")
      .delete()
      .eq("id", itemId);
    if (error) {
      toast.error(error.message);
      return;
    }
    void loadAll();
  };

  const moveItem = async (
    sourceCollectionId: string,
    propertyId: string,
    targetCollectionId: string,
    targetIndex: number,
  ) => {
    const source = collections.find((c) => c.id === sourceCollectionId);
    const target = collections.find((c) => c.id === targetCollectionId);
    if (!source || !target) return;
    const sourceItem = source.items.find((it) => it.property_id === propertyId);
    if (!sourceItem) return;

    if (sourceCollectionId === targetCollectionId) {
      // reorder within
      const arr = [...source.items];
      const fromIdx = arr.findIndex((it) => it.property_id === propertyId);
      const [picked] = arr.splice(fromIdx, 1);
      const insertAt = Math.min(targetIndex, arr.length);
      arr.splice(insertAt, 0, picked);
      setCollections((prev) =>
        prev.map((c) => (c.id === sourceCollectionId ? { ...c, items: arr } : c)),
      );
      await persistItems(sourceCollectionId, arr);
    } else {
      const { error: delErr } = await supabase
        .from("property_collection_items")
        .delete()
        .eq("id", sourceItem.id);
      if (delErr) {
        toast.error(delErr.message);
        return;
      }
      const targetArr = [...target.items];
      const newPos = Math.min(targetIndex, targetArr.length);
      // shift positions of items at >= newPos
      await Promise.all(
        targetArr.slice(newPos).map((it, k) =>
          supabase
            .from("property_collection_items")
            .update({ position: newPos + 1 + k })
            .eq("id", it.id),
        ),
      );
      const { error: insErr } = await supabase
        .from("property_collection_items")
        .insert({
          collection_id: targetCollectionId,
          property_id: propertyId,
          position: newPos,
        });
      if (insErr) {
        toast.error(insErr.message);
      }
      void loadAll();
    }
  };

  // ---------- DnD helpers ----------
  const onDragStartItem = (
    e: React.DragEvent,
    collectionId: string,
    propertyId: string,
  ) => {
    setDrag({ kind: "item", collectionId, propertyId });
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", propertyId);
  };

  const onDragStartCollection = (e: React.DragEvent, collectionId: string) => {
    setDrag({ kind: "collection", collectionId });
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", collectionId);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const onDropOnItem = (
    e: React.DragEvent,
    targetCollectionId: string,
    targetIndex: number,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (!drag) return;
    if (drag.kind === "item") {
      void moveItem(drag.collectionId, drag.propertyId, targetCollectionId, targetIndex);
    }
    setDrag(null);
  };

  const onDropOnCollection = (e: React.DragEvent, targetCollectionId: string) => {
    e.preventDefault();
    if (!drag) return;
    if (drag.kind === "item") {
      const target = collections.find((c) => c.id === targetCollectionId);
      const idx = target?.items.length ?? 0;
      void moveItem(drag.collectionId, drag.propertyId, targetCollectionId, idx);
    } else if (drag.kind === "collection" && drag.collectionId !== targetCollectionId) {
      const fromIdx = collections.findIndex((c) => c.id === drag.collectionId);
      const toIdx = collections.findIndex((c) => c.id === targetCollectionId);
      if (fromIdx < 0 || toIdx < 0) return;
      const arr = [...collections];
      const [picked] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, picked);
      void persistCollectionsOrder(arr);
    }
    setDrag(null);
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
        Carregando pastas...
      </div>
    );
  }

  const filteredPicker = unassigned.filter((p) =>
    pickerSearch
      ? `${p.title} ${p.neighborhood ?? ""}`
          .toLowerCase()
          .includes(pickerSearch.toLowerCase())
      : true,
  );

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-heading font-bold text-foreground flex items-center gap-2">
            <Folder className="w-5 h-5 text-secondary" />
            Pastas de Imóveis
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Crie pastas, arraste para reordenar e arraste imóveis entre elas. A ordem é refletida em <strong>Imóveis em Destaque</strong> na página inicial.
          </p>
        </div>
        <Button
          onClick={createCollection}
          className="bg-secondary text-secondary-foreground hover:bg-orange-hover rounded-xl"
        >
          <FolderPlus className="w-4 h-4 mr-2" /> Nova pasta
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {collections.map((c) => (
          <div
            key={c.id}
            draggable
            onDragStart={(e) => onDragStartCollection(e, c.id)}
            onDragOver={onDragOver}
            onDrop={(e) => onDropOnCollection(e, c.id)}
            className="rounded-lg border border-border bg-background"
          >
            <div className="flex items-center justify-between p-3 border-b border-border bg-muted/30 rounded-t-lg cursor-move">
              <div className="flex items-center gap-2 min-w-0">
                <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
                <Folder className="w-4 h-4 text-secondary shrink-0" />
                <span className="font-semibold text-foreground truncate">{c.name}</span>
                <span className="text-xs text-muted-foreground shrink-0">({c.items.length})</span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => {
                    setEditing(c);
                    setEditName(c.name);
                  }}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-destructive hover:bg-destructive/10"
                  onClick={() => deleteCollection(c.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            <div className="p-3 space-y-2 min-h-[80px]">
              {c.items.length === 0 && (
                <div className="text-xs text-muted-foreground text-center py-4 border border-dashed border-border rounded-lg">
                  Arraste imóveis para cá ou clique em "Adicionar".
                </div>
              )}
              {c.items.map((it, idx) => {
                const p = propById.get(it.property_id);
                return (
                  <div
                    key={it.id}
                    draggable
                    onDragStart={(e) => onDragStartItem(e, c.id, it.property_id)}
                    onDragOver={onDragOver}
                    onDrop={(e) => onDropOnItem(e, c.id, idx)}
                    className="flex items-center gap-3 p-2 rounded-md border border-border bg-card hover:border-secondary/50 transition-colors cursor-move"
                  >
                    <GripVertical className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    {p?.image ? (
                      <img
                        src={p.image}
                        alt=""
                        className="w-10 h-10 rounded object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded bg-muted shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {p?.title ?? it.property_id}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {p?.neighborhood ?? ""} · {fmt(p?.price ?? 0)}
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive hover:bg-destructive/10"
                      onClick={() => removeItem(it.id)}
                      title="Remover desta pasta"
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                );
              })}
              <Button
                size="sm"
                variant="outline"
                className="w-full mt-2"
                onClick={() => {
                  setPickerOpen(c.id);
                  setPickerSearch("");
                }}
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Adicionar imóvel
              </Button>
            </div>
          </div>
        ))}

        {collections.length === 0 && (
          <div className="lg:col-span-2 text-center py-10 text-sm text-muted-foreground border border-dashed border-border rounded-lg">
            Nenhuma pasta criada. Clique em <strong>Nova pasta</strong> para começar.
          </div>
        )}
      </div>

      {/* Unassigned pool */}
      <div className="mt-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">
          Não atribuídos ({unassigned.length})
        </h3>
        <div className="max-h-64 overflow-y-auto rounded-lg border border-border bg-background p-2 grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {unassigned.slice(0, 60).map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-2 p-2 rounded border border-border bg-card text-xs"
            >
              {p.image ? (
                <img src={p.image} alt="" className="w-8 h-8 rounded object-cover shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded bg-muted shrink-0" />
              )}
              <span className="flex-1 min-w-0 truncate text-foreground">{p.title}</span>
            </div>
          ))}
          {unassigned.length === 0 && (
            <p className="col-span-full text-center py-4 text-muted-foreground">
              Todos os imóveis já estão em pastas.
            </p>
          )}
          {unassigned.length > 60 && (
            <p className="col-span-full text-center text-muted-foreground pt-1">
              + {unassigned.length - 60} imóveis ocultos (use "Adicionar imóvel" em uma pasta para buscar).
            </p>
          )}
        </div>
      </div>

      {/* Picker dialog */}
      <Dialog open={!!pickerOpen} onOpenChange={(o) => !o && setPickerOpen(null)}>
        <DialogContent className="max-w-xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Adicionar imóvel à pasta</DialogTitle>
          </DialogHeader>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={pickerSearch}
              onChange={(e) => setPickerSearch(e.target.value)}
              placeholder="Buscar por título ou bairro..."
              className="pl-9"
            />
          </div>
          <div className="flex-1 overflow-y-auto mt-3 space-y-1">
            {filteredPicker.length === 0 && (
              <p className="text-sm text-center text-muted-foreground py-6">
                Nenhum imóvel disponível.
              </p>
            )}
            {filteredPicker.slice(0, 100).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={async () => {
                  if (pickerOpen) {
                    await addPropertyToCollection(pickerOpen, p.id);
                    setPickerOpen(null);
                  }
                }}
                className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-muted text-left"
              >
                {p.image ? (
                  <img src={p.image} alt="" className="w-10 h-10 rounded object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded bg-muted" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{p.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {p.neighborhood ?? ""} · {fmt(p.price)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Rename dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Renomear pasta</DialogTitle>
          </DialogHeader>
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="Nome da pasta"
            className="mt-2"
          />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
            <Button
              onClick={renameCollection}
              className="bg-secondary text-secondary-foreground hover:bg-orange-hover"
            >
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PropertyCollectionsManager;
