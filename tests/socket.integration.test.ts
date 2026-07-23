import { type Socket, io as createClient } from 'socket.io-client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { Ack, RoomSnapshot, SessionResponse } from '../src/shared/types';
import { createPartyServer } from '../src/server/index';

type TestServer = ReturnType<typeof createPartyServer>;

function connectClient(url: string): Promise<Socket> {
  return new Promise((resolve, reject) => {
    const client = createClient(url, {
      transports: ['websocket'],
      forceNew: true,
      reconnection: false,
    });
    client.once('connect', () => resolve(client));
    client.once('connect_error', reject);
  });
}

function emitAck<T>(client: Socket, event: string, payload?: unknown): Promise<Ack<T>> {
  return new Promise((resolve, reject) => {
    client.timeout(2_000).emit(event, payload, (error: Error | null, response: Ack<T>) => {
      if (error) reject(error);
      else resolve(response);
    });
  });
}

function nextRoomState(client: Socket, predicate: (room: RoomSnapshot) => boolean): Promise<RoomSnapshot> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      client.off('room:state', listener);
      reject(new Error('Timed out waiting for room state'));
    }, 2_000);
    const listener = (room: RoomSnapshot) => {
      if (!predicate(room)) return;
      clearTimeout(timeout);
      client.off('room:state', listener);
      resolve(room);
    };
    client.on('room:state', listener);
  });
}

describe('Socket.IO Multiplayer-Ablauf', () => {
  let server: TestServer;
  let baseUrl: string;
  const clients: Socket[] = [];

  beforeEach(async () => {
    server = createPartyServer({ serveClient: false, disconnectGraceMs: 100 });
    const port = await server.start(0);
    baseUrl = `http://127.0.0.1:${port}`;
  });

  afterEach(async () => {
    clients.forEach((client) => client.disconnect());
    await server.stop();
  });

  it('synchronisiert Lobby, Abstimmung und gemeinsames Ergebnis', async () => {
    const hostClient = await connectClient(baseUrl);
    const guestClient = await connectClient(baseUrl);
    clients.push(hostClient, guestClient);

    const hostAck = await emitAck<SessionResponse>(hostClient, 'room:create', { name: 'Lukas' });
    expect(hostAck.ok).toBe(true);
    if (!hostAck.ok) return;

    const guestAck = await emitAck<SessionResponse>(guestClient, 'room:join', {
      code: hostAck.data.roomCode,
      name: 'Mia',
    });
    expect(guestAck.ok).toBe(true);
    if (!guestAck.ok) return;

    const hostVotingState = nextRoomState(hostClient, (room) => room.status === 'voting');
    const guestVotingState = nextRoomState(guestClient, (room) => room.status === 'voting');
    const startAck = await emitAck<void>(hostClient, 'game:start', { acceptedResponsibility: true });
    expect(startAck.ok).toBe(true);
    const [hostVoting, guestVoting] = await Promise.all([hostVotingState, guestVotingState]);
    expect(hostVoting.currentQuestion?.id).toBe(guestVoting.currentQuestion?.id);

    const hostResultState = nextRoomState(hostClient, (room) => room.status === 'result');
    const guestResultState = nextRoomState(guestClient, (room) => room.status === 'result');
    await emitAck<void>(hostClient, 'game:vote', { targetPlayerId: guestAck.data.playerId });
    await emitAck<void>(guestClient, 'game:vote', { targetPlayerId: hostAck.data.playerId });
    const [hostResult, guestResult] = await Promise.all([hostResultState, guestResultState]);

    expect(hostResult.roundResult).toEqual(guestResult.roundResult);
    expect(hostResult.roundResult?.winners).toHaveLength(2);
    expect(hostResult.roundResult?.totalVotes).toBe(2);

    const hostFinishedState = nextRoomState(hostClient, (room) => room.status === 'finished');
    const guestFinishedState = nextRoomState(guestClient, (room) => room.status === 'finished');
    await emitAck<void>(hostClient, 'game:end');
    const [hostFinished, guestFinished] = await Promise.all([hostFinishedState, guestFinishedState]);
    expect(hostFinished.statistics).toEqual(guestFinished.statistics);
    expect(hostFinished.statistics?.ranking).toHaveLength(2);
  });

  it('liefert verständliche Fehler für unbekannte Räume, doppelte Namen und Host-Aktionen', async () => {
    const hostClient = await connectClient(baseUrl);
    const guestClient = await connectClient(baseUrl);
    const outsiderClient = await connectClient(baseUrl);
    clients.push(hostClient, guestClient, outsiderClient);

    const missingRoom = await emitAck<SessionResponse>(outsiderClient, 'room:join', { code: 'XXXXX', name: 'Noah' });
    expect(missingRoom).toMatchObject({ ok: false, error: { code: 'ROOM_NOT_FOUND' } });
    const missingName = await emitAck<SessionResponse>(outsiderClient, 'room:create', { name: '   ' });
    expect(missingName).toMatchObject({ ok: false, error: { code: 'NAME_REQUIRED' } });

    const hostAck = await emitAck<SessionResponse>(hostClient, 'room:create', { name: 'Lukas' });
    if (!hostAck.ok) throw new Error('Host creation failed');
    const duplicateName = await emitAck<SessionResponse>(outsiderClient, 'room:join', {
      code: hostAck.data.roomCode,
      name: 'lukas',
    });
    expect(duplicateName).toMatchObject({ ok: false, error: { code: 'NAME_TAKEN' } });

    const guestAck = await emitAck<SessionResponse>(guestClient, 'room:join', {
      code: hostAck.data.roomCode,
      name: 'Mia',
    });
    expect(guestAck.ok).toBe(true);
    const forbiddenStart = await emitAck<void>(guestClient, 'game:start', { acceptedResponsibility: true });
    expect(forbiddenStart).toMatchObject({ ok: false, error: { code: 'HOST_ONLY' } });

    await emitAck<void>(hostClient, 'game:start', { acceptedResponsibility: true });
    const lateJoin = await emitAck<SessionResponse>(outsiderClient, 'room:join', {
      code: hostAck.data.roomCode,
      name: 'Noah',
    });
    expect(lateJoin).toMatchObject({ ok: false, error: { code: 'GAME_ALREADY_STARTED' } });
  });

  it('stellt eine Sitzung nach einem kurzen Abbruch wieder her', async () => {
    const firstClient = await connectClient(baseUrl);
    clients.push(firstClient);
    const createAck = await emitAck<SessionResponse>(firstClient, 'room:create', { name: 'Lena' });
    if (!createAck.ok) throw new Error('Room creation failed');
    firstClient.disconnect();

    const reconnectedClient = await connectClient(baseUrl);
    clients.push(reconnectedClient);
    const reconnectAck = await emitAck<SessionResponse>(reconnectedClient, 'room:reconnect', {
      roomCode: createAck.data.roomCode,
      playerId: createAck.data.playerId,
      sessionToken: createAck.data.sessionToken,
    });

    expect(reconnectAck.ok).toBe(true);
    if (reconnectAck.ok) {
      expect(reconnectAck.data.room.players).toHaveLength(1);
      expect(reconnectAck.data.room.players[0].connected).toBe(true);
    }
  });
});
