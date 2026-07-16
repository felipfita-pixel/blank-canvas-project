import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { X, Send, Loader2, Home } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Msg = { role: "user" | "assistant"; content: string };

const STORAGE_KEY = "corretores_ia_history";
const POS_KEY = "corretores_ia_btn_pos";
const BTN_SIZE = 64; // w-16
const LABEL_H = 28;
const MARGIN = 8;
const GREETING: Msg = {
  role: "assistant",
  content:
    "Olá! Sou a **Corretores IA**, sua especialista imobiliária inteligente. Posso ajudar com imóveis na Barra, Recreio, Ilha Pura, Zona Sul, documentação, financiamento e muito mais. Como posso ajudar hoje?",
};

const CorretoresIA = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Msg[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as Msg[];
    } catch {}
    return [GREETING];
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {}
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200);
  }, [open]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const newMsgs: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("corretores-ia-chat", {
        body: { messages: newMsgs.map(({ role, content }) => ({ role, content })) },
      });
      if (error) throw error;
      const reply = (data as { reply?: string; error?: string })?.reply;
      const errMsg = (data as { error?: string })?.error;
      setMessages([
        ...newMsgs,
        { role: "assistant", content: reply || errMsg || "Não consegui responder agora." },
      ]);
    } catch (e) {
      console.error(e);
      setMessages([
        ...newMsgs,
        { role: "assistant", content: "Ocorreu um erro. Tente novamente em instantes." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  };

  // Draggable button position
  const getDefaultPos = () => {
    if (typeof window === "undefined") return { x: 0, y: 0 };
    return {
      x: window.innerWidth - BTN_SIZE - 24,
      y: window.innerHeight - 160 - BTN_SIZE,
    };
  };
  const [pos, setPos] = useState<{ x: number; y: number }>(() => {
    try {
      const raw = localStorage.getItem(POS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return getDefaultPos();
  });
  const [dragging, setDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const suppressClickRef = useRef(false);

  const clamp = (p: { x: number; y: number }) => {
    if (typeof window === "undefined") return p;
    const maxX = window.innerWidth - BTN_SIZE - MARGIN;
    const maxY = window.innerHeight - BTN_SIZE - LABEL_H - MARGIN;
    return {
      x: Math.min(Math.max(MARGIN, p.x), maxX),
      y: Math.min(Math.max(MARGIN, p.y), maxY),
    };
  };

  useEffect(() => {
    const onResize = () => setPos((p) => clamp(p));
    window.addEventListener("resize", onResize);
    setPos((p) => clamp(p));
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDragStart = (_: unknown, info: PanInfo) => {
    dragStartRef.current = { x: info.point.x, y: info.point.y, t: Date.now() };
    setDragging(true);
  };
  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const next = clamp({ x: pos.x + info.offset.x, y: pos.y + info.offset.y });
    setPos(next);
    try { localStorage.setItem(POS_KEY, JSON.stringify(next)); } catch {}
    const start = dragStartRef.current;
    const dist = start
      ? Math.hypot(info.point.x - start.x, info.point.y - start.y)
      : 0;
    suppressClickRef.current = dist > 5;
    setDragging(false);
  };
  const handleClick = () => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    setOpen(true);
  };



  return (
    <>
      {/* Floating button — casa 3D estilo alto padrão (arrastável) */}
      <motion.div
        drag
        dragMomentum={false}
        dragElastic={0}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        animate={{ x: pos.x, y: pos.y, scale: dragging ? 1.05 : 1, opacity: dragging ? 0.9 : 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 40 }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 9999,
          touchAction: "none",
          cursor: dragging ? "grabbing" : "grab",
          filter: dragging ? "drop-shadow(0 12px 24px rgba(0,0,0,0.35))" : "none",
        }}
        className="flex flex-col items-center gap-1.5 select-none"
      >
        <motion.button
          onClick={handleClick}
          whileHover={dragging ? undefined : { scale: 1.08, y: -2 }}
          whileTap={dragging ? undefined : { scale: 0.95 }}
          aria-label="Abrir Corretores IA"
          className="group relative w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden"
          style={{
            background:
              "linear-gradient(145deg, #1a2744 0%, #0f1a30 50%, #1a2744 100%)",
            boxShadow:
              "0 10px 30px -8px rgba(212,175,55,0.45), 0 4px 12px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.12)",
            border: "1px solid rgba(212,175,55,0.4)",
            cursor: dragging ? "grabbing" : "pointer",
          }}
          draggable={false}
        >
          {/* Glow */}
          <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ background: "radial-gradient(circle at 30% 30%, rgba(212,175,55,0.35), transparent 65%)" }} />
          {/* House icon */}
          <Home
            className="w-8 h-8 relative z-10"
            style={{ color: "#d4af37", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}
            strokeWidth={1.5}
          />
          <span
            className="absolute z-20 text-[9px] font-bold tracking-wider"
            style={{
              color: "#d4af37",
              top: "58%",
              textShadow: "0 1px 2px rgba(0,0,0,0.6)",
              fontFamily: "'Playfair Display', serif",
            }}
          >
            IA
          </span>
          <span className="absolute top-1 left-1 right-1 h-1/3 rounded-t-xl opacity-40"
            style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.35), transparent)" }} />
        </motion.button>
        <span
          className="text-[10px] font-semibold tracking-wider uppercase text-white px-2 py-0.5 rounded-full pointer-events-none"
          style={{
            background: "linear-gradient(135deg, #1a2744, #0f1a30)",
            border: "1px solid rgba(212,175,55,0.5)",
            boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
            fontFamily: "'Playfair Display', serif",
          }}
        >
          Corretores IA
        </span>
      </motion.div>


      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-4 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 h-[70vh] max-h-[600px] rounded-2xl overflow-hidden flex flex-col"
            style={{
              background: "linear-gradient(160deg, #0f1a30 0%, #1a2744 100%)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(212,175,55,0.3)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: "1px solid rgba(212,175,55,0.25)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center relative"
                  style={{
                    background: "linear-gradient(145deg, #1a2744, #0a1220)",
                    border: "1px solid rgba(212,175,55,0.5)",
                  }}
                >
                  <Home className="w-5 h-5" style={{ color: "#d4af37" }} strokeWidth={1.5} />
                  <span
                    className="absolute text-[7px] font-bold"
                    style={{ color: "#d4af37", top: "56%", fontFamily: "'Playfair Display', serif" }}
                  >
                    IA
                  </span>
                </div>
                <div className="leading-tight">
                  <p
                    className="text-white font-semibold text-sm"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Corretores IA
                  </p>
                  <p className="text-[10px] tracking-widest uppercase" style={{ color: "#d4af37" }}>
                    Especialista imobiliário
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                      m.role === "user"
                        ? "text-white rounded-br-sm"
                        : "text-white/95 rounded-bl-sm"
                    }`}
                    style={
                      m.role === "user"
                        ? {
                            background:
                              "linear-gradient(135deg, #d4af37 0%, #b8941f 100%)",
                            color: "#1a2744",
                            fontWeight: 500,
                          }
                        : {
                            background: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(212,175,55,0.15)",
                          }
                    }
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div
                    className="rounded-2xl rounded-bl-sm px-3.5 py-2 flex items-center gap-2"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(212,175,55,0.15)",
                    }}
                  >
                    <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#d4af37" }} />
                    <span className="text-xs text-white/70">Pensando...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Composer */}
            <div
              className="p-3"
              style={{ borderTop: "1px solid rgba(212,175,55,0.25)" }}
            >
              <div
                className="flex items-end gap-2 rounded-xl p-2"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(212,175,55,0.25)",
                }}
              >
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKey}
                  placeholder="Fale com a Corretores IA..."
                  rows={1}
                  className="flex-1 bg-transparent text-white text-sm placeholder-white/40 resize-none outline-none max-h-24 py-1 px-1"
                />
                <button
                  onClick={() => void send()}
                  disabled={loading || !input.trim()}
                  className="w-9 h-9 rounded-lg flex items-center justify-center disabled:opacity-40 transition"
                  style={{
                    background: "linear-gradient(135deg, #d4af37, #b8941f)",
                    color: "#1a2744",
                  }}
                  aria-label="Enviar"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[9px] text-white/40 text-center mt-2 tracking-wider uppercase">
                Núcleo IA27 · Ecossistema ELO27
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CorretoresIA;
