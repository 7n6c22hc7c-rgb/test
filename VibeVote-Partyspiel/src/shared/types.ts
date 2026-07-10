export type RoomStatus = 'lobby' | 'voting' | 'result' | 'finished';
export type RoundLimit = 10 | 20 | 30 | 40 | 50 | 60;
export type GameId = 'would-you-rather';

export type QuestionCategory =
  | 'Dating'
  | 'Beziehungen'
  | 'Freundschaft'
  | 'Party'
  | 'Alkohol'
  | 'Studium & Arbeit'
  | 'Social Media'
  | 'Peinliche Momente'
  | 'Schlechte Entscheidungen'
  | 'Urlaub'
  | 'Alltag'
  | 'Geheimnisse';

export interface Question {
  id: string;
  text: string;
  category: QuestionCategory;
}

export interface RoomSettings {
  roundLimit: RoundLimit;
  allowSelfVote: boolean;
  timerSeconds: 10 | 20 | 30;
}

export interface PlayerStats {
  playerId: string;
  name: string;
  votesReceived: number;
  roundsWon: number;
  roundsLost: number;
  sips: number;
}

export interface PublicPlayer extends PlayerStats {
  connected: boolean;
  isHost: boolean;
  hasVoted: boolean;
}

export interface VoteCount {
  playerId: string;
  name: string;
  votes: number;
}

export interface RoundResult {
  question: Question;
  counts: VoteCount[];
  winners: VoteCount[];
  totalVotes: number;
}

export interface GameStatistics {
  ranking: PlayerStats[];
  mostSipsPlayerIds: string[];
  leastSipsPlayerIds: string[];
  finalBonusPlayerIds: string[];
}

export interface RoomSnapshot {
  code: string;
  status: RoomStatus;
  hostId: string;
  selectedGame: GameId;
  players: PublicPlayer[];
  settings: RoomSettings;
  currentRound: number;
  totalRounds: number;
  playedQuestions: number;
  remainingQuestions: number;
  currentQuestion?: Question;
  votesSubmitted: number;
  activeVoters: number;
  allActivePlayersVoted: boolean;
  canHostReveal: boolean;
  deadline?: number;
  roundResult?: RoundResult;
  statistics?: GameStatistics;
  endReason?: 'completed' | 'host-ended';
}

export interface SessionIdentity {
  roomCode: string;
  playerId: string;
  sessionToken: string;
  playerName: string;
}

export interface SessionResponse extends SessionIdentity {
  room: RoomSnapshot;
}

export interface AppError {
  code: string;
  message: string;
}

export type Ack<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: AppError };

export interface ServerNotice {
  type: 'info' | 'warning' | 'success';
  message: string;
}
