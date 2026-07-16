-- =====================================================================
-- ACERTLIO — Migración 001 (v1.1)
-- =====================================================================
-- Añade los niveles A2 Key y C2 Proficiency, y los question types que
-- aún faltaban para cubrir la estructura oficial de los 5 papers Cambridge.
--
-- ⚠️ Ejecutar UNA SOLA VEZ tras el schema.sql inicial.
--    Copia el contenido y pégalo en Supabase → SQL Editor → Run.
-- =====================================================================


-- Sección 1 — Añadir A2 y C2 al enum cambridge_level
-- --------------------------------------------------
-- Postgres permite añadir valores a un enum si usamos ALTER TYPE.
-- El orden importa: los ponemos con IF NOT EXISTS por seguridad.

alter type cambridge_level add value if not exists 'A2' before 'B1';
alter type cambridge_level add value if not exists 'C2' after 'C1';


-- Sección 2 — Añadir los question types que faltaban
-- --------------------------------------------------
alter type question_type add value if not exists 'multiple_choice_cloze';
alter type question_type add value if not exists 'key_word_transformation';
alter type question_type add value if not exists 'cross_text_multiple_matching';


-- =====================================================================
-- Verificación (opcional): ejecuta esto después para confirmar
-- =====================================================================
--
-- select enumlabel from pg_enum
--   where enumtypid = 'cambridge_level'::regtype
--   order by enumsortorder;
--
-- select enumlabel from pg_enum
--   where enumtypid = 'question_type'::regtype
--   order by enumsortorder;
--
-- Deberías ver: A2, B1, B2, C1, C2 en cambridge_level
-- y los 9 tipos en question_type.
-- =====================================================================
