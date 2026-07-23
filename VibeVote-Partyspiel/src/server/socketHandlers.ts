import type { Server, Socket } from 'socket.io';
import type { Ack, AppError, RoomSettings } from '../shared/types';
import { PartyGameError, RoomManager } from './RoomManager';

type AckCallback<T = void> = (response: Ack<T>) => void;

function appError(error: unknown): AppError {
  if (error instanceof PartyGameError) {
    return { code: error.code, message: error.message };
  }
  console.error(error);
  return { code: 'INTERNAL_ERROR', message: 'Unerwarteter Serverfehler. Bitte versuche es erneut.' };
}

function handle<T>(callback: AckCallback<T>, action: () => T): void {
  try {
    callback({ ok: true, data: action() });
  } catch (error) {
    callback({ ok: false, error: appError(error) });
  }
}

export function registerSocketHandlers(io: Server, roomManager: RoomManager): void {
  roomManager.on('changed', (roomCode: string) => {
    const snapshot = roomManager.getSnapshot(roomCode);
    if (snapshot) io.to(roomCode).emit('room:state', snapshot);
  });
  roomManager.on('notice', (roomCode: string, notice) => {
    io.to(roomCode).emit('room:notice', notice);
  });
  roomManager.on('roomClosed', (roomCode: string, message: string) => {
    io.to(roomCode).emit('room:closed', { message });
    io.in(roomCode).socketsLeave(roomCode);
  });
  roomManager.on('playerKicked', (socketId: string, roomCode: string, message: string) => {
    const kickedSocket = io.sockets.sockets.get(socketId);
    kickedSocket?.emit('player:kicked', { message });
    kickedSocket?.leave(roomCode);
  });

  io.on('connection', (socket: Socket) => {
    socket.on('room:create', (
      payload: { name: string },
      callback: AckCallback<ReturnType<RoomManager['createRoom']>>,
    ) => {
      handle(callback, () => {
        const response = roomManager.createRoom(payload?.name ?? '', socket.id);
        socket.join(response.roomCode);
        return response;
      });
    });

    socket.on('room:join', (
      payload: { code: string; name: string },
      callback: AckCallback<ReturnType<RoomManager['joinRoom']>>,
    ) => {
      handle(callback, () => {
        const response = roomManager.joinRoom(payload?.code ?? '', payload?.name ?? '', socket.id);
        socket.join(response.roomCode);
        return response;
      });
    });

    socket.on('room:reconnect', (
      payload: { roomCode: string; playerId: string; sessionToken: string },
      callback: AckCallback<ReturnType<RoomManager['reconnect']>>,
    ) => {
      handle(callback, () => {
        const response = roomManager.reconnect(
          payload?.roomCode ?? '',
          payload?.playerId ?? '',
          payload?.sessionToken ?? '',
          socket.id,
        );
        socket.join(response.roomCode);
        if (response.previousSocketId) {
          const previousSocket = io.sockets.sockets.get(response.previousSocketId);
          previousSocket?.emit('session:replaced');
          previousSocket?.disconnect(true);
        }
        return response;
      });
    });

    socket.on('room:update-settings', (payload: Partial<RoomSettings>, callback: AckCallback) => {
      handle(callback, () => roomManager.updateSettings(socket.id, payload ?? {}));
    });
    socket.on('room:kick', (payload: { playerId: string }, callback: AckCallback) => {
      handle(callback, () => roomManager.kickPlayer(socket.id, payload?.playerId ?? ''));
    });
    socket.on('room:leave', (_payload: undefined, callback: AckCallback) => {
      handle(callback, () => {
        const result = roomManager.leave(socket.id);
        socket.leave(result.roomCode);
      });
    });
    socket.on('room:close', (_payload: undefined, callback: AckCallback) => {
      handle(callback, () => roomManager.closeRoom(socket.id));
    });
    socket.on('game:start', (payload: { acceptedResponsibility: boolean }, callback: AckCallback) => {
      handle(callback, () => roomManager.startGame(socket.id, Boolean(payload?.acceptedResponsibility)));
    });
    socket.on('game:vote', (payload: { targetPlayerId: string }, callback: AckCallback) => {
      handle(callback, () => roomManager.submitVote(socket.id, payload?.targetPlayerId ?? ''));
    });
    socket.on('game:reveal', (_payload: undefined, callback: AckCallback) => {
      handle(callback, () => roomManager.revealResult(socket.id));
    });
    socket.on('game:next', (_payload: undefined, callback: AckCallback) => {
      handle(callback, () => roomManager.nextQuestion(socket.id));
    });
    socket.on('game:end', (_payload: undefined, callback: AckCallback) => {
      handle(callback, () => roomManager.endGame(socket.id));
    });
    socket.on('game:restart', (_payload: undefined, callback: AckCallback) => {
      handle(callback, () => roomManager.restartGame(socket.id));
    });
    socket.on('game:return-lobby', (_payload: undefined, callback: AckCallback) => {
      handle(callback, () => roomManager.returnToLobby(socket.id));
    });

    socket.on('disconnect', () => roomManager.handleDisconnect(socket.id));
  });
}
