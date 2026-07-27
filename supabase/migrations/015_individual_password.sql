-- =====================================================================
-- ACERTLIO — Migración 015: Password temporal en individual_registrations
-- =====================================================================
-- Para que el alumno individual pueda elegir su contraseña durante el
-- formulario (antes de Stripe), necesitamos guardarla temporalmente hasta
-- que se active la cuenta tras el pago.
--
-- Se guarda en texto plano solo entre el envío del formulario y la
-- activación tras Stripe (típicamente minutos). Se borra inmediatamente
-- después de crear el auth.user.
--
-- Consideraciones de seguridad:
--   - La tabla tiene RLS estricto (solo super_admin puede leerla)
--   - Solo el service_role_key del server puede escribir/leer
--   - Supabase encripta at-rest
--   - El transporte es HTTPS
--   - La columna se limpia (set null) tras activación
-- =====================================================================

alter table individual_registrations
    add column if not exists pending_password text;


-- =====================================================================
-- Verificación
-- =====================================================================
-- select column_name, data_type from information_schema.columns
--   where table_name = 'individual_registrations'
--     and column_name = 'pending_password';
--
-- Debe mostrar 1 fila con data_type='text'
-- =====================================================================
