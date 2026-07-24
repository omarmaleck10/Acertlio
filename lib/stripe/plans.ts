/**
 * Configuración central de planes y precios de Acertlio.
 *
 * Los precios se muestran en euros SIN IVA en la landing (con nota "+ IVA").
 * Stripe se configura para calcular IVA automáticamente vía Tax rates.
 *
 * IDs de Stripe (STRIPE_PRICE_*) se rellenan en variables de entorno
 * después de crear los productos en el dashboard de Stripe.
 */

export type BillingInterval = "monthly" | "yearly";

// ─── Planes de academia ─────────────────────────────────────────────
export const ACADEMY_PLANS = {
  starter: {
    key: "starter",
    name: "Starter",
    description: "Ideal para academias pequeñas o proyectos que empiezan.",
    monthly: {
      price: 49.95,
      priceId: process.env.STRIPE_PRICE_ACADEMY_STARTER_MONTHLY ?? "",
    },
    yearly: {
      price: 499.5, // 10 meses (2 gratis)
      priceId: process.env.STRIPE_PRICE_ACADEMY_STARTER_YEARLY ?? "",
    },
    seats: 20,
    features: [
      "Hasta 20 alumnos concurrentes",
      "Simulacros oficiales A2 a C2",
      "Corrección automática de Reading y Use of English",
      "Panel de profesor con corrección de Writing",
      "Estadísticas por alumno y grupo",
      "Soporte por email",
    ],
    popular: false,
  },
  pro: {
    key: "pro",
    name: "Pro",
    description: "Para academias en crecimiento con varios grupos activos.",
    monthly: {
      price: 89.95,
      priceId: process.env.STRIPE_PRICE_ACADEMY_PRO_MONTHLY ?? "",
    },
    yearly: {
      price: 899.5,
      priceId: process.env.STRIPE_PRICE_ACADEMY_PRO_YEARLY ?? "",
    },
    seats: 50,
    features: [
      "Hasta 50 alumnos concurrentes",
      "Todo lo del plan Starter",
      "Múltiples profesores",
      "Informes agregados por academia",
      "Personalización del perfil de academia",
      "Soporte prioritario por email",
    ],
    popular: true,
  },
  business: {
    key: "business",
    name: "Business",
    description: "Para centros con volumen importante de alumnos Cambridge.",
    monthly: {
      price: 149.95,
      priceId: process.env.STRIPE_PRICE_ACADEMY_BUSINESS_MONTHLY ?? "",
    },
    yearly: {
      price: 1499.5,
      priceId: process.env.STRIPE_PRICE_ACADEMY_BUSINESS_YEARLY ?? "",
    },
    seats: 100,
    features: [
      "Hasta 100 alumnos concurrentes",
      "Todo lo del plan Pro",
      "Onboarding personalizado",
      "Estadísticas avanzadas exportables",
      "Reunión trimestral de calibración",
      "Soporte prioritario por chat",
    ],
    popular: false,
  },
} as const;

export const ENTERPRISE_PLAN = {
  key: "enterprise",
  name: "Enterprise",
  description: "Para redes de academias o instituciones grandes.",
  priceFrom: 250,
  features: [
    "Más de 100 alumnos concurrentes",
    "Todo lo del plan Business",
    "Integración con sistemas propios (SSO, LMS)",
    "SLA con tiempo de respuesta garantizado",
    "Formación al claustro incluida",
    "Contrato personalizado",
  ],
} as const;

// ─── Plan de alumno individual ─────────────────────────────────────
export const INDIVIDUAL_PLAN = {
  key: "individual",
  name: "Alumno individual",
  description: "Prepárate por tu cuenta al ritmo que quieras, sin permanencia.",
  monthly: {
    price: 14.95,
    priceId: process.env.STRIPE_PRICE_INDIVIDUAL_MONTHLY ?? "",
  },
  yearly: {
    price: 149.5, // 10 meses
    priceId: process.env.STRIPE_PRICE_INDIVIDUAL_YEARLY ?? "",
  },
  features: [
    "Acceso a todos los mocks del nivel que elijas",
    "Corrección automática instantánea de todas las partes",
    "Feedback pedagógico personalizado en cada intento",
    "Ranking global entre alumnos individuales",
    "Estadísticas propias detalladas",
    "Repite los mocks tantas veces como necesites",
    "Sin permanencia — cancela cuando quieras",
  ],
} as const;

// ─── Constantes de facturación ─────────────────────────────────────
export const VAT_RATE = 0.21; // España
export const TRIAL_DAYS_ACADEMY = 14;
export const TRIAL_DAYS_INDIVIDUAL = 7;

/**
 * Añade IVA a un precio.
 */
export function withVAT(priceExcludingVAT: number): number {
  return Math.round(priceExcludingVAT * (1 + VAT_RATE) * 100) / 100;
}

/**
 * Precio equivalente mensual para un plan anual (para mostrar en la landing).
 */
export function monthlyEquivalent(yearlyPrice: number): number {
  return Math.round((yearlyPrice / 12) * 100) / 100;
}

/**
 * % de descuento del plan anual respecto al mensual × 12.
 */
export function yearlyDiscount(monthlyPrice: number, yearlyPrice: number): number {
  const yearlyIfMonthly = monthlyPrice * 12;
  return Math.round(((yearlyIfMonthly - yearlyPrice) / yearlyIfMonthly) * 100);
}

// ─── Helpers para lookup de plan ────────────────────────────────────
export type AcademyPlanKey = keyof typeof ACADEMY_PLANS;

export function getAcademyPlan(key: AcademyPlanKey) {
  return ACADEMY_PLANS[key];
}

export function findPlanByPriceId(priceId: string): {
  planType: "academy" | "individual";
  planKey: string;
  interval: BillingInterval;
} | null {
  for (const [key, plan] of Object.entries(ACADEMY_PLANS)) {
    if (plan.monthly.priceId === priceId)
      return { planType: "academy", planKey: key, interval: "monthly" };
    if (plan.yearly.priceId === priceId)
      return { planType: "academy", planKey: key, interval: "yearly" };
  }
  if (INDIVIDUAL_PLAN.monthly.priceId === priceId)
    return { planType: "individual", planKey: "individual", interval: "monthly" };
  if (INDIVIDUAL_PLAN.yearly.priceId === priceId)
    return { planType: "individual", planKey: "individual", interval: "yearly" };
  return null;
}
