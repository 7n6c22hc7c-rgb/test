import confetti from 'canvas-confetti';
import {
  ArrowRight,
  Check,
  Clock3,
  Crown,
  Flag,
  LogOut,
  Sparkles,
  Timer,
  Users,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { RoomSnapshot } from '../../shared/types';
import { StatsPanel } from '../components/StatsPanel';

interface GameScreenProps {
  room: RoomSnapshot;
  playerId: string;
  onVote: (targetPlayerId: string) => Promise<void>;
  onNext: () => Promise<void>;
  onEnd: () => Promise<void>;
  onLeave: () => Promise<void>;
}

function useCountdown(deadline?: number) {
  const [seconds, setSeconds] = useState<number | null>(null);

  useEffect(() => {
    if (!deadline) {
      setSeconds(null);
      return undefined;
    }
    const update = () => setSeconds(Math.max(0, Math.ceil((deadline - Date.now()) / 1_000)));
    update();
    const interval = window.setInterval(update, 250);
    return () => window.clearInterval(interval);
  }, [deadline]);

  return seconds;
}

function fireConfetti() {
  const defaults = { spread: 75, ticks: 170, gravity: 0.9, scalar: 0.9 };
  confetti({ ...defaults, particleCount: 70, origin: { x: 0.25, y: 0.55 }, angle: 60 });
  confetti({ ...defaults, particleCount: 70, origin: { x: 0.75, y: 0.55 }, angle: 120 });
}

export function GameScreen({ room, playerId, onVote, onNext, onEnd, onLeave }: GameScreenProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const countdown = useCountdown(room.deadline);
  const myPlayer = room.players.find((player) => player.playerId === playerId);
  const isHost = room.hostId === playerId;

  useEffect(() => {
    setSelectedPlayerId(undefined);
  }, [room.currentQuestion?.id]);

  useEffect(() => {
    if (room.status === 'result' && room.roundResult?.winners.length) {
      fireConfetti();
    }
  }, [room.status, room.currentRound, room.roundResult?.winners.length]);

  const targets = useMemo(() => room.players.filter((player) =>
    player.connected && (room.settings.allowSelfVote || player.playerId !== playerId)), [room.players, room.settings.allowSelfVote, playerId]);

  const confirmVote = async () => {
    if (!selectedPlayerId) return;
    setSubmitting(true);
    try {
      await onVote(selectedPlayerId);
    } finally {
      setSubmitting(false);
    }
  };

  if (room.status === 'result') {
    const result = room.roundResult;
    const winnerNames = result?.winners.map((winner) => winner.name) ?? [];
    const noVotes = !result || result.winners.length === 0;

    return (
      <div className="game-layout result-layout page-enter">
        <GameProgress room={room} countdown={null} />

        <section className="result-card glass-card">
          <div className="result-kicker"><Sparkles size={17} /> Ergebnis der Runde</div>
          {noVotes ? (
            <>
              <div className="winner-emblem muted"><Timer size={35} /></div>
              <h1>Keine Stimme abgegeben</h1>
              <p className="result-subline">In dieser Runde erhält niemand eine Konsequenz.</p>
            </>
          ) : (
            <>
              <div className="winner-emblem"><Crown size={42} fill="currentColor" /></div>
              <p className="winner-label">{winnerNames.length > 1 ? 'Gleichstand zwischen' : 'Die meisten Stimmen gehen an'}</p>
              <h1 className={winnerNames.length > 2 ? 'multiple-winners' : ''}>{winnerNames.join(' & ')}</h1>
              <p className="result-subline">
                <strong>{result.winners[0].votes} von {result.totalVotes} Stimmen</strong>
                <span>·</span>
                {winnerNames.length > 1 ? 'je 1 Schluck trinken' : '1 Schluck trinken'}
              </p>
            </>
          )}

          {result && (
            <div className="vote-breakdown">
              {result.counts.map((entry) => {
                const percentage = result.totalVotes > 0 ? (entry.votes / result.totalVotes) * 100 : 0;
                const winner = result.winners.some((item) => item.playerId === entry.playerId);
                return (
                  <div className={`breakdown-row ${winner ? 'is-winner' : ''}`} key={entry.playerId}>
                    <div><span>{entry.name}</span><strong>{entry.votes}</strong></div>
                    <div className="vote-bar"><span style={{ width: `${percentage}%` }} /></div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <StatsPanel room={room} />

        {isHost ? (
          <div className="game-actions">
            <button type="button" className="secondary-button" onClick={() => void onEnd()}>
              <Flag size={18} /> Spiel beenden
            </button>
            <button type="button" className="primary-button large-button" onClick={() => void onNext()}>
              {room.remainingQuestions === 0 ? 'Zur Auswertung' : 'Nächste Frage'} <ArrowRight size={19} />
            </button>
          </div>
        ) : (
          <div className="waiting-host" role="status">
            <span className="waiting-dots"><i /><i /><i /></span>
            Der Host startet gleich die nächste Frage.
          </div>
        )}

        <button type="button" className="text-button leave-button" onClick={() => void onLeave()}>
          <LogOut size={17} /> Spiel verlassen
        </button>
      </div>
    );
  }

  const alreadyVoted = Boolean(myPlayer?.hasVoted);
  const votingProgress = room.activeVoters > 0 ? (room.votesSubmitted / room.activeVoters) * 100 : 0;

  return (
    <div className="game-layout page-enter">
      <GameProgress room={room} countdown={countdown} />

      <section className="question-card glass-card">
        <div className="question-meta">
          <span>{room.currentQuestion?.category}</span>
          <span>Frage {room.currentRound}</span>
        </div>
        <h1>{room.currentQuestion?.text}</h1>
        <p>Wähle die Person, auf die diese Aussage am ehesten zutrifft.</p>
      </section>

      {!alreadyVoted ? (
        <section className="voting-section">
          <div className="voting-heading"><h2>Deine geheime Stimme</h2><span><Users size={16} /> Nur deine Auswahl ist sichtbar</span></div>
          <div className="vote-grid">
            {targets.map((player, index) => (
              <button
                type="button"
                key={player.playerId}
                className={`vote-player-card ${selectedPlayerId === player.playerId ? 'is-selected' : ''}`}
                onClick={() => setSelectedPlayerId(player.playerId)}
                aria-pressed={selectedPlayerId === player.playerId}
              >
                <span className={`avatar avatar-large avatar-${index % 5}`}>{player.name.slice(0, 1).toUpperCase()}</span>
                <strong>{player.name}</strong>
                {player.playerId === playerId && <small>Du selbst</small>}
                <span className="selection-check"><Check size={17} /></span>
              </button>
            ))}
          </div>
          <button
            type="button"
            className="primary-button large-button confirm-vote"
            disabled={!selectedPlayerId || submitting}
            onClick={() => void confirmVote()}
          >
            <Check size={20} /> {submitting ? 'Wird bestätigt …' : 'Stimme verbindlich bestätigen'}
          </button>
        </section>
      ) : (
        <section className="waiting-card glass-card vote-confirmed">
          <div className="confirmation-icon"><Check size={31} strokeWidth={3} /></div>
          <h2>Stimme abgegeben</h2>
          <p>Deine Wahl bleibt geheim. Sobald alle abgestimmt haben, erscheint das Ergebnis automatisch.</p>
          <div className="progress-copy"><span>{room.votesSubmitted} von {room.activeVoters} haben abgestimmt</span><strong>{Math.round(votingProgress)} %</strong></div>
          <div className="progress-track"><span style={{ width: `${Math.min(100, votingProgress)}%` }} /></div>
        </section>
      )}

      <div className="game-footer-actions">
        {isHost && <button type="button" className="text-button" onClick={() => void onEnd()}><Flag size={16} /> Spiel vorzeitig beenden</button>}
        <button type="button" className="text-button" onClick={() => void onLeave()}><LogOut size={16} /> Verlassen</button>
      </div>
    </div>
  );
}

function GameProgress({ room, countdown }: { room: RoomSnapshot; countdown: number | null }) {
  const progress = room.totalRounds > 0 ? (room.playedQuestions / room.totalRounds) * 100 : 0;
  return (
    <section className="game-progress">
      <div className="progress-topline">
        <span>Runde <strong>{room.currentRound}</strong> von {room.totalRounds}</span>
        <span>{room.remainingQuestions} {room.remainingQuestions === 1 ? 'Frage' : 'Fragen'} übrig</span>
        {countdown !== null && (
          <span className={`countdown ${countdown <= 5 ? 'is-low' : ''}`}><Clock3 size={16} /> {countdown}s</span>
        )}
      </div>
      <div className="round-progress-track"><span style={{ width: `${progress}%` }} /></div>
    </section>
  );
}
