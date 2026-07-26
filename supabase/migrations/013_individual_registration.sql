-- =====================================================================
-- ACERTLIO — Migración 013: Sistema de registro individual (Bloque A)
-- =====================================================================
-- Añade:
--   1. Tabla individual_registrations (guarda datos comerciales del
--      alumno individual ANTES de que pague — así conservamos "cómo nos
--      conoció" aunque abandone el checkout de Stripe).
--
--   2. Columna is_individual en profiles (para distinguir alumnos
--      individuales de los de academia).
--
--   3. Columna trial_mocks_used en profiles (contador para aplicar el
--      cap de 3 mocks durante el trial).
--
--   4. Columna trial_ends_at en profiles (facilita saber si el trial
--      sigue vigente sin consultar a Stripe).
--
-- Nota sobre el diseño:
--   El registro va PRIMERO en individual_registrations (sin usuario
--   auth). Al confirmarse el pago vía webhook Stripe, creamos el
--   auth.user y el profile a partir del registration.
-- =====================================================================


-- ─── 1. Tabla individual_registrations ─────────────────────────────
create table if not exists individual_registrations (
    id                    uuid primary key default gen_random_uuid(),
    email                 text not null,
    full_name             text not null,
    target_level          text not null,   -- 'A2', 'B1', 'B2', 'C1', 'C2'
    referral_source       text not null,   -- 'google', 'instagram', 'tiktok', 'friend', 'academy', 'other'
    referral_other        text,            -- texto libre si referral_source='other'
    billing_interval      text not null,   -- 'monthly' | 'yearly'

    -- Stripe
    stripe_customer_id    text,
    stripe_session_id     text,
    stripe_subscription_id text,

    -- Estado
    status                text not null default 'pending',
    -- 'pending'         → formulario enviado, aún no ha ido a Stripe
    -- 'checkout_started' → redirigido a Stripe checkout
    -- 'completed'       → pago confirmado, usuario creado
    -- 'abandoned'       → sin actividad tras X días

    -- Post-completion
    profile_id            uuid references profiles(id) on delete set null,
    completed_at          timestamptz,

    created_at            timestamptz not null default now(),
    updated_at            timestamptz not null default now(),

    constraint ir_level_check check (target_level in ('A2', 'B1', 'B2', 'C1', 'C2')),
    constraint ir_source_check check (referral_source in ('google', 'instagram', 'tiktok', 'friend', 'academy', 'other')),
    constraint ir_interval_check check (billing_interval in ('monthly', 'yearly')),
    constraint ir_status_check check (status in ('pending', 'checkout_started', 'completed', 'abandoned'))
);

create index if not exists idx_ir_email on individual_registrations(email);
create index if not exists idx_ir_status on individual_registrations(status);
create index if not exists idx_ir_stripe_session on individual_registrations(stripe_session_id);
create index if not exists idx_ir_created on individual_registrations(created_at desc);


-- ─── 2. Añadir columnas a profiles ─────────────────────────────────
alter table profiles
    add column if not exists is_individual boolean not null default false;

alter table profiles
    add column if not exists trial_mocks_used integer not null default 0;

alter table profiles
    add column if not exists trial_ends_at timestamptz;

alter table profiles
    add column if not exists referral_source text;


-- ─── 3. RLS individual_registrations ───────────────────────────────
-- Solo super_admin ve las registrations (datos comerciales).
-- El propio usuario podría verlas, pero como no tiene profile aún
-- durante el proceso, no aplica.
alter table individual_registrations enable row level security;

drop policy if exists "sel_ir" on individual_registrations;
create policy "sel_ir" on individual_registrations for select
    using (is_super_admin());

-- Insert lo hace el server action con service role key (bypasses RLS)
drop policy if exists "ins_ir" on individual_registrations;
create policy "ins_ir" on individual_registrations for insert
    with check (is_super_admin());

drop policy if exists "upd_ir" on individual_registrations;
create policy "upd_ir" on individual_registrations for update
    using (is_super_admin());


-- =====================================================================
-- Verificación
-- =====================================================================
-- select count(*) from individual_registrations;
-- → 0
--
-- select column_name, data_type from information_schema.columns
--   where table_name = 'profiles'
--     and column_name in ('is_individual', 'trial_mocks_used', 'trial_ends_at', 'referral_source');
-- → 4 filas
-- =====================================================================
