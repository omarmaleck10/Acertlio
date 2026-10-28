-- ─────────────────────────────────────────────────────
-- Migración 041: Seed del catálogo oficial Cambridge
-- + 2 actividades de ejemplo para testing
-- ─────────────────────────────────────────────────────

-- ─── CATÁLOGO OFICIAL DE PARTES ─────────────────────
INSERT INTO public.exam_part_catalog
  (level, skill, part_number, slug, name, description, official_question_count, default_question_type, display_order)
VALUES
  -- ═══ A2 KEY ═══
  ('A2', 'reading',        1, 'a2-reading-part-1', 'Signs and Short Texts', 'Match short texts with their meaning', 6, 'multiple_choice', 101),
  ('A2', 'reading',        2, 'a2-reading-part-2', 'Matching', 'Match descriptions with people', 7, 'multiple_matching', 102),
  ('A2', 'reading',        3, 'a2-reading-part-3', 'Multiple Choice', '3-option multiple choice on a long text', 5, 'multiple_choice', 103),
  ('A2', 'reading',        4, 'a2-reading-part-4', 'Gapped Text', 'Choose correct word for each gap', 7, 'multiple_choice', 104),
  ('A2', 'reading',        5, 'a2-reading-part-5', 'Open Cloze', 'Fill gaps with one word', 6, 'open_cloze', 105),
  ('A2', 'writing',        6, 'a2-writing-part-6', 'Short Message', 'Write 25 words answering 3 points', 1, 'multiple_choice', 106),
  ('A2', 'writing',        7, 'a2-writing-part-7', 'Story', 'Write a 35-word story from 3 pictures', 1, 'multiple_choice', 107),
  ('A2', 'listening',      1, 'a2-listening-part-1', 'Multiple Choice (Pictures)', 'Choose correct picture', 5, 'multiple_choice', 108),
  ('A2', 'listening',      2, 'a2-listening-part-2', 'Gap-Fill', 'Fill missing information', 5, 'open_cloze', 109),
  ('A2', 'listening',      3, 'a2-listening-part-3', 'Multiple Choice (3-option)', '3-option multiple choice', 5, 'multiple_choice', 110),
  ('A2', 'listening',      4, 'a2-listening-part-4', 'Multiple Choice (Short Dialogues)', 'Short dialogue multiple choice', 5, 'multiple_choice', 111),
  ('A2', 'listening',      5, 'a2-listening-part-5', 'Matching', 'Match speakers to statements', 5, 'multiple_matching', 112),

  -- ═══ B1 PRELIMINARY ═══
  ('B1', 'reading',        1, 'b1-reading-part-1', 'Short Messages', 'Multiple choice on signs/notes', 5, 'multiple_choice', 201),
  ('B1', 'reading',        2, 'b1-reading-part-2', 'Matching', 'Match 5 people to 8 texts', 5, 'multiple_matching', 202),
  ('B1', 'reading',        3, 'b1-reading-part-3', 'Multiple Choice', '4-option multiple choice on long text', 5, 'multiple_choice', 203),
  ('B1', 'reading',        4, 'b1-reading-part-4', 'Gapped Text', 'Choose sentence that fits each gap', 5, 'multiple_choice', 204),
  ('B1', 'reading',        5, 'b1-reading-part-5', 'Multiple Choice Cloze', 'Choose correct word for each gap', 6, 'multiple_choice', 205),
  ('B1', 'reading',        6, 'b1-reading-part-6', 'Open Cloze', 'Fill gaps with one word', 6, 'open_cloze', 206),
  ('B1', 'writing',        1, 'b1-writing-part-1', 'Email', 'Write ~100-word email', 1, 'multiple_choice', 207),
  ('B1', 'writing',        2, 'b1-writing-part-2', 'Article or Story', '~100-word article or story', 1, 'multiple_choice', 208),
  ('B1', 'listening',      1, 'b1-listening-part-1', 'Multiple Choice (Pictures)', '7 short extracts, pick correct picture', 7, 'multiple_choice', 209),
  ('B1', 'listening',      2, 'b1-listening-part-2', 'Multiple Choice', '4-option multiple choice', 6, 'multiple_choice', 210),
  ('B1', 'listening',      3, 'b1-listening-part-3', 'Gap-Fill', 'Fill 6 gaps while listening', 6, 'open_cloze', 211),
  ('B1', 'listening',      4, 'b1-listening-part-4', 'Multiple Choice (Interview)', '4-option multiple choice on interview', 6, 'multiple_choice', 212),

  -- ═══ B2 FIRST ═══  (los más demandados)
  ('B2', 'use_of_english', 1, 'b2-uoe-part-1', 'Multiple Choice Cloze', '4-option word choice for 8 gaps', 8, 'multiple_choice', 301),
  ('B2', 'use_of_english', 2, 'b2-uoe-part-2', 'Open Cloze', 'Fill 8 gaps with one word each', 8, 'open_cloze', 302),
  ('B2', 'use_of_english', 3, 'b2-uoe-part-3', 'Word Formation', 'Transform base word to fit 8 gaps', 8, 'word_formation', 303),
  ('B2', 'use_of_english', 4, 'b2-uoe-part-4', 'Key Word Transformation', 'Rewrite 6 sentences using given word', 6, 'key_word_transformation', 304),
  ('B2', 'reading',        5, 'b2-reading-part-5', 'Multiple Choice', '4-option MC on long text, 6 questions', 6, 'multiple_choice', 305),
  ('B2', 'reading',        6, 'b2-reading-part-6', 'Gapped Text', 'Choose sentence to fit 6 gaps', 6, 'multiple_choice', 306),
  ('B2', 'reading',        7, 'b2-reading-part-7', 'Multiple Matching', 'Match 10 questions to 4-6 texts', 10, 'multiple_matching', 307),
  ('B2', 'writing',        1, 'b2-writing-part-1', 'Essay', '140-190 word essay (compulsory)', 1, 'multiple_choice', 308),
  ('B2', 'writing',        2, 'b2-writing-part-2', 'Choice', '140-190 word article/email/letter/review/report', 1, 'multiple_choice', 309),
  ('B2', 'listening',      1, 'b2-listening-part-1', 'Multiple Choice (Short Extracts)', '8 short extracts, 3-option MC', 8, 'multiple_choice', 310),
  ('B2', 'listening',      2, 'b2-listening-part-2', 'Sentence Completion', 'Complete 10 sentences while listening', 10, 'open_cloze', 311),
  ('B2', 'listening',      3, 'b2-listening-part-3', 'Multiple Matching', 'Match 5 speakers to 8 statements', 5, 'multiple_matching', 312),
  ('B2', 'listening',      4, 'b2-listening-part-4', 'Multiple Choice (Interview)', '4-option MC on long interview', 7, 'multiple_choice', 313),

  -- ═══ C1 ADVANCED ═══
  ('C1', 'use_of_english', 1, 'c1-uoe-part-1', 'Multiple Choice Cloze', '4-option word choice for 8 gaps', 8, 'multiple_choice', 401),
  ('C1', 'use_of_english', 2, 'c1-uoe-part-2', 'Open Cloze', 'Fill 8 gaps with one word each', 8, 'open_cloze', 402),
  ('C1', 'use_of_english', 3, 'c1-uoe-part-3', 'Word Formation', 'Transform base word to fit 8 gaps', 8, 'word_formation', 403),
  ('C1', 'use_of_english', 4, 'c1-uoe-part-4', 'Key Word Transformation', 'Rewrite 6 sentences using given word', 6, 'key_word_transformation', 404),
  ('C1', 'reading',        5, 'c1-reading-part-5', 'Multiple Choice', '4-option MC on long text, 6 questions', 6, 'multiple_choice', 405),
  ('C1', 'reading',        6, 'c1-reading-part-6', 'Cross-Text Multiple Matching', 'Match 4 texts on same topic', 4, 'multiple_matching', 406),
  ('C1', 'reading',        7, 'c1-reading-part-7', 'Gapped Text', 'Choose paragraph to fit 6 gaps', 6, 'multiple_choice', 407),
  ('C1', 'reading',        8, 'c1-reading-part-8', 'Multiple Matching', 'Match 10 questions to multiple texts', 10, 'multiple_matching', 408),
  ('C1', 'writing',        1, 'c1-writing-part-1', 'Essay', '220-260 word essay (compulsory)', 1, 'multiple_choice', 409),
  ('C1', 'writing',        2, 'c1-writing-part-2', 'Choice', '220-260 word letter/proposal/report/review', 1, 'multiple_choice', 410),
  ('C1', 'listening',      1, 'c1-listening-part-1', 'Multiple Choice (Short Extracts)', '3 short extracts with 2 MC questions each', 6, 'multiple_choice', 411),
  ('C1', 'listening',      2, 'c1-listening-part-2', 'Sentence Completion', 'Complete 8 sentences while listening', 8, 'open_cloze', 412),
  ('C1', 'listening',      3, 'c1-listening-part-3', 'Multiple Choice (Interview)', '4-option MC on interview', 6, 'multiple_choice', 413),
  ('C1', 'listening',      4, 'c1-listening-part-4', 'Multiple Matching', 'Match 5 speakers to 8 statements (double task)', 10, 'multiple_matching', 414),

  -- ═══ C2 PROFICIENCY ═══
  ('C2', 'use_of_english', 1, 'c2-uoe-part-1', 'Multiple Choice Cloze', '4-option word choice for 8 gaps', 8, 'multiple_choice', 501),
  ('C2', 'use_of_english', 2, 'c2-uoe-part-2', 'Open Cloze', 'Fill 8 gaps with one word each', 8, 'open_cloze', 502),
  ('C2', 'use_of_english', 3, 'c2-uoe-part-3', 'Word Formation', 'Transform base word to fit 8 gaps', 8, 'word_formation', 503),
  ('C2', 'use_of_english', 4, 'c2-uoe-part-4', 'Key Word Transformation', 'Rewrite 6 sentences using given word', 6, 'key_word_transformation', 504),
  ('C2', 'reading',        5, 'c2-reading-part-5', 'Multiple Choice', '4-option MC on long text, 6 questions', 6, 'multiple_choice', 505),
  ('C2', 'reading',        6, 'c2-reading-part-6', 'Gapped Text', 'Choose paragraph to fit 7 gaps', 7, 'multiple_choice', 506),
  ('C2', 'reading',        7, 'c2-reading-part-7', 'Multiple Matching', 'Match 10 questions to multiple texts', 10, 'multiple_matching', 507),
  ('C2', 'writing',        1, 'c2-writing-part-1', 'Essay', '240-280 word essay summarizing two texts', 1, 'multiple_choice', 508),
  ('C2', 'writing',        2, 'c2-writing-part-2', 'Choice', '280-320 word article/letter/report/review', 1, 'multiple_choice', 509),
  ('C2', 'listening',      1, 'c2-listening-part-1', 'Multiple Choice (Short Extracts)', '3 short extracts with 2 MC each', 6, 'multiple_choice', 510),
  ('C2', 'listening',      2, 'c2-listening-part-2', 'Sentence Completion', 'Complete 9 sentences while listening', 9, 'open_cloze', 511),
  ('C2', 'listening',      3, 'c2-listening-part-3', 'Multiple Choice (Interview)', '4-option MC on interview', 5, 'multiple_choice', 512),
  ('C2', 'listening',      4, 'c2-listening-part-4', 'Multiple Matching', 'Match 5 speakers (double task)', 10, 'multiple_matching', 513)
