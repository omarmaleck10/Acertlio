-- =====================================================================
-- ACERTLIO — Carga de mock C1-03 (Science & discovery)
-- =====================================================================
-- Tercer mock C1 Advanced. Estructura oficial Cambridge CAE post-2015:
--   · Reading and Use of English (90 min · 56 preguntas · 8 parts)
--   · Writing (90 min · 2 tareas)
--
-- Tema del mock: Science & discovery
--   - La ciencia ciudadana y el papel de los voluntarios
--   - La crisis de reproducibilidad en la investigación
--   - El coste oculto de los descubrimientos científicos
--   - Perfil de una astrónoma con descubrimiento no reconocido
--   - Cross-text: 4 opiniones sobre la financiación pública de la ciencia
--   - Cómo ocurren realmente los descubrimientos científicos
--   - Cuatro relaciones distintas con el mundo de la ciencia
--
-- Contenido 100% original.
--
-- Ejecutar tras 001-027.
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
-- MOCK C1-03 — SCIENCE & DISCOVERY
-- =====================================================================
do $$
declare
  exam_id uuid;
  p1_id uuid; p2_id uuid; p3_id uuid; p4_id uuid;
  p5_id uuid; p6_id uuid; p7_id uuid; p8_id uuid;
  p9_id uuid; p10_id uuid;
