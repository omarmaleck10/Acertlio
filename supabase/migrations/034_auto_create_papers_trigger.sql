-- =====================================================================
-- ACERTLIO — Migración 034: auto-crear papers para nuevos mocks
-- =====================================================================
-- Problema recurrente: cada vez que se añade un mock nuevo (C1-04,
-- C2-02, etc.), hay que ejecutar manualmente la migración 025 para
-- crear sus exam_papers. Si no, el alumno ve un 404 al abrirlo.
--
-- Esta migración:
--   1. Encapsula la lógica de creación de papers en una función
--      SQL reutilizable.
--   2. Instala un trigger AFTER INSERT ON exams que la ejecuta
--      automáticamente para cualquier examen publicado.
--   3. Repara los exámenes actuales sin papers (redundante con 025
--      pero idempotente — no rompe nada si 025 ya lo hizo).
--
-- A partir de aquí, cualquier mock nuevo que se cargue con
-- is_published=true tendrá sus papers al instante, sin bug 404.
-- =====================================================================


-- ─── 1. Función que crea los papers para un examen ─────────────────

create or replace function _acertlio_create_papers_for_exam(p_exam_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  ex             record;
  p_rw_id        uuid;
  p_reading_id   uuid;
  p_writing_id   uuid;
  reading_dur    int;
  writing_dur    int;
  listening_dur  int;
  rw_dur         int;
  reading_code   text;
  reading_title  text;
begin
  -- Solo si el examen existe y NO tiene papers todavía
  select id, level, title
    into ex
    from exams
    where id = p_exam_id
      and not exists (select 1 from exam_papers where exam_id = p_exam_id);

  if not found then
    return; -- El examen no existe o ya tiene papers
  end if;

  -- ─── Parámetros según nivel ─────────────────────────────
  if ex.level = 'A2' then
    rw_dur := 60;
    listening_dur := 30;
  elsif ex.level = 'B1' then
    reading_dur := 45;
    writing_dur := 45;
    listening_dur := 35;
    reading_code := 'reading';
    reading_title := 'Reading';
  elsif ex.level = 'B2' then
    reading_dur := 75;
    writing_dur := 80;
    listening_dur := 40;
    reading_code := 'reading_use_english';
    reading_title := 'Reading & Use of English';
  elsif ex.level in ('C1', 'C2') then
    reading_dur := 90;
    writing_dur := 90;
    listening_dur := 40;
    reading_code := 'reading_use_english';
    reading_title := 'Reading & Use of English';
  else
    return; -- Nivel desconocido
  end if;


  -- ═════════════════════════════════════════════════
  -- CASO A2: 1 paper R&W + Listening
  -- ═════════════════════════════════════════════════
  if ex.level = 'A2' then

    insert into exam_papers (
      exam_id, code, title, short_description, duration_minutes,
      order_index, is_available, instructions
    ) values (
      ex.id, 'reading_writing', 'Reading & Writing',
      'Textos, señales, preguntas de opción múltiple y dos tareas de expresión escrita.',
      rw_dur, 0, true,
      E'## Reading & Writing\n\nEste paper combina Reading y Writing en una sola sesión de 60 minutos.\n\n**Reading** (aprox. 30 min): 7 partes con textos cortos y largos, preguntas de opción múltiple, matching y huecos.\n\n**Writing** (aprox. 30 min): 2 tareas de expresión escrita.\n\n**Instrucciones**\n- Puedes navegar libremente entre las partes.\n- Puedes marcar preguntas para revisarlas después.\n- El timer se pausa si cierras el navegador y continúa al volver.\n- Cuando pulses **Start**, el timer arrancará y no podrás detenerlo.'
    )
    returning id into p_rw_id;

    insert into exam_papers (
      exam_id, code, title, short_description, duration_minutes,
      order_index, unlocks_after_paper_id, is_available, unavailable_reason,
      instructions
    ) values (
      ex.id, 'listening', 'Listening',
      'Escucha grabaciones y responde preguntas.',
      listening_dur, 1, p_rw_id, false, 'Próximamente',
      E'## Listening\n\nEste paper aún no está disponible. Estamos preparando los audios.'
    );

    update exam_parts
      set paper_id = p_rw_id
      where exam_id = ex.id and skill in ('reading', 'writing');


  -- ═════════════════════════════════════════════════
  -- CASO B1/B2/C1/C2: 3 papers separados
  -- ═════════════════════════════════════════════════
  else

    -- Paper 1: Reading (o Reading & Use of English)
    insert into exam_papers (
      exam_id, code, title, short_description, duration_minutes,
      order_index, is_available, instructions
    ) values (
      ex.id, reading_code, reading_title,
      case
        when reading_code = 'reading' then 'Textos cortos y largos, matching, huecos y opción múltiple.'
        else 'Textos, uso del inglés, huecos, transformación de palabras y opción múltiple.'
      end,
      reading_dur, 0, true,
      format(
        E'## %s\n\nDuración: %s minutos.\n\n**Instrucciones**\n- Puedes navegar libremente entre las partes.\n- Puedes marcar preguntas para revisarlas después.\n- El timer se pausa si cierras el navegador y continúa al volver.\n- Cuando pulses **Start**, el timer arrancará y no podrás detenerlo.\n- El paper se cerrará automáticamente cuando se acabe el tiempo.',
        reading_title, reading_dur
      )
    )
    returning id into p_reading_id;

    -- Paper 2: Writing (bloqueado hasta terminar Reading)
    insert into exam_papers (
      exam_id, code, title, short_description, duration_minutes,
      order_index, unlocks_after_paper_id, is_available, instructions
    ) values (
      ex.id, 'writing', 'Writing',
      'Dos tareas de expresión escrita corregidas por tu profesor.',
      writing_dur, 1, p_reading_id, true,
      format(
        E'## Writing\n\nDuración: %s minutos.\n\nDos tareas de expresión escrita. La primera es obligatoria; en la segunda puedes elegir entre varias opciones.\n\n**Instrucciones**\n- Puedes navegar libremente entre las dos tareas.\n- Tu profesor corregirá tu escrito con la rúbrica oficial Cambridge.\n- El timer se pausa si cierras el navegador y continúa al volver.\n- Cuando pulses **Start**, el timer arrancará y no podrás detenerlo.',
        writing_dur
      )
    )
    returning id into p_writing_id;

    -- Paper 3: Listening (bloqueado + no disponible)
    insert into exam_papers (
      exam_id, code, title, short_description, duration_minutes,
      order_index, unlocks_after_paper_id, is_available, unavailable_reason,
      instructions
    ) values (
      ex.id, 'listening', 'Listening',
      'Escucha grabaciones y responde preguntas.',
      listening_dur, 2, p_writing_id, false, 'Próximamente',
      E'## Listening\n\nEste paper aún no está disponible. Estamos preparando los audios.'
    );

    -- Asignar exam_parts según skill
    update exam_parts
      set paper_id = p_reading_id
      where exam_id = ex.id and skill in ('reading', 'use_of_english');

    update exam_parts
      set paper_id = p_writing_id
      where exam_id = ex.id and skill = 'writing';

  end if;

  raise notice 'Papers creados para: % (nivel %)', ex.title, ex.level;
end;
$$;


-- ─── 2. Trigger AFTER INSERT ON exams ──────────────────────────────
-- Se dispara cuando alguien inserta un exam nuevo con is_published=true.
-- Ejecuta la función en un segundo momento (DEFERRABLE porque necesitamos
-- que las exam_parts existan primero — típicamente los inserts en el
-- mismo bloque do $$ ... end $$).
--
-- En la práctica, la mayoría de mocks se cargan con este patrón:
--   1. INSERT INTO exams (...) RETURNING id INTO exam_id;
--   2. INSERT INTO exam_parts (...) VALUES (...);
--   3. INSERT INTO questions (...);
--
-- Con el trigger DEFERRABLE, la creación de papers ocurre cuando la
-- transacción se compromete (COMMIT), momento en el cual las parts
-- ya existen y podemos asignar paper_id correctamente.

create or replace function _acertlio_trg_create_papers_on_exam()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.is_published then
    perform _acertlio_create_papers_for_exam(new.id);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_create_papers_on_exam on exams;
create constraint trigger trg_create_papers_on_exam
    after insert on exams
    deferrable initially deferred
    for each row
    execute function _acertlio_trg_create_papers_on_exam();


-- ─── 3. También un trigger AFTER UPDATE para publicaciones tardías ─
-- Si alguien crea un examen con is_published=false y luego lo cambia
-- a true, también hay que crear los papers.

create or replace function _acertlio_trg_create_papers_on_publish()
returns trigger
language plpgsql
security definer
as $$
begin
  if old.is_published is distinct from new.is_published and new.is_published then
    perform _acertlio_create_papers_for_exam(new.id);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_create_papers_on_publish on exams;
create trigger trg_create_papers_on_publish
    after update on exams
    for each row
    execute function _acertlio_trg_create_papers_on_publish();


-- ─── 4. Backfill: reparar exámenes actuales sin papers ─────────────
-- Idempotente: si un examen ya tiene papers, la función interna sale.

do $$
declare
  ex_id uuid;
  n_repaired int := 0;
begin
  for ex_id in
    select id from exams
    where is_published = true
      and not exists (select 1 from exam_papers where exam_id = exams.id)
  loop
    perform _acertlio_create_papers_for_exam(ex_id);
    n_repaired := n_repaired + 1;
  end loop;

  raise notice '===== BACKFILL 034 =====';
  raise notice 'Exámenes reparados: %', n_repaired;
  raise notice '========================';
end $$;


-- ─── 5. Verificación ────────────────────────────────────────────────
--
-- Después de ejecutar esta migración, TODOS los mocks publicados
-- deberían tener sus papers.
--
-- Query para verificar:
--   select
--     e.level,
--     e.mock_number,
--     e.title,
--     count(p.id) as num_papers
--   from exams e
--   left join exam_papers p on p.exam_id = e.id
--   where e.is_published = true
--   group by e.id, e.level, e.mock_number, e.title
--   order by e.level, e.mock_number;
--
-- Esperado:
--   A2: 2 papers cada uno (reading_writing + listening)
--   B1/B2/C1/C2: 3 papers cada uno (reading + writing + listening)
