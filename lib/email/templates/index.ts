import { emailLayout, stripHtml, escapeHtml } from "./layout";
import { siteConfig } from "@/lib/site-config";

// ─── Email de bienvenida a una academia recién registrada ────────────

export function welcomeAcademyEmail(params: {
  academyName: string;
  adminName: string;
  planName: string;
  totalSeats: number;
}) {
  const content = `
    <h1 style="font-size: 24px; font-weight: 600; color: #0A0E1A; margin: 0 0 16px 0; line-height: 1.3;">
      Bienvenidos a Acertlio, ${escapeHtml(params.academyName)}.
    </h1>

    <p style="margin: 0 0 16px 0;">Hola ${escapeHtml(params.adminName)},</p>

    <p style="margin: 0 0 16px 0;">
      Vuestra cuenta de Acertlio ya está activa. Habéis contratado el plan
      <strong style="color:#0B1F4F;">${escapeHtml(params.planName)}</strong> con
      <strong>${params.totalSeats} plazas concurrentes</strong>, listas para asignar a vuestros alumnos.
    </p>

    <p style="margin: 0 0 16px 0;">Ya podéis empezar a:</p>

    <ul style="margin: 0 0 24px 0; padding-left: 20px;">
      <li style="margin-bottom: 8px;">Invitar a vuestros profesores desde el panel de academia.</li>
      <li style="margin-bottom: 8px;">Dar de alta alumnos y asignarles su plaza.</li>
      <li style="margin-bottom: 8px;">Explorar el catálogo de simulacros B1, B2 y C1.</li>
    </ul>

    <p style="margin: 0 0 8px 0;">
      Cuando entréis por primera vez os recomendamos completar los datos fiscales de la academia
      en <em>Configuración</em>. Es lo único que necesitamos para emitir vuestras facturas cuando toque.
    </p>
  `;

  return {
    subject: `Bienvenidos a Acertlio, ${params.academyName}`,
    htmlContent: emailLayout({
      title: "Bienvenidos a Acertlio",
      previewText: `Vuestra cuenta con el plan ${params.planName} está activa. ${params.totalSeats} plazas listas.`,
      content,
      ctaLabel: "Entrar al panel",
      ctaUrl: `${siteConfig.url}/academia`,
      footerNote:
        "Este es un email automático de bienvenida. Si necesitas algo, responde a este correo o escribe a hola@acertlio.com.",
    }),
    textContent: stripHtml(content) + `\n\nEntra: ${siteConfig.url}/academia`,
  };
}

// ─── Email de invitación a un profesor ───────────────────────────────

export function inviteTeacherEmail(params: {
  academyName: string;
  inviterName: string;
  activationUrl: string;
}) {
  const content = `
    <h1 style="font-size: 24px; font-weight: 600; color: #0A0E1A; margin: 0 0 16px 0; line-height: 1.3;">
      ${escapeHtml(params.inviterName)} te invita a Acertlio.
    </h1>

    <p style="margin: 0 0 16px 0;">Hola,</p>

    <p style="margin: 0 0 16px 0;">
      <strong>${escapeHtml(params.academyName)}</strong> te ha invitado a unirte a Acertlio como profesor.
      Acertlio es la plataforma de simulacros Cambridge Computer-Based que usa tu academia
      para preparar a los alumnos con la misma interfaz, tiempos y reglas del examen real.
    </p>

    <p style="margin: 0 0 16px 0;">
      Como profesor podrás:
    </p>

    <ul style="margin: 0 0 24px 0; padding-left: 20px;">
      <li style="margin-bottom: 8px;">Ver los alumnos que la academia te asigne.</li>
      <li style="margin-bottom: 8px;">Asignar simulacros a alumnos individuales o a grupos enteros.</li>
      <li style="margin-bottom: 8px;">Corregir los Writings con la rúbrica Cambridge oficial.</li>
      <li style="margin-bottom: 8px;">Ver estadísticas de rendimiento de tus grupos.</li>
    </ul>

    <p style="margin: 0 0 16px 0;">
      Para aceptar la invitación y crear tu contraseña, pulsa el botón de abajo.
    </p>
  `;

  return {
    subject: `${params.inviterName} te invita a Acertlio como profesor`,
    htmlContent: emailLayout({
      title: "Invitación a Acertlio",
      previewText: `${params.academyName} te ha invitado a unirte como profesor.`,
      content,
      ctaLabel: "Aceptar invitación y crear contraseña",
      ctaUrl: params.activationUrl,
      footerNote:
        "Esta invitación caduca en 7 días. Si no la esperabas, ignora este email — no se creará ninguna cuenta a tu nombre.",
    }),
    textContent:
      stripHtml(content) +
      `\n\nAcepta la invitación: ${params.activationUrl}\n\nCaduca en 7 días.`,
  };
}

// ─── Email de invitación a un alumno ─────────────────────────────────

export function inviteStudentEmail(params: {
  academyName: string;
  inviterName: string;
  activationUrl: string;
  level?: string;
}) {
  const content = `
    <h1 style="font-size: 24px; font-weight: 600; color: #0A0E1A; margin: 0 0 16px 0; line-height: 1.3;">
      Tu academia te ha dado de alta en Acertlio.
    </h1>

    <p style="margin: 0 0 16px 0;">Hola,</p>

    <p style="margin: 0 0 16px 0;">
      <strong>${escapeHtml(params.academyName)}</strong> te ha añadido a Acertlio${
    params.level ? `, con nivel de preparación <strong>${escapeHtml(params.level)}</strong>` : ""
  }.
      Es la plataforma donde vas a hacer tus simulacros de Cambridge de aquí al día del examen.
    </p>

    <p style="margin: 0 0 16px 0;">
      Verás la misma interfaz que el ordenador del examen real — mismos botones, mismos
      tiempos, misma forma de moverte entre preguntas. La idea es que cuando llegue el día D,
      no haya sorpresas.
    </p>

    <p style="margin: 0 0 16px 0;">
      Para empezar, crea tu contraseña con el botón de abajo. Tu profesor te irá asignando
      los mocks conforme avancéis.
    </p>
  `;

  return {
    subject: `${params.academyName} te ha dado de alta en Acertlio`,
    htmlContent: emailLayout({
      title: "Bienvenido a Acertlio",
      previewText: `Crea tu contraseña y empieza a preparar Cambridge con la misma interfaz del examen real.`,
      content,
      ctaLabel: "Crear mi contraseña",
      ctaUrl: params.activationUrl,
      footerNote:
        "Esta invitación caduca en 7 días. Si crees que te ha llegado por error, ignora este email.",
    }),
    textContent:
      stripHtml(content) +
      `\n\nCrea tu contraseña: ${params.activationUrl}\n\nCaduca en 7 días.`,
  };
}
