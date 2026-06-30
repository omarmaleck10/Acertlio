/**
 * Configuración central del sitio.
 * Cambia aquí la URL base si despliegas en otro dominio temporalmente.
 */
export const siteConfig = {
  name: "Acertlio",
  legalName: "Acertlio",
  url: "https://acertlio.com",
  email: "hola@acertlio.com",
  locale: "es_ES",
  country: "ES",
  description:
    "Plataforma SaaS de simulacros Cambridge Computer-Based para academias de inglés en España. Mocks B1 Preliminary, B2 First y C1 Advanced con la misma interfaz, tiempos y reglas del examen real.",
  shortDescription:
    "Simulacros Cambridge Computer-Based para academias de inglés.",
  keywords: [
    "simulacros Cambridge",
    "Cambridge Computer-Based",
    "B1 Preliminary",
    "B2 First",
    "C1 Advanced",
    "FCE",
    "CAE",
    "PET",
    "preparación Cambridge",
    "academia de inglés",
    "examen Cambridge online",
    "mock Cambridge",
    "plataforma academias inglés",
    "preparar Cambridge España",
  ],
} as const;

export type SiteConfig = typeof siteConfig;
