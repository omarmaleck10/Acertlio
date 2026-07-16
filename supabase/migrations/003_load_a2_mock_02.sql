-- =====================================================================
-- ACERTLIO — Carga de mock A2-02 (Tiempo libre)
-- =====================================================================
-- Prerequisito: haber ejecutado 002_load_a2_mock_01.sql (crea las funciones helper).
--
-- Este script reutiliza las funciones helper _tmp_insert_* creadas en 002.
-- Si las has eliminado, vuelve a ejecutar 002 primero (o solo las CREATE FUNCTION).
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
    'A2 Key Mock 02 — Tiempo libre',
    'A2', 2,
    'Segundo mock A2 Key. Tema: tiempo libre (deportes, viajes, pasatiempos, celebraciones). Contenido 100% original.',
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
    'Message from Luis to his sister: I forgot my swimming things at home. Can you bring my bag to the pool? I finish training at 6.',
    'Luis wants his sister to', 'B',
    'meet him at the pool.',
    'bring him something he left at home.',
    'wait for him after training.'
  );

  perform _tmp_insert_mc_notice(p1_id, 2,
    'NOTICE AT A BUS STATION — Coach to the mountains — leaves at 8.15. Passengers with skis, please use the back door.',
    'The notice tells people with skis that', 'A',
    'they should get on the bus in a different way.',
    'the coach cannot take ski equipment.',
    'they must buy an extra ticket.'
  );

  perform _tmp_insert_mc_notice(p1_id, 3,
    'Text from Emma to her friends: I can''t come to the cinema tonight — I have too much homework. Enjoy the film! Tell me if it was good tomorrow.',
    'Emma wants to', 'B',
    'meet her friends later this evening.',
    'hear about the film later.',
    'see a different film.'
  );

  perform _tmp_insert_mc_notice(p1_id, 4,
    'SIGN AT A MUSEUM — Photos allowed in the main hall only. No cameras or phones in the special exhibition.',
    'Visitors can take photos', 'B',
    'everywhere in the museum.',
    'in one part of the museum.',
    'only with permission from staff.'
  );

  perform _tmp_insert_mc_notice(p1_id, 5,
    'Email from a running club: Sunday''s race is cancelled because of the storm. We will run at the same time next Sunday. See you then!',
    'The email tells members that', 'A',
    'the race is one week later.',
    'the race starts at a new time.',
    'they can choose when to run.'
  );

  perform _tmp_insert_mc_notice(p1_id, 6,
    'Note from Mum on the fridge: Grandad''s birthday party starts at 4. Wear something nice — not your football clothes!',
    'Mum wants her child to', 'C',
    'buy new clothes for the party.',
    'not go to football today.',
    'dress smartly for the party.'
  );

  -- ─── PART 2 — Matching (activities) ─────────────────────────────
  insert into exam_parts (exam_id, skill, part_number, title, instructions, order_index, settings)
  values (
    exam_id, 'reading', 2, 'People and activities matching',
    'Read the descriptions of seven people who want to try a new activity. Then read the descriptions of eight activities (A–H). Decide which activity would be the most suitable for each person.',
    1,
    jsonb_build_object(
      'question_type_hint', 'multiple_matching',
      'expected_count', 7,
      'matching_options', jsonb_build_array(
        jsonb_build_object('letter', 'A', 'text', 'Weekend football league — Every Saturday afternoon, teams of eight play matches at the city sports centre. Serious players only — you must be able to play well and attend most matches. Age 18+.'),
        jsonb_build_object('letter', 'B', 'text', 'Beginners'' painting — Two-hour classes on Thursday evenings at the local library. All materials provided. The teacher is very patient with people who have never painted before. Small groups of six.'),
        jsonb_build_object('letter', 'C', 'text', 'Sunday family cycling — Guided rides for parents and children in the safe cycle park outside the city. Bikes for all ages. The rides last two hours and stop several times so children can rest.'),
        jsonb_build_object('letter', 'D', 'text', 'Mountain walking group — Meets every Saturday morning at 7 for walks in the hills. You need your own transport to reach the meeting point. Walks last four to five hours. Suitable for people who are already fit.'),
        jsonb_build_object('letter', 'E', 'text', 'Saturday morning yoga — Gentle yoga classes for adults who want to start their weekend peacefully. Classes are held in a quiet studio. The teacher explains everything, so beginners are welcome. You practise alone on your mat.'),
        jsonb_build_object('letter', 'F', 'text', 'Photography for beginners — Learn to use your camera or phone to take better photos. Wednesday evenings, six weeks. Includes trips to interesting places in the city. Good for meeting new people.'),
        jsonb_build_object('letter', 'G', 'text', 'Chess club — Meets Tuesday evenings at 7 in a café near the university. Players of all levels welcome. Very cheap — just the price of your drink. Members are mostly students.'),
        jsonb_build_object('letter', 'H', 'text', 'City walking tours — Two-hour tours in the city centre every weekend. Learn about local history while walking. Small groups of adults, mostly in their twenties and thirties. New people are welcome.')
      )
    )
  )
  returning id into p2_id;

  perform _tmp_insert_matching(p2_id, 1, 'James works long hours during the week. He wants to try something on Saturday morning that helps him relax. He is not interested in doing exercise with other people.', 'E');
  perform _tmp_insert_matching(p2_id, 2, 'Nadia loves being outside. She would like to learn something that she can do in the countryside near her town. She has a car and does not mind travelling.', 'D');
  perform _tmp_insert_matching(p2_id, 3, 'Rafael is a student. He wants an activity that does not cost much money and that he can do in the evening after his classes.', 'G');
  perform _tmp_insert_matching(p2_id, 4, 'Clara has two young children. She is looking for something the family can enjoy together at the weekend. The activity should be safe for children.', 'C');
  perform _tmp_insert_matching(p2_id, 5, 'Tom is very sporty and enjoys competition. He wants to join a team that plays every week.', 'A');
  perform _tmp_insert_matching(p2_id, 6, 'Sofia wants to learn something creative that she can do at home in bad weather. She has never been very artistic and needs a class for beginners.', 'B');
  perform _tmp_insert_matching(p2_id, 7, 'Marco has just moved to a new city and does not know many people. He wants an activity where he can meet others of his age (about thirty).', 'F');

  -- ─── PART 3 — Long text: My first trip to the mountains ─────────
  insert into exam_parts (exam_id, skill, part_number, title, instructions, order_index, settings)
  values (
    exam_id, 'reading', 3, 'Long text — My first trip to the mountains',
    'Read the text and questions below. For each question, choose the correct answer — A, B or C.',
    2,
    jsonb_build_object(
      'question_type_hint', 'multiple_choice',
      'expected_count', 5,
      'reading_text', 'MY FIRST TRIP TO THE MOUNTAINS

I never really liked the mountains. My family lives near the beach, and when I was young, we spent all our summer holidays swimming and playing in the sand. My father tried a few times to take us on walks in the hills, but I always complained. I said the mountains were boring, and I wanted to go back to the sea.

Last winter, everything changed. My best friend Luca invited me to spend a weekend with his family at their small house in the mountains. His father said we would try skiing. I did not want to go, but my parents said it would be good for me to try something new.

The first day was terrible. The bus journey took four hours, and I felt sick. When we arrived, it was very cold, and my ski boots hurt my feet. In my first lesson, I fell down about twenty times. Luca was already good at skiing, and I felt embarrassed watching him.

But on the second day, something happened. I started to move down the small hill without falling. Slowly, I understood how to control my skis. By the afternoon, I could ski from the top of the small hill to the bottom, and I was laughing all the way. Luca''s father took a video and sent it to my parents.

At the end of the weekend, when we were driving home, I was already thinking about the next winter. My mother laughed when I told her I wanted to go skiing again. "Now the beach is boring, is it?" she said. I told her the beach was still nice — but the mountains were better in winter.'
    )
  )
  returning id into p3_id;

  perform _tmp_insert_mc(p3_id, 1, 'As a child, why did the writer not like the mountains?', 'B',
    'His parents took him there too often.',
    'He preferred beach holidays with his family.',
    'The walks in the hills were too long.');
  perform _tmp_insert_mc(p3_id, 2, 'How did the writer feel about going skiing with Luca?', 'B',
    'He was excited to try something new.',
    'His parents made him go.',
    'He wanted to visit Luca''s family.');
  perform _tmp_insert_mc(p3_id, 3, 'What happened on the writer''s first day of skiing?', 'B',
    'He hurt his feet badly.',
    'He fell over many times.',
    'He didn''t have a lesson.');
  perform _tmp_insert_mc(p3_id, 4, 'What changed on the second day?', 'C',
    'Luca''s father taught him.',
    'He got better skis.',
    'He learned to ski down the hill.');
  perform _tmp_insert_mc(p3_id, 5, 'How does the writer feel about the beach now?', 'B',
    'He does not like it any more.',
    'He still enjoys it, but prefers skiing in winter.',
    'He wants to move to the mountains.');

  -- ─── PART 4 — MC cloze: My grandfather's hobby ──────────────────
  insert into exam_parts (exam_id, skill, part_number, title, instructions, order_index, settings)
  values (
    exam_id, 'reading', 4, 'Multiple-choice cloze — My grandfather''s hobby',
    'Read the text below and decide which answer (A, B or C) best fits each gap.',
    3,
    jsonb_build_object(
      'question_type_hint', 'multiple_choice_cloze',
      'expected_count', 6,
      'base_text', 'MY GRANDFATHER''S HOBBY

My grandfather is seventy-two years old, but he is very active. His favourite (1) …… is making model boats. He started when he was a young man, and now he has more than fifty boats in his house.

Each boat takes many months to (2) …… . Grandfather cuts every piece of wood himself. Then he paints them with special colours. He says he never gets (3) …… of it, because every boat is different.

Sometimes, on Saturday afternoons, I visit him and he (4) …… me how to make small parts. It is difficult, but I enjoy learning. My grandfather is very patient. He never gets angry (5) …… I make a mistake.

Last month, we finished a big blue boat together. I was so happy that I sent (6) …… photo of it to all my friends. Grandfather said it was the best boat we had ever made.'
    )
  )
  returning id into p4_id;

  perform _tmp_insert_mc_cloze(p4_id, 1, 'gap 1', 'A', 'hobby', 'work', 'game');
  perform _tmp_insert_mc_cloze(p4_id, 2, 'gap 2', 'B', 'end', 'finish', 'stop');
  perform _tmp_insert_mc_cloze(p4_id, 3, 'gap 3', 'C', 'angry', 'sad', 'tired');
  perform _tmp_insert_mc_cloze(p4_id, 4, 'gap 4', 'A', 'shows', 'looks', 'watches');
  perform _tmp_insert_mc_cloze(p4_id, 5, 'gap 5', 'A', 'if', 'so', 'but');
  perform _tmp_insert_mc_cloze(p4_id, 6, 'gap 6', 'B', 'the', 'a', 'any');

  -- ─── PART 5 — Open cloze: Summer trip ────────────────────────────
  insert into exam_parts (exam_id, skill, part_number, title, instructions, order_index, settings)
  values (
    exam_id, 'reading', 5, 'Open cloze — Summer trip email',
    'Read the message below and write the missing words. Write ONE word for each gap.',
    4,
    jsonb_build_object(
      'question_type_hint', 'open_cloze',
      'expected_count', 6,
      'base_text', 'From: Diego
To: Karim
Subject: Summer trip

Hi Karim,

How are you? I have great news. My parents said we (1) …… go on a trip together this summer. They will pay for the train tickets, so we only need to pay (2) …… food and one night in a hotel.

I was thinking of going (3) …… the coast. There is a small town called Portello that my cousin visited last year. She said the beaches (4) …… beautiful and the seafood is amazing.

Would you like (5) …… come with me? We could stay for three or four days. Let me know if you (6) …… interested, and I will start planning.

See you soon,
Diego'
    )
  )
  returning id into p5_id;

  perform _tmp_insert_open_cloze(p5_id, 1, 'gap 1 — modal possibility', 'could|can');
  perform _tmp_insert_open_cloze(p5_id, 2, 'gap 2 — pay for collocation', 'for');
  perform _tmp_insert_open_cloze(p5_id, 3, 'gap 3 — preposition of destination', 'to');
  perform _tmp_insert_open_cloze(p5_id, 4, 'gap 4 — be verb', 'are|were');
  perform _tmp_insert_open_cloze(p5_id, 5, 'gap 5 — would like + to', 'to');
  perform _tmp_insert_open_cloze(p5_id, 6, 'gap 6 — are you', 'are');

  -- ─── PART 6 — Writing 1 (weekend visit email) ────────────────────
  insert into exam_parts (exam_id, skill, part_number, title, instructions, time_minutes, order_index, settings)
  values (
    exam_id, 'writing', 6, 'Writing 1 — Guided email',
    'You are going to write an email to your English friend, Alex. Read the message from Alex and the notes you have made. Write an email to Alex using all the notes.',
    15, 5,
    '{"question_type_hint":"writing_task","expected_count":1}'::jsonb
  )
  returning id into p6_id;

  perform _tmp_insert_writing(p6_id, 1,
    'From: Alex — Subject: Weekend visit

Hi! I have a free weekend next month and I want to visit your city. I love sports and museums. Can you recommend one interesting thing to do? What is the best day to come? Is there a nice place where we can have lunch together?

Alex

Write an email to Alex using ALL the notes below.',
    jsonb_build_object(
      'task_type', 'email',
      'word_count_min', 25,
      'word_count_max', 35,
      'notes', jsonb_build_array(
        'Recommend one thing to do',
        'Say which day is best',
        'Suggest a place for lunch',
        'Say you can''t wait to see Alex'
      )
    )
  );

  -- ─── PART 7 — Writing 2 (Maya's birthday story) ─────────────────
  insert into exam_parts (exam_id, skill, part_number, title, instructions, time_minutes, order_index, settings)
  values (
    exam_id, 'writing', 7, 'Writing 2 — Story',
    'Your English teacher has asked you to write a story. Your story must begin with the sentence below. Write your story in about 35 words.',
    15, 6,
    '{"question_type_hint":"writing_task","expected_count":1}'::jsonb
  )
  returning id into p7_id;

  perform _tmp_insert_writing(p7_id, 1,
    'Write a short story that begins with the sentence: "It was Maya''s birthday, and there was a big box on the table."',
    jsonb_build_object(
      'task_type', 'story',
      'word_count_min', 30,
      'word_count_max', 45,
      'opening_sentence', 'It was Maya''s birthday, and there was a big box on the table.'
    )
  );

  raise notice 'A2-02 creado con éxito. Exam ID: %', exam_id;

end $$;
