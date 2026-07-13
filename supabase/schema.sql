-- =====================================================================
-- ACERTLIO — Schema completo de base de datos v1.0
-- =====================================================================
-- Este script crea toda la estructura de la base de datos de Acertlio
-- sobre Supabase (PostgreSQL 15).
--
-- ⚠️  IMPORTANTE:
-- - Ejecutar UNA SOLA VEZ en un proyecto Supabase nuevo y vacío.
-- - Requiere permisos de superusuario (los tienes por defecto en tu proyecto).
-- - Tarda aproximadamente 3-5 segundos en ejecutarse por completo.
--
-- Estructura:
--   Sección  1  →  Extensiones y tipos ENUM
--   Sección  2  →  academies (cuenta cliente)
--   Sección  3  →  profiles (usuarios con rol)
--   Sección  4  →  teacher_students (profesor ↔ alumno)
--   Sección  5  →  licenses (plazas concurrentes)
--   Sección  6  →  student_level_history (cambios de nivel)
--   Sección  7  →  exams (catálogo global de mocks)
--   Sección  8  →  exam_parts, questions, question_options
--   Sección  9  →  audios (Listening)
--   Sección 10  →  assignments (mocks asignados)
--   Sección 11  →  attempts, answers (intentos del alumno)
--   Sección 12  →  writing_corrections (rúbrica Cambridge)
--   Sección 13  →  invitations (altas por email)
--   Sección 14  →  subscriptions (Stripe)
--   Sección 15  →  audit_logs (registro de acciones sensibles)
--   Sección 16  →  Funciones helper para RLS
--   Sección 17  →  Row Level Security activado
--   Sección 18  →  Políticas RLS (quién ve qué)
--   Sección 19  →  Triggers automáticos (updated_at)
-- =====================================================================


-- =====================================================================
-- SECCIÓN 1 — EXTENSIONES Y TIPOS ENUM
-- =====================================================================

create extension if not exists "pgcrypto";  -- para gen_random_bytes()

-- Tipos ENUM: valores fijos permitidos en columnas específicas.
create type user_role as enum ('super_admin', 'academy_admin', 'teacher', 'student');
create type cambridge_level as enum ('A2', 'B1', 'B2', 'C1', 'C2');
create type academy_status as enum ('active', 'paused', 'cancelled');
create type academy_plan as enum ('starter', 'pro', 'business', 'enterprise');
create type exam_skill as enum ('reading', 'use_of_english', 'listening', 'writing', 'speaking');
create type question_type as enum (
    'multiple_choice',
    'word_formation',
    'gapped_text',
    'open_cloze',
    'multiple_matching',
    'writing_task'
);
create type assignment_status as enum ('pending', 'in_progress', 'completed', 'expired');
create type attempt_status as enum ('in_progress', 'submitted', 'auto_graded', 'fully_graded');
create type correction_status as enum ('pending', 'in_progress', 'completed');
create type subscription_status as enum ('active', 'past_due', 'cancelled', 'trialing');


-- =====================================================================
-- SECCIÓN 2 — academies (la cuenta cliente)
-- =====================================================================
-- Cada academia suscrita a Acertlio es una fila. Todo lo demás en la
-- base de datos pertenece a una academia concreta (multitenancy).
-- =====================================================================

create table academies (
    id                   uuid primary key default gen_random_uuid(),
    name                 text not null,
    slug                 text unique not null,       -- URL-friendly (ej: english-studio-madrid)
    cif                  text unique,
    email                text not null,
    phone                text,
    address              text,
    city                 text,
    country              text default 'ES',
    plan                 academy_plan default 'starter',
    total_seats          integer not null default 20,
    status               academy_status default 'active',
    stripe_customer_id   text,
    settings             jsonb default '{}',
    created_at           timestamptz default now(),
    updated_at           timestamptz default now()
);

create index idx_academies_status on academies(status);
create index idx_academies_slug on academies(slug);


