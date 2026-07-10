import { randomInt, randomUUID } from 'node:crypto';
import { EventEmitter } from 'node:events';
import { questions } from '../shared/questions';
import type {
  GameId,
  PlayerStats,
  RoomSettings,
  RoomSnapshot,
  RoundResult,
  ServerNotice,
  SessionResponse,
} from '../shared/types';
import { buildGameStatistics, calculateRoundResult, shuffle } from './gameUtils';

const ROOM_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const DEFAULT_SETTINGS: RoomSettings = {
  roundLimit: 10,
  allowSelfVote: true,
  timerSeconds: 20,
};

interface InternalPlayer {
  id: string;
  sessionToken: string;
  name: string;
  socketId?: string;
  connected: boolean;
  joinedAt: number;
  disconnectTimer?: NodeJS.Timeout;
  stats: PlayerStats;
}

interface InternalRoom {
  code: string;
  hostId: string;
  players: Map<string, InternalPlayer>;
  status: RoomSnapshot['status'];
  selectedGame: GameId;
  settings: RoomSettings;
  questionOrder: typeof questions[number][];
  currentIndex: number;
  completedRounds: number;
  votes: Map<string, string>;
  roundResult?: RoundResult;
  deadline?: number;
  voteTimer?: NodeJS.Timeout;
  endReason?: RoomSnapshot['endReason'];
  createdAt: number;
}

interface SocketContext {
  room: InternalRoom;
  player: InternalPlayer;
}

export interface ReconnectResponse extends SessionResponse {
  previousSocketId?: string;
}

export class PartyGameError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'PartyGameError';
  }
}

/**
 * Autoritative In-Memory-Verwaltung aller Räume. Der Browser erhält nur
 * öffentliche Snapshots; Stimmen und Sitzungstokens bleiben auf dem Server.
 */
export class RoomManager extends EventEmitter {
  private readonly rooms = new Map<string, InternalRoom>();
  private readonly socketIndex = new Map<string, { roomCode: string; playerId: string }>();

  constructor(
    private readonly disconnectGraceMs = 60_000,
    private readonly random: () => number = Math.random,
  ) {
    super();
  }

  createRoom(rawName: string, socketId: string): SessionResponse {
    const name = this.validateName(rawName);
    const code = this.generateRoomCode();
    const player = this.createPlayer(name, socketId);
    const room: InternalRoom = {
      code,
      hostId: player.id,
      players: new Map([[player.id, player]]),
      status: 'lobby',
      selectedGame: 'would-you-rather',
      settings: { ...DEFAULT_SETTINGS },
      questionOrder: [],
      currentIndex: 0,
      completedRounds: 0,
      votes: new Map(),
      createdAt: Date.now(),
    };

    this.rooms.set(code, room);
    this.socketIndex.set(socketId, { roomCode: code, playerId: player.id });
    this.emitChanged(code);
    return this.createSessionResponse(room, player);
  }

  joinRoom(rawCode: string, rawName: string, socketId: string): SessionResponse {
    const code = this.normalizeRoomCode(rawCode);
    const name = this.validateName(rawName);
    const room = this.requireRoom(code);

    if (room.status !== 'lobby') {
      throw new PartyGameError('GAME_ALREADY_STARTED', 'Das Spiel in diesem Raum hat bereits begonnen.');
    }
    if (room.players.size >= 20) {
      throw new PartyGameError('ROOM_FULL', 'Dieser Raum ist bereits voll.');
    }
    if ([...room.players.values()].some((player) => player.name.localeCompare(name, 'de', { sensitivity: 'base' }) === 0)) {
      throw new PartyGameError('NAME_TAKEN', 'Dieser Spielername ist im Raum bereits vergeben.');
    }

    const player = this.createPlayer(name, socketId);
    room.players.set(player.id, player);
    this.socketIndex.set(socketId, { roomCode: code, playerId: player.id });
    this.emitNotice(code, { type: 'info', message: `${name} ist dem Raum beigetreten.` });
    this.emitChanged(code);
    return this.createSessionResponse(room, player);
  }

