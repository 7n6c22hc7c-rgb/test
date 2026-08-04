import confetti from 'canvas-confetti';
import {
  Brain,
  Calculator,
  Gamepad2,
  LogOut,
  Medal,
  RefreshCw,
  Sparkles,
  Target,
  Trash2,
  Trophy,
} from 'lucide-react';
import { useEffect } from 'react';
import type { RoomSnapshot } from '../../../shared/types';

interface EstimationFinishedScreenProps {
  room: RoomSnapshot;
  playerId: string;
  onRestart: () => Promise<void>;
  onReturnLobby: () => Promise<void>;
  onClose: () => Promise<void>;
  onLeave: () => Promise<void>;
}

function namesFor(ids: string[], room: RoomSnapshot): string[] {
  return ids
    .map((id) => room.players.find((player) => player.playerId === id)?.name)
    .filter((name): name is string => Boolean(name));
}

function formatAverage(value: number | null): string {
  return value === null
    ? '–'
    : new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 }).format(value);
}

export function EstimationFinishedScreen({
  room,
  playerId,
  onRestart,
  onReturnLobby,
  onClose,
  onLeave,
}: EstimationFinishedScreenProps) {
  const statistics = room.estimationStatistics;
  const isHost = room.hostId === playerId;

  useEffect(() => {
    confetti({ particleCount: 130, spread: 100, origin: { y: 0.45 }, scalar: 0.9 });
  }, []);

  if (!statistics) return null;
  const awards = statistics.awards;
  const awardCards = [
    {
      title: 'Schätzmeister',
      icon: <Target size={22} />,
      names: namesFor(awards.estimationMasterPlayerIds, room),
      empty: `Mindestens ${awards.minimumNumberAnswersForMaster} Zahlenantworten erforderlich`,
      detail: 'Niedrigste durchschnittliche Abweichung',
    },
    {
      title: 'Wissensmeister',
      icon: <Brain size={22} />,
      names: namesFor(awards.knowledgeMasterPlayerIds, room),
      empty: 'Noch keine richtige Auswahlantwort',
      detail: 'Meiste richtige Auswahlantworten',
    },
    {
      title: 'Am weitesten daneben',
      icon: <Calculator size={22} />,
      names: namesFor(awards.furthestOffPlayerIds, room),
      empty: 'Noch keine verlorene Zahlenrunde',
      detail: 'Meiste verlorene Zahlenfragen',
    },
    {
      title: 'Trinkmeister',
      icon: <Trophy size={22} />,
      names: namesFor(awards.drinkingMasterPlayerIds, room),
      empty: 'In dieser Runde musste niemand trinken',
      detail: 'Meiste Runden mit Trinkfolge',
    },
  ];

  return (
    <div className="finished-layout estimation-finished page-enter">
      <section className="finish-hero">
        <div className="finish-icon estimation-finish-icon"><Target size={43} /></div>
        <div className="eyebrow"><Sparkles size={15} /> Schätzrunde abgeschlossen</div>
        <h1>Zwischen Volltreffer und völlig daneben.</h1>
        <p>{room.playedQuestions} Fragen wurden gemeinsam beantwortet.</p>
      </section>

      <section className="ranking-card glass-card">
        <div className="section-heading ranking-heading">
          <div><span className="section-icon"><Medal size={19} /></span><div><h2>Abschlussstatistik</h2><p>Sortiert nach Trinkrunden</p></div></div>
        </div>
        <div className="ranking-table-wrap">
          <table className="ranking-table estimation-ranking-table">
            <thead>
              <tr>
                <th>Platz</th>
                <th>Person</th>
                <th>Antworten</th>
                <th>Richtig</th>
                <th>Zahlenrunden verloren</th>
                <th>Trinkrunden</th>
                <th>Ø Abweichung</th>
              </tr>
            </thead>
            <tbody>
              {statistics.ranking.map((player, index) => (
                <tr key={player.playerId}>
                  <td><span className={`rank-number rank-${Math.min(index + 1, 4)}`}>{index + 1}</span></td>
                  <td><strong>{player.name}{player.playerId === playerId ? ' (du)' : ''}</strong></td>
                  <td>{player.answeredQuestions}</td>
                  <td>{player.correctChoiceAnswers}</td>
                  <td>{player.lostNumberQuestions}</td>
                  <td><strong className="sip-total">{player.drinkRounds}</strong></td>
                  <td>{formatAverage(player.averageNumberDeviation)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="estimation-awards">
        {awardCards.map((award) => (
          <article className="estimation-award-card glass-card" key={award.title}>
            <span>{award.icon}</span>
            <small>{award.title}</small>
            <strong>{award.names.length > 0 ? award.names.join(', ') : 'Nicht vergeben'}</strong>
            <p>{award.names.length > 0 ? award.detail : award.empty}</p>
          </article>
        ))}
      </section>

      {isHost ? (
        <div className="finish-actions estimation-finish-actions">
          <button type="button" className="secondary-button danger-button" onClick={() => void onClose()}>
            <Trash2 size={18} /> Raum schließen
          </button>
          <button type="button" className="secondary-button" onClick={() => void onReturnLobby()}>
            <Gamepad2 size={19} /> Einstellungen / Spielauswahl
          </button>
          <button type="button" className="primary-button large-button" onClick={() => void onRestart()}>
            <RefreshCw size={20} /> Neue Runde, gleiche Auswahl
          </button>
        </div>
      ) : (
        <div className="waiting-host"><span className="waiting-dots"><i /><i /><i /></span>Der Host entscheidet, wie es weitergeht.</div>
      )}

      <button type="button" className="text-button leave-button" onClick={() => void onLeave()}>
        <LogOut size={17} /> Raum verlassen
      </button>
    </div>
  );
}