-- =====================================================================
-- SECCIÓN 3 — profiles (usuarios con rol)
-- =====================================================================
-- Extiende auth.users (que Supabase gestiona automáticamente para
-- login/registro). Cada profile tiene un rol y pertenece a una academia
-- (excepto super_admin que no pertenece a ninguna).
-- =====================================================================

create table profiles (
    id             uuid primary key references auth.users(id) on delete cascade,
    academy_id     uuid references academies(id) on delete cascade,
    role           user_role not null,
    email          text not null,
    full_name      text,
    avatar_url     text,
    phone          text,
    current_level  cambridge_level,       -- solo para students
    is_active      boolean default true,
    created_at     timestamptz default now(),
    updated_at     timestamptz default now(),

    -- Regla: super_admin NO tiene academia; el resto SÍ.
    constraint check_academy_by_role check (
        (role = 'super_admin' and academy_id is null) or
        (role != 'super_admin' and academy_id is not null)
    ),

    -- Regla: solo students tienen nivel Cambridge asignado.
    constraint check_level_only_students check (
        (role = 'student') or (current_level is null)
    )
);

create index idx_profiles_academy on profiles(academy_id);
create index idx_profiles_role on profiles(role);
create index idx_profiles_email on profiles(email);


-- =====================================================================
-- SECCIÓN 4 — teacher_students (relación N:N profesor ↔ alumno)
-- =====================================================================

create table teacher_students (
    teacher_id   uuid not null references profiles(id) on delete cascade,
    student_id   uuid not null references profiles(id) on delete cascade,
    academy_id   uuid not null references academies(id) on delete cascade,
    created_at   timestamptz default now(),
    primary key (teacher_id, student_id)
);

create index idx_ts_teacher on teacher_students(teacher_id);
create index idx_ts_student on teacher_students(student_id);
create index idx_ts_academy on teacher_students(academy_id);


-- =====================================================================
-- SECCIÓN 5 — licenses (plazas concurrentes)
-- =====================================================================
-- El corazón del modelo de negocio. Cada academia tiene N licencias
-- (según su plan). Cada licencia puede estar libre o asignada a un
-- alumno. Al terminar el curso, la licencia se libera y otro alumno
-- puede ocuparla.
-- =====================================================================

create table licenses (
    id            uuid primary key default gen_random_uuid(),
    academy_id    uuid not null references academies(id) on delete cascade,
    student_id    uuid references profiles(id) on delete set null,
    assigned_at   timestamptz,
    released_at   timestamptz,
    is_active     boolean default true,
    created_at    timestamptz default now(),
    updated_at    timestamptz default now(),

    -- Regla: si tiene alumno, tiene fecha de asignación. Si no, ambos NULL.
    constraint check_license_assignment check (
        (student_id is not null and assigned_at is not null) or
        (student_id is null and assigned_at is null)
    )
);

create index idx_licenses_academy on licenses(academy_id);
create index idx_licenses_student on licenses(student_id);
create index idx_licenses_active on licenses(is_active);

-- Un alumno no puede tener 2 licencias activas al mismo tiempo.
create unique index idx_one_active_license_per_student
    on licenses(student_id)
    where student_id is not null and is_active = true;


-- =====================================================================
-- SECCIÓN 6 — student_level_history (cambios de nivel)
-- =====================================================================
-- Registro histórico. Cuando un alumno pasa de B2 a C1, se guarda aquí
-- para poder reconstruir su recorrido.
-- =====================================================================

create table student_level_history (
    id           uuid primary key default gen_random_uuid(),
    student_id   uuid not null references profiles(id) on delete cascade,
    academy_id   uuid not null references academies(id) on delete cascade,
    from_level   cambridge_level,
    to_level     cambridge_level not null,
    changed_by   uuid references profiles(id) on delete set null,
    reason       text,
    created_at   timestamptz default now()
);

create index idx_slh_student on student_level_history(student_id);
create index idx_slh_academy on student_level_history(academy_id);


-- =====================================================================
-- SECCIÓN 7 — exams (catálogo global de simulacros)
-- =====================================================================
-- NO pertenecen a ninguna academia. Los crea el superadmin de Acertlio
-- y están disponibles para todas las academias.
-- =====================================================================

