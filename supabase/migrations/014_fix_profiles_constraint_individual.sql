-- =====================================================================
-- ACERTLIO — Migración 014: Fix constraint profiles para alumnos individuales
-- =====================================================================
-- El constraint check_academy_by_role original obliga a que TODOS los
-- profiles que no sean super_admin tengan academy_id. Esto rompe el
-- flujo de alumnos individuales, que NO pertenecen a ninguna academia.
--
-- Este SQL:
--   1. Elimina el constraint viejo
--   2. Crea uno nuevo que permite:
--      - super_admin sin academia (como antes)
--      - student individual (is_individual=true) sin academia
--      - resto: obligatorio tener academia
--
-- Idempotente: se puede ejecutar múltiples veces sin efectos duplicados.
-- =====================================================================

-- Paso 1: eliminar el constraint viejo si existe
alter table profiles
    drop constraint if exists check_academy_by_role;

-- Paso 2: crear el nuevo constraint que respeta a los individuales
alter table profiles
    add constraint check_academy_by_role check (
        (role = 'super_admin' and academy_id is null)
        or (role = 'student' and is_individual = true and academy_id is null)
        or (role != 'super_admin' and academy_id is not null)
    );


-- =====================================================================
-- Verificación
-- =====================================================================
-- select conname, pg_get_constraintdef(oid)
--   from pg_constraint
--   where conrelid = 'profiles'::regclass
--     and conname = 'check_academy_by_role';
--
-- Debe mostrar el nuevo constraint con la condición de is_individual
-- =====================================================================
