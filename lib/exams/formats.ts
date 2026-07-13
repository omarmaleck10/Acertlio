/**
 * Definición programática del formato oficial Cambridge por nivel.
 *
 * Se usa en el constructor de exámenes del panel de superadmin:
 * cuando el admin crea un examen nuevo de nivel X, el sistema puede
 * generar automáticamente las partes vacías con la estructura correcta.
 *
 * Fuente: Handbooks for Teachers (Cambridge University Press & Assessment).
 * Solo se usa la información estructural (formato, timing), no contenido.
 */

import type {
  CambridgeLevel,
  ExamSkill,
  QuestionType,
} from "@/lib/supabase/types";

export interface PartTemplate {
  skill: ExamSkill;
  partNumber: number;
  title: string;
  questionType: QuestionType;
  questionCount: number;
  marks: number;
  focus: string;
  timeMinutes?: number;
}

export interface ExamFormat {
  level: CambridgeLevel;
  levelName: string; // "A2 Key", "B2 First"...
  totalTimeMinutes: number; // solo Reading+UoE+Writing (Listening es aparte)
  writingTimeMinutes: number;
  parts: PartTemplate[];
}

// ─── A2 Key ──────────────────────────────────────────────────────────
export const A2_FORMAT: ExamFormat = {
  level: "A2",
  levelName: "A2 Key",
  totalTimeMinutes: 60,
  writingTimeMinutes: 30,
  parts: [
    { skill: "reading", partNumber: 1, title: "Signs and short messages", questionType: "multiple_choice", questionCount: 6, marks: 6, focus: "Reading short texts (signs, notices, emails)." },
    { skill: "reading", partNumber: 2, title: "People and topics matching", questionType: "multiple_matching", questionCount: 7, marks: 7, focus: "Matching people to short texts." },
    { skill: "reading", partNumber: 3, title: "Long text comprehension", questionType: "multiple_choice", questionCount: 5, marks: 5, focus: "Reading a longer text for detail." },
    { skill: "reading", partNumber: 4, title: "Multiple-choice cloze", questionType: "multiple_choice_cloze", questionCount: 6, marks: 6, focus: "Vocabulary in short text with gaps." },
    { skill: "reading", partNumber: 5, title: "Open cloze", questionType: "open_cloze", questionCount: 6, marks: 6, focus: "Grammar in short text with gaps." },
    { skill: "writing", partNumber: 6, title: "Guided writing (email)", questionType: "writing_task", questionCount: 1, marks: 15, focus: "Write 25 words in reply to a short input.", timeMinutes: 15 },
    { skill: "writing", partNumber: 7, title: "Picture story", questionType: "writing_task", questionCount: 1, marks: 15, focus: "Write 35 words based on 3 pictures.", timeMinutes: 15 },
  ],
};

// ─── B1 Preliminary ──────────────────────────────────────────────────
export const B1_FORMAT: ExamFormat = {
  level: "B1",
  levelName: "B1 Preliminary",
  totalTimeMinutes: 90,
  writingTimeMinutes: 45,
  parts: [
    { skill: "reading", partNumber: 1, title: "Signs and messages", questionType: "multiple_choice", questionCount: 5, marks: 5, focus: "Read very short texts, choose 3-option." },
    { skill: "reading", partNumber: 2, title: "Matching", questionType: "multiple_matching", questionCount: 5, marks: 5, focus: "Match people to texts." },
    { skill: "reading", partNumber: 3, title: "Long text comprehension", questionType: "multiple_choice", questionCount: 5, marks: 5, focus: "Read longer text, 4-option multiple choice." },
    { skill: "reading", partNumber: 4, title: "Gapped text", questionType: "gapped_text", questionCount: 5, marks: 5, focus: "Replace missing sentences in a text." },
    { skill: "reading", partNumber: 5, title: "Multiple-choice cloze", questionType: "multiple_choice_cloze", questionCount: 6, marks: 6, focus: "Choose word for each gap (4 options)." },
    { skill: "reading", partNumber: 6, title: "Open cloze", questionType: "open_cloze", questionCount: 6, marks: 6, focus: "Fill each gap with one word." },
    { skill: "writing", partNumber: 1, title: "Email", questionType: "writing_task", questionCount: 1, marks: 20, focus: "Reply to an email in 100 words.", timeMinutes: 20 },
    { skill: "writing", partNumber: 2, title: "Article or story", questionType: "writing_task", questionCount: 1, marks: 20, focus: "Choose article or story in 100 words.", timeMinutes: 25 },
  ],
};

