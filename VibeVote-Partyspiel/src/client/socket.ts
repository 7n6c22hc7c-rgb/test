import { io } from 'socket.io-client';
import type { Ack } from '../shared/types';

export class ClientActionError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ClientActionError';
  }
}

export const socket = io({
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 500,
  reconnectionDelayMax: 4_000,
});

export function emitWithAck<T>(event: string, payload?: unknown): Promise<T> {
  return new Promise((resolve, reject) => {
    socket.timeout(7_000).emit(event, payload, (timeoutError: Error | null, response?: Ack<T>) => {
      if (timeoutError) {
        reject(new ClientActionError('TIMEOUT', 'Der Server antwortet gerade nicht. Prüfe deine Verbindung.'));
        return;
      }
      if (!response) {
        reject(new ClientActionError('EMPTY_RESPONSE', 'Der Server hat keine gültige Antwort gesendet.'));
        return;
      }
      if (!response.ok) {
        reject(new ClientActionError(response.error.code, response.error.message));
        return;
      }
      resolve(response.data);
    });
  });
}
