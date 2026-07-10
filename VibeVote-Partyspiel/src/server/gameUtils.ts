import type { GameStatistics, PlayerStats, Question, RoundResult } from '../shared/types';

export interface PlayerReference {
  id: string;
  name: string;
}

export function shuffle<T>(values: readonly T[], random: () => number = Math.random): T[] {
  const shuffled = [...values];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

export function calculateRoundResult(
  question: Question,
  players: readonly PlayerReference[],
  votes: ReadonlyMap<string, string>,
): RoundResult {
  const voteTotals = new Map(players.map((player) => [player.id, 0]));

  for (const targetPlayerId of votes.values()) {
    if (voteTotals.has(targetPlayerId)) {
      voteTotals.set(targetPlayerId, (voteTotals.get(targetPlayerId) ?? 0) + 1);
    }
  }

  const counts = players
    .map((player) => ({
      playerId: player.id,
      name: player.name,
      votes: voteTotals.get(player.id) ?? 0,
    }))
    .sort((left, right) => right.votes - left.votes || left.name.localeCompare(right.name, 'de'));

  const highestVoteCount = counts[0]?.votes ?? 0;
  const winners = highestVoteCount > 0
    ? counts.filter((entry) => entry.votes === highestVoteCount)
    : [];

  return {
    question,
    counts,
    winners,
    totalVotes: [...voteTotals.values()].reduce((sum, count) => sum + count, 0),
  };
}

export function buildGameStatistics(playerStats: readonly PlayerStats[]): GameStatistics {
  const ranking = playerStats
    .map((stats) => ({ ...stats }))
    .sort((left, right) => right.sips - left.sips
      || right.votesReceived - left.votesReceived
      || left.name.localeCompare(right.name, 'de'));

  if (ranking.length === 0) {
    return {
      ranking,
      mostSipsPlayerIds: [],
      leastSipsPlayerIds: [],
      finalBonusPlayerIds: [],
    };
  }

  const mostSips = ranking[0].sips;
  const leastSips = ranking[ranking.length - 1].sips;
  const mostSipsPlayerIds = ranking
    .filter((player) => player.sips === mostSips)
    .map((player) => player.playerId);
  const leastSipsPlayerIds = ranking
    .filter((player) => player.sips === leastSips)
    .map((player) => player.playerId);

  return {
    ranking,
    mostSipsPlayerIds,
    leastSipsPlayerIds,
    finalBonusPlayerIds: [...new Set([...mostSipsPlayerIds, ...leastSipsPlayerIds])],
  };
}
