/**
 * ActividadesNavLink
 *
 * Enlace a "Actividades" para los 4 roles de Acertlio.
 * Cada rol tiene un destino distinto adaptado a su contexto:
 *
 *   - student       → /alumno/actividades (su catálogo filtrado por nivel)
 *   - teacher       → /profesor/actividades (vista con filtros + asignar)
 *   - academy_admin → /academia/actividades (catálogo completo, puede ver uso)
 *   - super_admin   → /admin/actividades (catálogo completo + edición)
 *
 * Pega este componente donde tengas tu menú lateral/superior, y úsalo
 * así (ejemplo):
 *
 *   <ActividadesNavLink role={profile.role} />
 *
 * El componente devuelve `null` si el rol no está reconocido.
 *
 * NOTA: las rutas /profesor/actividades, /academia/actividades y
 * /admin/actividades NO existen aún. Si pulsas sin crearlas darán 404.
 * Las creas cuando toque; de momento basta con que el enlace aparezca
 * en el menú para que los directores lo vean durante la demo del
 * piloto. Al pulsar les mandamos de momento al mismo catálogo.
 *
 * Para no hacer eso: comenta las líneas marcadas con "// FALLBACK".
 */

import Link from "next/link";

type Role = "student" | "teacher" | "academy_admin" | "super_admin";

type Props = {
  role: Role | string | null | undefined;
  /** Clases Tailwind extra (depende del estilo de tu menú) */
  className?: string;
  /** Pintar también el icono */
  showIcon?: boolean;
  /** Si el menú está colapsado (icono solo) */
  iconOnly?: boolean;
};

const DESTINATIONS: Record<Role, string> = {
  student: "/alumno/actividades",
  teacher: "/profesor/actividades",
  academy_admin: "/academia/actividades",
  super_admin: "/admin/actividades",
};

// FALLBACK: mientras las rutas de teacher/admin no existan, apuntamos todas al catálogo del alumno.
// Comenta este objeto cuando crees las rutas específicas.
const FALLBACK_DESTINATIONS: Record<Role, string> = {
  student: "/alumno/actividades",
  teacher: "/alumno/actividades",
  academy_admin: "/alumno/actividades",
  super_admin: "/alumno/actividades",
};

export function ActividadesNavLink({
  role,
  className = "",
  showIcon = true,
  iconOnly = false,
}: Props) {
  if (!role || !(role in DESTINATIONS)) return null;

  // Para arrancar, usa FALLBACK_DESTINATIONS. Cambia a DESTINATIONS cuando crees las rutas.
  const href = FALLBACK_DESTINATIONS[role as Role];

  return (
    <Link
      href={href}
      className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition hover:bg-paper hover:text-navy ${className}`}
      title="Actividades preparatorias"
    >
      {showIcon && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 flex-shrink-0"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
            clipRule="evenodd"
          />
        </svg>
      )}
      {!iconOnly && <span>Actividades</span>}
    </Link>
  );
}
