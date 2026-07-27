"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { AlertCircle, Loader2, ArrowRight, Lock, Eye, EyeOff } from "lucide-react";
import {
  startIndividualRegistrationAction,
  type IndividualRegistrationResult,
} from "@/app/individual/empezar/actions";

interface Props {
  defaultInterval: "monthly" | "yearly";
  monthlyPrice: string; // "14,95€"
  yearlyPrice: string;
  yearlyMonthlyEquivalent: string; // "12,45€/mes"
}

const REFERRAL_OPTIONS = [
  { value: "google", label: "Google" },
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "friend", label: "Un amigo o familiar" },
  { value: "academy", label: "Mi academia" },
  { value: "other", label: "Otro" },
] as const;

const LEVEL_OPTIONS = [
  { value: "A2", label: "A2 Key (KET)", description: "Nivel principiante" },
  { value: "B1", label: "B1 Preliminary (PET)", description: "Nivel intermedio" },
  { value: "B2", label: "B2 First (FCE)", description: "Nivel intermedio alto" },
  { value: "C1", label: "C1 Advanced (CAE)", description: "Nivel avanzado" },
  { value: "C2", label: "C2 Proficiency (CPE)", description: "Nivel dominio" },
];

const initialState: IndividualRegistrationResult = {
  error: null,
};

