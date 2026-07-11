import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente ADMINISTRATIVO de Supabase.
 *
 * ⚠️  ADVERTENCIA CRÍTICA ⚠️
 *
 * Este cliente usa la SERVICE_ROLE_KEY. Bypassa Row Level Security por completo.
 * Puede leer, modificar y borrar CUALQUIER dato de la base de datos sin restricciones.
 *
 * REGLAS ESTRICTAS:
 * 1. NUNCA se puede llamar desde código que corra en el navegador (Client Components).
 * 2. NUNCA se expone al cliente a través de una API pública sin validación previa.
 * 3. SÓLO se usa para operaciones de sistema:
 *    - Crear la primera academia y su admin en el signup
 *    - Ejecutar migraciones o tareas de mantenimiento
 *    - Endpoints de webhook (Stripe, Resend)
 *    - Operaciones de superadmin auditadas
 *
 * Si tienes duda de si usarlo o no: usa createClient() de server.ts en su lugar.
 */
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY no está definida. Este cliente sólo funciona en el servidor."
    );
  }

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
