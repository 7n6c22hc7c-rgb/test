import { Users } from 'lucide-react';
import type { RoomSnapshot } from '../../../shared/types';

export function EstimationProgress({ room }: { room: RoomSnapshot }) {
  const progress = room.totalRounds > 0 ? (room.playedQuestions / room.totalRounds) * 100 : 0;
  return (
    <section className="game-progress estimation-progress">
      <div className="progress-topline">
        <span>Runde <strong>{room.currentRound}</strong> von {room.totalRounds}</span>
        <span>{room.remainingQuestions} {room.remainingQuestions === 1 ? 'Frage' : 'Fragen'} übrig</span>
        <span><Users size={15} /> {room.answersSubmitted}/{room.activeAnswerers}</span>
      </div>
      <div className="round-progress-track"><span style={{ width: `${progress}%` }} /></div>
    </section>
  );
}
