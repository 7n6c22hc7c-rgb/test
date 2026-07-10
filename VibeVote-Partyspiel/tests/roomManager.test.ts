import { afterEach, describe, expect, it, vi } from 'vitest';
import { PartyGameError, RoomManager } from '../src/server/RoomManager';

describe('RoomManager', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('verwendet in einer Partie keine Frage doppelt', () => {
    const manager = new RoomManager(60_000, () => 0.314159);
    const host = manager.createRoom('Host', 'socket-host');
    const guest = manager.joinRoom(host.roomCode, 'Gast', 'socket-guest');
    manager.startGame('socket-host', true);
    const seenQuestionIds = new Set<string>();

    for (let round = 0; round < 10; round += 1) {
      const voting = manager.getSnapshot(host.roomCode)!;
      expect(voting.status).toBe('voting');
      expect(seenQuestionIds.has(voting.currentQuestion!.id)).toBe(false);
      seenQuestionIds.add(voting.currentQuestion!.id);

      manager.submitVote('socket-host', guest.playerId);
      manager.submitVote('socket-guest', host.playerId);
      manager.revealResult('socket-host');
      manager.nextQuestion('socket-host');
    }

    const finished = manager.getSnapshot(host.roomCode)!;
    expect(finished.status).toBe('finished');
    expect(finished.playedQuestions).toBe(10);
    expect(seenQuestionIds.size).toBe(10);
    manager.destroy();
  });

  it('weist doppelte Namen unabhängig von Groß- und Kleinschreibung zurück', () => {
    const manager = new RoomManager();
    const host = manager.createRoom('Moritz', 'socket-host');

    expect(() => manager.joinRoom(host.roomCode, 'moritz', 'socket-guest'))
      .toThrowError(expect.objectContaining<Partial<PartyGameError>>({ code: 'NAME_TAKEN' }));
    manager.destroy();
  });

  it('löst nach Ablauf des Timers auch eine unvollständige Abstimmung auf', () => {
    vi.useFakeTimers();
    const manager = new RoomManager();
    const host = manager.createRoom('Host', 'socket-host');
    const guest = manager.joinRoom(host.roomCode, 'Gast', 'socket-guest');
    manager.updateSettings('socket-host', { timerSeconds: 20 });
    manager.startGame('socket-host', true);
    manager.submitVote('socket-host', guest.playerId);

    vi.advanceTimersByTime(20_000);

    const snapshot = manager.getSnapshot(host.roomCode)!;
    expect(snapshot.status).toBe('result');
    expect(snapshot.roundResult?.totalVotes).toBe(1);
    expect(snapshot.roundResult?.winners[0].playerId).toBe(guest.playerId);
    manager.destroy();
  });

  it('übergibt die Host-Rolle bei einem Verbindungsabbruch', () => {
    const manager = new RoomManager();
    const host = manager.createRoom('Host', 'socket-host');
    const guest = manager.joinRoom(host.roomCode, 'Gast', 'socket-guest');

    manager.handleDisconnect('socket-host');

    const snapshot = manager.getSnapshot(host.roomCode)!;
    expect(snapshot.hostId).toBe(guest.playerId);
    expect(snapshot.players.find((player) => player.playerId === host.playerId)?.connected).toBe(false);
    manager.destroy();
  });
});
