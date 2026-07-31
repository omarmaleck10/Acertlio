-- =====================================================================
-- ACERTLIO — Migración 031: sincronización teacher_students ↔ grupos
-- =====================================================================
-- Contexto del bug:
--   Cuando se crea un grupo (student_groups) y se añaden alumnos a él
--   (student_group_members), NO se poblaba la tabla teacher_students.
--   El resultado: el profesor veía "No tienes alumnos asignados" en la
--   página de nuevas asignaciones aunque tuviera grupos llenos.
--
-- Solución en 2 partes:
--   1. Trigger que mantiene teacher_students sincronizada cuando se
--      añaden o quitan miembros de grupos.
--   2. Backfill: rellenar teacher_students con los alumnos que YA
--      están en grupos existentes.
--
-- Idempotente: puede reejecutarse sin problemas.
-- =====================================================================


-- ─── 1. Función trigger para INSERT en student_group_members ────────

create or replace function _acertlio_sync_teacher_students_on_group_join()
returns trigger
language plpgsql
security definer
as $$
declare
  v_teacher_id uuid;
  v_academy_id uuid;
begin
  -- Obtener el teacher_id y academy_id del grupo
  select teacher_id, academy_id
    into v_teacher_id, v_academy_id
    from student_groups
    where id = new.group_id;

  -- Si el grupo tiene profesor asignado, sincronizar teacher_students
  if v_teacher_id is not null then
    insert into teacher_students (teacher_id, student_id, academy_id)
    values (v_teacher_id, new.student_id, v_academy_id)
    on conflict (teacher_id, student_id) do nothing;
  end if;

  return new;
end;
$$;


-- ─── 2. Función trigger para UPDATE de teacher_id en student_groups ─
-- (Si se reasigna un grupo a otro profesor, sincronizar también)

create or replace function _acertlio_sync_teacher_students_on_group_reassign()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Si el teacher_id cambió, propagar el cambio a teacher_students
  -- para todos los miembros del grupo
  if new.teacher_id is distinct from old.teacher_id then
    -- Añadir nueva relación
    if new.teacher_id is not null then
      insert into teacher_students (teacher_id, student_id, academy_id)
      select new.teacher_id, sgm.student_id, new.academy_id
        from student_group_members sgm
        where sgm.group_id = new.id
      on conflict (teacher_id, student_id) do nothing;
    end if;
    -- No borramos las relaciones antiguas: un profesor podría haber
    -- añadido al alumno por otro grupo o por relación directa.
  end if;

  return new;
end;
$$;


-- ─── 3. Aplicar los triggers ────────────────────────────────────────

drop trigger if exists trg_sync_ts_on_group_join on student_group_members;
create trigger trg_sync_ts_on_group_join
    after insert on student_group_members
    for each row
    execute function _acertlio_sync_teacher_students_on_group_join();

drop trigger if exists trg_sync_ts_on_group_reassign on student_groups;
create trigger trg_sync_ts_on_group_reassign
    after update on student_groups
    for each row
    execute function _acertlio_sync_teacher_students_on_group_reassign();


-- ─── 4. Backfill: rellenar teacher_students con lo que ya existe ────
-- Para cada miembro de grupo cuyo grupo tiene profesor, garantiza que
-- existe la fila en teacher_students.

insert into teacher_students (teacher_id, student_id, academy_id)
select distinct
    sg.teacher_id,
    sgm.student_id,
    sg.academy_id
  from student_group_members sgm
  join student_groups sg on sg.id = sgm.group_id
  where sg.teacher_id is not null
on conflict (teacher_id, student_id) do nothing;


-- ─── 5. Verificación ────────────────────────────────────────────────
-- Query para comprobar:
--   select t.teacher_id, p.full_name as teacher, count(*) as num_students
--     from teacher_students t
--     join profiles p on p.id = t.teacher_id
--     group by t.teacher_id, p.full_name
--     order by num_students desc;