export function IndividualRegistrationForm({
  defaultInterval,
  monthlyPrice,
  yearlyPrice,
  yearlyMonthlyEquivalent,
}: Props) {
  const [state, formAction] = useFormState(
    startIndividualRegistrationAction,
    initialState
  );

  const [interval, setInterval] = useState<"monthly" | "yearly">(defaultInterval);
  const [referralSource, setReferralSource] = useState<string>("");
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const err = state.fieldErrors ?? {};
  const passwordsDontMatch =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    password !== confirmPassword;

  return (
    <form
      action={(fd) => {
        setPending(true);
        return formAction(fd);
      }}
      className="space-y-6"
    >
      {/* 1. Nombre */}
      <div>
        <label className="text-xs uppercase tracking-wider text-navy font-medium mb-2 block">
          1. ¿Cómo te llamas?
        </label>
        <input
          type="text"
          name="full_name"
          required
          placeholder="Nombre y apellidos"
          className={`w-full rounded border ${
            err.full_name ? "border-error" : "border-rule"
          } bg-white text-sm text-ink px-3 py-2.5 focus:outline-none focus:border-navy transition-colors`}
        />
        {err.full_name && (
          <p className="text-xs text-error mt-1">{err.full_name}</p>
        )}
      </div>

      {/* 2. Email */}
      <div>
        <label className="text-xs uppercase tracking-wider text-navy font-medium mb-2 block">
          2. Tu email
        </label>
        <input
          type="email"
          name="email"
          required
          placeholder="tu@email.com"
          className={`w-full rounded border ${
            err.email ? "border-error" : "border-rule"
          } bg-white text-sm text-ink px-3 py-2.5 focus:outline-none focus:border-navy transition-colors`}
        />
        <p className="text-xs text-muted mt-1">
          Con este email accederás a tu cuenta.
        </p>
        {err.email && <p className="text-xs text-error mt-1">{err.email}</p>}
      </div>

      {/* 3. Contraseña */}
      <div>
        <label className="text-xs uppercase tracking-wider text-navy font-medium mb-2 block">
          3. Elige una contraseña
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            className={`w-full rounded border ${
              err.password ? "border-error" : "border-rule"
            } bg-white text-sm text-ink px-3 py-2.5 pr-10 focus:outline-none focus:border-navy transition-colors`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-ink p-1"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {err.password && (
          <p className="text-xs text-error mt-1">{err.password}</p>
        )}
      </div>

      {/* 4. Confirmar contraseña */}
      <div>
        <label className="text-xs uppercase tracking-wider text-navy font-medium mb-2 block">
          4. Confirma tu contraseña
        </label>
        <input
          type={showPassword ? "text" : "password"}
          name="password_confirm"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Repite la contraseña"
          autoComplete="new-password"
          className={`w-full rounded border ${
            passwordsDontMatch || err.password_confirm
              ? "border-error"
              : "border-rule"
          } bg-white text-sm text-ink px-3 py-2.5 focus:outline-none focus:border-navy transition-colors`}
        />
        {passwordsDontMatch && (
          <p className="text-xs text-error mt-1">
            Las contraseñas no coinciden.
          </p>
        )}
        {err.password_confirm && !passwordsDontMatch && (
          <p className="text-xs text-error mt-1">{err.password_confirm}</p>
        )}
      </div>

      {/* 5. Nivel */}
      <div>
        <label className="text-xs uppercase tracking-wider text-navy font-medium mb-2 block">
          5. ¿Qué nivel quieres preparar?
        </label>
        <select
          name="target_level"
          required
          defaultValue=""
          className={`w-full rounded border ${
            err.target_level ? "border-error" : "border-rule"
          } bg-white text-sm text-ink px-3 py-2.5 focus:outline-none focus:border-navy transition-colors`}
        >
          <option value="" disabled>
            — Elige tu nivel —
          </option>
          {LEVEL_OPTIONS.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label} · {l.description}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted mt-1">
          Solo verás simulacros de este nivel. Podrás cambiar de nivel
          cancelando y volviendo a suscribirte.
        </p>
        {err.target_level && (
          <p className="text-xs text-error mt-1">{err.target_level}</p>
        )}
      </div>

      {/* 6. Cómo nos conociste */}
      <div>
        <label className="text-xs uppercase tracking-wider text-navy font-medium mb-2 block">
          6. ¿Cómo nos has conocido?
        </label>
        <select
          name="referral_source"
          required
          value={referralSource}
          onChange={(e) => setReferralSource(e.target.value)}
          className={`w-full rounded border ${
            err.referral_source ? "border-error" : "border-rule"
          } bg-white text-sm text-ink px-3 py-2.5 focus:outline-none focus:border-navy transition-colors`}
        >
          <option value="" disabled>
            — Elige una opción —
          </option>
          {REFERRAL_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
        {err.referral_source && (
          <p className="text-xs text-error mt-1">{err.referral_source}</p>
        )}

        {referralSource === "other" && (
          <div className="mt-3">
            <input
              type="text"
              name="referral_other"
              placeholder="Cuéntanos brevemente"
              maxLength={200}
              className={`w-full rounded border ${
                err.referral_other ? "border-error" : "border-rule"
              } bg-white text-sm text-ink px-3 py-2.5 focus:outline-none focus:border-navy transition-colors`}
            />
            {err.referral_other && (
              <p className="text-xs text-error mt-1">{err.referral_other}</p>
            )}
          </div>
        )}
      </div>

      {/* 7. Facturación */}
      <div>
        <label className="text-xs uppercase tracking-wider text-navy font-medium mb-2 block">
          7. Facturación
        </label>
        <input type="hidden" name="interval" value={interval} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setInterval("monthly")}
            className={`text-left p-4 rounded border-2 transition-colors ${
              interval === "monthly"
                ? "border-navy bg-navy/5"
                : "border-rule bg-white hover:border-navy/40"
            }`}
          >
            <p className="text-xs uppercase tracking-wider text-muted font-medium">
              Mensual
            </p>
            <p className="text-2xl font-bold text-ink mt-1 tabular-nums">
              {monthlyPrice}
            </p>
            <p className="text-xs text-muted mt-0.5">al mes</p>
          </button>
          <button
            type="button"
            onClick={() => setInterval("yearly")}
            className={`text-left p-4 rounded border-2 transition-colors relative ${
              interval === "yearly"
                ? "border-navy bg-navy/5"
                : "border-rule bg-white hover:border-navy/40"
            }`}
          >
            <span className="absolute top-2 right-2 text-[10px] uppercase tracking-wider font-semibold text-saffron bg-saffron/10 px-2 py-0.5 rounded">
              -2 meses
            </span>
            <p className="text-xs uppercase tracking-wider text-muted font-medium">
              Anual
            </p>
            <p className="text-2xl font-bold text-ink mt-1 tabular-nums">
              {yearlyPrice}
            </p>
            <p className="text-xs text-muted mt-0.5">
              {yearlyMonthlyEquivalent}
            </p>
          </button>
        </div>
      </div>

      {/* Error general */}
      {state.error && !state.fieldErrors && (
        <div className="rounded border border-error/40 bg-error/10 p-3 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-error flex-shrink-0 mt-0.5" />
          <p className="text-sm text-error">{state.error}</p>
        </div>
      )}
      {state.error && state.fieldErrors && (
        <div className="rounded border border-saffron/40 bg-saffron/10 p-3 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-saffron flex-shrink-0 mt-0.5" />
          <p className="text-sm text-ink">{state.error}</p>
        </div>
      )}

      {/* Info trial */}
      <div className="rounded bg-paper border border-rule p-4 space-y-2">
        <p className="text-sm text-ink font-medium">
          Empezarás con 7 días de prueba
        </p>
        <ul className="text-xs text-muted space-y-1 list-disc pl-4">
          <li>Puedes hacer hasta 3 simulacros durante el trial.</li>
          <li>No se te cobrará hasta que acaben los 7 días.</li>
          <li>Puedes cancelar en cualquier momento desde tu panel.</li>
        </ul>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={
          pending ||
          passwordsDontMatch ||
          password.length < 8 ||
          confirmPassword.length < 8
        }
        className="w-full inline-flex items-center justify-center gap-2 rounded bg-navy px-6 py-3.5 text-sm font-semibold text-white hover:bg-navy/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Redirigiendo a pago seguro…
          </>
        ) : (
          <>
            <Lock className="h-4 w-4" />
            Continuar al pago seguro
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>

      <p className="text-xs text-muted text-center leading-relaxed">
        El pago lo procesa Stripe. Acertlio no ve ni almacena datos de tu
        tarjeta. Al continuar aceptas nuestros términos y política de
        privacidad.
      </p>
    </form>
  );
}
