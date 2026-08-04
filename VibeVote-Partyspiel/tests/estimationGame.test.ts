import { describe, expect, it } from 'vitest';
import { didPlayerEstimateCorrectly } from '../src/client/games/estimation/estimationResultUtils';
import {
  ESTIMATION_CATEGORIES,
  ESTIMATION_DIFFICULTIES,
  type EstimationNumberQuestion,
  type EstimationPlayerStats,
  type EstimationSettings,
} from '../src/shared/estimationTypes';
import {
  countEstimationQuestions,
  filterEstimationQuestions,
  toPublicEstimationQuestion,
  validateEstimationAnswer,
  validateEstimationSettingsUpdate,
  validateEstimationStart,
} from '../src/server/games/estimation/estimationGame';
import { estimationQuestions } from '../src/server/games/estimation/estimationQuestions';
import {
  applyEstimationRoundToStats,
  buildEstimationStatistics,
  calculateEstimationRoundResult,
  createEmptyEstimationStats,
} from '../src/server/games/estimation/estimationScoring';

const allSettings: EstimationSettings = {
  roundLimit: 60,
  timerSeconds: 20,
  categories: [...ESTIMATION_CATEGORIES],
  difficulties: [...ESTIMATION_DIFFICULTIES],
};

describe('Schätzfragen-Pool', () => {
  it('enthält 120 eindeutige, gleichmäßig verteilte und valide Fragen', () => {
    expect(estimationQuestions).toHaveLength(120);
    expect(new Set(estimationQuestions.map((question) => question.id)).size).toBe(120);
    expect(new Set(estimationQuestions.map((question) => question.text)).size).toBe(120);

    for (const category of ESTIMATION_CATEGORIES) {
      const categoryQuestions = estimationQuestions.filter((question) => question.category === category);
      expect(categoryQuestions).toHaveLength(20);
      expect(categoryQuestions.filter((question) => question.difficulty === 'Leicht')).toHaveLength(7);
      expect(categoryQuestions.filter((question) => question.difficulty === 'Mittel')).toHaveLength(7);
      expect(categoryQuestions.filter((question) => question.difficulty === 'Schwer')).toHaveLength(6);
    }

    for (const question of estimationQuestions) {
      if (question.type === 'choice') {
        expect(question.options.length).toBeGreaterThanOrEqual(3);
        expect(question.options.length).toBeLessThanOrEqual(6);
        expect(new Set(question.options).size).toBe(question.options.length);
        expect(question.options.filter((option) => option === question.correctAnswer)).toHaveLength(1);
      } else {
        expect(Number.isFinite(question.correctAnswer)).toBe(true);
        if (question.correctAnswer < 0) expect(question.allowNegative).toBe(true);
      }
    }
  });

  it('filtert Kategorien und Schwierigkeitsstufen ohne Duplikate', () => {
    const settings: EstimationSettings = {
      roundLimit: 5,
      timerSeconds: 20,
      categories: ['Kultur', 'Natur'],
      difficulties: ['Schwer'],
    };
    const filtered = filterEstimationQuestions(settings);
    expect(filtered).toHaveLength(12);
    expect(new Set(filtered.map((question) => question.id)).size).toBe(filtered.length);
    expect(filtered.every((question) =>
      settings.categories.includes(question.category)
      && settings.difficulties.includes(question.difficulty))).toBe(true);
  });

  it('überträgt vor der Auflösung weder Lösung noch erklärenden Lösungshinweis', () => {
    const question = estimationQuestions.find((entry) => entry.answerNote)!;
    const publicQuestion = toPublicEstimationQuestion(question);
    expect(publicQuestion).not.toHaveProperty('correctAnswer');
    expect(publicQuestion).not.toHaveProperty('answerNote');
  });
});

describe('Schätzfragen-Einstellungen und Eingaben', () => {
  it('akzeptiert Timer in 5er-Schritten bis 40 Sekunden und lehnt andere Werte ab', () => {
    expect(validateEstimationSettingsUpdate(allSettings, { timerSeconds: 5 }))
      .toMatchObject({ ok: true, value: { timerSeconds: 5 } });
    expect(validateEstimationSettingsUpdate(allSettings, { timerSeconds: 40 }))
      .toMatchObject({ ok: true, value: { timerSeconds: 40 } });
    expect(validateEstimationSettingsUpdate(allSettings, { timerSeconds: 12 as 20 }))
      .toMatchObject({ ok: false, code: 'INVALID_ESTIMATION_TIMER' });
  });

  it('begrenzt die Rundenzahl automatisch auf den verfügbaren Pool', () => {
    const validation = validateEstimationSettingsUpdate(allSettings, {
      categories: ['Kultur'],
      difficulties: ['Schwer'],
    });
    expect(validation.ok).toBe(true);
    if (!validation.ok) return;
    expect(countEstimationQuestions(validation.value)).toBe(6);
    expect(validation.value.roundLimit).toBe(6);
  });

  it('verhindert einen Start ohne Kategorie oder Schwierigkeitsstufe', () => {
    expect(validateEstimationStart({ ...allSettings, categories: [] }))
      .toMatchObject({ ok: false, code: 'NO_ESTIMATION_CATEGORY' });
    expect(validateEstimationStart({ ...allSettings, difficulties: [] }))
      .toMatchObject({ ok: false, code: 'NO_ESTIMATION_DIFFICULTY' });
  });

  it('validiert ganze, dezimale und negative Zahlen serverseitig', () => {
    const integerQuestion: EstimationNumberQuestion = {
      id: 'integer', type: 'number', text: 'Test', category: 'Natur', difficulty: 'Leicht', correctAnswer: 10,
    };
    expect(validateEstimationAnswer(integerQuestion, 8)).toEqual({ ok: true, value: 8 });
    expect(validateEstimationAnswer(integerQuestion, 8.5)).toMatchObject({ ok: false, code: 'DECIMALS_NOT_ALLOWED' });
    expect(validateEstimationAnswer(integerQuestion, -2)).toMatchObject({ ok: false, code: 'NEGATIVE_NOT_ALLOWED' });
    expect(validateEstimationAnswer(integerQuestion, Number.POSITIVE_INFINITY)).toMatchObject({ ok: false, code: 'INVALID_NUMBER_ANSWER' });

    const decimalQuestion = { ...integerQuestion, allowDecimals: true, allowNegative: true };
    expect(validateEstimationAnswer(decimalQuestion, -8.5)).toEqual({ ok: true, value: -8.5 });
  });

  it('akzeptiert bei Auswahlfragen ausschließlich angebotene Antworten', () => {
    const question = estimationQuestions.find((entry) => entry.type === 'choice')!;
    expect(validateEstimationAnswer(question, question.options[0])).toMatchObject({ ok: true });
    expect(validateEstimationAnswer(question, 'Manipulierte Antwort'))
      .toMatchObject({ ok: false, code: 'INVALID_CHOICE_ANSWER' });
  });
});

