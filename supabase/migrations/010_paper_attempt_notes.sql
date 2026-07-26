-- =====================================================================
-- ACERTLIO — Migración 010: Notas del alumno durante el examen
-- =====================================================================
-- Añade la tabla paper_attempt_notes para que el alumno pueda escribir
-- notas mientras hace un paper (panel lateral tipo scratch pad).
--
-- Una única nota global por paper_attempt (no una por pregunta).
--
-- Ejecutar tras 009.
-- =====================================================================

create table if not exists paper_attempt_notes (
    id                 uuid primary key default gen_random_uuid(),
    paper_attempt_id   uuid not null unique references paper_attempts(id) on delete cascade,
    student_id         uuid not null references profiles(id) on delete cascade,
    content            text not null default '',
    updated_at         timestamptz not null default now()
);

create index if not exists idx_pan_student on paper_attempt_notes(student_id);


-- RLS
alter table paper_attempt_notes enable row level security;

drop policy if exists "sel_pan" on paper_attempt_notes;
create policy "sel_pan" on paper_attempt_notes for select
    using (
        student_id = auth.uid()
        or is_super_admin()
    );

drop policy if exists "ins_pan" on paper_attempt_notes;
create policy "ins_pan" on paper_attempt_notes for insert
    with check (
        student_id = auth.uid()
        and exists (
            select 1 from paper_attempts pa
            where pa.id = paper_attempt_id
              and pa.student_id = auth.uid()
        )
    );

drop policy if exists "upd_pan" on paper_attempt_notes;
create policy "upd_pan" on paper_attempt_notes for update
    using (
        student_id = auth.uid()
        or is_super_admin()
    );
