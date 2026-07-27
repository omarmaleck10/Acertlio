import { createAdminClient } from "@/lib/supabase/admin";

export type TrialStatus =
  | "trialing_ok"      // en trial, aún tiene cupo
  | "trialing_capped"  // en trial pero ya usó los 3 mocks
  | "trialing_expiring" // trial normal pero quedan <3 días
  | "active"           // trial acabó, suscripción activa (sin cap)
  | "cancelled"        // suscripción cancelada
  | "no_subscription"; // sin sub (raro, error)

export const TRIAL_MOCKS_CAP = 3;
export const TRIAL_EXPIRING_DAYS = 3;

export interface IndividualStatus {
  status: TrialStatus;
  is_individual: boolean;
  trial_ends_at: string | null;
  days_left_in_trial: number | null;
  mocks_used: number;
  mocks_remaining: number | null;
  cap: number;
  cambridge_level: string | null;
}


/**
 * Cuenta cuántos mocks DISTINTOS ha empezado el alumno.
 * "Distintos" significa exam_id únicos en la tabla attempts.
 * Un mismo mock retomado no cuenta doble.
 */
export async function countDistinctMocksStarted(
  studentId: string
): Promise<number> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("attempts")
    .select("exam_id")
    .eq("student_id", studentId);
  if (!data) return 0;
  return new Set(data.map((a) => a.exam_id)).size;
}


/**
 * Devuelve el estado completo del alumno individual.
 * Combina trial_ends_at + mocks_used + subscription.status.
 */
export async function getIndividualStatus(
  profile: {
    id: string;
    is_individual: boolean;
    trial_ends_at: string | null;
    current_level: string | null;
  }
): Promise<IndividualStatus> {
  if (!profile.is_individual) {
    return {
      status: "no_subscription",
      is_individual: false,
      trial_ends_at: null,
      days_left_in_trial: null,
      mocks_used: 0,
      mocks_remaining: null,
      cap: TRIAL_MOCKS_CAP,
      cambridge_level: profile.current_level,
    };
  }

  const admin = createAdminClient();

  // Mocks usados
  const mocksUsed = await countDistinctMocksStarted(profile.id);

  // Fecha del trial
  const now = Date.now();
  const trialEnd = profile.trial_ends_at
    ? new Date(profile.trial_ends_at).getTime()
    : null;

  const daysLeft = trialEnd
    ? Math.ceil((trialEnd - now) / (24 * 60 * 60 * 1000))
    : null;

  const inTrial = trialEnd !== null && trialEnd > now;

  // Estado de la subscripción
  const { data: sub } = await admin
    .from("subscriptions")
    .select("status")
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const subStatus = sub?.status ?? null;

  // Determinar TrialStatus
  let status: TrialStatus;

  if (subStatus === "cancelled") {
    status = "cancelled";
  } else if (inTrial) {
    if (mocksUsed >= TRIAL_MOCKS_CAP) {
      status = "trialing_capped";
    } else if (daysLeft !== null && daysLeft <= TRIAL_EXPIRING_DAYS) {
      status = "trialing_expiring";
    } else {
      status = "trialing_ok";
    }
  } else if (subStatus === "active" || subStatus === "trialing") {
    // trialing en Stripe pero trial_ends_at ya pasó → efectivamente activo
    status = "active";
  } else {
    status = "no_subscription";
  }

  const mocksRemaining =
    status === "active" || status === "cancelled"
      ? null
      : Math.max(0, TRIAL_MOCKS_CAP - mocksUsed);

  return {
    status,
    is_individual: true,
    trial_ends_at: profile.trial_ends_at,
    days_left_in_trial: daysLeft,
    mocks_used: mocksUsed,
    mocks_remaining: mocksRemaining,
    cap: TRIAL_MOCKS_CAP,
    cambridge_level: profile.current_level,
  };
}


/**
 * Devuelve true si el alumno puede empezar un mock nuevo.
 * Considera cap del trial y si el mock ya lo empezó antes.
 */
export async function canStartMock(
  studentId: string,
  examId: string,
  individualStatus: IndividualStatus
): Promise<{ allowed: boolean; reason?: string }> {
  // No individual → siempre puede (los de academia usan assignments)
  if (!individualStatus.is_individual) return { allowed: true };

  // Sin subscripción o cancelled → no puede
  if (individualStatus.status === "no_subscription") {
    return {
      allowed: false,
      reason: "No hay suscripción activa. Contacta con soporte.",
    };
  }
  if (individualStatus.status === "cancelled") {
    return {
      allowed: false,
      reason:
        "Tu suscripción está cancelada. Renueva desde tu panel de facturación.",
    };
  }

  // Active o trialing_ok/expiring → puede
  if (
    individualStatus.status === "active" ||
    individualStatus.status === "trialing_ok" ||
    individualStatus.status === "trialing_expiring"
  ) {
    return { allowed: true };
  }

  // trialing_capped → solo si ya empezó ese mock antes
  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("attempts")
    .select("id")
    .eq("student_id", studentId)
    .eq("exam_id", examId)
    .limit(1)
    .maybeSingle();

  if (existing) return { allowed: true };

  return {
    allowed: false,
    reason: "trial_cap_reached",
  };
}
