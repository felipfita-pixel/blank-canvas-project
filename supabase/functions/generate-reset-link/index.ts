import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { email, redirectTo } = await req.json();

    if (typeof email !== "string" || email.trim().length < 5 || email.length > 255 || !email.includes("@")) {
      return new Response(JSON.stringify({ error: "E-mail inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const safeRedirect = typeof redirectTo === "string" && redirectTo.startsWith("http") ? redirectTo : undefined;

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Find user by email
    const { data: list, error: listErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
    if (listErr) throw listErr;
    const user = list.users.find((u) => (u.email ?? "").toLowerCase() === cleanEmail);

    // Always respond success-shaped to avoid email enumeration; only return link when user exists AND is admin/broker
    if (!user) {
      return new Response(JSON.stringify({ ok: true, link: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: roles } = await admin.from("user_roles").select("role").eq("user_id", user.id);
    const allowed = (roles ?? []).some((r: { role: string }) => r.role === "admin" || r.role === "broker");

    if (!allowed) {
      return new Response(JSON.stringify({ ok: true, link: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
      type: "recovery",
      email: cleanEmail,
      options: safeRedirect ? { redirectTo: safeRedirect } : undefined,
    });
    if (linkErr) throw linkErr;

    return new Response(
      JSON.stringify({ ok: true, link: linkData.properties?.action_link ?? null }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("generate-reset-link error", err);
    return new Response(JSON.stringify({ error: "Erro ao gerar link" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
