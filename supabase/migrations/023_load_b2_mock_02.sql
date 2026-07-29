-- =====================================================================
-- ACERTLIO — Carga de mock B2-02 (Technology & society)
-- =====================================================================
-- Segundo mock B2 First. Estructura oficial Cambridge First post-2015:
--   · Reading and Use of English (75 min · 52 preguntas · 7 parts)
--   · Writing (80 min · 2 tareas)
--
-- Tema del mock: Technology & society
--   - Trabajo remoto y videollamadas
--   - Aplicaciones y su historia
--   - Adicción digital y desconexión
--   - Cocina tradicional en Instagram (perfil)
--   - El renacimiento del podcast
--   - Cuatro relaciones distintas con las redes sociales
--
-- Contenido 100% original.
--
-- Ejecutar tras 001-022. Recrea las funciones helper temporalmente.
-- =====================================================================


-- ─── Funciones helper temporales ────────────────────────────────────

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

create or replace function _tmp_insert_open_cloze(
  p_part_id uuid, p_num int, p_gap_note text, p_correct text
) returns uuid as $$
declare q_id uuid;
begin
  insert into questions (part_id, question_number, question_type, stem, correct_answer, points, order_index)
  values (p_part_id, p_num, 'open_cloze', p_gap_note, p_correct, 1, p_num - 1)
  returning id into q_id;
  return q_id;
end;
$$ language plpgsql;

create or replace function _tmp_insert_word_form(
  p_part_id uuid, p_num int, p_base_word text, p_correct text
) returns uuid as $$
declare q_id uuid;
begin
  insert into questions (part_id, question_number, question_type, stem, correct_answer, points, order_index, context)
  values (p_part_id, p_num, 'open_cloze', p_base_word, p_correct, 1, p_num - 1,
          jsonb_build_object('base_word', p_base_word))
  returning id into q_id;
  return q_id;
end;
$$ language plpgsql;

create or replace function _tmp_insert_key_transform(
  p_part_id uuid, p_num int, p_original text, p_keyword text, p_lead_in text, p_lead_out text, p_correct text
) returns uuid as $$
declare q_id uuid;
begin
  insert into questions (part_id, question_number, question_type, stem, correct_answer, points, order_index, context)
  values (p_part_id, p_num, 'open_cloze',
          format('Original: %s | Palabra clave: %s | Reescribe: %s ______ %s',
                 p_original, upper(p_keyword), p_lead_in, p_lead_out),
          p_correct, 2, p_num - 1,
          jsonb_build_object(
            'original_sentence', p_original,
            'key_word', upper(p_keyword),
            'lead_in', p_lead_in,
            'lead_out', p_lead_out
          ))
  returning id into q_id;
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
-- MOCK B2-02 — TECHNOLOGY & SOCIETY
-- =====================================================================
do $$
declare
  exam_id uuid;
  p1_id uuid; p2_id uuid; p3_id uuid; p4_id uuid;
  p5_id uuid; p6_id uuid; p7_id uuid;
  p8_id uuid; p9_id uuid;
