import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/brevo";
import { emailLayout } from "@/lib/email/templates/layout";
import { getCurrentUser } from "@/lib/supabase/user";

/**
 * Endpoint de prueba para verificar que Brevo está bien configurado.
 *
 * Uso: GET /api/test-email?to=tu@email.com
 *
 * Protecciones:
 *  - Solo super_admin puede usarlo (para no dejar un endpoint de spam abierto)
 *  - Requiere el parámetro `to` con un email válido
 *
 * Devuelve JSON con { ok: true, messageId } si va bien,
 * o { ok: false, error } si algo falla.
 */
export async function GET(request: Request) {
  // Solo el superadmin puede disparar emails de prueba
  const user = await getCurrentUser();
  if (!user || user.profile.role !== "super_admin") {
    return NextResponse.json(
      { ok: false, error: "Solo disponible para superadmin." },
      { status: 403 }
    );
  }

  const url = new URL(request.url);
  const to = url.searchParams.get("to");

  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return NextResponse.json(
      { ok: false, error: "Falta el parámetro ?to= con un email válido." },
      { status: 400 }
    );
  }

  const html = emailLayout({
    title: "Prueba de Acertlio",
    previewText: "Este es un email de prueba enviado desde Acertlio.",
    content: `
      <h1 style="font-size: 22px; font-weight: 600; color: #0A0E1A; margin: 0 0 16px 0;">
        Prueba de envío correcta.
      </h1>
      <p style="margin: 0 0 12px 0;">
        Si estás leyendo este email, significa que:
      </p>
      <ul style="margin: 0 0 16px 0; padding-left: 20px;">
        <li>El dominio <strong>acertlio.com</strong> está autenticado en Brevo</li>
        <li>Los registros SPF y DKIM están validando bien</li>
        <li>La API key de Brevo funciona desde Vercel</li>
        <li>Los emails salen desde <strong>hola@acertlio.com</strong></li>
      </ul>
      <p style="margin: 0; font-size: 13px; color: #6B7280;">
        Fecha de envío: ${new Date().toLocaleString("es-ES")}
      </p>
    `,
  });

  const result = await sendEmail({
    to,
    subject: "Prueba de Acertlio",
    htmlContent: html,
    textContent:
      "Prueba de envío correcta. Si estás leyendo este email, significa que Brevo, SPF, DKIM y la API key funcionan.",
  });

  if (!result.success) {
    return NextResponse.json(
      { ok: false, error: result.error },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    messageId: result.messageId,
    sentTo: to,
  });
}
