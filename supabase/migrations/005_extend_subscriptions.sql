-- =====================================================================
-- ACERTLIO — Migración 005: Suscripciones individuales + Stripe
-- =====================================================================
-- Extiende la tabla subscriptions para soportar dos tipos:
--   - Academias (academy_id) — el modelo actual
--   - Alumnos individuales (student_id) — nuevo
--
-- Añade también campos necesarios para integrar Stripe: customer_id,
-- billing_interval (monthly/yearly) y target_level para individuales.
-- =====================================================================

begin;

-- 1. Añadir 'individual' al enum academy_plan (para reutilizar tipo)
-- OJO: alter type add value NO se puede ejecutar dentro de una transacción.
-- Se ejecuta fuera del bloque, más abajo.

-- 2. Extender subscriptions
alter table subscriptions
  alter column academy_id drop not null;

-- Ya no es único academy_id porque puede ser NULL para individuales.
-- Añadimos índices únicos parciales en su lugar.
alter table subscriptions drop constraint if exists subscriptions_academy_id_key;

alter table subscriptions
  add column if not exists student_id uuid references profiles(id) on delete cascade,
  add column if not exists stripe_customer_id text,
  add column if not exists billing_interval text check (billing_interval in ('monthly', 'yearly')),
  add column if not exists plan_type text check (plan_type in ('academy', 'individual')) not null default 'academy',
  add column if not exists target_level cambridge_level,
  add column if not exists trial_ends_at timestamptz;

-- Restricción: cada suscripción es de academia O de alumno, no ambos
alter table subscriptions drop constraint if exists check_academy_or_student;
alter table subscriptions add constraint check_academy_or_student check (
  (plan_type = 'academy' and academy_id is not null and student_id is null) or
  (plan_type = 'individual' and student_id is not null and academy_id is null)
);

-- Índices únicos parciales para evitar duplicados
create unique index if not exists idx_subscriptions_academy_unique
  on subscriptions(academy_id) where academy_id is not null;
create unique index if not exists idx_subscriptions_student_unique
  on subscriptions(student_id) where student_id is not null;
create index if not exists idx_subscriptions_customer on subscriptions(stripe_customer_id);

-- 3. Añadir stripe_customer_id a academies (para portal de facturación)
alter table academies add column if not exists stripe_customer_id text;
create index if not exists idx_academies_stripe_customer on academies(stripe_customer_id);

-- 4. Los alumnos individuales tienen level (target_level) pero pueden no
-- estar en ninguna academia. Extendemos profiles para soportar esto.
-- La columna 'level' ya existe (se añadió en migration 001). Nos aseguramos.
alter table profiles add column if not exists stripe_customer_id text;
create index if not exists idx_profiles_stripe_customer on profiles(stripe_customer_id);

-- 5. RLS: alumnos individuales pueden ver su propia suscripción
drop policy if exists "individuals_read_own_subscription" on subscriptions;
create policy "individuals_read_own_subscription" on subscriptions
  for select using (student_id = auth.uid());

commit;

-- 6. Añadir 'individual' al enum academy_plan (fuera de transacción)
alter type academy_plan add value if not exists 'individual';

-- =====================================================================
-- Verificación
-- =====================================================================
-- select column_name, data_type, is_nullable
--   from information_schema.columns
--   where table_name = 'subscriptions'
--   order by ordinal_position;
-- =====================================================================
