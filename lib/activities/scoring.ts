/**
 * Lógica de puntuación y evaluación de respuestas.
 */

import type {
  ActivityQuestion,
  ActivityQuestionType,
} from "./types";

/**
 * Normaliza una respuesta para comparación: trim, lowercase, colapsa espacios,
 * elimina puntuación básica.
 */
export function normalizeAnswer(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .trim()
    .toLowerCase()
    .replace(/[.,;:!?'"`´'"]/g, "")
    .replace(/\s+/g, " ");
}

/**
 * Comprueba si una respuesta del alumno es correcta para una pregunta.
 * Maneja los distintos tipos de pregunta.
 */
export function isAnswerCorrect(
  question: ActivityQuestion,
  userAnswer: string | null | undefined
): boolean {
  if (!userAnswer || userAnswer.trim() === "") return false;

  switch (question.question_type) {
    case "multiple_choice":
    case "multiple_matching":
      // El cliente envía la letra ('A', 'B', ...) y la correcta es también letra
      return (
        userAnswer.trim().toUpperCase() ===
        (question.correct_answer ?? "").trim().toUpperCase()
      );

    case "open_cloze":
    case "word_formation": {
      // Comparación exacta (normalizada), con posibles respuestas aceptadas
      const normalized = normalizeAnswer(userAnswer);
      const canonical = normalizeAnswer(question.correct_answer);
      if (normalized === canonical) return true;
      const accepted = question.accepted_answers ?? [];
      return accepted.some((a) => normalizeAnswer(a) === normalized);
    }

    case "key_word_transformation": {
      // Más flexible: comparación normalizada + verificar nº de palabras.
      const normalized = normalizeAnswer(userAnswer);
      const canonical = normalizeAnswer(question.correct_answer);
      const minW = Number(question.metadata?.min_words ?? 3);
      const maxW = Number(question.metadata?.max_words ?? 6);
      const wordCount = normalized.split(" ").filter(Boolean).length;
      if (wordCount < minW || wordCount > maxW) return false;
      if (normalized === canonical) return true;
      const accepted = question.accepted_answers ?? [];
      return accepted.some((a) => normalizeAnswer(a) === normalized);
    }

    default:
      return false;
  }
}

/**
 * Clasifica una puntuación en una nota cualitativa.
 */
export function gradeFromScore(
  score: number,
  total: number
): "excellent" | "good" | "pass" | "fail" {
  if (total === 0) return "fail";
  const pct = (score / total) * 100;
  if (pct >= 85) return "excellent";
  if (pct >= 65) return "good";
  if (pct >= 50) return "pass";
  return "fail";
}

/**
 * Mensaje humano para el grade.
 */
export function gradeLabel(
  grade: "excellent" | "good" | "pass" | "fail"
): string {
  const map = {
    excellent: "Excelente",
    good: "Bien",
    pass: "Aprobado",
    fail: "Necesita práctica",
  };
  return map[grade];
}

/**
 * Color para la nota (clase Tailwind).
 */
export function gradeColorClass(
  grade: "excellent" | "good" | "pass" | "fail"
): string {
  const map = {
    excellent: "text-emerald-600 bg-emerald-50 border-emerald-200",
    good: "text-navy bg-paper border-saffron/30",
    pass: "text-amber-700 bg-amber-50 border-amber-200",
    fail: "text-red-700 bg-red-50 border-red-200",
  };
  return map[grade];
}

/**
 * Para el label del tipo de pregunta en la UI.
 */
export function questionTypeLabel(type: ActivityQuestionType): string {
  const map: Record<ActivityQuestionType, string> = {
    multiple_choice: "Multiple Choice",
    open_cloze: "Open Cloze",
    word_formation: "Word Formation",
    key_word_transformation: "Key Word Transformation",
    multiple_matching: "Multiple Matching",
  };
  return map[type];
}
