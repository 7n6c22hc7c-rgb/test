import type { EstimationRoundResult } from '../../../shared/estimationTypes';

export function didPlayerEstimateCorrectly(
  result: EstimationRoundResult | undefined,
  playerId: string,
): boolean {
  if (!result) return false;

  const playerAnswer = result.answers.find((answer) => answer.playerId === playerId);
  if (!playerAnswer) return false;

  if (result.question.type === 'number') {
    return typeof playerAnswer.answer === 'number'
      && typeof result.correctAnswer === 'number'
      && playerAnswer.answer === result.correctAnswer;
  }

  return playerAnswer.isCorrect === true;
}
