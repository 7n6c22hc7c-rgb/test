import {
  Award,
  Crown,
  DoorOpen,
  Gamepad2,
  LogOut,
  Medal,
  RefreshCw,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import type { RoomSnapshot } from '../../shared/types';
import { StatsPanel } from '../components/StatsPanel';

interface FinishedScreenProps {
  room: RoomSnapshot;
  playerId: string;
  onRestart: () => Promise<void>;
  onReturnLobby: () => Promise<void>;
  onLeave: () => Promise<void>;
}

function namesFor(ids: string[], room: RoomSnapshot): string[] {
  return ids
    .map((id) => room.players.find((player) => player.playerId === id)?.name)
    .filter((name): name is string => Boolean(name));
}

export function FinishedScreen({ room, playerId, onRestart, onReturnLobby, onLeave }: FinishedScreenProps) {
  const statistics = room.statistics;
  const isHost = room.hostId === playerId;

  useEffect(() => {
    confetti({ particleCount: 130, spread: 100, origin: { y: 0.45 }, scalar: 0.9 });
  }, []);

  if (!statistics) return null;

  const topNames = namesFor(statistics.mostSipsPlayerIds, room);
  const bottomNames = namesFor(statistics.leastSipsPlayerIds, room);
  const bonusNames = namesFor(statistics.finalBonusPlayerIds, room);

  return (
    <div className="finished-layout page-enter">
      <section className="finish-hero">
        <div className="finish-icon"><Trophy size={43} fill="currentColor" /></div>
        <div className="eyebrow"><Sparkles size={15} /> Runde abgeschlossen</div>
        <h1>Das war überraschend ehrlich.</h1>
        <p>{room.playedQuestions} Fragen, {room.players.length} Personen und eine ganze Menge eindeutiger Meinungen.</p>
      </section>

      <section className="ranking-card glass-card">
        <div className="section-heading ranking-heading">
          <div><span className="section-icon"><Medal size={19} /></span><div><h2>Abschlussrangliste</h2><p>Sortiert nach Schlücken</p></div></div>
        </div>

        <div className="ranking-table-wrap">
          <table className="ranking-table">
            <thead>
              <tr>
                <th>Platz</th>
                <th>Person</th>
                <th>Stimmen</th>
                <th>Top-Runden</th>
                <th>Andere Runden</th>
                <th>Schlücke</th>
              </tr>
            </thead>
            <tbody>
              {statistics.ranking.map((player, index) => {
                const isTop = statistics.mostSipsPlayerIds.includes(player.playerId);
                const isBottom = statistics.leastSipsPlayerIds.includes(player.playerId);
                const getsBonus = statistics.finalBonusPlayerIds.includes(player.playerId);
                return (
                  <tr key={player.playerId} className={isTop ? 'rank-top' : ''}>
                    <td><span className={`rank-number rank-${Math.min(index + 1, 4)}`}>{index + 1}</span></td>
                    <td>
                      <strong>{player.name}{player.playerId === playerId ? ' (du)' : ''}</strong>
                      <span className="rank-badges">
                        {isTop && <small><Crown size={12} /> Höchster Wert</small>}
                        {isBottom && <small className="bottom-badge"><Award size={12} /> Niedrigster Wert</small>}
                      </span>
                    </td>
                    <td>{player.votesReceived}</td>
                    <td>{player.roundsWon}</td>
                    <td>{player.roundsLost}</td>
                    <td><strong className="sip-total">{player.sips}</strong>{getsBonus && <small className="bonus-count">+1 Abschluss</small>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <div className="extreme-cards">
        <div className="extreme-card top-card">
          <span><Crown size={22} /></span>
          <div><small>Die meisten Schlücke</small><strong>{topNames.join(', ')}</strong></div>
        </div>
        <div className="extreme-card bottom-card">
          <span><Award size={22} /></span>
          <div><small>Die wenigsten Schlücke</small><strong>{bottomNames.join(', ')}</strong></div>
        </div>
      </div>

      <section className="final-rule">
        <Sparkles size={26} />
        <div>
          <strong>Eine letzte Regel</strong>
          <p>
            Die Person auf dem ersten Platz und die Person auf dem letzten Platz trinken zum Abschluss jeweils noch einen Schluck.
            {' '}Bei Gleichstand gilt das für alle Betroffenen; niemand erhält die Abschlussregel doppelt.
          </p>
          <span>Betroffen: {bonusNames.join(', ')}</span>
        </div>
      </section>

      <StatsPanel room={room} />

      {isHost ? (
        <div className="finish-actions">
          <button type="button" className="secondary-button" onClick={() => void onReturnLobby()}>
            <Gamepad2 size={19} /> Zur Spielauswahl
          </button>
          <button type="button" className="primary-button large-button" onClick={() => void onRestart()}>
            <RefreshCw size={20} /> Neue Runde, gleiche Gruppe
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
