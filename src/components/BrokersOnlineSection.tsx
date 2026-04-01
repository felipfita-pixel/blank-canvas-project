import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface Broker {
  id: string;
  full_name: string;
  avatar_url: string | null;
  neighborhoods: string[] | null;
  isBot: boolean;
  isAttending: boolean;
  isRealOnline?: boolean;
}

const BOT_FIRST_NAMES = [
  "Carlos", "Fernanda", "Ricardo", "Juliana", "André", "Patrícia", "Marcos",
  "Camila", "Roberto", "Luciana", "Eduardo", "Beatriz", "Paulo", "Mariana",
  "Gustavo", "Aline", "Thiago", "Renata", "Diego", "Vanessa", "Bruno",
  "Tatiana", "Rafael", "Débora", "Leonardo", "Cristina", "Henrique",
  "Sabrina", "Vinícius", "Priscila"
];

const BOT_LAST_NAMES = [
  "Silva", "Santos", "Oliveira", "Souza", "Pereira", "Costa", "Rodrigues",
  "Almeida", "Nascimento", "Lima", "Araújo", "Fernandes", "Carvalho",
  "Gomes", "Martins", "Rocha", "Ribeiro", "Barros", "Freitas", "Moreira"
];

const NEIGHBORHOODS = [
  "Barra da Tijuca", "Leblon", "Ipanema", "Copacabana", "Botafogo",
  "Recreio", "Tijuca", "Jardim Botânico", "Flamengo", "Lagoa"
];

const WHATSAPP_ADMIN = "5521975316631";

const generateBotBrokers = (): Broker[] => {
  return BOT_FIRST_NAMES.map((firstName, i) => ({
    id: `bot-${i}`,
    full_name: `${firstName} ${BOT_LAST_NAMES[i % BOT_LAST_NAMES.length]}`,
    avatar_url: null,
    neighborhoods: [NEIGHBORHOODS[i % NEIGHBORHOODS.length], NEIGHBORHOODS[(i + 3) % NEIGHBORHOODS.length]],
    phone: "",
    isBot: true,
    isAttending: i < 15,
  }));
};

const shuffleArray = <T,>(arr: T[]): T[] => {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const BrokersOnlineSection = () => {
  const [realBrokers, setRealBrokers] = useState<Broker[]>([]);
  const [shuffledBots, setShuffledBots] = useState<Broker[]>(() => shuffleArray(generateBotBrokers()));

  useEffect(() => {
    const fetchBrokers = async () => {
      // Fetch brokers and online presence in parallel
      const [brokersRes, presenceRes] = await Promise.all([
        supabase.from("brokers_public").select("id, full_name, avatar_url, neighborhoods, user_id"),
        supabase.from("broker_presence").select("user_id, is_online").eq("is_online", true),
      ]);

      const onlineUserIds = new Set(
        (presenceRes.data || []).map((p: { user_id: string }) => p.user_id)
      );

      if (brokersRes.data) {
        setRealBrokers(
          brokersRes.data.map((b: any) => ({
            id: b.id,
            full_name: b.full_name,
            avatar_url: b.avatar_url,
            neighborhoods: b.neighborhoods,
            isBot: false,
            isAttending: false,
            isRealOnline: b.user_id ? onlineUserIds.has(b.user_id) : false,
          }))
        );
      }
    };
    fetchBrokers();

    // Subscribe to broker_presence changes for real-time updates
    const channel = supabase
      .channel("brokers-online-status")
      .on("postgres_changes", { event: "*", schema: "public", table: "broker_presence" }, () => {
        fetchBrokers();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Shuffle bot brokers every 30 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setShuffledBots(shuffleArray(generateBotBrokers()));
    }, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Online real brokers first, then offline real brokers, then bots
  const onlineReal = realBrokers.filter(b => b.isRealOnline);
  const offlineReal = realBrokers.filter(b => !b.isRealOnline);
  const allBrokers = [...onlineReal, ...offlineReal, ...shuffledBots];

  const handleContact = (broker: Broker) => {
    const msg = encodeURIComponent(`Olá, gostaria de falar com ${broker.full_name} sobre imóveis.`);
    window.open(`https://wa.me/${WHATSAPP_ADMIN}?text=${msg}`, "_blank");
  };

  const handleChat = (broker: Broker) => {
    const chatBtn = document.querySelector('[data-chat-widget-trigger]') as HTMLButtonElement;
    if (chatBtn) chatBtn.click();
  };

  return (
    <section className="section-padding bg-cream">
      <div className="container-main text-center">
        <h2 className="text-3xl font-heading font-bold text-primary mb-2 italic">
          Corretores Online
        </h2>
        <p className="text-muted-foreground mb-2 max-w-xl mx-auto">
          Nossa equipe está pronta para atender você agora
        </p>
        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
          </span>
          <span className="text-sm font-semibold text-emerald-600">
            {onlineReal.length > 0
              ? `${onlineReal.length} corretor${onlineReal.length > 1 ? "es" : ""} online agora`
              : `${allBrokers.length} corretores disponíveis`}
            {" • "}{realBrokers.length + 15} atendendo agora
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {allBrokers.slice(0, 30).map((broker, i) => (
            <motion.div
              key={broker.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.03 }}
              className="bg-card rounded-xl border border-border p-4 shadow-sm hover:shadow-md transition-shadow relative"
            >
              {/* Online indicator - bright green for real online, subtle for bots */}
              {(broker.isRealOnline || broker.isBot) && (
                <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
              )}
              {!broker.isBot && !broker.isRealOnline && (
                <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-muted-foreground/40" />
                </span>
              )}

              {/* Avatar */}
              <div className="w-14 h-14 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                {broker.avatar_url ? (
                  <img src={broker.avatar_url} alt={broker.full_name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-7 h-7 text-primary" />
                )}
              </div>

              <h4 className="font-semibold text-foreground text-sm line-clamp-1">{broker.full_name}</h4>
              
              {broker.isRealOnline ? (
                <Badge className="mt-1 bg-emerald-100 text-emerald-700 text-[10px] px-2">🟢 Online</Badge>
              ) : broker.isAttending ? (
                <Badge className="mt-1 bg-secondary/20 text-secondary text-[10px] px-2">Atendendo</Badge>
              ) : !broker.isBot ? (
                <Badge className="mt-1 bg-muted text-muted-foreground text-[10px] px-2">Offline</Badge>
              ) : (
                <Badge className="mt-1 bg-emerald-100 text-emerald-700 text-[10px] px-2">Disponível</Badge>
              )}

              {broker.neighborhoods && broker.neighborhoods.length > 0 && (
                <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">
                  {broker.neighborhoods.slice(0, 2).join(", ")}
                </p>
              )}

              <div className="flex gap-1 mt-3">
                <Button
                  size="sm"
                  onClick={() => handleContact(broker)}
                  className="flex-1 bg-[#25D366] text-primary-foreground hover:bg-[#1da851] text-[10px] px-1 h-7"
                >
                  <Phone className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleChat(broker)}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-navy-light text-[10px] px-1 h-7"
                >
                  <MessageCircle className="w-3 h-3" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrokersOnlineSection;
