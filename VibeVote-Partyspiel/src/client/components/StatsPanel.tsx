import { BarChart3, ChevronDown, Users } from 'lucide-react';
import { useState } from 'react';
import type { RoomSnapshot } from '../../shared/types';

export function StatsPanel({ room }: { room: RoomSnapshot }) {
  const [open, setOpen] = useState(false);

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
                <th><Users size={14} /> Gewählte Runden</th>
              </tr>
            </thead>
            <tbody>
              {[...room.players]
                .sort((a, b) => b.roundsWon - a.roundsWon || a.name.localeCompare(b.name, 'de'))
                .map((player) => (
                  <tr key={player.playerId}>
                    <td>{player.name}</td>
                    <td><strong>{player.roundsWon}</strong></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
