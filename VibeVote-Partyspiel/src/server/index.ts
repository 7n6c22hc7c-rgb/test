import { existsSync } from 'node:fs';
import { createServer as createHttpServer } from 'node:http';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import express from 'express';
import { Server } from 'socket.io';
import { questions } from '../shared/questions';
import { RoomManager } from './RoomManager';
import { registerSocketHandlers } from './socketHandlers';

export interface PartyServerOptions {
  disconnectGraceMs?: number;
  random?: () => number;
  serveClient?: boolean;
}

export function createPartyServer(options: PartyServerOptions = {}) {
  const app = express();
  const httpServer = createHttpServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: true,
      credentials: true,
    },
  });
  const roomManager = new RoomManager(options.disconnectGraceMs, options.random);

  app.disable('x-powered-by');
  app.get('/api/health', (_request, response) => {
    response.json({ status: 'ok', questions: questions.length });
  });

  const clientDirectory = resolve(process.cwd(), 'dist/client');
  if (options.serveClient !== false && existsSync(clientDirectory)) {
    app.use(express.static(clientDirectory));
    app.use((request, response, next) => {
      if (request.method !== 'GET' || !request.accepts('html')) {
        next();
        return;
      }
      response.sendFile(resolve(clientDirectory, 'index.html'));
    });
  }

  registerSocketHandlers(io, roomManager);

  return {
    app,
    httpServer,
    io,
    roomManager,
    async start(port = 3001): Promise<number> {
      await new Promise<void>((resolveStart, rejectStart) => {
        httpServer.once('error', rejectStart);
        httpServer.listen(port, '0.0.0.0', () => {
          httpServer.off('error', rejectStart);
          resolveStart();
        });
      });
      const address = httpServer.address();
      return typeof address === 'object' && address ? address.port : port;
    },
    async stop(): Promise<void> {
      roomManager.destroy();
      await new Promise<void>((resolveStop) => io.close(() => resolveStop()));
    },
  };
}

const executedFile = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : '';
if (import.meta.url === executedFile) {
  const server = createPartyServer();
  const port = Number(process.env.PORT) || 3001;
  server.start(port).then((actualPort) => {
    console.log(`VibeVote server listening on http://localhost:${actualPort}`);
  });
}
