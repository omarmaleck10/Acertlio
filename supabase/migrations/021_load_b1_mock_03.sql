-- =====================================================================
-- ACERTLIO — Carga de mock B1-03 (Work and study)
-- =====================================================================
-- Tercer mock B1 Preliminary. Estructura oficial Cambridge Preliminary
-- post-2020: Reading (45 min · 32 preguntas) + Writing (45 min · 2 tareas).
-- Contenido 100% original.
--
-- Tema del mock: Work and study
--   - Vida universitaria, exámenes, tutorías
--   - Primer trabajo, entrevistas, cambios de carrera
--   - Compaginar trabajo y estudios
--   - Cursos de verano, formación
--   - Trabajar desde casa
--
-- Ejecutar tras 001-020. Este archivo recrea las funciones helper.
-- =====================================================================


-- ─── Funciones helper temporales ────────────────────────────────────
create or replace function _tmp_insert_mc_notice(
  p_part_id uuid, p_num int, p_notice text, p_stem text,
  p_correct char(1), p_a text, p_b text, p_c text
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

create or replace function _tmp_insert_mc4(
  p_part_id uuid, p_num int, p_stem text, p_correct char(1),
  p_a text, p_b text, p_c text, p_d text
) returns uuid as $$
declare q_id uuid;
begin
  insert into questions (part_id, question_number, question_type, stem, correct_answer, points, order_index)
  values (p_part_id, p_num, 'multiple_choice', p_stem, p_correct, 1, p_num - 1)
  returning id into q_id;
  insert into question_options (question_id, letter, text, is_correct, order_index) values
    (q_id, 'A', p_a, p_correct = 'A', 0),
    (q_id, 'B', p_b, p_correct = 'B', 1),
    (q_id, 'C', p_c, p_correct = 'C', 2),
    (q_id, 'D', p_d, p_correct = 'D', 3);
  return q_id;
end;
$$ language plpgsql;

create or replace function _tmp_insert_matching(
  p_part_id uuid, p_num int, p_stem text, p_correct char(1)
) returns uuid as $$
declare q_id uuid;
begin
  insert into questions (part_id, question_number, question_type, stem, correct_answer, points, order_index)
  values (p_part_id, p_num, 'multiple_matching', p_stem, p_correct, 1, p_num - 1)
  returning id into q_id;
  return q_id;
end;
$$ language plpgsql;

create or replace function _tmp_insert_gapped(
  p_part_id uuid, p_num int, p_gap_note text, p_correct char(1)
) returns uuid as $$
declare q_id uuid;
begin
  insert into questions (part_id, question_number, question_type, stem, correct_answer, points, order_index)
  values (p_part_id, p_num, 'multiple_matching', p_gap_note, p_correct, 1, p_num - 1)
  returning id into q_id;
  return q_id;
end;
$$ language plpgsql;

create or replace function _tmp_insert_mc_cloze4(
  p_part_id uuid, p_num int, p_gap_note text, p_correct char(1),
  p_a text, p_b text, p_c text, p_d text
) returns uuid as $$
declare q_id uuid;
begin
  insert into questions (part_id, question_number, question_type, stem, correct_answer, points, order_index)
  values (p_part_id, p_num, 'multiple_choice_cloze', p_gap_note, p_correct, 1, p_num - 1)
  returning id into q_id;
  insert into question_options (question_id, letter, text, is_correct, order_index) values
    (q_id, 'A', p_a, p_correct = 'A', 0),
    (q_id, 'B', p_b, p_correct = 'B', 1),
    (q_id, 'C', p_c, p_correct = 'C', 2),
    (q_id, 'D', p_d, p_correct = 'D', 3);
  return q_id;
end;
$$ language plpgsql;

create or replace function _tmp_insert_writing(
  p_part_id uuid, p_num int, p_stem text, p_context jsonb
) returns uuid as $$
declare q_id uuid;
begin
  insert into questions (part_id, question_number, question_type, stem, correct_answer, points, order_index, context)
  values (p_part_id, p_num, 'writing_task', p_stem, null, 20, p_num - 1, p_context)
  returning id into q_id;
  return q_id;
end;
$$ language plpgsql;


-- =====================================================================
-- MOCK B1-03 — WORK AND STUDY
-- =====================================================================
do $$
declare
  exam_id uuid;
  p1_id uuid; p2_id uuid; p3_id uuid; p4_id uuid;
  p5_id uuid; p6_id uuid; p7_id uuid;
begin

  insert into exams (title, level, mock_number, description, total_time_minutes, is_published, version)
  values (
    'B1 Preliminary Mock 03 — Work and study',
    'B1', 3,
    'Tercer mock B1 Preliminary. Tema: vida universitaria, primer trabajo, compaginar estudios y trabajo, cursos de formación. Reading (45 min · 32 preguntas) + Writing (45 min · 2 tareas). Contenido 100% original.',
    90, true, 1
  )
  returning id into exam_id;


  -- ─── PART 1 — Signs and short messages (5 preguntas, A/B/C) ──────
  insert into exam_parts (exam_id, skill, part_number, title, instructions, order_index, settings)
  values (
    exam_id, 'reading', 1, 'Signs and short messages',
    'Look at the text in each question. What does it say? Choose the correct answer — A, B or C.',
    0,
    '{"question_type_hint":"multiple_choice","expected_count":5}'::jsonb
  )
  returning id into p1_id;

  perform _tmp_insert_mc_notice(p1_id, 1,
    'Notice on the door of Meeting Room 4: The 10 a.m. team meeting today has been moved to Room 2 on the ground floor. Please bring your own laptops as the screen in Room 2 is not working. Coffee will be available from 9:45.',
    'What does the notice tell staff?', 'A',
    'The meeting is happening today but in a different room.',
    'The meeting has been cancelled because of a broken screen.',
    'Staff need to book laptops before the meeting starts.'
  );

  perform _tmp_insert_mc_notice(p1_id, 2,
    'Message from Sarah to Ben: Hey — I can''t do our study session in the library tomorrow morning. My tutor moved my meeting to 10 a.m. Can we do it in the afternoon instead? I''m free from 3 onwards.',
    'Why is Sarah writing to Ben?', 'C',
    'to cancel their study session for the week',
    'to say she cannot meet him in the library any more',
    'to suggest a different time for their study session'
  );

  perform _tmp_insert_mc_notice(p1_id, 3,
    'Sign in the university library: NEW BORROWING RULES — Students may now borrow up to 8 books for two weeks. Please renew any book online before the return date. Late returns will result in a small fine per day.',
    'The sign tells students that they', 'B',
    'must return all their books after two weeks with no exception.',
    'can extend the loan of a book from the library website.',
    'will not be allowed to borrow books if they return one late.'
  );

  perform _tmp_insert_mc_notice(p1_id, 4,
    'Email from HR: Your interview for the summer internship has been confirmed for Thursday at 11 a.m. Please arrive 10 minutes early to complete a short online test before meeting the team. Bring a photo ID.',
    'Before the interview, candidates will', 'B',
    'have a short conversation with the whole team.',
    'do an online test at the company''s offices.',
    'send a photo of their ID by email.'
  );

  perform _tmp_insert_mc_notice(p1_id, 5,
    'Notice on the university noticeboard: FREE TUTORING SERVICE — Struggling with essays or exam preparation? Second-year students offer free help every Tuesday and Thursday from 5 to 7 p.m. in Room B12. No booking needed — just come along.',
    'The notice says that students can', 'A',
    'get help without arranging a time in advance.',
    'work with a tutor from the university staff.',
    'book a private lesson on Tuesdays and Thursdays.'
  );


  -- ─── PART 2 — Multiple matching (5 personas → 8 cursos verano) ───
  insert into exam_parts (exam_id, skill, part_number, title, instructions, order_index, settings)
  values (
    exam_id, 'reading', 2, 'Matching people to summer courses',
    'The people below all want to take a summer course. Decide which course (letters A–H) would be the most suitable for each person (questions 6–10).',
    1,
    ('{"question_type_hint":"multiple_matching","expected_count":5,'
     '"matching_options":['
     '{"letter":"A","text":"CREATIVE WRITING WORKSHOP — Two-week course for people who want to write short stories or start their first novel. Small groups of eight people. Daily feedback from published writers. Some previous experience of writing in English is helpful."},'
     '{"letter":"B","text":"CODE FROM ZERO — Three-week programming course for absolute beginners. No previous knowledge needed. Learn the basics of building simple websites step by step. Bring your own laptop. Suitable for teenagers and adults."},'
     '{"letter":"C","text":"JUNIOR CHEF ACADEMY — Intensive one-week cookery course for 14–17 year olds. Work in a real professional kitchen with experienced chefs. Learn to prepare three complete menus. Ingredients and uniform provided."},'
     '{"letter":"D","text":"DIGITAL DESIGN LAB — Four-week course in graphic and digital design. Learn industry-standard software. Suitable for art students who want to move from paper to screen. Portfolio work at the end of the course."},'
     '{"letter":"E","text":"NATURE PHOTOGRAPHY WEEK — Outdoor photography course in the national park. Learn how to photograph birds, plants and landscapes. Bring your own camera. Long walks every day, suitable for people who enjoy being outdoors."},'
     '{"letter":"F","text":"YOUNG ENTREPRENEURS — Two-week business course for people aged 18–25 with an idea for a small business. Learn how to plan, present and sell your idea. Real business owners come and share their experience each week."},'
     '{"letter":"G","text":"ACADEMIC ENGLISH FOR UNIVERSITY — Six-week intensive course preparing students to study a degree in English. Focus on writing essays, giving presentations, and reading academic texts. For students starting university next year."},'
     '{"letter":"H","text":"SPANISH LANGUAGE AND CULTURE — Four-week course combining Spanish lessons in the morning with cultural activities in the afternoon. All levels welcome, from complete beginners upwards. Perfect if you plan to study or work in Spain."}'
     ']}')::jsonb
  )
  returning id into p2_id;

  perform _tmp_insert_matching(p2_id, 6,
    'Lucas is an art student who has always drawn and painted on paper. He now wants to learn how to use professional software to create designs on a computer. He is looking for a course of about a month that gives him work he can show to future employers.',
    'D'
  );

  perform _tmp_insert_matching(p2_id, 7,
    'Nadia is going to study Engineering in Berlin next year, but the course will be in German. Before that, she wants to spend a few weeks in a Spanish-speaking country improving her Spanish, since she will be doing a work placement there after her degree.',
    'H'
  );

  perform _tmp_insert_matching(p2_id, 8,
    'Ryan is 15 and interested in computers, but has never written any code. He wants a course this summer that starts from the very beginning and teaches him how to make his own simple website. He doesn''t mind if adults are also on the course.',
    'B'
  );

  perform _tmp_insert_matching(p2_id, 9,
    'Ines has just finished her school exams in Spain and will start a business degree in London in September. She is worried about her English being good enough for writing essays and giving talks. She needs an intensive course before her degree starts.',
    'G'
  );

  perform _tmp_insert_matching(p2_id, 10,
    'Diego is 16 and loves cooking at home. He would like to spend part of the summer trying out what it''s like to work in a real kitchen. He can only spare one week and needs somewhere that accepts people his age.',
    'C'
  );


  -- ─── PART 3 — Long text + multiple choice (5 preguntas A/B/C/D) ─
  insert into exam_parts (exam_id, skill, part_number, title, instructions, order_index, settings)
  values (
    exam_id, 'reading', 3, 'Long text — Leaving the office behind',
    'Read the text and questions below. For each question, choose the correct answer — A, B, C or D.',
    2,
    ('{"question_type_hint":"multiple_choice","expected_count":5,'
     '"reading_text":"Leaving the office behind\n\nWhen I tell people what I do for a living, they usually laugh and ask if I''m serious. I''m 26, I teach sailing to teenagers, and until three years ago I was training to be a lawyer in a big city firm. Nobody, including my parents, expected me to end up here.\n\nI grew up on the coast, but I never thought about a career connected to the sea. In my family, ''getting a proper job'' was very important. My mother worked for the same insurance company for thirty years, and my father was a school head teacher. When I told them, aged 17, that I wanted to study law at a top university, they were delighted. I worked incredibly hard for four years and got the marks I needed. From the outside, everything was going exactly as planned.\n\nMy problems began during my first year working at a law firm in Madrid. The work itself was not the worst part — it was interesting some days, boring on others, but manageable. What surprised me was how tired I felt all the time, even at weekends. I stopped exercising, I hardly saw my old friends, and I couldn''t remember the last time I''d done anything just because I enjoyed it. I told myself this was normal for young lawyers, and that things would get better once I got promoted.\n\nThe turning point came during a two-week holiday. My father invited me to help him teach a group of children how to sail during the summer, something he had done as a volunteer for years. I said yes without thinking too much — I just needed to be near the sea. Those two weeks I woke up early every morning without an alarm, ate lunch outside, and went to bed exhausted in the good way, not the empty way I felt in Madrid. On the last day, I sat on the beach and realised I hadn''t once thought about work.\n\nGoing back to the office after that holiday was very hard. I tried to continue for another six months, hoping the feeling would go away, but it didn''t. I finally spoke to my parents at Christmas. My mother cried a little, my father was very quiet, and then he asked me one question: ''Would you go back and study law again if you could choose today?'' I didn''t need to think about my answer.\n\nThree months later I moved back to the coast. My father and I now run a small sailing school together. I earn much less than I would have as a lawyer, and some months are financially difficult. But I sleep well every night, and I never feel that empty tiredness any more. My mother still worries a bit, but she came to visit last summer and said she had never seen me smile so much."}')::jsonb
  )
  returning id into p3_id;

  perform _tmp_insert_mc4(p3_id, 11,
    'How did the writer''s family feel when she decided to study law?',
    'B',
    'They were worried that she had made the wrong choice.',
    'They were very happy with her decision.',
    'They tried to convince her to choose something else.',
    'They wanted her to work in insurance like her mother.'
  );

  perform _tmp_insert_mc4(p3_id, 12,
    'What was the main problem the writer had during her first year at the law firm?',
    'D',
    'The work was too difficult for someone with her experience.',
    'She didn''t get on well with the other young lawyers.',
    'The office was in a city she didn''t want to live in.',
    'She felt constantly tired and had stopped enjoying life.'
  );

  perform _tmp_insert_mc4(p3_id, 13,
    'What happened during the two-week holiday with her father?',
    'C',
    'She decided immediately that she would give up law.',
    'She trained to become a professional sailing instructor.',
    'She realised how different she felt away from the office.',
    'She began planning a business with her father.'
  );

  perform _tmp_insert_mc4(p3_id, 14,
    'When the writer finally talked to her parents at Christmas, her father',
    'A',
    'asked her a question that helped her be honest with herself.',
    'tried to persuade her to give her job one more year.',
    'told her he had always wanted her to work by the sea.',
    'offered her a job in his sailing school straight away.'
  );

  perform _tmp_insert_mc4(p3_id, 15,
    'What is the writer''s attitude to her new life in the last paragraph?',
    'C',
    'She is proud of earning as much as she did as a lawyer.',
    'She wishes she had made the change several years earlier.',
    'She accepts the difficulties because she is much happier.',
    'She thinks her mother now regrets asking her to change back.'
  );


  -- ─── PART 4 — Gapped text (5 preguntas) ──────────────────────────
  insert into exam_parts (exam_id, skill, part_number, title, instructions, order_index, settings)
  values (
    exam_id, 'reading', 4, 'Gapped text — Working and studying at the same time',
    'Five sentences have been removed from the text below. For each question, choose the correct sentence from A–H. There are three extra sentences you do not need.',
    3,
    ('{"question_type_hint":"multiple_matching","expected_count":5,'
     '"base_text":"Working and studying at the same time\n\nWhen I started university two years ago, I promised myself I would just focus on my studies and not get a job during term time. My parents helped me with the money I needed, and my student loan covered the rest. (16) ____ By the end of my first year, I had begun to feel that I wanted my own money and, more importantly, some experience outside the classroom.\n\nFinding my first job was harder than I expected. Most places wanted someone who could work full-time hours, or who had experience in the same kind of work before. (17) ____ It only paid a little, but it was very close to the university and the manager was happy for me to change my hours during exam periods.\n\nThe first few weeks were exhausting. I was going from lectures straight to the café, and then home to study late into the night. (18) ____ Instead, I started planning my week every Sunday evening, deciding exactly when I would study, work, sleep and rest. Once I did that, everything became more manageable.\n\nWhat surprised me most was how much the job helped my studies, not the other way round. At the café, I learned to talk to all kinds of people I would never meet at university. (19) ____ These are skills that no lecture had ever taught me, and I now use them every day.\n\nOf course, some weeks are still difficult, especially around exams. (20) ____ But most of the time, I''m glad I made the decision to work part-time. I have my own money, I''ve made new friends outside the university, and I feel more prepared for life after my degree than most of my classmates.","matching_options":['
     '{"letter":"A","text":"I even had to ask my manager to give me two weeks off with no pay to prepare properly."},'
     '{"letter":"B","text":"For that reason, I felt I didn''t need to worry about earning extra money."},'
     '{"letter":"C","text":"In the end, I got a weekend job in a small café near my flat."},'
     '{"letter":"D","text":"I learned to solve problems quickly and to stay calm when things went wrong."},'
     '{"letter":"E","text":"I decided to leave university and work in the café full-time instead."},'
     '{"letter":"F","text":"After a month like this, I realised I couldn''t continue that way for long."},'
     '{"letter":"G","text":"My parents told me they were proud of me for finding my own solution."},'
     '{"letter":"H","text":"By the end of the first term, I stopped studying completely."}'
     ']}')::jsonb
  )
  returning id into p4_id;

  perform _tmp_insert_gapped(p4_id, 16, 'Gap 16', 'B');
  perform _tmp_insert_gapped(p4_id, 17, 'Gap 17', 'C');
  perform _tmp_insert_gapped(p4_id, 18, 'Gap 18', 'F');
  perform _tmp_insert_gapped(p4_id, 19, 'Gap 19', 'D');
  perform _tmp_insert_gapped(p4_id, 20, 'Gap 20', 'A');


  -- ─── PART 5 — Multiple choice cloze (6 preguntas A/B/C/D) ────────
  insert into exam_parts (exam_id, skill, part_number, title, instructions, order_index, settings)
  values (
    exam_id, 'reading', 5, 'Multiple choice cloze — How to choose a university',
    'Read the text below and choose the correct word for each gap. For each question, choose the correct answer — A, B, C or D.',
    4,
    ('{"question_type_hint":"multiple_choice_cloze","expected_count":6,'
     '"base_text":"How to choose a university\n\nChoosing which university to (21) ____ is one of the most important decisions many young people ever make. It is easy to feel a lot of pressure from family, teachers and friends, and to (22) ____ your final choice on what other people expect from you. However, most of the students I know who are truly happy at university started by asking themselves one simple question: what do I actually want from these three or four years?\n\nBefore you start looking at rankings, try to think about how you like to (23) ____ . Some students do best in large lectures with hundreds of people, while others need small classes to feel comfortable. It is also worth (24) ____ where you would like to live. Studying in a big city can be exciting, but rents are usually higher, and getting home to see your family may take longer.\n\nTalking to current students is one of the most useful things you can do. They will happily tell you what a place is really (25) ____ , which is often quite different from what the official website says. Finally, (26) ____ your time — most universities have open days, and visiting one before you apply can help you avoid a mistake that would be hard to change later."}')::jsonb
  )
  returning id into p5_id;

  perform _tmp_insert_mc_cloze4(p5_id, 21, 'Gap 21', 'B',
    'take', 'attend', 'follow', 'reach'
  );

  perform _tmp_insert_mc_cloze4(p5_id, 22, 'Gap 22', 'A',
    'base', 'set', 'build', 'place'
  );

  perform _tmp_insert_mc_cloze4(p5_id, 23, 'Gap 23', 'C',
    'know', 'read', 'learn', 'teach'
  );

  perform _tmp_insert_mc_cloze4(p5_id, 24, 'Gap 24', 'D',
    'wondering', 'guessing', 'imagining', 'considering'
  );

  perform _tmp_insert_mc_cloze4(p5_id, 25, 'Gap 25', 'C',
    'similar', 'famous', 'like', 'known'
  );

  perform _tmp_insert_mc_cloze4(p5_id, 26, 'Gap 26', 'A',
    'take', 'spend', 'have', 'do'
  );


  -- ─── PART 6 — Writing: email (100 words) ─────────────────────────
  insert into exam_parts (exam_id, skill, part_number, title, instructions, order_index, settings)
  values (
    exam_id, 'writing', 6, 'Writing Part 1 — Email',
    'You must answer this question. Write your answer in about 100 words.',
    5,
    '{"question_type_hint":"writing_task","expected_count":1}'::jsonb
  )
  returning id into p6_id;

  perform _tmp_insert_writing(p6_id, 27,
    'Read this email from your English friend Jamie and the notes you have made. Write your email to Jamie using all your notes.',
    ('{"task_instruction":"Read this email from your English friend Jamie and the notes you have made. Write your email using ALL the four notes.",'
     '"task_type":"email",'
     '"word_count_min":90,'
     '"word_count_max":110,'
     '"email_from":"Jamie",'
     '"email_subject":"Studying abroad next year",'
     '"email_body":"Hi!\n\nGreat to hear from you! Guess what — I''m thinking about spending next year studying in your country. My teachers say it would be a good idea, but I''m a bit nervous.\n\nWhat''s the best city for a student like me? [say which city and why]\n\nHow much money will I need every month? [give some idea]\n\nWhat should I do in the summer before I come? [suggest something]\n\nAnd is there anything you wish someone had told you before you started university? [tell me!]\n\nThanks so much for any advice!\n\nJamie",'
     '"notes":['
     '{"label":"Suggest a city","text":"Say which city and why"},'
     '{"label":"Monthly cost","text":"Give some idea of how much money"},'
     '{"label":"Before coming","text":"Suggest something to do in summer"},'
     '{"label":"Tip","text":"Something you wish you had known"}'
     ']}')::jsonb
  );


  -- ─── PART 7 — Writing: article OR story (100 words) ─────────────
  insert into exam_parts (exam_id, skill, part_number, title, instructions, order_index, settings)
  values (
    exam_id, 'writing', 7, 'Writing Part 2 — Article or story',
    'Choose one of the following. Write your answer in about 100 words.',
    6,
    '{"question_type_hint":"writing_task","expected_count":1,"choice_required":true}'::jsonb
  )
  returning id into p7_id;

  perform _tmp_insert_writing(p7_id, 28,
    'Choose ONE of the tasks (A or B) and write your answer in about 100 words.',
    ('{"task_instruction":"You must choose ONE of the two options below.",'
     '"task_type":"article_or_story",'
     '"word_count_min":90,'
     '"word_count_max":110,'
     '"choices":['
     '{"letter":"A","type":"article","title":"Article for the school magazine",'
     '"prompt":"You see this notice in your school magazine:\n\nARTICLES WANTED\n\nThe best way to learn something new\n\nWhat is the best way to learn a new skill — by watching videos online, by taking classes, or by asking friends and family? Tell us which one you think works best and why.\n\nThe best articles will be published in next month''s magazine!\n\nWrite your article."},'
     '{"letter":"B","type":"story","title":"Short story",'
     '"prompt":"Your English teacher has asked you to write a story. Your story must begin with this sentence:\n\nIt was my first week at university when everything changed.\n\nWrite your story."}'
     ']}')::jsonb
  );


  raise notice 'B1 Mock 03 (Work and study) loaded successfully. Exam ID: %', exam_id;

end $$;


-- ─── Limpieza de funciones helper ───────────────────────────────────
drop function if exists _tmp_insert_mc_notice(uuid, int, text, text, char, text, text, text);
drop function if exists _tmp_insert_mc4(uuid, int, text, char, text, text, text, text);
drop function if exists _tmp_insert_matching(uuid, int, text, char);
drop function if exists _tmp_insert_gapped(uuid, int, text, char);
drop function if exists _tmp_insert_mc_cloze4(uuid, int, text, char, text, text, text, text);
drop function if exists _tmp_insert_open_cloze(uuid, int, text, text);
drop function if exists _tmp_insert_writing(uuid, int, text, jsonb);


-- =====================================================================
-- Verificación
-- =====================================================================
-- Comprueba que se insertaron todas las preguntas correctamente:
--
-- select p.part_number, p.title, count(q.id) as num_questions
--   from exam_parts p
--   join exams e on e.id = p.exam_id
--   left join questions q on q.part_id = p.id
--   where e.title like 'B1 Preliminary Mock 03%'
--   group by p.part_number, p.title
--   order by p.part_number;
--
-- Esperado:
--   1 · Signs and short messages          → 5
--   2 · Matching people to summer courses → 5
--   3 · Long text                         → 5
--   4 · Gapped text                       → 5
--   5 · Multiple choice cloze             → 6
--   6 · Writing Part 1 — Email            → 1
--   7 · Writing Part 2                    → 1
--   TOTAL: 28 preguntas
-- =====================================================================
