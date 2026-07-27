import { sendEmail } from "./brevo";

interface SendWritingCorrectionEmailParams {
  studentEmail: string;
  studentName: string;
  teacherName: string | null;
  academyName: string;
  examTitle: string;
  examLevel: string;
  paperName: string; // "Reading & Writing" o "Writing"
  totalScore: number; // 0-20 (suma de 4 rúbricas × 5)
  maxScore: number; // típicamente 20
  hasFeedback: boolean;
  resultUrl: string; // link directo al resultado del paper
}


/**
 * Email al alumno cuando el profesor ha corregido su Writing.
 *
 * Diseño:
 *   · Header branded Acertlio
 *   · "Tu profesor ha corregido tu Writing" (badge saffron)
 *   · Card con nombre del examen + nota grande + comentario indicador
 *   · CTA principal "Ver mi corrección" (navy)
 */
export async function sendWritingCorrectionEmail(
  params: SendWritingCorrectionEmailParams
) {
  const {
    studentEmail,
    studentName,
    teacherName,
    academyName,
    examTitle,
    examLevel,
    paperName,
    totalScore,
    maxScore,
    hasFeedback,
    resultUrl,
  } = params;

  const scorePercent = Math.round((totalScore / maxScore) * 100);
  const scoreColor =
    scorePercent >= 60 ? "#2E7D57" : scorePercent >= 40 ? "#C5894A" : "#B84C3C";

  const subject = teacherName
    ? `${teacherName} ha corregido tu Writing`
    : `Tu Writing ha sido corregido`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#FAFAF7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAF7;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:8px;border:1px solid #E7E5E0;">

          <!-- Header -->
          <tr>
            <td style="padding:32px 32px 24px 32px;border-bottom:1px solid #E7E5E0;">
              <p style="margin:0;font-size:20px;font-weight:600;color:#0A0E1A;letter-spacing:-0.02em;">
                Acertl<span style="color:#C5894A;">i</span>o
              </p>
              <p style="margin:4px 0 0 0;font-size:12px;color:#6B7280;text-transform:uppercase;letter-spacing:0.08em;">
                ${academyName}
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 8px 0;font-size:12px;color:#C5894A;text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">
                Corrección disponible
              </p>
              <h1 style="margin:0 0 20px 0;font-size:24px;color:#0A0E1A;font-weight:600;line-height:1.3;">
                Hola ${studentName},
              </h1>

              <p style="margin:0 0 20px 0;font-size:15px;color:#0A0E1A;line-height:1.6;">
                ${
                  teacherName
                    ? `<strong>${teacherName}</strong> ha corregido tu Writing.`
                    : `Ya tienes tu Writing corregido.`
                }
                ${
                  hasFeedback
                    ? "Ha dejado también un comentario personalizado para ayudarte a mejorar."
                    : "Puedes ver tu nota y revisar tu respuesta desde tu panel."
                }
              </p>

              <!-- Card con nota -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAF7;border:1px solid #E7E5E0;border-radius:6px;margin:24px 0;">
                <tr>
                  <td style="padding:20px;">
                    <p style="margin:0 0 4px 0;font-size:11px;color:#0B1F4F;text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">
                      ${examLevel} · ${paperName}
                    </p>
                    <p style="margin:0 0 16px 0;font-size:16px;color:#0A0E1A;font-weight:600;">
                      ${examTitle}
                    </p>

                    <div style="border-top:1px solid #E7E5E0;padding-top:16px;">
                      <p style="margin:0 0 4px 0;font-size:11px;color:#6B7280;text-transform:uppercase;letter-spacing:0.08em;">
                        Tu nota
                      </p>
                      <p style="margin:0;font-size:32px;font-weight:700;color:${scoreColor};line-height:1;">
                        ${totalScore}<span style="font-size:18px;color:#6B7280;font-weight:400;"> / ${maxScore}</span>
                      </p>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 12px 0;">
                <tr>
                  <td style="background:#0B1F4F;border-radius:4px;">
                    <a href="${resultUrl}" style="display:inline-block;padding:12px 24px;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;">
                      Ver mi corrección →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 0 0;font-size:13px;color:#6B7280;line-height:1.6;">
                Verás el desglose por rúbricas Cambridge (contenido, comunicación,
                organización y lenguaje) más el comentario del profesor.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #E7E5E0;background:#FAFAF7;border-radius:0 0 8px 8px;">
              <p style="margin:0;font-size:11px;color:#9CA3AF;text-align:center;">
                Este email es una notificación automática de Acertlio. No respondas a esta dirección.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const textContent = `
Hola ${studentName},

${
  teacherName
    ? `${teacherName} ha corregido tu Writing.`
    : `Ya tienes tu Writing corregido.`
}

${examLevel} — ${examTitle}
Paper: ${paperName}
Tu nota: ${totalScore} / ${maxScore}

Ver tu corrección: ${resultUrl}

—
Acertlio · ${academyName}
`;

  return sendEmail({
    to: studentEmail,
    toName: studentName,
    subject,
    htmlContent,
    textContent,
  });
}
