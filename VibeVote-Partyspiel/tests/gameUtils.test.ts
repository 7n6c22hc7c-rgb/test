import { describe, expect, it } from 'vitest';
import { questions } from '../src/shared/questions';
import type { PlayerStats, Question } from '../src/shared/types';
import { buildGameStatistics, calculateRoundResult, shuffle } from '../src/server/gameUtils';

const sampleQuestion: Question = {
  id: 'test',
  category: 'Freundschaft',
  text: 'Wer würde eher einen Test schreiben?',
};

describe('Fragenpool', () => {
  it('enthält mindestens 100 eindeutige Fragen und IDs', () => {
    expect(questions.length).toBeGreaterThanOrEqual(100);
    expect(new Set(questions.map((question) => question.id)).size).toBe(questions.length);
    expect(new Set(questions.map((question) => question.text)).size).toBe(questions.length);
  });

  it('mischt ohne Elemente zu verlieren oder zu duplizieren', () => {
    const original = ['a', 'b', 'c', 'd', 'e'];
    const shuffled = shuffle(original, () => 0.25);

    expect(shuffled).not.toBe(original);
    expect([...shuffled].sort()).toEqual([...original].sort());
    expect(new Set(shuffled).size).toBe(original.length);
  });
});

describe('Rundenergebnis', () => {
  const players = [
    { id: 'a', name: 'Anna' },
    { id: 'b', name: 'Ben' },
    { id: 'c', name: 'Chris' },
  ];

  it('ermittelt einen eindeutigen Gewinner', () => {
    const votes = new Map([['a', 'b'], ['b', 'b'], ['c', 'a']]);
    const result = calculateRoundResult(sampleQuestion, players, votes);

    expect(result.totalVotes).toBe(3);
    expect(result.winners).toEqual([{ playerId: 'b', name: 'Ben', votes: 2 }]);
  });

  it('gibt bei Gleichstand alle Personen mit Höchstwert zurück', () => {
    const votes = new Map([['a', 'a'], ['b', 'b']]);
    const result = calculateRoundResult(sampleQuestion, players, votes);

    expect(result.winners.map((winner) => winner.playerId).sort()).toEqual(['a', 'b']);
  });

  it('vergibt ohne Stimmen keinen Rundengewinner', () => {
    const result = calculateRoundResult(sampleQuestion, players, new Map());
    expect(result.winners).toEqual([]);
    expect(result.totalVotes).toBe(0);
  });
});

describe('Abschlussstatistik', () => {
  it('sortiert nach Schlücken und vergibt den Abschlussbonus nur einmal pro Person', () => {
    const stats: PlayerStats[] = [
      { playerId: 'a', name: 'Anna', votesReceived: 7, roundsWon: 3, roundsLost: 2, sips: 3 },
      { playerId: 'b', name: 'Ben', votesReceived: 4, roundsWon: 1, roundsLost: 4, sips: 1 },
      { playerId: 'c', name: 'Chris', votesReceived: 4, roundsWon: 1, roundsLost: 4, sips: 1 },
    ];
    const result = buildGameStatistics(stats);

    expect(result.ranking.map((player) => player.playerId)).toEqual(['a', 'b', 'c']);
    expect(result.mostSipsPlayerIds).toEqual(['a']);
    expect(result.leastSipsPlayerIds).toEqual(['b', 'c']);
    expect(result.finalBonusPlayerIds).toEqual(['a', 'b', 'c']);
  });

  it('führt bei komplettem Gleichstand jede Person nur einmal auf', () => {
    const stats: PlayerStats[] = [
      { playerId: 'a', name: 'Anna', votesReceived: 0, roundsWon: 0, roundsLost: 0, sips: 0 },
      { playerId: 'b', name: 'Ben', votesReceived: 0, roundsWon: 0, roundsLost: 0, sips: 0 },
    ];
    const result = buildGameStatistics(stats);
    expect(result.finalBonusPlayerIds.sort()).toEqual(['a', 'b']);
  });
});
