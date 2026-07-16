-- =====================================================================
-- ACERTLIO — Carga de mocks A2 Key (Mock 01, 02, 03)
-- =====================================================================
-- Ejecutar UNA VEZ en Supabase → SQL Editor → Run.
--
-- Prerequisito: haber ejecutado migration-001.sql (que añade A2/C2 al enum).
--
-- Este script:
--   1. Crea funciones helper temporales
--   2. Inserta 3 exámenes A2 + sus 7 partes + 96 preguntas + 24 opciones
--      de matching + 2 writing tasks por mock
--   3. Publica los 3 exámenes
--   4. Elimina las funciones helper temporales
--
-- Si necesitas volver a ejecutarlo, primero borra los exámenes A2 existentes:
--   delete from exams where level = 'A2' and mock_number in (1, 2, 3);
-- =====================================================================


-- Sección 1 — Funciones helper temporales
-- --------------------------------------------------

create or replace function _tmp_insert_mc_notice(
  p_part_id uuid,
  p_num int,
  p_notice text,
  p_stem text,
  p_correct char(1),
  p_a text,
  p_b text,
  p_c text
) returns uuid as $$
declare q_id uuid;
begin
  insert into questions (part_id, question_number, question_type, stem, correct_answer, points, order_index, context)
  values (p_part_id, p_num, 'multiple_choice', p_stem, p_correct, 1, p_num - 1,
          jsonb_build_object('notice_text', p_notice))
  returning id into q_id;

  insert into question_options (question_id, letter, text, is_correct, order_index) values
    (q_id, 'A', p_a, p_correct = 'A', 0),
    (q_id, 'B', p_b, p_correct = 'B', 1),
    (q_id, 'C', p_c, p_correct = 'C', 2);

  return q_id;
end;
$$ language plpgsql;


create or replace function _tmp_insert_mc(
  p_part_id uuid,
  p_num int,
  p_stem text,
  p_correct char(1),
  p_a text,
  p_b text,
  p_c text
) returns uuid as $$
declare q_id uuid;
begin
  insert into questions (part_id, question_number, question_type, stem, correct_answer, points, order_index)
  values (p_part_id, p_num, 'multiple_choice', p_stem, p_correct, 1, p_num - 1)
  returning id into q_id;

  insert into question_options (question_id, letter, text, is_correct, order_index) values
    (q_id, 'A', p_a, p_correct = 'A', 0),
    (q_id, 'B', p_b, p_correct = 'B', 1),
    (q_id, 'C', p_c, p_correct = 'C', 2);

  return q_id;
end;
$$ language plpgsql;


create or replace function _tmp_insert_matching(
  p_part_id uuid,
  p_num int,
  p_stem text,
  p_correct char(1)
) returns uuid as $$
declare q_id uuid;
begin
  insert into questions (part_id, question_number, question_type, stem, correct_answer, points, order_index)
  values (p_part_id, p_num, 'multiple_matching', p_stem, p_correct, 1, p_num - 1)
  returning id into q_id;
  return q_id;
end;
$$ language plpgsql;


create or replace function _tmp_insert_mc_cloze(
  p_part_id uuid,
  p_num int,
  p_gap_note text,
  p_correct char(1),
  p_a text,
  p_b text,
  p_c text
) returns uuid as $$
declare q_id uuid;
begin
  insert into questions (part_id, question_number, question_type, stem, correct_answer, points, order_index)
  values (p_part_id, p_num, 'multiple_choice_cloze', p_gap_note, p_correct, 1, p_num - 1)
  returning id into q_id;

  insert into question_options (question_id, letter, text, is_correct, order_index) values
    (q_id, 'A', p_a, p_correct = 'A', 0),
    (q_id, 'B', p_b, p_correct = 'B', 1),
    (q_id, 'C', p_c, p_correct = 'C', 2);

  return q_id;
end;
$$ language plpgsql;