begin

  insert into exams (title, level, mock_number, description, total_time_minutes, is_published, version)
  values (
    'B2 First Mock 02 — Technology & society',
    'B2', 2,
    'Segundo mock B2 First. Tema: tecnología y sociedad — trabajo remoto, aplicaciones, adicción digital, redes sociales, podcasts. Reading and Use of English (75 min · 52 preguntas) + Writing (80 min · 2 tareas). Contenido 100% original.',
    155, true, 1
  )
  returning id into exam_id;


  -- ─── PART 1 — Multiple choice cloze (8 preguntas A/B/C/D) ────────
  insert into exam_parts (exam_id, skill, part_number, title, instructions, order_index, settings)
  values (
    exam_id, 'reading', 1, 'Multiple choice cloze — Working from home: the new normal',
    'For questions 1-8, read the text below and decide which answer (A, B, C or D) best fits each gap.',
    0,
    ('{"question_type_hint":"multiple_choice_cloze","expected_count":8,'
     '"base_text":"Working from home: the new normal\n\nUntil quite recently, working from home was something most companies (1) ____ upon with suspicion. Managers worried that employees would be distracted, and many workers themselves felt uncomfortable at the idea of blurring the line between their professional and personal lives. All that changed almost overnight when circumstances forced millions of people to (2) ____ up remote working, whether they liked it or not.\n\nWhat has surprised everyone is how well, on the whole, the experiment has worked. Studies carried out over the past few years have consistently shown that productivity has stayed the same or even risen. Many workers report that they (3) ____ more done in a day at home than they ever did in the office, partly because they are no (4) ____ interrupted by meetings that could have been an email.\n\nHowever, the picture is not entirely positive. A significant number of employees have (5) ____ to feel isolated, particularly those who live alone or who joined a company after the shift to remote work. It is much harder to build friendships, ask for informal help or simply (6) ____ up with what colleagues are doing when everything happens through a screen.\n\nMany companies have responded by adopting a ''hybrid'' approach, where staff come into the office two or three days a week. This model, though popular, is not (7) ____ its critics. Some argue that it produces the disadvantages of both worlds — the tiredness of commuting without the full benefits of being in the office — and that companies should choose one or the (8) ____ ."}')::jsonb
  )
  returning id into p1_id;

  perform _tmp_insert_mc_cloze4(p1_id, 1, 'Gap 1', 'C',
    'saw', 'watched', 'looked', 'viewed'
  );
  perform _tmp_insert_mc_cloze4(p1_id, 2, 'Gap 2', 'B',
    'catch', 'take', 'put', 'get'
  );
  perform _tmp_insert_mc_cloze4(p1_id, 3, 'Gap 3', 'A',
    'get', 'take', 'make', 'find'
  );
  perform _tmp_insert_mc_cloze4(p1_id, 4, 'Gap 4', 'D',
    'more', 'again', 'further', 'longer'
  );
  perform _tmp_insert_mc_cloze4(p1_id, 5, 'Gap 5', 'B',
    'wanted', 'come', 'gone', 'become'
  );
  perform _tmp_insert_mc_cloze4(p1_id, 6, 'Gap 6', 'A',
    'keep', 'stay', 'catch', 'hold'
  );
  perform _tmp_insert_mc_cloze4(p1_id, 7, 'Gap 7', 'C',
    'beyond', 'above', 'without', 'against'
  );
  perform _tmp_insert_mc_cloze4(p1_id, 8, 'Gap 8', 'D',
    'another', 'else', 'second', 'other'
  );


  -- ─── PART 2 — Open cloze (8 preguntas, sin opciones) ─────────────
  insert into exam_parts (exam_id, skill, part_number, title, instructions, order_index, settings)
  values (
    exam_id, 'reading', 2, 'Open cloze — The story behind our favourite apps',
    'For questions 9-16, read the text below and think of the word which best fits each gap. Use only ONE word in each gap.',
    1,
    ('{"question_type_hint":"open_cloze","expected_count":8,'
     '"base_text":"The story behind our favourite apps\n\nMost of us open dozens of apps every day without giving much thought (9) ____ where they came from. And yet, behind almost every successful app there is a fascinating story — usually one involving a small group of people, a lot of failure, and something unexpected happening at just the right moment.\n\nTake photo-sharing apps, for example. The one that eventually became the most popular in the world was originally designed (10) ____ a check-in service, similar to those that let users tell their friends which restaurant or bar they were in. It was only (11) ____ the founders noticed that people were spending far more time on the photo feature than on the location feature that they decided to focus on images (12) ____ .\n\nMessaging apps have similar histories. Many of the ones we now use daily were built by tiny teams working on almost no budget. In (13) ____ cases, the founders were simply frustrated by existing options and built (14) ____ they wished existed. Once these apps started to grow, they grew astonishingly quickly, partly (15) ____ friends invited friends, and partly because they solved a real problem that older tools had never quite managed to.\n\nWhat all these stories have in common is that (16) ____ of the founders knew, at the beginning, what their app would become. They started with a small idea, listened carefully to what users actually did, and were willing to change direction when the evidence pointed that way."}')::jsonb
  )
  returning id into p2_id;

  perform _tmp_insert_open_cloze(p2_id, 9, 'Gap 9', 'to');
  perform _tmp_insert_open_cloze(p2_id, 10, 'Gap 10', 'as');
  perform _tmp_insert_open_cloze(p2_id, 11, 'Gap 11', 'when');
  perform _tmp_insert_open_cloze(p2_id, 12, 'Gap 12', 'instead');
  perform _tmp_insert_open_cloze(p2_id, 13, 'Gap 13', 'many|most|some');
  perform _tmp_insert_open_cloze(p2_id, 14, 'Gap 14', 'what');
  perform _tmp_insert_open_cloze(p2_id, 15, 'Gap 15', 'because');
  perform _tmp_insert_open_cloze(p2_id, 16, 'Gap 16', 'none');


  -- ─── PART 3 — Word formation (8 preguntas) ───────────────────────
  insert into exam_parts (exam_id, skill, part_number, title, instructions, order_index, settings)
  values (
    exam_id, 'reading', 3, 'Word formation — Are we too connected?',
    'For questions 17-24, read the text below. Use the word given in capitals at the end of some of the lines to form a word that fits in the gap in the same line.',
    2,
    ('{"question_type_hint":"word_formation","expected_count":8,'
     '"base_text":"Are we too connected?\n\nThe average adult now checks their phone more than eighty times a day. For many people, the (17) ____ [CONNECT] this gives us feels essential — but it also comes at a cost that we are only just beginning to understand.\n\nSome psychologists now describe our relationship with our devices as a form of mild (18) ____ [ADDICT]. The design of most apps encourages us to keep coming back: notifications, ''likes'' and new content are all carefully engineered to be almost (19) ____ [RESIST]. Even when we know we should put our phones down, doing so proves surprisingly hard.\n\nThe (20) ____ [DIFFER] between generations are particularly striking. Teenagers who have grown up with smartphones show levels of (21) ____ [DEPEND] on their devices that older adults find hard to imagine, and mental health specialists are increasingly worried about the effects on sleep, concentration and self-esteem.\n\nAt the same time, we should be careful not to blame technology for everything. Millions of (22) ____ [USE] find the same tools help them build friendships, learn new skills or work more (23) ____ [PRODUCT]. The question is not whether these tools are good or bad in themselves, but whether we are learning fast enough to use them (24) ____ [SENSE]."}')::jsonb
  )
  returning id into p3_id;

  perform _tmp_insert_word_form(p3_id, 17, 'CONNECT', 'connection|connectivity');
  perform _tmp_insert_word_form(p3_id, 18, 'ADDICT', 'addiction');
  perform _tmp_insert_word_form(p3_id, 19, 'RESIST', 'irresistible');
  perform _tmp_insert_word_form(p3_id, 20, 'DIFFER', 'differences');
  perform _tmp_insert_word_form(p3_id, 21, 'DEPEND', 'dependence|dependency');
  perform _tmp_insert_word_form(p3_id, 22, 'USE', 'users');
  perform _tmp_insert_word_form(p3_id, 23, 'PRODUCT', 'productively');
  perform _tmp_insert_word_form(p3_id, 24, 'SENSE', 'sensibly');


  -- ─── PART 4 — Key word transformations (6 preguntas · 2 puntos) ──
  insert into exam_parts (exam_id, skill, part_number, title, instructions, order_index, settings)
  values (
    exam_id, 'reading', 4, 'Key word transformations',
    'For questions 25-30, complete the second sentence so that it has a similar meaning to the first sentence, using the word given. Do not change the word given. You must use between TWO and FIVE words, including the word given.',
    3,
    '{"question_type_hint":"key_word_transformation","expected_count":6,"points_per_question":2}'::jsonb
  )
  returning id into p4_id;

  perform _tmp_insert_key_transform(p4_id, 25,
    'It''s such a long time since Emma called her grandmother.',
    'ages',
    'It',
    'Emma called her grandmother.',
    'has been ages since|has been ages since that'
  );

  perform _tmp_insert_key_transform(p4_id, 26,
    'They will finish building the new app before the end of the month.',
    'been',
    'The new app',
    'by the end of the month.',
    'will have been built|will have been finished|will have been completed'
  );

  perform _tmp_insert_key_transform(p4_id, 27,
    'I regret not learning to code when I was younger.',
    'wish',
    'I',
    'to code when I was younger.',
    'wish I had learned|wish I had learnt|wish that I had learned|wish that I had learnt'
  );

  perform _tmp_insert_key_transform(p4_id, 28,
    'It is possible that the meeting will be cancelled tomorrow.',
    'might',
    'The meeting',
    'tomorrow.',
    'might be cancelled|might get cancelled|might be called off'
  );

  perform _tmp_insert_key_transform(p4_id, 29,
    'Sarah did not know how to use the new software, so her colleague helped her.',
    'shown',
    'Sarah had to',
    'to use the new software by her colleague.',
    'be shown how|be shown the way'
  );

  perform _tmp_insert_key_transform(p4_id, 30,
    'They pay Marco a very good salary at his new job.',
    'paid',
    'Marco',
    'at his new job.',
    'is paid very well|is paid a very good salary|is well paid|gets paid very well'
  );


  -- ─── PART 5 — Long text + multiple choice (6 preguntas A/B/C/D) ─
  insert into exam_parts (exam_id, skill, part_number, title, instructions, order_index, settings)
  values (
    exam_id, 'reading', 5, 'Long text — Grandma goes viral',
    'You are going to read an article about an unusual social media star. For questions 31-36, choose the answer (A, B, C or D) which you think fits best according to the text.',
    4,
    ('{"question_type_hint":"multiple_choice","expected_count":6,'
     '"reading_text":"Grandma goes viral\n\nAt seventy-eight years old, Rosa Martínez had never sent a text message in her life. She lived in a small village in southern Spain, cooked the same recipes her mother had taught her, and had strong opinions about how mobile phones were destroying the world. So when her granddaughter Lucía arrived one summer with the idea of filming her grandmother cooking and putting the videos online, Rosa''s first reaction was a firm no. It took two weeks of gentle persuasion, and the promise that she would not have to look at the camera or say anything unnatural, before she finally agreed to a trial.\n\nWhat happened next surprised everybody, including Lucía herself. The first video — three minutes of Rosa making bread rolls in her old kitchen, occasionally muttering to herself in Andalusian dialect — was uploaded on a Sunday evening. By Monday morning it had been viewed thirty thousand times. By the following weekend, the number was closer to two million. Comments were flooding in from Mexico, Argentina, the United States and Japan, most of them variations of the same message: this looks exactly like my grandmother.\n\nRosa did not really understand what had happened. Lucía tried to explain the concept of ''going viral'' several times, but Rosa was more interested in the fact that people from so many different countries had written to her. She insisted on Lucía reading her every comment, and she began writing responses which Lucía then translated and posted. When one viewer in Chile explained that she had lost her own grandmother and that Rosa''s videos had made her cry, Rosa spent three days trying to write a letter of comfort. Lucía had to convince her that a short reply would be more appropriate.\n\nSince that first summer, three years ago, Rosa''s account has grown to more than two hundred thousand followers. She has, to her own quiet astonishment, become the face of a growing movement of people rediscovering traditional cooking. Brands have offered her contracts, magazines have flown journalists to her village, and one television channel wanted to build a whole show around her. Rosa has said no to almost everything. ''I already have a kitchen and a granddaughter,'' she tells anyone who asks. ''What else would I need?''\n\nLucía admits that managing her grandmother''s new fame has become almost a full-time job, which she is doing while finishing her university studies. She reads every message, chooses the ones Rosa will see, and quietly deletes the small number that are unkind or inappropriate. Rosa never sees these; Lucía is firm that her grandmother should be protected from the worst side of the internet. In return, Rosa insists that any money the videos generate is split equally between the two of them.\n\nWhat interests Lucía most, however, is what her grandmother''s success reveals about the audience. In an age when everything online seems to be faster, louder and more polished, what many viewers appear to want is the exact opposite: a slow, quiet person doing something real, with her hands, in her own home. Lucía has begun to think seriously about studying communication research after her degree, in part because she now believes there is much more of this hunger out there, waiting for someone to notice it.\n\nAsked recently what she has learned from being on social media, Rosa thought for a long moment. ''That people are lonelier than I realised,'' she said. ''And that a small kindness reaches further than you think.'' Then she went back into the kitchen to start on tomorrow''s video."}')::jsonb
  )
  returning id into p5_id;

  perform _tmp_insert_mc4(p5_id, 31,
    'What do we learn about Rosa in the first paragraph?',
    'C',
    'She had strong opinions about social media before starting her videos.',
    'She had regularly filmed her own cooking for family members.',
    'She had to be convinced to accept her granddaughter''s idea.',
    'She had never sent a message on her own mobile phone.'
  );

  perform _tmp_insert_mc4(p5_id, 32,
    'What was most surprising about the response to Rosa''s first video?',
    'B',
    'The number of professional cooks who watched it and commented.',
    'Its rapid spread to viewers in countries far from Spain.',
    'The way people asked questions about Rosa''s cooking techniques.',
    'How quickly it was picked up by television news programmes.'
  );

  perform _tmp_insert_mc4(p5_id, 33,
    'How did Rosa react to becoming popular online?',
    'D',
    'She was excited by the idea of becoming famous around the world.',
    'She was upset that so many people were watching her privately.',
    'She was disappointed that her recipes were not the main attraction.',
    'She was more moved by individual comments than by the numbers.'
  );

  perform _tmp_insert_mc4(p5_id, 34,
    'What point is made about the commercial offers Rosa has received?',
    'A',
    'She has turned down most of the opportunities to make money from her fame.',
    'She has accepted only offers that involve her granddaughter.',
    'She has been offered less than she deserves for her work.',
    'She uses the money to help others in her village.'
  );

  perform _tmp_insert_mc4(p5_id, 35,
    'What do we learn about Lucía''s role in the fifth paragraph?',
    'B',
    'She has stopped studying at university to look after her grandmother''s account.',
    'She protects her grandmother from negative aspects of being online.',
    'She receives a small salary from Rosa for her help.',
    'She sometimes disagrees with her grandmother about how to respond to comments.'
  );

  perform _tmp_insert_mc4(p5_id, 36,
    'What does Lucía think Rosa''s success tells us about online audiences?',
    'C',
    'They are becoming interested in learning traditional skills themselves.',
    'They enjoy content that is short and easy to understand quickly.',
    'They are attracted to something slower and more genuine than most content.',
    'They prefer videos made by older people rather than young influencers.'
  );


  -- ─── PART 6 — Gapped text: párrafos (6 preguntas) ────────────────
  insert into exam_parts (exam_id, skill, part_number, title, instructions, order_index, settings)
  values (
    exam_id, 'reading', 6, 'Gapped text — The unexpected rise of podcasts',
    'You are going to read an article about podcasts. Six sentences have been removed from the article. Choose from the sentences A-G the one which fits each gap (37-42). There is one extra sentence which you do not need to use.',
    5,
    ('{"question_type_hint":"multiple_matching","expected_count":6,'
     '"base_text":"The unexpected rise of podcasts\n\nWhen radio began losing listeners in the early 2000s, most experts assumed that audio content was dying. Video, they argued, was faster and more engaging, and a generation raised on YouTube would have no patience for content they could not see. Two decades later, they have been proved spectacularly wrong.\n\n(37) ____ In the United States alone, more than a hundred million people now listen to podcasts every month, and similar patterns are emerging in Europe, Latin America and parts of Asia. What was until recently a niche hobby has become one of the most influential forms of media.\n\nWhy has audio, of all things, come back? Part of the answer lies in how modern life is organised. Most of us spend hours each day in situations — commuting, exercising, doing housework — where we cannot easily watch a screen. (38) ____ For millions of people, listening to a podcast turns time that used to feel wasted into time that feels genuinely useful.\n\nThe format itself is also unusually flexible. Video content is expensive and technically demanding to produce, but a good podcast requires little more than two people, a microphone and something interesting to say. (39) ____ This has led to an extraordinary range of shows: from serious investigations produced by professional journalists to intimate conversations recorded in someone''s bedroom.\n\nThe economics of podcasting have also proved surprising. For a long time, most podcasts made no money at all, and their creators produced them for the love of it. That has slowly changed. (40) ____ These now generate significant income, either through advertising, listener donations, or paid subscriptions.\n\nWhat listeners themselves often mention is the sense of connection they feel with hosts. Because podcasts are typically listened to through headphones, and often at a slower pace than video, the experience feels remarkably personal. (41) ____ This intimacy is something video, for all its visual appeal, has never quite managed to reproduce.\n\nOf course, the format has its critics. Some argue that many podcasts are simply too long, particularly interviews which can stretch beyond three hours. Others point out that the industry is dominated by voices that already had audiences, making it harder for new voices to be heard. (42) ____ For now, however, most listeners seem to have decided that these problems are outweighed by what podcasts uniquely offer.","matching_options":['
     '{"letter":"A","text":"Loyal followers of a show often describe the host as a friend, even though they have never met."},'
     '{"letter":"B","text":"Audio is one of the few things we can genuinely enjoy while doing something else."},'
     '{"letter":"C","text":"Podcasting, once written off as a hobby for enthusiasts, has quietly become one of the fastest-growing forms of entertainment in the world."},'
     '{"letter":"D","text":"These are real concerns that the industry will need to address as it grows."},'
     '{"letter":"E","text":"A small number of successful shows now attract audiences comparable to those of major television programmes."},'
     '{"letter":"F","text":"This low barrier to entry has allowed almost anyone to become a broadcaster."},'
     '{"letter":"G","text":"Producers are also experimenting with visual versions of their podcasts to reach even wider audiences."}'
     ']}')::jsonb
  )
  returning id into p6_id;

  perform _tmp_insert_gapped(p6_id, 37, 'Gap 37', 'C');
  perform _tmp_insert_gapped(p6_id, 38, 'Gap 38', 'B');
  perform _tmp_insert_gapped(p6_id, 39, 'Gap 39', 'F');
  perform _tmp_insert_gapped(p6_id, 40, 'Gap 40', 'E');
  perform _tmp_insert_gapped(p6_id, 41, 'Gap 41', 'A');
  perform _tmp_insert_gapped(p6_id, 42, 'Gap 42', 'D');


  -- ─── PART 7 — Multiple matching (10 preguntas · 4 personas) ──────
  insert into exam_parts (exam_id, skill, part_number, title, instructions, order_index, settings)
  values (
    exam_id, 'reading', 7, 'Multiple matching — Four people, four relationships with social media',
    'You are going to read an article in which four people talk about their relationship with social media. For questions 43-52, choose from the people (A-D). The people may be chosen more than once.',
    6,
    ('{"question_type_hint":"multiple_matching","expected_count":10,'
     '"base_text":"Four people, four relationships with social media\n\nA. JULIÁN, 25, journalist\nMy job basically requires me to be on several platforms all day. I use them to find stories, contact sources and share the pieces I write. So the idea of deleting my accounts is simply not realistic — I''d be out of work within a month. What I have done instead is try to draw a firmer line between work use and personal use. I check nothing after eight in the evening, and I put my phone in a drawer for the whole weekend. My colleagues thought I was mad at first, but two of them have started copying me. What surprised me most was how much of my anxiety disappeared once I stopped scrolling in bed. I sleep about an hour more now, and I don''t wake up already feeling behind on the day. I''d still say social media is mostly useful for me, but only because I''ve learned to control it rather than the other way round.\n\nB. ELENA, 32, doctor\nTwo years ago, I deleted every social media account I had, and I have never regretted the decision. I don''t judge people who use them — this was about me, not about the platforms — but I could feel they were making me unhappy in a way I couldn''t quite explain. Since I left, I''ve read more books than in the previous ten years combined. I''ve started running seriously, and I''ve reconnected with old friends by actually calling them, which none of us used to do. The one thing I do miss is finding out about events and small local news, which used to happen almost automatically through my feeds. Now I have to make more effort to know what''s happening in my city, but honestly, I don''t always mind not knowing.\n\nC. MARCUS, 45, small business owner\nI ran a small furniture workshop for fifteen years without any social media presence at all. About three years ago, my daughter finally convinced me to try Instagram. I''ll admit I resisted for a long time — I''d never taken a photo I was proud of, and I wasn''t sure my work was interesting enough to show. What has happened since then has changed my business completely. I now sell about seventy per cent of my furniture directly to customers who first saw it online, and I''ve reached people I could never have reached through a shop. My daughter helps me with the more technical side, and I focus on choosing what to photograph and writing short descriptions. The only downside is that I sometimes catch myself worrying about what will get more likes rather than what I most want to make. That worries me a little, and I''m trying to be aware of it.\n\nD. ANA, 28, teacher\nI''ve never deleted my accounts entirely, but I use a number of apps that limit how long I can spend on each platform every day. When I hit my limit, the app locks me out until the next morning. I set these controls up two years ago after realising I was spending more than three hours a day on my phone, which I found genuinely shocking. What has changed is not just the amount of time — it''s the quality of my attention. I used to feel scattered and jumpy all the time, and now I don''t. My students have noticed too. I''m more present in the classroom, more patient, and I think a much better teacher for it. I''m not saying this is easy, and there are days when I still miss my old habits. But I would never go back.","matching_options":['
     '{"letter":"A","text":"Julián"},'
     '{"letter":"B","text":"Elena"},'
     '{"letter":"C","text":"Marcus"},'
     '{"letter":"D","text":"Ana"}'
     ']}')::jsonb
  )
  returning id into p7_id;

  perform _tmp_insert_matching(p7_id, 43,
    'Which person has noticed improvements in how they feel physically since making a change?',
    'A'
  );
  perform _tmp_insert_matching(p7_id, 44,
    'Which person mentions being slow to accept the idea of using a platform?',
    'C'
  );
  perform _tmp_insert_matching(p7_id, 45,
    'Which person acknowledges concerns about how the platform influences their creative decisions?',
    'C'
  );
  perform _tmp_insert_matching(p7_id, 46,
    'Which person describes a specific downside they miss from being disconnected?',
    'B'
  );
  perform _tmp_insert_matching(p7_id, 47,
    'Which person believes they have improved at their job since changing their habits?',
    'D'
  );
  perform _tmp_insert_matching(p7_id, 48,
    'Which person mentions that colleagues have adopted a similar approach?',
    'A'
  );
  perform _tmp_insert_matching(p7_id, 49,
    'Which person emphasises that their choice was personal rather than a judgement of others?',
    'B'
  );
  perform _tmp_insert_matching(p7_id, 50,
    'Which person uses technology to enforce their own limits?',
    'D'
  );
  perform _tmp_insert_matching(p7_id, 51,
    'Which person''s decision led to a major change in their business results?',
    'C'
  );
  perform _tmp_insert_matching(p7_id, 52,
    'Which person admits they still occasionally miss their old behaviour?',
    'D'
  );


  -- ─── PART 8 — Writing Part 1: Essay obligatorio (140-190 palabras)
  insert into exam_parts (exam_id, skill, part_number, title, instructions, order_index, settings)
  values (
    exam_id, 'writing', 8, 'Writing Part 1 — Essay',
    'You must answer this question. Write your answer in 140-190 words in an appropriate style.',
    7,
    '{"question_type_hint":"writing_task","expected_count":1}'::jsonb
  )
  returning id into p8_id;

  perform _tmp_insert_writing(p8_id, 53,
    'In your English class you have been talking about technology and society. Now, your English teacher has asked you to write an essay.',
    ('{"task_instruction":"You must answer this question. Write your essay in 140-190 words in an appropriate style. You must use ALL the notes.",'
     '"task_type":"essay",'
     '"word_count_min":140,'
     '"word_count_max":190,'
     '"essay_question":"Some people believe that modern technology is making our lives easier. Others think it is creating more problems than it solves. What do you think?",'
     '"essay_notes":['
     '{"label":"Notes","text":"Write about:"},'
     '{"label":"1","text":"how technology has improved our daily lives (communication, information, convenience)"},'
     '{"label":"2","text":"the new problems technology has created (stress, addiction, loneliness)"},'
     '{"label":"3","text":"____________ (your own idea)"}'
     ']}')::jsonb
  );


  -- ─── PART 9 — Writing Part 2: Choose one (140-190 palabras) ──────
  insert into exam_parts (exam_id, skill, part_number, title, instructions, order_index, settings)
  values (
    exam_id, 'writing', 9, 'Writing Part 2 — Article, email or review',
    'Write an answer to ONE of the questions in this part. Write your answer in 140-190 words in an appropriate style.',
    8,
    '{"question_type_hint":"writing_task","expected_count":1,"choice_required":true}'::jsonb
  )
  returning id into p9_id;

  perform _tmp_insert_writing(p9_id, 54,
    'Choose ONE of the tasks (A, B or C) and write your answer in 140-190 words.',
    ('{"task_instruction":"You must choose ONE of the three options below.",'
     '"task_type":"article_email_or_review",'
     '"word_count_min":140,'
     '"word_count_max":190,'
     '"choices":['
     '{"letter":"A","type":"article","title":"Article for a student website",'
     '"prompt":"You see the following announcement on a student website:\n\nARTICLES WANTED\n\nHow has technology changed the way you study?\n\nWe are looking for articles from students around the world. Tell us about a specific technology or app that has changed the way you study, whether the change has been positive or negative, and what advice you would give other students.\n\nThe best articles will be published on our home page.\n\nWrite your article."},'
     '{"letter":"B","type":"email","title":"Email to an English-speaking friend",'
     '"prompt":"You have received this email from your English-speaking friend Sam:\n\n\"Hi! I''m thinking of taking a break from social media for a month, but I''m a bit nervous about it. Have you ever tried something like that? Do you think it would help me? What should I do to make it easier? Any advice would be really useful. Thanks!\"\n\nWrite your email to Sam."},'
     '{"letter":"C","type":"review","title":"Review of an app or online service",'
     '"prompt":"You have seen this notice on a website for students learning English:\n\nREVIEWS WANTED\n\nHave you recently used an app or online service that has genuinely improved your life? Write us a review saying what it is, what it does, why you like it, and whether you would recommend it to others.\n\nWrite your review."}'
     ']}')::jsonb
  );


  raise notice 'B2 First Mock 02 (Technology & society) loaded successfully. Exam ID: %', exam_id;

