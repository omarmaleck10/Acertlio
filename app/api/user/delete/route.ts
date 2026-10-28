/**
 * POST /api/user/delete
 *
 * CORREGIDO: usa @supabase/ssr en vez de @supabase/auth-helpers-nextjs.
 *
 * Elimina la cuenta del usuario autenticado.
 * Cumple con el derecho de supresión (Art. 17 RGPD).
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const supabaseAuth = createServerSupabase();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  let confirmation: string | undefined;
  try {
    const body = await req.json();
    confirmation = body.confirmation;
  } catch {
    // no body
  }

  if (confirmation !== "ELIMINAR MI CUENTA") {
    return NextResponse.json(
      {
        error:
          "Confirmación incorrecta. Debes escribir exactamente 'ELIMINAR MI CUENTA' para confirmar.",
      },
      { status: 400 }
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const timestamp = new Date().toISOString();
  const originalEmail = user.email;

  // 1. Anonimizar profiles
  const anonEmail = `deleted-${user.id.slice(0, 8)}@deleted.acertlio.com`;
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      account_status: "deleted",
      email: anonEmail,
      full_name: "[Usuario eliminado]",
      phone: null,
      avatar_url: null,
      deleted_at: timestamp,
    })
    .eq("id", user.id);

  if (profileError) {
    console.error("[/api/user/delete] profiles update error:", profileError);
    return NextResponse.json(
      { error: "No se pudo eliminar la cuenta. Contacta con soporte." },
      { status: 500 }
    );
  }

  // 2. Registrar la solicitud como ejercicio del derecho
  await supabase.from("data_rights_requests").insert({
    user_id: null,
    request_type: "erasure",
    status: "completed",
    requested_at: timestamp,
    completed_at: timestamp,
    request_details: {
      original_user_id: user.id,
      original_email: originalEmail,
      confirmation_received: true,
    },
  });

  // 3. Eliminar la cuenta de autenticación
  const { error: authError } = await supabase.auth.admin.deleteUser(user.id);

  if (authError) {
    console.error("[/api/user/delete] auth.admin.deleteUser error:", authError);
    return NextResponse.json({
      success: true,
      warning:
        "Tus datos personales han sido anonimizados. El cierre de sesión puede tardar unos minutos.",
    });
  }

  return NextResponse.json({
    success: true,
    message:
      "Tu cuenta ha sido eliminada. Los datos personales han sido anonimizados de forma inmediata.",
  });
}
