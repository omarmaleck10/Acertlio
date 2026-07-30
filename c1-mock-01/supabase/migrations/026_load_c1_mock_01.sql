-- =====================================================================
-- ACERTLIO — Carga de mock C1-01 (Language & communication)
-- =====================================================================
-- Primer mock C1 Advanced. Estructura oficial Cambridge CAE post-2015:
--   · Reading and Use of English (90 min · 56 preguntas · 8 parts)
--   · Writing (90 min · 2 tareas)
--
-- Tema del mock: Language & communication
--   - El auge de la traducción automática
--   - Cómo aprendemos idiomas de adultos
--   - Comunicación no verbal
--   - Perfil de un intérprete de conferencias
--   - Cross-text: 4 opiniones sobre lenguas minoritarias
--   - El declive de las lenguas indígenas
--   - Cuatro personas cuentan cómo aprendieron un segundo idioma
--
-- Contenido 100% original.
--
-- Ejecutar tras 001-025. Recrea las funciones helper temporalmente.
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
-- MOCK C1-01 — LANGUAGE & COMMUNICATION
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
    'C1 Advanced Mock 01 — Language & communication',
    'C1', 1,
    'Primer mock C1 Advanced. Tema: lenguas y comunicación — traducción automática, aprender idiomas de adulto, comunicación no verbal, interpretación, lenguas minoritarias, aprendizaje personal. Reading and Use of English (90 min · 56 preguntas · 8 parts) + Writing (90 min · 2 tareas). Contenido 100% original.',
    180, true, 1
  )
  returning id into exam_id;


  -- ─── PART 1 — Multiple choice cloze (8 preguntas A/B/C/D) ────────
  insert into exam_parts (exam_id, skill, part_number, title, instructions, order_index, settings)
  values (
    exam_id, 'reading', 1, 'Multiple choice cloze — The rise of machine translation',
    'For questions 1-8, read the text below and decide which answer (A, B, C or D) best fits each gap.',
    0,
    ('{"question_type_hint":"multiple_choice_cloze","expected_count":8,'
     '"base_text":"The rise of machine translation\n\nUntil relatively recently, machine translation had a well-deserved reputation for producing text that ranged from the confusing to the outright comical. Anyone who (1) ____ their hand at translating a document using an early online tool would remember the strange results: perfectly ordinary sentences reduced to word salads that no native speaker would ever produce. That has now changed almost (2) ____ recognition, largely thanks to a family of techniques known collectively as neural translation.\n\nWhat makes these systems different is that they no longer translate word by word or even phrase by phrase. Instead, they attempt to (3) ____ the underlying meaning of an entire sentence before producing an equivalent in the target language. In many everyday contexts — reading a foreign news article, understanding a menu, replying to an email — the results are now good enough to (4) ____ for a native speaker''s own writing.\n\nThis leap forward has (5) ____ predictable questions about the future of human translators. Some commentators have gone (6) ____ as to suggest that professional translation is an industry on borrowed time. The reality is considerably more nuanced. Machine translation still struggles with anything requiring cultural sensitivity, poetic register, or specialist knowledge, and getting these details wrong can (7) ____ serious consequences for readers.\n\nWhat is more likely, most experts agree, is a shift in the profession rather than its disappearance. Translators are increasingly working alongside these tools, using them for a first (8) ____ and then editing the output — a process known in the trade as post-editing."}')::jsonb
  )
  returning id into p1_id;

  perform _tmp_insert_mc_cloze4(p1_id, 1, 'Gap 1', 'B',
    'put', 'tried', 'laid', 'turned'
  );
  perform _tmp_insert_mc_cloze4(p1_id, 2, 'Gap 2', 'C',
    'past', 'over', 'beyond', 'above'
  );
  perform _tmp_insert_mc_cloze4(p1_id, 3, 'Gap 3', 'A',
    'capture', 'hold', 'seize', 'trap'
  );
  perform _tmp_insert_mc_cloze4(p1_id, 4, 'Gap 4', 'A',
    'pass', 'seem', 'appear', 'match'
  );
  perform _tmp_insert_mc_cloze4(p1_id, 5, 'Gap 5', 'C',
    'lifted', 'awoken', 'raised', 'brought'
  );
  perform _tmp_insert_mc_cloze4(p1_id, 6, 'Gap 6', 'B',
    'even', 'so far', 'this far', 'much'
  );
  perform _tmp_insert_mc_cloze4(p1_id, 7, 'Gap 7', 'D',
    'take', 'give', 'do', 'have'
  );
  perform _tmp_insert_mc_cloze4(p1_id, 8, 'Gap 8', 'A',
    'draft', 'sketch', 'trial', 'copy'
  );


  -- ─── PART 2 — Open cloze (8 preguntas, sin opciones) ─────────────
  insert into exam_parts (exam_id, skill, part_number, title, instructions, order_index, settings)
  values (
    exam_id, 'reading', 2, 'Open cloze — Why adults find languages hard',
    'For questions 9-16, read the text below and think of the word which best fits each gap. Use only ONE word in each gap.',
    1,
    ('{"question_type_hint":"open_cloze","expected_count":8,'
     '"base_text":"Why adults find languages hard\n\nThe idea that adults are simply worse than children (9) ____ learning languages is one of the most widespread beliefs in education. And yet, when researchers examine the evidence carefully, the picture turns (10) ____ to be considerably more complicated than the popular story suggests.\n\nIt is certainly true that very young children acquire their first language with a speed and completeness that adults rarely match. (11) ____ , this does not necessarily mean that children are better learners in any general sense. What it means is that they have an enormous advantage in terms of exposure: babies spend virtually (12) ____ their waking hours immersed in language, whereas adults typically manage a few hours a week at best.\n\nAdults also face a number of obstacles that have (13) ____ to do with their brains and much to do with their circumstances. They are often self-conscious about making mistakes in front of others, whereas children experience (14) ____ such embarrassment. Adults also have well-established habits of pronunciation from their first language, and (15) ____ can be extremely difficult to overcome. Perhaps most importantly, most adults never really need the new language for daily survival, so their motivation naturally fluctuates.\n\nWhen these variables are controlled for in laboratory studies, adults often perform (16) ____ well as, or even better than, younger learners on most measures — the notable exception being pronunciation, where children do retain a genuine edge."}')::jsonb
  )
  returning id into p2_id;

  perform _tmp_insert_open_cloze(p2_id, 9, 'Gap 9', 'at');
  perform _tmp_insert_open_cloze(p2_id, 10, 'Gap 10', 'out');
  perform _tmp_insert_open_cloze(p2_id, 11, 'Gap 11', 'however|yet|still');
  perform _tmp_insert_open_cloze(p2_id, 12, 'Gap 12', 'all');
  perform _tmp_insert_open_cloze(p2_id, 13, 'Gap 13', 'little|nothing');
  perform _tmp_insert_open_cloze(p2_id, 14, 'Gap 14', 'no');
  perform _tmp_insert_open_cloze(p2_id, 15, 'Gap 15', 'these|those');
  perform _tmp_insert_open_cloze(p2_id, 16, 'Gap 16', 'as');


  -- ─── PART 3 — Word formation (8 preguntas) ───────────────────────
  insert into exam_parts (exam_id, skill, part_number, title, instructions, order_index, settings)
  values (
    exam_id, 'reading', 3, 'Word formation — Reading between the lines',
    'For questions 17-24, read the text below. Use the word given in capitals at the end of some of the lines to form a word that fits in the gap in the same line.',
    2,
    ('{"question_type_hint":"word_formation","expected_count":8,'
     '"base_text":"Reading between the lines\n\nMuch of what we communicate has (17) ____ [ABSOLUTE] nothing to do with the words we say. Research consistently shows that the (18) ____ [MAJOR] of what is understood in a face-to-face conversation comes from facial expressions, body language, and tone of voice. In fact, this nonverbal channel is often so (19) ____ [OVERWHELM] that when these signals contradict the words spoken, we tend to believe the signals rather than the words.\n\nThis has serious (20) ____ [IMPLY] for how we understand miscommunication in our increasingly digital lives. When we send a message by text, we strip away almost every nonverbal cue that would (21) ____ [NORMAL] guide the reader''s interpretation. What was intended as a mild joke can easily be received as an insult; what was meant as a genuine question can seem (22) ____ [ACCUSE] .\n\nSome researchers argue that emojis and animated stickers have partly evolved to fill this gap, providing at least crude (23) ____ [REPLACE] for the smiles, frowns and shrugs that would accompany the same words in person. Others are more (24) ____ [SCEPTIC] , pointing out that a smiling face at the end of a difficult message can just as easily raise suspicions about the sender''s real feelings."}')::jsonb
  )
  returning id into p3_id;

  perform _tmp_insert_word_form(p3_id, 17, 'ABSOLUTE', 'absolutely');
  perform _tmp_insert_word_form(p3_id, 18, 'MAJOR', 'majority');
  perform _tmp_insert_word_form(p3_id, 19, 'OVERWHELM', 'overwhelming');
  perform _tmp_insert_word_form(p3_id, 20, 'IMPLY', 'implications|implication');
  perform _tmp_insert_word_form(p3_id, 21, 'NORMAL', 'normally');
  perform _tmp_insert_word_form(p3_id, 22, 'ACCUSE', 'accusatory|accusing');
  perform _tmp_insert_word_form(p3_id, 23, 'REPLACE', 'replacements|replacement');
  perform _tmp_insert_word_form(p3_id, 24, 'SCEPTIC', 'sceptical|skeptical');


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
    'The teacher immediately regretted saying what she had said.',
    'sooner',
    'No',
    'than she regretted it.',
    'sooner had the teacher said it|sooner had the teacher spoken'
  );

  perform _tmp_insert_key_transform(p4_id, 26,
    'Nobody thought that Maria would win the language competition.',
    'least',
    'Maria won the language competition',
    'expected to.',
    'when she was least|when she was the least'
  );

  perform _tmp_insert_key_transform(p4_id, 27,
    'The main reason we changed publisher was the delays.',
    'account',
    'It was',
    'that we changed publisher.',
    'on account of the delays|largely on account of the delays'
  );

  perform _tmp_insert_key_transform(p4_id, 28,
    'It was fortunate that he spoke slowly, or I would not have understood the accent.',
    'been',
    'Had',
    'for his slow speech, I would not have understood the accent.',
    'it not been'
  );

  perform _tmp_insert_key_transform(p4_id, 29,
    'The dictionary is unlikely to be published before the summer.',
    'chance',
    'There',
    'of the dictionary appearing before the summer.',
    'is little chance|is only a slim chance|is only a small chance'
  );

  perform _tmp_insert_key_transform(p4_id, 30,
    'James had trouble understanding what his colleague was saying.',
    'making',
    'James had',
    'his colleague was saying.',
    'trouble making sense of what|difficulty making sense of what'
  );


  -- ─── PART 5 — Long text + multiple choice (6 preguntas A/B/C/D) ─
  insert into exam_parts (exam_id, skill, part_number, title, instructions, order_index, settings)
  values (
    exam_id, 'reading', 5, 'Long text — The interpreter''s hidden art',
    'You are going to read an article about conference interpreting. For questions 31-36, choose the answer (A, B, C or D) which you think fits best according to the text.',
    4,
    ('{"question_type_hint":"multiple_choice","expected_count":6,'
     '"reading_text":"The interpreter''s hidden art\n\nMargarita Sáenz-Díez has been interpreting at the highest levels of international diplomacy for over three decades, and it is a source of quiet satisfaction to her that the vast majority of the people whose words she has channelled will not remember she was there. When an interpreter''s work is done well, she believes, it is invisible; the moment listeners become aware of the voice rendering meaning from one language into another, something has already gone slightly wrong.\n\nThis emphasis on invisibility runs counter to what most people imagine about the profession. When Sáenz-Díez tells strangers what she does for a living, the reaction is often a mixture of admiration and mild disbelief — as though simultaneous interpreting were a form of intellectual acrobatics reserved for a small caste of exceptionally gifted individuals. She is at pains, in interviews and lectures, to correct this impression. What her work requires above all, she insists, is not raw brilliance but relentless preparation and a temperament suited to being consistently useful without being noticed.\n\nHer training took eight years, during which she describes herself as having been ''broken down and rebuilt several times''. The technical challenges were considerable: producing coherent speech in one language while simultaneously listening to another; keeping up with fast speakers whose words tumble over each other; managing the tricky asymmetries between languages, such as verbs that come at the beginning of a sentence in English but the end in German. Yet what she found hardest was less the mechanics than a subtler discipline: the constant suppression of her own instinct to improve, correct or soften what a speaker was actually saying.\n\nInterpreters, she argues, are frequently tempted to intervene in ways they consider harmless. A minor grammatical error can quietly be smoothed over; an offensive phrase can be rendered slightly more diplomatic; a joke that will not translate can be replaced with something that gets a similar laugh. In each case, the interpreter is arguably serving communication. But over years of practice, Sáenz-Díez has become convinced that these interventions accumulate into a slow betrayal of the profession''s core obligation, which is to render as faithfully as possible what has been said — including its rough edges.\n\nShe does concede that certain situations require finer judgement. When a speaker uses a cultural reference that would be genuinely meaningless in another language, some kind of adaptation is unavoidable. When a delegate is visibly upset, tone as well as words must be conveyed. But even these decisions, she says, must be made with the recognition that the interpreter is choosing on behalf of others who may not have wanted to be chosen for. That awareness, she believes, is what distinguishes a professional from an enthusiastic amateur.\n\nRetirement is on her mind these days, though she is not sure she can face it. What would she miss most? Not the prestige, she thinks, and certainly not the pressure. What she would miss is the peculiar sensation, at the end of a long day, of having been trusted to carry something across a border — an argument, a plea, an apology — and having done so without leaving her own fingerprints on it. This, she says, is a kind of pleasure she cannot easily explain, even to colleagues. It is quieter and more private than most professional satisfactions, and precisely for that reason, it has never worn thin."}')::jsonb
  )
  returning id into p5_id;

  perform _tmp_insert_mc4(p5_id, 31,
    'What point does Sáenz-Díez make about the quality of interpreting in the first paragraph?',
    'B',
    'It should be evaluated by the accuracy of individual words rather than the overall effect.',
    'A high-quality performance is one that the audience does not consciously register.',
    'Listeners rarely appreciate how much work has gone into a successful interpretation.',
    'Most professionals prefer clients who understand the difficulty of what they do.'
  );

  perform _tmp_insert_mc4(p5_id, 32,
    'How does Sáenz-Díez respond to the public perception of her profession?',
    'D',
    'She encourages the view that interpreting requires rare gifts.',
    'She feels flattered by the admiration it usually attracts.',
    'She avoids discussing her work with people outside the field.',
    'She actively tries to correct what she sees as a misleading impression.'
  );

  perform _tmp_insert_mc4(p5_id, 33,
    'According to the third paragraph, the hardest aspect of Sáenz-Díez''s training was',
    'C',
    'coping with the physical demands of speaking and listening at the same time.',
    'adapting to the very different grammatical structures of certain languages.',
    'learning to hold back her impulse to alter what she was interpreting.',
    'overcoming her fear of making mistakes in front of important audiences.'
  );

  perform _tmp_insert_mc4(p5_id, 34,
    'What is Sáenz-Díez''s view of interpreters who make small "improvements" to a speaker''s words?',
    'A',
    'Their motives may be good but the cumulative effect undermines the profession.',
    'Such interventions are acceptable if they help the audience understand the message.',
    'The practice is common among interpreters trained in her generation.',
    'Most audiences prefer this style of interpreting to a purely literal one.'
  );

  perform _tmp_insert_mc4(p5_id, 35,
    'In the fifth paragraph, Sáenz-Díez suggests that when interpreters exercise judgement, they should',
    'C',
    'always err on the side of literal accuracy over cultural adaptation.',
    'consult with the speaker whenever a difficult decision arises.',
    'remember that they are making choices for people who did not ask them to.',
    'avoid any intervention that goes beyond direct translation of words.'
  );

  perform _tmp_insert_mc4(p5_id, 36,
    'What would Sáenz-Díez miss most if she retired?',
    'D',
    'The intellectual challenge of her most difficult assignments.',
    'The public recognition she has earned over three decades.',
    'The friendships she has developed with fellow interpreters.',
    'The private sense of having transmitted something faithfully.'
  );


  -- ─── PART 6 — Cross-text multiple matching (4 preguntas) ─────────
  insert into exam_parts (exam_id, skill, part_number, title, instructions, order_index, settings)
  values (
    exam_id, 'reading', 6, 'Cross-text multiple matching — Should endangered languages be saved?',
    'You are going to read four extracts from articles in which academics give their views on the effort to save endangered languages. For questions 37-40, choose from the extracts (A-D). The extracts may be chosen more than once.',
    5,
    ('{"question_type_hint":"multiple_matching","expected_count":4,'
     '"base_text":"Should endangered languages be saved?\n\nFour academics give their views on the effort to preserve endangered languages.\n\nA. DR ELENA MORENO, linguist\nEvery language contains a unique way of organising human experience, and when one is lost, a particular understanding of the world disappears with it. The techniques a small Amazonian community uses to name its river system, for example, encode centuries of knowledge that no other language can recover. For this reason I remain firmly convinced that the effort to preserve endangered languages is not a sentimental gesture but a scientific and ethical necessity. Some critics claim that language preservation freezes communities in the past, but this misunderstands both languages and communities. Speakers themselves are perfectly capable of adopting modern life while continuing to use, teach and modernise their ancestral tongue. What they need is external respect and reasonable investment, not lectures from outsiders about which parts of their culture are worth keeping.\n\nB. PROFESSOR RASHID KUMAR, sociologist\nThe standard case for preserving endangered languages is that each one embodies a unique worldview. I have some sympathy for this argument, but I think it is often overstated. Many of the ''cognitive treasures'' that linguists claim are locked inside minority languages turn out, on closer inspection, to be present in various forms in other languages too. That said, my disagreement with the preservation movement is not really about linguistics. It is about who decides. Most decisions about language preservation are made by academics and governments, not by the communities affected. If a community itself concludes that a switch to a larger language will improve its children''s prospects, that is their choice to make. Outsiders should offer support if it is requested and stand back if it is not.\n\nC. DR IAN CHAMBERS, anthropologist\nI have spent twenty years working with a community whose language has fewer than four hundred remaining speakers, and my experience has convinced me that the debate about ''saving'' endangered languages is often conducted at too abstract a level. Real language survival depends not on grand declarations but on practical arrangements: schools where the language is genuinely used, television programmes that reach the young, employment where it pays to be fluent. Where these conditions exist, small languages can flourish for generations. Where they do not, no amount of funding for academic dictionaries will make any difference. On the underlying principle, I side firmly with those who argue that communities themselves must lead this work — outsiders can support, but they should not decide.\n\nD. PROFESSOR ANNE-LAURE BERTIN, philosopher\nWhen I am asked whether endangered languages should be preserved, my honest answer is that we should not be asking the question in that form at all. The very phrasing assumes that outsiders — governments, universities, international bodies — have the standing to decide what happens to somebody else''s language. In my view, they do not. The role of academics like me is not to make grand pronouncements about which languages deserve to survive; it is to make ourselves useful when communities themselves choose to keep their language alive, and to accept that our own preferences are largely irrelevant. Where I differ from some of my colleagues is that I do not think preserving a language automatically preserves a worldview: languages and cultures evolve together, and something we imagine we are saving may already have moved on.","matching_options":['
     '{"letter":"A","text":"Extract A (Dr Moreno)"},'
     '{"letter":"B","text":"Extract B (Prof Kumar)"},'
     '{"letter":"C","text":"Extract C (Dr Chambers)"},'
     '{"letter":"D","text":"Extract D (Prof Bertin)"}'
     ']}')::jsonb
  )
  returning id into p6_id;

  perform _tmp_insert_matching(p6_id, 37,
    'Which academic disagrees most fundamentally with the underlying idea that preserving a language automatically preserves a particular way of seeing the world?',
    'D'
  );
  perform _tmp_insert_matching(p6_id, 38,
    'Which academic has a similar view to Prof Kumar about who should make decisions on language preservation?',
    'C'
  );
  perform _tmp_insert_matching(p6_id, 39,
    'Which academic most clearly emphasises that support for endangered languages should be practical rather than symbolic?',
    'C'
  );
  perform _tmp_insert_matching(p6_id, 40,
    'Which academic disagrees with Prof Kumar about the importance of the "unique worldview" argument for preservation?',
    'A'
  );



  -- ─── PART 7 — Gapped text: párrafos (6 preguntas) ────────────────
  insert into exam_parts (exam_id, skill, part_number, title, instructions, order_index, settings)
  values (
    exam_id, 'reading', 7, 'Gapped text — The last speakers',
    'You are going to read an article about small languages. Six paragraphs have been removed from the article. Choose from paragraphs A-G the one which fits each gap (41-46). There is one extra paragraph which you do not need to use.',
    6,
    ('{"question_type_hint":"multiple_matching","expected_count":6,'
     '"base_text":"The last speakers\n\nOf the roughly seven thousand languages spoken today, linguists estimate that about half will have disappeared by the end of this century. In many cases, the process has already reached its final stage: the language is used only by a handful of elderly people, often unable to find anyone with whom to hold an extended conversation. What is being lost, when a language reaches this state, is not merely a system of communication but centuries of accumulated understanding about the natural and social world.\n\n(41) ____ These have included the establishment of formal educational programmes, the creation of digital archives, and — perhaps most importantly — the training of young community members as teachers of their own ancestral language. The results, however, have been mixed, and the reasons for both successes and failures are more complex than they might first appear.\n\nOne of the recurring patterns is the extraordinary influence of a small number of committed individuals. In several documented cases, an endangered language has been pulled back from the brink largely through the sustained effort of one or two families who insisted, generation after generation, on using the language with their children. (42) ____ Yet even these remarkable examples share a limitation: they depend so heavily on individual commitment that the language remains vulnerable whenever that commitment falters.\n\nAt the community level, what matters most is whether the language is present in domains that young people actually value. A language that has been reduced to home use, or to ceremonial occasions with grandparents, tends to disappear within two generations. (43) ____ Communities that manage to reintroduce their language into local business, popular music, and children''s entertainment tend to see young people continue to speak it into adulthood.\n\nThe role of governments has been particularly interesting to study. Well-intentioned policies can, paradoxically, cause harm: a language that is required in school but never used in daily life may come to feel like an obligation rather than a possession, especially for teenagers. (44) ____ These have generally been more effective than programmes designed and implemented from outside.\n\nWhat happens to the knowledge encoded in a language when it does die out? Linguists have made increasingly sophisticated efforts to preserve at least the outlines of such knowledge in dictionaries, grammars, and audio recordings. (45) ____ A grammar can describe the structure of a language, but it cannot teach anyone to think in it; a recording of a story can preserve the words, but not the way an experienced speaker weighs each phrase against unspoken cultural expectations.\n\nFor these reasons, most linguists who work in the field have gradually shifted their focus away from documentation for its own sake and towards support for communities that want to keep their language alive. (46) ____ Nobody claims that this approach will save every language now considered endangered. But for those that survive, it is likely to be because their speakers wanted them to survive — not because outsiders decided they should.","matching_options":['
     '{"letter":"A","text":"Where governments have been genuinely useful, it has usually been through modest support for initiatives designed by the communities themselves — funding for community schools, help with publishing children''s books, or subsidies for local media in the language."},'
     '{"letter":"B","text":"But even the most detailed documentation, most now acknowledge, captures only a fraction of what a fluent speaker actually knows."},'
     '{"letter":"C","text":"In one case in the Pacific, a language that had almost vanished in the 1970s now has several hundred confident speakers under the age of thirty, thanks largely to the persistence of two elderly sisters who refused to switch to English at home."},'
     '{"letter":"D","text":"The most successful global languages, by contrast, tend to spread through business and popular culture rather than through formal instruction."},'
     '{"letter":"E","text":"Where these families exist, their most valuable contribution has been to normalise the language in daily life, so that children encounter it not as a school subject but as the natural medium of family conversation."},'
     '{"letter":"F","text":"This shift reflects a growing recognition that the choice to speak a language is a decision that only speakers themselves can make, and that outside intervention succeeds only when it is welcomed."},'
     '{"letter":"G","text":"Faced with this scale of loss, linguists and communities around the world have developed a wide range of responses over the past few decades."}'
     ']}')::jsonb
  )
  returning id into p7_id;

  perform _tmp_insert_gapped(p7_id, 41, 'Gap 41', 'G');
  perform _tmp_insert_gapped(p7_id, 42, 'Gap 42', 'C');
  perform _tmp_insert_gapped(p7_id, 43, 'Gap 43', 'D');
  perform _tmp_insert_gapped(p7_id, 44, 'Gap 44', 'A');
  perform _tmp_insert_gapped(p7_id, 45, 'Gap 45', 'B');
  perform _tmp_insert_gapped(p7_id, 46, 'Gap 46', 'F');


  -- ─── PART 8 — Multiple matching (10 preguntas · 4 personas) ──────
  insert into exam_parts (exam_id, skill, part_number, title, instructions, order_index, settings)
  values (
    exam_id, 'reading', 8, 'Multiple matching — Four people, four ways of learning a language',
    'You are going to read an article in which four people describe how they learned a second language as adults. For questions 47-56, choose from the people (A-D). The people may be chosen more than once.',
    7,
    ('{"question_type_hint":"multiple_matching","expected_count":10,'
     '"base_text":"Four people, four ways of learning a language\n\nA. LEO KRAJEWSKI, 38, translator\nI reached advanced Spanish through what would probably be considered a very old-fashioned method — grammar first, then reading, then finally conversation. My teacher was a retired professor who believed that anyone who could not diagram a subordinate clause had no business trying to speak the language, and for the first year I did almost nothing but exercises. Friends who took different approaches used to tease me about it, but I have come to think that method suited both my temperament and my eventual career. When I later moved to Madrid, I was surprised by how much of what I had learned actually held up under pressure, and how easily I could self-correct when I did make mistakes. What I lacked was fluency in casual registers, which took another two or three years to acquire. I sometimes wonder whether a more balanced early approach would have saved me time. But then again, I now earn my living as a translator, and my colleagues who came at the language differently often ask me technical questions that I can answer without hesitation.\n\nB. NAOMI ATTLEE, 29, doctor\nI was medically posted to a rural clinic in Peru without any Spanish at all, and I learned it entirely through immersion and desperation. In the first few months I made mistakes that still make me wince to remember, and I have no doubt that several patients ended up with slightly more colourful medical instructions than they had bargained for. What saved me was that people in the community were both patient and blunt: they would correct me openly and laugh with me about the funnier errors. This meant I lost my fear of being wrong very quickly, and I think that was probably worth more than any textbook. Even now, several years on, my Spanish contains gaps that a formally trained speaker would find surprising. I am reasonably eloquent about symptoms, treatments and medical procedures, but I still get certain everyday grammatical structures wrong, because I never systematically studied them. I have thought about going back and filling those gaps, but somehow I never do.\n\nC. MIGUEL DA COSTA, 47, engineer\nI decided at forty to learn Japanese from scratch, mainly because my wife is Japanese and I was tired of understanding almost nothing when we visited her family. My method has been to combine short daily lessons on an app with a weekly conversation session with a private teacher over video. What has genuinely surprised me is how much difference the daily habit makes, even when each session is only twenty minutes. My teacher tells me that many of her adult students give up because they try to do too much at once and then feel guilty when they miss a week. I think keeping it small has been essential. Seven years in, I am nowhere near fluent, and I am at peace with that. What I can do now is follow most of the conversation at a family lunch, contribute occasionally, and read enough of the writing system to get around a Japanese city without help. That, for me, is worth the effort many times over.\n\nD. ISABELA FERREIRA, 33, journalist\nI came to French relatively late — I was twenty-eight when I started — and I decided at the outset that I would learn it primarily by reading. Every day for about two years I read at least one article in French, then a book, then eventually novels. I did no formal classes at all in that period, and my speaking developed slowly. What that method did give me was an enormous vocabulary and a good instinctive sense of what sounds right in the language, which paid off later. When I finally moved to Brussels for a job in journalism, my written French was strong from day one, though my spoken confidence took another eighteen months to catch up. Looking back, I think the reading-heavy approach was ideally suited to what I would eventually do for a living, but I would not necessarily recommend it to someone who needs to communicate quickly.","matching_options":['
     '{"letter":"A","text":"Leo"},'
     '{"letter":"B","text":"Naomi"},'
     '{"letter":"C","text":"Miguel"},'
     '{"letter":"D","text":"Isabela"}'
     ']}')::jsonb
  )
  returning id into p8_id;

  perform _tmp_insert_matching(p8_id, 47,
    'Which person mentions the value of small but consistent daily practice?',
    'C'
  );
  perform _tmp_insert_matching(p8_id, 48,
    'Which person acknowledges that the method they chose eventually turned out to match their career?',
    'A'
  );
  perform _tmp_insert_matching(p8_id, 49,
    'Which person mentions being helped by the openness of others in correcting their mistakes?',
    'B'
  );
  perform _tmp_insert_matching(p8_id, 50,
    'Which person accepts that their level of fluency after years of study is quite limited?',
    'C'
  );
  perform _tmp_insert_matching(p8_id, 51,
    'Which person describes their method as unusual by contemporary standards?',
    'A'
  );
  perform _tmp_insert_matching(p8_id, 52,
    'Which person has considered addressing gaps in their language but has not acted on it?',
    'B'
  );
  perform _tmp_insert_matching(p8_id, 53,
    'Which person began learning the language mainly for personal rather than professional reasons?',
    'C'
  );
  perform _tmp_insert_matching(p8_id, 54,
    'Which person developed a strong feel for what sounds right through exposure?',
    'D'
  );
  perform _tmp_insert_matching(p8_id, 55,
    'Which person suggests their approach would not work well for someone who needs the language quickly?',
    'D'
  );
  perform _tmp_insert_matching(p8_id, 56,
    'Which person says their initial fear of making mistakes disappeared very quickly?',
    'B'
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
    'Your class has attended a panel discussion on how languages are changing in the age of the internet. You have made the notes below.',
    ('{"task_instruction":"Write an essay discussing TWO of the areas in your notes below. You should explain which area is more important for the future of a language and provide reasons to support your opinion. You may, if you wish, make use of the opinions expressed in the discussion, but you should use your own words as far as possible. Write in 220-260 words.",'
     '"task_type":"essay",'
     '"word_count_min":220,'
     '"word_count_max":260,'
     '"essay_question":"How is the internet changing the languages we use?",'
     '"essay_notes":['
     '{"label":"Notes","text":"Areas to discuss:"},'
     '{"label":"1","text":"the influence of English on other languages"},'
     '{"label":"2","text":"the way we write (spelling, punctuation, register)"},'
     '{"label":"3","text":"the survival of minority languages"}'
     '],'
     '"opinions":['
     '{"label":"Some opinions expressed in the discussion","text":""},'
     '{"text":"''Everyone under thirty is writing a hybrid of their own language and English now.''"},'
     '{"text":"''Text conventions have replaced formal writing for a whole generation.''"},'
     '{"text":"''Minority languages have never had better tools than they do today.''"}'
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
     '{"letter":"A","type":"letter","title":"Letter to a newspaper",'
     '"prompt":"You have read the following extract in an article in an English-language newspaper:\n\n\"Language teaching in schools is failing to produce genuinely fluent speakers. After years of study, most students can barely hold a conversation. It is time to admit that traditional classroom methods do not work, and to replace them with immersion-based programmes that mirror how children actually acquire their first language.\"\n\nYou disagree with parts of this argument. Write a letter to the editor of the newspaper responding to the extract, explaining which of its claims you accept and which you dispute, and suggesting what you think should be done.\n\nWrite your letter."},'
     '{"letter":"B","type":"proposal","title":"Proposal for a language exchange",'
     '"prompt":"Your international university society has received a small budget to launch a new language exchange programme for the next academic year, and the society president has asked members to submit proposals. Write a proposal for the president outlining:\n\n- what shape the programme should take\n- which language pairings should be prioritised and why\n- how the success of the programme should be measured after one year\n\nWrite your proposal."},'
     '{"letter":"C","type":"review","title":"Review of a book, film or podcast",'
     '"prompt":"You have seen this notice on a website aimed at advanced language learners:\n\nREVIEWS WANTED\n\nWe are looking for reviews of books, films or podcasts that helped you significantly with your English. Tell us what the item is, why you found it useful, and what kind of learner it might suit best.\n\nThe best reviews will be published on our home page.\n\nWrite your review."}'
     ']}')::jsonb
  );


  raise notice 'C1 Advanced Mock 01 (Language & communication) loaded successfully. Exam ID: %', exam_id;

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
--   where e.title like 'C1 Advanced Mock 01%'
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
