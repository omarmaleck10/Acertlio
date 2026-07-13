/**
 * Layout HTML base para todos los emails de Acertlío.
 *
 * Reglas de diseño de emails HTML (distintas a la web):
 *  - Sin CSS externo (Gmail y Outlook lo ignoran)
 *  - Estilos inline en cada elemento
 *  - Sin JavaScript
 *  - Tabla-based layout (mejor compatibilidad histórica)
 *  - Fuentes web-safe (Arial/Helvetica como fallback si Poppins no carga)
 *  - Ancho máximo 600px (estándar en la industria)
 */

interface LayoutParams {
  title: string;
  previewText?: string; // texto que aparece en la vista previa del inbox
  content: string; // HTML del cuerpo principal
  ctaLabel?: string;
  ctaUrl?: string;
  footerNote?: string;
}

const NAVY = "#0B1F4F";
const SAFFRON = "#C5894A";
const INK = "#0A0E1A";
const MUTED = "#6B7280";
const PAPER = "#FAFAF7";
const RULE = "#E7E5E0";

export function emailLayout({
  title,
  previewText = "",
  content,
  ctaLabel,
  ctaUrl,
  footerNote,
}: LayoutParams): string {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0; padding:0; background-color:${PAPER}; font-family: 'Poppins', Arial, Helvetica, sans-serif; color:${INK}; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%;">

  <!-- Preview text (aparece en la vista previa del inbox pero no en el cuerpo) -->
  <div style="display:none; max-height:0; overflow:hidden; font-size:1px; line-height:1px; color:${PAPER}; opacity:0;">
    ${escapeHtml(previewText)}
  </div>

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${PAPER};">
    <tr>
      <td align="center" style="padding: 40px 20px;">

        <!-- Container -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px; background-color:#FFFFFF; border:1px solid ${RULE}; border-radius:8px;">

          <!-- Header: logo -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; border-bottom: 1px solid ${RULE};">
              <span style="font-size: 22px; font-weight: 600; color: ${NAVY}; letter-spacing: -0.01em;">
                Acertl<span style="border-bottom: 3px solid ${SAFFRON}; padding-bottom: 1px;">i</span>o
              </span>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px; font-size: 15px; line-height: 1.6; color: ${INK};">
              ${content}

              ${
                ctaLabel && ctaUrl
                  ? `
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 32px 0;">
                <tr>
                  <td align="center" style="background-color:${NAVY}; border-radius:6px;">
                    <a href="${escapeHtml(ctaUrl)}" style="display:inline-block; padding:14px 28px; color:#FFFFFF; font-size:15px; font-weight:600; text-decoration:none; border-radius:6px;">
                      ${escapeHtml(ctaLabel)}
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size:12px; color:${MUTED}; margin: 16px 0 0 0;">
                Si el botón no funciona, copia y pega este enlace en tu navegador:<br />
                <span style="word-break: break-all; color:${NAVY};">${escapeHtml(ctaUrl)}</span>
              </p>
              `
                  : ""
              }

              ${
                footerNote
                  ? `<p style="font-size:13px; color:${MUTED}; margin-top: 32px; padding-top: 24px; border-top: 1px solid ${RULE};">${footerNote}</p>`
                  : ""
              }
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; border-top: 1px solid ${RULE}; background-color:${PAPER}; border-radius: 0 0 8px 8px;">
              <p style="margin:0; font-size:12px; color:${MUTED}; line-height:1.5;">
                Acertlio · Simulacros Cambridge Computer-Based para academias.<br />
                <a href="https://acertlio.com" style="color:${NAVY}; text-decoration:none;">acertlio.com</a>
              </p>
            </td>
          </tr>

        </table>

        <!-- Legal footer fuera de la card -->
        <p style="max-width:600px; margin: 24px auto 0; font-size:11px; color:${MUTED}; text-align:center; line-height:1.5;">
          Recibes este email porque tienes cuenta en Acertlio o alguien te ha invitado.<br />
          ¿Dudas? Escríbenos a <a href="mailto:hola@acertlio.com" style="color:${MUTED};">hola@acertlio.com</a>
        </p>

      </td>
    </tr>
  </table>

</body>
</html>`;
}

/**
 * Escapa caracteres especiales de HTML para prevenir inyección.
 * Se aplica a todo el texto que venga de datos dinámicos.
 */
export function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Convierte HTML muy simple a texto plano.
 * Útil para el textContent que Brevo también recomienda incluir.
 */
export function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}
