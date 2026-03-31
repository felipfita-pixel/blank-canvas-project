import { useState, useEffect } from "react";
import { Headset } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

const TalkToSpecialistButton = () => {
  const [onlineCount, setOnlineCount] = useState(0);
  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    const fetchOnline = async () => {
      const { count } = await supabase
        .from("brokers_public")
        .select("id", { count: "exact", head: true })
        .eq("status", "approved");
      // Real brokers + simulated online
      setOnlineCount((count || 0) + 15);
    };
    fetchOnline();
  }, []);

  const handleClick = () => {
    const chatBtn = document.querySelector('[data-chat-widget-trigger]') as HTMLButtonElement;
    if (chatBtn) chatBtn.click();
  };

  return (
    <motion.button
      onClick={handleClick}
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1.5, type: "spring", stiffness: 120 }}
      className="fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 z-40 group"
    >
      <div className="relative bg-secondary text-secondary-foreground rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 px-4 py-3 flex flex-col items-center gap-1.5 hover:scale-105">
        {/* Pulse indicator */}
        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-secondary" />
        </span>

        <Headset className="w-6 h-6 sm:w-7 sm:h-7" />
        
        <span className="text-[10px] sm:text-xs font-bold leading-tight text-center whitespace-nowrap">
          Fale com um
          <br />
          Especialista
        </span>

        {onlineCount > 0 && (
          <span className="text-[9px] sm:text-[10px] font-medium bg-secondary-foreground/20 rounded-full px-2 py-0.5 whitespace-nowrap">
            {onlineCount} online
          </span>
        )}
      </div>
    </motion.button>
  );
};

export default TalkToSpecialistButton;
