-- =====================================================================
-- ACERTLIO — Carga de mock A2-03 (Escuela y trabajo) + cleanup helpers
-- =====================================================================
-- Prerequisito: haber ejecutado 002 y 003.
-- Este es el último script de A2. Al final, elimina las funciones helper.
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

  insert into exams (title, level, mock_number, description, total_time_minutes, is_published, version)
  values (
    'A2 Key Mock 03 — Escuela y trabajo',
    'A2', 3,
    'Tercer mock A2 Key. Tema: escuela y trabajo (colegio, primeras experiencias laborales, aprender cosas nuevas). Contenido 100% original.',
    60, true, 1
  )
  returning id into exam_id;

  -- ─── PART 1 ──────────────────────────────────────────────────────
  insert into exam_parts (exam_id, skill, part_number, title, instructions, order_index, settings)
  values (
    exam_id, 'reading', 1, 'Signs and short messages',
    'Read each text. What does it say? Choose the correct answer — A, B or C.',
    0,
    '{"question_type_hint":"multiple_choice","expected_count":6}'::jsonb
  )
  returning id into p1_id;

  perform _tmp_insert_mc_notice(p1_id, 1,
    'Message from your English teacher, Mrs Kelly: Tomorrow''s exam will start at 11, not 10. The room has changed too — we will use room 14, not room 8.',
    'Mrs Kelly is telling students that', 'A',
    'the exam is one hour later, in a different room.',
    'the exam is cancelled.',
    'students should go to room 8 at 11.'
  );

  perform _tmp_insert_mc_notice(p1_id, 2,
    'NOTICE IN A SCHOOL LIBRARY — Students can now take home three books at the same time, not two. Please return them within two weeks.',
    'The library notice says that students can', 'B',
    'keep the books for longer than before.',
    'borrow more books than before.',
    'visit the library more often.'
  );

  perform _tmp_insert_mc_notice(p1_id, 3,
    'Text from Ben to Diana: Sorry, I can''t help you study for the maths test tonight. I have to look after my little brother. Can we meet on Sunday morning instead?',
    'Ben is telling Diana that', 'C',
    'he doesn''t want to study for the test.',
    'he cannot help her because his brother is ill.',
    'he wants to change the day when they meet.'
  );

  perform _tmp_insert_mc_notice(p1_id, 4,
    'SIGN ON AN OFFICE DOOR — Meeting in progress. Please do not knock. Emergencies only.',
    'The sign tells people that they should', 'B',
    'wait outside quietly.',
    'not interrupt unless it is very important.',
    'come back after lunch.'
  );

  perform _tmp_insert_mc_notice(p1_id, 5,
    'SCHOOL POSTER — Trip to the science museum — Friday, 15 October. Cost: £8. Bring your permission form and a packed lunch.',
    'The poster tells students that', 'B',
    'they will have lunch at the museum.',
    'they need to bring food from home.',
    'the school will pay for the trip.'
  );

  perform _tmp_insert_mc_notice(p1_id, 6,
    'Email from Mrs Silva to parents: Dear parents, we would like to meet you next Monday to talk about your children''s progress this term. Please tell us what time is best for you.',
    'Mrs Silva wants parents to', 'B',
    'come to the school on Monday.',
    'tell her when they are free.',
    'write to her about their children.'
  );

  -- ─── PART 2 — Matching (opportunities) ──────────────────────────
  insert into exam_parts (exam_id, skill, part_number, title, instructions, order_index, settings)
  values (
    exam_id, 'reading', 2, 'People and opportunities matching',
    'Read the descriptions of seven young people who are looking for summer work or courses. Then read the descriptions of eight opportunities (A–H). Decide which opportunity would be the most suitable for each person.',
    1,
    jsonb_build_object(
      'question_type_hint', 'multiple_matching',
      'expected_count', 7,
      'matching_options', jsonb_build_array(
        jsonb_build_object('letter', 'A', 'text', 'English family stay (four weeks) — Live with an English family in a small town near Cambridge. Attend English classes in the morning and go on trips with the family in the afternoon. Very popular with international students.'),
        jsonb_build_object('letter', 'B', 'text', 'First aid course — A short weekend course teaching basic medical skills. Free for students. Certificate at the end. Useful for future medical or nursing students, or for anyone.'),
        jsonb_build_object('letter', 'C', 'text', 'Beach club helper — Help with children''s activities at a summer beach club by the sea. Two weeks of work. You must be able to swim well. Free accommodation is provided but the pay is low.'),
        jsonb_build_object('letter', 'D', 'text', 'Farm work in the mountains — Six weeks of outdoor work on a small organic farm. Physical work with animals and plants. Free food and accommodation, plus a small daily payment.'),
        jsonb_build_object('letter', 'E', 'text', 'Local children''s summer camp — Work as a helper at a summer camp for children aged 6–10 in your own town. Six weeks, paid work. No previous experience needed. Training on the first day.'),
        jsonb_build_object('letter', 'F', 'text', 'Weekend Japanese classes — Ten Saturday classes for total beginners. Learn to speak simple Japanese and understand the writing system. Small groups of eight students.'),
        jsonb_build_object('letter', 'G', 'text', 'Coding for beginners — A three-week online course. Learn the basic ideas of computer programming. No experience needed. Includes practice exercises and one video meeting per week with a teacher.'),
        jsonb_build_object('letter', 'H', 'text', 'Creative writing camp — A one-week residential course for young people who love to write. Meet a well-known novelist and share your work with other young writers. Meals and rooms are included in the price.')
      )
    )
  )
  returning id into p2_id;

  perform _tmp_insert_matching(p2_id, 1, 'Lena wants to earn some money during the summer holidays. She loves being with children and would like a job in her own town.', 'E');
  perform _tmp_insert_matching(p2_id, 2, 'Ahmed is planning to study medicine at university. He wants to learn something useful before he starts, but he does not have much money to spend.', 'B');
  perform _tmp_insert_matching(p2_id, 3, 'Priya wants to improve her English. She would like to travel abroad for a few weeks and stay with a family.', 'A');
  perform _tmp_insert_matching(p2_id, 4, 'Julio loves computers. He wants to learn something new that could help him find a job when he finishes school next year.', 'G');
  perform _tmp_insert_matching(p2_id, 5, 'Elena enjoys writing stories. She would like a course where she can meet other young writers and learn from a real writer.', 'H');
  perform _tmp_insert_matching(p2_id, 6, 'Simon wants to work outdoors. He loves nature and does not mind hard physical work.', 'D');
  perform _tmp_insert_matching(p2_id, 7, 'Amara wants to learn a new language. She has never studied one before and needs a beginners'' class.', 'F');

  -- ─── PART 3 — Long text: My First Job ───────────────────────────
  insert into exam_parts (exam_id, skill, part_number, title, instructions, order_index, settings)
  values (
    exam_id, 'reading', 3, 'Long text — My First Job',
    'Read the text and questions below. For each question, choose the correct answer — A, B or C.',
    2,
    jsonb_build_object(
      'question_type_hint', 'multiple_choice',
      'expected_count', 5,
      'reading_text', 'MY FIRST JOB

My name is Fatima and last summer I had my first job. I worked in a small café near my house for six weeks. The café was called Marta''s, and it was owned by a woman who lived in my street. I knew her a little because she sometimes came to talk to my mother.

At first, the job was very difficult. I did not know how to use the coffee machine, and I made many mistakes with the orders. On my second day, I broke three cups. I thought Marta would be angry, but she just laughed and told me not to worry.

The best thing about the job was meeting people. Every day I served the same customers, and after a few weeks I knew their names. One old man came every morning to read the newspaper. A young couple came every Saturday for breakfast. I liked hearing about their lives.

When the summer ended, I was sad to leave. Marta gave me a card and a small present. She said I could come back next summer if I wanted. I have already decided that I will.'
    )
  )
  returning id into p3_id;

  perform _tmp_insert_mc(p3_id, 1, 'Where was Fatima''s job?', 'A',
    'In her neighbourhood.', 'In her mother''s café.', 'In a big restaurant.');
  perform _tmp_insert_mc(p3_id, 2, 'How did Fatima feel during her first days at work?', 'C',
    'Nervous about her boss.', 'Bored by the work.', 'Worried about making mistakes.');
  perform _tmp_insert_mc(p3_id, 3, 'What happened when Fatima broke three cups?', 'B',
    'Marta was very upset.', 'Marta was kind about it.', 'Fatima had to pay for the cups.');
  perform _tmp_insert_mc(p3_id, 4, 'What did Fatima enjoy most about her job?', 'B',
    'Learning to make coffee.', 'Talking to regular customers.', 'Working every day of the week.');
  perform _tmp_insert_mc(p3_id, 5, 'What is Fatima going to do next summer?', 'B',
    'Find a different job.', 'Work at Marta''s again.', 'Travel with the young couple.');

  -- ─── PART 4 — MC cloze: My favourite teacher ─────────────────────
  insert into exam_parts (exam_id, skill, part_number, title, instructions, order_index, settings)
  values (
    exam_id, 'reading', 4, 'Multiple-choice cloze — My favourite teacher',
    'Read the text below and decide which answer (A, B or C) best fits each gap.',
    3,
    jsonb_build_object(
      'question_type_hint', 'multiple_choice_cloze',
      'expected_count', 6,
      'base_text', 'MY FAVOURITE TEACHER

My favourite teacher at school is Miss Bruno. She teaches history, which is not (1) …… favourite subject, but her classes are always interesting.

Miss Bruno is (2) …… young — I think she is about twenty-eight. Before she was a teacher, she worked in a museum. She often (3) …… us stories about the things she saw there. Sometimes she brings old photos to class, and we spend the whole hour looking at them and asking questions.

Miss Bruno never gives us long tests. Instead, she asks us to make small projects. Last month I (4) …… a project about my grandfather''s life during the war. My grandfather (5) …… very happy when I asked him questions for my project. He said nobody had ever asked him about that before.

I have learnt more history with Miss Bruno (6) …… with any other teacher. When I finish school, I will always remember her.'
    )
  )
  returning id into p4_id;

  perform _tmp_insert_mc_cloze(p4_id, 1, 'gap 1 — possessive', 'B', 'the', 'my', 'mine');
  perform _tmp_insert_mc_cloze(p4_id, 2, 'gap 2 — degree adverb', 'A', 'quite', 'enough', 'so');
  perform _tmp_insert_mc_cloze(p4_id, 3, 'gap 3 — tells collocation', 'C', 'says', 'speaks', 'tells');
  perform _tmp_insert_mc_cloze(p4_id, 4, 'gap 4 — made a project', 'B', 'did', 'made', 'worked');
  perform _tmp_insert_mc_cloze(p4_id, 5, 'gap 5 — past simple was', 'A', 'was', 'were', 'is');
  perform _tmp_insert_mc_cloze(p4_id, 6, 'gap 6 — comparative than', 'B', 'as', 'than', 'that');

  -- ─── PART 5 — Open cloze: New photography course ────────────────
  insert into exam_parts (exam_id, skill, part_number, title, instructions, order_index, settings)
  values (
    exam_id, 'reading', 5, 'Open cloze — New photography course',
    'Read the email below and write the missing words. Write ONE word for each gap.',
    4,
    jsonb_build_object(
      'question_type_hint', 'open_cloze',
      'expected_count', 6,
      'base_text', 'From: Nora
To: Sam
Subject: New course

Hi Sam,

I hope you are well. I want to tell you about a new photography course (1) …… I found. It starts next month and it is (2) …… weeks long. The teacher is a professional photographer who has worked (3) …… many famous magazines.

The classes (4) …… on Wednesday evenings from 6 to 8. It is not too expensive because it is organised by the town council. I think I (5) …… go, but I would like to have a friend with me.

Are you interested? I know you love taking photos. Let me know (6) …… you decide.

See you soon,
Nora'
    )
  )
  returning id into p5_id;

  perform _tmp_insert_open_cloze(p5_id, 1, 'gap 1 — relative pronoun', 'that|which');
  perform _tmp_insert_open_cloze(p5_id, 2, 'gap 2 — number word (six/eight/ten)', 'six|eight|ten|four|five|seven|nine|twelve');
  perform _tmp_insert_open_cloze(p5_id, 3, 'gap 3 — worked for/with', 'for|with');
  perform _tmp_insert_open_cloze(p5_id, 4, 'gap 4 — are (plural be)', 'are');
  perform _tmp_insert_open_cloze(p5_id, 5, 'gap 5 — modal intention', 'will|can|might|should');
  perform _tmp_insert_open_cloze(p5_id, 6, 'gap 6 — what/when you decide', 'what|when');

  -- ─── PART 6 — Writing 1 (New school year email) ─────────────────
  insert into exam_parts (exam_id, skill, part_number, title, instructions, time_minutes, order_index, settings)
  values (
    exam_id, 'writing', 6, 'Writing 1 — Guided email',
    'You are going to write an email to your English friend, Alex. Read the message from Alex and the notes you have made. Write an email to Alex using all the notes.',
    15, 5,
    '{"question_type_hint":"writing_task","expected_count":1}'::jsonb
  )
  returning id into p6_id;

  perform _tmp_insert_writing(p6_id, 1,
    'From: Alex — Subject: New school year

Hi! I heard you have started a new school this year. How is it going? What is your favourite subject? Have you made new friends? Is there anything you don''t like about the new school?

Alex

Write an email to Alex using ALL the notes below.',
    jsonb_build_object(
      'task_type', 'email',
      'word_count_min', 25,
      'word_count_max', 40,
      'notes', jsonb_build_array(
        'Say how the new school is',
        'Your favourite subject',
        'Something about your new friends',
        'One thing you don''t like'
      )
    )
  );

  -- ─── PART 7 — Writing 2 (envelope story) ────────────────────────
  insert into exam_parts (exam_id, skill, part_number, title, instructions, time_minutes, order_index, settings)
  values (
    exam_id, 'writing', 7, 'Writing 2 — Story',
    'Your English teacher has asked you to write a story. Your story must begin with the sentence below. Write your story in about 35 words.',
    15, 6,
    '{"question_type_hint":"writing_task","expected_count":1}'::jsonb
  )
  returning id into p7_id;

  perform _tmp_insert_writing(p7_id, 1,
    'Write a short story that begins with the sentence: "The teacher gave everyone in the class a small envelope."',
    jsonb_build_object(
      'task_type', 'story',
      'word_count_min', 30,
      'word_count_max', 45,
      'opening_sentence', 'The teacher gave everyone in the class a small envelope.'
    )
  );

  raise notice 'A2-03 creado con éxito. Exam ID: %', exam_id;

end $$;


-- =====================================================================
-- Cleanup — eliminar las funciones helper temporales
-- =====================================================================
drop function if exists _tmp_insert_mc_notice(uuid, int, text, text, char, text, text, text);
drop function if exists _tmp_insert_mc(uuid, int, text, char, text, text, text);
drop function if exists _tmp_insert_matching(uuid, int, text, char);
drop function if exists _tmp_insert_mc_cloze(uuid, int, text, char, text, text, text);
drop function if exists _tmp_insert_open_cloze(uuid, int, text, text);
drop function if exists _tmp_insert_writing(uuid, int, text, jsonb);

-- =====================================================================
-- Verificación (opcional) — ejecuta esto después para confirmar
-- =====================================================================
-- select level, mock_number, title, is_published from exams where level = 'A2' order by mock_number;
-- select e.title, count(q.id) as total_questions
--   from exams e
--   join exam_parts p on p.exam_id = e.id
--   join questions q on q.part_id = p.id
--   where e.level = 'A2'
--   group by e.title;
-- =====================================================================