begin

  insert into exams (title, level, mock_number, description, total_time_minutes, is_published, version)
  values (
    'C1 Advanced Mock 03 — Science & discovery',
    'C1', 3,
    'Tercer mock C1 Advanced. Tema: ciencia y descubrimiento — ciencia ciudadana, reproducibilidad, coste oculto de los descubrimientos, financiación pública, cómo ocurren los avances científicos. Reading and Use of English (90 min · 56 preguntas · 8 parts) + Writing (90 min · 2 tareas). Contenido 100% original.',
    180, true, 1
  )
  returning id into exam_id;


  -- ─── PART 1 — Multiple choice cloze (8 preguntas A/B/C/D) ────────
  insert into exam_parts (exam_id, skill, part_number, title, instructions, order_index, settings)
  values (
    exam_id, 'reading', 1, 'Multiple choice cloze — The surprising power of citizen science',
    'For questions 1-8, read the text below and decide which answer (A, B, C or D) best fits each gap.',
    0,
    ('{"question_type_hint":"multiple_choice_cloze","expected_count":8,'
     '"base_text":"The surprising power of citizen science\n\nA few years ago, a retired schoolteacher in the north of England (1) ____ across an oddly-shaped feature in a satellite image she was analysing during her evening hours as a volunteer on an online astronomy project. She had no formal training beyond an amateur interest cultivated over four decades, but she felt sure enough that the object was worth flagging that she added it to the project''s database. Within six months, the discovery had appeared in a peer-reviewed paper as a previously unknown type of galactic collision.\n\nThis kind of story, once treated as a charming exception, is becoming remarkably common. The rise of what researchers call citizen science — the (2) ____ contribution of ordinary people to formal scientific work — has quietly reshaped several fields over the past decade. Amateur enthusiasts routinely (3) ____ up on patterns in enormous datasets that no professional team has the time to examine in detail, and their combined efforts have (4) ____ dividends that no expert team could easily match.\n\nWhy do so many people give up their evenings and weekends for unpaid work? For most volunteers, the appeal is not primarily educational, though many report learning far more than they had expected. What they describe instead is the pleasure of being (5) ____ useful in a way that their day jobs rarely allow. A retired accountant classifying whale sounds, or a teenager identifying craters on the moon, may not (6) ____ up to a Nobel Prize, but each contributes something real to work that would otherwise be undone.\n\nSceptics used to argue that such contributions could not be (7) ____ on a par with those of trained professionals. What the evidence has increasingly shown is that carefully-designed volunteer projects, with adequate quality control, produce results as reliable as those of any expert team — and often at a fraction of the cost. That kind of return, most institutions have concluded, is worth taking (8) ____ ."}')::jsonb
  )
  returning id into p1_id;

  perform _tmp_insert_mc_cloze4(p1_id, 1, 'Gap 1', 'A',
    'came', 'cast', 'fell', 'went'
  );
  perform _tmp_insert_mc_cloze4(p1_id, 2, 'Gap 2', 'B',
    'volunteered', 'voluntary', 'voluntarily', 'willingness'
  );
  perform _tmp_insert_mc_cloze4(p1_id, 3, 'Gap 3', 'A',
    'pick', 'catch', 'keep', 'take'
  );
  perform _tmp_insert_mc_cloze4(p1_id, 4, 'Gap 4', 'A',
    'paid', 'given', 'brought', 'made'
  );
  perform _tmp_insert_mc_cloze4(p1_id, 5, 'Gap 5', 'A',
    'genuinely', 'closely', 'strictly', 'openly'
  );
  perform _tmp_insert_mc_cloze4(p1_id, 6, 'Gap 6', 'B',
    'sum', 'add', 'build', 'lead'
  );
  perform _tmp_insert_mc_cloze4(p1_id, 7, 'Gap 7', 'D',
    'held', 'weighed', 'measured', 'put'
  );
  perform _tmp_insert_mc_cloze4(p1_id, 8, 'Gap 8', 'A',
    'seriously', 'strongly', 'importantly', 'firmly'
  );


  -- ─── PART 2 — Open cloze (8 preguntas, sin opciones) ─────────────
  insert into exam_parts (exam_id, skill, part_number, title, instructions, order_index, settings)
  values (
    exam_id, 'reading', 2, 'Open cloze — The reproducibility crisis',
    'For questions 9-16, read the text below and think of the word which best fits each gap. Use only ONE word in each gap.',
    1,
    ('{"question_type_hint":"open_cloze","expected_count":8,'
     '"base_text":"The reproducibility crisis\n\nA decade ago, a small group of researchers in psychology set out to repeat a hundred published experiments that had previously appeared in respected journals. What they found came (9) ____ a shock even to those who had suspected the discipline had problems. Fewer than half of the original results could be reproduced, and (10) ____ those that could, the effects were on average much weaker than reported. The findings triggered what has since become known as the reproducibility crisis, and it (11) ____ turned out that psychology is far from the only field affected.\n\nSimilar problems have since been uncovered in cell biology, cancer research, economics and even parts of physics. In (12) ____ of these cases, careful attempts to replicate widely-cited studies have produced results that call the original claims into serious doubt. The scale of the problem has forced researchers to ask uncomfortable questions about how their disciplines actually work.\n\nSeveral factors appear to be involved. One is the pressure on researchers to publish striking results, which can encourage the reporting of findings that look more definitive than the data really warrant. (13) ____ is the widespread use of statistical techniques whose limitations are poorly understood by the researchers using them. A third is a professional culture in (14) ____ replication studies are generally seen as unglamorous and, until recently, almost unpublishable.\n\nEncouragingly, several fields have begun to take these problems seriously. Journals now increasingly require authors to share their data and methods so (15) ____ others can attempt to reproduce their work, and dedicated ''replication laboratories'' have appeared in universities in several countries. Whether these measures will be (16) ____ to restore public confidence in scientific findings remains an open question."}')::jsonb
  )
  returning id into p2_id;

  perform _tmp_insert_open_cloze(p2_id, 9, 'Gap 9', 'as');
  perform _tmp_insert_open_cloze(p2_id, 10, 'Gap 10', 'of|among|amongst');
  perform _tmp_insert_open_cloze(p2_id, 11, 'Gap 11', 'has|soon|later|subsequently|quickly');
  perform _tmp_insert_open_cloze(p2_id, 12, 'Gap 12', 'each|all|many|most');
  perform _tmp_insert_open_cloze(p2_id, 13, 'Gap 13', 'another|second');
  perform _tmp_insert_open_cloze(p2_id, 14, 'Gap 14', 'which');
  perform _tmp_insert_open_cloze(p2_id, 15, 'Gap 15', 'that');
  perform _tmp_insert_open_cloze(p2_id, 16, 'Gap 16', 'enough|sufficient');


  -- ─── PART 3 — Word formation (8 preguntas) ───────────────────────
  insert into exam_parts (exam_id, skill, part_number, title, instructions, order_index, settings)
  values (
    exam_id, 'reading', 3, 'Word formation — The hidden cost of breakthroughs',
    'For questions 17-24, read the text below. Use the word given in capitals at the end of some of the lines to form a word that fits in the gap in the same line.',
    2,
    ('{"question_type_hint":"word_formation","expected_count":8,'
     '"base_text":"The hidden cost of breakthroughs\n\nWhen a major scientific breakthrough is announced, the public (17) ____ [TYPICAL] hears a version of the story in which a brilliant mind, after some period of quiet work, suddenly produces a result that changes everything. The (18) ____ [REAL] behind most discoveries is considerably less dramatic — and, for many of the researchers involved, considerably harder.\n\nMost significant scientific work now depends on years of what might be called invisible labour: repeated (19) ____ [FAIL] , the patient rebuilding of experimental equipment, and the slow accumulation of data whose (20) ____ [SIGNIFY] only becomes clear in retrospect. A single high-profile paper may represent, on average, several thousand hours of collective effort by a team whose members are rarely (21) ____ [NAME] in the coverage.\n\nThis mismatch between how discoveries actually happen and how they are reported has real (22) ____ [CONSEQUENCE] . Junior researchers, in particular, can spend years working on problems that eventually produce no publishable result, and (23) ____ [PERSIST] of this kind is often poorly rewarded compared to the more visible achievements of colleagues who happened to work on easier questions. A small but growing number of scientists have argued that public understanding of research would benefit if the messier reality were more (24) ____ [WIDE] acknowledged."}')::jsonb
  )
  returning id into p3_id;

  perform _tmp_insert_word_form(p3_id, 17, 'TYPICAL', 'typically');
  perform _tmp_insert_word_form(p3_id, 18, 'REAL', 'reality');
  perform _tmp_insert_word_form(p3_id, 19, 'FAIL', 'failures|failure');
  perform _tmp_insert_word_form(p3_id, 20, 'SIGNIFY', 'significance');
  perform _tmp_insert_word_form(p3_id, 21, 'NAME', 'named');
  perform _tmp_insert_word_form(p3_id, 22, 'CONSEQUENCE', 'consequences|consequence');
  perform _tmp_insert_word_form(p3_id, 23, 'PERSIST', 'persistence');
  perform _tmp_insert_word_form(p3_id, 24, 'WIDE', 'widely');


  -- ─── PART 4 — Key word transformations (6 preguntas · 2 puntos) ──
  insert into exam_parts (exam_id, skill, part_number, title, instructions, order_index, settings)
  values (
    exam_id, 'reading', 4, 'Key word transformations',
    'For questions 25-30, complete the second sentence so that it has a similar meaning to the first sentence, using the word given. Do not change the word given. You must use between THREE and SIX words, including the word given.',
    3,
    '{"question_type_hint":"key_word_transformation","expected_count":6,"points_per_question":2}'::jsonb
  )
  returning id into p4_id;

  perform _tmp_insert_key_transform(p4_id, 25,
    'The researcher would never publish results without first checking them.',
    'no',
    'Under',
    'the researcher publish results without first checking them.',
    'no circumstances would'
  );

  perform _tmp_insert_key_transform(p4_id, 26,
    'The audience welcomed the professor''s proposal with great enthusiasm.',
    'met',
    'The professor''s proposal',
    'from the audience.',
    'was met with great enthusiasm|was met with much enthusiasm'
  );

  perform _tmp_insert_key_transform(p4_id, 27,
    'The team eventually accepted that the experiment had failed.',
    'face',
    'The team eventually had to',
    'the experiment had failed.',
    'face the fact that|face up to the fact that'
  );

  perform _tmp_insert_key_transform(p4_id, 28,
    'The new analysis revealed a serious flaw in the original study.',
    'brought',
    'A serious flaw in the original study',
    'the new analysis.',
    'was brought to light by|was brought out by'
  );

  perform _tmp_insert_key_transform(p4_id, 29,
    'She was the first to draw attention to the flaws in the methodology.',
    'lead',
    'She',
    'attention to the flaws in the methodology.',
    'took the lead in drawing'
  );

  perform _tmp_insert_key_transform(p4_id, 30,
    'Although the results were disappointing, the team continued their work.',
    'spite',
    'The team continued their work',
    'the disappointing results.',
    'in spite of'
  );


  -- ─── PART 5 — Long text + multiple choice (6 preguntas A/B/C/D) ─
  insert into exam_parts (exam_id, skill, part_number, title, instructions, order_index, settings)
  values (
    exam_id, 'reading', 5, 'Long text — The discovery that got away',
    'You are going to read an article about a scientific discovery. For questions 31-36, choose the answer (A, B, C or D) which you think fits best according to the text.',
    4,
    ('{"question_type_hint":"multiple_choice","expected_count":6,'
     '"reading_text":"The discovery that got away\n\nOn a rainy November afternoon in 1974, Elizabeth Hargrove — then a twenty-four-year-old doctoral student at a Cambridge observatory — noticed something odd on a chart recording produced by the radio telescope she and her supervisor had spent the previous eighteen months building. Between the expected patterns of stellar noise, a small, sharply-defined signal appeared and disappeared with a regularity that made no astronomical sense. Hargrove circled the anomaly in pencil and, when her supervisor arrived the following morning, showed it to him without much comment.\n\nWhat neither of them realised at the time was that Hargrove had just detected what would eventually be recognised as a new class of astronomical object. Over the following weeks, she and her supervisor identified several more examples, argued about what they might be, and eventually agreed on the paper that would announce the discovery. When the Nobel Prize for physics was awarded some years later, Hargrove''s supervisor received it. Her name appeared in the citation but not in the prize itself, and she was not present at the ceremony in Stockholm.\n\nInterviewers have returned to this story many times over the intervening decades, and Hargrove''s response has been consistent enough to be worth reporting carefully. She does not, she insists, feel any bitterness about the omission. Nobel prizes, she points out, are awarded according to conventions that were established long before her generation, and there is no particular reason to expect those conventions to have caught up with the reality of laboratory life within the span of a single career. She has, however, been consistently critical of the wider assumption that important discoveries are the achievement of exceptional individuals, when they are almost always the product of teams whose junior members remain invisible.\n\nWhat Hargrove is dismissive of is the frequent suggestion, made in interviews and biographical pieces, that her career would have taken a different path if the prize had been shared with her. That framing, she argues, misunderstands what actually happened next. She did not lose interest in research because of the award; she lost interest in research because, having established what her signals were, she found the subsequent work of characterising them in ever greater detail — the work most of her colleagues considered natural and important — genuinely tedious. That was, she suggests, a much better reason to leave academia than any grievance.\n\nWhat she went on to do has surprised more than one interviewer expecting a story of thwarted ambition. Hargrove spent the next thirty years of her career in a series of roles that few of her academic peers would have considered promotions: teaching physics in a state secondary school in Norfolk, writing textbooks for teenagers, and eventually producing a long-running radio series that introduced ordinary listeners to current developments in astronomy. She has, she believes, communicated with a considerably wider public than the research she abandoned would ever have reached.\n\nWhat is unusual about Hargrove''s account of her career is how little it resembles either the standard triumphant version or the standard tragic one. Interviewers who arrive hoping for one of these narratives typically leave slightly disappointed. She does not present herself as an under-recognised genius, nor as a woman crushed by the sexism of her generation, although she readily acknowledges that both interpretations contain elements of truth. What she offers instead is something considerably harder to summarise: an account of a life whose real satisfactions have had almost nothing to do with the prize she did not receive.\n\nHer preferred conclusion, offered at the end of most conversations, is that the important question is not what a scientist discovers but what they do afterwards. On that measure, she says, she has been considerably luckier than most of the people who won prizes in the same decade she did not. Whether that reflects a genuine philosophy or an elegant way of declining to complain is difficult, in the end, to determine — and, as most interviewers eventually conclude, that ambiguity may be exactly the point."}')::jsonb
  )
  returning id into p5_id;

  perform _tmp_insert_mc4(p5_id, 31,
    'What is emphasised about the moment of the initial observation?',
    'C',
    'Hargrove immediately understood the importance of what she had seen.',
    'The equipment used had been designed for a completely different purpose.',
    'Hargrove drew attention to the anomaly in a low-key way.',
    'Her supervisor was reluctant to take her observation seriously.'
  );

  perform _tmp_insert_mc4(p5_id, 32,
    'What point does Hargrove make about the way the Nobel Prize was awarded?',
    'B',
    'She believes the committee were influenced by personal prejudice against her.',
    'She sees it as consistent with rules that predated the reality of team-based research.',
    'She feels the omission was justified given how junior she was at the time.',
    'She thinks her supervisor should have declined the prize on her behalf.'
  );

  perform _tmp_insert_mc4(p5_id, 33,
    'Why does Hargrove dislike the suggestion that the prize decision changed her career?',
    'D',
    'She feels it exaggerates the influence of individual awards on real careers.',
    'She believes the suggestion is used to discourage women from complaining.',
    'She thinks it distracts from more serious injustices in academic life.',
    'She considers it a misreading of why she actually left research.'
  );

  perform _tmp_insert_mc4(p5_id, 34,
    'What does the fifth paragraph reveal about Hargrove''s subsequent career?',
    'A',
    'It took a direction that many of her academic peers would consider unimpressive.',
    'It brought her the public recognition she had missed as a doctoral student.',
    'It was built around a series of increasingly senior teaching appointments.',
    'It involved a gradual return to research through less demanding routes.'
  );

  perform _tmp_insert_mc4(p5_id, 35,
    'What frustrates interviewers hoping to write about Hargrove?',
    'B',
    'Her answers vary depending on the tone of the interview.',
    'Her account fits neither the triumphant nor the tragic template.',
    'She refuses to acknowledge that she has been treated unfairly.',
    'She is reluctant to discuss her early career in any detail.'
  );

  perform _tmp_insert_mc4(p5_id, 36,
    'What does Hargrove suggest is the more important measure of a scientific career?',
    'C',
    'The public visibility of the individual scientist involved.',
    'The number of significant discoveries produced over a lifetime.',
    'What the scientist does with their life after the discovery is made.',
    'Whether the discovery is eventually credited to its true originator.'
  );


  -- ─── PART 6 — Cross-text multiple matching (4 preguntas) ─────────
  insert into exam_parts (exam_id, skill, part_number, title, instructions, order_index, settings)
  values (
    exam_id, 'reading', 6, 'Cross-text multiple matching — Public funding of scientific research',
    'You are going to read four extracts from articles in which commentators give their views on public funding of scientific research. For questions 37-40, choose from the extracts (A-D). The extracts may be chosen more than once.',
    5,
    ('{"question_type_hint":"multiple_matching","expected_count":4,'
     '"base_text":"Public funding of scientific research\n\nFour commentators give their views on how public funding of scientific research should be organised.\n\nA. PROFESSOR MARIA VELASQUEZ, science policy economist\nMy own research on the returns to public science funding suggests that the applied end of the spectrum consistently produces the most measurable social value. Governments have limited budgets, and it is neither surprising nor unreasonable that taxpayers expect visible benefits from the money they contribute. Where I differ from many of my colleagues in economics is that I do not believe curiosity-driven research is a luxury that can be dispensed with. The historical record is full of discoveries that were entirely useless at the time they were made and turned out, thirty years later, to underpin whole industries. What is needed is a serious effort to fund both, rather than the periodic swings of fashion that currently dominate government policy.\n\nB. DR STEFAN BURN, philosopher of science\nAdvocates of applied research are fond of citing examples in which basic discoveries eventually produced practical applications, but the argument they use is fundamentally circular: they select the discoveries that led somewhere and quietly ignore the vast majority that did not. Nevertheless, I remain firmly convinced that curiosity-driven research should be the priority of public funding, for a reason that has nothing to do with utility. What distinguishes serious science from mere technology is precisely that it pursues questions whose answers cannot be predicted in advance. If governments only fund what they think will pay off, they will end up with a great deal of well-financed technology and remarkably little science.\n\nC. DR HARRIET LIN, senior biochemist\nHaving spent thirty-five years watching successive governments push funding priorities in first one direction and then the opposite, I have become deeply sceptical of anyone who claims to know how research money should be allocated. What I can offer is a practitioner''s observation: the best labs I have worked in have combined both types of research within the same team, allowing junior members to pursue speculative questions on the back of applied projects that guaranteed a steady flow of results. Rigid separation of the two categories, imposed from outside by policymakers, tends to damage both. Almost every consequential discovery I have witnessed emerged from environments where the boundary was allowed to remain unclear.\n\nD. DR YUSUF ALAWI, historian of science\nThe standard narrative about public science funding — that basic research quietly produces the breakthroughs on which applied work later builds — is a comforting story that historians have largely stopped believing. A more accurate picture is one in which basic and applied research have always been intertwined, with each shaping the other in ways that resist clean separation. Where I disagree with those who argue that governments should not attempt to pick winners is that we already know, from careful historical studies, that some fields at particular moments genuinely do offer disproportionate returns to targeted investment. The task is not to avoid choosing but to choose more carefully than governments currently do.","matching_options":['
     '{"letter":"A","text":"Extract A (Prof Velasquez)"},'
     '{"letter":"B","text":"Extract B (Dr Burn)"},'
     '{"letter":"C","text":"Extract C (Dr Lin)"},'
     '{"letter":"D","text":"Extract D (Dr Alawi)"}'
     ']}')::jsonb
  )
  returning id into p6_id;

  perform _tmp_insert_matching(p6_id, 37,
    'Which commentator most explicitly rejects the historical narrative in which basic research is separate from and preceded applied research?',
    'D'
  );
  perform _tmp_insert_matching(p6_id, 38,
    'Which commentator shares Prof Velasquez''s view that both curiosity-driven and applied research deserve public funding?',
    'C'
  );
  perform _tmp_insert_matching(p6_id, 39,
    'Which commentator, unlike Dr Burn, argues that governments can and should identify priority fields for funding?',
    'D'
  );
  perform _tmp_insert_matching(p6_id, 40,
    'Which commentator uses their own working experience to argue against rigid categories in research funding?',
    'C'
  );



  -- ─── PART 7 — Gapped text: párrafos (6 preguntas) ────────────────
  insert into exam_parts (exam_id, skill, part_number, title, instructions, order_index, settings)
  values (
    exam_id, 'reading', 7, 'Gapped text — How scientific breakthroughs actually happen',
    'You are going to read an article about how scientific breakthroughs occur. Six paragraphs have been removed from the article. Choose from paragraphs A-G the one which fits each gap (41-46). There is one extra paragraph which you do not need to use.',
    6,
    ('{"question_type_hint":"multiple_matching","expected_count":6,'
     '"base_text":"How scientific breakthroughs actually happen\n\nThe popular image of scientific discovery — a lone genius, a moment of sudden insight, a single dramatic revelation — has proved remarkably durable, despite being at odds with the way research is actually conducted in almost every modern field. A century of careful work by historians of science has produced a considerably more nuanced picture, but the older story continues to dominate school textbooks, popular biographies, and the way most people casually describe how progress is made.\n\n(41) ____ In interviews with senior researchers across a range of disciplines, the phrase ''slow and messy'' comes up more often than any variant of ''sudden inspiration''. Even those breakthroughs that appear, in retrospect, to have happened overnight typically turn out to have been preceded by years of preparation whose relevance was not obvious at the time.\n\nOne of the most consistent findings from these interviews is how often significant discoveries emerge from what researchers describe as ''productive failure''. An experiment produces a result nobody expected, or a technique developed for one purpose turns out to solve a different problem entirely. (42) ____ What matters, in these cases, is not so much the accident itself as the ability of the researcher to recognise its significance — a skill that seems to be built up through long familiarity with a field.\n\nA related pattern involves the role of what might be called productive collaboration. The most commonly-cited example is that of the small research team in which junior members feel free to challenge senior ones, and in which conversations between people trained in different traditions produce ideas that neither would have reached alone. (43) ____ These are among the most difficult conditions for institutions to create deliberately, which may partly explain why they tend to arise in particular places at particular times rather than being reliably reproducible.\n\nHistorians have also become increasingly interested in the role of what they call ''infrastructure''. A discovery may look, in the standard narrative, like the work of individual brilliance, but it often depends on decades of quieter work by technicians building instruments, curators maintaining specimen collections, or programmers writing shared software. (44) ____ Without this less glamorous work, the visible breakthroughs would not have been possible, or would have arrived considerably later.\n\nWhat all these patterns suggest is that public policies aimed at ''producing breakthroughs'' need to be considerably more subtle than the popular story would suggest. Simply pouring money into a small number of research leaders is unlikely to work if the surrounding conditions — trained technicians, functioning collaborations, good instruments — have been neglected. (45) ____ In each case, the goal is to create the environment in which discoveries can emerge, rather than to demand the discoveries themselves.\n\nWhat this reframing does not require is a wholesale rejection of the individuals who feature in the standard story. Real breakthroughs do involve real people, some of whom make disproportionate contributions. (46) ____ What is needed is a more accurate picture of the conditions under which such people become able to do their most valuable work — and of the collective effort on which their contributions depend.","matching_options":['
     '{"letter":"A","text":"Some countries have begun to experiment with quieter, more patient forms of research funding — long-term grants tied to no specific outcome, generous support for equipment and staff, and mechanisms for encouraging the exchange of ideas across institutional boundaries."},'
     '{"letter":"B","text":"The reality, when researchers themselves are asked about their most significant work, tends to look rather different."},'
     '{"letter":"C","text":"The point is not that individual talent does not matter — clearly it does — but that talent alone rarely produces anything without the surrounding conditions that allow it to develop."},'
     '{"letter":"D","text":"Bibliographic studies of major discoveries have found that these figures are almost always dramatically underrepresented in the resulting publications, and rarely receive credit commensurate with the importance of their contributions."},'
     '{"letter":"E","text":"In one well-documented case, an antibiotic was discovered through the observation of a contaminated laboratory dish that a less curious researcher would probably have thrown away without a second thought."},'
     '{"letter":"F","text":"Such teams, historians have observed, are usually the product of a particular kind of workplace culture in which curiosity is genuinely valued and administrative pressures are kept at bay."},'
     '{"letter":"G","text":"A generation of new instruments has recently reduced the time between hypothesis and result to a matter of weeks in some fields."}'
     ']}')::jsonb
  )
  returning id into p7_id;

  perform _tmp_insert_gapped(p7_id, 41, 'Gap 41', 'B');
  perform _tmp_insert_gapped(p7_id, 42, 'Gap 42', 'E');
  perform _tmp_insert_gapped(p7_id, 43, 'Gap 43', 'F');
  perform _tmp_insert_gapped(p7_id, 44, 'Gap 44', 'D');
  perform _tmp_insert_gapped(p7_id, 45, 'Gap 45', 'A');
  perform _tmp_insert_gapped(p7_id, 46, 'Gap 46', 'C');


  -- ─── PART 8 — Multiple matching (10 preguntas · 4 personas) ──────
  insert into exam_parts (exam_id, skill, part_number, title, instructions, order_index, settings)
  values (
    exam_id, 'reading', 8, 'Multiple matching — Four relationships with science',
    'You are going to read an article in which four people describe their relationship with science. For questions 47-56, choose from the people (A-D). The people may be chosen more than once.',
    7,
    ('{"question_type_hint":"multiple_matching","expected_count":10,'
     '"base_text":"Four relationships with science\n\nA. THEODORE HALLEY, 62, retired accountant and citizen scientist\nI took early retirement at fifty-eight without much idea of what I would do with my time, and stumbled into citizen science almost by accident. A neighbour mentioned an online project asking volunteers to classify images of galaxies produced by an automated telescope. Within a fortnight I was spending three or four hours a day on it. What I had not expected was how much I would come to feel like a genuine participant in the research, rather than a hobbyist filling in a form. When the team behind the project publishes papers, they list us collectively as contributors, and one of my flags — a particular galaxy that struck me as oddly asymmetric — appeared in a footnote of a peer-reviewed article last year. My wife jokes that I now understand more about the structure of galaxies than I ever did about the tax code. She is probably right, though I would not admit it to my former colleagues.\n\nB. NADIRA COMFORT, 34, former PhD candidate, now a technical writer\nI left academia after six years without finishing my doctorate, and I do not regret the decision, though it took me a long time to reach it. The problem was not that I disliked science — I loved my subject and probably always will — but that I found the academic system, with its endless applications, its short-term contracts, and its exhausting demands on personal life, genuinely unsustainable. What surprised me, once I had left, was how much of what I had learned turned out to be transferable to my new work as a technical writer for a scientific instrument company. I now explain, to non-scientists, how the tools I once used are supposed to be operated. My former supervisor thinks I have wasted a promising research career, and it is possible she is right. It is also possible that she is not.\n\nC. DR VIVIAN OSEI, 51, senior neuroscientist\nI have spent twenty-eight years in the same laboratory, working on a very narrow question about how a particular kind of brain cell communicates with its neighbours. Almost nothing I have published would make sense to a member of the general public without a considerable amount of translation, and I have made peace with this. What matters to me is that the questions themselves are worth answering, and that the small international community of specialists who understand them think my contribution has been useful. When I began, I imagined I might one day make a discovery large enough to interest a wider audience. I no longer expect this to happen, and the surprising thing is how little it bothers me. What I have gained, in exchange for the recognition I have not received, is the freedom to work carefully on questions I actually care about, at a pace that suits their difficulty.\n\nD. MARCEL VONDRACEK, 40, science podcaster and former researcher\nI trained as a molecular biologist and worked for eight years in a large university laboratory before starting a podcast about science, which has since become my full-time occupation. The transition was neither planned nor entirely comfortable. What forced my hand was the discovery, after a couple of years of podcasting alongside my research, that I was learning more from interviewing scientists in other fields than from my own daily work — and that the interviewing was reaching a much wider audience than any paper I would ever write. Some of my former colleagues consider this an unforgivable form of desertion. Others have quietly told me that they envy the freedom. The pay is modest, but I now have a public role in the wider scientific conversation that no laboratory job I could realistically have obtained would have offered.","matching_options":['
     '{"letter":"A","text":"Theodore"},'
     '{"letter":"B","text":"Nadira"},'
     '{"letter":"C","text":"Vivian"},'
     '{"letter":"D","text":"Marcel"}'
     ']}')::jsonb
  )
  returning id into p8_id;

  perform _tmp_insert_matching(p8_id, 47,
    'Which person mentions that a specific individual contribution they made was formally recognised in a publication?',
    'A'
  );
  perform _tmp_insert_matching(p8_id, 48,
    'Which person feels their public role now reaches a broader audience than a research career would have done?',
    'D'
  );
  perform _tmp_insert_matching(p8_id, 49,
    'Which person acknowledges that they cannot rule out the possibility that a senior colleague''s critical view of their decision may be right?',
    'B'
  );
  perform _tmp_insert_matching(p8_id, 50,
    'Which person describes making peace with the fact that their work will never reach a wide audience?',
    'C'
  );
  perform _tmp_insert_matching(p8_id, 51,
    'Which person left research primarily because the working conditions of an academic career were unsustainable?',
    'B'
  );
  perform _tmp_insert_matching(p8_id, 52,
    'Which person has been surprised by the depth of their personal engagement with an activity they took up in retirement?',
    'A'
  );
  perform _tmp_insert_matching(p8_id, 53,
    'Which person mentions that some former colleagues consider their career change a form of betrayal?',
    'D'
  );
  perform _tmp_insert_matching(p8_id, 54,
    'Which person values the freedom to work at a pace appropriate to their questions above wider recognition?',
    'C'
  );
  perform _tmp_insert_matching(p8_id, 55,
    'Which person found that skills developed in research turned out to be valuable in a very different professional context?',
    'B'
  );
  perform _tmp_insert_matching(p8_id, 56,
    'Which person''s change of direction was triggered by realising that another activity was giving them more than their research?',
    'D'
  );


  -- ─── PART 9 — Writing Part 1: Essay obligatorio (220-260) ────────
  insert into exam_parts (exam_id, skill, part_number, title, instructions, order_index, settings)
  values (
    exam_id, 'writing', 9, 'Writing Part 1 — Essay',
    'You must answer this question. Write your answer in 220-260 words in an appropriate style.',
    8,
    '{"question_type_hint":"writing_task","expected_count":1}'::jsonb
  )
  returning id into p9_id;

  perform _tmp_insert_writing(p9_id, 57,
    'Your class has recently attended a public lecture on the role of science in modern society. You have made the notes below.',
    ('{"task_instruction":"Write an essay discussing TWO of the areas in your notes below. You should explain which area you consider more important for the future of the relationship between science and the general public, and provide reasons to support your opinion. You may, if you wish, make use of the opinions expressed in the lecture, but you should use your own words as far as possible. Write in 220-260 words.",'
     '"task_type":"essay",'
     '"word_count_min":220,'
     '"word_count_max":260,'
     '"essay_question":"How can the relationship between science and the general public be improved?",'
     '"essay_notes":['
     '{"label":"Notes","text":"Areas to discuss:"},'
     '{"label":"1","text":"the quality of science communication in the media"},'
     '{"label":"2","text":"the involvement of ordinary people in scientific work (citizen science)"},'
     '{"label":"3","text":"the way science is taught in schools"}'
     '],'
     '"opinions":['
     '{"label":"Some opinions expressed in the lecture","text":""},'
     '{"text":"''Most reporting of science treats it as either magic or scandal.''"},'
     '{"text":"''Amateur volunteers have contributed to genuinely important discoveries in the last decade.''"},'
     '{"text":"''Nothing shapes public attitudes to science more than the classroom experience of one bad teacher.''"}'
     ']}')::jsonb
  );


  -- ─── PART 10 — Writing Part 2: Choose one (220-260 palabras) ─────
  insert into exam_parts (exam_id, skill, part_number, title, instructions, order_index, settings)
  values (
    exam_id, 'writing', 10, 'Writing Part 2 — Letter, proposal or review',
    'Write an answer to ONE of the questions in this part. Write your answer in 220-260 words in an appropriate style.',
    9,
    '{"question_type_hint":"writing_task","expected_count":1,"choice_required":true}'::jsonb
  )
  returning id into p10_id;

  perform _tmp_insert_writing(p10_id, 58,
    'Choose ONE of the tasks (A, B or C) and write your answer in 220-260 words.',
    ('{"task_instruction":"You must choose ONE of the three options below.",'
     '"task_type":"letter_proposal_or_review",'
     '"word_count_min":220,'
     '"word_count_max":260,'
     '"choices":['
     '{"letter":"A","type":"letter","title":"Letter to a science magazine",'
     '"prompt":"You have read the following extract from an editorial in an English-language science magazine:\n\n\"Public trust in science has fallen sharply over the past decade, and scientists have largely themselves to blame. They speak a language ordinary people cannot follow, they retreat into technical journals nobody outside their field will read, and they show a striking lack of interest in explaining themselves to those who fund their work.\"\n\nYou disagree with parts of this argument. Write a letter to the editor of the magazine responding to the editorial, explaining which of its claims you accept and which you dispute, and suggesting what you think should be done to improve public understanding of science.\n\nWrite your letter."},'
     '{"letter":"B","type":"proposal","title":"Proposal for a science week",'
     '"prompt":"Your university''s student council has been given a budget to organise a Science Week aimed at the wider community during the next academic year, and members have been asked to submit proposals. Write a proposal for the council outlining:\n\n- what kind of events should be included and why\n- which audiences should be prioritised\n- how the success of the week should be measured\n\nWrite your proposal."},'
     '{"letter":"C","type":"review","title":"Review of a science book or podcast",'
     '"prompt":"You have seen this notice on a website aimed at readers interested in science:\n\nREVIEWS WANTED\n\nHave you recently read a book or listened to a podcast that changed the way you understand a scientific topic? Write us a review saying what it covered, what made it particularly effective, and what kind of reader or listener it would suit.\n\nWrite your review."}'
     ']}')::jsonb
  );


  raise notice 'C1 Advanced Mock 03 (Science & discovery) loaded successfully. Exam ID: %', exam_id;

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
--   where e.title like 'C1 Advanced Mock 03%'
--   group by p.part_number, p.title
--   order by p.part_number;
--
-- Esperado (10 filas, total 58 preguntas):
--   1 · Multiple choice cloze          →  8
--   2 · Open cloze                     →  8
--   3 · Word formation                 →  8
--   4 · Key word transformations       →  6  (×2 puntos)
--   5 · Long text                      →  6
--   6 · Cross-text multiple matching   →  4
--   7 · Gapped text                    →  6
--   8 · Multiple matching              → 10
--   9 · Writing Part 1 — Essay         →  1
--  10 · Writing Part 2                 →  1
--   TOTAL: 58 preguntas
-- =====================================================================
