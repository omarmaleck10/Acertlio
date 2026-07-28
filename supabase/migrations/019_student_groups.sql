-- =====================================================================
-- ACERTLIO — Migración 019: Sistema de grupos/clases (Fase B.2)
-- =====================================================================
-- Añade:
--   1. Tabla student_groups: representa una clase de la academia
--      (ej: "B1 martes 18h", "Preparación B2 intensivo")
--      · Nivel Cambridge opcional
--      · Profesor titular obligatorio (con teacher_id NOT NULL)
--      · Descripción opcional
--   2. Tabla student_group_members: relación N:M
--      · Un alumno puede estar en varios grupos
--      · Un grupo puede tener varios alumnos
--   3. RLS:
--      · academy_admin gestiona todos los grupos de su academia
--      · teacher ve los grupos donde es titular
--      · student ve los grupos donde es miembro
-- =====================================================================


-- ─── 1. Tabla student_groups ───────────────────────────────────────
create table if not exists student_groups (
    id           uuid primary key default gen_random_uuid(),
    academy_id   uuid not null references academies(id) on delete cascade,
    teacher_id   uuid not null references profiles(id) on delete restrict,
    name         text not null,
    level        text,                  -- 'A2', 'B1', 'B2', 'C1', 'C2' o null
    description  text,
    is_archived  boolean not null default false,
    created_at   timestamptz not null default now(),
    updated_at   timestamptz not null default now(),
    created_by   uuid not null references profiles(id) on delete restrict,

    constraint sg_level_check check (
        level is null or level in ('A2', 'B1', 'B2', 'C1', 'C2')
    ),
    constraint sg_name_length check (char_length(name) between 2 and 80)
);

create index if not exists idx_sg_academy on student_groups(academy_id);
create index if not exists idx_sg_teacher on student_groups(teacher_id);
create index if not exists idx_sg_level on student_groups(level);
create index if not exists idx_sg_archived on student_groups(is_archived);


-- ─── 2. Tabla student_group_members ────────────────────────────────
create table if not exists student_group_members (
    id           uuid primary key default gen_random_uuid(),
    group_id     uuid not null references student_groups(id) on delete cascade,
    student_id   uuid not null references profiles(id) on delete cascade,
    joined_at    timestamptz not null default now(),
    added_by     uuid not null references profiles(id) on delete restrict,

    constraint sgm_unique unique (group_id, student_id)
);

create index if not exists idx_sgm_group on student_group_members(group_id);
create index if not exists idx_sgm_student on student_group_members(student_id);


-- ─── 3. RLS student_groups ─────────────────────────────────────────
alter table student_groups enable row level security;

drop policy if exists "sel_sg" on student_groups;
create policy "sel_sg" on student_groups for select
    using (
        -- Admin: ve grupos de su academia
        (academy_id = current_academy_id() and is_academy_admin())
        -- Teacher: ve grupos donde es titular
        or teacher_id = auth.uid()
        -- Student: ve grupos donde es miembro
        or exists (
            select 1 from student_group_members sgm
            where sgm.group_id = student_groups.id
              and sgm.student_id = auth.uid()
        )
        or is_super_admin()
    );

drop policy if exists "ins_sg" on student_groups;
create policy "ins_sg" on student_groups for insert
    with check (
        academy_id = current_academy_id() and is_academy_admin()
    );

drop policy if exists "upd_sg" on student_groups;
create policy "upd_sg" on student_groups for update
    using (
        (academy_id = current_academy_id() and is_academy_admin())
        or is_super_admin()
    );

drop policy if exists "del_sg" on student_groups;
create policy "del_sg" on student_groups for delete
    using (
        (academy_id = current_academy_id() and is_academy_admin())
        or is_super_admin()
    );


-- ─── 4. RLS student_group_members ──────────────────────────────────
alter table student_group_members enable row level security;

drop policy if exists "sel_sgm" on student_group_members;
create policy "sel_sgm" on student_group_members for select
    using (
        -- El propio alumno ve sus pertenencias
        student_id = auth.uid()
        -- El profesor titular del grupo lo ve
        or exists (
            select 1 from student_groups sg
            where sg.id = group_id
              and (
                sg.teacher_id = auth.uid()
                or (sg.academy_id = current_academy_id() and is_academy_admin())
              )
        )
        or is_super_admin()
    );

drop policy if exists "ins_sgm" on student_group_members;
create policy "ins_sgm" on student_group_members for insert
    with check (
        exists (
            select 1 from student_groups sg
            where sg.id = group_id
              and sg.academy_id = current_academy_id()
              and is_academy_admin()
        )
    );

drop policy if exists "del_sgm" on student_group_members;
create policy "del_sgm" on student_group_members for delete
    using (
        exists (
            select 1 from student_groups sg
            where sg.id = group_id
              and sg.academy_id = current_academy_id()
              and is_academy_admin()
        )
        or is_super_admin()
    );


-- ─── 5. Trigger updated_at ────────────────────────────────────────
create trigger set_updated_at_student_groups
    before update on student_groups
    for each row execute function update_updated_at();


-- =====================================================================
-- Verificación
-- =====================================================================
-- select count(*) from student_groups;         -- 0
-- select count(*) from student_group_members;  -- 0
--
-- select policyname from pg_policies
--   where tablename in ('student_groups', 'student_group_members')
--   order by tablename, policyname;
-- → 8 filas (4 por tabla)
-- =====================================================================
