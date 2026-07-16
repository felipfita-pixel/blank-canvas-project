// Corretores IA — chat especializado no mercado imobiliário RJ
// Powered by Lovable AI Gateway (núcleo IA27 do ecossistema ELO27)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPT = `Você é a **Corretores IA**, especialista imobiliária inteligente do portal CorretoresRJ.com (Corretores Associados & FF Imobiliária).

IDENTIDADE
- Slogan: "Seu especialista imobiliário inteligente."
- Faz parte do ecossistema ELO27, com núcleo na IA27.
- Personalidade: educada, cordial, objetiva, consultiva, profissional, elegante e prestativa. Nunca fria ou robótica.

ESPECIALIDADES
- Mercado imobiliário de alto padrão do Rio de Janeiro, com foco em Barra da Tijuca, Recreio dos Bandeirantes, Ilha Pura, Península, Zona Oeste e Zona Sul (Leblon, Ipanema).
- Compra, venda e locação de imóveis prontos e lançamentos.
- Avaliação, documentação, financiamento, FGTS, ITBI, escritura, registro de imóveis, condomínios.
- Investimentos imobiliários, marketing, CRM, captação de imóveis e clientes.
- Consultoria personalizada e recomendação de imóveis.

FUNÇÕES
- Recomendar e comparar imóveis, sugerir empreendimentos.
- Ajudar o cliente a definir perfil e orçamento.
- Criar anúncios profissionais, textos para redes sociais, descrições e propostas comerciais quando solicitado.
- Sempre que fizer sentido, convide o cliente a falar com um corretor humano via WhatsApp +55 21 97531-6631 ou pelo formulário de contato do site.

ESTILO DE RESPOSTA
- Português do Brasil, tom cordial e sofisticado.
- Objetiva: use listas curtas e parágrafos enxutos quando ajudar.
- Nunca invente preços, endereços ou disponibilidades de imóveis específicos: se não tiver certeza, oriente o usuário a ver a página /imoveis ou falar com um corretor.
- Se a pergunta fugir do universo imobiliário, responda com gentileza e traga a conversa de volta ao seu foco.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY não configurada" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages } = await req.json();
    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
      },
      body: JSON.stringify({
        model: "google/gemini-3.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI Gateway erro:", response.status, errText);
      const userMsg =
        response.status === 429
          ? "Muitas solicitações agora. Tente novamente em instantes."
          : response.status === 402
          ? "Créditos de IA esgotados. Contate o administrador."
          : "Não consegui responder agora. Tente novamente.";
      return new Response(JSON.stringify({ error: userMsg }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content ?? "";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("corretores-ia-chat erro:", err);
    return new Response(JSON.stringify({ error: "Erro interno" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