create table exams (
    id                    uuid primary key default gen_random_uuid(),
    title                 text not null,
    level                 cambridge_level not null,
    mock_number           integer,
    description           text,
    total_time_minutes    integer not null,
    is_published          boolean default false,
    version               integer default 1,
    created_at            timestamptz default now(),
    updated_at            timestamptz default now()
);

create index idx_exams_level on exams(level);
create index idx_exams_published on exams(is_published);


-- =====================================================================
-- SECCIÓN 8 — exam_parts, questions, question_options
-- =====================================================================
-- Estructura jerárquica: examen → partes → preguntas → opciones.
-- =====================================================================

create table exam_parts (
    id             uuid primary key default gen_random_uuid(),
    exam_id        uuid not null references exams(id) on delete cascade,
    skill          exam_skill not null,
    part_number    integer not null,
    title          text,
    instructions   text,
    time_minutes   integer,
    order_index    integer not null,
    settings       jsonb default '{}',
    created_at     timestamptz default now(),
    updated_at     timestamptz default now()
);

create index idx_exam_parts_exam on exam_parts(exam_id);
create unique index idx_exam_parts_unique on exam_parts(exam_id, skill, part_number);

create table questions (
    id                uuid primary key default gen_random_uuid(),
    part_id           uuid not null references exam_parts(id) on delete cascade,
    question_number   integer not null,
    question_type     question_type not null,
    stem              text,
    context           jsonb default '{}',
    correct_answer    text,
    points            numeric not null default 1,
    order_index       integer not null,
    created_at        timestamptz default now(),
    updated_at        timestamptz default now()
);

create index idx_questions_part on questions(part_id);

create table question_options (
    id             uuid primary key default gen_random_uuid(),
    question_id    uuid not null references questions(id) on delete cascade,
    letter         text not null,             -- 'A', 'B', 'C', 'D'
    text           text not null,
    is_correct     boolean default false,
    order_index    integer not null default 0,
    created_at     timestamptz default now()
);

create index idx_options_question on question_options(question_id);


-- =====================================================================
-- SECCIÓN 9 — audios (Listening)
-- =====================================================================
-- Archivos en Supabase Storage con URL firmada y control de reproducciones.
-- =====================================================================

create table audios (
    id                  uuid primary key default gen_random_uuid(),
    part_id             uuid references exam_parts(id) on delete cascade,
    title               text not null,
    storage_path        text not null,           -- path en Supabase Storage
    duration_seconds    integer,
    max_plays           integer default 2,
    created_at          timestamptz default now()
);

create index idx_audios_part on audios(part_id);


-- =====================================================================
-- SECCIÓN 10 — assignments (mocks asignados a alumnos)
-- =====================================================================

create table assignments (
    id                uuid primary key default gen_random_uuid(),
    exam_id           uuid not null references exams(id) on delete cascade,
    student_id        uuid not null references profiles(id) on delete cascade,
    assigned_by       uuid references profiles(id) on delete set null,
    academy_id        uuid not null references academies(id) on delete cascade,
    due_date          timestamptz,
    parts_included    uuid[],       -- subset de partes; null = todas
    status            assignment_status default 'pending',
    created_at        timestamptz default now(),
    updated_at        timestamptz default now()
);

create index idx_assignments_student on assignments(student_id);
create index idx_assignments_academy on assignments(academy_id);
create index idx_assignments_status on assignments(status);


-- =====================================================================
-- SECCIÓN 11 — attempts, answers (intentos del alumno)
-- =====================================================================

create table attempts (
    id                    uuid primary key default gen_random_uuid(),
    assignment_id         uuid references assignments(id) on delete set null,
    exam_id               uuid not null references exams(id) on delete cascade,
    student_id            uuid not null references profiles(id) on delete cascade,
    academy_id            uuid not null references academies(id) on delete cascade,
    started_at            timestamptz default now(),
    submitted_at          timestamptz,
    time_spent_seconds    integer default 0,
    status                attempt_status default 'in_progress',
    raw_score             numeric,
    cambridge_score       integer,
    estimated_grade       text,
    created_at            timestamptz default now(),
    updated_at            timestamptz default now()
);

