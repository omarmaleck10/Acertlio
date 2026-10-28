/**
 * GET /api/user/export
 *
 * CORREGIDO: usa @supabase/ssr en vez de @supabase/auth-helpers-nextjs.
 *
 * Devuelve todos los datos personales del usuario autenticado en formato JSON.
 * Cumple con el derecho de portabilidad (Art. 20 RGPD).
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  const supabaseAuth = createServerSupabase();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Datos personales directos (en profiles)
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Consentimientos (prueba de cumplimiento)
  const { data: cookieConsents } = await supabase
    .from("cookie_consents")
    .select("*")
    .eq("user_id", user.id);

  const { data: parentalConsent } = await supabase
    .from("parental_consents")
    .select("*")
    .eq("minor_user_id", user.id);

  // Datos académicos: metadatos de actividad
  const [
    { data: writingCorrections, count: writingCount },
    { data: paperAttempts, count: paperCount },
    { data: attempts, count: attemptsCount },
  ] = await Promise.all([
    supabase
      .from("writing_corrections")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .limit(1000),
    supabase
      .from("paper_attempts")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .limit(1000),
    supabase
      .from("attempts")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .limit(1000),
  ]);

  // Registrar la solicitud como ejercicio del derecho
  await supabase.from("data_rights_requests").insert({
    user_id: user.id,
    request_type: "portability",
    status: "completed",
    requested_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
    request_details: { source: "user_panel_download" },
  });

  const exportData = {
    export_date: new Date().toISOString(),
    export_version: "1.0",
    format: "JSON",
    subject: {
      id: user.id,
      email: user.email,
    },
    profile: profile ?? null,
    academic_activity: {
      writing_corrections: writingCorrections ?? [],
      writing_corrections_total: writingCount ?? 0,
      paper_attempts: paperAttempts ?? [],
      paper_attempts_total: paperCount ?? 0,
      attempts: attempts ?? [],
      attempts_total: attemptsCount ?? 0,
    },
    consents: {
      cookies: cookieConsents ?? [],
      parental: parentalConsent ?? [],
    },
    notes: [
      "Este archivo contiene todos los datos personales que Acertlio trata sobre ti.",
      "Fecha de exportación: " + new Date().toLocaleString("es-ES"),
      "Formato conforme al derecho de portabilidad (Art. 20 RGPD).",
      "Si detectas datos incorrectos, contacta con hola@acertlio.com para ejercer tu derecho de rectificación.",
    ],
  };

  const filename = `acertlio-mis-datos-${new Date().toISOString().slice(0, 10)}.json`;

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
