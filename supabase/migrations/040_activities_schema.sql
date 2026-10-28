-- ─────────────────────────────────────────────────────
-- Migración 040: Sistema de actividades preparatorias
-- ─────────────────────────────────────────────────────
-- Catálogo de actividades cortas (8 preguntas) por nivel y parte
-- del examen Cambridge. Separado del schema de mocks completos.

-- ─── TIPOS ──────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE cambridge_level AS ENUM ('A2', 'B1', 'B2', 'C1', 'C2');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE cambridge_skill AS ENUM (
    'reading', 'use_of_english', 'reading_uoe',
    'writing', 'listening', 'speaking'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE activity_question_type AS ENUM (
    'multiple_choice',           -- 4 opciones, 1 correcta
    'open_cloze',                -- rellenar hueco con 1 palabra
    'word_formation',            -- transformar palabra base
    'key_word_transformation',   -- transformar frase usando palabra dada
    'multiple_matching'          -- varias opciones, varias respuestas
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE activity_difficulty AS ENUM ('easy', 'medium', 'hard');
EXCEPTION WHEN duplicate_object THEN null; END $$;


-- ─── CATÁLOGO DE PARTES DEL EXAMEN ──────────────────
-- Catálogo fijo de las partes oficiales de cada nivel.
-- No cambia (salvo que Cambridge cambie la estructura).
CREATE TABLE IF NOT EXISTS public.exam_part_catalog (
  id              SERIAL PRIMARY KEY,
  level           cambridge_level NOT NULL,
  skill           cambridge_skill NOT NULL,
  part_number     INT NOT NULL,
  slug            TEXT NOT NULL,                     -- 'b2-uoe-part-4'
  name            TEXT NOT NULL,                     -- 'Key Word Transformation'
  description     TEXT,
  official_question_count INT,                       -- preguntas en el examen oficial
  default_question_type activity_question_type,
  display_order   INT NOT NULL,
  UNIQUE(level, skill, part_number),
  UNIQUE(slug)
);

CREATE INDEX IF NOT EXISTS idx_exam_part_catalog_level_skill
  ON public.exam_part_catalog(level, skill);


-- ─── ACTIVIDADES ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.activities (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level               cambridge_level NOT NULL,
  skill               cambridge_skill NOT NULL,
  exam_part_id        INT NOT NULL REFERENCES public.exam_part_catalog(id),
  activity_number     INT NOT NULL,                    -- Nº dentro de su nivel+parte
  title               TEXT NOT NULL,                   -- 'B2 First · Reading Part 5 · Nº 1'
  description         TEXT,
  intro_text          TEXT,                            -- texto largo para reading
  audio_url           TEXT,                            -- para listening (opcional)
  estimated_minutes   INT NOT NULL DEFAULT 10,
  difficulty          activity_difficulty NOT NULL DEFAULT 'medium',
  is_published        BOOLEAN NOT NULL DEFAULT false,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(level, exam_part_id, activity_number)
);

CREATE INDEX IF NOT EXISTS idx_activities_level ON public.activities(level);
CREATE INDEX IF NOT EXISTS idx_activities_exam_part ON public.activities(exam_part_id);
CREATE INDEX IF NOT EXISTS idx_activities_published ON public.activities(is_published) WHERE is_published = true;


-- ─── PREGUNTAS DE CADA ACTIVIDAD ────────────────────
CREATE TABLE IF NOT EXISTS public.activity_questions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id       UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  question_number   INT NOT NULL,                      -- 1-8
  question_type     activity_question_type NOT NULL,
  prompt            TEXT NOT NULL,                     -- enunciado principal
  context           TEXT,                              -- contexto (ej: frase original)
  correct_answer    TEXT NOT NULL,                     -- respuesta correcta canónica
  accepted_answers  JSONB,                             -- array de otras aceptadas
  explanation       TEXT,                              -- por qué es correcta
  metadata          JSONB DEFAULT '{}'::jsonb,         -- datos del tipo específico
  UNIQUE(activity_id, question_number)
);

CREATE INDEX IF NOT EXISTS idx_activity_questions_activity
  ON public.activity_questions(activity_id);


-- ─── OPCIONES DE RESPUESTA (multiple_choice / multiple_matching) ──
CREATE TABLE IF NOT EXISTS public.activity_question_options (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id     UUID NOT NULL REFERENCES public.activity_questions(id) ON DELETE CASCADE,
  option_letter   TEXT NOT NULL,                       -- 'A', 'B', 'C', 'D'
  option_text     TEXT NOT NULL,
  is_correct      BOOLEAN NOT NULL DEFAULT false,
  display_order   INT NOT NULL DEFAULT 0,
  UNIQUE(question_id, option_letter)
);

CREATE INDEX IF NOT EXISTS idx_activity_options_question
  ON public.activity_question_options(question_id);


-- ─── INTENTOS DEL ALUMNO ────────────────────────────
CREATE TABLE IF NOT EXISTS public.activity_attempts (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_id          UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  started_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at         TIMESTAMPTZ,
  score                INT,                            -- preguntas correctas (0-8)
  total_questions      INT NOT NULL DEFAULT 8,
  time_spent_seconds   INT,
  is_complete          BOOLEAN NOT NULL DEFAULT false,
  -- Para la recomendación: tracking del origen
  source               TEXT DEFAULT 'catalog',         -- 'catalog' | 'post_mock_recommendation'
  source_mock_attempt_id UUID                          -- si vino de recomendación tras mock
);

CREATE INDEX IF NOT EXISTS idx_activity_attempts_user
  ON public.activity_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_attempts_activity
  ON public.activity_attempts(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_attempts_user_complete
  ON public.activity_attempts(user_id, is_complete);


-- ─── RESPUESTAS DEL ALUMNO ──────────────────────────
CREATE TABLE IF NOT EXISTS public.activity_responses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id      UUID NOT NULL REFERENCES public.activity_attempts(id) ON DELETE CASCADE,
  question_id     UUID NOT NULL REFERENCES public.activity_questions(id) ON DELETE CASCADE,
  user_answer     TEXT,
  is_correct      BOOLEAN,
  answered_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(attempt_id, question_id)
);


-- ─── RLS (Row Level Security) ──────────────────────
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_part_catalog ENABLE ROW LEVEL SECURITY;

-- Catálogo y actividades publicadas: lectura pública para usuarios autenticados
DROP POLICY IF EXISTS "Anyone authenticated can read exam_part_catalog" ON public.exam_part_catalog;
CREATE POLICY "Anyone authenticated can read exam_part_catalog"
  ON public.exam_part_catalog FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Anyone authenticated can read published activities" ON public.activities;
CREATE POLICY "Anyone authenticated can read published activities"
  ON public.activities FOR SELECT
  USING (auth.role() = 'authenticated' AND is_published = true);

DROP POLICY IF EXISTS "Anyone authenticated can read questions of published activities" ON public.activity_questions;
CREATE POLICY "Anyone authenticated can read questions of published activities"
  ON public.activity_questions FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.activities a
      WHERE a.id = activity_id AND a.is_published = true
    )
  );