end $$;


-- ─── Limpieza de funciones helper ───────────────────────────────────
drop function if exists _tmp_insert_mc_cloze4(uuid, int, text, char, text, text, text, text);
drop function if exists _tmp_insert_open_cloze(uuid, int, text, text);
drop function if exists _tmp_insert_word_form(uuid, int, text, text);
drop function if exists _tmp_insert_key_transform(uuid, int, text, text, text, text, text);
drop function if exists _tmp_insert_mc4(uuid, int, text, char, text, text, text, text);
drop function if exists _tmp_insert_matching(uuid, int, text, char);
drop function if exists _tmp_insert_gapped(uuid, int, text, char);
drop function if exists _tmp_insert_writing(uuid, int, text, jsonb);


-- =====================================================================
-- Verificación
-- =====================================================================
-- select p.part_number, p.title, count(q.id) as num_questions
--   from exam_parts p
--   join exams e on e.id = p.exam_id
--   left join questions q on q.part_id = p.id
--   where e.title like 'B2 First Mock 02%'
--   group by p.part_number, p.title
--   order by p.part_number;
--
-- Esperado (9 filas, total 54 preguntas):
--   1 · Multiple choice cloze          →  8
--   2 · Open cloze                     →  8
--   3 · Word formation                 →  8
--   4 · Key word transformations       →  6
--   5 · Long text                      →  6
--   6 · Gapped text                    →  6
--   7 · Multiple matching              → 10
--   8 · Writing Part 1 — Essay         →  1
--   9 · Writing Part 2                 →  1
--   TOTAL: 54 preguntas
-- =====================================================================
