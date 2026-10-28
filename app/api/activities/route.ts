/**
 * GET /api/activities
 *
 * CORREGIDO: lee current_level de profiles (que es la columna real de Acertlio),
 * con fallback a cambridge_level, english_level o level por si cambia.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  const supabaseAuth = createServerSupabase();
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

  const urlLevel = req.nextUrl.searchParams.get("level");
  const urlSkill = req.nextUrl.searchParams.get("skill");
  const urlPartSlug = req.nextUrl.searchParams.get("part");

  let level = urlLevel;
  if (!level) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    // Buscamos la columna de nivel en varios nombres posibles.
    // En Acertlio es current_level.
    level =
      profile?.current_level ??
      profile?.cambridge_level ??
      profile?.english_level ??
      profile?.level ??
      null;
  }

  if (!level) {
    return NextResponse.json({
      activities: [],
      message:
        "Añade tu nivel Cambridge a tu perfil para ver actividades recomendadas.",
    });
  }

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

  const filtered = urlPartSlug
    ? (activities ?? []).filter(
        (a: any) => a.exam_part?.slug === urlPartSlug
      )
    : activities ?? [];

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
