-- =====================================================================
-- ACERTLIO — Migración 017: Notificación email al alumno (Writing correction)
-- =====================================================================
-- Fase C.2: cuando un profesor corrige un Writing, opcionalmente se
-- envía un email al alumno avisando de que ya tiene la corrección.
--
-- Añade columna notification_sent_at a writing_corrections para saber
-- si ya se envió el email (evita duplicados si el profesor edita la
-- corrección varias veces).
--
-- Idempotente: usa `if not exists`.
-- =====================================================================

alter table writing_corrections
    add column if not exists notification_sent_at timestamptz;

create index if not exists idx_wc_notification_sent
    on writing_corrections(notification_sent_at)
    where notification_sent_at is null;


-- =====================================================================
-- Verificación
-- =====================================================================
-- select column_name from information_schema.columns
--   where table_name = 'writing_corrections'
--     and column_name = 'notification_sent_at';
-- → 1 fila
-- =====================================================================
