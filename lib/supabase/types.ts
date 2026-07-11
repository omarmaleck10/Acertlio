/**
 * Tipos TypeScript de la base de datos de Acertlio.
 *
 * Estos tipos reflejan el schema.sql que ejecutaste en Supabase.
 * Se usan para tipar consultas y respuestas de Supabase, dándonos
 * autocompletado y validación en tiempo de compilación.
 *
 * En una fase posterior podríamos generar esto automáticamente con
 * `npx supabase gen types typescript` — pero para v1.0 lo tenemos
 * mantenido a mano para que sepas exactamente qué hay dentro.
 */

// ─── ENUMS ───────────────────────────────────────────────────────────

export type UserRole = "super_admin" | "academy_admin" | "teacher" | "student";
export type CambridgeLevel = "B1" | "B2" | "C1";
export type AcademyStatus = "active" | "paused" | "cancelled";
export type AcademyPlan = "starter" | "pro" | "business" | "enterprise";
export type ExamSkill =
  | "reading"
  | "use_of_english"
  | "listening"
  | "writing"
  | "speaking";
export type QuestionType =
  | "multiple_choice"
  | "word_formation"
  | "gapped_text"
  | "open_cloze"
  | "multiple_matching"
  | "writing_task";
export type AssignmentStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "expired";
export type AttemptStatus =
  | "in_progress"
  | "submitted"
  | "auto_graded"
  | "fully_graded";
export type CorrectionStatus = "pending" | "in_progress" | "completed";
export type SubscriptionStatus =
  | "active"
  | "past_due"
  | "cancelled"
  | "trialing";

// ─── TABLAS ──────────────────────────────────────────────────────────

export interface Academy {
  id: string;
  name: string;
  slug: string;
  cif: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string;
  plan: AcademyPlan;
  total_seats: number;
  status: AcademyStatus;
  stripe_customer_id: string | null;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  academy_id: string | null;
  role: UserRole;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  current_level: CambridgeLevel | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TeacherStudent {
  teacher_id: string;
  student_id: string;
  academy_id: string;
  created_at: string;
}

export interface License {
  id: string;
  academy_id: string;
  student_id: string | null;
  assigned_at: string | null;
  released_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudentLevelHistory {
  id: string;
  student_id: string;
  academy_id: string;
  from_level: CambridgeLevel | null;
  to_level: CambridgeLevel;
  changed_by: string | null;
  reason: string | null;
  created_at: string;
}

export interface Exam {
  id: string;
  title: string;
  level: CambridgeLevel;
  mock_number: number | null;
  description: string | null;
  total_time_minutes: number;
  is_published: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface ExamPart {
  id: string;
  exam_id: string;
  skill: ExamSkill;
  part_number: number;
  title: string | null;
  instructions: string | null;
  time_minutes: number | null;
  order_index: number;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  part_id: string;
  question_number: number;
  question_type: QuestionType;
  stem: string | null;
  context: Record<string, unknown>;
  correct_answer: string | null;
  points: number;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface QuestionOption {
  id: string;
  question_id: string;
  letter: string;
  text: string;
  is_correct: boolean;
  order_index: number;
  created_at: string;
}

export interface Audio {
  id: string;
  part_id: string | null;
  title: string;
  storage_path: string;
  duration_seconds: number | null;
  max_plays: number;
  created_at: string;
}

export interface Assignment {
  id: string;
  exam_id: string;
  student_id: string;
  assigned_by: string | null;
  academy_id: string;
  due_date: string | null;
  parts_included: string[] | null;
  status: AssignmentStatus;
  created_at: string;
  updated_at: string;
}

export interface Attempt {
  id: string;
  assignment_id: string | null;
  exam_id: string;
  student_id: string;
  academy_id: string;
  started_at: string;
  submitted_at: string | null;
  time_spent_seconds: number;
  status: AttemptStatus;
  raw_score: number | null;
  cambridge_score: number | null;
  estimated_grade: string | null;
  created_at: string;
  updated_at: string;
}

export interface Answer {
  id: string;
  attempt_id: string;
  question_id: string;
  answer_text: string | null;
  selected_option_id: string | null;
  is_correct: boolean | null;
  points_earned: number | null;
  time_spent_seconds: number | null;
  answered_at: string;
  updated_at: string;
}

export interface WritingCorrection {
  id: string;
  attempt_id: string;
  question_id: string;
  student_id: string;
  teacher_id: string | null;
  academy_id: string;
  content_score: number | null;
  communicative_score: number | null;
  organisation_score: number | null;
  language_score: number | null;
  total_score: number | null;
  feedback: string | null;
  inline_comments: unknown[];
  status: CorrectionStatus;
  corrected_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Invitation {
  id: string;
  academy_id: string;
  email: string;
  role: UserRole;
  invited_by: string | null;
  token: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}

export interface Subscription {
  id: string;
  academy_id: string;
  stripe_subscription_id: string | null;
  plan: AcademyPlan;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  academy_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}
