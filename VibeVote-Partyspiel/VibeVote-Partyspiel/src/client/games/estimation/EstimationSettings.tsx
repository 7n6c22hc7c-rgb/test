import { Check, Clock3, Layers3, SlidersHorizontal } from 'lucide-react';
import {
  ESTIMATION_CATEGORIES,
  ESTIMATION_DIFFICULTIES,
  ESTIMATION_TIMER_OPTIONS,
  type EstimationCategory,
  type EstimationDifficulty,
  type EstimationSettings as EstimationSettingsType,
} from '../../../shared/estimationTypes';

interface EstimationSettingsProps {
  settings: EstimationSettingsType;
  availableQuestions: number;
  isHost: boolean;
  onUpdate: (update: Partial<EstimationSettingsType>) => Promise<void>;
}

function toggleValue<T extends string>(values: T[], value: T): T[] {
  return values.includes(value)
    ? values.filter((entry) => entry !== value)
    : [...values, value];
}

export function EstimationSettings({
  settings,
  availableQuestions,
  isHost,
  onUpdate,
}: EstimationSettingsProps) {
  const allCategoriesSelected = settings.categories.length === ESTIMATION_CATEGORIES.length;
  const allDifficultiesSelected = settings.difficulties.length === ESTIMATION_DIFFICULTIES.length;
  const maximumRounds = Math.min(60, Math.max(5, availableQuestions));

  const toggleCategory = (category: EstimationCategory) => {
    void onUpdate({ categories: toggleValue(settings.categories, category) });
  };
  const toggleDifficulty = (difficulty: EstimationDifficulty) => {
    void onUpdate({ difficulties: toggleValue(settings.difficulties, difficulty) });
  };

  return (
    <div className="estimation-settings">
      <fieldset disabled={!isHost}>
        <div className="settings-legend-row">
          <span className="settings-label">Anzahl der Fragen</span>
          <output>{settings.roundLimit}</output>
        </div>
        <input
          className="round-range"
          type="range"
          min={5}
          max={maximumRounds}
          step={1}
          value={Math.min(settings.roundLimit, maximumRounds)}
          onChange={(event) => void onUpdate({ roundLimit: Number(event.target.value) })}
          aria-label="Anzahl der Schätzfragen"
        />
        <div className={`availability-note ${availableQuestions < 5 ? 'is-warning' : ''}`}>
          <Layers3 size={17} />
          <span>Für deine Auswahl stehen <strong>{availableQuestions} Fragen</strong> zur Verfügung.</span>
        </div>
      </fieldset>

      <fieldset disabled={!isHost}>
        <div className="settings-legend-row">
          <span className="settings-label"><Clock3 size={15} /> Antwortzeit</span>
          <output>{settings.timerSeconds}s</output>
        </div>
        <div className="segmented-control estimation-timer-control">
          {ESTIMATION_TIMER_OPTIONS.map((seconds) => (
            <button
              type="button"
              className={settings.timerSeconds === seconds ? 'is-active' : ''}
              key={seconds}
              onClick={() => void onUpdate({ timerSeconds: seconds })}
            >
              {seconds}s
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset disabled={!isHost}>
        <div className="settings-legend-row">
          <span className="settings-label">Themen</span>
          <button
            type="button"
            className="mini-action"
            onClick={() => void onUpdate({
              categories: allCategoriesSelected ? [] : [...ESTIMATION_CATEGORIES],
            })}
          >
            {allCategoriesSelected ? 'Alle abwählen' : 'Alle auswählen'}
          </button>
        </div>
        <div className="filter-chip-grid category-chips">
          {ESTIMATION_CATEGORIES.map((category) => {
            const selected = settings.categories.includes(category);
            return (
              <button
                type="button"
                key={category}
                className={`filter-chip ${selected ? 'is-active' : ''}`}
                aria-pressed={selected}
                onClick={() => toggleCategory(category)}
              >
                <span className="chip-check"><Check size={13} /></span>{category}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset disabled={!isHost}>
        <div className="settings-legend-row">
          <span className="settings-label">Schwierigkeit</span>
          <button
            type="button"
            className="mini-action"
            onClick={() => void onUpdate({
              difficulties: allDifficultiesSelected ? [] : [...ESTIMATION_DIFFICULTIES],
            })}
          >
            {allDifficultiesSelected ? 'Alle abwählen' : 'Alle auswählen'}
          </button>
        </div>
        <div className="filter-chip-grid difficulty-chips">
          {ESTIMATION_DIFFICULTIES.map((difficulty) => {
            const selected = settings.difficulties.includes(difficulty);
            return (
              <button
                type="button"
                key={difficulty}
                className={`filter-chip difficulty-${difficulty.toLowerCase()} ${selected ? 'is-active' : ''}`}
                aria-pressed={selected}
                onClick={() => toggleDifficulty(difficulty)}
              >
                <span className="chip-check"><Check size={13} /></span>{difficulty}
              </button>
            );
          })}
        </div>
      </fieldset>

      {!isHost && (
        <p className="settings-readonly-note"><SlidersHorizontal size={16} /> Diese Auswahl kann nur der Host ändern.</p>
      )}
    </div>
  );
}