create index idx_attempts_student on attempts(student_id);
create index idx_attempts_academy on attempts(academy_id);
create index idx_attempts_exam on attempts(exam_id);
create index idx_attempts_status on attempts(status);

create table answers (
    id                     uuid primary key default gen_random_uuid(),
    attempt_id             uuid not null references attempts(id) on delete cascade,
    question_id            uuid not null references questions(id) on delete cascade,
    answer_text            text,
    selected_option_id     uuid references question_options(id) on delete set null,
    is_correct             boolean,
    points_earned          numeric,
    time_spent_seconds     integer,
    answered_at            timestamptz default now(),
    updated_at             timestamptz default now()
);

create unique index idx_answers_unique on answers(attempt_id, question_id);
create index idx_answers_question on answers(question_id);


-- =====================================================================
-- SECCIÓN 12 — writing_corrections (rúbrica Cambridge)
-- =====================================================================
-- El profesor corrige el Writing con la rúbrica oficial Cambridge:
-- Content, Communicative Achievement, Organisation, Language (0-5 cada uno).
-- =====================================================================

create table writing_corrections (
    id                      uuid primary key default gen_random_uuid(),
    attempt_id              uuid not null references attempts(id) on delete cascade,
    question_id             uuid not null references questions(id) on delete cascade,
    student_id              uuid not null references profiles(id) on delete cascade,
    teacher_id              uuid references profiles(id) on delete set null,
    academy_id              uuid not null references academies(id) on delete cascade,
    content_score           integer,
    communicative_score     integer,
    organisation_score      integer,
    language_score          integer,
    total_score             integer,
    feedback                text,
    inline_comments         jsonb default '[]',
    status                  correction_status default 'pending',
    corrected_at            timestamptz,
    created_at              timestamptz default now(),
    updated_at              timestamptz default now(),

    -- Rúbrica Cambridge: cada criterio entre 0 y 5
    constraint check_scores check (
        (content_score is null or content_score between 0 and 5) and
        (communicative_score is null or communicative_score between 0 and 5) and
        (organisation_score is null or organisation_score between 0 and 5) and
        (language_score is null or language_score between 0 and 5)
    )
);

create index idx_wc_teacher on writing_corrections(teacher_id);
create index idx_wc_student on writing_corrections(student_id);
create index idx_wc_academy on writing_corrections(academy_id);
create index idx_wc_status on writing_corrections(status);


-- =====================================================================
-- SECCIÓN 13 — invitations (altas por email)
-- =====================================================================
-- Cuando la academia invita a un profesor o alumno, se crea una fila
-- aquí con un token único. El invitado abre el link con ese token,
-- crea contraseña, y se convierte en usuario real.
-- =====================================================================

create table invitations (
    id             uuid primary key default gen_random_uuid(),
    academy_id     uuid not null references academies(id) on delete cascade,
    email          text not null,
    role           user_role not null,
    invited_by     uuid references profiles(id) on delete set null,
    token          text unique not null default encode(gen_random_bytes(32), 'hex'),
    expires_at     timestamptz not null default (now() + interval '7 days'),
    accepted_at    timestamptz,
    created_at     timestamptz default now()
);

create index idx_invitations_email on invitations(email);
create index idx_invitations_token on invitations(token);
create index idx_invitations_academy on invitations(academy_id);


-- =====================================================================
-- SECCIÓN 14 — subscriptions (Stripe)
-- =====================================================================
-- Se llena cuando montemos Stripe (Fase 3). Por ahora, tabla vacía.
-- =====================================================================

create table subscriptions (
    id                          uuid primary key default gen_random_uuid(),
    academy_id                  uuid not null unique references academies(id) on delete cascade,
    stripe_subscription_id      text unique,
    plan                        academy_plan not null,
    status                      subscription_status default 'trialing',
    current_period_start        timestamptz,
    current_period_end          timestamptz,
    cancel_at_period_end        boolean default false,
    created_at                  timestamptz default now(),
    updated_at                  timestamptz default now()
);

