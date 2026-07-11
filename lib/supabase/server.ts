import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Cliente de Supabase para Server Components, Route Handlers y Server Actions.
 *
 * Usa la clave anon pero corre en el servidor. La diferencia con el cliente
 * de navegador es que este lee la cookie de sesión desde el request, así
 * el usuario se identifica correctamente en cada petición.
 *
 * IMPORTANTE: sólo se puede llamar desde código que corre en el servidor
 * (Server Components, Route Handlers, Server Actions). NO desde Client Components.
 *
 * Uso típico:
 *   import { createClient } from "@/lib/supabase/server";
 *   export default async function Page() {
 *     const supabase = createClient();
 *     const { data: { user } } = await supabase.auth.getUser();
 *     ...
 *   }
 */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // El método `setAll` fue llamado desde un Server Component.
            // Se puede ignorar si hay un middleware refrescando la sesión.
          }
        },
      },
    }
  );
}
