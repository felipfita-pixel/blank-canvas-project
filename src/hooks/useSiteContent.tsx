import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SiteSection {
  id?: string;
  section_key: string;
  title: string;
  subtitle: string;
  content: Record<string, any>;
}

const defaults: Record<string, SiteSection> = {
  hero: {
    section_key: "hero",
    title: "Construindo o Futuro com Solidez",
    subtitle: "Encontre os melhores imóveis em bairros nobres do Rio de Janeiro. Leblon, Ipanema, Barra da Tijuca, Copacabana e muito mais.",
    content: {
      badge_text: "Mais de 200 corretores ao seu dispor",
      title_highlight: "com Solidez",
      hero_image: "",
      stats: [
        { value: "94 077+", label: "VISITAS AO SITE" },
        { value: "10+", label: "ANOS DE EXPERIÊNCIA" },
        { value: "35 mil+", label: "VENDAS REALIZADAS" },
        { value: "200+", label: "IMÓVEIS EXCLUSIVOS" },
      ],
    },
  },
  about: {
    section_key: "about",
    title: "Quem Somos",
    subtitle: "Especialistas em conectar famílias ao lar ideal.",
    content: {
      campaign_title: "Escolha sua Campanha",
      campaign_subtitle: "Selecione o bairro de seu interesse para iniciar o atendimento personalizado.",
      neighborhoods: [
        { name: "LEBLON", image: "" },
        { name: "NOVO BAIRRO", image: "" },
        { name: "BARRA DA TIJUCA", image: "" },
        { name: "NOVO BAIRRO", image: "" },
        { name: "NOVO BAIRRO", image: "" },
        { name: "NOVO BAIRRO", image: "" },
      ],
    },
  },
  lifestyle: {
    section_key: "lifestyle",
    title: "Um novo estilo de vida em alto padrão",
    subtitle: "",
    content: { image: "" },
  },
  neighborhoods_guide: {
    section_key: "neighborhoods_guide",
    title: "Guia de Bairros",
    subtitle: "Conheça os melhores bairros do Rio de Janeiro e encontre o lugar ideal para você.",
    content: {
      items: [
        { name: "Leblon", desc: "O bairro mais nobre da Zona Sul", image: "" },
        { name: "Botafogo", desc: "Vista para o Pão de Açúcar", image: "" },
        { name: "Barra da Tijuca", desc: "Modernidade à beira-mar", image: "" },
      ],
    },
  },
  testimonials: {
    section_key: "testimonials",
    title: "O que dizem nossos clientes",
    subtitle: "",
    content: {
      items: [
        { name: "Carlos Mendes", text: "Excelente atendimento! Encontramos o apartamento dos sonhos no Leblon com a ajuda da equipe.", rating: 5 },
        { name: "Ana Paula Costa", text: "Compramos nosso primeiro imóvel com a Corretores Associados. Todo o processo foi conduzido com muita transparência.", rating: 5 },
        { name: "Roberto Silva", text: "Já indiquei para vários amigos. A equipe conhece profundamente o mercado imobiliário do Rio.", rating: 5 },
      ],
    },
  },
  services: {
    section_key: "services",
    title: "Nossos Serviços",
    subtitle: "",
    content: {
      items: [
        { icon: "Home", title: "Imóveis de Luxo", desc: "Selecionamos os melhores imóveis de alto padrão nos bairros mais nobres do Rio de Janeiro." },
        { icon: "FileText", title: "Pronto Atendimento", desc: "Atendimento personalizado para compra, venda e locação com suporte completo." },
        { icon: "Search", title: "Busca Sob Medida", desc: "Encontre o imóvel perfeito com nossa tecnologia de busca avançada." },
      ],
    },
  },
  where_we_operate: {
    section_key: "where_we_operate",
    title: "Onde Atuamos",
    subtitle: "",
    content: {
      description: "Atuamos nos principais bairros do Rio de Janeiro, oferecendo os melhores imóveis de alto padrão para compra, venda e locação.",
      locations: "Leblon, Ipanema, Copacabana, Barra da Tijuca, Botafogo",
      phone: "(21) 99999-9999",
      email: "contato@corretoresassociados.com.br",
      partners: ["PATRIMÓVEL", "SOMA IMOBILIÁRIO", "PATRÍMAR"],
    },
  },
  contact: {
    section_key: "contact",
    title: "Vamos Conversar?",
    subtitle: "Nossa equipe está pronta para encontrar o imóvel perfeito para você.",
    content: {
      phone: "(21) 97531-6631",
      email: "contato@ffimobiliaria.com.br",
      instagram: "",
      facebook: "",
    },
  },
  videos: {
    section_key: "videos",
    title: "Nossos Vídeos",
    subtitle: "Confira nossos vídeos e conheça melhor nossos empreendimentos.",
    content: {
      items: [
        { title: "Apresentação FF Imobiliária", url: "https://www.youtube.com/watch?v=UqSV7m8v0jQ" },
      ],
    },
  },
  cta_banner: {
    section_key: "cta_banner",
    title: "Quer lançar sua campanha e fazer parte do nosso time?",
    subtitle: "Trabalhe com os melhores imóveis da Barra e Zona Sul em um modelo de parceria exclusiva.",
    content: {},
  },
  footer: {
    section_key: "footer",
    title: "CORRETORES ASSOCIADOS",
    subtitle: "Consultoria Imobiliária FF",
    content: {
      description: "Especialistas no mercado imobiliário de alto padrão no Rio de Janeiro. Comprometidos com a excelência e a satisfação total de nossos clientes.",
      address: "Barra da Tijuca, Rio de Janeiro - RJ",
      phone: "(21) 97531-6631",
      email: "contato@ffimobiliaria.com.br",
      instagram: "",
      facebook: "",
    },
  },
};

export const useSiteContent = () => {
  const [sections, setSections] = useState<Record<string, SiteSection>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("site_content").select("*");
      const map: Record<string, SiteSection> = {};

      // Start with defaults
      for (const key of Object.keys(defaults)) {
        map[key] = { ...defaults[key] };
      }

      // Override with DB data
      if (data) {
        for (const row of data) {
          const def = defaults[row.section_key];
          map[row.section_key] = {
            id: row.id,
            section_key: row.section_key,
            title: row.title ?? def?.title ?? "",
            subtitle: row.subtitle ?? def?.subtitle ?? "",
            content: { ...(def?.content ?? {}), ...((row.content as Record<string, any>) ?? {}) },
          };
        }
      }

      setSections(map);
      setLoading(false);
    };
    load();
  }, []);

  const get = (key: string): SiteSection => {
    return sections[key] ?? defaults[key] ?? { section_key: key, title: "", subtitle: "", content: {} };
  };

  return { sections, loading, get };
};

export { defaults as siteContentDefaults };
