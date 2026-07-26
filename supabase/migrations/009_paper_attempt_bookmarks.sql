-- =====================================================================
-- ACERTLIO — Migración 009: Bookmarks del simulador
-- =====================================================================
-- Añade la tabla paper_attempt_bookmarks para que el alumno pueda marcar
-- preguntas para revisar durante el examen (icono bandera).
--
-- Ejecutar tras 008.
-- =====================================================================

create table if not exists paper_attempt_bookmarks (
    id                 uuid primary key default gen_random_uuid(),
    paper_attempt_id   uuid not null references paper_attempts(id) on delete cascade,
    question_id        uuid not null references questions(id) on delete cascade,
    student_id         uuid not null references profiles(id) on delete cascade,
    created_at         timestamptz not null default now(),

    constraint paper_attempt_bookmarks_unique unique (paper_attempt_id, question_id)
);

create index if not exists idx_pab_paper_attempt on paper_attempt_bookmarks(paper_attempt_id);
create index if not exists idx_pab_student on paper_attempt_bookmarks(student_id);


-- RLS
alter table paper_attempt_bookmarks enable row level security;

drop policy if exists "sel_pab" on paper_attempt_bookmarks;
create policy "sel_pab" on paper_attempt_bookmarks for select
    using (
        student_id = auth.uid()
        or exists (
            select 1 from paper_attempts pa
            join attempts a on a.id = pa.attempt_id
            where pa.id = paper_attempt_id
              and a.academy_id = current_academy_id()
              and (is_academy_admin() or is_teacher_of(a.student_id))
        )
        or is_super_admin()
    );

drop policy if exists "ins_pab" on paper_attempt_bookmarks;
create policy "ins_pab" on paper_attempt_bookmarks for insert
    with check (
        student_id = auth.uid()
        and exists (
            select 1 from paper_attempts pa
            where pa.id = paper_attempt_id
              and pa.student_id = auth.uid()
        )
    );

drop policy if exists "del_pab" on paper_attempt_bookmarks;
create policy "del_pab" on paper_attempt_bookmarks for delete
    using (
        student_id = auth.uid()
        or is_super_admin()
    );
