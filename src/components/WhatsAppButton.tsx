import { useState } from "react";
import { MessageCircle, X, Bot, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const WHATSAPP_NUMBER = "5521975316631";
const WHATSAPP_MESSAGE = encodeURIComponent("Olá, gostaria de mais informações sobre imóveis.");
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;

const WhatsAppButton = () => {
  const [showTooltip, setShowTooltip] = useState(true);

  const handleOpenChat = () => {
    const chatBtn = document.querySelector('[data-chat-widget-trigger]') as HTMLButtonElement;
    if (chatBtn) chatBtn.click();
  };

  return (
    <div className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-50 flex flex-col items-start gap-3">
      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, x: -20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="relative bg-primary-foreground rounded-2xl shadow-xl shadow-navy-dark/15 px-4 py-2.5 sm:px-5 sm:py-3 max-w-[200px] sm:max-w-[220px] ml-1"
          >
            <button
              onClick={() => setShowTooltip(false)}
              className="absolute -top-2 -left-2 w-5 h-5 bg-muted rounded-full flex items-center justify-center text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
            <p className="text-xs sm:text-sm font-body font-semibold text-foreground leading-snug">
              Olá! 👋
            </p>
            <p className="text-[11px] sm:text-xs font-body text-muted-foreground mt-1 leading-relaxed">
              Como posso ajudar você a encontrar o imóvel ideal?
            </p>
            <div className="absolute left-4 bottom-0 translate-y-1/2 w-3 h-3 bg-primary-foreground rotate-45 shadow-lg" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-2">
        {/* WhatsApp */}
        <motion.a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#25D366] flex items-center justify-center shadow-md shadow-[#25D366]/30 hover:shadow-lg transition-shadow"
          title="WhatsApp"
        >
          <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-foreground" />
        </motion.a>

        {/* Chat com Corretor */}
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1, type: "spring", stiffness: 200 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleOpenChat}
          className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-primary flex items-center justify-center shadow-md hover:shadow-lg transition-shadow"
          title="Chat com Corretor"
        >
          <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-foreground" />
        </motion.button>
      </div>
    </div>
  );
};

export default WhatsAppButton;
