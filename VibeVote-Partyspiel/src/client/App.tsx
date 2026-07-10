import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  RoomSettings,
  RoomSnapshot,
  ServerNotice,
  SessionIdentity,
  SessionResponse,
} from '../shared/types';
import { AppShell } from './components/AppShell';
import { FinishedScreen } from './screens/FinishedScreen';
import { GameScreen } from './screens/GameScreen';
import { HomeScreen } from './screens/HomeScreen';
import { LobbyScreen } from './screens/LobbyScreen';
import { ClientActionError, emitWithAck, socket } from './socket';

const SESSION_STORAGE_KEY = 'vibevote-session-v1';

function loadStoredIdentity(): SessionIdentity | undefined {
  try {
    const value = localStorage.getItem(SESSION_STORAGE_KEY);
    return value ? JSON.parse(value) as SessionIdentity : undefined;
  } catch {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    return undefined;
  }
}

function storeIdentity(identity: SessionIdentity): void {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(identity));
}

export default function App() {
  const [identity, setIdentity] = useState<SessionIdentity | undefined>(() => loadStoredIdentity());
  const identityRef = useRef(identity);
  const [room, setRoom] = useState<RoomSnapshot>();
  const [connected, setConnected] = useState(socket.connected);
  const [reconnecting, setReconnecting] = useState(Boolean(identity));
  const [busy, setBusy] = useState(false);
  const [homeError, setHomeError] = useState<string>();
  const [toast, setToast] = useState<ServerNotice>();
  const reconnectSocketId = useRef<string | undefined>(undefined);

  useEffect(() => {
    identityRef.current = identity;
  }, [identity]);

  const clearSession = useCallback((message?: string) => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    identityRef.current = undefined;
    setIdentity(undefined);
    setRoom(undefined);
    setReconnecting(false);
    if (message) setHomeError(message);
  }, []);

  const resumeSession = useCallback(async () => {
    const saved = identityRef.current;
    if (!saved || !socket.id || reconnectSocketId.current === socket.id) {
      setReconnecting(false);
      return;
    }
    reconnectSocketId.current = socket.id;
    setReconnecting(true);
    try {
      const response = await emitWithAck<SessionResponse>('room:reconnect', saved);
      setRoom(response.room);
      setIdentity(saved);
      setHomeError(undefined);
    } catch (error) {
      if (error instanceof ClientActionError && ['ROOM_NOT_FOUND', 'INVALID_SESSION'].includes(error.code)) {
        clearSession('Deine vorherige Spielsitzung ist nicht mehr aktiv. Du kannst einen neuen Raum öffnen oder beitreten.');
      } else {
        setToast({ type: 'warning', message: error instanceof Error ? error.message : 'Wiederverbindung fehlgeschlagen.' });
      }
    } finally {
      setReconnecting(false);
    }
  }, [clearSession]);

  useEffect(() => {
    const onConnect = () => {
      setConnected(true);
      void resumeSession();
    };
    const onDisconnect = () => setConnected(false);
    const onRoomState = (nextRoom: RoomSnapshot) => {
      if (identityRef.current?.roomCode === nextRoom.code) setRoom(nextRoom);
    };
    const onNotice = (notice: ServerNotice) => setToast(notice);
    const onClosed = ({ message }: { message: string }) => clearSession(message);
    const onKicked = ({ message }: { message: string }) => clearSession(message);
    const onSessionReplaced = () => {
      identityRef.current = undefined;
      setIdentity(undefined);
      setRoom(undefined);
      setHomeError('Diese Sitzung wurde in einem anderen Browserfenster geöffnet.');
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('room:state', onRoomState);
    socket.on('room:notice', onNotice);
    socket.on('room:closed', onClosed);
    socket.on('player:kicked', onKicked);
    socket.on('session:replaced', onSessionReplaced);

    if (socket.connected) void resumeSession();

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('room:state', onRoomState);
      socket.off('room:notice', onNotice);
      socket.off('room:closed', onClosed);
      socket.off('player:kicked', onKicked);
      socket.off('session:replaced', onSessionReplaced);
    };
  }, [clearSession, resumeSession]);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(undefined), 4_500);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const establishSession = async (event: 'room:create' | 'room:join', payload: unknown) => {
    setBusy(true);
    setHomeError(undefined);
    try {
      const response = await emitWithAck<SessionResponse>(event, payload);
      const nextIdentity: SessionIdentity = {
        roomCode: response.roomCode,
        playerId: response.playerId,
        playerName: response.playerName,
        sessionToken: response.sessionToken,
      };
      storeIdentity(nextIdentity);
      identityRef.current = nextIdentity;
      setIdentity(nextIdentity);
      setRoom(response.room);
    } catch (error) {
      setHomeError(error instanceof Error ? error.message : 'Die Aktion konnte nicht ausgeführt werden.');
    } finally {
      setBusy(false);
    }
  };

  const action = useCallback(async (event: string, payload?: unknown) => {
    try {
      await emitWithAck(event, payload);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Die Aktion konnte nicht ausgeführt werden.';
      setToast({ type: 'warning', message });
      throw error;
    }
  }, []);

  const leave = async () => {
    if (room && (room.status === 'voting' || room.status === 'result')) {
      const confirmed = window.confirm('Du verlässt ein laufendes Spiel. Möchtest du wirklich fortfahren?');
      if (!confirmed) return;
    }
    try {
      await emitWithAck('room:leave');
      clearSession();
    } catch (error) {
      setToast({ type: 'warning', message: error instanceof Error ? error.message : 'Verlassen fehlgeschlagen.' });
    }
  };

  const closeRoom = async () => {
    if (!window.confirm('Möchtest du den Raum wirklich für alle schließen?')) return;
    try {
      await emitWithAck('room:close');
      clearSession();
    } catch (error) {
      setToast({ type: 'warning', message: error instanceof Error ? error.message : 'Schließen fehlgeschlagen.' });
    }
  };

  let content;
  if (!identity || !room) {
    content = (
      <HomeScreen
        busy={busy || reconnecting}
        error={homeError}
        onCreate={(name) => establishSession('room:create', { name })}
        onJoin={(code, name) => establishSession('room:join', { code, name })}
      />
    );
  } else if (room.status === 'lobby') {
    content = (
      <LobbyScreen
        room={room}
        playerId={identity.playerId}
        onUpdateSettings={(settings: Partial<RoomSettings>) => action('room:update-settings', settings)}
        onStart={(acceptedResponsibility) => action('game:start', { acceptedResponsibility })}
        onKick={async (playerId) => {
          const player = room.players.find((entry) => entry.playerId === playerId);
          if (window.confirm(`${player?.name ?? 'Diese Person'} wirklich entfernen?`)) {
            await action('room:kick', { playerId });
          }
        }}
        onClose={closeRoom}
        onLeave={leave}
      />
    );
  } else if (room.status === 'finished') {
    content = (
      <FinishedScreen
        room={room}
        playerId={identity.playerId}
        onRestart={() => action('game:restart')}
        onReturnLobby={() => action('game:return-lobby')}
        onLeave={leave}
      />
    );
  } else {
    content = (
      <GameScreen
        room={room}
        playerId={identity.playerId}
        onVote={(targetPlayerId) => action('game:vote', { targetPlayerId })}
        onReveal={() => action('game:reveal')}
        onNext={() => action('game:next')}
        onEnd={async () => {
          if (window.confirm('Möchtest du das Spiel jetzt beenden und die Statistik anzeigen?')) {
            await action('game:end');
          }
        }}
        onLeave={leave}
      />
    );
  }

  return (
    <AppShell
      connected={connected}
      reconnecting={reconnecting}
      toast={toast}
      onDismissToast={() => setToast(undefined)}
    >
      {content}
    </AppShell>
  );
}
