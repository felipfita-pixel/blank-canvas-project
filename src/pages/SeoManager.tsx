import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { CheckCircle2, MessageSquare, ArrowRight, TrendingUp, Search, MousePointer2, Link2, Globe, FileBarChart, MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link } from "react-router-dom";

const SeoManager = () => {
  const whatsappNumber = "5521975316631";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Olá! Gostaria de solicitar um orçamento para o serviço de SEO Manager.`;

  const services = [
    { title: "Auditoria SEO", icon: <Search className="w-6 h-6" />, desc: "Análise profunda técnica e de conteúdo para identificar gargalos." },
    { title: "Palavras-chave", icon: <FileBarChart className="w-6 h-6" />, desc: "Pesquisa estratégica de termos com alto potencial de conversão." },
    { title: "SEO On Page", icon: <CheckCircle2 className="w-6 h-6" />, desc: "Otimização de títulos, metas, headers e conteúdo interno." },
    { title: "SEO Técnico", icon: <Settings className="w-6 h-6" />, desc: "Melhoria de performance, Core Web Vitals e indexação." },
    { title: "Link Building", icon: <Link2 className="w-6 h-6" />, desc: "Conquista de autoridade através de links de qualidade." },
    { title: "SEO Local", icon: <MapPin className="w-6 h-6" />, desc: "Otimização para Google Maps e buscas regionais." },
    { title: "Monitoramento", icon: <TrendingUp className="w-6 h-6" />, desc: "Acompanhamento diário de posições e visibilidade." },
    { title: "Google Search Console", icon: <Globe className="w-6 h-6" />, desc: "Gestão completa da comunicação com o Google." },
    { title: "Google Analytics", icon: <TrendingUp className="w-6 h-6" />, desc: "Análise de comportamento e origem de tráfego." },
    { title: "Relatórios Mensais", icon: <FileBarChart className="w-6 h-6" />, desc: "Transparência total com KPIs e resultados alcançados." },
  ];

  const faq = [
    { q: "O que faz um SEO Manager?", a: "Um SEO Manager é responsável por planejar e executar estratégias para melhorar a visibilidade de um site nos motores de busca (como o Google). Isso envolve desde ajustes técnicos até a criação de conteúdo estratégico e autoridade de marca." },
    { q: "Quanto custa o serviço de SEO?", a: "O investimento varia de acordo com o tamanho do site, a concorrência do setor e os objetivos desejados. Oferecemos planos personalizados após uma auditoria inicial gratuita." },
    { q: "Quanto tempo demora para ver resultados?", a: "O SEO é uma estratégia de médio a longo prazo. Geralmente, as primeiras melhorias de posicionamento aparecem em 3 meses, com resultados sólidos de tráfego entre 6 a 12 meses." },
    { q: "Vale a pena investir em SEO?", a: "Sim. Diferente do tráfego pago, o SEO constrói um ativo para sua empresa. O tráfego orgânico é qualificado, gratuito (após a implementação) e gera autoridade contínua para sua marca." },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "SEO Manager para Empresas",
    "provider": {
      "@type": "RealEstateAgent",
      "name": "Corretores RJ",
      "url": "https://www.corretoresrj.com"
    },
    "description": "Serviço profissional de SEO Manager para aumentar o tráfego orgânico, melhorar o posicionamento no Google e gerar mais clientes.",
    "areaServed": "Brasil",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Serviços de SEO",
      "itemListElement": services.map((s, i) => ({
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": s.title
        }
      }))
    }
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faq.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.a
      }
    }))
  };

  return (
    <div className="bg-primary min-h-screen font-body text-white">
      <Helmet>
        <title>SEO Manager | Gestão Completa de SEO | Corretores RJ</title>
        <meta name="description" content="Serviço profissional de SEO Manager para aumentar o tráfego orgânico, melhorar o posicionamento no Google e gerar mais clientes." />
        <link rel="canonical" href="https://www.corretoresrj.com/seo-manager" />
        <meta name="robots" content="index, follow" />
        
        <meta property="og:title" content="SEO Manager | Gestão Completa de SEO | Corretores RJ" />
        <meta property="og:description" content="Aumente seu tráfego orgânico e conquiste a primeira página do Google com nossa gestão especializada." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.corretoresrj.com/seo-manager" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="SEO Manager | Gestão Completa de SEO" />
        <meta name="twitter:description" content="Serviço profissional de SEO para empresas e imobiliárias." />

        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Helmet>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="container-main px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-white leading-tight">
              SEO Manager <span className="text-secondary italic">para Empresas</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto mb-10 leading-relaxed">
              Configurar meu SEO Manager no corretoresrj.com. 
              Transformamos seu site em uma máquina de captação de leads orgânicos através de estratégias avançadas de SEO.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="bg-secondary hover:bg-orange-hover text-secondary-foreground font-bold px-8 h-14 rounded-full text-lg shadow-xl shadow-secondary/20">
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">Solicitar Orçamento</a>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/20 hover:bg-white/10 text-white font-bold px-8 h-14 rounded-full text-lg">
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <MessageSquare className="w-5 h-5 mr-2 text-secondary" />
                  Falar no WhatsApp
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-b from-secondary/10 to-transparent blur-3xl rounded-full opacity-20 pointer-events-none" />
      </section>

      {/* O que é */}
      <section className="py-20 bg-black/20">
        <div className="container-main px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">O que faz um <span className="text-secondary italic">SEO Manager?</span></h2>
              <div className="space-y-4 text-white/70 text-lg leading-relaxed">
                <p>
                  Um SEO Manager é o especialista que orquestra toda a presença orgânica da sua empresa nos buscadores. 
                  Não se trata apenas de "escolher palavras", mas de construir uma autoridade digital sólida.
                </p>
                <p>
                  Nossa gestão completa envolve desde o código-fonte (SEO Técnico) até a experiência do usuário e a autoridade que outros sites transmitem ao seu (Link Building).
                </p>
                <p>
                  Diferente de anúncios, os resultados do SEO são cumulativos. Cada melhoria feita hoje continua gerando frutos por meses e anos.
                </p>
              </div>
            </motion.div>
            <div className="relative">
              <div className="aspect-video bg-gradient-to-br from-secondary/20 to-primary-foreground/10 rounded-2xl border border-white/10 flex items-center justify-center">
                <TrendingUp className="w-24 h-24 text-secondary/40 animate-pulse" />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-secondary p-6 rounded-xl shadow-2xl hidden md:block">
                <p className="text-secondary-foreground font-bold text-2xl">100%</p>
                <p className="text-secondary-foreground/80 text-sm">Foco em Performance</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Serviços Inclusos */}
      <section className="py-20">
        <div className="container-main px-4">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-12 text-center">Nossa <span className="text-secondary italic">Estratégia 360º</span></h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {services.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-colors"
              >
                <div className="bg-secondary/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-secondary">
                  {s.icon}
                </div>
                <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="py-20 bg-secondary/10">
        <div className="container-main px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-12 text-center">Por que investir em <span className="text-secondary italic">Gestão de SEO?</span></h2>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                { title: "Mais Visibilidade", desc: "Esteja presente nas buscas exatas que seus clientes realizam." },
                { title: "Mais Leads Qualificados", desc: "Pessoas que buscam por soluções têm maior intenção de compra." },
                { title: "Redução de CAC", desc: "O custo por aquisição orgânica é drasticamente menor que o tráfego pago." },
                { title: "Autoridade de Marca", desc: "Estar no topo do Google transmite confiança e profissionalismo." }
              ].map((b, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <CheckCircle2 className="w-8 h-8 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-2">{b.title}</h3>
                    <p className="text-white/60 leading-relaxed">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Processo */}
      <section className="py-20">
        <div className="container-main px-4">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-16 text-center">Nosso <span className="text-secondary italic">Processo de Trabalho</span></h2>
          <div className="relative">
            {/* Connection line (desktop) */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -translate-y-1/2 hidden lg:block" />
            
            <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-8 relative z-10">
              {[
                { step: "01", title: "Diagnóstico", desc: "Auditoria técnica e competitiva." },
                { step: "02", title: "Planejamento", desc: "Definição de keywords e metas." },
                { step: "03", title: "Execução", desc: "Implementações técnicas e conteúdo." },
                { step: "04", title: "Otimização", desc: "Ajustes baseados em dados reais." },
                { step: "05", title: "Relatórios", desc: "Análise de resultados e ROI." },
              ].map((p, i) => (
                <div key={i} className="bg-primary border border-white/10 p-6 rounded-2xl text-center">
                  <span className="inline-block bg-secondary text-secondary-foreground font-bold px-3 py-1 rounded-full text-xs mb-4">{p.step}</span>
                  <h3 className="font-bold text-xl mb-3">{p.title}</h3>
                  <p className="text-sm text-white/50">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-black/20">
        <div className="container-main px-4 max-w-3xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-12 text-center">Perguntas <span className="text-secondary italic">Frequentes</span></h2>
          <Accordion type="single" collapsible className="w-full">
            {faq.map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-white/10">
                <AccordionTrigger className="text-left font-bold text-lg hover:text-secondary py-6">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-white/60 text-base leading-relaxed pb-6">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 relative overflow-hidden">
        <div className="container-main px-4 relative z-10">
          <div className="bg-gradient-to-br from-secondary to-orange-hover p-12 md:p-20 rounded-[3rem] text-center shadow-3xl shadow-secondary/20">
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-secondary-foreground mb-8">
              Pronto para dominar o <span className="italic">Google?</span>
            </h2>
            <p className="text-secondary-foreground/80 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-medium">
              Não deixe sua empresa invisível. Comece hoje sua jornada rumo ao topo das buscas e multiplique seu tráfego orgânico.
            </p>
            <Button asChild size="lg" className="bg-primary text-white hover:bg-black font-bold px-12 h-16 rounded-full text-xl group transition-all duration-300">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center">
                Quero falar com um especialista
                <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/20 blur-3xl rounded-full" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 blur-3xl rounded-full" />
      </section>

      {/* Footer Navigation Back to Home */}
      <div className="container-main px-4 py-12 border-t border-white/10 flex justify-between items-center opacity-60 hover:opacity-100 transition-opacity">
        <Link to="/" className="flex items-center gap-2 font-display italic text-lg hover:text-secondary transition-colors">
          <ArrowRight className="w-5 h-5 rotate-180" />
          Voltar para Home
        </Link>
        <p className="text-sm">SEO Profissional para Empresas © 2026</p>
      </div>
    </div>
  );
};

// Internal Settings component icon replacement for technical SEO mapping
const Settings = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

export default SeoManager;