// ─── B2 First ────────────────────────────────────────────────────────
export const B2_FORMAT: ExamFormat = {
  level: "B2",
  levelName: "B2 First",
  totalTimeMinutes: 155,
  writingTimeMinutes: 80,
  parts: [
    { skill: "use_of_english", partNumber: 1, title: "Multiple-choice cloze", questionType: "multiple_choice_cloze", questionCount: 8, marks: 8, focus: "Vocabulary: idioms, collocations, phrasal verbs." },
    { skill: "use_of_english", partNumber: 2, title: "Open cloze", questionType: "open_cloze", questionCount: 8, marks: 8, focus: "Grammar + vocabulary." },
    { skill: "use_of_english", partNumber: 3, title: "Word formation", questionType: "word_formation", questionCount: 8, marks: 8, focus: "Form derived words from stem." },
    { skill: "use_of_english", partNumber: 4, title: "Key word transformation", questionType: "key_word_transformation", questionCount: 6, marks: 12, focus: "Rewrite sentence using given key word." },
    { skill: "reading", partNumber: 5, title: "Multiple choice", questionType: "multiple_choice", questionCount: 6, marks: 12, focus: "Detail, opinion, attitude, tone." },
    { skill: "reading", partNumber: 6, title: "Gapped text", questionType: "gapped_text", questionCount: 6, marks: 12, focus: "Cohesion, coherence, text structure." },
    { skill: "reading", partNumber: 7, title: "Multiple matching", questionType: "multiple_matching", questionCount: 10, marks: 10, focus: "Detail, specific information, implication." },
    { skill: "writing", partNumber: 1, title: "Essay (obligatorio)", questionType: "writing_task", questionCount: 1, marks: 20, focus: "140–190 words. Two given ideas + own idea.", timeMinutes: 40 },
    { skill: "writing", partNumber: 2, title: "Choice: article/email/review/report", questionType: "writing_task", questionCount: 1, marks: 20, focus: "140–190 words. Elige entre las opciones.", timeMinutes: 40 },
  ],
};

// ─── C1 Advanced ─────────────────────────────────────────────────────
export const C1_FORMAT: ExamFormat = {
  level: "C1",
  levelName: "C1 Advanced",
  totalTimeMinutes: 180,
  writingTimeMinutes: 90,
  parts: [
    { skill: "use_of_english", partNumber: 1, title: "Multiple-choice cloze", questionType: "multiple_choice_cloze", questionCount: 8, marks: 8, focus: "Vocabulary." },
    { skill: "use_of_english", partNumber: 2, title: "Open cloze", questionType: "open_cloze", questionCount: 8, marks: 8, focus: "Grammar + vocab." },
    { skill: "use_of_english", partNumber: 3, title: "Word formation", questionType: "word_formation", questionCount: 8, marks: 8, focus: "Affixation, internal changes." },
    { skill: "use_of_english", partNumber: 4, title: "Key word transformation", questionType: "key_word_transformation", questionCount: 6, marks: 12, focus: "Grammar, vocab, collocation." },
    { skill: "reading", partNumber: 5, title: "Multiple choice", questionType: "multiple_choice", questionCount: 6, marks: 12, focus: "Detail, opinion, attitude, implication." },
    { skill: "reading", partNumber: 6, title: "Cross-text multiple matching", questionType: "cross_text_multiple_matching", questionCount: 4, marks: 8, focus: "Comparar opiniones entre 4 textos cortos." },
    { skill: "reading", partNumber: 7, title: "Gapped text", questionType: "gapped_text", questionCount: 6, marks: 12, focus: "Cohesion, coherence, global meaning." },
    { skill: "reading", partNumber: 8, title: "Multiple matching", questionType: "multiple_matching", questionCount: 10, marks: 10, focus: "Detail, opinion, specific info." },
    { skill: "writing", partNumber: 1, title: "Essay (obligatorio)", questionType: "writing_task", questionCount: 1, marks: 20, focus: "220–260 words. Discursive essay.", timeMinutes: 45 },
    { skill: "writing", partNumber: 2, title: "Choice: letter/proposal/report/review", questionType: "writing_task", questionCount: 1, marks: 20, focus: "220–260 words.", timeMinutes: 45 },
  ],
};

