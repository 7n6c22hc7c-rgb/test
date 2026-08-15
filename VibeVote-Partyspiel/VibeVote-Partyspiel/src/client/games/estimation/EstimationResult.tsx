import {
  ArrowRight,
  Check,
  Flag,
  LogOut,
  Target,
  Users,
  X,
} from 'lucide-react';
import type { EstimationAnswer } from '../../../shared/estimationTypes';
import type { RoomSnapshot } from '../../../shared/types';
import { EstimationProgress } from './EstimationProgress';

interface EstimationResultProps {
  room: RoomSnapshot;
  playerId: string;
  onNext: () => Promise<void>;
  onEnd: () => Promise<void>;
  onLeave: () => Promise<void>;
}

function formatAnswer(answer: EstimationAnswer, unit?: string): string {
  const value = typeof answer === 'number'
    ? new Intl.NumberFormat('de-DE', { maximumFractionDigits: 6 }).format(answer)
    : answer;
  return unit ? `${value} ${unit}` : value;
}

function joinNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? '';
  if (names.length === 2) return names.join(' und ');
  return `${names.slice(0, -1).join(', ')} und ${names.at(-1)}`;
}

export function EstimationResult({ room, playerId, onNext, onEnd, onLeave }: EstimationResultProps) {
  const result = room.estimationRoundResult;
  if (!result) return null;
  const isHost = room.hostId === playerId;
  const unit = result.question.type === 'number' ? result.question.unit : undefined;
  const drinkerNames = result.drinkerPlayerIds
    .map((id) => result.answers.find((entry) => entry.playerId === id)?.name)
    .filter((name): name is string => Boolean(name));

  return (
    <div className="game-layout result-layout estimation-result-layout page-enter">
      <EstimationProgress room={room} />

      <section className="estimation-solution-card glass-card">
        <div className="result-kicker"><Target size={17} /> Richtige Antwort</div>
        <h1>{formatAnswer(result.correctAnswer, unit)}</h1>
        <p>{result.question.text}</p>
        {result.answerNote && <small>{result.answerNote}</small>}
      </section>

      {result.question.type === 'number' ? (
        <section className="estimation-breakdown glass-card">
          <div className="section-heading compact-heading">
            <div><span className="section-icon orange"><Target size={18} /></span><div><h2>Alle Schätzungen</h2><p>Kleinste bis größte Abweichung</p></div></div>
          </div>
          <div className="estimation-answer-list">
            {[...result.answers]
              .sort((a, b) => (a.deviation ?? 0) - (b.deviation ?? 0))
              .map((answer) => {
                const loses = result.loserPlayerIds.includes(answer.playerId);
                return (
                  <div className={`estimation-answer-row ${loses ? 'is-loser' : ''}`} key={answer.playerId}>
                    <div><strong>{answer.name}{answer.playerId === playerId ? ' (du)' : ''}</strong><span>{formatAnswer(answer.answer, unit)}</span></div>
                    <div><small>Abweichung</small><strong>{formatAnswer(answer.deviation ?? 0, unit)}</strong></div>
                    {loses && <span className="drinker-badge">trinkt</span>}
                  </div>
                );
              })}
          </div>
        </section>
      ) : (
        <section className="estimation-breakdown glass-card">
          <div className="choice-solution-grid">
            {result.question.options.map((option) => (
              <div className={`choice-solution ${option === result.correctAnswer ? 'is-correct' : ''}`} key={option}>
                {option === result.correctAnswer ? <Check size={17} /> : <span />}
                <strong>{option}</strong>
              </div>
            ))}
          </div>
          <div className="estimation-answer-list choice-player-results">
            {result.answers.map((answer) => {
              const correct = answer.isCorrect === true;
              return (
                <div className={`estimation-answer-row ${correct ? 'is-correct' : 'is-loser'}`} key={answer.playerId}>
                  <div><strong>{answer.name}{answer.playerId === playerId ? ' (du)' : ''}</strong><span>{answer.answer}</span></div>
                  <div className="answer-status">{correct ? <><Check size={16} /> richtig</> : <><X size={16} /> falsch</>}</div>
                  {!correct && <span className="drinker-badge">trinkt</span>}
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className={`estimation-drink-callout ${drinkerNames.length === 0 ? 'nobody-drinks' : ''}`}>
        <Users size={25} />
        <div>
          <strong>{drinkerNames.length === 0 ? 'Niemand muss trinken.' : `${joinNames(drinkerNames)} ${drinkerNames.length === 1 ? 'muss' : 'müssen'} trinken.`}</strong>
          <p>{result.question.type === 'number'
            ? (drinkerNames.length > 1 ? 'Sie lagen gleich weit am weitesten daneben.' : 'Diese Schätzung lag am weitesten daneben.')
            : (drinkerNames.length === 0 ? 'Alle Antworten waren richtig.' : 'Alle falschen Antworten zählen für diese Runde.')}</p>
        </div>
      </section>

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
          Der Host startet die nächste Frage.
        </div>
      )}

      <button type="button" className="text-button leave-button" onClick={() => void onLeave()}>
        <LogOut size={17} /> Spiel verlassen
      </button>
    </div>
  );
}
