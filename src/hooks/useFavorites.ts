import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const useFavorites = () => {
  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavoriteIds(new Set());
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("favorites" as any)
      .select("property_id")
      .eq("user_id", user.id);
    if (data) {
      setFavoriteIds(new Set((data as any[]).map((f) => f.property_id)));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const toggleFavorite = useCallback(
    async (propertyId: string) => {
      if (!user) {
        toast.info("Faça login para salvar favoritos");
        return;
      }
      const isFav = favoriteIds.has(propertyId);
      if (isFav) {
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.delete(propertyId);
          return next;
        });
        await supabase
          .from("favorites" as any)
          .delete()
          .eq("user_id", user.id)
          .eq("property_id", propertyId);
        toast.success("Removido dos favoritos");
      } else {
        setFavoriteIds((prev) => new Set(prev).add(propertyId));
        await supabase
          .from("favorites" as any)
          .insert({ user_id: user.id, property_id: propertyId } as any);
        toast.success("Adicionado aos favoritos");
      }
    },
    [user, favoriteIds]
  );

  const isFavorite = useCallback(
    (propertyId: string) => favoriteIds.has(propertyId),
    [favoriteIds]
  );

  return { favoriteIds, toggleFavorite, isFavorite, loading, fetchFavorites };
};
