import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import {
  dashboardPathForRole,
  allowedPathPrefixForRole,
} from "@/lib/supabase/user";
import type { UserRole } from "@/lib/supabase/types";

/**
 * Rutas públicas: no requieren autenticación.
 * Todo lo demás requiere sesión activa.
 */
const PUBLIC_PATHS = [
  "/",
  "/precios",
  "/academias",
  "/contacto",
  "/empezar",
  "/empezar/alumno",
  "/empezar/academia",
  "/activar",
  "/legal/aviso",
  "/legal/privacidad",
  "/legal/cookies",
  "/login",
];

/**
 * Comprueba si una ruta es pública.
 */
function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

/**
 * Middleware Next.js — se ejecuta en cada request antes de las rutas.
 *
 * Hace 3 cosas:
 *  1. Refresca la cookie de sesión Supabase (si expiró se renueva)
 *  2. Bloquea rutas privadas a usuarios no autenticados (redirect a /login)
 *  3. Redirige a un rol X que intente acceder a rutas de otro rol Y
 */
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options?: CookieOptions }[]
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Validar JWT (más seguro que getSession())
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isPublic = isPublicPath(pathname);

  // ─── Caso 1: usuario NO autenticado en ruta privada ───
  if (!user && !isPublic) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ─── Caso 2: usuario autenticado en /login → mándalo a su dashboard ───
  if (user && pathname === "/login") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_active")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.is_active) {
      const dest = dashboardPathForRole(profile.role as UserRole);
      return NextResponse.redirect(new URL(dest, request.url));
    }
  }

  // ─── Caso 3: usuario autenticado accediendo a un dashboard ───
  // Verificamos que el rol del usuario tenga permiso para ese prefijo.
  if (user && !isPublic) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_active")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile || !profile.is_active) {
      // Sin profile o desactivado → forzar logout
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const allowedPrefixes = allowedPathPrefixForRole(profile.role as UserRole);
    const isAllowed = allowedPrefixes.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    );

    if (!isAllowed) {
      // Rol equivocado para esta ruta → mándalo a su dashboard
      const dest = dashboardPathForRole(profile.role as UserRole);
      return NextResponse.redirect(new URL(dest, request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Excluir de este middleware:
     * - _next/static, _next/image
     * - favicon.svg, opengraph-image, sitemap.xml, robots.txt
     */
    "/((?!_next/static|_next/image|favicon.svg|opengraph-image|sitemap.xml|robots.txt).*)",
  ],
};
