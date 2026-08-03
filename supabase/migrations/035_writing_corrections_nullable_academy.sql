-- =====================================================================
-- ACERTLIO — Migración 035: writing_corrections.academy_id nullable
-- =====================================================================
-- Contexto del bug:
--   Los alumnos individuales no pertenecen a ninguna academia.
--   La migración 016 ya hizo nullable attempts.academy_id, pero no
--   se aplicó lo mismo a writing_corrections.academy_id, que sigue
--   siendo NOT NULL.
--
--   Cuando la IA intenta guardar la corrección para un individual:
--     - INSERT sin academy_id → falla por NOT NULL
--     - El código no verificaba el error → silencio
--     - Resultado: la fila real de la corrección IA nunca se guarda
--       correctamente, y el frontend ve status='pending' sin
--       corrected_at, así que no muestra la corrección al alumno.
--
-- Este SQL:
--   1. Hace nullable writing_corrections.academy_id
--   2. Backfill: rellena academy_id en filas existentes usando
--      attempt.academy_id (aunque sea NULL para individuales)
--   3. Actualiza el índice
-- =====================================================================


-- 1. Nullable academy_id
alter table writing_corrections
    alter column academy_id drop not null;


-- 2. Backfill: para filas donde academy_id sea NULL, cargarlo del
-- attempt. Para individuales quedará NULL (correcto).
update writing_corrections wc
    set academy_id = a.academy_id
    from attempts a
    where wc.attempt_id = a.id
      and wc.academy_id is null
      and a.academy_id is not null;


-- 3. Diagnóstico
do $$
declare
  n_null int;
  n_total int;
begin
  select count(*) into n_total from writing_corrections;
  select count(*) into n_null from writing_corrections where academy_id is null;

  raise notice '===== DIAGNÓSTICO writing_corrections =====';
  raise notice 'Total filas: %', n_total;
  raise notice 'Con academy_id NULL (individuales): %', n_null;
  raise notice '============================================';
end $$;


-- Verificación:
-- select
--   count(*) filter (where corrected_by_ai) as ia_corrections,
--   count(*) filter (where corrected_by_ai and corrected_at is not null) as ia_with_date,
--   count(*) filter (where status = 'pending') as pending,
--   count(*) filter (where status = 'completed') as completed
-- from writing_corrections;
