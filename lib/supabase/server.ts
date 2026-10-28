/**
 * Helper para crear un cliente Supabase en server components y route handlers.
 * Usa @supabase/ssr (la librería actual recomendada por Supabase).
 *
 * Si ya tienes un helper equivalente en tu proyecto (por ejemplo
 * `lib/supabase/server.ts` o `utils/supabase/server.ts`), USA EL TUYO
 * y cambia los imports en los endpoints para apuntarle.
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Set desde un Server Component falla; es esperado.
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // Igual que arriba.
          }
        },
      },
    }
  );
}
