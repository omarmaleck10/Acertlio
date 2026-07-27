"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe/client";
import { sendEmail } from "@/lib/email/brevo";
import { siteConfig } from "@/lib/site-config";

interface ActivateInput {
  registrationId: string;
  sessionId: string;
}

interface ActivateResult {
  error?: string;
  ok?: boolean;
}


/**
 * Activa un registro individual tras confirmarse el pago en Stripe.
 *
 * Idempotente: si ya fue activado (status='completed' o hay profile_id),
 * no vuelve a crear nada. Simplemente retorna OK.
 *
 * Flujo:
 *   1. Verifica session en Stripe → debe estar 'paid' o con 'active' subscription
 *   2. Crea auth.users con email pre-confirmado (admin.createUser)
 *   3. Crea profile con is_individual=true, level=target_level
 *   4. Crea/actualiza subscription
 *   5. Genera magic link y lo envía al email
 *   6. Marca registration como 'completed' con profile_id
 */
export async function activateIndividualRegistrationAction(
  input: ActivateInput
): Promise<ActivateResult> {
  const admin = createAdminClient();

  // 1. Verificar registration
  const { data: reg } = await admin
    .from("individual_registrations")
    .select("*")
    .eq("id", input.registrationId)
    .maybeSingle();

  if (!reg) return { error: "Registro no encontrado." };

  // Idempotente: si ya está completada, retornar OK
  if (reg.status === "completed" && reg.profile_id) {
    return { ok: true };
  }

  // 2. Verificar session en Stripe
  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(input.sessionId, {
      expand: ["subscription", "customer"],
    });
  } catch (e) {
    return {
      error: `No se pudo verificar el pago en Stripe: ${
        e instanceof Error ? e.message : "error"
      }`,
    };
  }

  if (session.payment_status !== "paid" && session.status !== "complete") {
    return { error: "El pago aún no está confirmado en Stripe." };
  }

  // 3. Crear auth user (con contraseña del formulario)
  let userId: string;
  const existingUser = await admin.auth.admin.listUsers();
  const foundUser = existingUser.data.users.find(
    (u) => u.email?.toLowerCase() === reg.email.toLowerCase()
  );

  if (foundUser) {
    userId = foundUser.id;
    // Si el usuario ya existe (raro pero posible), actualizamos su
    // contraseña por la del formulario. Así el alumno puede entrar
    // con las credenciales que eligió.
    if (reg.pending_password) {
      await admin.auth.admin.updateUserById(userId, {
        password: reg.pending_password,
        email_confirm: true,
      });
    }
  } else {
    const password = reg.pending_password;
    if (!password) {
      return {
        error:
          "No se guardó la contraseña durante el registro. Contacta con soporte.",
      };
    }

    const { data: created, error: createErr } =
      await admin.auth.admin.createUser({
        email: reg.email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: reg.full_name,
          is_individual: true,
        },
      });

    if (createErr || !created?.user) {
      return {
        error: `No se pudo crear el usuario: ${createErr?.message ?? "error"}`,
      };
    }
    userId = created.user.id;
  }

  // 4. Crear/actualizar profile
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 7);

  // Ver si ya existe profile
  const { data: existingProfile } = await admin
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (existingProfile) {
    // Update
    await admin
      .from("profiles")
      .update({
        full_name: reg.full_name,
        email: reg.email,
        role: "student",
        is_individual: true,
        current_level: reg.target_level,
        referral_source:
          reg.referral_source === "other"
            ? `other: ${reg.referral_other ?? ""}`.slice(0, 200)
            : reg.referral_source,
        stripe_customer_id: reg.stripe_customer_id,
        trial_ends_at: trialEndsAt.toISOString(),
        trial_mocks_used: 0,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);
  } else {
    // Insert
    const { error: profileErr } = await admin.from("profiles").insert({
      id: userId,
      full_name: reg.full_name,
      email: reg.email,
      role: "student",
      is_individual: true,
      current_level: reg.target_level,
      referral_source:
        reg.referral_source === "other"
          ? `other: ${reg.referral_other ?? ""}`.slice(0, 200)
          : reg.referral_source,
      stripe_customer_id: reg.stripe_customer_id,
      trial_ends_at: trialEndsAt.toISOString(),
      trial_mocks_used: 0,
    });

    if (profileErr) {
      return { error: `No se pudo crear el profile: ${profileErr.message}` };
    }
  }

  // 5. Guardar subscription
  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;

  if (subscriptionId) {
    const { error: subError } = await admin.from("subscriptions").upsert(
      {
        stripe_subscription_id: subscriptionId,
        stripe_customer_id: reg.stripe_customer_id ?? "",
        student_id: userId,
        plan_type: "individual",
        plan: "individual", // requerido NOT NULL (enum academy_plan)
        billing_interval: reg.billing_interval,
        target_level: reg.target_level,
        status: "trialing",
        current_period_end: trialEndsAt.toISOString(),
        trial_ends_at: trialEndsAt.toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "stripe_subscription_id" }
    );

    if (subError) {
      // No bloqueamos el resto del flujo — el profile ya existe, solo
      // no hemos podido reflejar la subscription en BD. Se puede
      // reparar manualmente después.
      console.error(
        "Individual subscription upsert failed:",
        subError.message
      );
    }
  }

  // 6. Enviar email de bienvenida con link al login
  await sendEmail({
    to: reg.email,
    toName: reg.full_name,
    subject: "¡Bienvenido a Acertlio!",
    htmlContent: buildWelcomeHtml({
      fullName: reg.full_name,
      level: reg.target_level,
      email: reg.email,
      loginUrl: `${siteConfig.url}/login`,
    }),
    textContent: `Hola ${reg.full_name},\n\n¡Bienvenido a Acertlio! Ya puedes acceder a tu cuenta con las credenciales que elegiste durante el registro:\n\nEmail: ${reg.email}\nContraseña: la que tú elegiste\n\nAccede aquí: ${siteConfig.url}/login\n\nHas contratado el plan Individual ${reg.target_level}. Empiezas con 7 días de prueba y hasta 3 simulacros gratis.\n\n— El equipo de Acertlio`,
  });

  // 7. Marcar registration como completada y BORRAR la contraseña temporal
  await admin
    .from("individual_registrations")
    .update({
      status: "completed",
      profile_id: userId,
      stripe_subscription_id: subscriptionId ?? null,
      pending_password: null, // limpieza de seguridad
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", reg.id);

  return { ok: true };
}


function buildWelcomeHtml(params: {
  fullName: string;
  level: string;
  email: string;
  loginUrl: string;
}): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>Bienvenido a Acertlio</title></head>
<body style="margin:0;padding:0;background:#FAFAF7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAF7;padding:40px 20px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:8px;border:1px solid #E7E5E0;">
        <tr><td style="padding:32px 32px 24px 32px;border-bottom:1px solid #E7E5E0;">
          <p style="margin:0;font-size:20px;font-weight:600;color:#0A0E1A;letter-spacing:-0.02em;">
            Acertl<span style="color:#C5894A;">i</span>o
          </p>
        </td></tr>
        <tr><td style="padding:32px;">
          <p style="margin:0 0 8px 0;font-size:12px;color:#C5894A;text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">
            Tu cuenta está lista
          </p>
          <h1 style="margin:0 0 20px 0;font-size:24px;color:#0A0E1A;font-weight:600;line-height:1.3;">
            ¡Bienvenido, ${params.fullName}!
          </h1>
          <p style="margin:0 0 20px 0;font-size:15px;color:#0A0E1A;line-height:1.6;">
            Ya puedes acceder a los simulacros del nivel <strong>${params.level}</strong> con las credenciales que elegiste durante el registro.
          </p>

          <div style="background:#FAFAF7;border:1px solid #E7E5E0;border-radius:6px;padding:16px;margin:20px 0;">
            <p style="margin:0;font-size:13px;color:#6B7280;">
              <strong style="color:#0A0E1A;">Email:</strong> ${params.email}<br>
              <strong style="color:#0A0E1A;">Contraseña:</strong> la que tú elegiste
            </p>
          </div>

          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0;">
            <tr><td style="background:#0B1F4F;border-radius:4px;">
              <a href="${params.loginUrl}" style="display:inline-block;padding:14px 28px;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;">
                Iniciar sesión →
              </a>
            </td></tr>
          </table>

          <p style="margin:0;font-size:13px;color:#6B7280;line-height:1.6;">
            Si olvidas tu contraseña, podrás recuperarla desde la pantalla de login.
          </p>
          <hr style="border:none;border-top:1px solid #E7E5E0;margin:24px 0;">
          <p style="margin:0 0 8px 0;font-size:13px;color:#0A0E1A;font-weight:600;">
            Tu plan de prueba:
          </p>
          <ul style="margin:0;padding-left:20px;font-size:13px;color:#0A0E1A;line-height:1.7;">
            <li>7 días gratis</li>
            <li>Hasta 3 simulacros durante la prueba</li>
            <li>No se te cobra hasta el día 8</li>
            <li>Cancela cuando quieras desde tu panel</li>
          </ul>
        </td></tr>
        <tr><td style="padding:20px 32px;border-top:1px solid #E7E5E0;background:#FAFAF7;border-radius:0 0 8px 8px;">
          <p style="margin:0;font-size:11px;color:#9CA3AF;text-align:center;">
            Este email es una notificación automática de Acertlio.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
