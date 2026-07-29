-- =====================================================================
-- ACERTLIO — Carga de mock B2-01 (Environment & sustainability)
-- =====================================================================
-- Primer mock B2 First. Estructura oficial Cambridge First post-2015:
--   · Reading and Use of English (75 min · 52 preguntas · 7 parts)
--   · Writing (80 min · 2 tareas)
--
-- Tema del mock: Environment & sustainability
--   - Plástico en los océanos
--   - Energías renovables
--   - Consumo consciente
--   - Conservación de la fauna
--   - Agricultura urbana
--   - Estilos de vida sostenibles
--
-- Contenido 100% original.
--
-- Ejecutar tras 001-021. Recrea las funciones helper temporalmente.
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
-- MOCK B2-01 — ENVIRONMENT & SUSTAINABILITY
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
    'B2 First Mock 01 — Environment & sustainability',
    'B2', 1,
    'Primer mock B2 First. Tema: medio ambiente, energías renovables, consumo consciente, conservación, agricultura urbana. Reading and Use of English (75 min · 52 preguntas) + Writing (80 min · 2 tareas). Contenido 100% original.',
    155, true, 1
  )
  returning id into exam_id;


  -- ─── PART 1 — Multiple choice cloze (8 preguntas A/B/C/D) ────────
  insert into exam_parts (exam_id, skill, part_number, title, instructions, order_index, settings)
  values (
    exam_id, 'reading', 1, 'Multiple choice cloze — Plastic in our oceans',
    'For questions 1-8, read the text below and decide which answer (A, B, C or D) best fits each gap.',
    0,
    ('{"question_type_hint":"multiple_choice_cloze","expected_count":8,'
     '"base_text":"Plastic in our oceans\n\nEvery year, an estimated eight million tonnes of plastic (1) ____ up in our oceans, threatening marine life and eventually returning to us through the food chain. Although plastic pollution has been (2) ____ headlines for decades, the scale of the problem has only recently become clear thanks to fresh scientific research.\n\nOne of the main (3) ____ is single-use packaging: bottles, bags, straws and food containers that are used once and thrown away. Even when these items are disposed of properly, they often escape from waste systems and (4) ____ their way into rivers and, eventually, the sea. Once there, sunlight and salt water break them down into tiny particles known as microplastics, which are almost impossible to (5) ____ .\n\nEncouragingly, governments and companies around the world are starting to (6) ____ action. Several countries have introduced bans on plastic bags, while major brands have committed to using recycled materials in their packaging. However, campaigners warn that these steps, though welcome, are unlikely to be enough on their (7) ____ .\n\nWhat is really needed, they argue, is a fundamental shift in how we produce and consume goods — moving away from a throwaway culture towards one where products are designed to be repaired, reused and, only as a last (8) ____ , recycled."}')::jsonb
  )
  returning id into p1_id;

  perform _tmp_insert_mc_cloze4(p1_id, 1, 'Gap 1', 'B',
    'come', 'end', 'go', 'turn'
  );
  perform _tmp_insert_mc_cloze4(p1_id, 2, 'Gap 2', 'D',
    'writing', 'giving', 'showing', 'making'
  );
  perform _tmp_insert_mc_cloze4(p1_id, 3, 'Gap 3', 'A',
    'culprits', 'suspects', 'enemies', 'attackers'
  );
  perform _tmp_insert_mc_cloze4(p1_id, 4, 'Gap 4', 'C',
    'get', 'take', 'find', 'run'
  );
  perform _tmp_insert_mc_cloze4(p1_id, 5, 'Gap 5', 'A',
    'remove', 'wipe', 'clean', 'clear'
  );
  perform _tmp_insert_mc_cloze4(p1_id, 6, 'Gap 6', 'B',
    'do', 'take', 'make', 'give'
  );
  perform _tmp_insert_mc_cloze4(p1_id, 7, 'Gap 7', 'C',
    'alone', 'single', 'own', 'only'
  );
  perform _tmp_insert_mc_cloze4(p1_id, 8, 'Gap 8', 'D',
    'chance', 'try', 'idea', 'resort'
  );


  -- ─── PART 2 — Open cloze (8 preguntas, sin opciones) ─────────────
  insert into exam_parts (exam_id, skill, part_number, title, instructions, order_index, settings)
  values (
    exam_id, 'reading', 2, 'Open cloze — The rise of solar energy',
    'For questions 9-16, read the text below and think of the word which best fits each gap. Use only ONE word in each gap.',
    1,
    ('{"question_type_hint":"open_cloze","expected_count":8,'
     '"base_text":"The rise of solar energy\n\nA decade ago, solar power was seen (9) ____ a promising but expensive technology, suitable only for wealthy homeowners or specialist applications. Since (10) ____ , the picture has changed dramatically. The cost of solar panels has fallen by more (11) ____ eighty per cent, and today it is often the cheapest way to generate electricity in many parts of the world.\n\nThis extraordinary drop in prices is (12) ____ result of a combination of factors. Improvements in manufacturing have made panels more efficient, while mass production has driven costs down. At the (13) ____ time, governments have offered financial support to encourage households and businesses to install them.\n\nThe results speak for themselves. In countries (14) ____ Germany and Spain, entire towns now rely almost entirely on solar power during the summer months. Even in places with less sunshine, panels are proving surprisingly effective. If current trends continue, solar could become the world''s largest source of electricity (15) ____ 2040.\n\nOf course, challenges remain. Storing energy for use at night, and dealing (16) ____ old panels at the end of their life, are two issues that engineers are still working to solve. But for the first time in history, a clean, affordable and abundant source of power is genuinely within reach."}')::jsonb
  )
  returning id into p2_id;

  perform _tmp_insert_open_cloze(p2_id, 9, 'Gap 9', 'as');
  perform _tmp_insert_open_cloze(p2_id, 10, 'Gap 10', 'then');
  perform _tmp_insert_open_cloze(p2_id, 11, 'Gap 11', 'than');
  perform _tmp_insert_open_cloze(p2_id, 12, 'Gap 12', 'the');
  perform _tmp_insert_open_cloze(p2_id, 13, 'Gap 13', 'same');
  perform _tmp_insert_open_cloze(p2_id, 14, 'Gap 14', 'like');
  perform _tmp_insert_open_cloze(p2_id, 15, 'Gap 15', 'by');
  perform _tmp_insert_open_cloze(p2_id, 16, 'Gap 16', 'with');


  -- ─── PART 3 — Word formation (8 preguntas) ───────────────────────
  insert into exam_parts (exam_id, skill, part_number, title, instructions, order_index, settings)
  values (
    exam_id, 'reading', 3, 'Word formation — Buying less, buying better',
    'For questions 17-24, read the text below. Use the word given in capitals at the end of some of the lines to form a word that fits in the gap in the same line.',
    2,
    ('{"question_type_hint":"word_formation","expected_count":8,'
     '"base_text":"Buying less, buying better\n\nOver the past decade, there has been a (17) ____ [NOTICE] shift in the way many young people think about shopping. Instead of buying large quantities of cheap clothes, many now prefer to invest in fewer, higher-quality items that will last for years.\n\nThe reasons for this change are largely (18) ____ [ENVIRONMENT]. Fast fashion has become one of the most polluting industries on the planet, and consumers now show much greater (19) ____ [AWARE] of the impact their choices have.\n\nBrands have responded to this trend with mixed (20) ____ [SUCCEED]. Some have made genuine efforts to reduce waste and use more sustainable materials, while others have been accused of (21) ____ [MISLEAD] advertising — presenting themselves as ethical without changing their actual practices.\n\nFor shoppers, telling the (22) ____ [DIFFERENT] between real commitment and clever marketing can be tricky. Experts recommend checking a brand''s (23) ____ [PRODUCE] methods and looking for independent certifications. It also helps to ask a simple question: do I really need this, or am I just being influenced by (24) ____ [ADVERTISE]?"}')::jsonb
  )
  returning id into p3_id;

  perform _tmp_insert_word_form(p3_id, 17, 'NOTICE', 'noticeable');
  perform _tmp_insert_word_form(p3_id, 18, 'ENVIRONMENT', 'environmental');
  perform _tmp_insert_word_form(p3_id, 19, 'AWARE', 'awareness');
  perform _tmp_insert_word_form(p3_id, 20, 'SUCCEED', 'success');
  perform _tmp_insert_word_form(p3_id, 21, 'MISLEAD', 'misleading');
  perform _tmp_insert_word_form(p3_id, 22, 'DIFFERENT', 'difference');
  perform _tmp_insert_word_form(p3_id, 23, 'PRODUCE', 'production');
  perform _tmp_insert_word_form(p3_id, 24, 'ADVERTISE', 'advertising|advertisement|advertisements');


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
    'The last time I saw my old teacher was five years ago.',
    'seen',
    'I',
    'my old teacher for five years.',
    'have not seen|haven''t seen|have not seen|haven''t seen'
  );

  perform _tmp_insert_key_transform(p4_id, 26,
    'They started building the new library three years ago.',
    'has',
    'The new library',
    'for three years.',
    'has been being built|has been under construction|has been built|has been being constructed'
  );

  perform _tmp_insert_key_transform(p4_id, 27,
    'She spent so much time on the project that she was exhausted.',
    'much',
    'She was exhausted because she had',
    'time on the project.',
    'spent so much|put so much|used so much|devoted so much'
  );

  perform _tmp_insert_key_transform(p4_id, 28,
    'If we do not act now, the situation will get worse.',
    'unless',
    'The situation will get worse',
    'now.',
    'unless we act|unless we take action|unless we do something|unless we start acting'
  );

  perform _tmp_insert_key_transform(p4_id, 29,
    'Nobody expected the campaign to be so successful.',
    'come',
    'The campaign''s success',
    'a surprise to everyone.',
    'came as|came as such|came as quite'
  );

  perform _tmp_insert_key_transform(p4_id, 30,
    'It is not necessary for you to attend the meeting tomorrow.',
    'need',
    'You',
    'the meeting tomorrow.',
    'do not need to attend|don''t need to attend|need not attend|do not need to go to|don''t need to go to'
  );


  -- ─── PART 5 — Long text + multiple choice (6 preguntas A/B/C/D) ─
  insert into exam_parts (exam_id, skill, part_number, title, instructions, order_index, settings)
  values (
    exam_id, 'reading', 5, 'Long text — The woman who counts butterflies',
    'You are going to read an article about a wildlife scientist. For questions 31-36, choose the answer (A, B, C or D) which you think fits best according to the text.',
    4,
    ('{"question_type_hint":"multiple_choice","expected_count":6,'
     '"reading_text":"The woman who counts butterflies\n\nEvery morning at exactly six o''clock, Dr Elena Vargas walks out of her small cottage on the edge of a forest in northern Spain, notebook in hand, and begins her daily count. She has been doing this, in the same square kilometre of mixed woodland, for the past twenty-three years. The subject of her research is butterflies — specifically, the sixty-one species that live in this particular area — and what she has discovered is troubling scientists across Europe.\n\nWhen Vargas first arrived here as a young researcher in her late twenties, her work was considered slightly eccentric. Butterfly counting was, at that time, seen as a hobby for enthusiastic amateurs rather than serious science. What has changed since then, and what has made her research suddenly matter, is the growing understanding that butterflies act as an early warning system for the health of entire ecosystems. Their short lifespans, sensitivity to temperature and dependence on specific plants make them, in her words, ''the perfect early-warning species''. When butterfly numbers fall, other declines usually follow.\n\nAnd her figures have been falling for years. Of the sixty-one species she started monitoring, seven have completely disappeared from her patch of forest, and a further twenty-two are now present in numbers so small that she considers them at serious risk. Only fourteen appear to be genuinely stable. ''When I began,'' she recalls, ''a single afternoon walk in July might produce more than a thousand butterflies. Last July, on the best day of the summer, I counted three hundred and seven.''\n\nWhat surprises visitors most is Vargas''s reaction to these findings. Rather than becoming discouraged, she has grown more determined. Part of this comes from what she has learned about how quickly nature can recover when given the chance. In one small meadow near her cottage, where she convinced a local farmer to stop using pesticides seven years ago, three species have returned that she thought were gone forever. ''Nature doesn''t give up on itself,'' she says. ''So neither can we.''\n\nHer approach has attracted attention well beyond scientific circles. Documentaries have been made about her work, and she now trains volunteers from across the region to carry out similar counts in their own local areas. What used to be lonely work is now, she says, ''a small movement''. Some of her most enthusiastic volunteers are teenagers who first heard about her through social media, a phenomenon she finds both amusing and moving.\n\nBut Vargas is careful not to overstate what her data can tell us. She is quick to point out that a single square kilometre in northern Spain cannot represent butterfly populations across the continent, and she encourages other researchers to publish their own local findings. What she does insist on, however, is that we take the results of long-term observation seriously — even when they come from what might look like a small, quiet corner of the world. ''The forest doesn''t care about grants or headlines,'' she says with a smile. ''It just tells the truth about what''s happening, if we bother to look.''\n\nAsked what will happen when she can no longer walk her forest route each morning, Vargas shrugs. Two of her volunteers have already committed to continuing the count. ''The most important thing about this work,'' she says, ''is that somebody keeps doing it. It''s not really about me.''"}')::jsonb
  )
  returning id into p5_id;

  perform _tmp_insert_mc4(p5_id, 31,
    'What point does the writer make about Dr Vargas''s work in the first two paragraphs?',
    'C',
    'Her long experience means her findings are more reliable than those of other researchers.',
    'She was one of the first scientists to focus on this particular area of Spain.',
    'The importance of her research is now recognised in a way it was not initially.',
    'Her techniques for counting butterflies have been widely adopted by amateur enthusiasts.'
  );

  perform _tmp_insert_mc4(p5_id, 32,
    'Why does Vargas describe butterflies as ''the perfect early-warning species''?',
    'B',
    'They live longer than most insects, so changes are easier to detect over time.',
    'Their sensitivity to environmental change makes declines in their numbers meaningful.',
    'They cover a wider geographical range than other insects being studied.',
    'The plants they depend on are also useful for measuring pollution levels.'
  );

  perform _tmp_insert_mc4(p5_id, 33,
    'How does Vargas suggest her count from last July compared with earlier years?',
    'D',
    'It was better than expected given weather conditions that summer.',
    'It was surprisingly similar to counts she had done in previous decades.',
    'It varied dramatically from one day to another during the month.',
    'It was a small fraction of what she used to record on similar walks.'
  );

  perform _tmp_insert_mc4(p5_id, 34,
    'What does Vargas find encouraging, according to the fourth paragraph?',
    'A',
    'Species can return quickly when the right changes are made.',
    'Local farmers are increasingly willing to change how they work.',
    'Her research has finally begun to influence government policy.',
    'The species she thought had disappeared were still present in small numbers.'
  );

  perform _tmp_insert_mc4(p5_id, 35,
    'What does Vargas say about her volunteers?',
    'D',
    'Most of them are older people with time to devote to fieldwork.',
    'She spends more time training them than doing her own research.',
    'Their local counts have already produced more useful data than her own.',
    'She is pleased that some young people have become involved through the internet.'
  );

  perform _tmp_insert_mc4(p5_id, 36,
    'In the final two paragraphs, Vargas is mainly making the point that',
    'A',
    'consistent long-term observation matters more than who is doing it.',
    'her own contribution has been more important than most people realise.',
    'butterfly research needs more funding if it is to continue in the future.',
    'the situation is more serious than her data has been able to show so far.'
  );


  -- ─── PART 6 — Gapped text: párrafos (6 preguntas) ────────────────
  insert into exam_parts (exam_id, skill, part_number, title, instructions, order_index, settings)
  values (
    exam_id, 'reading', 6, 'Gapped text — Growing food on rooftops',
    'You are going to read an article about urban farming. Six sentences have been removed from the article. Choose from the sentences A-G the one which fits each gap (37-42). There is one extra sentence which you do not need to use.',
    5,
    ('{"question_type_hint":"multiple_matching","expected_count":6,'
     '"base_text":"Growing food on rooftops\n\nIn cities around the world, a quiet transformation is taking place above our heads. Roofs that used to be empty concrete surfaces are being turned into vegetable gardens, herb beds and even small orchards. This movement, known as rooftop farming, is changing the way people think about where their food comes from — and whose responsibility it is to grow it.\n\n(37) ____ The main reason is space: in dense urban areas, land at ground level is expensive and in short supply, but rooftops are often unused. What was once considered wasted space is now being reimagined as one of the few remaining places to grow food within cities.\n\nThe benefits go well beyond simply producing vegetables. Rooftop gardens can significantly reduce the temperature inside a building by absorbing sunlight that would otherwise heat the roof directly. (38) ____ In densely built areas, where surfaces of asphalt and concrete raise temperatures dramatically during summer, this effect can improve the comfort of thousands of people who never even set foot on the roof itself.\n\nStill, the practical challenges of rooftop farming should not be underestimated. Buildings vary enormously in how much weight they can safely support, and soil — especially wet soil — is far heavier than most people imagine. (39) ____ In some older buildings, adding a full garden is simply impossible without structural work that would cost more than the food would ever be worth.\n\nAnother concern is that rooftop farms are dependent on the goodwill of building owners. Many of the most successful projects are on the roofs of schools, universities or public buildings, where the goals are as much educational as productive. (40) ____ Private landlords, on the other hand, are often reluctant to hand over valuable roof space to what they see as a risky and unpredictable use.\n\nDespite these challenges, the number of rooftop farms continues to grow, driven partly by a change in what city residents want from where they live. (41) ____ Being able to buy fresh salad grown in the building next door — or even in one''s own building — connects urban life to something that feels older and more meaningful than a supermarket shelf.\n\nWhat is less certain is how much rooftop farming can really contribute to feeding cities. Even the most ambitious projects produce only a small fraction of the food consumed by nearby residents. (42) ____ In this sense, rooftop farming is perhaps best understood as one small part of a much larger transformation in how we grow, share and think about our food.","matching_options":['
     '{"letter":"A","text":"The trend towards local food, transparency about where produce comes from, and interest in growing edible plants at home are all part of the same broader shift."},'
     '{"letter":"B","text":"This means that any serious rooftop garden requires an engineer''s assessment before work can begin."},'
     '{"letter":"C","text":"But their real value may lie in changing attitudes rather than in the calories they provide."},'
     '{"letter":"D","text":"Rooftop farming is booming, and it is not hard to see why."},'
     '{"letter":"E","text":"For these owners, an educational rooftop farm is often seen as a valuable use of otherwise empty space."},'
     '{"letter":"F","text":"They also cool the surrounding area, reducing what scientists call the ''urban heat island'' effect."},'
     '{"letter":"G","text":"Recent studies suggest that the average city dweller travels further than ever before to reach fresh, unprocessed food."}'
     ']}')::jsonb
  )
  returning id into p6_id;

  perform _tmp_insert_gapped(p6_id, 37, 'Gap 37', 'D');
  perform _tmp_insert_gapped(p6_id, 38, 'Gap 38', 'F');
  perform _tmp_insert_gapped(p6_id, 39, 'Gap 39', 'B');
  perform _tmp_insert_gapped(p6_id, 40, 'Gap 40', 'E');
  perform _tmp_insert_gapped(p6_id, 41, 'Gap 41', 'A');
  perform _tmp_insert_gapped(p6_id, 42, 'Gap 42', 'C');


  -- ─── PART 7 — Multiple matching (10 preguntas) ───────────────────
  insert into exam_parts (exam_id, skill, part_number, title, instructions, order_index, settings)
  values (
    exam_id, 'reading', 7, 'Multiple matching — Living more sustainably',
    'You are going to read an article in which four people talk about how they have changed their lifestyle. For questions 43-52, choose from the people (A-D). The people may be chosen more than once.',
    6,
    ('{"question_type_hint":"multiple_matching","expected_count":10,'
     '"base_text":"Living more sustainably: four personal stories\n\nA. MIGUEL, 34, teacher\nI started making changes about five years ago, and I''d say the biggest one was giving up my car. I live in a fairly small city, so I''d always assumed a car was essential, but when mine finally broke down I decided to try life without one, just for six months. That was three years ago. I use a bicycle for most journeys now, and public transport when I need to go further. I''ll be honest — it hasn''t always been convenient. Winter is hard, and there have been times when I''ve had to turn down invitations because getting home late at night by bike didn''t appeal. But I''ve made a network of friends who cycle too, and we help each other out. What surprised me most was how much money I''ve saved. I used to think of my car as normal, but now I see clearly how expensive it was. Overall, the change has been much easier than I expected — although I still catch myself missing the freedom of just jumping in and driving somewhere on a whim.\n\nB. AMINA, 28, engineer\nFor me, the biggest change was food. I still eat meat occasionally, but I''ve gradually reduced how often — maybe once a week now, instead of most days. I know some people go all the way to being vegan or vegetarian, but for me, doing it slowly has meant it''s become a real habit rather than a project that eventually fails. My motivation was mostly environmental: reading about the impact of meat production on the planet made it impossible to carry on the same way. What has genuinely surprised me is how much more I now enjoy cooking. I''ve had to learn to make things I''d never tried before, and I think my meals are more interesting than they used to be. The one thing I find frustrating is eating out — most restaurants still design their menus around meat, and vegetarian options can be limited or unimaginative. But that''s slowly changing too. My family thought I was going through a phase, but three years later they''ve accepted this is who I am now.\n\nC. TOM, 45, small business owner\nWhat I''ve worked on is the amount of stuff I own — I don''t call it minimalism because I don''t think you need a label to just want less clutter. It started when I had to move flats and realised how much I''d accumulated in ten years. I sold or gave away almost half of my possessions, and honestly, I don''t miss any of them. The really important lesson wasn''t about throwing things away — it was about not bringing new things in. I now think very carefully before buying anything, and I''ve stopped shopping as entertainment, which is a habit I hadn''t even realised I had. In terms of environmental impact, I''m probably not a model citizen — I still travel by plane for work sometimes, and I don''t always buy the most sustainable brands. But I''m consuming less overall, and that has to matter. What I would say to anyone thinking about this is: start with your existing possessions before you think about buying anything new.\n\nD. SOFIA, 39, doctor\nMy changes have all been at home — reducing what we throw away as a family. We have two children, and honestly, when they were small the amount of waste we produced was shocking. I started with the obvious things: composting, better recycling, buying loose vegetables rather than pre-packaged ones. Then I got interested in reducing water use, and now heating. Some of the changes have been genuinely hard — my children complain about the temperature in winter, and I understand why, though I don''t change my mind about it. What I''ve noticed is that once you start thinking this way, you can''t stop. Every decision starts to be weighed against its impact, which can be tiring. My husband occasionally reminds me that I don''t need to save the planet single-handed, and he has a point. But if enough people made even a few of the changes we''ve made, the total impact would be significant. I want my kids to grow up thinking this is normal, not extreme.","matching_options":['
     '{"letter":"A","text":"Miguel"},'
     '{"letter":"B","text":"Amina"},'
     '{"letter":"C","text":"Tom"},'
     '{"letter":"D","text":"Sofia"}'
     ']}')::jsonb
  )
  returning id into p7_id;

  perform _tmp_insert_matching(p7_id, 43,
    'Which person suggests that a gradual approach to change is more likely to last than a sudden one?',
    'B'
  );
  perform _tmp_insert_matching(p7_id, 44,
    'Which person mentions financial savings as an unexpected benefit of their change?',
    'A'
  );
  perform _tmp_insert_matching(p7_id, 45,
    'Which person acknowledges tension with other family members over their choices?',
    'D'
  );
  perform _tmp_insert_matching(p7_id, 46,
    'Which person admits they are not as consistent as they could be about their overall impact?',
    'C'
  );
  perform _tmp_insert_matching(p7_id, 47,
    'Which person still occasionally regrets the loss of a convenience they used to have?',
    'A'
  );
  perform _tmp_insert_matching(p7_id, 48,
    'Which person feels that constantly thinking about their choices can be exhausting?',
    'D'
  );
  perform _tmp_insert_matching(p7_id, 49,
    'Which person emphasises the importance of not acquiring new things?',
    'C'
  );
  perform _tmp_insert_matching(p7_id, 50,
    'Which person finds their new lifestyle has made them more interested in an everyday activity?',
    'B'
  );
  perform _tmp_insert_matching(p7_id, 51,
    'Which person had to work through initial doubts from people close to them?',
    'B'
  );
  perform _tmp_insert_matching(p7_id, 52,
    'Which person hopes their choices will normalise similar behaviour in the next generation?',
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
    'In your English class you have been talking about protecting the environment. Now, your English teacher has asked you to write an essay.',
    ('{"task_instruction":"You must answer this question. Write your essay in 140-190 words in an appropriate style. You must use ALL the notes.",'
     '"task_type":"essay",'
     '"word_count_min":140,'
     '"word_count_max":190,'
     '"essay_question":"Some people believe that individual actions can make a real difference in protecting the environment. Others argue that only governments have the power to bring about meaningful change. What do you think?",'
     '"essay_notes":['
     '{"label":"Notes","text":"Write about:"},'
     '{"label":"1","text":"the impact of everyday choices (transport, food, energy)"},'
     '{"label":"2","text":"what only governments can do (laws, taxes, international agreements)"},'
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
     '{"letter":"A","type":"article","title":"Article for an international magazine",'
     '"prompt":"You see the following announcement in an international magazine:\n\nARTICLES WANTED\n\nA small change with a big impact\n\nWe are looking for articles about a small change that you or your community have made that has had a bigger positive impact than expected. Tell us what you did, why you did it, and what happened.\n\nThe best articles will be published in next month''s issue.\n\nWrite your article."},'
     '{"letter":"B","type":"email","title":"Email to a friend",'
     '"prompt":"You have received this email from your English-speaking friend Alex:\n\n\"Hi! I saw your last message about how you''ve been trying to live more sustainably. I''d love to make some changes too but I don''t really know where to start. Can you give me some advice? What has worked for you, and what would you tell someone who is just beginning? Thanks!\"\n\nWrite your email to Alex."},'
     '{"letter":"C","type":"review","title":"Review of a book or documentary",'
     '"prompt":"You have seen this notice on a website for students learning English:\n\nREVIEWS WANTED\n\nHave you recently read a book or watched a documentary that changed the way you think about the environment or the natural world? Write us a review saying what it was about, what you liked or disliked, and whether you would recommend it to others.\n\nWrite your review."}'
     ']}')::jsonb
  );


  raise notice 'B2 First Mock 01 (Environment & sustainability) loaded successfully. Exam ID: %', exam_id;

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
--   where e.title like 'B2 First Mock 01%'
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
