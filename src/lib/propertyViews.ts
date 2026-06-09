import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "ff_view_session_id";
const TRACKED_KEY = "ff_view_tracked";

function getSessionId(): string {
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id =
        (crypto as Crypto & { randomUUID?: () => string }).randomUUID?.() ??
        `sess_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
  }
}

function getTrackedSet(): Set<string> {
  try {
    const raw = localStorage.getItem(TRACKED_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function saveTrackedSet(set: Set<string>) {
  try {
    localStorage.setItem(TRACKED_KEY, JSON.stringify(Array.from(set)));
  } catch {}
}

/** Track a property view. Deduplicated locally (per session) + at DB level. */
export async function trackPropertyView(propertyId: string): Promise<void> {
  if (!propertyId) return;
  const tracked = getTrackedSet();
  if (tracked.has(propertyId)) return;
  tracked.add(propertyId);
  saveTrackedSet(tracked);

  try {
    await supabase.rpc("track_property_view", {
      p_property_id: propertyId,
      p_session_id: getSessionId(),
    });
  } catch (err) {
    console.warn("[trackPropertyView]", err);
  }
}

export async function fetchPropertyViewCount(propertyId: string): Promise<number> {
  if (!propertyId) return 0;
  const { data } = await supabase
    .from("property_view_counts")
    .select("views")
    .eq("property_id", propertyId)
    .maybeSingle();
  return Number(data?.views ?? 0);
}

export async function fetchPropertyViewCountsMap(
  propertyIds: string[]
): Promise<Record<string, number>> {
  const map: Record<string, number> = {};
  if (propertyIds.length === 0) return map;
  const { data } = await supabase
    .from("property_view_counts")
    .select("property_id, views")
    .in("property_id", propertyIds);
  (data ?? []).forEach((row) => {
    map[row.property_id as string] = Number(row.views ?? 0);
  });
  return map;
}

export async function fetchTotalPropertyViews(): Promise<number> {
  const { data } = await supabase
    .from("property_views_total")
    .select("total")
    .maybeSingle();
  return Number(data?.total ?? 0);
}

export async function fetchTopViewedProperties(limit = 10) {
  const { data } = await supabase
    .from("property_view_counts")
    .select("property_id, views")
    .order("views", { ascending: false })
    .limit(limit);
  return (data ?? []) as { property_id: string; views: number }[];
}
