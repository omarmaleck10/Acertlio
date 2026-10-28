/**
 * Tipos TypeScript del sistema de actividades.
 */

export type CambridgeLevel = "A2" | "B1" | "B2" | "C1" | "C2";

export type CambridgeSkill =
  | "reading"
  | "use_of_english"
  | "reading_uoe"
  | "writing"
  | "listening"
  | "speaking";

export type ActivityQuestionType =
  | "multiple_choice"
  | "open_cloze"
  | "word_formation"
  | "key_word_transformation"
  | "multiple_matching";

export type ActivityDifficulty = "easy" | "medium" | "hard";

export type ExamPart = {
  id: number;
  level: CambridgeLevel;
  skill: CambridgeSkill;
  part_number: number;
  slug: string;
  name: string;
  description: string | null;
  official_question_count: number | null;
  default_question_type: ActivityQuestionType | null;
  display_order: number;
};

export type Activity = {
  id: string;
  level: CambridgeLevel;
  skill: CambridgeSkill;
  exam_part_id: number;
  activity_number: number;
  title: string;
  description: string | null;
  intro_text: string | null;
  audio_url: string | null;
  estimated_minutes: number;
  difficulty: ActivityDifficulty;
  is_published: boolean;
  // Joined
  exam_part?: ExamPart;
  question_count?: number;
};

export type QuestionOption = {
  id: string;
  option_letter: string;
  option_text: string;
  is_correct?: boolean; // solo visible al revisar resultados
  display_order: number;
};

export type ActivityQuestion = {
  id: string;
  activity_id: string;
  question_number: number;
  question_type: ActivityQuestionType;
  prompt: string;
  context: string | null;
  correct_answer?: string; // solo visible al revisar resultados
  accepted_answers?: string[] | null;
  explanation?: string | null;
  metadata: Record<string, any>;
  options?: QuestionOption[];
};

export type ActivityAttempt = {
  id: string;
  user_id: string;
  activity_id: string;
  started_at: string;
  submitted_at: string | null;
  score: number | null;
  total_questions: number;
  time_spent_seconds: number | null;
  is_complete: boolean;
  source: string;
  source_mock_attempt_id: string | null;
};

export type ActivityResponse = {
  id: string;
  attempt_id: string;
  question_id: string;
  user_answer: string | null;
  is_correct: boolean | null;
  answered_at: string;
};

export type ActivityWithQuestions = Activity & {
  questions: ActivityQuestion[];
};

export type AttemptResult = {
  attempt: ActivityAttempt;
  activity: Activity;
  questions: ActivityQuestion[];
  responses: Record<string, ActivityResponse>;
  summary: {
    score: number;
    total: number;
    percentage: number;
    grade: "excellent" | "good" | "pass" | "fail";
  };
};

// Payload del cliente al enviar respuestas
export type SubmitPayload = {
  attempt_id: string;
  responses: Array<{
    question_id: string;
    user_answer: string;
  }>;
  time_spent_seconds?: number;
};

// Para la recomendación post-mock
export type RecommendationRequest = {
  level: CambridgeLevel;
  weak_part_slug?: string; // ej: 'b2-reading-part-5'
  weak_part_id?: number;
  mock_attempt_id?: string;
  limit?: number;
};

export type RecommendedActivity = Activity & {
  recommendation_reason: string;
};
