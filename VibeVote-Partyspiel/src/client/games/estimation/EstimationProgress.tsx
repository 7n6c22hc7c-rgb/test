import { Clock3, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { RoomSnapshot } from '../../../shared/types';

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

export function EstimationProgress({ room }: { room: RoomSnapshot }) {
  const progress = room.totalRounds > 0 ? (room.playedQuestions / room.totalRounds) * 100 : 0;
  const countdown = useCountdown(room.deadline);
  return (
    <section className="game-progress estimation-progress">
      <div className="progress-topline">
        <span>Runde <strong>{room.currentRound}</strong> von {room.totalRounds}</span>
        <span>{room.remainingQuestions} {room.remainingQuestions === 1 ? 'Frage' : 'Fragen'} übrig</span>
        <span><Users size={15} /> {room.answersSubmitted}/{room.activeAnswerers}</span>
        {countdown !== null && (
          <span className={`countdown ${countdown <= 5 ? 'is-low' : ''}`}><Clock3 size={15} /> {countdown}s</span>
        )}
      </div>
      <div className="round-progress-track"><span style={{ width: `${progress}%` }} /></div>
    </section>
  );
}
