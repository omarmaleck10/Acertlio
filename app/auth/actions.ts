"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { dashboardPathForRole } from "@/lib/supabase/user";
import type { UserRole } from "@/lib/supabase/types";

/**
 * Resultado que devuelven las Server Actions al Client Component.
 * Si error es null, todo fue bien (y normalmente la action redirige).
 * Si error tiene texto, el form lo muestra al usuario.
 */
export type AuthActionResult = {
  error: string | null;
};

/**
 * Inicia sesión con email + contraseña.
 * Tras un login válido, redirige al dashboard correspondiente al rol.
 * Si falla, devuelve un mensaje para mostrar en el form.
 */
export async function signInAction(
  _prev: AuthActionResult,
  formData: FormData
): Promise<AuthActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Rellena email y contraseña." };
  }

  const supabase = createClient();

  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({ email, password });

  if (authError || !authData.user) {
    // Mensajes genéricos por seguridad — no revelamos si el email existe o no.
    return { error: "Email o contraseña incorrectos." };
  }

  // Verificamos que el profile existe y está activo antes de dejar entrar.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (!profile) {
    // El usuario existe en auth.users pero no tiene profile en Acertlio.
    // Cerramos sesión y le pedimos que contacte con soporte.
    await supabase.auth.signOut();
    return {
      error:
        "Tu cuenta no está configurada correctamente. Contacta con hola@acertlio.com.",
    };
  }

  if (!profile.is_active) {
    await supabase.auth.signOut();
    return {
      error:
        "Tu cuenta está desactivada. Contacta con el administrador de tu academia.",
    };
  }

  // Todo bien. Redirigimos al dashboard del rol.
  const dest = dashboardPathForRole(profile.role as UserRole);
  revalidatePath("/", "layout");
  redirect(dest);
}

/**
 * Cierra la sesión y redirige a la home.
 * Se llama desde el botón "Salir" de los dashboards.
 */
export async function signOutAction(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