// ─── C2 Proficiency ──────────────────────────────────────────────────
export const C2_FORMAT: ExamFormat = {
  level: "C2",
  levelName: "C2 Proficiency",
  totalTimeMinutes: 180,
  writingTimeMinutes: 90,
  parts: [
    { skill: "use_of_english", partNumber: 1, title: "Multiple-choice cloze", questionType: "multiple_choice_cloze", questionCount: 8, marks: 8, focus: "Vocabulary + phrases." },
    { skill: "use_of_english", partNumber: 2, title: "Open cloze", questionType: "open_cloze", questionCount: 8, marks: 8, focus: "Grammar + vocab." },
    { skill: "use_of_english", partNumber: 3, title: "Word formation", questionType: "word_formation", questionCount: 8, marks: 8, focus: "Complex word formation." },
    { skill: "use_of_english", partNumber: 4, title: "Key word transformation", questionType: "key_word_transformation", questionCount: 6, marks: 12, focus: "Advanced grammar + collocation." },
    { skill: "reading", partNumber: 5, title: "Multiple choice", questionType: "multiple_choice", questionCount: 6, marks: 12, focus: "Detail, opinion, tone, implication." },
    { skill: "reading", partNumber: 6, title: "Gapped text", questionType: "gapped_text", questionCount: 7, marks: 14, focus: "Global meaning, complex cohesion." },
    { skill: "reading", partNumber: 7, title: "Multiple matching", questionType: "multiple_matching", questionCount: 10, marks: 10, focus: "Detail, opinion, attitude." },
    { skill: "writing", partNumber: 1, title: "Essay obligatorio (compulsory)", questionType: "writing_task", questionCount: 1, marks: 20, focus: "240–280 words. Discussion essay from two texts.", timeMinutes: 45 },
    { skill: "writing", partNumber: 2, title: "Choice: article/letter/report/review", questionType: "writing_task", questionCount: 1, marks: 20, focus: "280–320 words.", timeMinutes: 45 },
  ],
};

// ─── Registro central ────────────────────────────────────────────────
export const EXAM_FORMATS: Record<CambridgeLevel, ExamFormat> = {
  A2: A2_FORMAT,
  B1: B1_FORMAT,
  B2: B2_FORMAT,
  C1: C1_FORMAT,
  C2: C2_FORMAT,
};

export function getExamFormat(level: CambridgeLevel): ExamFormat {
  return EXAM_FORMATS[level];
}

// ─── Etiquetas legibles para UI ──────────────────────────────────────
export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  multiple_choice: "Multiple choice",
  multiple_choice_cloze: "Multiple-choice cloze",
  open_cloze: "Open cloze",
  word_formation: "Word formation",
  key_word_transformation: "Key word transformation",
  gapped_text: "Gapped text",
  multiple_matching: "Multiple matching",
  cross_text_multiple_matching: "Cross-text multiple matching",
  writing_task: "Writing task",
};

export const SKILL_LABELS: Record<ExamSkill, string> = {
  reading: "Reading",
  use_of_english: "Use of English",
  writing: "Writing",
  listening: "Listening",
  speaking: "Speaking",
};

export const LEVEL_LABELS: Record<CambridgeLevel, string> = {
  A2: "A2 Key",
  B1: "B1 Preliminary",
  B2: "B2 First",
  C1: "C1 Advanced",
  C2: "C2 Proficiency",
};
