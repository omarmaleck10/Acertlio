-- =====================================================================
-- ACERTLIO — Migración 012: Sistema de asignaciones (Fase B.1)
-- =====================================================================
-- Añade:
--   1. Nuevos valores al enum assignment_status: 'overdue', 'cancelled'
--   2. Tabla assignment_notifications (rastreo de emails enviados)
--   3. Columna assignment_id en attempts (para atar el intento a la
--      asignación cuando exista)
--   4. Función helper para detectar assignments vencidos
--
-- El estado overdue se aplica cuando due_date < now() Y status = 'pending'.
-- No lo aplicamos en tiempo real por trigger sino en las queries de
-- lectura, para no requerir cron jobs.
-- =====================================================================


-- ─── 1. Nuevos valores al enum ──────────────────────────────────────
alter type assignment_status add value if not exists 'overdue';
alter type assignment_status add value if not exists 'cancelled';


-- ─── 2. Tabla assignment_notifications ─────────────────────────────
-- Rastrea qué emails hemos enviado por cada asignación (para no duplicar)
create table if not exists assignment_notifications (
    id                 uuid primary key default gen_random_uuid(),
    assignment_id      uuid not null references assignments(id) on delete cascade,
    student_id         uuid not null references profiles(id) on delete cascade,
    kind               text not null,   -- 'assigned', 'reminder_24h', 'overdue'
    sent_at            timestamptz not null default now(),
    email_provider_id  text,            -- ID del email en Brevo, si aplica

    constraint an_kind_check check (kind in ('assigned', 'reminder_24h', 'overdue')),
    constraint an_unique unique (assignment_id, kind)
);

create index if not exists idx_an_assignment on assignment_notifications(assignment_id);
create index if not exists idx_an_student on assignment_notifications(student_id);


-- ─── 3. RLS ─────────────────────────────────────────────────────────
alter table assignment_notifications enable row level security;

drop policy if exists "sel_an" on assignment_notifications;
create policy "sel_an" on assignment_notifications for select
    using (
        student_id = auth.uid()
        or exists (
            select 1 from assignments a
            where a.id = assignment_id
              and a.academy_id = current_academy_id()
              and (is_academy_admin() or a.assigned_by = auth.uid())
        )
        or is_super_admin()
    );

drop policy if exists "ins_an" on assignment_notifications;
create policy "ins_an" on assignment_notifications for insert
    with check (is_super_admin() or exists (
        select 1 from assignments a
        where a.id = assignment_id
          and a.assigned_by = auth.uid()
    ));


-- ─── 4. Ampliar attempts ────────────────────────────────────────────
-- Ya existe la columna assignment_id según schema.sql; nos aseguramos
-- de que su índice esté creado.
create index if not exists idx_attempts_assignment on attempts(assignment_id);


-- ─── 5. RLS assignments — permitir a profesor ver/crear ─────────────
-- Comprobamos las políticas actuales y añadimos las necesarias para el
-- flujo profesor → asigna a alumnos.

drop policy if exists "sel_assignments" on assignments;
create policy "sel_assignments" on assignments for select
    using (
        student_id = auth.uid()  -- el propio alumno
        or assigned_by = auth.uid()  -- el profesor que la creó
        or (
            academy_id = current_academy_id()
            and (is_academy_admin() or is_teacher_of(student_id))
        )
        or is_super_admin()
    );

drop policy if exists "ins_assignments" on assignments;
create policy "ins_assignments" on assignments for insert
    with check (
        academy_id = current_academy_id()
        and (
            is_academy_admin()
            or (is_teacher_of(student_id) and assigned_by = auth.uid())
        )
    );

drop policy if exists "upd_assignments" on assignments;
create policy "upd_assignments" on assignments for update
    using (
        assigned_by = auth.uid()
        or (
            academy_id = current_academy_id()
            and (is_academy_admin() or is_teacher_of(student_id))
        )
        or is_super_admin()
    );

drop policy if exists "del_assignments" on assignments;
create policy "del_assignments" on assignments for delete
    using (
        assigned_by = auth.uid()
        or (academy_id = current_academy_id() and is_academy_admin())
        or is_super_admin()
    );


-- =====================================================================
-- Verificación
-- =====================================================================
-- select unnest(enum_range(null::assignment_status)) as valores;
-- → debe incluir: pending, in_progress, completed, expired, overdue, cancelled
--
-- select count(*) from assignment_notifications;
-- → 0 (tabla vacía)
-- =====================================================================