create index idx_subscriptions_stripe on subscriptions(stripe_subscription_id);
create index idx_subscriptions_status on subscriptions(status);


-- =====================================================================
-- SECCIÓN 15 — audit_logs (registro de acciones sensibles)
-- =====================================================================
-- Toda acción de seguridad queda registrada aquí. Solo el superadmin
-- puede leer estos logs.
-- =====================================================================

create table audit_logs (
    id             uuid primary key default gen_random_uuid(),
    user_id        uuid references profiles(id) on delete set null,
    academy_id     uuid references academies(id) on delete set null,
    action         text not null,
    entity_type    text,
    entity_id      uuid,
    metadata       jsonb default '{}',
    ip_address     inet,
    user_agent     text,
    created_at     timestamptz default now()
);

create index idx_audit_user on audit_logs(user_id);
create index idx_audit_academy on audit_logs(academy_id);
create index idx_audit_action on audit_logs(action);
create index idx_audit_created on audit_logs(created_at);


-- =====================================================================
-- SECCIÓN 16 — FUNCIONES HELPER PARA RLS
-- =====================================================================
-- Estas funciones se llaman en las políticas de RLS.
-- 'security definer' significa que se ejecutan con permisos elevados,
-- lo cual es necesario para consultar profiles desde dentro de RLS.
-- =====================================================================

create or replace function is_super_admin()
returns boolean language sql security definer stable
set search_path = public as $$
    select exists (
        select 1 from profiles
        where id = auth.uid()
          and role = 'super_admin'
          and is_active = true
    );
$$;

create or replace function current_academy_id()
returns uuid language sql security definer stable
set search_path = public as $$
    select academy_id from profiles
    where id = auth.uid()
      and is_active = true
    limit 1;
$$;

create or replace function current_user_role()
returns user_role language sql security definer stable
set search_path = public as $$
    select role from profiles
    where id = auth.uid()
      and is_active = true
    limit 1;
$$;

create or replace function is_academy_admin()
returns boolean language sql security definer stable
set search_path = public as $$
    select exists (
        select 1 from profiles
        where id = auth.uid()
          and role = 'academy_admin'
          and is_active = true
    );
$$;

create or replace function is_teacher_of(student_uuid uuid)
returns boolean language sql security definer stable
set search_path = public as $$
    select exists (
        select 1 from teacher_students
        where teacher_id = auth.uid()
          and student_id = student_uuid
    );
$$;


-- =====================================================================
-- SECCIÓN 17 — ACTIVAR ROW LEVEL SECURITY EN TODAS LAS TABLAS
-- =====================================================================

alter table academies              enable row level security;
alter table profiles               enable row level security;
alter table teacher_students       enable row level security;
alter table licenses               enable row level security;
alter table student_level_history  enable row level security;
alter table exams                  enable row level security;
alter table exam_parts             enable row level security;
alter table questions              enable row level security;
alter table question_options       enable row level security;
alter table audios                 enable row level security;
alter table assignments            enable row level security;
alter table attempts               enable row level security;
alter table answers                enable row level security;
alter table writing_corrections    enable row level security;
alter table invitations            enable row level security;
alter table subscriptions          enable row level security;
alter table audit_logs             enable row level security;


-- =====================================================================
-- SECCIÓN 18 — POLÍTICAS RLS (quién ve qué)
-- =====================================================================

-- ────── academies ──────

create policy "sel_academies" on academies for select
    using ((id = current_academy_id()) or is_super_admin());

create policy "upd_academies" on academies for update
    using ((id = current_academy_id() and is_academy_admin()) or is_super_admin());

create policy "ins_academies_signup" on academies for insert
    with check (auth.uid() is not null);

create policy "del_academies" on academies for delete
    using (is_super_admin());


-- ────── profiles ──────

