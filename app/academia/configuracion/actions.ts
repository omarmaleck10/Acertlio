"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type UpdateAcademyResult = {
  error: string | null;
  success: string | null;
};

/**
 * Actualiza los datos generales de una academia.
 * Solo puede hacerlo el academy_admin de esa academia.
 */
export async function updateAcademyAction(
  _prev: UpdateAcademyResult,
  formData: FormData
): Promise<UpdateAcademyResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado.", success: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, academy_id")
    .eq("id", user.id)
    .maybeSingle();

  if (
    !profile ||
    !profile.academy_id ||
    !["academy_admin", "super_admin"].includes(profile.role)
  ) {
    return { error: "No tienes permiso para editar la academia.", success: null };
  }

  const name = String(formData.get("name") ?? "").trim();
  const cif = String(formData.get("cif") ?? "").trim() || null;
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const address = String(formData.get("address") ?? "").trim() || null;
  const city = String(formData.get("city") ?? "").trim() || null;

  if (!name || name.length < 3) {
    return { error: "El nombre de la academia es obligatorio.", success: null };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("academies")
    .update({ name, cif, phone, address, city })
    .eq("id", profile.academy_id);

  if (error) {
    return { error: `No se pudo guardar: ${error.message}`, success: null };
  }

  revalidatePath("/academia");
  revalidatePath("/academia/configuracion");

  return { error: null, success: "Datos guardados." };
}