create or replace function _tmp_insert_open_cloze(
  p_part_id uuid,
  p_num int,
  p_gap_note text,
  p_correct text
) returns uuid as $$
declare q_id uuid;
begin
  insert into questions (part_id, question_number, question_type, stem, correct_answer, points, order_index)
  values (p_part_id, p_num, 'open_cloze', p_gap_note, p_correct, 1, p_num - 1)
  returning id into q_id;
  return q_id;
end;
$$ language plpgsql;


create or replace function _tmp_insert_writing(
  p_part_id uuid,
  p_num int,
  p_stem text,
  p_context jsonb
) returns uuid as $$
declare q_id uuid;
begin
  insert into questions (part_id, question_number, question_type, stem, correct_answer, points, order_index, context)
  values (p_part_id, p_num, 'writing_task', p_stem, null, 15, p_num - 1, p_context)
  returning id into q_id;
  return q_id;
end;
$$ language plpgsql;


-- =====================================================================
-- MOCK A2-01 — VIDA COTIDIANA
-- =====================================================================
do $$
declare
  exam_id uuid;
  p1_id uuid;
  p2_id uuid;
  p3_id uuid;
  p4_id uuid;
  p5_id uuid;
  p6_id uuid;
  p7_id uuid;
begin

  -- Crear el examen
  insert into exams (title, level, mock_number, description, total_time_minutes, is_published, version)
  values (
    'A2 Key Mock 01 — Vida cotidiana',
    'A2',
    1,
    'Primer mock A2 Key generado por Acertlio. Tema: vida cotidiana (compras, comida, familia, casa). Todo el contenido es original.',
    60,
    true,
    1
  )
  returning id into exam_id;

  -- ─── PART 1 — Signs and short messages (6 MC preguntas) ─────────
  insert into exam_parts (exam_id, skill, part_number, title, instructions, order_index, settings)
  values (
    exam_id, 'reading', 1, 'Signs and short messages',
    'Read each text. What does it say? Choose the correct answer — A, B or C.',
    0,
    '{"question_type_hint":"multiple_choice","expected_count":6}'::jsonb
  )
  returning id into p1_id;

  perform _tmp_insert_mc_notice(p1_id, 1,
    'Message from Mum on the kitchen door: Tom, the shop was closed today. Can you buy milk and bread on your way home? Money is in the small box next to the phone.',
    'What is Mum asking Tom to do?', 'A',
    'Go to the shop after school.',
    'Wait for her at home.',
    'Bring money for the shop.'
  );

  perform _tmp_insert_mc_notice(p1_id, 2,
    'SUPERMARKET NOTICE — Fresh strawberries — 2 boxes for the price of 1 today only.',
    'The notice tells shoppers that', 'B',
    'strawberries are cheaper this week.',
    'they can pay less if they buy more.',
    'the shop has new fruit.'
  );

  perform _tmp_insert_mc_notice(p1_id, 3,
    'Text message from Sara to Elena: I can''t come to your house at 6. My little sister is sick. Can I come at 7 instead?',
    'Sara wants to', 'B',
    'cancel her visit to Elena.',
    'arrive later than planned.',
    'bring her sister to Elena''s house.'
  );

  perform _tmp_insert_mc_notice(p1_id, 4,
    'APARTMENT BUILDING NOTICE — No music after 10 p.m. Please respect your neighbours.',
    'The notice asks people in the building to', 'A',
    'turn off their music at night.',
    'talk quietly in the evening.',
    'meet the neighbours.'
  );

  perform _tmp_insert_mc_notice(p1_id, 5,
    'BAKERY WINDOW SIGN — Bread made today — best before tomorrow morning. Ask us for older bread at half price.',
    'The sign tells customers that', 'C',
    'all the bread was made today.',
    'the bread will not be fresh next week.',
    'older bread costs less.'
  );

  perform _tmp_insert_mc_notice(p1_id, 6,
    'Note from Dad to the family: I''m at the doctor''s until 3. Please don''t cook — I''m bringing pizza for dinner.',
    'Dad''s note says that', 'B',
    'he wants the family to prepare food.',
    'the family should wait to eat until he returns.',
    'he will be home before 3.'
  );

  -- ─── PART 2 — Matching (7 personas → 8 tiendas) ─────────────────
  insert into exam_parts (exam_id, skill, part_number, title, instructions, order_index, settings)
  values (
    exam_id, 'reading', 2, 'People and shops matching',
    'Read the descriptions of seven people who want to buy something for their home. Then read the descriptions of eight shops (A–H). Decide which shop would be the most suitable for each person.',
    1,
    jsonb_build_object(
      'question_type_hint', 'multiple_matching',
      'expected_count', 7,
      'matching_options', jsonb_build_array(
        jsonb_build_object('letter', 'A', 'text', 'Green Table — A small shop selling handmade wooden furniture. Each piece is made to order and takes about six weeks. Prices are high, but the furniture lasts for a lifetime. No delivery available; customers must arrange their own transport.'),
        jsonb_build_object('letter', 'B', 'text', 'HomeStart — A big shop for people setting up their first home. Furniture is simple and cheap. Free delivery in the city area for orders over £100. Everything is ready to take home the same day.'),
        jsonb_build_object('letter', 'C', 'text', 'Chef Supplies — This shop specialises in professional kitchen equipment. It sells to restaurants and cafés, and offers special prices for orders of ten items or more. The staff have all worked as chefs.'),
        jsonb_build_object('letter', 'D', 'text', 'Modern Home — Sells modern tableware, glasses, and small decorations. Everything is designed by young European designers. Prices are low, and the shop always has new items every month.'),
        jsonb_build_object('letter', 'E', 'text', 'Kitchen Master — A shop for people who love cooking at home. Sells pans, knives, and cooking tools of the highest quality. Products come from Italy, France, and Japan. Prices reflect the quality.'),
        jsonb_build_object('letter', 'F', 'text', 'Coffee Corner — A specialist coffee machine shop. All staff have received training from the manufacturers. Free advice for customers who are not sure which machine to buy.'),
        jsonb_build_object('letter', 'G', 'text', 'Little Feet — Children''s furniture and decorations. Everything is designed to be safe and easy to clean. Rugs, curtains, and small furniture for bedrooms and playrooms.'),
        jsonb_build_object('letter', 'H', 'text', 'Light and Warmth — A shop for traditional lamps and lighting. Most pieces are from the 1950s and 1960s, or made in that style today. The shop feels like a museum. Delivery available for large items.')
      )
    )
  )
  returning id into p2_id;

  perform _tmp_insert_matching(p2_id, 1, 'Anna is a student. She has just moved into a small flat and needs cheap furniture. She does not have a car, so the shop must offer delivery.', 'B');
  perform _tmp_insert_matching(p2_id, 2, 'Kevin wants to buy a new coffee machine as a present for his wife. He does not know much about coffee machines and wants to speak to somebody who can help him choose.', 'F');
  perform _tmp_insert_matching(p2_id, 3, 'Maria loves cooking. She is looking for good-quality pans that will last for many years. She does not mind paying more if the quality is high.', 'E');
  perform _tmp_insert_matching(p2_id, 4, 'Peter has just painted his living room. He needs a large lamp for the corner, but he does not want anything modern — he prefers traditional styles.', 'H');
  perform _tmp_insert_matching(p2_id, 5, 'Lucia is a mother of two young children. She needs a soft rug for the children''s bedroom that is easy to clean.', 'G');
  perform _tmp_insert_matching(p2_id, 6, 'David is looking for kitchen equipment for his new restaurant. He needs to buy many items and hopes to get a discount for a large order.', 'C');
  perform _tmp_insert_matching(p2_id, 7, 'Sarah wants to buy plates and glasses for a dinner party next weekend. She wants something modern and not expensive.', 'D');

  -- ─── PART 3 — Long text MC (5 preguntas sobre "My Grandmother's Kitchen") ──
  insert into exam_parts (exam_id, skill, part_number, title, instructions, order_index, settings)
  values (
    exam_id, 'reading', 3, 'Long text — My Grandmother''s Kitchen',
    'Read the text and questions below. For each question, choose the correct answer — A, B or C.',
    2,
    jsonb_build_object(
      'question_type_hint', 'multiple_choice',
      'expected_count', 5,
      'reading_text', 'MY GRANDMOTHER''S KITCHEN

My grandmother lives in a small village near the mountains. Every summer, my brother and I go to visit her for two weeks. We love going because her house is very different from ours. We live in a city flat with a small kitchen, but her kitchen is huge. It is the biggest room in her house.

There is a long wooden table in the middle. Around it there are eight chairs — enough for all the family when we come at Christmas. On the walls there are old photos of my grandmother when she was young. She was a teacher for forty years, so she has many photos with her students.

The best thing about her kitchen is the smell. Grandmother cooks all day. She makes bread every morning at six. Then she prepares soup for lunch and cakes for the afternoon. She never uses recipes from a book. She learned everything from her mother when she was a girl.

My brother and I always try to help. He is good at making bread — Grandmother says he has "good hands". I am not so good at cooking, but I like to prepare the vegetables. Last summer, Grandmother taught me how to make her tomato sauce. It took three hours, and my sauce was not as good as hers, but she said I made a good start.

I think that when Grandmother is very old and cannot cook any more, my brother will be the one who continues her recipes. I hope he teaches me too.'
    )
  )
  returning id into p3_id;

  perform _tmp_insert_mc(p3_id, 1, 'Where does the writer''s grandmother live?', 'B',
    'In a large city.', 'In a small village.', 'In the mountains.');
  perform _tmp_insert_mc(p3_id, 2, 'What is different about the grandmother''s kitchen?', 'B',
    'It has old photos on the walls.', 'It is much bigger than the writer''s kitchen.', 'It has a wooden table.');
  perform _tmp_insert_mc(p3_id, 3, 'How did the grandmother learn to cook?', 'B',
    'She read many cookery books.', 'Her mother taught her.', 'She was a cookery teacher.');
  perform _tmp_insert_mc(p3_id, 4, 'What does the writer say about helping in the kitchen?', 'A',
    'She is not very good at cooking.', 'She makes bread every morning.', 'She learned the tomato sauce very quickly.');
  perform _tmp_insert_mc(p3_id, 5, 'What does the writer think about the future?', 'B',
    'Her brother will teach the recipes to his own children.',
    'Her brother will probably continue her grandmother''s cooking.',
    'She will move to her grandmother''s village.');

  -- ─── PART 4 — Multiple-choice cloze (6 gaps) ────────────────────
  insert into exam_parts (exam_id, skill, part_number, title, instructions, order_index, settings)
  values (
    exam_id, 'reading', 4, 'Multiple-choice cloze — Moving to a new house',
    'Read the text below and decide which answer (A, B or C) best fits each gap.',
    3,
    jsonb_build_object(
      'question_type_hint', 'multiple_choice_cloze',
      'expected_count', 6,
      'base_text', 'MOVING TO A NEW HOUSE

Last month, my family (1) …… to a new house on the other side of the city. The old flat was small, and my brother and I had to share a bedroom. In the new house, we (2) …… our own rooms.

Moving was hard work. We had lots of boxes, and we (3) …… to carry them up the stairs. My father hurt his back on the first day. My mother said we must be more careful and use a lift, but the lift was (4) …… working.

Now we are in the new house, and everyone is (5) …… . My brother has painted his room blue. I have chosen green for my walls. Next weekend, my grandparents (6) …… to visit us for the first time. My mother is preparing a special dinner.'
    )
  )
  returning id into p4_id;

  perform _tmp_insert_mc_cloze(p4_id, 1, 'gap 1', 'A', 'moved', 'went', 'changed');
  perform _tmp_insert_mc_cloze(p4_id, 2, 'gap 2', 'B', 'got', 'have', 'are');
  perform _tmp_insert_mc_cloze(p4_id, 3, 'gap 3', 'C', 'must', 'should', 'had');
  perform _tmp_insert_mc_cloze(p4_id, 4, 'gap 4', 'B', 'never', 'not', 'no');
  perform _tmp_insert_mc_cloze(p4_id, 5, 'gap 5', 'A', 'happy', 'happily', 'happier');
  perform _tmp_insert_mc_cloze(p4_id, 6, 'gap 6', 'B', 'come', 'are coming', 'came');

  -- ─── PART 5 — Open cloze (6 gaps) ───────────────────────────────
  insert into exam_parts (exam_id, skill, part_number, title, instructions, order_index, settings)
  values (
    exam_id, 'reading', 5, 'Open cloze — Cooking class email',
    'Read the email below and write the missing words. Write ONE word for each gap.',
    4,
    jsonb_build_object(
      'question_type_hint', 'open_cloze',
      'expected_count', 6,
      'base_text', 'From: Julia
To: Emma
Subject: Cooking class

Hi Emma,

Do you remember the cooking class we talked about last week? I looked (1) …… it on the internet, and there is a new group starting next month. It is (2) …… Tuesday evenings, from 7 to 9.

The teacher is a lady who worked in Italy for many years. She teaches simple recipes, so we don''t need (3) …… be experts. There are only ten people in the class, so I think we (4) …… learn a lot.

The class is not cheap, but if we go together, we (5) …… get a small discount. My cousin did the class last year, and she said (6) …… was the best thing she did all winter.

What do you think? Are you interested?

Love,
Julia'
    )
  )
  returning id into p5_id;

  perform _tmp_insert_open_cloze(p5_id, 1, 'gap 1 — look up phrasal', 'up');
  perform _tmp_insert_open_cloze(p5_id, 2, 'gap 2 — preposition of time', 'on');
  perform _tmp_insert_open_cloze(p5_id, 3, 'gap 3 — need + to', 'to');
  perform _tmp_insert_open_cloze(p5_id, 4, 'gap 4 — modal future/ability', 'will|can');
  perform _tmp_insert_open_cloze(p5_id, 5, 'gap 5 — modal possibility', 'can|will|could');
  perform _tmp_insert_open_cloze(p5_id, 6, 'gap 6 — subject pronoun', 'it');

  -- ─── PART 6 — Writing 1 (email a Alex) ──────────────────────────
  insert into exam_parts (exam_id, skill, part_number, title, instructions, time_minutes, order_index, settings)
  values (
    exam_id, 'writing', 6, 'Writing 1 — Guided email',
    'You are going to write an email to your English friend, Alex. Read the message from Alex and the notes you have made. Write an email to Alex using all the notes.',
    15,
    5,
    '{"question_type_hint":"writing_task","expected_count":1}'::jsonb
  )
  returning id into p6_id;

  perform _tmp_insert_writing(p6_id, 1,
    'From: Alex — Subject: Cooking together

Hi! I am learning to cook and I want to try something new this weekend. Can I visit your family and cook with your mum on Saturday? What food does she cook well? What time is best for me to come? What should I bring?

Alex

Write an email to Alex using ALL the notes below.',
    jsonb_build_object(
      'task_type', 'email',
      'word_count_min', 25,
      'word_count_max', 35,
      'notes', jsonb_build_array(
        'Say yes, Alex can come',
        'The food your mum cooks well',
        'Best time to come on Saturday',
        'What to bring'
      )
    )
  );

  -- ─── PART 7 — Writing 2 (story) ─────────────────────────────────
  insert into exam_parts (exam_id, skill, part_number, title, instructions, time_minutes, order_index, settings)
  values (
    exam_id, 'writing', 7, 'Writing 2 — Story',
    'Your English teacher has asked you to write a story. Your story must begin with the sentence below. Write your story in about 35 words.',
    15,
    6,
    '{"question_type_hint":"writing_task","expected_count":1}'::jsonb
  )
  returning id into p7_id;

  perform _tmp_insert_writing(p7_id, 1,
    'Write a short story that begins with the sentence: "When Sam opened the fridge, he was very surprised."',
    jsonb_build_object(
      'task_type', 'story',
      'word_count_min', 30,
      'word_count_max', 45,
      'opening_sentence', 'When Sam opened the fridge, he was very surprised.'
    )
  );

  raise notice 'A2-01 creado con éxito. Exam ID: %', exam_id;

end $$;