create policy "sel_profiles" on profiles for select
    using (
        academy_id = current_academy_id()
        or id = auth.uid()
        or is_super_admin()
    );

create policy "ins_profiles" on profiles for insert
    with check (id = auth.uid() or is_super_admin());

create policy "upd_profiles" on profiles for update
    using (
        id = auth.uid()
        or is_super_admin()
        or (is_academy_admin() and academy_id = current_academy_id())
    );

create policy "del_profiles" on profiles for delete
    using (is_super_admin() or (is_academy_admin() and academy_id = current_academy_id()));


-- ────── teacher_students ──────

create policy "sel_ts" on teacher_students for select
    using (academy_id = current_academy_id() or is_super_admin());

create policy "all_ts" on teacher_students for all
    using ((academy_id = current_academy_id() and is_academy_admin()) or is_super_admin());


-- ────── licenses ──────

create policy "sel_licenses" on licenses for select
    using (academy_id = current_academy_id() or is_super_admin());

create policy "all_licenses" on licenses for all
    using ((academy_id = current_academy_id() and is_academy_admin()) or is_super_admin());


-- ────── student_level_history ──────

create policy "sel_slh" on student_level_history for select
    using (
        academy_id = current_academy_id()
        or student_id = auth.uid()
        or is_super_admin()
    );

create policy "all_slh" on student_level_history for all
    using (
        (academy_id = current_academy_id()
         and (is_academy_admin() or current_user_role() = 'teacher'))
        or is_super_admin()
    );


-- ────── exams (catálogo global) ──────
-- Cualquier usuario autenticado puede ver los exámenes publicados.
-- Solo superadmin puede crear/editar/borrar.

create policy "sel_exams" on exams for select
    using (is_published = true or is_super_admin());

create policy "all_exams" on exams for all
    using (is_super_admin());


-- ────── exam_parts ──────

create policy "sel_exam_parts" on exam_parts for select
    using (
        exists (select 1 from exams e where e.id = exam_id and e.is_published = true)
        or is_super_admin()
    );

create policy "all_exam_parts" on exam_parts for all
    using (is_super_admin());


-- ────── questions ──────

create policy "sel_questions" on questions for select
    using (
        exists (
            select 1 from exam_parts ep
            join exams e on e.id = ep.exam_id
            where ep.id = part_id and e.is_published = true
        )
        or is_super_admin()
    );

create policy "all_questions" on questions for all
    using (is_super_admin());


-- ────── question_options ──────

create policy "sel_options" on question_options for select
    using (
        exists (
            select 1 from questions q
            join exam_parts ep on ep.id = q.part_id
            join exams e on e.id = ep.exam_id
            where q.id = question_id and e.is_published = true
        )
        or is_super_admin()
    );

create policy "all_options" on question_options for all
    using (is_super_admin());


-- ────── audios ──────

create policy "sel_audios" on audios for select
    using (
        exists (
            select 1 from exam_parts ep
            join exams e on e.id = ep.exam_id
            where ep.id = part_id and e.is_published = true
        )
        or is_super_admin()
    );

create policy "all_audios" on audios for all
    using (is_super_admin());


-- ────── assignments ──────

create policy "sel_assignments" on assignments for select
    using (
        (academy_id = current_academy_id()
         and (student_id = auth.uid()
              or assigned_by = auth.uid()
              or is_teacher_of(student_id)
              or is_academy_admin()))
        or is_super_admin()
    );

create policy "ins_assignments" on assignments for insert
    with check (
        (academy_id = current_academy_id()
         and current_user_role() in ('teacher', 'academy_admin'))
        or is_super_admin()
    );

create policy "upd_assignments" on assignments for update
    using (
        (academy_id = current_academy_id()
         and (assigned_by = auth.uid() or is_academy_admin() or student_id = auth.uid()))
        or is_super_admin()
    );

create policy "del_assignments" on assignments for delete
    using (
        (academy_id = current_academy_id()
         and (assigned_by = auth.uid() or is_academy_admin()))
        or is_super_admin()
    );