DROP POLICY IF EXISTS "Anyone authenticated can read options of published activities" ON public.activity_question_options;
CREATE POLICY "Anyone authenticated can read options of published activities"
  ON public.activity_question_options FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.activity_questions q
      JOIN public.activities a ON a.id = q.activity_id
      WHERE q.id = question_id AND a.is_published = true
    )
  );

-- Intentos y respuestas: solo el propio alumno
DROP POLICY IF EXISTS "Users see own attempts" ON public.activity_attempts;
CREATE POLICY "Users see own attempts"
  ON public.activity_attempts FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own attempts" ON public.activity_attempts;
CREATE POLICY "Users insert own attempts"
  ON public.activity_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own attempts" ON public.activity_attempts;
CREATE POLICY "Users update own attempts"
  ON public.activity_attempts FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users see own responses" ON public.activity_responses;
CREATE POLICY "Users see own responses"
  ON public.activity_responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.activity_attempts a
      WHERE a.id = attempt_id AND a.user_id = auth.uid()
    )
  );

-- Trigger updated_at para activities
CREATE OR REPLACE FUNCTION update_activities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_activities_updated_at ON public.activities;
CREATE TRIGGER trg_activities_updated_at
  BEFORE UPDATE ON public.activities
  FOR EACH ROW EXECUTE FUNCTION update_activities_updated_at();


COMMENT ON TABLE public.activities IS 'Catálogo de actividades preparatorias (8 preguntas por nivel y parte)';
COMMENT ON TABLE public.exam_part_catalog IS 'Catálogo fijo de partes oficiales del examen Cambridge';
COMMENT ON TABLE public.activity_attempts IS 'Cada intento del alumno de una actividad';
