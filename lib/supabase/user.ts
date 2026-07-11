import { createClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/lib/supabase/types";

/**
 * Devuelve el usuario autenticado + su profile de Acertlio.
 * Si no hay sesión, si el profile no existe, o si el usuario está desactivado,
 * devuelve null.
 *
 * Uso típico en un Server Component:
 *   import { getCurrentUser } from "@/lib/supabase/user";
 *   export default async function Page() {
 *     const user = await getCurrentUser();
 *     if (!user) redirect("/login");
 *     ...
 *   }
 */
export async function getCurrentUser(): Promise<{
  id: string;
  email: string;
  profile: Profile;
} | null> {
  const supabase = createClient();

  // getUser() valida el JWT con Supabase (más lento pero seguro).
  // NUNCA usamos getSession() para decisiones de autorización, solo lee cookie.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) return null;
  if (!profile.is_active) return null;

  return {
    id: user.id,
    email: user.email!,
    profile: profile as Profile,
  };
}

/**
 * Devuelve la ruta del dashboard correspondiente al rol del usuario.
 * Se usa tras el login y en el middleware para redirigir.
 */
export function dashboardPathForRole(role: UserRole): string {
  switch (role) {
    case "super_admin":
      return "/admin";
    case "academy_admin":
      return "/academia";
    case "teacher":
      return "/profesor";
    case "student":
      return "/alumno";
  }
}

/**
 * Devuelve el prefijo de ruta protegida para un rol dado.
 * Usado por el middleware para verificar que un usuario con rol X
 * solo puede acceder a las rutas de rol X.
 */
export function allowedPathPrefixForRole(role: UserRole): string[] {
  switch (role) {
    case "super_admin":
      // El superadmin puede entrar a todos los paneles (para soporte).
      return ["/admin", "/academia", "/profesor", "/alumno"];
    case "academy_admin":
      return ["/academia"];
    case "teacher":
      return ["/profesor"];
    case "student":
      return ["/alumno"];
  }
}
