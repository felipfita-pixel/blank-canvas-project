import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const HEARTBEAT_INTERVAL = 30000; // 30s

export const useBrokerPresence = () => {
  const { user } = useAuth();
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setOnline = useCallback(async (userId: string) => {
    await supabase.from("broker_presence").upsert(
      { user_id: userId, is_online: true, last_seen_at: new Date().toISOString(), is_typing_conversation: "" },
      { onConflict: "user_id" }
    );
  }, []);

  const setOffline = useCallback(async (userId: string) => {
    await supabase.from("broker_presence").upsert(
      { user_id: userId, is_online: false, last_seen_at: new Date().toISOString(), is_typing_conversation: "" },
      { onConflict: "user_id" }
    );
  }, []);

  useEffect(() => {
    if (!user) return;

    setOnline(user.id);

    heartbeatRef.current = setInterval(() => {
      supabase.from("broker_presence").upsert(
        { user_id: user.id, is_online: true, last_seen_at: new Date().toISOString() },
        { onConflict: "user_id" }
      );
    }, HEARTBEAT_INTERVAL);

    const handleBeforeUnload = () => {
      navigator.sendBeacon && setOffline(user.id);
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      setOffline(user.id);
    };
  }, [user, setOnline, setOffline]);

  const setTyping = useCallback(
    (conversationId: string) => {
      if (!user) return;
      supabase.from("broker_presence").upsert(
        { user_id: user.id, is_online: true, is_typing_conversation: conversationId, last_seen_at: new Date().toISOString() },
        { onConflict: "user_id" }
      );
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        supabase.from("broker_presence").upsert(
          { user_id: user.id, is_online: true, is_typing_conversation: "", last_seen_at: new Date().toISOString() },
          { onConflict: "user_id" }
        );
      }, 3000);
    },
    [user]
  );

  return { setTyping };
};
