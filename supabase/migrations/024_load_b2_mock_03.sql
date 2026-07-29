-- =====================================================================
-- ACERTLIO — Carga de mock B2-03 (Culture & the arts)
-- =====================================================================
-- Tercer mock B2 First. Estructura oficial Cambridge First post-2015:
--   · Reading and Use of English (75 min · 52 preguntas · 7 parts)
--   · Writing (80 min · 2 tareas)
--
-- Tema del mock: Culture & the arts
--   - Aprender a dibujar de adulto
--   - El regreso del vinilo
--   - Bibliotecas y su vigencia
--   - Retratos callejeros (perfil)
--   - Clubes de lectura modernos
--   - Cuatro experiencias creativas personales
--
-- Contenido 100% original.
--
-- Ejecutar tras 001-023. Recrea las funciones helper temporalmente.
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
-- MOCK B2-03 — CULTURE & THE ARTS
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
    'B2 First Mock 03 — Culture & the arts',
    'B2', 3,
    'Tercer mock B2 First. Tema: cultura y arte — aprender a dibujar de adulto, el regreso del vinilo, bibliotecas, retratos callejeros, clubes de lectura, experiencias creativas. Reading and Use of English (75 min · 52 preguntas) + Writing (80 min · 2 tareas). Contenido 100% original.',
    155, true, 1
  )
  returning id into exam_id;


  -- ─── PART 1 — Multiple choice cloze (8 preguntas A/B/C/D) ────────
  insert into exam_parts (exam_id, skill, part_number, title, instructions, order_index, settings)
  values (
    exam_id, 'reading', 1, 'Multiple choice cloze — The unexpected joy of drawing badly',
    'For questions 1-8, read the text below and decide which answer (A, B, C or D) best fits each gap.',
    0,
    ('{"question_type_hint":"multiple_choice_cloze","expected_count":8,'
     '"base_text":"The unexpected joy of drawing badly\n\nFor most of us, the last time we drew anything serious was at primary school. Somewhere in our early teens, we glanced at our own pictures, then at those of a talented classmate, and quietly (1) ____ ourselves that art was not for us. From that moment on, we tell ourselves for the (2) ____ of our lives that drawing is something other people do.\n\nRecently, however, a small movement has been (3) ____ hold that challenges this idea. Drawing classes for adults are filling up in cities around the world — and unusually, many of them do not focus on producing beautiful pictures. Instead, teachers actively encourage students to make what they call ''bad'' drawings, with no expectation that anyone else will (4) ____ eyes on them.\n\nWhy would anyone want to spend their evenings drawing badly? Those who have (5) ____ up the habit say the appeal has more to do with how it makes them feel than with the results. Sitting quietly with a pencil and paper, they explain, is one of the few modern activities that fully (6) ____ your mind while asking very little of you.\n\nThe (7) ____ effect, according to many students, is a rare kind of calm they had almost forgotten was possible. Some also describe a renewed ability to notice small details around them — the shape of a leaf, the way light falls on a face — that they had (8) ____ track of years earlier."}')::jsonb
  )
  returning id into p1_id;

  perform _tmp_insert_mc_cloze4(p1_id, 1, 'Gap 1', 'A',
    'told', 'said', 'agreed', 'knew'
  );
  perform _tmp_insert_mc_cloze4(p1_id, 2, 'Gap 2', 'C',
    'time', 'length', 'rest', 'end'
  );
  perform _tmp_insert_mc_cloze4(p1_id, 3, 'Gap 3', 'A',
    'taking', 'gaining', 'making', 'holding'
  );
  perform _tmp_insert_mc_cloze4(p1_id, 4, 'Gap 4', 'A',
    'lay', 'put', 'get', 'bring'
  );
  perform _tmp_insert_mc_cloze4(p1_id, 5, 'Gap 5', 'A',
    'taken', 'made', 'given', 'put'
  );
  perform _tmp_insert_mc_cloze4(p1_id, 6, 'Gap 6', 'B',
    'takes', 'engages', 'keeps', 'does'
  );
  perform _tmp_insert_mc_cloze4(p1_id, 7, 'Gap 7', 'D',
    'last', 'final', 'complete', 'overall'
  );
  perform _tmp_insert_mc_cloze4(p1_id, 8, 'Gap 8', 'A',
    'lost', 'missed', 'stopped', 'left'
  );


  -- ─── PART 2 — Open cloze (8 preguntas, sin opciones) ─────────────
  insert into exam_parts (exam_id, skill, part_number, title, instructions, order_index, settings)
  values (
    exam_id, 'reading', 2, 'Open cloze — The return of vinyl records',
    'For questions 9-16, read the text below and think of the word which best fits each gap. Use only ONE word in each gap.',
    1,
    ('{"question_type_hint":"open_cloze","expected_count":8,'
     '"base_text":"The return of vinyl records\n\nTwenty years ago, if someone had told a music expert that vinyl records would one day outsell CDs, they would (9) ____ certainly have laughed. Records were considered old-fashioned, inconvenient and technically inferior to digital formats. And yet, that is exactly (10) ____ has happened. In several countries, vinyl now generates more income for the music industry than any other physical format.\n\nExplaining this comeback is not straightforward. Vinyl records are more expensive (11) ____ streaming, they scratch easily, and they only play in one place. Streaming, (12) ____ contrast, offers millions of songs at almost no cost, wherever you happen to be. On paper, the choice should be obvious.\n\nAnd yet, many buyers say they enjoy vinyl (13) ____ of its inconvenience, not in spite of it. Choosing a record, placing it carefully on the turntable, and having to get up to turn it over halfway through — all of these small actions turn listening (14) ____ music into an event rather than a background activity. In a world where music is (15) ____ available and often plays without our even noticing, that sense of occasion has become surprisingly valuable.\n\nThere is also a physical dimension. Records come in large, beautiful sleeves that people display in their homes. Unlike a song saved to a phone, they are objects you can hold, and something (16) ____ can share with friends who visit."}')::jsonb
  )
  returning id into p2_id;

  perform _tmp_insert_open_cloze(p2_id, 9, 'Gap 9', 'almost');
  perform _tmp_insert_open_cloze(p2_id, 10, 'Gap 10', 'what');
  perform _tmp_insert_open_cloze(p2_id, 11, 'Gap 11', 'than');
  perform _tmp_insert_open_cloze(p2_id, 12, 'Gap 12', 'by|in');
  perform _tmp_insert_open_cloze(p2_id, 13, 'Gap 13', 'because');
  perform _tmp_insert_open_cloze(p2_id, 14, 'Gap 14', 'to');
  perform _tmp_insert_open_cloze(p2_id, 15, 'Gap 15', 'always|constantly|widely|readily|freely');
  perform _tmp_insert_open_cloze(p2_id, 16, 'Gap 16', 'you|one|we');


  -- ─── PART 3 — Word formation (8 preguntas) ───────────────────────
  insert into exam_parts (exam_id, skill, part_number, title, instructions, order_index, settings)
  values (
    exam_id, 'reading', 3, 'Word formation — Why libraries still matter',
    'For questions 17-24, read the text below. Use the word given in capitals at the end of some of the lines to form a word that fits in the gap in the same line.',
    2,
    ('{"question_type_hint":"word_formation","expected_count":8,'
     '"base_text":"Why libraries still matter\n\nIn an age when almost any book can be downloaded in seconds, the (17) ____ [POPULAR] of public libraries might seem hard to explain. And yet, in most European cities, library visits have actually risen over the past decade, and new libraries continue to open.\n\nOne reason, according to librarians themselves, is the (18) ____ [VARY] of services they now offer. Libraries have quietly become far more than places to borrow books. They host children''s reading groups, language exchanges and free lessons on how to use a computer for older visitors. For many people, especially those living alone, they are also (19) ____ [SURPRISE] important as places simply to sit for a few hours in a warm, quiet space.\n\nThe (20) ____ [KNOW] provided by trained librarians is also difficult to replace online. Anyone can search the internet, but finding a truly (21) ____ [HELP] book on a difficult subject often requires the (22) ____ [WISE] of someone who has read widely. Librarians spend years developing this skill, and they give it away for free.\n\nOf course, the challenges are real. Budgets are tight, and every year a small number of libraries are forced to close. But those that remain (23) ____ [SIGNIFY] enrich the neighbourhoods they serve. For anyone who doubts their value, spending an afternoon in a busy local library is usually a (24) ____ [SUFFICE] answer."}')::jsonb
  )
  returning id into p3_id;

  perform _tmp_insert_word_form(p3_id, 17, 'POPULAR', 'popularity');
  perform _tmp_insert_word_form(p3_id, 18, 'VARY', 'variety');
  perform _tmp_insert_word_form(p3_id, 19, 'SURPRISE', 'surprisingly');
  perform _tmp_insert_word_form(p3_id, 20, 'KNOW', 'knowledge');
  perform _tmp_insert_word_form(p3_id, 21, 'HELP', 'helpful');
  perform _tmp_insert_word_form(p3_id, 22, 'WISE', 'wisdom');
  perform _tmp_insert_word_form(p3_id, 23, 'SIGNIFY', 'significantly');
  perform _tmp_insert_word_form(p3_id, 24, 'SUFFICE', 'sufficient');


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
    'I didn''t study art at school, so I never learned to paint properly.',
    'had',
    'If',
    'I would have learned to paint properly.',
    'I had studied art|I had studied art at school'
  );

  perform _tmp_insert_key_transform(p4_id, 26,
    'The exhibition was so popular that they extended it by two weeks.',
    'such',
    'It',
    'that they extended it by two weeks.',
    'was such a popular exhibition|was such a successful exhibition'
  );

  perform _tmp_insert_key_transform(p4_id, 27,
    'People say that the new theatre in the city centre is excellent.',
    'said',
    'The new theatre in the city centre',
    'excellent.',
    'is said to be'
  );

  perform _tmp_insert_key_transform(p4_id, 28,
    '''Have you ever visited the National Gallery?'' Sofia asked me.',
    'if',
    'Sofia asked me',
    'the National Gallery.',
    'if I had ever visited|if I had visited'
  );

  perform _tmp_insert_key_transform(p4_id, 29,
    'She started playing the piano ten years ago.',
    'been',
    'She',
    'the piano for ten years.',
    'has been playing'
  );

  perform _tmp_insert_key_transform(p4_id, 30,
    'It was a mistake to buy the tickets so early.',
    'ought',
    'We',
    'the tickets so early.',
    'ought not to have bought|oughtn''t to have bought'
  );


  -- ─── PART 5 — Long text + multiple choice (6 preguntas A/B/C/D) ─
  insert into exam_parts (exam_id, skill, part_number, title, instructions, order_index, settings)
  values (
    exam_id, 'reading', 5, 'Long text — The park portrait artist',
    'You are going to read an article about a street artist. For questions 31-36, choose the answer (A, B, C or D) which you think fits best according to the text.',
    4,
    ('{"question_type_hint":"multiple_choice","expected_count":6,'
     '"reading_text":"The park portrait artist\n\nEvery Saturday morning, for the past nine years, Ignacio Ferreiro has set up a small folding table and a battered wooden chair in the same corner of a park in central Valencia. He sits down, arranges his pencils, and waits. Above the table, a hand-painted wooden sign reads: ''Portraits, five minutes, whatever you can pay''. By the end of a good day, he has drawn twenty or thirty people, and made just enough money to cover his rent for the week.\n\nIgnacio, who is thirty-four, did not train as an artist. He studied economics at university and spent his twenties working for a large insurance company, where he was, by his own account, deeply unhappy. He had drawn since he was a child, mostly in the margins of his school notebooks, but he had never taken his own drawings seriously and had certainly never considered a career in art. What changed everything was, of all things, his lunch hour.\n\nOne Wednesday, tired of eating alone at his desk, he took a sandwich to a nearby park and sat on a bench. Almost without thinking, he began sketching an old man who was reading a newspaper on the bench opposite. When he had finished, he walked over and showed the man the drawing. The man''s reaction — surprise, then quiet pleasure — stayed with Ignacio for the rest of the afternoon. He did the same thing the following Wednesday, and every Wednesday after that. Within six months, he had left the insurance company. When people ask him whether that decision was risky, he laughs and says the risky decision would have been to stay.\n\nWhat he did not expect was how much drawing strangers would change his relationship with other people. Sitting across from someone for five minutes, looking carefully at their face, has taught him what he calls ''a kind of practical patience''. He has noticed that most people are, at first, quite awkward — they hold their smile too long, or fix their eyes rigidly on some point in the distance. It usually takes two or three minutes before they relax and something more honest appears on their face. That, he says, is when he starts to see who is really in front of him.\n\nHe now recognises certain patterns. People who look at their phones just before sitting down are the hardest to draw. Parents who arrive with young children are, surprisingly, often among the easiest, perhaps because they are used to being watched without embarrassment. And older visitors, particularly those who lived through difficult times, tend to give him faces of extraordinary detail — faces which younger people, he says, have not yet had time to earn.\n\nIgnacio does not particularly want his portraits to be shown in galleries, and he has turned down offers to sell them in bulk to design agencies. What matters to him, he says, is that each drawing goes home with the person he made it for. Some customers frame their portraits, others put them away in a drawer and forget about them, and a few tear them up on the way out of the park. He does not mind any of these outcomes. The drawing was for that five minutes, not for what happens afterwards.\n\nOccasionally, he still meets people who ask why he doesn''t charge more, given how much better than a phone photograph his portraits are. His answer is always the same. Charging a fixed price, he explains, would change the nature of the exchange entirely. Some of his most meaningful drawings have been given away for almost nothing — to elderly people on limited pensions, to teenagers who scraped together their pocket money, to tourists who happened to have only small coins. If he priced his work like a professional, most of those people would never have sat down. And that, he insists, is the whole point of what he does."}')::jsonb
  )
  returning id into p5_id;

  perform _tmp_insert_mc4(p5_id, 31,
    'What is the writer''s main point in the second paragraph?',
    'C',
    'Ignacio''s parents had wanted him to become an artist.',
    'Ignacio had drawn seriously since his university days.',
    'Ignacio''s current life was not something he had ever planned.',
    'Ignacio''s job at the insurance company paid extremely well.'
  );

  perform _tmp_insert_mc4(p5_id, 32,
    'What made Ignacio start drawing strangers regularly?',
    'B',
    'A friend suggested he try selling his sketches in the park.',
    'The reaction of the first person he approached with a portrait.',
    'A conversation with someone at his insurance company.',
    'Reading about another artist who worked in public spaces.'
  );

  perform _tmp_insert_mc4(p5_id, 33,
    'How does Ignacio describe his decision to leave his job?',
    'D',
    'He now regrets not having stayed a little longer.',
    'He accepts that many people would have made a safer choice.',
    'He believes the timing of his decision was lucky.',
    'He thinks the truly risky option would have been to stay.'
  );

  perform _tmp_insert_mc4(p5_id, 34,
    'What has Ignacio learned from drawing strangers?',
    'A',
    'It usually takes time before people show a natural expression.',
    'Most people are willing to sit still for longer than expected.',
    'The best portraits happen when the subject is not aware of him.',
    'Younger people tend to have more interesting faces than older ones.'
  );

  perform _tmp_insert_mc4(p5_id, 35,
    'What does Ignacio think about what happens to his portraits after he gives them away?',
    'B',
    'He hopes his customers will treat the drawings as important.',
    'He does not consider it his business how they are treated.',
    'He is disappointed when people throw them away.',
    'He tries to check back on his most valuable portraits.'
  );

  perform _tmp_insert_mc4(p5_id, 36,
    'Why does Ignacio refuse to charge a fixed price for his portraits?',
    'D',
    'Because he does not need the extra money to live on.',
    'Because he does not want his work compared to that of professionals.',
    'Because he prefers his customers to feel they are getting something for free.',
    'Because a fixed price would prevent certain people from coming to him.'
  );


  -- ─── PART 6 — Gapped text: párrafos (6 preguntas) ────────────────
  insert into exam_parts (exam_id, skill, part_number, title, instructions, order_index, settings)
  values (
    exam_id, 'reading', 6, 'Gapped text — Why book clubs still matter',
    'You are going to read an article about book clubs. Six sentences have been removed from the article. Choose from the sentences A-G the one which fits each gap (37-42). There is one extra sentence which you do not need to use.',
    5,
    ('{"question_type_hint":"multiple_matching","expected_count":6,'
     '"base_text":"Why book clubs still matter\n\nBook clubs have been around, in one form or another, for at least three hundred years. In the eighteenth century, small groups of women who were not allowed to attend university met privately to read and discuss books that their families or churches would rather they had ignored. Today, book clubs are more visible, more varied and possibly more popular than ever.\n\n(37) ____ In cities across Europe, cafés, bookshops and libraries host regular meetings, and online clubs have opened the same experience to people who would previously have been unable to take part — those living in small towns, those with limited free time, or those simply too shy to walk into a room of strangers.\n\nWhy do so many people, in an age of endless streaming and instant messaging, still want to sit around a table and talk about a book they have read? Part of the answer is straightforward. Reading, for most of us, is a private activity, and there is real pleasure in finding out how other people responded to the same pages. (38) ____ Book clubs give readers a chance to test their own reactions against those of others, and often to change their minds.\n\nThe social dimension is also important. Members frequently say that their book club has become one of the few regular fixtures in their week when they meet friends face to face for a real conversation, without distractions. (39) ____ For many people, this is enough of a reason on its own, quite separate from anything to do with the books themselves.\n\nAnother reason for their continuing appeal is the way book clubs push their members to read more widely. Left to ourselves, we tend to return again and again to the same authors, genres and periods. A book club, by contrast, forces us to read things we would never have chosen. (40) ____ Some of these turn out to be far better than expected; others confirm that our original instincts were probably right. Either way, our reading world expands.\n\nOf course, not every club is successful, and the reasons for failure follow familiar patterns. Meetings that drift into general chat rather than staying with the book tend to disappoint the members who came for genuine discussion. (41) ____ Groups where one or two people dominate the conversation, or where the choice of book is always made by the same person, also struggle to keep members for long.\n\nWhat successful clubs seem to have in common, according to those who run them, is a mixture of clear structure and honest opinions. (42) ____ Members feel free to say when they disliked a book, without worrying about hurting anyone''s feelings. It is precisely this honesty, and not any professional expertise, that keeps a good book club interesting year after year.","matching_options":['
     '{"letter":"A","text":"Nobody is expected to have finished every chapter, but everyone is expected to say something."},'
     '{"letter":"B","text":"Once a book is finished, most of us are naturally curious about whether others noticed the same things we did."},'
     '{"letter":"C","text":"Reading in a group, most agree, is a fundamentally different experience from reading alone at home."},'
     '{"letter":"D","text":"Popularity has grown to such an extent that some publishers now design books specifically with these groups in mind."},'
     '{"letter":"E","text":"The result is that most members finish the year having discovered at least one or two writers they now love."},'
     '{"letter":"F","text":"Equally, meetings where nobody wants to disagree soon become predictable and stop feeling worth attending."},'
     '{"letter":"G","text":"For readers who live alone or work in jobs with little contact with others, this can matter more than the book itself."}'
     ']}')::jsonb
  )
  returning id into p6_id;

  perform _tmp_insert_gapped(p6_id, 37, 'Gap 37', 'D');
  perform _tmp_insert_gapped(p6_id, 38, 'Gap 38', 'B');
  perform _tmp_insert_gapped(p6_id, 39, 'Gap 39', 'G');
  perform _tmp_insert_gapped(p6_id, 40, 'Gap 40', 'E');
  perform _tmp_insert_gapped(p6_id, 41, 'Gap 41', 'F');
  perform _tmp_insert_gapped(p6_id, 42, 'Gap 42', 'A');


  -- ─── PART 7 — Multiple matching (10 preguntas · 4 personas) ──────
  insert into exam_parts (exam_id, skill, part_number, title, instructions, order_index, settings)
  values (
    exam_id, 'reading', 7, 'Multiple matching — Four people, four creative journeys',
    'You are going to read an article in which four people talk about a creative activity they took up as adults. For questions 43-52, choose from the people (A-D). The people may be chosen more than once.',
    6,
    ('{"question_type_hint":"multiple_matching","expected_count":10,'
     '"base_text":"Four people, four creative journeys\n\nA. VICTOR, 41, engineer\nI started learning the guitar three years ago, which is quite late for something like that. My son was taking lessons and I thought I''d try alongside him, mostly to spend more time with him. Within a couple of months he had lost interest, but I hadn''t. What surprised me was how much I enjoyed being genuinely bad at something. My whole working life is about doing things I''m already good at, efficiently. With the guitar, progress is measured in tiny weekly steps, and there are pieces I''ve been working on for over a year that I still can''t play well. I''d expected that to be frustrating, but actually I find it strangely relaxing — it turns out that being an obvious beginner in one part of my life makes me easier on myself in every other part. I don''t play in front of anyone yet, and I''m not sure I ever will. But that isn''t really the point.\n\nB. NADIA, 36, lawyer\nI took up creative writing during a difficult period at work. A friend suggested a short evening course at a local college, and I signed up mostly to have somewhere to be that wasn''t the office. I didn''t expect to enjoy it, and for the first three weeks I hated every session. Then something shifted. Our teacher gave us an exercise — describe a room from the point of view of someone who is angry, without ever using the word ''angry'' — and it was the first thing I had done in years that had nothing to do with proving anything to anyone. Two years later, writing is now the fixed point in my week. I''ve joined a small online group of former classmates, and we send each other short pieces every Sunday. Almost nobody in my professional life knows about it, and I like it that way. It feels genuinely mine.\n\nC. HAMZA, 52, doctor\nI came to painting late, and by accident. My wife bought me a small watercolour set for my fiftieth birthday as a joke, since I''d told her many times that I couldn''t even draw a straight line. To be polite, I tried it once. I spent most of that first afternoon feeling embarrassed by what appeared on the paper, but I also lost track of time completely, which almost never happens to me. That surprised me enough to try again the next weekend. Two years on, I still consider myself a beginner. What I have discovered is that the painting itself matters less than the state of mind it puts me in — a kind of quiet concentration I couldn''t reach any other way. I''ve tried meditation apps and various forms of exercise for the same purpose, and none of them worked for me. But an hour with a brush in my hand, even producing something I''ll throw away, has become essential.\n\nD. ROSANNA, 29, marketing manager\nI joined an amateur theatre group two years ago on a whim, after a colleague mentioned that they were looking for new members. Public speaking terrified me at the time, which was actually part of why I said yes — I''d been avoiding certain kinds of opportunities at work because of it, and I wanted to force the issue. The first three months were genuinely awful. I hated hearing my own voice, I hated being watched, and I nearly gave up several times. What kept me going was the other people in the group, who quietly assumed I would come back each week. Now, two years later, I''ve had small parts in three productions. My work has improved almost as much as my acting has. I speak up in meetings I would previously have sat through in silence, and I''ve started giving presentations I would once have avoided at all costs. None of this was what I originally wanted from theatre — I just wanted to enjoy it — but it turns out to be the most valuable thing about it.","matching_options":['
     '{"letter":"A","text":"Victor"},'
     '{"letter":"B","text":"Nadia"},'
     '{"letter":"C","text":"Hamza"},'
     '{"letter":"D","text":"Rosanna"}'
     ']}')::jsonb
  )
  returning id into p7_id;

  perform _tmp_insert_matching(p7_id, 43,
    'Which person began their activity partly to spend time with a family member?',
    'A'
  );
  perform _tmp_insert_matching(p7_id, 44,
    'Which person deliberately took up their activity to face a personal fear?',
    'D'
  );
  perform _tmp_insert_matching(p7_id, 45,
    'Which person values the mental state their activity produces above the results?',
    'C'
  );
  perform _tmp_insert_matching(p7_id, 46,
    'Which person keeps their activity separate from their professional life on purpose?',
    'B'
  );
  perform _tmp_insert_matching(p7_id, 47,
    'Which person''s activity has improved another area of their life unexpectedly?',
    'D'
  );
  perform _tmp_insert_matching(p7_id, 48,
    'Which person mentions being tempted to give up during the early stages?',
    'D'
  );
  perform _tmp_insert_matching(p7_id, 49,
    'Which person says being a beginner has changed how they treat themselves in general?',
    'A'
  );
  perform _tmp_insert_matching(p7_id, 50,
    'Which person began their activity because someone gave them a gift?',
    'C'
  );
  perform _tmp_insert_matching(p7_id, 51,
    'Which person disliked their activity at first before something changed?',
    'B'
  );
  perform _tmp_insert_matching(p7_id, 52,
    'Which person mentions that others in their group helped them keep going?',
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
    'In your English class you have been talking about culture and creativity. Now, your English teacher has asked you to write an essay.',
    ('{"task_instruction":"You must answer this question. Write your essay in 140-190 words in an appropriate style. You must use ALL the notes.",'
     '"task_type":"essay",'
     '"word_count_min":140,'
     '"word_count_max":190,'
     '"essay_question":"Some people think that reading books is more important than watching films. Others believe that films can teach us just as much as books. What do you think?",'
     '"essay_notes":['
     '{"label":"Notes","text":"Write about:"},'
     '{"label":"1","text":"what reading books can offer (imagination, vocabulary, concentration)"},'
     '{"label":"2","text":"what films can offer (emotion, images, shared experience)"},'
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
     '{"letter":"A","type":"article","title":"Article for a culture website",'
     '"prompt":"You see this announcement on an English-language culture website:\n\nARTICLES WANTED\n\nA creative activity worth trying\n\nWe are looking for articles about a creative activity — painting, writing, playing an instrument, dancing, or anything else — that you would recommend to other adults. Tell us what the activity is, why you took it up, and what you would say to someone who is thinking of trying it.\n\nThe best articles will be featured on our home page.\n\nWrite your article."},'
     '{"letter":"B","type":"email","title":"Email to an English-speaking friend",'
     '"prompt":"You have received this email from your English-speaking friend Alex:\n\n\"Hi! I''ve just moved to your city for six months and I''d love to make the most of it. Could you suggest a couple of cultural things I should definitely do while I''m there — something to see, something to try, and maybe a place to visit? I''d really appreciate your recommendations!\"\n\nWrite your email to Alex."},'
     '{"letter":"C","type":"review","title":"Review of a book, film or exhibition",'
     '"prompt":"You have seen this notice on a website for students learning English:\n\nREVIEWS WANTED\n\nHave you recently read a book, watched a film, or visited an exhibition that you would recommend? Write us a review saying what it was about, what you especially liked, and whether you would recommend it to other students.\n\nWrite your review."}'
     ']}')::jsonb
  );


  raise notice 'B2 First Mock 03 (Culture & the arts) loaded successfully. Exam ID: %', exam_id;

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
