import {
  ESTIMATION_CATEGORIES,
  ESTIMATION_DIFFICULTIES,
  ESTIMATION_TIMER_OPTIONS,
  type EstimationAnswer,
  type EstimationCategory,
  type EstimationDifficulty,
  type EstimationQuestion,
  type EstimationSettings,
  type PublicEstimationQuestion,
} from '../../../shared/estimationTypes';
import { estimationQuestions } from './estimationQuestions';

export interface EstimationValidationFailure {
  ok: false;
  code: string;
  message: string;
}

export interface EstimationValidationSuccess<T> {
  ok: true;
  value: T;
}

export type EstimationValidation<T> = EstimationValidationSuccess<T> | EstimationValidationFailure;

export function isEstimationCategory(value: unknown): value is EstimationCategory {
  return typeof value === 'string' && ESTIMATION_CATEGORIES.includes(value as EstimationCategory);
}

export function isEstimationDifficulty(value: unknown): value is EstimationDifficulty {
  return typeof value === 'string' && ESTIMATION_DIFFICULTIES.includes(value as EstimationDifficulty);
}

function isEstimationTimerSeconds(value: unknown): value is EstimationSettings['timerSeconds'] {
  return typeof value === 'number'
    && ESTIMATION_TIMER_OPTIONS.includes(value as EstimationSettings['timerSeconds']);
}

export function filterEstimationQuestions(settings: EstimationSettings): EstimationQuestion[] {
  const categories = new Set(settings.categories);
  const difficulties = new Set(settings.difficulties);
  return estimationQuestions.filter((question) =>
    categories.has(question.category) && difficulties.has(question.difficulty));
}

export function countEstimationQuestions(settings: EstimationSettings): number {
  return filterEstimationQuestions(settings).length;
}

export function toPublicEstimationQuestion(question: EstimationQuestion): PublicEstimationQuestion {
  if (question.type === 'number') {
    const { correctAnswer: _correctAnswer, answerNote: _answerNote, ...publicQuestion } = question;
    return { ...publicQuestion };
  }
  const { correctAnswer: _correctAnswer, answerNote: _answerNote, ...publicQuestion } = question;
  return { ...publicQuestion, options: [...publicQuestion.options] };
}

export function validateEstimationSettingsUpdate(
  current: EstimationSettings,
  rawUpdate: Partial<EstimationSettings>,
): EstimationValidation<EstimationSettings> {
  let roundLimit = current.roundLimit;
  let timerSeconds = current.timerSeconds;
  let categories = current.categories;
  let difficulties = current.difficulties;

  if (rawUpdate.roundLimit !== undefined) {
    if (!Number.isInteger(rawUpdate.roundLimit) || rawUpdate.roundLimit < 5 || rawUpdate.roundLimit > 60) {
      return { ok: false, code: 'INVALID_ESTIMATION_ROUND_LIMIT', message: 'Wähle eine ganze Rundenzahl zwischen 5 und 60.' };
    }
    roundLimit = rawUpdate.roundLimit;
  }

  if (rawUpdate.timerSeconds !== undefined) {
    if (!isEstimationTimerSeconds(rawUpdate.timerSeconds)) {
      return { ok: false, code: 'INVALID_ESTIMATION_TIMER', message: 'Wähle eine Zeit in 5-Sekunden-Schritten zwischen 5 und 40 Sekunden.' };
    }
    timerSeconds = rawUpdate.timerSeconds;
  }

  if (rawUpdate.categories !== undefined) {
    if (!Array.isArray(rawUpdate.categories) || !rawUpdate.categories.every(isEstimationCategory)) {
      return { ok: false, code: 'INVALID_ESTIMATION_CATEGORIES', message: 'Die gewählte Kategorieauswahl ist ungültig.' };
    }
    categories = [...new Set(rawUpdate.categories)];
  }

  if (rawUpdate.difficulties !== undefined) {
    if (!Array.isArray(rawUpdate.difficulties) || !rawUpdate.difficulties.every(isEstimationDifficulty)) {
      return { ok: false, code: 'INVALID_ESTIMATION_DIFFICULTIES', message: 'Die gewählte Schwierigkeitsauswahl ist ungültig.' };
    }
    difficulties = [...new Set(rawUpdate.difficulties)];
  }

  const next = { roundLimit, timerSeconds, categories, difficulties };
  const available = countEstimationQuestions(next);
  if (available >= 5 && next.roundLimit > available) {
    next.roundLimit = Math.min(60, available);
  }
  return { ok: true, value: next };
}

export function validateEstimationStart(settings: EstimationSettings): EstimationValidation<EstimationSettings> {
  if (settings.categories.length === 0) {
    return { ok: false, code: 'NO_ESTIMATION_CATEGORY', message: 'Wähle mindestens eine Kategorie aus.' };
  }
  if (settings.difficulties.length === 0) {
    return { ok: false, code: 'NO_ESTIMATION_DIFFICULTY', message: 'Wähle mindestens eine Schwierigkeitsstufe aus.' };
  }
  if (!Number.isInteger(settings.roundLimit) || settings.roundLimit < 5 || settings.roundLimit > 60) {
    return { ok: false, code: 'INVALID_ESTIMATION_ROUND_LIMIT', message: 'Wähle eine ganze Rundenzahl zwischen 5 und 60.' };
  }
  if (!isEstimationTimerSeconds(settings.timerSeconds)) {
    return { ok: false, code: 'INVALID_ESTIMATION_TIMER', message: 'Wähle eine Zeit in 5-Sekunden-Schritten zwischen 5 und 40 Sekunden.' };
  }
  const available = countEstimationQuestions(settings);
  if (available < settings.roundLimit) {
    return {
      ok: false,
      code: 'NOT_ENOUGH_ESTIMATION_QUESTIONS',
      message: `Für diese Auswahl stehen nur ${available} Fragen zur Verfügung.`,
    };
  }
  return { ok: true, value: settings };
}

export function validateEstimationAnswer(
  question: EstimationQuestion,
  rawAnswer: unknown,
): EstimationValidation<EstimationAnswer> {
  if (question.type === 'choice') {
    if (typeof rawAnswer !== 'string' || !question.options.includes(rawAnswer)) {
      return { ok: false, code: 'INVALID_CHOICE_ANSWER', message: 'Wähle eine der angebotenen Antworten aus.' };
    }
    return { ok: true, value: rawAnswer };
  }

  if (typeof rawAnswer !== 'number' || !Number.isFinite(rawAnswer) || Math.abs(rawAnswer) > 1_000_000_000_000) {
    return { ok: false, code: 'INVALID_NUMBER_ANSWER', message: 'Gib eine gültige Zahl ein.' };
  }
  if (!question.allowDecimals && !Number.isInteger(rawAnswer)) {
    return { ok: false, code: 'DECIMALS_NOT_ALLOWED', message: 'Bei dieser Frage sind nur ganze Zahlen erlaubt.' };
  }
  if (!question.allowNegative && rawAnswer < 0) {
    return { ok: false, code: 'NEGATIVE_NOT_ALLOWED', message: 'Bei dieser Frage sind keine negativen Zahlen erlaubt.' };
  }
  return { ok: true, value: rawAnswer };
}