  reconnect(
    rawCode: string,
    playerId: string,
    sessionToken: string,
    socketId: string,
  ): ReconnectResponse {
    const code = this.normalizeRoomCode(rawCode);
    const room = this.requireRoom(code);
    const player = room.players.get(playerId);

    if (!player || player.sessionToken !== sessionToken) {
      throw new PartyGameError('INVALID_SESSION', 'Die gespeicherte Spielsitzung ist nicht mehr gültig.');
    }

    const previousSocketId = player.socketId && player.socketId !== socketId
      ? player.socketId
      : undefined;
    if (previousSocketId) {
      this.socketIndex.delete(previousSocketId);
    }
    if (player.disconnectTimer) {
      clearTimeout(player.disconnectTimer);
      player.disconnectTimer = undefined;
    }

    player.socketId = socketId;
    player.connected = true;
    this.socketIndex.set(socketId, { roomCode: code, playerId });

    if (!room.players.has(room.hostId)) {
      room.hostId = player.id;
    }

    this.emitNotice(code, { type: 'success', message: `${player.name} ist wieder verbunden.` });
    this.emitChanged(code);
    return {
      ...this.createSessionResponse(room, player),
      previousSocketId,
    };
  }

  updateSettings(socketId: string, update: Partial<RoomSettings>): void {
    const { room, player } = this.requireSocketContext(socketId);
    this.requireHost(room, player);
    this.requireStatus(room, 'lobby');

    const nextSettings = { ...room.settings, ...update };
    if (![10, 20, 30, 40, 50, 60].includes(nextSettings.roundLimit)) {
      throw new PartyGameError('INVALID_SETTINGS', 'Die gewählte Rundenzahl ist ungültig.');
    }
    if (![10, 20, 30].includes(nextSettings.timerSeconds)) {
      throw new PartyGameError('INVALID_SETTINGS', 'Der gewählte Timer ist ungültig.');
    }

    room.settings = nextSettings;
    this.emitChanged(room.code);
  }

  startGame(socketId: string, acceptedResponsibility: boolean): void {
    const { room, player } = this.requireSocketContext(socketId);
    this.requireHost(room, player);
    this.requireStatus(room, 'lobby');

    if (!acceptedResponsibility) {
      throw new PartyGameError('NOTICE_REQUIRED', 'Bitte bestätige zuerst den Hinweis zum verantwortungsvollen Spielen.');
    }
    if (this.connectedPlayers(room).length < 2) {
      throw new PartyGameError('NOT_ENOUGH_PLAYERS', 'Mindestens zwei verbundene Personen werden zum Starten benötigt.');
    }

    this.beginNewGame(room);
  }

  submitVote(socketId: string, targetPlayerId: string): void {
    const { room, player } = this.requireSocketContext(socketId);
    this.requireStatus(room, 'voting');

    if (room.votes.has(player.id)) {
      throw new PartyGameError('ALREADY_VOTED', 'Du hast deine Stimme für diese Runde bereits bestätigt.');
    }
    const target = room.players.get(targetPlayerId);
    if (!target || !target.connected) {
      throw new PartyGameError('INVALID_TARGET', 'Diese Person steht aktuell nicht zur Abstimmung.');
    }
    if (!room.settings.allowSelfVote && target.id === player.id) {
      throw new PartyGameError('SELF_VOTE_DISABLED', 'In diesem Raum darfst du nicht für dich selbst stimmen.');
    }

    room.votes.set(player.id, target.id);
    this.emitChanged(room.code);
  }

  revealResult(socketId: string): void {
    const { room, player } = this.requireSocketContext(socketId);
    this.requireHost(room, player);
    this.revealRoom(room, false);
  }

  nextQuestion(socketId: string): void {
    const { room, player } = this.requireSocketContext(socketId);
    this.requireHost(room, player);
    this.requireStatus(room, 'result');

    if (room.completedRounds >= room.questionOrder.length) {
      this.finishRoom(room, 'completed');
      return;
    }

    room.currentIndex += 1;
    this.startVoting(room);
  }

