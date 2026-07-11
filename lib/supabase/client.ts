import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente de Supabase para Client Components (código que se ejecuta en el navegador).
 *
 * Usa la clave anon pública — es seguro exponerla en el navegador porque
 * todas las operaciones están limitadas por Row Level Security (RLS).
 *
 * Uso típico:
 *   "use client";
 *   import { createClient } from "@/lib/supabase/client";
 *   const supabase = createClient();
 *   const { data } = await supabase.from("profiles").select();
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
