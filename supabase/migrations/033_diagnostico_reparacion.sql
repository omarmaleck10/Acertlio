-- =====================================================================
-- ACERTLIO — Migración 033: diagnóstico + reparación forzada
-- =====================================================================
-- Este script hace 3 cosas:
--   1. Muestra el estado actual de teacher_students, grupos y
--      miembros (queda en los logs de SQL Editor de Supabase)
--   2. Fuerza el backfill de teacher_students otra vez, por si el
--      script 031 no llegó a ejecutarse correctamente
--   3. Recalcula raw_scores de nuevo por si faltó alguno
--
-- Ejecutable múltiples veces sin problema (idempotente).
-- =====================================================================


-- ─── 1. DIAGNÓSTICO ────────────────────────────────────────────────

do $$
declare
  n_teachers int;
  n_groups int;
  n_members int;
  n_teacher_students int;
  n_papers_zero int;
begin
  select count(*) into n_teachers from profiles where role = 'teacher';
  select count(*) into n_groups from student_groups;
  select count(*) into n_members from student_group_members;
  select count(*) into n_teacher_students from teacher_students;
  select count(*) into n_papers_zero
    from paper_attempts pa
    where pa.status in ('completed', 'time_expired')
      and coalesce(pa.raw_score, 0) = 0
      and exists (
        select 1 from answers a
          where a.paper_attempt_id = pa.id
            and (a.selected_option_id is not null or a.answer_text is not null)
      );

  raise notice '===== DIAGNÓSTICO ACERTLIO =====';
  raise notice 'Profesores en el sistema: %', n_teachers;
  raise notice 'Grupos creados: %', n_groups;
  raise notice 'Miembros de grupos: %', n_members;
  raise notice 'Filas teacher_students: %', n_teacher_students;
  raise notice 'Papers con nota 0 pero con respuestas: %', n_papers_zero;
  raise notice '=================================';
end $$;


-- ─── 2. FORZAR BACKFILL DE teacher_students ─────────────────────────
-- Aunque el 031 ya se ejecutó, corremos otra vez por si algo faltó.

insert into teacher_students (teacher_id, student_id, academy_id)
select distinct
    sg.teacher_id,
    sgm.student_id,
    sg.academy_id
  from student_group_members sgm
  join student_groups sg on sg.id = sgm.group_id
  where sg.teacher_id is not null
on conflict (teacher_id, student_id) do nothing;


-- Ver qué profesores tienen alumnos ahora
do $$
declare
  r record;
begin
  raise notice '===== ALUMNOS POR PROFESOR (tras backfill) =====';
  for r in
    select
        p.id as teacher_id,
        p.email as teacher_email,
        coalesce(p.full_name, p.email) as teacher_name,
        count(distinct ts.student_id) as num_students
      from profiles p
      left join teacher_students ts on ts.teacher_id = p.id
      where p.role = 'teacher'
      group by p.id, p.email, p.full_name
      order by count(distinct ts.student_id) desc, teacher_email
      limit 20
  loop
    raise notice 'Profesor: % (%) → % alumnos',
      r.teacher_name, r.teacher_email, r.num_students;
  end loop;
  raise notice '=================================================';
end $$;


-- ─── 3. RE-EJECUTAR RECÁLCULO DE raw_score ──────────────────────────
-- (por si el 032 no llegó a completar todos)

do $$
declare
  pa_rec          record;
  q_rec           record;
  v_raw_score     numeric;
  v_max_score     numeric;
  v_correct       int;
  v_total         int;
  v_answer_text   text;
  v_selected_opt  uuid;
  v_letter        text;
  v_is_correct    boolean;
  n_updated       int := 0;
begin
  raise notice '===== RECÁLCULO raw_scores =====';

  for pa_rec in
    select pa.id, pa.attempt_id, pa.paper_id
      from paper_attempts pa
      where pa.status in ('completed', 'time_expired')
        and coalesce(pa.raw_score, 0) = 0
        and exists (
          select 1 from answers a
            where a.paper_attempt_id = pa.id
              and (a.selected_option_id is not null or a.answer_text is not null)
        )
  loop
    v_raw_score := 0;
    v_max_score := 0;
    v_correct := 0;
    v_total := 0;

    for q_rec in
      select q.id, q.question_type, q.correct_answer, q.points
        from questions q
        join exam_parts ep on ep.id = q.part_id
        where ep.paper_id = pa_rec.paper_id
          and q.question_type != 'writing_task'
      loop
        v_max_score := v_max_score + coalesce(q_rec.points, 1);
        v_total := v_total + 1;

        select selected_option_id, answer_text
          into v_selected_opt, v_answer_text
          from answers
          where paper_attempt_id = pa_rec.id
            and question_id = q_rec.id
          limit 1;

        v_is_correct := false;

        if q_rec.question_type in (
          'multiple_choice',
          'multiple_choice_cloze',
          'multiple_matching'
        ) then
          if v_selected_opt is not null then
            select letter into v_letter
              from question_options
              where id = v_selected_opt;
            if lower(trim(coalesce(v_letter, ''))) =
               lower(trim(coalesce(q_rec.correct_answer, '_none_'))) then
              v_is_correct := true;
            end if;
          end if;
        elsif q_rec.question_type = 'open_cloze' then
          if v_answer_text is not null and q_rec.correct_answer is not null then
            v_is_correct := lower(trim(v_answer_text)) = any(
              string_to_array(lower(trim(q_rec.correct_answer)), '|')
            );
          end if;
        end if;

        if v_is_correct then
          v_correct := v_correct + 1;
          v_raw_score := v_raw_score + coalesce(q_rec.points, 1);
        end if;

        v_selected_opt := null;
        v_answer_text := null;
        v_letter := null;
    end loop;

    if v_total > 0 then
      update paper_attempts
        set raw_score = v_raw_score,
            max_score = v_max_score,
            updated_at = now()
        where id = pa_rec.id;
      n_updated := n_updated + 1;
    end if;
  end loop;

  raise notice 'Paper attempts recalculados: %', n_updated;
  raise notice '=================================';
end $$;


-- ─── 4. Verificación final ──────────────────────────────────────────
-- Query manual para el usuario:
--
--   SELECT
--     pa.id,
--     e.title,
--     pa.status,
--     pa.raw_score,
--     pa.max_score,
--     round(pa.raw_score / nullif(pa.max_score, 0) * 100)::int as pct
--   FROM paper_attempts pa
--   JOIN attempts a ON a.id = pa.attempt_id
--   JOIN exams e ON e.id = a.exam_id
--   WHERE pa.status IN ('completed', 'time_expired')
--   ORDER BY pa.completed_at DESC
--   LIMIT 10;
--
-- Debería mostrar las notas correctas.
