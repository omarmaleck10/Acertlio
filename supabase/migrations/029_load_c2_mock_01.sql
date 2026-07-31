-- =====================================================================
-- ACERTLIO — Carga de mock C2-01 (Human nature and behaviour)
-- =====================================================================
-- Primer mock C2 Proficiency. Estructura oficial Cambridge CPE post-2015:
--   · Reading and Use of English (90 min · 53 preguntas · 7 parts)
--     [C2 tiene 7 parts, no 8 como C1: no lleva Cross-text
--      pero su Part 6 tiene 7 huecos en lugar de 6]
--   · Writing (90 min · 2 tareas)
--     [Part 1: essay 240-280 palabras que resume y compara 2 textos]
--     [Part 2: article/letter/report/review 280-320 palabras]
--
-- Tema del mock: Human nature and behaviour
--   - El puzzle evolutivo del altruismo
--   - Repensar la inteligencia humana
--   - La ilusión del autocontrol
--   - Perfil de antropóloga: 35 años estudiando una tribu remota
--   - El efecto espectador revisitado
--   - Cuatro cambios en la comprensión de uno mismo
--
-- Contenido 100% original.
--
-- Ejecutar tras 001-028.
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
-- MOCK C2-01 — HUMAN NATURE AND BEHAVIOUR
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
    'C2 Proficiency Mock 01 — Human nature and behaviour',
    'C2', 1,
    'Primer mock C2 Proficiency. Tema: naturaleza humana y comportamiento — altruismo, inteligencia, autocontrol, antropología, efecto espectador, autoconocimiento. Reading and Use of English (90 min · 53 preguntas · 7 parts) + Writing (90 min · 2 tareas). Contenido 100% original.',
    180, true, 1
  )
  returning id into exam_id;


  -- ─── PART 1 — Multiple choice cloze (8 preguntas A/B/C/D) ────────
  insert into exam_parts (exam_id, skill, part_number, title, instructions, order_index, settings)
  values (
    exam_id, 'reading', 1, 'Multiple choice cloze — The evolutionary puzzle of altruism',
    'For questions 1-8, read the text below and decide which answer (A, B, C or D) best fits each gap.',
    0,
    ('{"question_type_hint":"multiple_choice_cloze","expected_count":8,'
     '"base_text":"The evolutionary puzzle of altruism\n\nWhy do human beings, alone among the great apes, routinely put themselves out for strangers they will never see again? For most of the twentieth century, this question was regarded as (1) ____ of the most intractable problems facing evolutionary theory. A creature that regularly sacrifices its own interests for those of unrelated others ought, in principle, to be selected against; and yet altruism of this kind is not merely present in our species — it is arguably one of our defining features.\n\nEarly attempts to resolve the paradox tended to invoke reciprocity: I help you today because I anticipate that you will help me tomorrow. There is undoubtedly (2) ____ to be said for this account, but as an explanation of altruism in its purer forms — the anonymous donation, the risky rescue of a stranger — it has always struck most researchers as inadequate. In cases where the beneficiary will never be in a position to reciprocate, and no observers are (3) ____ hand to notice the act, reciprocity is largely (4) ____ the point.\n\nMore recent work has begun to (5) ____ light on the problem by taking seriously the possibility that human altruism is not a single phenomenon but a family of overlapping behaviours, some of which do fit neatly into the reciprocity framework while others do not. What has (6) ____ to light from this literature is a picture in which our capacity for genuine self-sacrifice — as opposed to enlightened self-interest — is a relatively late evolutionary development, closely (7) ____ up in the emergence of language and complex social norms.\n\nThat conclusion, if it holds, has implications well beyond the seminar room. If altruism is neither natural in the sense of being automatic, nor artificial in the sense of being merely learned, then the everyday moral choices we make may (8) ____ considerably more upon the culture that surrounds us than we usually care to admit."}')::jsonb
  )
  returning id into p1_id;

  perform _tmp_insert_mc_cloze4(p1_id, 1, 'Gap 1', 'A',
    'one', 'none', 'any', 'many'
  );
  perform _tmp_insert_mc_cloze4(p1_id, 2, 'Gap 2', 'B',
    'cause', 'much', 'room', 'reason'
  );
  perform _tmp_insert_mc_cloze4(p1_id, 3, 'Gap 3', 'A',
    'at', 'in', 'on', 'to'
  );
  perform _tmp_insert_mc_cloze4(p1_id, 4, 'Gap 4', 'C',
    'after', 'outside', 'beside', 'past'
  );
  perform _tmp_insert_mc_cloze4(p1_id, 5, 'Gap 5', 'A',
    'shed', 'put', 'place', 'give'
  );
  perform _tmp_insert_mc_cloze4(p1_id, 6, 'Gap 6', 'D',
    'risen', 'brought', 'emerged', 'come'
  );
  perform _tmp_insert_mc_cloze4(p1_id, 7, 'Gap 7', 'B',
    'locked', 'wrapped', 'brought', 'shut'
  );
  perform _tmp_insert_mc_cloze4(p1_id, 8, 'Gap 8', 'D',
    'stand', 'hold', 'lie', 'depend'
  );


  -- ─── PART 2 — Open cloze (8 preguntas, sin opciones) ─────────────
  insert into exam_parts (exam_id, skill, part_number, title, instructions, order_index, settings)
  values (
    exam_id, 'reading', 2, 'Open cloze — Rethinking human intelligence',
    'For questions 9-16, read the text below and think of the word which best fits each gap. Use only ONE word in each gap.',
    1,
    ('{"question_type_hint":"open_cloze","expected_count":8,'
     '"base_text":"Rethinking human intelligence\n\nWere it not (9) ____ the confident tone of most popular writing on the subject, one might reasonably conclude that intelligence is among the least well-understood of human traits. Behind the reassuring language of IQ scores and cognitive tests lies a scientific literature (10) ____ which almost nothing about the underlying phenomenon is settled — including whether ''intelligence'' picks out a single quantity at all.\n\nWhat we can measure, using existing tests, is a specific capacity for reasoning under artificial conditions. Whether this maps neatly (11) ____ intelligence as we ordinarily use the word is a separate question, and one that decades of debate have failed to (12) ____ any real closure to. Critics have consistently pointed out that many of the abilities most valued in daily life — practical judgement, emotional sensitivity, creativity in its more elusive forms — are precisely (13) ____ the standard tests are worst at capturing.\n\nA further complication is that the tests themselves were originally designed to predict success in a very particular context: school and university performance in industrialised societies. It is (14) ____ great surprise, given this history, that they should also happen to predict success in that same context, or that they should be poor predictors of achievement in radically different environments. The trouble comes when a measure calibrated for one narrow purpose is taken (15) ____ granted as a measure of the general trait after which it was named.\n\nWhat researchers increasingly seem to accept is that the notion of intelligence, useful as it may be for some purposes, cannot bear the theoretical weight it has traditionally been asked to carry. Better, they suggest, to speak of specific capacities, in specific contexts, with specific ways of being tested — and to leave the grander abstraction to (16) ____ side."}')::jsonb
  )
  returning id into p2_id;

  perform _tmp_insert_open_cloze(p2_id, 9, 'Gap 9', 'for');
  perform _tmp_insert_open_cloze(p2_id, 10, 'Gap 10', 'in');
  perform _tmp_insert_open_cloze(p2_id, 11, 'Gap 11', 'onto|on');
  perform _tmp_insert_open_cloze(p2_id, 12, 'Gap 12', 'bring');
  perform _tmp_insert_open_cloze(p2_id, 13, 'Gap 13', 'what');
  perform _tmp_insert_open_cloze(p2_id, 14, 'Gap 14', 'no');
  perform _tmp_insert_open_cloze(p2_id, 15, 'Gap 15', 'for');
  perform _tmp_insert_open_cloze(p2_id, 16, 'Gap 16', 'one');


  -- ─── PART 3 — Word formation (8 preguntas) ───────────────────────
  insert into exam_parts (exam_id, skill, part_number, title, instructions, order_index, settings)
  values (
    exam_id, 'reading', 3, 'Word formation — The illusion of self-control',
    'For questions 17-24, read the text below. Use the word given in capitals at the end of some of the lines to form a word that fits in the gap in the same line.',
    2,
    ('{"question_type_hint":"word_formation","expected_count":8,'
     '"base_text":"The illusion of self-control\n\nOne of the more (17) ____ [SETTLE] findings in recent psychology concerns the mechanism by which people appear to exercise self-control. For most of the twentieth century, willpower was treated as a kind of moral muscle: those who possessed it in (18) ____ [SIZE] quantities were assumed to succeed at difficult tasks, while those who lacked it were held responsible for their own repeated failures.\n\nThe more (19) ____ [SOPHISTICATE] view now emerging from the laboratory is that this account systematically confuses cause and effect. What looks, from the outside, like the effortful (20) ____ [PERSIST] of a strong will often turns out, under closer examination, to reflect the fact that the person concerned was rarely tempted in the first place. People who exhibit apparently (21) ____ [BREAK] self-discipline in some domain — say, healthy eating — frequently report that the temptations others struggle with are, for them, simply not very salient.\n\nThis has considerable (22) ____ [IMPLY] for how we think about our own weaknesses. If self-control depends less on force of will and more on the (23) ____ [ARRANGE] of one''s environment, then blaming individuals for failures of self-discipline may be both (24) ____ [ETHIC] and, in a strictly practical sense, unhelpful. What matters more, on this view, is not how strongly one resists temptation but how skilfully one avoids being exposed to it."}')::jsonb
  )
  returning id into p3_id;

  perform _tmp_insert_word_form(p3_id, 17, 'SETTLE', 'unsettling');
  perform _tmp_insert_word_form(p3_id, 18, 'SIZE', 'sizeable|sizable');
  perform _tmp_insert_word_form(p3_id, 19, 'SOPHISTICATE', 'sophisticated');
  perform _tmp_insert_word_form(p3_id, 20, 'PERSIST', 'persistence');
  perform _tmp_insert_word_form(p3_id, 21, 'BREAK', 'unbreakable');
  perform _tmp_insert_word_form(p3_id, 22, 'IMPLY', 'implications');
  perform _tmp_insert_word_form(p3_id, 23, 'ARRANGE', 'arrangement');
  perform _tmp_insert_word_form(p3_id, 24, 'ETHIC', 'unethical');


  -- ─── PART 4 — Key word transformations (6 preguntas · 2 puntos) ──
  -- C2 permite 3-8 palabras (más que C1)
  insert into exam_parts (exam_id, skill, part_number, title, instructions, order_index, settings)
  values (
    exam_id, 'reading', 4, 'Key word transformations',
    'For questions 25-30, complete the second sentence so that it has a similar meaning to the first sentence, using the word given. Do not change the word given. You must use between THREE and EIGHT words, including the word given.',
    3,
    '{"question_type_hint":"key_word_transformation","expected_count":6,"points_per_question":2}'::jsonb
  )
  returning id into p4_id;

  perform _tmp_insert_key_transform(p4_id, 25,
    'The researcher had no idea that her paper would eventually change the field.',
    'faintest',
    'The researcher',
    'her paper would eventually change the field.',
    'did not have the faintest idea that|hadn''t the faintest idea that'
  );

  perform _tmp_insert_key_transform(p4_id, 26,
    'The professor was extremely reluctant to change his position.',
    'loath',
    'The professor',
    'his position.',
    'was extremely loath to change|was very loath to change|was most loath to change'
  );

  perform _tmp_insert_key_transform(p4_id, 27,
    'It was only when the data was reanalysed that the error became apparent.',
    'until',
    'Not',
    'the error become apparent.',
    'until the data was reanalysed did'
  );

  perform _tmp_insert_key_transform(p4_id, 28,
    'The committee firmly rejected the idea that the results were fabricated.',
    'suggestion',
    'The committee',
    'the results were fabricated.',
    'firmly rejected the suggestion that|firmly dismissed the suggestion that'
  );

  perform _tmp_insert_key_transform(p4_id, 29,
    'People rarely take the trouble to check original sources these days.',
    'seldom',
    'Seldom',
    'to check original sources these days.',
    'do people take the trouble'
  );

  perform _tmp_insert_key_transform(p4_id, 30,
    'The findings contradicted what everyone in the field had believed for decades.',
    'flew',
    'The findings',
    'in the field had believed for decades.',
    'flew in the face of what everyone|flew in the face of everything'
  );


  -- ─── PART 5 — Long text + multiple choice (6 preguntas A/B/C/D) ─
  insert into exam_parts (exam_id, skill, part_number, title, instructions, order_index, settings)
  values (
    exam_id, 'reading', 5, 'Long text — Thirty-five years in the same village',
    'You are going to read an article about an anthropologist. For questions 31-36, choose the answer (A, B, C or D) which you think fits best according to the text.',
    4,
    ('{"question_type_hint":"multiple_choice","expected_count":6,'
     '"reading_text":"Thirty-five years in the same village\n\nAnna Nordvik arrived in the highland community she would eventually spend most of her professional life studying at the age of thirty-one, in what she now describes with some amusement as ''the last flush of anthropological optimism''. Her doctoral supervisor had suggested a two-year fieldwork stay, standard by the norms of the time; Nordvik ended up making the journey back to Sweden only for occasional conferences and family emergencies, and her longest continuous absence from the village during the following three and a half decades was, remarkably, less than nine months.\n\nWhat she found there was not, as she is at pains to insist in every interview she gives, an untouched community frozen in some pre-modern past. The village had been in irregular contact with outsiders for at least a hundred and fifty years before her arrival, and by the mid-1980s most of its younger adults had spent time in the coastal city where the country''s largest university stood. What made the community worth studying, in her account, was not its isolation from the wider world but the particular way it had absorbed and transformed a wide range of external influences while retaining a strong sense of its own distinctness.\n\nCritics of Nordvik''s approach, and there have been many over the years, tend to accuse her of two related sins. The first is that of over-identification with her subjects — of allowing thirty-five years of shared experience to compromise the analytical distance that anthropology has traditionally regarded as essential. The second, related, charge is that her published work reads less like ethnography in the classical sense than like an extended memoir, with all the selective memory and reconstructive licence that the genre implies. Nordvik has responded to these criticisms with a directness that some readers have found refreshing and others have taken as evidence that the criticisms may be justified.\n\nHer own view is that the objection to over-identification rests on a picture of the anthropologist as a kind of detached observer whose insights are somehow purified by their outsider status. This picture, she argues, has never described what fieldwork actually involves, and has always concealed a certain amount of self-deception on the part of researchers who imagined they were achieving a neutrality that no participant, however unwelcome, could ever really achieve. What longer engagement makes possible, in her account, is not neutrality but a more honest kind of subjectivity — one in which the researcher''s influence on what is being studied is finally taken seriously rather than politely ignored.\n\nOn the second charge, that her writing has drifted into memoir, Nordvik is less inclined to argue. She freely concedes that her more recent books contain passages that would not have been out of place in a novel, and that she has increasingly abandoned the standard conventions of academic prose. Her justification for this is not defensive but positive: she believes the standard conventions have never captured what she most needed to convey, and that the sacrifice of a certain kind of authority was worth the gain in accuracy. Whether one accepts this argument, she notes drily, depends less on one''s view of anthropology than on one''s view of what accuracy consists of.\n\nWhat has surprised even sympathetic readers is how little Nordvik claims to have understood about the community even now. Asked, in a recent interview, whether she could summarise what she had learned in thirty-five years, she replied that any summary short enough to be usefully offered in an interview would be too misleading to be worth offering. What she is willing to say in shorter form is that the villagers she has known are neither more nor less mysterious to her than any group of Swedish neighbours she might have lived among for the same length of time, and that the earlier assumption — that longer study produces greater clarity — is one of the more persistent illusions of her discipline.\n\nWhat Nordvik does think has changed, and considerably, is her sense of what anthropology is for. When she began her career, she saw the discipline as a way of extending the human sciences beyond the narrow societies from which they had traditionally been theorised. What she believes now is something both more modest and more difficult: that anthropology, done at all well, teaches those who practise it to hold their own assumptions about human nature more lightly. This, she suggests, is something that all of us, not just anthropologists, might have some reason to want."}')::jsonb
  )
  returning id into p5_id;

  perform _tmp_insert_mc4(p5_id, 31,
    'What point does Nordvik emphasise about the community she chose to study?',
    'C',
    'It had been unusually resistant to influence from the outside world.',
    'Its isolation was what made it interesting to anthropologists.',
    'Its distinctness had survived alongside significant external contact.',
    'Very few outsiders had ever visited it before her arrival.'
  );

  perform _tmp_insert_mc4(p5_id, 32,
    'How does Nordvik respond to her critics'' concerns about over-identification?',
    'D',
    'She admits that her long stay made objective analysis impossible.',
    'She argues that shorter fieldwork produces more reliable results.',
    'She claims that her outsider status was preserved by regular breaks.',
    'She rejects the picture of the detached observer that underlies the charge.'
  );

  perform _tmp_insert_mc4(p5_id, 33,
    'On the charge that her writing has become memoir-like, Nordvik',
    'B',
    'insists that her methods remain fully within academic tradition.',
    'accepts the observation and defends the choice she has made.',
    'concedes the point only reluctantly and with qualification.',
    'blames publishers for pushing her towards a less academic style.'
  );

  perform _tmp_insert_mc4(p5_id, 34,
    'What is Nordvik''s answer when asked to summarise what she has learned?',
    'A',
    'She refuses on the grounds that any short summary would be misleading.',
    'She offers a detailed but carefully qualified account.',
    'She suggests her most important lessons were personal rather than academic.',
    'She admits that the question has become more difficult over time.'
  );

  perform _tmp_insert_mc4(p5_id, 35,
    'What does Nordvik describe as one of the persistent illusions of her field?',
    'C',
    'That fieldwork produces knowledge unavailable to non-anthropologists.',
    'That anthropologists can achieve genuine neutrality if they work carefully.',
    'That prolonged study makes an unfamiliar community less mysterious.',
    'That academic writing conventions guarantee objective description.'
  );

  perform _tmp_insert_mc4(p5_id, 36,
    'How has Nordvik''s view of anthropology''s purpose changed over her career?',
    'D',
    'She now believes the discipline should focus on practical applications.',
    'She sees anthropology as more scientifically rigorous than she once did.',
    'She has become sceptical about whether the discipline serves any purpose.',
    'She now sees its main value as loosening our confidence in our own assumptions.'
  );



  -- ─── PART 6 — Gapped text: párrafos (7 huecos + 1 sobrante) ──────
  -- C2 Part 6 tiene 7 huecos (vs 6 en C1) y 8 opciones (1 sobrante)
  insert into exam_parts (exam_id, skill, part_number, title, instructions, order_index, settings)
  values (
    exam_id, 'reading', 6, 'Gapped text — The bystander effect revisited',
    'You are going to read an article about the bystander effect. Seven paragraphs have been removed from the article. Choose from paragraphs A-H the one which fits each gap (37-43). There is one extra paragraph which you do not need to use.',
    5,
    ('{"question_type_hint":"multiple_matching","expected_count":7,'
     '"base_text":"The bystander effect revisited\n\nFew findings in social psychology are as widely known outside the discipline as the ''bystander effect'': the observation, made most famously in a series of experiments in the late 1960s, that individuals are less likely to help someone in distress when others are present than when they are alone. Textbook accounts have made the finding familiar to generations of undergraduates, and the underlying pattern — the more witnesses, the less help — has passed almost unchallenged into popular writing on human behaviour.\n\n(37) ____ In particular, the results of the original studies, produced in laboratory settings that involved staged emergencies in front of small groups of American college students, may reflect the specific conditions of those experiments as much as any general truth about human behaviour under pressure.\n\nOne strand of this reappraisal has been methodological. Careful reviews of the original data have shown that the reported effect, while statistically real, was smaller than most secondary accounts have suggested. (38) ____ These patterns are visible only when researchers examine the full range of studies rather than the handful that appear in the standard textbook summaries.\n\nA more interesting reappraisal, however, has come from studies conducted outside the laboratory. Analyses of surveillance camera footage from public spaces have allowed researchers to observe how people actually behave when strangers collapse, are attacked or otherwise appear to need urgent assistance. (39) ____ Even in situations involving large numbers of onlookers, intervention rates turn out to be considerably higher than the classic experiments would predict.\n\nWhat explains the difference? Part of the answer, researchers now believe, is that laboratory emergencies were carefully constructed to be ambiguous. Participants had to work out for themselves whether what they were witnessing was a genuine crisis or a mundane event, and this ambiguity is what allowed the presence of others to influence their interpretation. (40) ____ People move quickly when they can see clearly what is happening; they hesitate when they cannot.\n\nA further factor concerns the nature of the group of witnesses. The original experiments used strangers who had no particular reason to communicate. Real-life emergencies, by contrast, often involve at least some individuals who know each other, and eye contact between friends or family members appears to short-circuit the diffusion of responsibility that laboratory studies isolated. (41) ____ Once one person has made a decision to intervene, others tend to follow rapidly, in patterns that resemble a small cascade rather than the paralysis the classical account would predict.\n\nWhat, then, remains of the bystander effect as most people understand it? Something, its defenders would argue, though considerably less than the popular version suggests. (42) ____ The finding, useful as it may be as a warning against complacency, has been asked to carry more theoretical weight than the underlying data can bear.\n\nWhat is more interesting, some researchers now suggest, is the mirror image of the original question. Rather than asking why people fail to help in emergencies, we might do better to ask why so many strangers do help, often at real risk to themselves. (43) ____ It is a question the classical experiments were never designed to answer, and one that the discipline is only now beginning to take seriously.","matching_options":['
     '{"letter":"A","text":"In real emergencies, by contrast, the nature of the crisis is usually much easier to read, and the influence of others on individual behaviour is correspondingly weaker."},'
     '{"letter":"B","text":"What has emerged, over the past two decades, is a considerably more complex picture than the simple ''more witnesses, less help'' formula suggests, and one which the discipline itself has been surprisingly slow to acknowledge."},'
     '{"letter":"C","text":"What we might modestly retain is the observation that ambiguous situations, in the presence of strangers who cannot communicate with one another, sometimes produce dangerous inaction."},'
     '{"letter":"D","text":"Studies of this pro-social pattern remain scarce, but the emerging evidence suggests that willingness to help strangers is influenced by factors — including neighbourhood cohesion and the visible dignity of the person in need — that the classic experiments simply overlooked."},'
     '{"letter":"E","text":"There have also been persistent hints, in the wider literature, that the effect varies considerably by type of emergency, cultural context, and the gender composition of the group of witnesses."},'
     '{"letter":"F","text":"Perhaps the single most striking finding of this newer body of research is that outright refusal to help is extremely rare, whatever the number of people present."},'
     '{"letter":"G","text":"Simply exchanging a glance seems to establish, wordlessly, a small community of people who now expect one another to respond."},'
     '{"letter":"H","text":"Textbook writers have generally preferred the more dramatic finding, and popular writers have simplified it further, largely for reasons of narrative economy."}'
     ']}')::jsonb
  )
  returning id into p6_id;

  perform _tmp_insert_gapped(p6_id, 37, 'Gap 37', 'B');
  perform _tmp_insert_gapped(p6_id, 38, 'Gap 38', 'E');
  perform _tmp_insert_gapped(p6_id, 39, 'Gap 39', 'F');
  perform _tmp_insert_gapped(p6_id, 40, 'Gap 40', 'A');
  perform _tmp_insert_gapped(p6_id, 41, 'Gap 41', 'G');
  perform _tmp_insert_gapped(p6_id, 42, 'Gap 42', 'C');
  perform _tmp_insert_gapped(p6_id, 43, 'Gap 43', 'D');


  -- ─── PART 7 — Multiple matching (10 preguntas · 4 personas) ──────
  insert into exam_parts (exam_id, skill, part_number, title, instructions, order_index, settings)
  values (
    exam_id, 'reading', 7, 'Multiple matching — Four ways of coming to know oneself',
    'You are going to read an article in which four people describe an experience that changed their understanding of themselves. For questions 44-53, choose from the people (A-D). The people may be chosen more than once.',
    6,
    ('{"question_type_hint":"multiple_matching","expected_count":10,'
     '"base_text":"Four ways of coming to know oneself\n\nA. DANIEL ORESTIS, 47, cardiac surgeon\nFor almost twenty years I regarded my ability to remain calm during long operations as a settled feature of my character — something I had been born with, refined through training, and could reliably draw on whenever it was needed. What forced me to reconsider was, of all things, a minor car accident on my way home from work. I was not physically hurt, but the shaking that followed lasted the better part of a day and could not be explained by the objective severity of what had happened. What that response revealed, when I had time to think about it later, was that the calm I had prized in myself was much narrower than I had imagined: it operated, quite specifically, within the highly controlled environment of an operating theatre and had never really been tested outside it. I do not, in retrospect, think worse of myself for the misunderstanding. What has changed is the confidence with which I now describe what I am like as a person, which is considerably more modest than it used to be.\n\nB. FATIMA VELOSO, 39, prison chaplain\nI had assumed, in the way people who have never really been tested do, that I understood the limits of my patience with reasonable accuracy. Two years into my current work I encountered a man whose crimes were, by any standard I had previously entertained, difficult to look at squarely. What surprised me was not, in the end, that I struggled with him — I had expected that — but that the struggle followed a pattern I would not have predicted from any earlier experience. The empathy came first, then the revulsion, then the empathy again, in cycles that lasted for weeks. I had always thought of these responses as more or less mutually exclusive, and that the process of choosing between them was largely under my conscious control. Neither of these ideas has survived the experience.\n\nC. PAULO WEIL-DUFFIELD, 55, orchestral conductor\nMy discipline required me for decades to conceal a fact I now consider it useful to state plainly: that the pleasure of standing in front of a hundred trained musicians and shaping the sound they produce is, at its most intense, indistinguishable from the pleasure of being in charge of them. I do not think I understood this until I began, in my mid-forties, to teach conducting to graduate students, most of whom were much better musicians than my own conservatory generation had been. What I noticed in them, and had to learn to notice in myself, was a curious slippage between the technical decisions we were supposed to be discussing and the interpersonal dynamics of the rehearsal room. What was often being negotiated, in ways nobody had a professional language to describe, was who was allowed to say what to whom. I am no longer confident that a conductor''s technical judgements can, in practice, be separated from this.\n\nD. INES KRATOCHVIL, 33, translator\nI had translated a novel for a well-known publisher, and I was invited to attend the launch event in the author''s country, at which she and I would be interviewed together. What I had not anticipated was that the questions the audience asked would very often be directed to both of us as if we were equally responsible for the resulting text. Some of them clearly expected me to defer, and I found, to my surprise, that I did not want to. Nothing in my earlier training had prepared me to think of myself as anything other than a technical craftsperson whose work is judged by fidelity to the original. What that evening revealed was that I had also, over the previous decade, become a co-author of the books I had rendered into my own language, and that this claim, discreet as I usually keep it, would not survive being politely denied. I have thought more carefully about the ethics of the work since then, and I take up my share of the credit rather more openly.","matching_options":['
     '{"letter":"A","text":"Daniel"},'
     '{"letter":"B","text":"Fatima"},'
     '{"letter":"C","text":"Paulo"},'
     '{"letter":"D","text":"Ines"}'
     ']}')::jsonb
  )
  returning id into p7_id;

  perform _tmp_insert_matching(p7_id, 44,
    'Which person came to see that a personal quality they valued was more context-specific than they had realised?',
    'A'
  );
  perform _tmp_insert_matching(p7_id, 45,
    'Which person mentions that a professional role required them to disguise something they now feel able to state openly?',
    'C'
  );
  perform _tmp_insert_matching(p7_id, 46,
    'Which person''s realisation came about through observing more junior professionals in their own field?',
    'C'
  );
  perform _tmp_insert_matching(p7_id, 47,
    'Which person mentions that their emotional response to a difficult situation did not follow the pattern they would have predicted?',
    'B'
  );
  perform _tmp_insert_matching(p7_id, 48,
    'Which person realised that a claim they usually keep quiet about would not withstand being explicitly denied?',
    'D'
  );
  perform _tmp_insert_matching(p7_id, 49,
    'Which person''s realisation began with an event unrelated to their professional life?',
    'A'
  );
  perform _tmp_insert_matching(p7_id, 50,
    'Which person mentions that two emotional responses they had thought incompatible turned out to alternate over time?',
    'B'
  );
  perform _tmp_insert_matching(p7_id, 51,
    'Which person mentions that they now describe their own character with more caution than before?',
    'A'
  );
  perform _tmp_insert_matching(p7_id, 52,
    'Which person discovered that they had been playing a more creative role than their formal job description implied?',
    'D'
  );
  perform _tmp_insert_matching(p7_id, 53,
    'Which person came to think that technical judgements in their field cannot be cleanly separated from questions of authority?',
    'C'
  );


  -- ─── PART 8 — Writing Part 1: Essay obligatorio (240-280) ────────
  -- C2 Writing Part 1: summary + opinion of two short texts
  insert into exam_parts (exam_id, skill, part_number, title, instructions, order_index, settings)
  values (
    exam_id, 'writing', 8, 'Writing Part 1 — Essay',
    'You must answer this question. Read the two texts below and write an essay of 240-280 words in an appropriate style.',
    7,
    '{"question_type_hint":"writing_task","expected_count":1}'::jsonb
  )
  returning id into p8_id;

  perform _tmp_insert_writing(p8_id, 54,
    'Read the two texts below. Write an essay summarising and evaluating the key points from both texts. Use your own words throughout as far as possible, and include your own ideas in your answer. Write 240-280 words.',
    ('{"task_instruction":"Read both texts, then write an essay in 240-280 words that: (1) summarises the key points from each text, (2) evaluates those points against each other, and (3) offers your own conclusion. Use your own words as far as possible.",'
     '"task_type":"essay",'
     '"word_count_min":240,'
     '"word_count_max":280,'
     '"essay_question":"To what extent is human behaviour shaped by individual character rather than by the situations we find ourselves in?",'
     '"source_texts":['
     '{"title":"Text 1 — The illusion of the fixed self","text":"The great mistake of everyday psychology, and often of the popular writing that draws on it, is to treat character as a stable inner property that expresses itself, more or less consistently, across every situation in which a person acts. Decades of research suggest something quite different. What we call a person''s ''character'' is largely a summary of the situations they typically inhabit and the roles they are expected to play in them. Change the situation, and the character we thought we knew often turns out to have surprisingly little to say. This is not a counsel of despair — people do differ in stable ways — but a warning that those differences are usually smaller, and their expression more context-dependent, than either the person themselves or the people around them tend to assume."},'
     '{"title":"Text 2 — In defence of character","text":"It has become fashionable in some quarters to argue that character is largely an illusion — that human behaviour is shaped almost entirely by situational forces, and that the traits we attribute to individuals are, at best, statistical regularities of little predictive value. This position seems to me to give up too much too readily. Anyone who has known another human being for more than a decade has abundant evidence that people do carry stable dispositions across a wide range of settings — dispositions that we call, without embarrassment, generosity, or courage, or wit. That situations shape behaviour is uncontroversial. That character is therefore a fiction does not follow, and the enthusiasm with which the conclusion is currently embraced tells us more about a certain intellectual mood than about the underlying evidence."}'
     ']}')::jsonb
  );


  -- ─── PART 9 — Writing Part 2: Choose one (280-320 palabras) ──────
  -- C2 Writing Part 2: article/letter/report/review 280-320 palabras
  insert into exam_parts (exam_id, skill, part_number, title, instructions, order_index, settings)
  values (
    exam_id, 'writing', 9, 'Writing Part 2 — Article, letter, report or review',
    'Write an answer to ONE of the questions in this part. Write your answer in 280-320 words in an appropriate style.',
    8,
    '{"question_type_hint":"writing_task","expected_count":1,"choice_required":true}'::jsonb
  )
  returning id into p9_id;

  perform _tmp_insert_writing(p9_id, 55,
    'Choose ONE of the tasks (A, B or C) and write your answer in 280-320 words.',
    ('{"task_instruction":"You must choose ONE of the three options below.",'
     '"task_type":"article_letter_report_or_review",'
     '"word_count_min":280,'
     '"word_count_max":320,'
     '"choices":['
     '{"letter":"A","type":"article","title":"Article for a serious magazine",'
     '"prompt":"You have read the following comment on an article about human behaviour:\n\n\"The problem with modern discussions of human nature is that they insist on choosing between two impossible positions: that we are essentially selfish creatures who occasionally manage a moment of generosity, or that we are essentially altruistic creatures who have been distorted by unfair systems. Neither picture describes anyone I have ever met, but nobody seems willing to defend a more complicated view.\"\n\nWrite an article for a serious online magazine responding to this comment. Argue for the view that a more complicated account of human nature is both more accurate and more useful, giving specific examples where possible.\n\nWrite your article."},'
     '{"letter":"B","type":"letter","title":"Letter to a research journal",'
     '"prompt":"You have read the following extract from an editorial in a psychology journal:\n\n\"The public appetite for psychological research has never been greater, but neither has the risk of that research being misrepresented in popular sources. Researchers themselves must take a large share of the responsibility for this: too many are willing to accept simplifications of their findings, in exchange for wider attention, that they would never accept from a fellow specialist.\"\n\nWrite a letter to the editor of the journal responding to this editorial. Set out the extent to which you agree with the argument, offer at least one qualification or counter-argument, and suggest what researchers might reasonably do differently.\n\nWrite your letter."},'
     '{"letter":"C","type":"review","title":"Review of a book about human nature",'
     '"prompt":"You have seen this notice on a website aimed at readers of serious non-fiction:\n\nREVIEWS WANTED\n\nHave you recently read a book that seriously changed the way you think about a specific aspect of human behaviour — altruism, intelligence, self-control, memory, or anything else? Write us a review saying what the book argues, what you found most and least persuasive about its case, and what kind of reader would benefit most from it.\n\nWrite your review."}'
     ']}')::jsonb
  );


  raise notice 'C2 Proficiency Mock 01 (Human nature and behaviour) loaded successfully. Exam ID: %', exam_id;

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
--   where e.title like 'C2 Proficiency Mock 01%'
--   group by p.part_number, p.title
--   order by p.part_number;
--
-- Esperado (9 filas, total 55 preguntas):
--   1 · Multiple choice cloze          →  8
--   2 · Open cloze                     →  8
--   3 · Word formation                 →  8
--   4 · Key word transformations       →  6  (×2 puntos)
--   5 · Long text                      →  6
--   6 · Gapped text                    →  7  (¡7 huecos!)
--   7 · Multiple matching              → 10
--   8 · Writing Part 1 — Essay         →  1
--   9 · Writing Part 2                 →  1
--   TOTAL: 55 preguntas
-- =====================================================================