  endGame(socketId: string): void {
    const { room, player } = this.requireSocketContext(socketId);
    this.requireHost(room, player);
    if (room.status !== 'voting' && room.status !== 'result') {
      throw new PartyGameError('INVALID_GAME_STATE', 'Das Spiel kann gerade nicht beendet werden.');
    }
    this.finishRoom(room, 'host-ended');
  }

  restartGame(socketId: string): void {
    const { room, player } = this.requireSocketContext(socketId);
    this.requireHost(room, player);
    this.requireStatus(room, 'finished');

    if (this.connectedPlayers(room).length < 2) {
      throw new PartyGameError('NOT_ENOUGH_PLAYERS', 'Mindestens zwei verbundene Personen werden für eine neue Runde benötigt.');
    }
    this.beginNewGame(room);
  }

  returnToLobby(socketId: string): void {
    const { room, player } = this.requireSocketContext(socketId);
    this.requireHost(room, player);
    if (room.status !== 'finished') {
      throw new PartyGameError('INVALID_GAME_STATE', 'Zur Spielauswahl kannst du erst nach dem Spiel zurückkehren.');
    }

    this.resetGame(room);
    room.status = 'lobby';
    this.resetPlayerStats(room);
    this.emitChanged(room.code);
  }

  kickPlayer(socketId: string, targetPlayerId: string): void {
    const { room, player } = this.requireSocketContext(socketId);
    this.requireHost(room, player);
    this.requireStatus(room, 'lobby');

    if (targetPlayerId === player.id) {
      throw new PartyGameError('CANNOT_KICK_SELF', 'Verlasse oder schließe den Raum, um selbst auszuscheiden.');
    }
    const target = room.players.get(targetPlayerId);
    if (!target) {
      throw new PartyGameError('PLAYER_NOT_FOUND', 'Diese Person ist nicht mehr im Raum.');
    }

    const targetSocketId = target.socketId;
    this.removePlayer(room, target.id);
    if (targetSocketId) {
      this.emit('playerKicked', targetSocketId, room.code, 'Du wurdest vom Host aus dem Raum entfernt.');
    }
    this.emitNotice(room.code, { type: 'warning', message: `${target.name} wurde aus dem Raum entfernt.` });
    this.emitChanged(room.code);
  }

  closeRoom(socketId: string): void {
    const { room, player } = this.requireSocketContext(socketId);
    this.requireHost(room, player);
    this.closeAndDeleteRoom(room, 'Der Host hat den Raum geschlossen.');
  }

  leave(socketId: string): { roomCode: string; roomDeleted: boolean } {
    const { room, player } = this.requireSocketContext(socketId);
    const wasHost = room.hostId === player.id;
    const name = player.name;
    this.removePlayer(room, player.id);

    if (room.players.size === 0) {
      this.deleteRoom(room);
      return { roomCode: room.code, roomDeleted: true };
    }

    if (wasHost) {
      this.transferHost(room);
    }
    this.emitNotice(room.code, { type: 'warning', message: `${name} hat den Raum verlassen.` });
    this.emitChanged(room.code);
    return { roomCode: room.code, roomDeleted: false };
  }