ON CONFLICT (slug) DO NOTHING;


-- ─── ACTIVIDAD DE EJEMPLO 1 · B2 First UoE Part 1 ──
DO $$
DECLARE
  v_part_id INT;
  v_act_id UUID;
  v_q_id UUID;
BEGIN
  SELECT id INTO v_part_id FROM public.exam_part_catalog WHERE slug = 'b2-uoe-part-1';

  INSERT INTO public.activities
    (level, skill, exam_part_id, activity_number, title, description, intro_text,
     estimated_minutes, difficulty, is_published)
  VALUES
    ('B2', 'use_of_english', v_part_id, 1,
     'B2 First · Use of English Part 1 · Nº 1',
     'Multiple-choice cloze. Vocabulary and collocations in a short text about digital habits.',
     E'Read the text below and decide which answer (A, B, C or D) best fits each gap.\n\n**Why we check our phones so often**\n\nOur relationship with smartphones has become so (1) __ that scientists now study it as a form of addiction. The average adult picks up their phone more than eighty times a day, often without even (2) __ a conscious decision. Behind this pattern lies a careful (3) __ of app design: notifications are deliberately timed to create a small burst of anticipation. When we unlock the screen, the brain releases dopamine as a (4) __ for our attention, which encourages us to repeat the behaviour. Over time, this cycle becomes a habit that is extremely hard to (5) __. Experts suggest a few simple strategies to (6) __ control: turning off non-essential notifications, keeping the phone out of sight during meals, and (7) __ apps that track screen time. These small steps may not sound revolutionary, but they can make a (8) __ difference to how we spend our day.',
     10, 'medium', true)
  RETURNING id INTO v_act_id;

  -- Pregunta 1
  INSERT INTO public.activity_questions (activity_id, question_number, question_type, prompt, correct_answer, explanation)
  VALUES (v_act_id, 1, 'multiple_choice', 'Gap 1', 'B',
    '"Intense" is the natural collocation with "relationship". "Deep" works with feelings, "strong" with ties, "wide" is incorrect here.')
  RETURNING id INTO v_q_id;
  INSERT INTO public.activity_question_options (question_id, option_letter, option_text, is_correct, display_order) VALUES
    (v_q_id, 'A', 'deep', false, 1),
    (v_q_id, 'B', 'intense', true, 2),
    (v_q_id, 'C', 'strong', false, 3),
    (v_q_id, 'D', 'wide', false, 4);

  -- Pregunta 2
  INSERT INTO public.activity_questions (activity_id, question_number, question_type, prompt, correct_answer, explanation)
  VALUES (v_act_id, 2, 'multiple_choice', 'Gap 2', 'C',
    '"Making a decision" is a fixed collocation. The other verbs don''t combine with "decision" in this way.')
  RETURNING id INTO v_q_id;
  INSERT INTO public.activity_question_options (question_id, option_letter, option_text, is_correct, display_order) VALUES
    (v_q_id, 'A', 'taking', false, 1),
    (v_q_id, 'B', 'doing', false, 2),
    (v_q_id, 'C', 'making', true, 3),
    (v_q_id, 'D', 'giving', false, 4);

  -- Pregunta 3
  INSERT INTO public.activity_questions (activity_id, question_number, question_type, prompt, correct_answer, explanation)
  VALUES (v_act_id, 3, 'multiple_choice', 'Gap 3', 'A',
    '"Piece of design" doesn''t sound natural; "work of design" is correct here referring to craftsmanship. However, "piece" is often the exam key — check context carefully.')
  RETURNING id INTO v_q_id;
  INSERT INTO public.activity_question_options (question_id, option_letter, option_text, is_correct, display_order) VALUES
    (v_q_id, 'A', 'piece', true, 1),
    (v_q_id, 'B', 'bit', false, 2),
    (v_q_id, 'C', 'part', false, 3),
    (v_q_id, 'D', 'item', false, 4);

  -- Pregunta 4
  INSERT INTO public.activity_questions (activity_id, question_number, question_type, prompt, correct_answer, explanation)
  VALUES (v_act_id, 4, 'multiple_choice', 'Gap 4', 'B',
    '"Reward for" is the correct preposition. The other options don''t collocate with "for" in this sense.')
  RETURNING id INTO v_q_id;
  INSERT INTO public.activity_question_options (question_id, option_letter, option_text, is_correct, display_order) VALUES
    (v_q_id, 'A', 'prize', false, 1),
    (v_q_id, 'B', 'reward', true, 2),
    (v_q_id, 'C', 'benefit', false, 3),
    (v_q_id, 'D', 'profit', false, 4);

  -- Pregunta 5
  INSERT INTO public.activity_questions (activity_id, question_number, question_type, prompt, correct_answer, explanation)
  VALUES (v_act_id, 5, 'multiple_choice', 'Gap 5', 'C',
    '"Break a habit" is the standard collocation. "End" is possible but less natural; "cut" needs "down on".')
  RETURNING id INTO v_q_id;
  INSERT INTO public.activity_question_options (question_id, option_letter, option_text, is_correct, display_order) VALUES
    (v_q_id, 'A', 'cut', false, 1),
    (v_q_id, 'B', 'end', false, 2),
    (v_q_id, 'C', 'break', true, 3),
    (v_q_id, 'D', 'stop', false, 4);

  -- Pregunta 6
  INSERT INTO public.activity_questions (activity_id, question_number, question_type, prompt, correct_answer, explanation)
  VALUES (v_act_id, 6, 'multiple_choice', 'Gap 6', 'A',
    '"Regain control" means to get it back. The other verbs don''t fit this specific meaning.')
  RETURNING id INTO v_q_id;
  INSERT INTO public.activity_question_options (question_id, option_letter, option_text, is_correct, display_order) VALUES
    (v_q_id, 'A', 'regain', true, 1),
    (v_q_id, 'B', 'retain', false, 2),
    (v_q_id, 'C', 'remain', false, 3),
    (v_q_id, 'D', 'retrieve', false, 4);

  -- Pregunta 7
  INSERT INTO public.activity_questions (activity_id, question_number, question_type, prompt, correct_answer, explanation)
  VALUES (v_act_id, 7, 'multiple_choice', 'Gap 7', 'D',
    '"Installing apps" is the correct verb for software. "Setting up" is possible but less common in writing.')
  RETURNING id INTO v_q_id;
  INSERT INTO public.activity_question_options (question_id, option_letter, option_text, is_correct, display_order) VALUES
    (v_q_id, 'A', 'placing', false, 1),
    (v_q_id, 'B', 'applying', false, 2),
    (v_q_id, 'C', 'opening', false, 3),
    (v_q_id, 'D', 'installing', true, 4);

  -- Pregunta 8
  INSERT INTO public.activity_questions (activity_id, question_number, question_type, prompt, correct_answer, explanation)
  VALUES (v_act_id, 8, 'multiple_choice', 'Gap 8', 'B',
    '"Make a difference" is a fixed expression. The adjective "significant" collocates well with "difference".')
  RETURNING id INTO v_q_id;
  INSERT INTO public.activity_question_options (question_id, option_letter, option_text, is_correct, display_order) VALUES
    (v_q_id, 'A', 'remarkable', false, 1),
    (v_q_id, 'B', 'significant', true, 2),
    (v_q_id, 'C', 'notable', false, 3),
    (v_q_id, 'D', 'considerable', false, 4);
