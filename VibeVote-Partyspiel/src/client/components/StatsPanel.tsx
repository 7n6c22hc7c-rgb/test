import { BarChart3, ChevronDown, Crown, Users } from 'lucide-react';
import { useState } from 'react';
import type { RoomSnapshot } from '../../shared/types';
import { getWording } from '../wording';

export function StatsPanel({ room }: { room: RoomSnapshot }) {
  const [open, setOpen] = useState(false);
  const wording = getWording(room.settings.playMode);

  return (
    <section className={`stats-panel ${open ? 'is-open' : ''}`}>
      <button
        type="button"
        className="stats-toggle"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <span><BarChart3 size={18} /> Live-Statistik</span>
        <ChevronDown size={18} />
      </button>
      {open && (
        <div className="stats-table-wrap">
          <table className="stats-table">
            <thead>
              <tr>
                <th>Person</th>
                <th><Users size={14} /> Stimmen</th>
                <th><Crown size={14} /> Runden</th>
                <th>{wording.countLabel}</th>
              </tr>
            </thead>
            <tbody>
              {[...room.players]
                .sort((a, b) => b.sips - a.sips || b.votesReceived - a.votesReceived)
                .map((player) => (
                  <tr key={player.playerId}>
                    <td>{player.name}</td>
                    <td>{player.votesReceived}</td>
                    <td>{player.roundsWon}</td>
                    <td><strong>{player.sips}</strong></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
