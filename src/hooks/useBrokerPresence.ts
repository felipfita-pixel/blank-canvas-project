import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { hashConversationId } from "@/lib/conversationHash";

const HEARTBEAT_INTERVAL = 30000; // 30s

export const useBrokerPresence = () => {
  const { user } = useAuth();
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Only update last_seen_at heartbeat — do NOT change is_online automatically
  useEffect(() => {
    if (!user) return;

    // Ensure presence row exists (but don't force online)
    const ensureRow = async () => {
      const { data } = await supabase
        .from("broker_presence")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!data) {
        await supabase.from("broker_presence").upsert(
          { user_id: user.id, is_online: false, last_seen_at: new Date().toISOString(), is_typing_conversation: "" },
          { onConflict: "user_id" }
        );
      }
    };
    ensureRow();

    // Heartbeat only updates last_seen_at (keeps current is_online state)
    heartbeatRef.current = setInterval(async () => {
      await supabase.from("broker_presence").update(
        { last_seen_at: new Date().toISOString() }
      ).eq("user_id", user.id);
    }, HEARTBEAT_INTERVAL);

    const handleBeforeUnload = () => {
      // Set offline when closing browser
      supabase.from("broker_presence").upsert(
        { user_id: user.id, is_online: false, last_seen_at: new Date().toISOString(), is_typing_conversation: "" },
        { onConflict: "user_id" }
      );
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [user]);

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
