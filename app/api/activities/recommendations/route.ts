/**
 * GET /api/activities/recommendations
 *
 * CORREGIDO: lee current_level de profiles.
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

  const sp = req.nextUrl.searchParams;
  const limit = Math.min(Number(sp.get("limit") ?? 3), 10);
  let level = sp.get("level");

  if (!level) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    level =
      profile?.current_level ??
      profile?.cambridge_level ??
      profile?.english_level ??
      profile?.level ??
      null;
  }

  if (!level) {
    return NextResponse.json({ recommendations: [], message: "Sin nivel" });
  }

  const weakPartSlug = sp.get("weak_part_slug");
  const weakPartId = sp.get("weak_part_id");

  if (weakPartSlug || weakPartId) {
    let examPartId: number | null = null;

    if (weakPartId) {
      examPartId = Number(weakPartId);
    } else if (weakPartSlug) {
      const { data: part } = await supabase
        .from("exam_part_catalog")
        .select("id")
        .eq("slug", weakPartSlug)
        .maybeSingle();
      examPartId = part?.id ?? null;
    }

    if (!examPartId) {
      return NextResponse.json({
        recommendations: [],
        message: "Parte no encontrada",
      });
    }

    const { data: part } = await supabase
      .from("exam_part_catalog")
      .select("name, slug")
      .eq("id", examPartId)
      .maybeSingle();

    const { data: activities } = await supabase
      .from("activities")
      .select(`
        id, level, skill, activity_number, title, description,
        estimated_minutes, difficulty,
        exam_part:exam_part_catalog(id, slug, name, part_number)
      `)
      .eq("is_published", true)
      .eq("level", level)
      .eq("exam_part_id", examPartId)
      .order("activity_number", { ascending: true })
      .limit(limit);

    const reason = part
      ? `Practica la parte donde más fallaste: ${part.name}`
      : "Actividad recomendada para mejorar tu puntuación";

    return NextResponse.json({
      source: "post_mock_weak_part",
      weak_part_slug: weakPartSlug,
      recommendations: (activities ?? []).map((a: any) => ({
        ...a,
        recommendation_reason: reason,
      })),
    });
  }

  const { data: completedAttempts } = await supabase
    .from("activity_attempts")
    .select("activity_id")
    .eq("user_id", user.id)
    .eq("is_complete", true);

  const doneIds = new Set((completedAttempts ?? []).map((a: any) => a.activity_id));

  const { data: all } = await supabase
    .from("activities")
    .select(`
      id, level, skill, activity_number, title, description,
      estimated_minutes, difficulty,
      exam_part:exam_part_catalog(id, slug, name, part_number)
    `)
    .eq("is_published", true)
    .eq("level", level)
    .order("created_at", { ascending: false });

  const pending = (all ?? []).filter((a: any) => !doneIds.has(a.id)).slice(0, limit);

  return NextResponse.json({
    source: "catalog_undone",
    recommendations: pending.map((a: any) => ({
      ...a,
      recommendation_reason: "Actividad nueva que aún no has hecho",
    })),
  });
}
