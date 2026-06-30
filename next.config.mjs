/** @type {import('next').NextConfig} */

const securityHeaders = [
  // Forzar HTTPS durante 2 años, incluyendo subdominios. Se activa cuando ya estés en HTTPS (en Vercel siempre).
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // No permitir que otros sitios embeban Acertlio en iframes (protege contra clickjacking).
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  // Impedir que el navegador adivine MIME types (protege contra ataques de tipo MIME-sniffing).
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  // No enviar el referer entre dominios distintos (privacidad y seguridad).
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  // Bloquear acceso a APIs sensibles del navegador que no usamos.
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), browsing-topics=(), interest-cohort=()",
  },
  // Bloquear cross-origin que no necesitamos.
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
];

const nextConfig = {
  reactStrictMode: true,
  // No exponer "X-Powered-By: Next.js" en cabeceras.
  poweredByHeader: false,
  // Comprimir respuestas.
  compress: true,
  async headers() {
    return [
      {
        // Aplicar a TODAS las rutas
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
