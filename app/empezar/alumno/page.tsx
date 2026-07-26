import { redirect } from "next/navigation";

/**
 * Ruta legacy — redirige al nuevo flujo de registro individual.
 *
 * Antes esta era la pantalla "estamos preparando el acceso individual".
 * Ahora el registro individual sí funciona (Bloque A), así que
 * cualquier enlace que apunte aquí va al flujo real.
 */
export default function EmpezarAlumnoLegacyRedirect() {
  redirect("/individual/empezar");
}
