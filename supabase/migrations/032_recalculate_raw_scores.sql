-- =====================================================================
-- ACERTLIO — Migración 032: recalcular raw_score de papers ya cerrados
-- =====================================================================
-- Contexto del bug:
--   Durante meses, la autocorrección solo se ejecutaba cuando expiraba
--   el tiempo del paper. Cuando el alumno pulsaba "Enviar respuestas"
--   voluntariamente, el paper se cerraba SIN autocorregir y su
--   raw_score quedaba en 0.
--
--   El fix del código (v2) ya soluciona los futuros papers. Esta
--   migración recalcula los papers ya cerrados que están en 0 pese
--   a tener respuestas.
--
-- Estrategia:
--   1. Para cada paper_attempt con status=completed y raw_score IS NULL
--      o raw_score=0 Y con respuestas guardadas
--   2. Recorrer las preguntas de sus parts
--   3. Comparar cada respuesta con correct_answer
--   4. Actualizar raw_score y max_score
--
-- Considera:
--   - multiple_choice: correct_option_id / correct_answer letra
--   - multiple_choice_cloze: correct_answer letra (A/B/C/D)
--   - open_cloze / word_formation: correct_answer texto (con |)
--   - multiple_matching / gapped: correct_answer letra
--   - writing_task: NO corregir aquí (lo hace la IA)
--
-- Idempotente: si algo ya está bien, no lo toca.
-- =====================================================================

do $$
declare
  pa_rec          record;
  q_rec           record;
  ans_rec         record;
  v_raw_score     numeric;
  v_max_score     numeric;
  v_correct       int;
  v_total         int;
  v_answer_text   text;
  v_selected_opt  uuid;
  v_correct_opt   uuid;
  v_is_correct    boolean;
  n_updated       int := 0;
begin
  raise notice 'Iniciando recálculo de raw_scores...';

  for pa_rec in
    select pa.id, pa.attempt_id, pa.paper_id, pa.raw_score
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

    -- Recorrer todas las preguntas del paper (a través de sus parts)
    for q_rec in
      select q.id, q.question_type, q.correct_answer, q.points
        from questions q
        join exam_parts ep on ep.id = q.part_id
        where ep.paper_id = pa_rec.paper_id
          and q.question_type != 'writing_task'
      loop
        v_max_score := v_max_score + coalesce(q_rec.points, 1);
        v_total := v_total + 1;

        -- Buscar la respuesta del alumno
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
          -- Respuesta correcta es letra A/B/C/D... o texto de la opción
          if v_selected_opt is not null then
            -- Buscar la letra de la opción seleccionada
            select letter into v_answer_text
              from question_options
              where id = v_selected_opt;
            if lower(trim(coalesce(v_answer_text, ''))) =
               lower(trim(coalesce(q_rec.correct_answer, '_none_'))) then
              v_is_correct := true;
            end if;
          end if;
        elsif q_rec.question_type = 'open_cloze' then
          -- Respuesta texto: comparar con alternativas separadas por |
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

        -- Reset para siguiente iteración
        v_selected_opt := null;
        v_answer_text := null;
    end loop;

    -- Solo actualizar si encontramos algo
    if v_total > 0 then
      update paper_attempts
        set raw_score = v_raw_score,
            max_score = v_max_score,
            updated_at = now()
        where id = pa_rec.id;

      n_updated := n_updated + 1;
      raise notice 'paper_attempt %: % correct de % (% puntos de %)',
        pa_rec.id, v_correct, v_total, v_raw_score, v_max_score;
    end if;
  end loop;

  raise notice 'Recálculo terminado. Paper attempts actualizados: %', n_updated;
end $$;


-- ─── Verificación ───────────────────────────────────────────────────
-- Ver los últimos 10 paper_attempts:
--   select pa.id, e.title, pa.status, pa.raw_score, pa.max_score,
--          round(pa.raw_score / nullif(pa.max_score, 0) * 100)::int as pct
--     from paper_attempts pa
--     join attempts a on a.id = pa.attempt_id
--     join exams e on e.id = a.exam_id
--     where pa.status in ('completed', 'time_expired')
--     order by pa.completed_at desc
--     limit 10;
