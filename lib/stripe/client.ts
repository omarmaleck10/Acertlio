import Stripe from "stripe";

/**
 * Cliente Stripe singleton para el servidor.
 * En dev/test usa las claves de test (sk_test_*).
 * En producción usa las claves live (sk_live_*).
 */

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn(
    "STRIPE_SECRET_KEY no está configurada. Las funciones de pago no funcionarán."
  );
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_test_placeholder", {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
  appInfo: {
    name: "Acertlio",
    version: "1.0.0",
  },
});

export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";
