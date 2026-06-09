import { useEffect, useState } from "react";
import {
  fetchPropertyViewCount,
  fetchPropertyViewCountsMap,
  fetchTotalPropertyViews,
} from "@/lib/propertyViews";

export function usePropertyViewCount(propertyId: string | undefined | null) {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;
    if (!propertyId) {
      setCount(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchPropertyViewCount(propertyId).then((c) => {
      if (active) {
        setCount(c);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [propertyId]);

  return { count, loading };
}

export function usePropertyViewCountsMap(propertyIds: string[]) {
  const key = propertyIds.join(",");
  const [map, setMap] = useState<Record<string, number>>({});

  useEffect(() => {
    let active = true;
    if (propertyIds.length === 0) {
      setMap({});
      return;
    }
    fetchPropertyViewCountsMap(propertyIds).then((m) => {
      if (active) setMap(m);
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return map;
}

export function useTotalPropertyViews() {
  const [total, setTotal] = useState<number>(0);
  useEffect(() => {
    let active = true;
    fetchTotalPropertyViews().then((t) => {
      if (active) setTotal(t);
    });
    return () => {
      active = false;
    };
  }, []);
  return total;
}