END $$;


-- ─── ACTIVIDAD DE EJEMPLO 2 · C1 Advanced UoE Part 4 (Key Word) ──
DO $$
DECLARE
  v_part_id INT;
  v_act_id UUID;
  v_q_id UUID;
BEGIN
  SELECT id INTO v_part_id FROM public.exam_part_catalog WHERE slug = 'c1-uoe-part-4';

  INSERT INTO public.activities
    (level, skill, exam_part_id, activity_number, title, description, intro_text,
     estimated_minutes, difficulty, is_published)
  VALUES
    ('C1', 'use_of_english', v_part_id, 1,
     'C1 Advanced · Use of English Part 4 · Nº 1',
     'Key word transformation. Complete the second sentence so that it has a similar meaning to the first, using the word given. Do not change the word. Use between three and six words.',
     E'For each question, rewrite the second sentence using the word given, so that it has a similar meaning to the first. Do not change the word given. Use between **three and six words**, including the word given.\n\nFor the activity, we''ll use 8 micro-sentences (shorter than the real exam) so you can practise the mechanics quickly.',
     12, 'hard', true)
  RETURNING id INTO v_act_id;

  -- Pregunta 1
  INSERT INTO public.activity_questions
    (activity_id, question_number, question_type, prompt, context, correct_answer, accepted_answers, explanation, metadata)
  VALUES (v_act_id, 1, 'key_word_transformation',
    'They started the meeting at 9 a.m. sharp.',
    'The meeting ________ 9 a.m. sharp.',
    'got under way at',
    '["got underway at"]'::jsonb,
    '"Get under way" means to begin. Needed with "at" to express the time.',
    '{"key_word": "WAY", "min_words": 3, "max_words": 6}'::jsonb);

  -- Pregunta 2
  INSERT INTO public.activity_questions
    (activity_id, question_number, question_type, prompt, context, correct_answer, accepted_answers, explanation, metadata)
  VALUES (v_act_id, 2, 'key_word_transformation',
    'I would prefer you not to smoke in here.',
    'I would rather ________ in here.',
    'you did not smoke',
    '["you didn''t smoke"]'::jsonb,
    '"Would rather" + subject + past simple to express preference about someone else''s action.',
    '{"key_word": "RATHER", "min_words": 3, "max_words": 6}'::jsonb);

  -- Pregunta 3
  INSERT INTO public.activity_questions
    (activity_id, question_number, question_type, prompt, context, correct_answer, accepted_answers, explanation, metadata)
  VALUES (v_act_id, 3, 'key_word_transformation',
    'She said she had never seen such a bad film.',
    'Never ________ seen such a bad film.',
    'before had she',
    '["in her life had she"]'::jsonb,
    'Inversion after "never" when it starts a sentence: aux + subject.',
    '{"key_word": "BEFORE", "min_words": 3, "max_words": 6}'::jsonb);

  -- Pregunta 4
  INSERT INTO public.activity_questions
    (activity_id, question_number, question_type, prompt, context, correct_answer, accepted_answers, explanation, metadata)
  VALUES (v_act_id, 4, 'key_word_transformation',
    'It is possible that he forgot the appointment.',
    'He ________ the appointment.',
    'may have forgotten',
    '["might have forgotten", "could have forgotten"]'::jsonb,
    'Modal perfect to express past possibility: may/might/could + have + past participle.',
    '{"key_word": "MAY", "min_words": 3, "max_words": 6}'::jsonb);

  -- Pregunta 5
  INSERT INTO public.activity_questions
    (activity_id, question_number, question_type, prompt, context, correct_answer, accepted_answers, explanation, metadata)
  VALUES (v_act_id, 5, 'key_word_transformation',
    'The company''s profits increased in spite of the recession.',
    'The company''s profits increased ________ the recession.',
    'despite the fact of',
    '["despite there being"]'::jsonb,
    '"Despite" is followed by a noun, gerund or "the fact that". Here with "the fact of" + article.',
    '{"key_word": "DESPITE", "min_words": 3, "max_words": 6}'::jsonb);

  -- Pregunta 6
  INSERT INTO public.activity_questions
    (activity_id, question_number, question_type, prompt, context, correct_answer, accepted_answers, explanation, metadata)
  VALUES (v_act_id, 6, 'key_word_transformation',
    'You should have told me about the problem earlier.',
    'If only ________ me about the problem earlier.',
    'you had told',
    '["you''d told"]'::jsonb,
    '"If only" + past perfect to express regret about the past.',
    '{"key_word": "ONLY", "min_words": 3, "max_words": 6}'::jsonb);

  -- Pregunta 7
  INSERT INTO public.activity_questions
    (activity_id, question_number, question_type, prompt, context, correct_answer, accepted_answers, explanation, metadata)
  VALUES (v_act_id, 7, 'key_word_transformation',
    'I don''t really like going to crowded restaurants.',
    'I''m not ________ to crowded restaurants.',
    'that keen on going',
    '["very keen on going", "all that keen on going"]'::jsonb,
    '"Keen on" + gerund expresses enthusiasm. "That" intensifies the negative.',
    '{"key_word": "KEEN", "min_words": 3, "max_words": 6}'::jsonb);

  -- Pregunta 8
  INSERT INTO public.activity_questions
    (activity_id, question_number, question_type, prompt, context, correct_answer, accepted_answers, explanation, metadata)
  VALUES (v_act_id, 8, 'key_word_transformation',
    'The weather was so bad that we decided to stay at home.',
    'Such ________ decided to stay at home.',
    'was the bad weather we',
    '["bad weather was it that we"]'::jsonb,
    'Inversion with "such" + verb + subject + "that" (sometimes implied).',
    '{"key_word": "SUCH", "min_words": 3, "max_words": 6}'::jsonb);
END $$;


COMMENT ON TABLE public.exam_part_catalog IS
  'Catálogo oficial Cambridge · 60+ partes · Reading, UoE, Writing, Listening × A2-C2';
