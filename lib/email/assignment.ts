import { sendEmail } from "./brevo";

interface SendAssignmentEmailParams {
  studentEmail: string;
  studentName: string;
  teacherName: string | null;
  academyName: string;
  examTitle: string;
  examLevel: string;
  dueDate: string | null;
  assignmentUrl: string; // https://acertlio.com/alumno
}

function formatDueDate(iso: string | null): string | null {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}


/**
 * Email al alumno cuando su profesor le asigna un nuevo mock.
 * Usa la identidad visual de Acertlio (ink, navy, saffron).
 */
export async function sendAssignmentEmail(params: SendAssignmentEmailParams) {
  const {
    studentEmail,
    studentName,
    teacherName,
    academyName,
    examTitle,
    examLevel,
    dueDate,
    assignmentUrl,
  } = params;

  const dueDateFmt = formatDueDate(dueDate);
  const subject = teacherName
    ? `${teacherName} te ha asignado un nuevo simulacro`
    : `Nuevo simulacro asignado en ${academyName}`;

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
                Nuevo simulacro asignado
              </p>
              <h1 style="margin:0 0 20px 0;font-size:24px;color:#0A0E1A;font-weight:600;line-height:1.3;">
                Hola ${studentName},
              </h1>

              <p style="margin:0 0 20px 0;font-size:15px;color:#0A0E1A;line-height:1.6;">
                ${
                  teacherName
                    ? `<strong>${teacherName}</strong> te ha asignado un nuevo simulacro para practicar.`
                    : `Se te ha asignado un nuevo simulacro para practicar.`
                }
              </p>

              <!-- Card del examen -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAF7;border:1px solid #E7E5E0;border-radius:6px;margin:24px 0;">
                <tr>
                  <td style="padding:20px;">
                    <p style="margin:0 0 4px 0;font-size:11px;color:#0B1F4F;text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">
                      ${examLevel}
                    </p>
                    <p style="margin:0 0 12px 0;font-size:18px;color:#0A0E1A;font-weight:600;">
                      ${examTitle}
                    </p>
                    ${
                      dueDateFmt
                        ? `<p style="margin:0;padding:8px 12px;background:#C5894A15;border-radius:4px;font-size:13px;color:#0A0E1A;">
                             <strong>Fecha límite:</strong> ${dueDateFmt}
                           </p>`
                        : `<p style="margin:0;font-size:13px;color:#6B7280;">
                             Sin fecha límite — puedes hacerlo cuando quieras.
                           </p>`
                    }
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 12px 0;">
                <tr>
                  <td style="background:#0B1F4F;border-radius:4px;">
                    <a href="${assignmentUrl}" style="display:inline-block;padding:12px 24px;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;">
                      Empezar el simulacro →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 0 0;font-size:13px;color:#6B7280;line-height:1.6;">
                Puedes empezar el simulacro cuando quieras${dueDateFmt ? " antes de la fecha límite" : ""}.
                Recuerda que puedes pausarlo y continuarlo más tarde.
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
    ? `${teacherName} te ha asignado un nuevo simulacro para practicar.`
    : `Se te ha asignado un nuevo simulacro para practicar.`
}

${examLevel} — ${examTitle}
${dueDateFmt ? `Fecha límite: ${dueDateFmt}` : "Sin fecha límite."}

Empezar: ${assignmentUrl}

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
