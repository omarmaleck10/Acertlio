import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/brevo";
import { emailLayout } from "@/lib/email/templates/layout";
import { createClient } from "@/lib/supabase/server";

/**
 * Endpoint de prueba para verificar que Brevo está bien configurado.
 *
 * Uso: GET /api/test-email?to=tu@email.com
 *
 * Requiere sesión de super_admin. Devuelve JSON con detalle del envío.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const to = url.searchParams.get("to");

  // Chequeo mínimo del email destino
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return NextResponse.json(
      {
        ok: false,
        step: "validation",
        error: "Falta el parámetro ?to= con un email válido.",
      },
      { status: 400 }
    );
  }

  // Verificar sesión de superadmin
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      {
        ok: false,
        step: "auth",
        error:
          "No hay sesión activa. Inicia sesión primero como superadmin en /login.",
      },
      { status: 401 }
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "super_admin" || !profile.is_active) {
    return NextResponse.json(
      {
        ok: false,
        step: "auth",
        error: `Solo disponible para superadmin. Tu rol actual: ${profile?.role ?? "desconocido"}.`,
      },
      { status: 403 }
    );
  }

  // Info de las variables de entorno (sin exponer valores)
  const envStatus = {
    BREVO_API_KEY: process.env.BREVO_API_KEY
      ? `configurada (empieza por ${process.env.BREVO_API_KEY.slice(0, 8)}...)`
      : "NO configurada",
    EMAIL_FROM: process.env.EMAIL_FROM ?? "NO configurada",
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? "NO configurada",
  };

  const html = emailLayout({
    title: "Prueba de Acertlio",
    previewText: "Email de prueba enviado desde Acertlio.",
    content: `
      <h1 style="font-size: 22px; font-weight: 600; color: #0A0E1A; margin: 0 0 16px 0;">
        Prueba de envío correcta.
      </h1>
      <p style="margin: 0 0 12px 0;">
        Si estás leyendo este email, todo funciona: Brevo, SPF, DKIM y la API key.
      </p>
      <p style="margin: 0; font-size: 13px; color: #6B7280;">
        Fecha: ${new Date().toLocaleString("es-ES")}
      </p>
    `,
  });

  const result = await sendEmail({
    to,
    subject: "Prueba de Acertlio",
    htmlContent: html,
    textContent: "Prueba de envío. Si lees esto, Brevo funciona.",
  });

  if (!result.success) {
    return NextResponse.json(
      {
        ok: false,
        step: "brevo",
        error: result.error,
        env: envStatus,
        sentTo: to,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    messageId: result.messageId,
    sentTo: to,
    env: envStatus,
  });
}
