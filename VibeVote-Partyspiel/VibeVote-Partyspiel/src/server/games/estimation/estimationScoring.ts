import type {
  EstimationAnswer,
  EstimationGameStatistics,
  EstimationPlayerStats,
  EstimationQuestion,
  EstimationRoundResult,
} from '../../../shared/estimationTypes';
import { toPublicEstimationQuestion } from './estimationGame';

interface ScoringPlayer {
  id: string;
  name: string;
}

const MASTER_MINIMUM_NUMBER_ANSWERS = 3;

function roundedDeviation(value: number): number {
  return Math.round(value * 1_000_000) / 1_000_000;
}

export function createEmptyEstimationStats(playerId: string, name: string): EstimationPlayerStats {
  return {
    playerId,
    name,
    answeredQuestions: 0,
    correctChoiceAnswers: 0,
    lostNumberQuestions: 0,
    drinkRounds: 0,
    totalNumberDeviation: 0,
    answeredNumberQuestions: 0,
    averageNumberDeviation: null,
    largestDeviation: 0,
  };
}

export function calculateEstimationRoundResult(
  question: EstimationQuestion,
  players: ScoringPlayer[],
  answers: Map<string, EstimationAnswer>,
): EstimationRoundResult {
  if (question.type === 'number') {
    const answerResults = players.flatMap((player) => {
      const answer = answers.get(player.id);
      if (typeof answer !== 'number') return [];
      return [{
        playerId: player.id,
        name: player.name,
        answer,
        deviation: roundedDeviation(Math.abs(answer - question.correctAnswer)),
      }];
    });
    const maximumDeviation = answerResults.length > 0
      ? Math.max(...answerResults.map((entry) => entry.deviation))
      : undefined;
    const loserPlayerIds = maximumDeviation === undefined
      ? []
      : answerResults.filter((entry) => entry.deviation === maximumDeviation).map((entry) => entry.playerId);

    return {
      question: toPublicEstimationQuestion(question),
      correctAnswer: question.correctAnswer,
      answerNote: question.answerNote,
      answers: answerResults,
      loserPlayerIds,
      drinkerPlayerIds: [...loserPlayerIds],
    };
  }

  const answerResults = players.flatMap((player) => {
    const answer = answers.get(player.id);
    if (typeof answer !== 'string') return [];
    return [{
      playerId: player.id,
      name: player.name,
      answer,
      isCorrect: answer === question.correctAnswer,
    }];
  });
  const loserPlayerIds = answerResults.filter((entry) => !entry.isCorrect).map((entry) => entry.playerId);
  return {
    question: toPublicEstimationQuestion(question),
    correctAnswer: question.correctAnswer,
    answerNote: question.answerNote,
    answers: answerResults,
    loserPlayerIds,
    drinkerPlayerIds: [...loserPlayerIds],
  };
}

export function applyEstimationRoundToStats(
  statsByPlayerId: Map<string, EstimationPlayerStats>,
  result: EstimationRoundResult,
): void {
  const drinkers = new Set(result.drinkerPlayerIds);
  const numberQuestion = result.question.type === 'number';

  for (const answer of result.answers) {
    const stats = statsByPlayerId.get(answer.playerId);
    if (!stats) continue;
    stats.answeredQuestions += 1;
    if (drinkerId(stats.playerId, drinkers)) stats.drinkRounds += 1;

    if (numberQuestion) {
      const deviation = answer.deviation ?? 0;
      stats.answeredNumberQuestions += 1;
      stats.totalNumberDeviation = roundedDeviation(stats.totalNumberDeviation + deviation);
      stats.averageNumberDeviation = roundedDeviation(stats.totalNumberDeviation / stats.answeredNumberQuestions);
      stats.largestDeviation = Math.max(stats.largestDeviation, deviation);
      if (drinkers.has(stats.playerId)) stats.lostNumberQuestions += 1;
    } else if (answer.isCorrect) {
      stats.correctChoiceAnswers += 1;
    }
  }
}

function drinkerId(playerId: string, drinkers: Set<string>): boolean {
  return drinkers.has(playerId);
}

function idsWithMaximum(
  stats: EstimationPlayerStats[],
  selector: (entry: EstimationPlayerStats) => number,
  requirePositive = true,
): string[] {
  if (stats.length === 0) return [];
  const maximum = Math.max(...stats.map(selector));
  if (requirePositive && maximum <= 0) return [];
  return stats.filter((entry) => selector(entry) === maximum).map((entry) => entry.playerId);
}

export function buildEstimationStatistics(rawStats: EstimationPlayerStats[]): EstimationGameStatistics {
  const stats = rawStats.map((entry) => ({
    ...entry,
    averageNumberDeviation: entry.answeredNumberQuestions > 0
      ? roundedDeviation(entry.totalNumberDeviation / entry.answeredNumberQuestions)
      : null,
  }));
  const eligibleForAverage = stats.filter((entry) =>
    entry.answeredNumberQuestions >= MASTER_MINIMUM_NUMBER_ANSWERS && entry.averageNumberDeviation !== null);
  const minimumAverage = eligibleForAverage.length > 0
    ? Math.min(...eligibleForAverage.map((entry) => entry.averageNumberDeviation ?? Number.POSITIVE_INFINITY))
    : undefined;

  return {
    ranking: [...stats].sort((a, b) =>
      b.drinkRounds - a.drinkRounds
      || b.correctChoiceAnswers - a.correctChoiceAnswers
      || a.name.localeCompare(b.name, 'de')),
    awards: {
      estimationMasterPlayerIds: minimumAverage === undefined
        ? []
        : eligibleForAverage
          .filter((entry) => entry.averageNumberDeviation === minimumAverage)
          .map((entry) => entry.playerId),
      knowledgeMasterPlayerIds: idsWithMaximum(stats, (entry) => entry.correctChoiceAnswers),
      furthestOffPlayerIds: idsWithMaximum(stats, (entry) => entry.lostNumberQuestions),
      drinkingMasterPlayerIds: idsWithMaximum(stats, (entry) => entry.drinkRounds),
      minimumNumberAnswersForMaster: MASTER_MINIMUM_NUMBER_ANSWERS,
    },
  };
}
