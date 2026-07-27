-- =====================================================================
-- ACERTLIO — Migración 018: Reparación subscriptions individuales (C.6)
-- =====================================================================
-- Bug detectado en Bloque A:
--   El código de activateIndividualRegistrationAction escribía columnas
--   inexistentes (profile_id, plan_key) en la tabla subscriptions.
--   Como el error no se verificaba, la fila NO se creaba.
--
-- Este SQL:
--   1. Localiza los registros de individual_registrations completados
--      que NO tienen su fila de subscriptions correspondiente
--   2. Crea la fila faltante con los datos correctos
--
-- Es idempotente: solo crea las que faltan, no toca las existentes.
--
-- Después de aplicar este SQL + el fix de código, el flujo de
-- suscripciones individuales queda consistente.
-- =====================================================================

insert into subscriptions (
    stripe_subscription_id,
    stripe_customer_id,
    student_id,
    plan,
    plan_type,
    billing_interval,
    target_level,
    status,
    trial_ends_at,
    current_period_end,
    created_at,
    updated_at
)
select
    ir.stripe_subscription_id,
    ir.stripe_customer_id,
    ir.profile_id,
    'individual'::academy_plan,
    'individual',
    ir.billing_interval,
    ir.target_level::cambridge_level,
    'trialing'::subscription_status,
    p.trial_ends_at,
    p.trial_ends_at,
    ir.completed_at,
    now()
from individual_registrations ir
join profiles p on p.id = ir.profile_id
where ir.status = 'completed'
  and ir.stripe_subscription_id is not null
  and ir.profile_id is not null
  and not exists (
      select 1 from subscriptions s
      where s.stripe_subscription_id = ir.stripe_subscription_id
  );


-- =====================================================================
-- Verificación
-- =====================================================================
-- Debe haber tantas subscriptions con student_id como registrations
-- completadas con profile_id:
--
-- select count(*) from individual_registrations
--   where status = 'completed' and profile_id is not null;
--
-- select count(*) from subscriptions
--   where student_id is not null and plan_type = 'individual';
--
-- Ambas cifras deben coincidir tras aplicar este SQL.
-- =====================================================================
