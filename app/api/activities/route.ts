/**
 * GET /api/activities
 *
 * Lista actividades publicadas, filtradas según el nivel del alumno
 * (si está autenticado y tiene `english_level` o `cambridge_level` en su perfil).
 *
 * Query params:
 *   - level: fuerza un nivel específico (ignora el del perfil)
 *   - skill: filtra por skill (reading, use_of_english, etc.)
 *   - part: filtra por parte (slug, ej: 'b2-uoe-part-4')
 */

import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  const supabaseAuth = createRouteHandlerClient({ cookies });
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Resolver el nivel del alumno desde su perfil o desde query
  const urlLevel = req.nextUrl.searchParams.get("level");
  const urlSkill = req.nextUrl.searchParams.get("skill");
  const urlPartSlug = req.nextUrl.searchParams.get("part");

  let level = urlLevel;
  if (!level) {
    // Intentar leer del perfil del alumno. El campo puede llamarse de varias formas
    // según el schema. Probamos varias opciones comunes.
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    level =
      profile?.cambridge_level ??
      profile?.english_level ??
      profile?.level ??
      null;
  }

  // Si no hay nivel declarado, devolver vacío con una pista
  if (!level) {
    return NextResponse.json({
      activities: [],
      message:
        "Añade tu nivel Cambridge a tu perfil para ver actividades recomendadas, o pasa ?level=B2 en la URL.",
    });
  }

  // Construir query
  let query = supabase
    .from("activities")
    .select(`
      id, level, skill, exam_part_id, activity_number, title, description,
      estimated_minutes, difficulty, is_published, created_at,
      exam_part:exam_part_catalog!inner(
        id, slug, name, part_number, skill, level, display_order
      )
    `)
    .eq("is_published", true)
    .eq("level", level)
    .order("activity_number", { ascending: true });

  if (urlSkill) {
    query = query.eq("skill", urlSkill);
  }

  const { data: activities, error } = await query;

  if (error) {
    console.error("[/api/activities] error:", error);
    return NextResponse.json(
      { error: "No se pudieron cargar las actividades" },
      { status: 500 }
    );
  }

  // Filtrar por parte si viene por slug
  const filtered = urlPartSlug
    ? (activities ?? []).filter(
        (a: any) => a.exam_part?.slug === urlPartSlug
      )
    : activities ?? [];

  // Añadir si el alumno ya la hizo (último intento completo)
  const { data: completedAttempts } = await supabase
    .from("activity_attempts")
    .select("activity_id, score, total_questions, submitted_at")
    .eq("user_id", user.id)
    .eq("is_complete", true)
    .order("submitted_at", { ascending: false });

  const lastByActivity: Record<string, { score: number; total: number; submitted_at: string }> = {};
  (completedAttempts ?? []).forEach((a: any) => {
    if (!lastByActivity[a.activity_id]) {
      lastByActivity[a.activity_id] = {
        score: a.score,
        total: a.total_questions,
        submitted_at: a.submitted_at,
      };
    }
  });

  const enriched = filtered.map((a: any) => ({
    ...a,
    last_attempt: lastByActivity[a.id] ?? null,
  }));

  return NextResponse.json({
    level,
    activities: enriched,
  });
}
