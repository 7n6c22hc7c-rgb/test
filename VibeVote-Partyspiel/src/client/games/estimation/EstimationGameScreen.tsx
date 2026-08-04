import confetti from 'canvas-confetti';
import {
  ArrowRight,
  Check,
  Flag,
  Hash,
  Lightbulb,
  ListChecks,
  LogOut,
  Send,
  Users,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { EstimationAnswer } from '../../../shared/estimationTypes';
import type { RoomSnapshot } from '../../../shared/types';
import { EstimationProgress } from './EstimationProgress';
import { EstimationResult } from './EstimationResult';

interface EstimationGameScreenProps {
  room: RoomSnapshot;
  playerId: string;
  onSubmitAnswer: (answer: EstimationAnswer) => Promise<void>;
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

export function EstimationGameScreen({
  room,
  playerId,
  onSubmitAnswer,
  onNext,
  onEnd,
  onLeave,
}: EstimationGameScreenProps) {
  const question = room.currentEstimationQuestion;
  const [numberInput, setNumberInput] = useState('');
  const [selectedChoice, setSelectedChoice] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const isHost = room.hostId === playerId;

  useEffect(() => {
    setNumberInput('');
    setSelectedChoice(undefined);
  }, [question?.id]);

  useEffect(() => {
    if (room.status === 'result') {
      confetti({ particleCount: 55, spread: 75, origin: { y: 0.62 }, scalar: 0.75 });
    }
  }, [room.status, room.currentRound]);

  const parsedNumber = useMemo(() => {
    if (question?.type !== 'number' || numberInput.trim() === '') return undefined;
    const value = Number(numberInput.replace(',', '.'));
    if (!Number.isFinite(value)) return undefined;
    if (!question.allowDecimals && !Number.isInteger(value)) return undefined;
    if (!question.allowNegative && value < 0) return undefined;
    return value;
  }, [numberInput, question]);

  if (!question) {
    return (
      <section className="waiting-card glass-card estimation-missing">
        <Lightbulb size={32} />
        <h1>Frage wird geladen</h1>
        <p>Der gemeinsame Spielstand wird gerade synchronisiert.</p>
      </section>
    );
  }

  if (room.status === 'result' && room.estimationRoundResult) {
    return (
      <EstimationResult
        room={room}
        playerId={playerId}
        onNext={onNext}
        onEnd={onEnd}
        onLeave={onLeave}
      />
    );
  }

  const alreadyAnswered = room.ownEstimationAnswer !== undefined;
  const answerProgress = room.activeAnswerers > 0
    ? (room.answersSubmitted / room.activeAnswerers) * 100
    : 0;
  const pendingAnswer: EstimationAnswer | undefined = question.type === 'number'
    ? parsedNumber
    : selectedChoice;

  const submit = async () => {
    if (pendingAnswer === undefined) return;
    setSubmitting(true);
    try {
      await onSubmitAnswer(pendingAnswer);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="game-layout estimation-layout page-enter">
      <EstimationProgress room={room} />

      <section className="question-card estimation-question-card glass-card">
        <div className="question-meta estimation-meta">
          <span>{question.category}</span>
          <span className={`difficulty-pill difficulty-${question.difficulty.toLowerCase()}`}>{question.difficulty}</span>
          <span>{question.type === 'number' ? <><Hash size={14} /> Zahlenfrage</> : <><ListChecks size={14} /> Auswahlfrage</>}</span>
        </div>
        <h1>{question.text}</h1>
        <p>{question.type === 'number' ? 'Gib deine beste Schätzung ab.' : 'Wähle genau eine Antwort aus.'}</p>
      </section>

      {!alreadyAnswered ? (
        <section className="estimation-answer-section">
          {question.type === 'number' ? (
            <div className="number-answer-card glass-card">
              <label htmlFor="estimation-number">Deine Schätzung</label>
              <div className="number-input-wrap">
                <input
                  id="estimation-number"
                  type="number"
                  inputMode={question.allowDecimals ? 'decimal' : 'numeric'}
                  step={question.allowDecimals ? 'any' : '1'}
                  min={question.allowNegative ? undefined : 0}
                  value={numberInput}
                  placeholder="0"
                  autoComplete="off"
                  onChange={(event) => setNumberInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (['e', 'E', '+'].includes(event.key) || (!question.allowNegative && event.key === '-')) {
                      event.preventDefault();
                    }
                  }}
                />
                {question.unit && <span>{question.unit}</span>}
              </div>
              <small>{question.allowDecimals ? 'Ganze Zahlen und Dezimalzahlen sind möglich.' : 'Bitte gib eine ganze Zahl ein.'}</small>
            </div>
          ) : (
            <div className="choice-answer-grid">
              {question.options.map((option, index) => (
                <button
                  type="button"
                  key={option}
                  className={`choice-answer-card ${selectedChoice === option ? 'is-selected' : ''}`}
                  onClick={() => setSelectedChoice(option)}
                  aria-pressed={selectedChoice === option}
                >
                  <span>{String.fromCharCode(65 + index)}</span>
                  <strong>{option}</strong>
                  <i><Check size={17} /></i>
                </button>
              ))}
            </div>
          )}

          <div className="answer-confirmation glass-card">
            <div>
              <small>Deine Auswahl</small>
              <strong>{pendingAnswer === undefined ? 'Noch keine Antwort gewählt' : formatAnswer(pendingAnswer, question.type === 'number' ? question.unit : undefined)}</strong>
            </div>
            <button
              type="button"
              className="primary-button large-button"
              disabled={pendingAnswer === undefined || submitting}
              onClick={() => void submit()}
            >
              <Send size={19} /> {submitting ? 'Wird gespeichert …' : 'Antwort abgeben'}
            </button>
          </div>
        </section>
      ) : (
        <section className="waiting-card glass-card vote-confirmed estimation-confirmed">
          <div className="confirmation-icon"><Check size={31} strokeWidth={3} /></div>
          <h2>Antwort gespeichert</h2>
          <p>Deine Antwort <strong>{formatAnswer(room.ownEstimationAnswer!, question.type === 'number' ? question.unit : undefined)}</strong> bleibt bis zur Auflösung geheim.</p>
          <div className="progress-copy">
            <span>{room.answersSubmitted} von {room.activeAnswerers} haben geantwortet</span>
            <strong>{Math.round(answerProgress)} %</strong>
          </div>
          <div className="progress-track"><span style={{ width: `${Math.min(100, answerProgress)}%` }} /></div>
          <span className="private-answer-note"><Users size={15} /> Warte auf die anderen Spieler.</span>
        </section>
      )}

      <div className="game-footer-actions">
        {isHost && <button type="button" className="text-button" onClick={() => void onEnd()}><Flag size={16} /> Spiel vorzeitig beenden</button>}
        <button type="button" className="text-button" onClick={() => void onLeave()}><LogOut size={16} /> Verlassen</button>
      </div>
    </div>
  );
}