-- ────── attempts ──────

create policy "sel_attempts" on attempts for select
    using (
        student_id = auth.uid()
        or (academy_id = current_academy_id()
            and (is_academy_admin() or is_teacher_of(student_id)))
        or is_super_admin()
    );

create policy "ins_attempts" on attempts for insert
    with check (student_id = auth.uid() and academy_id = current_academy_id());

create policy "upd_attempts" on attempts for update
    using (
        student_id = auth.uid()
        or is_teacher_of(student_id)
        or (is_academy_admin() and academy_id = current_academy_id())
        or is_super_admin()
    );


-- ────── answers ──────

create policy "sel_answers" on answers for select
    using (
        exists (
            select 1 from attempts a
            where a.id = attempt_id
              and (a.student_id = auth.uid()
                   or (a.academy_id = current_academy_id()
                       and (is_academy_admin() or is_teacher_of(a.student_id))))
        )
        or is_super_admin()
    );

create policy "ins_answers" on answers for insert
    with check (
        exists (select 1 from attempts a where a.id = attempt_id and a.student_id = auth.uid())
    );

create policy "upd_answers" on answers for update
    using (
        exists (select 1 from attempts a where a.id = attempt_id and a.student_id = auth.uid())
        or is_super_admin()
    );


-- ────── writing_corrections ──────

create policy "sel_wc" on writing_corrections for select
    using (
        student_id = auth.uid()
        or teacher_id = auth.uid()
        or (academy_id = current_academy_id() and is_academy_admin())
        or is_super_admin()
    );

create policy "ins_wc" on writing_corrections for insert
    with check (
        (academy_id = current_academy_id()
         and current_user_role() in ('teacher', 'academy_admin'))
        or is_super_admin()
    );

create policy "upd_wc" on writing_corrections for update
    using (
        teacher_id = auth.uid()
        or (academy_id = current_academy_id() and is_academy_admin())
        or is_super_admin()
    );


-- ────── invitations ──────

create policy "sel_invitations" on invitations for select
    using (
        (academy_id = current_academy_id() and is_academy_admin())
        or is_super_admin()
    );

create policy "all_invitations" on invitations for all
    using (
        (academy_id = current_academy_id() and is_academy_admin())
        or is_super_admin()
    );


-- ────── subscriptions ──────

create policy "sel_subscriptions" on subscriptions for select
    using (academy_id = current_academy_id() or is_super_admin());

create policy "all_subscriptions" on subscriptions for all
    using (is_super_admin());


-- ────── audit_logs ──────

create policy "sel_audit" on audit_logs for select
    using (is_super_admin());

create policy "ins_audit" on audit_logs for insert
    with check (auth.uid() is not null);


-- =====================================================================
-- SECCIÓN 19 — TRIGGERS AUTOMÁTICOS
-- =====================================================================
-- Actualiza updated_at automáticamente en cada UPDATE.
-- =====================================================================

create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create trigger set_updated_at before update on academies              for each row execute function update_updated_at();
create trigger set_updated_at before update on profiles               for each row execute function update_updated_at();
create trigger set_updated_at before update on licenses               for each row execute function update_updated_at();
create trigger set_updated_at before update on exams                  for each row execute function update_updated_at();
create trigger set_updated_at before update on exam_parts             for each row execute function update_updated_at();
create trigger set_updated_at before update on questions              for each row execute function update_updated_at();
create trigger set_updated_at before update on assignments            for each row execute function update_updated_at();
create trigger set_updated_at before update on attempts               for each row execute function update_updated_at();
create trigger set_updated_at before update on answers                for each row execute function update_updated_at();
create trigger set_updated_at before update on writing_corrections    for each row execute function update_updated_at();
create trigger set_updated_at before update on subscriptions          for each row execute function update_updated_at();


-- =====================================================================
-- FIN DEL SCHEMA v1.0
-- =====================================================================
-- Si has llegado aquí sin errores, la base de datos está lista.
-- Verifica en Supabase → Table Editor que ves las 17 tablas.
-- =====================================================================
