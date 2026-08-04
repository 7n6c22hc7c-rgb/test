import { ArrowRight, Gamepad2, KeyRound, PartyPopper, ShieldCheck, Sparkles, UserRoundPlus } from 'lucide-react';
import { type FormEvent, useState } from 'react';

interface HomeScreenProps {
  error?: string;
  busy: boolean;
  onCreate: (name: string) => Promise<void>;
  onJoin: (code: string, name: string) => Promise<void>;
}

export function HomeScreen({ error, busy, onCreate, onJoin }: HomeScreenProps) {
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (mode === 'create') void onCreate(name);
    else void onJoin(code, name);
  };

  return (
    <div className="home-layout page-enter">
      <section className="hero-copy">
        <div className="eyebrow"><Sparkles size={15} /> Gemeinsam spielen. Gemeinsam lachen.</div>
        <h1>Euer Spieleabend. Ein gemeinsamer Raum.</h1>
        <p className="hero-lead">
          Erstellt einen Raum, stimmt geheim ab oder löst gemeinsam Schätzfragen –
          synchron auf euren eigenen Smartphones.
        </p>

        <div className="feature-row" aria-label="Vorteile">
          <span><Gamepad2 size={17} /> Kein Download</span>
          <span><PartyPopper size={17} /> 240 Fragen in zwei Spielen</span>
          <span><ShieldCheck size={17} /> Geheime Antworten</span>
        </div>
      </section>

      <section className="join-card glass-card">
        <div className="mode-tabs" role="tablist" aria-label="Raumaktion wählen">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'create'}
            className={mode === 'create' ? 'is-active' : ''}
            onClick={() => setMode('create')}
          >
            <UserRoundPlus size={18} /> Raum erstellen
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'join'}
            className={mode === 'join' ? 'is-active' : ''}
            onClick={() => setMode('join')}
          >
            <KeyRound size={18} /> Beitreten
          </button>
        </div>

        <form className="join-form" onSubmit={submit}>
          <div>
            <label htmlFor="player-name">Dein Name</label>
            <input
              id="player-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="z. B. Moritz"
              autoComplete="nickname"
              maxLength={24}
              autoFocus
            />
          </div>

          {mode === 'join' && (
            <div className="field-enter">
              <label htmlFor="room-code">Raumcode</label>
              <input
                id="room-code"
                className="code-input"
                value={code}
                onChange={(event) => setCode(event.target.value.toUpperCase().replace(/\s/g, ''))}
                placeholder="ABCDE"
                autoComplete="off"
                maxLength={6}
              />
            </div>
          )}

          {error && <div className="form-error" role="alert">{error}</div>}

          <button type="submit" className="primary-button large-button" disabled={busy}>
            {busy ? 'Einen Moment …' : mode === 'create' ? 'Raum erstellen' : 'Raum beitreten'}
            {!busy && <ArrowRight size={20} />}
          </button>
        </form>

        <p className="join-footnote">Alle Personen öffnen diese Seite auf dem eigenen Gerät.</p>
      </section>

      <section className="how-it-works">
        <div><span>01</span><strong>Raumcode teilen</strong><p>Eine Person erstellt die Lobby.</p></div>
        <div><span>02</span><strong>Geheim antworten</strong><p>Jede Eingabe bleibt bis zur Auflösung verborgen.</p></div>
        <div><span>03</span><strong>Ergebnis feiern</strong><p>Alle sehen das Resultat gleichzeitig.</p></div>
      </section>

      <p className="responsibility-note compact-note">
        <ShieldCheck size={18} /> Ausschließlich für Volljährige. Jeder muss Alkohol trinken! Das Spiel funktioniert nur mit alkoholischen Getränken.
      </p>
    </div>
  );
}