  handleDisconnect(socketId: string): void {
    const indexed = this.socketIndex.get(socketId);
    if (!indexed) return;

    this.socketIndex.delete(socketId);
    const room = this.rooms.get(indexed.roomCode);
    const player = room?.players.get(indexed.playerId);
    if (!room || !player || player.socketId !== socketId) return;

    player.connected = false;
    player.socketId = undefined;

    if (room.hostId === player.id && this.connectedPlayers(room).length > 0) {
      this.transferHost(room);
    }

    player.disconnectTimer = setTimeout(() => {
      const currentRoom = this.rooms.get(room.code);
      const currentPlayer = currentRoom?.players.get(player.id);
      if (!currentRoom || !currentPlayer || currentPlayer.connected) return;

      const wasHost = currentRoom.hostId === currentPlayer.id;
      this.removePlayer(currentRoom, currentPlayer.id);
      if (currentRoom.players.size === 0) {
        this.deleteRoom(currentRoom);
        return;
      }
      if (wasHost) this.transferHost(currentRoom);
      this.emitNotice(currentRoom.code, {
        type: 'warning',
        message: `${currentPlayer.name} wurde nach einem Verbindungsabbruch entfernt.`,
      });
      this.emitChanged(currentRoom.code);
    }, this.disconnectGraceMs);
    player.disconnectTimer.unref?.();

    this.emitNotice(room.code, { type: 'warning', message: `Verbindung zu ${player.name} unterbrochen.` });
    this.emitChanged(room.code);
  }

  getSnapshot(code: string): RoomSnapshot | undefined {
    const room = this.rooms.get(code);
    return room ? this.toSnapshot(room) : undefined;
  }

  destroy(): void {
    for (const room of this.rooms.values()) {
      this.clearVoteTimer(room);
      for (const player of room.players.values()) {
        if (player.disconnectTimer) clearTimeout(player.disconnectTimer);
      }
    }
    this.rooms.clear();
    this.socketIndex.clear();
    this.removeAllListeners();
  }

  private beginNewGame(room: InternalRoom): void {
    this.resetGame(room);
    this.resetPlayerStats(room);
    room.questionOrder = shuffle(questions, this.random).slice(0, room.settings.roundLimit);
    room.currentIndex = 0;
    room.completedRounds = 0;
    room.endReason = undefined;
    this.startVoting(room);
  }

  private startVoting(room: InternalRoom): void {
    this.clearVoteTimer(room);
    room.status = 'voting';
    room.votes.clear();
    room.roundResult = undefined;
    room.deadline = Date.now() + room.settings.timerSeconds * 1_000;

    if (room.deadline) {
      room.voteTimer = setTimeout(() => {
        if (room.status === 'voting') {
          this.revealRoom(room, true);
        }
      }, room.settings.timerSeconds * 1_000);
      room.voteTimer.unref?.();
    }
    this.emitChanged(room.code);
  }

  private revealRoom(room: InternalRoom, timerExpired: boolean): void {
    this.requireStatus(room, 'voting');
    const connectedPlayers = this.connectedPlayers(room);
    const allVoted = connectedPlayers.length > 0
      && connectedPlayers.every((player) => room.votes.has(player.id));
    const deadlineReached = room.deadline !== undefined && Date.now() >= room.deadline;

    if (!timerExpired && !allVoted && !deadlineReached) {
      throw new PartyGameError('WAITING_FOR_VOTES', 'Das Ergebnis ist erst verfügbar, wenn alle abgestimmt haben oder der Timer abgelaufen ist.');
    }

    this.clearVoteTimer(room);
    const currentQuestion = room.questionOrder[room.currentIndex];
    if (!currentQuestion) {
      this.finishRoom(room, 'completed');
      return;
    }

    room.roundResult = calculateRoundResult(
      currentQuestion,
      [...room.players.values()].map(({ id, name }) => ({ id, name })),
      room.votes,
    );

    const winnerIds = new Set(room.roundResult.winners.map((winner) => winner.playerId));
    for (const count of room.roundResult.counts) {
      const target = room.players.get(count.playerId);
      if (target) target.stats.votesReceived += count.votes;
    }
    if (winnerIds.size > 0) {
      for (const participant of room.players.values()) {
        if (winnerIds.has(participant.id)) {
          participant.stats.roundsWon += 1;
          participant.stats.sips += 1;
        } else {
          participant.stats.roundsLost += 1;
        }
      }
    }

    room.completedRounds += 1;
    room.status = 'result';
    room.deadline = undefined;
    this.emitChanged(room.code);
  }

