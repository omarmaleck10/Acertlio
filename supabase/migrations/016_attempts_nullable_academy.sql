-- =====================================================================
-- ACERTLIO — Migración 016: Permitir attempts sin academia (individuales)
-- =====================================================================
-- Los alumnos individuales no pertenecen a ninguna academia, así que
-- sus attempts (intentos de mock) tampoco. Este SQL:
--
--   1. Hace nullable la columna academy_id en attempts
--   2. Ajusta el RLS para permitir ver los attempts propios sin academia
-- =====================================================================


-- 1. Nullable academy_id
alter table attempts
    alter column academy_id drop not null;


-- 2. Actualizar políticas RLS de attempts si es necesario
-- (Las políticas actuales ya usan `student_id = auth.uid()` o
--  `academy_id = current_academy_id()`. Si academy_id es null,
--  la comprobación con current_academy_id() da FALSE lo cual es OK,
--  y sigue permitiendo por student_id.)

-- Verificamos que la política de select existe y es correcta
drop policy if exists "sel_attempts" on attempts;
create policy "sel_attempts" on attempts for select
    using (
        student_id = auth.uid()
        or (
            academy_id is not null
            and academy_id = current_academy_id()
            and (is_academy_admin() or is_teacher_of(student_id))
        )
        or is_super_admin()
    );

drop policy if exists "ins_attempts" on attempts;
create policy "ins_attempts" on attempts for insert
    with check (
        student_id = auth.uid()
        or is_super_admin()
    );

drop policy if exists "upd_attempts" on attempts;
create policy "upd_attempts" on attempts for update
    using (
        student_id = auth.uid()
        or (
            academy_id is not null
            and academy_id = current_academy_id()
            and (is_academy_admin() or is_teacher_of(student_id))
        )
        or is_super_admin()
    );


-- =====================================================================
-- Verificación
-- =====================================================================
-- select is_nullable from information_schema.columns
--   where table_name = 'attempts' and column_name = 'academy_id';
-- → YES
-- =====================================================================
