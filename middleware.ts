import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Middleware Next.js — se ejecuta en cada request antes de que llegue
 * a las rutas de la app.
 *
 * De momento sólo refresca la sesión de Supabase. En próximas fases
 * añadiremos aquí la lógica de autorización (redirect a /login si
 * intentas entrar en /academia sin sesión, etc.).
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Excluir de este middleware:
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.svg, imágenes públicas
     * - opengraph-image, sitemap.xml, robots.txt (metadata)
     */
    "/((?!_next/static|_next/image|favicon.svg|opengraph-image|sitemap.xml|robots.txt).*)",
  ],
};
