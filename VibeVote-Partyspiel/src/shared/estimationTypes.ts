export const ESTIMATION_CATEGORIES = [
  'Allgemeinwissen',
  'Geographie',
  'Geschichte',
  'Sport',
  'Natur',
  'Kultur',
] as const;

export const ESTIMATION_DIFFICULTIES = ['Leicht', 'Mittel', 'Schwer'] as const;

export type EstimationCategory = typeof ESTIMATION_CATEGORIES[number];
export type EstimationDifficulty = typeof ESTIMATION_DIFFICULTIES[number];
export type EstimationAnswer = number | string;

interface EstimationQuestionBase {
  id: string;
  text: string;
  category: EstimationCategory;
  difficulty: EstimationDifficulty;
  answerNote?: string;
}

export interface EstimationNumberQuestion extends EstimationQuestionBase {
  type: 'number';
  correctAnswer: number;
  unit?: string;
  allowDecimals?: boolean;
  allowNegative?: boolean;
}

export interface EstimationChoiceQuestion extends EstimationQuestionBase {
  type: 'choice';
  options: string[];
  correctAnswer: string;
}

export type EstimationQuestion = EstimationNumberQuestion | EstimationChoiceQuestion;

export type PublicEstimationNumberQuestion = Omit<EstimationNumberQuestion, 'correctAnswer' | 'answerNote'>;
export type PublicEstimationChoiceQuestion = Omit<EstimationChoiceQuestion, 'correctAnswer' | 'answerNote'>;
export type PublicEstimationQuestion = PublicEstimationNumberQuestion | PublicEstimationChoiceQuestion;

export interface EstimationSettings {
  roundLimit: number;
  categories: EstimationCategory[];
  difficulties: EstimationDifficulty[];
}

export interface EstimationAnswerResult {
  playerId: string;
  name: string;
  answer: EstimationAnswer;
  isCorrect?: boolean;
  deviation?: number;
}

export interface EstimationRoundResult {
  question: PublicEstimationQuestion;
  correctAnswer: EstimationAnswer;
  answerNote?: string;
  answers: EstimationAnswerResult[];
  loserPlayerIds: string[];
  drinkerPlayerIds: string[];
}

export interface EstimationPlayerStats {
  playerId: string;
  name: string;
  answeredQuestions: number;
  correctChoiceAnswers: number;
  lostNumberQuestions: number;
  drinkRounds: number;
  totalNumberDeviation: number;
  answeredNumberQuestions: number;
  averageNumberDeviation: number | null;
  largestDeviation: number;
}

export interface EstimationAwards {
  estimationMasterPlayerIds: string[];
  knowledgeMasterPlayerIds: string[];
  furthestOffPlayerIds: string[];
  drinkingMasterPlayerIds: string[];
  minimumNumberAnswersForMaster: number;
}

export interface EstimationGameStatistics {
  ranking: EstimationPlayerStats[];
  awards: EstimationAwards;
}