  private finishRoom(room: InternalRoom, reason: NonNullable<RoomSnapshot['endReason']>): void {
    this.clearVoteTimer(room);
    room.status = 'finished';
    room.deadline = undefined;
    room.endReason = reason;
    this.emitChanged(room.code);
  }

  private resetGame(room: InternalRoom): void {
    this.clearVoteTimer(room);
    room.questionOrder = [];
    room.currentIndex = 0;
    room.completedRounds = 0;
    room.votes.clear();
    room.roundResult = undefined;
    room.deadline = undefined;
    room.endReason = undefined;
  }

  private resetPlayerStats(room: InternalRoom): void {
    for (const player of room.players.values()) {
      player.stats = this.emptyStats(player.id, player.name);
    }
  }

  private removePlayer(room: InternalRoom, playerId: string): void {
    const player = room.players.get(playerId);
    if (!player) return;
    if (player.disconnectTimer) clearTimeout(player.disconnectTimer);
    if (player.socketId) this.socketIndex.delete(player.socketId);
    room.players.delete(playerId);
    room.votes.delete(playerId);

    // Stimmen für ausgeschiedene Personen werden nicht mehr gewertet.
    for (const [voterId, targetId] of room.votes.entries()) {
      if (targetId === playerId) room.votes.delete(voterId);
    }
  }

  private transferHost(room: InternalRoom): void {
    const candidates = [...room.players.values()].sort((a, b) => a.joinedAt - b.joinedAt);
    const nextHost = candidates.find((candidate) => candidate.connected) ?? candidates[0];
    if (!nextHost || nextHost.id === room.hostId) return;
    room.hostId = nextHost.id;
    this.emitNotice(room.code, {
      type: 'info',
      message: `${nextHost.name} ist jetzt Host des Raumes.`,
    });
  }

  private createPlayer(name: string, socketId: string): InternalPlayer {
    const id = randomUUID();
    return {
      id,
      sessionToken: randomUUID(),
      name,
      socketId,
      connected: true,
      joinedAt: Date.now(),
      stats: this.emptyStats(id, name),
    };
  }

  private emptyStats(playerId: string, name: string): PlayerStats {
    return { playerId, name, votesReceived: 0, roundsWon: 0, roundsLost: 0, sips: 0 };
  }

  private createSessionResponse(room: InternalRoom, player: InternalPlayer): SessionResponse {
    return {
      roomCode: room.code,
      playerId: player.id,
      playerName: player.name,
      sessionToken: player.sessionToken,
      room: this.toSnapshot(room),
    };
  }

  private toSnapshot(room: InternalRoom): RoomSnapshot {
    const activePlayers = this.connectedPlayers(room);
    const allActivePlayersVoted = room.status === 'voting'
      && activePlayers.length > 0
      && activePlayers.every((player) => room.votes.has(player.id));
    const stats = [...room.players.values()].map((player) => ({ ...player.stats }));
    const currentQuestion = room.questionOrder[room.currentIndex];
    const playedQuestions = room.completedRounds;
    const totalRounds = room.questionOrder.length;

    return {
      code: room.code,
      status: room.status,
      hostId: room.hostId,
      selectedGame: room.selectedGame,
      settings: { ...room.settings },
      players: [...room.players.values()]
        .sort((a, b) => a.joinedAt - b.joinedAt)
        .map((player) => ({
          ...player.stats,
          connected: player.connected,
          isHost: player.id === room.hostId,
          hasVoted: room.votes.has(player.id),
        })),
      currentRound: room.status === 'lobby' ? 0 : Math.min(room.currentIndex + 1, totalRounds),
      totalRounds,
      playedQuestions,
      remainingQuestions: Math.max(0, totalRounds - playedQuestions),
      currentQuestion: room.status === 'voting' || room.status === 'result'
        ? currentQuestion
        : undefined,
      votesSubmitted: activePlayers.filter((player) => room.votes.has(player.id)).length,
      activeVoters: activePlayers.length,
      allActivePlayersVoted,
      canHostReveal: room.status === 'voting'
        && (allActivePlayersVoted || (room.deadline !== undefined && Date.now() >= room.deadline)),
      deadline: room.deadline,
      roundResult: room.status === 'result' ? room.roundResult : undefined,
      statistics: room.status === 'finished' ? buildGameStatistics(stats) : undefined,
      endReason: room.endReason,
    };
  }

