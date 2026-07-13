/**
 * Cliente HTTP de Brevo para enviar emails transaccionales.
 *
 * Usa la API HTTP de Brevo (https://api.brevo.com/v3/smtp/email),
 * NO el SMTP tradicional. Más rápido, más simple, sin gestión de conexiones.
 *
 * Configuración requerida:
 *   - BREVO_API_KEY: la key generada en Brevo (empieza por xkeysib-)
 *   - EMAIL_FROM: remitente por defecto (ej: "Acertlio <hola@acertlio.com>")
 *
 * Ambas variables ya están en Vercel.
 */

interface SendEmailParams {
  to: string;
  toName?: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  replyTo?: string;
}

interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Parsea el EMAIL_FROM en el formato "Nombre <email@dominio.com>".
 * Si no tiene el formato con nombre, usa el email tal cual.
 */
function parseFromAddress(from: string): { email: string; name?: string } {
  const match = from.match(/^(.+?)\s*<(.+?)>$/);
  if (match) {
    return { name: match[1].trim(), email: match[2].trim() };
  }
  return { email: from.trim() };
}

/**
 * Envía un email transaccional a través de Brevo.
 *
 * NO lanza errores — devuelve { success: false, error } si algo falla.
 * Los llamadores deciden si el fallo es crítico o "best effort".
 */
export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  const apiKey = process.env.BREVO_API_KEY;
  const fromRaw = process.env.EMAIL_FROM;

  if (!apiKey || !fromRaw) {
    return {
      success: false,
      error: "BREVO_API_KEY o EMAIL_FROM no configurados en el entorno.",
    };
  }

  const sender = parseFromAddress(fromRaw);

  const payload = {
    sender,
    to: [{ email: params.to, name: params.toName }],
    subject: params.subject,
    htmlContent: params.htmlContent,
    ...(params.textContent && { textContent: params.textContent }),
    ...(params.replyTo && { replyTo: { email: params.replyTo } }),
  };

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      return {
        success: false,
        error: `Brevo respondió ${response.status}: ${errText.slice(0, 200)}`,
      };
    }

    const data = (await response.json()) as { messageId?: string };
    return { success: true, messageId: data.messageId };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error de red al enviar email",
    };
  }
}
