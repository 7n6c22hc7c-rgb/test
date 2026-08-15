import { afterEach, describe, expect, it, vi } from 'vitest';
import type { EstimationAnswer } from '../src/shared/estimationTypes';
import type { RoomSnapshot } from '../src/shared/types';
import { PartyGameError, RoomManager } from '../src/server/RoomManager';

function validAnswer(room: RoomSnapshot): EstimationAnswer {
  const question = room.currentEstimationQuestion!;
  return question.type === 'number' ? 0 : question.options[0];
}

function createEstimationRoom(playerCount = 2) {
  const manager = new RoomManager(60_000, () => 0);
  const host = manager.createRoom('Host', 'socket-host');
  const guests = Array.from({ length: playerCount - 1 }, (_, index) =>
    manager.joinRoom(host.roomCode, `Gast ${index + 1}`, `socket-guest-${index + 1}`));
  manager.selectGame('socket-host', 'estimation');
  manager.updateEstimationSettings('socket-host', {
    roundLimit: 5,
    timerSeconds: 20,
    categories: ['Natur'],
    difficulties: ['Leicht'],
  });
  return { manager, host, guests };
}

describe('RoomManager · Schätzfragen', () => {
  afterEach(() => vi.useRealTimers());

  it('startet nur durch den Host und hält Lösungen bis zur Auflösung geheim', () => {
    const { manager, host, guests } = createEstimationRoom();
    expect(() => manager.startGame('socket-guest-1', true))
      .toThrowError(expect.objectContaining<Partial<PartyGameError>>({ code: 'HOST_ONLY' }));

    manager.startGame('socket-host', true);
    const voting = manager.getSnapshot(host.roomCode)!;
    expect(voting.selectedGame).toBe('estimation');
    expect(voting.totalRounds).toBe(5);
    expect(voting.currentEstimationQuestion).not.toHaveProperty('correctAnswer');

    const answer = validAnswer(voting);
    manager.submitEstimationAnswer('socket-host', answer);
    expect(manager.getSnapshotForSocket('socket-host')?.ownEstimationAnswer).toBe(answer);
    expect(manager.getSnapshotForSocket('socket-guest-1')?.ownEstimationAnswer).toBeUndefined();
    expect(manager.getSnapshot(host.roomCode)?.ownEstimationAnswer).toBeUndefined();
    expect(() => manager.submitEstimationAnswer('socket-host', answer))
      .toThrowError(expect.objectContaining<Partial<PartyGameError>>({ code: 'ALREADY_ANSWERED' }));

    manager.submitEstimationAnswer('socket-guest-1', validAnswer(voting));
    const result = manager.getSnapshot(host.roomCode)!;
    expect(result.status).toBe('result');
    expect(result.estimationRoundResult?.correctAnswer).toBeDefined();
    expect(result.estimationRoundResult?.answers).toHaveLength(2);
    expect(() => manager.nextQuestion('socket-guest-1'))
      .toThrowError(expect.objectContaining<Partial<PartyGameError>>({ code: 'HOST_ONLY' }));
    manager.destroy();
    void guests;
  });

  it('wartet nach der Auflösung ohne automatischen Fragenwechsel auf den Host', () => {
    vi.useFakeTimers();
    const { manager, host } = createEstimationRoom();
    manager.startGame('socket-host', true);
    const voting = manager.getSnapshot(host.roomCode)!;
    const answer = validAnswer(voting);
    manager.submitEstimationAnswer('socket-host', answer);
    manager.submitEstimationAnswer('socket-guest-1', answer);
    expect(manager.getSnapshot(host.roomCode)?.status).toBe('result');

    vi.advanceTimersByTime(30_000);
    expect(manager.getSnapshot(host.roomCode)?.status).toBe('result');
    manager.nextQuestion('socket-host');
    expect(manager.getSnapshot(host.roomCode)?.currentRound).toBe(2);
    manager.destroy();
  });

  it('löst eine Schätzfrage nach Ablauf des gewählten Timers synchron auf', () => {
    vi.useFakeTimers();
    const { manager, host } = createEstimationRoom();
    manager.updateEstimationSettings('socket-host', { timerSeconds: 5 });
    manager.startGame('socket-host', true);
    const voting = manager.getSnapshot(host.roomCode)!;
    expect(voting.deadline).toBe(Date.now() + 5_000);

    manager.submitEstimationAnswer('socket-host', validAnswer(voting));
    vi.advanceTimersByTime(4_999);
    expect(manager.getSnapshot(host.roomCode)?.status).toBe('voting');
    vi.advanceTimersByTime(1);

    const result = manager.getSnapshot(host.roomCode)!;
    expect(result.status).toBe('result');
    expect(result.deadline).toBeUndefined();
    expect(result.estimationRoundResult?.answers).toHaveLength(1);
    manager.destroy();
  });

  it('verwendet während fünf Runden keine Schätzfrage doppelt', () => {
    const { manager, host } = createEstimationRoom();
    manager.startGame('socket-host', true);
    const ids = new Set<string>();

    for (let round = 0; round < 5; round += 1) {
      const voting = manager.getSnapshot(host.roomCode)!;
      expect(ids.has(voting.currentEstimationQuestion!.id)).toBe(false);
      ids.add(voting.currentEstimationQuestion!.id);
      const answer = validAnswer(voting);
      manager.submitEstimationAnswer('socket-host', answer);
      manager.submitEstimationAnswer('socket-guest-1', answer);
      manager.nextQuestion('socket-host');
    }

    expect(manager.getSnapshot(host.roomCode)?.status).toBe('finished');
    expect(ids.size).toBe(5);
    expect(manager.getSnapshot(host.roomCode)?.estimationStatistics?.ranking).toHaveLength(2);
    manager.destroy();
  });

  it('blockiert eine Runde nicht, wenn eine noch antwortende Person die Verbindung verliert', () => {
    const { manager, host } = createEstimationRoom(3);
    manager.startGame('socket-host', true);
    const voting = manager.getSnapshot(host.roomCode)!;
    const answer = validAnswer(voting);
    manager.submitEstimationAnswer('socket-host', answer);
    manager.submitEstimationAnswer('socket-guest-1', answer);

    manager.handleDisconnect('socket-guest-2');
    const result = manager.getSnapshot(host.roomCode)!;
    expect(result.status).toBe('result');
    expect(result.estimationRoundResult?.answers).toHaveLength(2);
    expect(result.hostId).toBe(host.playerId);
    manager.destroy();
  });

  it('stellt nach einem kurzen Abbruch die eigene gespeicherte Antwort wieder her', () => {
    const { manager, host } = createEstimationRoom();
    manager.startGame('socket-host', true);
    const answer = validAnswer(manager.getSnapshot(host.roomCode)!);
    manager.submitEstimationAnswer('socket-host', answer);
    manager.handleDisconnect('socket-host');

    const reconnect = manager.reconnect(
      host.roomCode,
      host.playerId,
      host.sessionToken,
      'socket-host-new',
    );
    expect(reconnect.room.status).toBe('voting');
    expect(reconnect.room.ownEstimationAnswer).toBe(answer);
    expect(reconnect.room.answersSubmitted).toBe(1);
    manager.destroy();
  });
});