describe('Schätzfragen-Auswertung', () => {
  const players = [
    { id: 'a', name: 'Anna' },
    { id: 'b', name: 'Ben' },
    { id: 'c', name: 'Chris' },
  ];

  it('ermittelt bei einer Zahlenfrage alle Personen mit größter Abweichung', () => {
    const question: EstimationNumberQuestion = {
      id: 'number', type: 'number', text: 'Wie viel?', category: 'Allgemeinwissen', difficulty: 'Leicht', correctAnswer: 100,
    };
    const result = calculateEstimationRoundResult(question, players, new Map([
      ['a', 80], ['b', 120], ['c', 95],
    ]));
    expect(result.answers.map((answer) => answer.deviation)).toEqual([20, 20, 5]);
    expect(result.loserPlayerIds.sort()).toEqual(['a', 'b']);
    expect(result.drinkerPlayerIds.sort()).toEqual(['a', 'b']);
  });

  it('erlaubt Konfetti nur für die eigene exakt richtige Schätzung', () => {
    const question: EstimationNumberQuestion = {
      id: 'number', type: 'number', text: 'Wie viel?', category: 'Allgemeinwissen', difficulty: 'Leicht', correctAnswer: 100,
    };
    const result = calculateEstimationRoundResult(question, players, new Map([
      ['a', 100], ['b', 99], ['c', 101],
    ]));

    expect(didPlayerEstimateCorrectly(result, 'a')).toBe(true);
    expect(didPlayerEstimateCorrectly(result, 'b')).toBe(false);
    expect(didPlayerEstimateCorrectly(result, 'c')).toBe(false);
    expect(didPlayerEstimateCorrectly(result, 'unknown')).toBe(false);
  });

  it('erlaubt Konfetti bei Auswahlfragen nur für die eigene richtige Antwort', () => {
    const question = estimationQuestions.find((entry) => entry.type === 'choice')!;
    const wrong = question.options.find((option) => option !== question.correctAnswer)!;
    const result = calculateEstimationRoundResult(question, players, new Map([
      ['a', question.correctAnswer], ['b', wrong], ['c', wrong],
    ]));

    expect(didPlayerEstimateCorrectly(result, 'a')).toBe(true);
    expect(didPlayerEstimateCorrectly(result, 'b')).toBe(false);
  });

  it('lässt bei Auswahlfragen alle falschen, aber keine richtigen Antworten trinken', () => {
    const question = estimationQuestions.find((entry) => entry.type === 'choice')!;
    const wrong = question.options.find((option) => option !== question.correctAnswer)!;
    const mixed = calculateEstimationRoundResult(question, players, new Map([
      ['a', question.correctAnswer], ['b', wrong], ['c', wrong],
    ]));
    expect(mixed.drinkerPlayerIds.sort()).toEqual(['b', 'c']);

    const allCorrect = calculateEstimationRoundResult(question, players, new Map(
      players.map((player) => [player.id, question.correctAnswer]),
    ));
    expect(allCorrect.drinkerPlayerIds).toEqual([]);

    const allWrong = calculateEstimationRoundResult(question, players, new Map(
      players.map((player) => [player.id, wrong]),
    ));
    expect(allWrong.drinkerPlayerIds.sort()).toEqual(['a', 'b', 'c']);
  });

  it('führt Statistiken fort und verlangt drei Zahlenantworten für den Schätzmeister', () => {
    const stats = new Map<string, EstimationPlayerStats>(players.map((player) => [
      player.id,
      createEmptyEstimationStats(player.id, player.name),
    ]));
    const question: EstimationNumberQuestion = {
      id: 'number', type: 'number', text: 'Wie viel?', category: 'Natur', difficulty: 'Mittel', correctAnswer: 100,
    };
    for (let round = 0; round < 3; round += 1) {
      const result = calculateEstimationRoundResult(question, players, new Map([
        ['a', 99], ['b', 110], ['c', 130],
      ]));
      applyEstimationRoundToStats(stats, result);
    }
    const result = buildEstimationStatistics([...stats.values()]);
    expect(result.awards.estimationMasterPlayerIds).toEqual(['a']);
    expect(result.awards.furthestOffPlayerIds).toEqual(['c']);
    expect(result.ranking[0].playerId).toBe('c');
  });
});