  private requireSocketContext(socketId: string): SocketContext {
    const indexed = this.socketIndex.get(socketId);
    const room = indexed ? this.rooms.get(indexed.roomCode) : undefined;
    const player = indexed && room ? room.players.get(indexed.playerId) : undefined;
    if (!room || !player || player.socketId !== socketId) {
      throw new PartyGameError('NOT_IN_ROOM', 'Du bist aktuell mit keinem Raum verbunden.');
    }
    return { room, player };
  }

  private requireRoom(code: string): InternalRoom {
    const room = this.rooms.get(code);
    if (!room) {
      throw new PartyGameError('ROOM_NOT_FOUND', 'Zu diesem Raumcode wurde kein aktiver Raum gefunden.');
    }
    return room;
  }

  private requireHost(room: InternalRoom, player: InternalPlayer): void {
    if (room.hostId !== player.id) {
      throw new PartyGameError('HOST_ONLY', 'Nur der Host kann diese Aktion ausführen.');
    }
  }

  private requireStatus(room: InternalRoom, expected: InternalRoom['status']): void {
    if (room.status !== expected) {
      throw new PartyGameError('INVALID_GAME_STATE', 'Diese Aktion ist im aktuellen Spielstatus nicht möglich.');
    }
  }

  private connectedPlayers(room: InternalRoom): InternalPlayer[] {
    return [...room.players.values()].filter((player) => player.connected);
  }

  private validateName(rawName: string): string {
    const name = rawName.trim().replace(/\s+/g, ' ');
    if (!name) {
      throw new PartyGameError('NAME_REQUIRED', 'Bitte gib einen Spielernamen ein.');
    }
    if (name.length > 24) {
      throw new PartyGameError('NAME_TOO_LONG', 'Der Spielername darf höchstens 24 Zeichen lang sein.');
    }
    if (/[\u0000-\u001F\u007F]/.test(name)) {
      throw new PartyGameError('INVALID_NAME', 'Der Spielername enthält ungültige Zeichen.');
    }
    return name;
  }

  private normalizeRoomCode(rawCode: string): string {
    const code = rawCode.trim().toUpperCase().replace(/\s+/g, '');
    if (!code) {
      throw new PartyGameError('CODE_REQUIRED', 'Bitte gib einen Raumcode ein.');
    }
    return code;
  }

  private generateRoomCode(): string {
    for (let attempt = 0; attempt < 100; attempt += 1) {
      let code = '';
      for (let index = 0; index < 5; index += 1) {
        code += ROOM_CODE_ALPHABET[randomInt(ROOM_CODE_ALPHABET.length)];
      }
      if (!this.rooms.has(code)) return code;
    }
    throw new PartyGameError('CODE_GENERATION_FAILED', 'Es konnte gerade kein Raumcode erstellt werden. Bitte versuche es erneut.');
  }

  private clearVoteTimer(room: InternalRoom): void {
    if (room.voteTimer) clearTimeout(room.voteTimer);
    room.voteTimer = undefined;
  }

  private closeAndDeleteRoom(room: InternalRoom, message: string): void {
    this.emit('roomClosed', room.code, message);
    this.deleteRoom(room);
  }

  private deleteRoom(room: InternalRoom): void {
    this.clearVoteTimer(room);
    for (const player of room.players.values()) {
      if (player.disconnectTimer) clearTimeout(player.disconnectTimer);
      if (player.socketId) this.socketIndex.delete(player.socketId);
    }
    this.rooms.delete(room.code);
  }

  private emitChanged(code: string): void {
    this.emit('changed', code);
  }

  private emitNotice(code: string, notice: ServerNotice): void {
    this.emit('notice', code, notice);
  }
}
