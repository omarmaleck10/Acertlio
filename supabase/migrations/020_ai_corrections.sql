-- =====================================================================
-- ACERTLIO — Migración 020: Autocorrección Writing con IA (Fase 5B)
-- =====================================================================
-- Añade:
--   1. Tabla ai_corrections: trazabilidad de cada llamada a Anthropic
--      (tokens, coste, latencia, modelo, prompt version, error si hubo)
--   2. Campos en writing_corrections:
--      · corrected_by_ai (boolean)
--      · ai_correction_id (referencia a ai_corrections)
--      · suggestions (jsonb) — 3-5 sugerencias concretas de la IA
--
-- La tabla writing_corrections sigue siendo la fuente única de verdad
-- para "cuál es la corrección final del Writing" (tanto humana como IA).
-- =====================================================================


-- ─── 1. Tabla ai_corrections ────────────────────────────────────────
create table if not exists ai_corrections (
    id                  uuid primary key default gen_random_uuid(),
    attempt_id          uuid not null references attempts(id) on delete cascade,
    question_id         uuid not null references questions(id) on delete cascade,
    student_id          uuid not null references profiles(id) on delete cascade,

    -- Modelo y prompt
    model               text not null,
    prompt_version      text not null,

    -- Uso y coste
    input_tokens        integer,
    output_tokens       integer,
    cost_usd            numeric(10, 6),
    latency_ms          integer,

    -- Resultado
    status              text not null default 'pending',  -- pending | success | error | timeout
    error_message       text,

    -- Auditoría
    triggered_by        text not null default 'auto_submit',  -- auto_submit | fallback_academy | retry
    created_at          timestamptz not null default now(),
    completed_at        timestamptz,

    constraint aic_status_check check (status in ('pending', 'success', 'error', 'timeout'))
);

create index if not exists idx_aic_attempt on ai_corrections(attempt_id);
create index if not exists idx_aic_question on ai_corrections(question_id);
create index if not exists idx_aic_student on ai_corrections(student_id);
create index if not exists idx_aic_status on ai_corrections(status);
create index if not exists idx_aic_created on ai_corrections(created_at desc);


-- ─── 2. Nuevos campos en writing_corrections ────────────────────────
alter table writing_corrections
    add column if not exists corrected_by_ai boolean not null default false;

alter table writing_corrections
    add column if not exists ai_correction_id uuid references ai_corrections(id) on delete set null;

alter table writing_corrections
    add column if not exists suggestions jsonb;
-- suggestions: [{"type": "grammar", "text": "...", "example": "..."}, ...]


-- ─── 3. RLS ai_corrections ──────────────────────────────────────────
alter table ai_corrections enable row level security;

drop policy if exists "sel_aic" on ai_corrections;
create policy "sel_aic" on ai_corrections for select
    using (
        student_id = auth.uid()
        or exists (
            select 1 from attempts a
            where a.id = attempt_id
              and (
                a.academy_id = current_academy_id()
                and (is_academy_admin() or is_teacher_of(a.student_id))
              )
        )
        or is_super_admin()
    );

-- Solo el servicio (admin client) escribe en esta tabla.
-- No hay policies de insert/update/delete para usuarios normales.


-- =====================================================================
-- Verificación
-- =====================================================================
-- select column_name from information_schema.columns
--   where table_name = 'writing_corrections'
--     and column_name in ('corrected_by_ai', 'ai_correction_id', 'suggestions');
-- → 3 filas
--
-- select count(*) from ai_corrections;  -- 0
-- =====================================================================
