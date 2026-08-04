import {
  Check,
  Clock3,
  Calculator,
  Copy,
  Crown,
  DoorOpen,
  Gamepad2,
  LockKeyhole,
  LogOut,
  Play,
  Share2,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserRoundX,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import type { EstimationSettings } from '../../shared/estimationTypes';
import type { GameId, RoomSettings, RoomSnapshot } from '../../shared/types';
import { EstimationSettings as EstimationSettingsPanel } from '../games/estimation/EstimationSettings';

interface LobbyScreenProps {
  room: RoomSnapshot;
  playerId: string;
  onUpdateSettings: (settings: Partial<RoomSettings>) => Promise<void>;
  onUpdateEstimationSettings: (settings: Partial<EstimationSettings>) => Promise<void>;
  onSelectGame: (gameId: GameId) => Promise<void>;
  onStart: (acceptedResponsibility: boolean) => Promise<void>;
  onKick: (playerId: string) => Promise<void>;
  onClose: () => Promise<void>;
  onLeave: () => Promise<void>;
}

const upcomingGames = [
  { name: 'Wahrheit oder Pflicht', icon: '◎' },
  { name: 'Ich habe noch nie', icon: '✦' },
  { name: 'Kategorien', icon: '▦' },
];

export function LobbyScreen({
  room,
  playerId,
  onUpdateSettings,
  onUpdateEstimationSettings,
  onSelectGame,
  onStart,
  onKick,
  onClose,
  onLeave,
}: LobbyScreenProps) {
  const [accepted, setAccepted] = useState(false);
  const [copied, setCopied] = useState(false);
  const isHost = room.hostId === playerId;
  const connectedCount = room.players.filter((player) => player.connected).length;
  const estimationReady = room.estimationSettings.categories.length > 0
    && room.estimationSettings.difficulties.length > 0
    && room.estimationSettings.roundLimit >= 5
    && room.estimationSettings.roundLimit <= 60
    && room.estimationSettings.roundLimit <= room.availableEstimationQuestions;

  const copyCode = async () => {
    await navigator.clipboard.writeText(room.code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1_800);
  };

  const shareCode = async () => {
    if (navigator.share) {
      await navigator.share({
        title: 'VibeVote Raum',
        text: `Komm in meinen VibeVote-Raum. Der Code ist ${room.code}.`,
        url: window.location.origin,
      });
    } else {
      await copyCode();
    }
  };

  return (
    <div className="room-layout page-enter">
      <section className="room-hero glass-card">
        <div>
          <div className="eyebrow"><Users size={15} /> Lobby · {connectedCount} verbunden</div>
          <h1>Bereit für ehrliche Antworten?</h1>
          <p>Teile den Code. Sobald alle da sind, kann der Host die Runde starten.</p>
        </div>
        <div className="room-code-panel">
          <span>Raumcode</span>
          <strong>{room.code}</strong>
          <div>
            <button type="button" className="icon-text-button" onClick={() => void copyCode()}>
              {copied ? <Check size={17} /> : <Copy size={17} />} {copied ? 'Kopiert' : 'Kopieren'}
            </button>
            <button type="button" className="icon-button" onClick={() => void shareCode()} aria-label="Raumcode teilen">
              <Share2 size={18} />
            </button>
          </div>
        </div>
      </section>

      <div className="lobby-grid">
        <section className="glass-card lobby-section">
          <div className="section-heading">
            <div><span className="section-icon"><Users size={19} /></span><div><h2>Mitspieler</h2><p>{room.players.length} im Raum</p></div></div>
          </div>
          <div className="player-list">
            {room.players.map((player, index) => (
              <div className={`lobby-player ${!player.connected ? 'is-disconnected' : ''}`} key={player.playerId}>
                <span className={`avatar avatar-${index % 5}`}>{player.name.slice(0, 1).toUpperCase()}</span>
                <div className="player-name-wrap">
                  <strong>{player.name}{player.playerId === playerId ? ' (du)' : ''}</strong>
                  <span>{player.connected ? 'Bereit' : 'Verbindung unterbrochen'}</span>
                </div>
                {player.isHost && <span className="host-badge"><Crown size={13} /> Host</span>}
                {isHost && !player.isHost && (
                  <button
                    type="button"
                    className="danger-icon-button"
                    onClick={() => void onKick(player.playerId)}
                    aria-label={`${player.name} entfernen`}
                  >
                    <UserRoundX size={17} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="glass-card lobby-section game-selection">
          <div className="section-heading">
            <div><span className="section-icon purple"><Gamepad2 size={19} /></span><div><h2>Spiel auswählen</h2><p>Mehr Spiele folgen</p></div></div>
          </div>

          <button
            type="button"
            className={`game-card selectable-game ${room.selectedGame === 'would-you-rather' ? 'selected-game' : ''}`}
            aria-pressed={room.selectedGame === 'would-you-rather'}
            disabled={!isHost}
            onClick={() => void onSelectGame('would-you-rather')}
          >
            <span className="game-art"><Sparkles size={27} /></span>
            <span><strong>Wer würde eher?</strong><small>Geheim abstimmen, gemeinsam auflösen</small></span>
            {room.selectedGame === 'would-you-rather' && <span className="selected-badge"><Check size={13} /> Ausgewählt</span>}
          </button>

          <button
            type="button"
            className={`game-card selectable-game estimation-game-card ${room.selectedGame === 'estimation' ? 'selected-game' : ''}`}
            aria-pressed={room.selectedGame === 'estimation'}
            disabled={!isHost}
            onClick={() => void onSelectGame('estimation')}
          >
            <span className="game-art estimation-art"><Calculator size={27} /></span>
            <span><strong>Schätzfragen</strong><small>Zahlen schätzen & Wissen testen</small></span>
            {room.selectedGame === 'estimation' && <span className="selected-badge"><Check size={13} /> Ausgewählt</span>}
          </button>

          <div className="upcoming-grid">
            {upcomingGames.map((game) => (
              <div className="game-card upcoming-game" key={game.name}>
                <span className="upcoming-icon">{game.icon}</span>
                <span><strong>{game.name}</strong><small>Demnächst verfügbar</small></span>
                <LockKeyhole size={15} />
              </div>
            ))}
          </div>
        </section>

        <section className="glass-card lobby-section settings-section">
          <div className="section-heading">
            <div><span className="section-icon orange"><Clock3 size={19} /></span><div><h2>Rundeneinstellungen</h2><p>{isHost ? 'Du legst die Runde fest' : 'Vom Host festgelegt'}</p></div></div>
          </div>

          {room.selectedGame === 'estimation' ? (
            <EstimationSettingsPanel
              settings={room.estimationSettings}
              availableQuestions={room.availableEstimationQuestions}
              isHost={isHost}
              onUpdate={onUpdateEstimationSettings}
            />
          ) : <div className="settings-form">
            <fieldset disabled={!isHost}>
              <legend>Anzahl der Fragen</legend>
              <div className="segmented-control six-items">
                {([10, 20, 30, 40, 50, 60] as const).map((limit) => (
                  <button
                    type="button"
                    className={room.settings.roundLimit === limit ? 'is-active' : ''}
                    key={limit}
                    onClick={() => void onUpdateSettings({ roundLimit: limit })}
                  >
                    {limit}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset disabled={!isHost}>
              <legend>Abstimmungszeit</legend>
              <div className="segmented-control three-items">
                {([10, 20, 30] as const).map((seconds) => (
                  <button
                    type="button"
                    className={room.settings.timerSeconds === seconds ? 'is-active' : ''}
                    key={seconds}
                    onClick={() => void onUpdateSettings({ timerSeconds: seconds })}
                  >
                    {seconds}s
                  </button>
                ))}
              </div>
            </fieldset>

            <label className={`switch-row ${!isHost ? 'is-disabled' : ''}`}>
              <span><strong>Für sich selbst stimmen</strong><small>Die eigene Karte wird zur Auswahl angezeigt.</small></span>
              <input
                type="checkbox"
                checked={room.settings.allowSelfVote}
                disabled={!isHost}
                onChange={(event) => void onUpdateSettings({ allowSelfVote: event.target.checked })}
              />
              <span className="switch-control" />
            </label>

          </div>}
        </section>
      </div>

      <section className="responsibility-note">
        <ShieldCheck size={23} />
        <div>
          <strong>Verantwortungsvoll spielen</strong>
          <p>Dieses Spiel ist ausschließlich für volljährige Personen bestimmt. Trinkt verantwortungslos. Jeder muss Alkohol trinken. Das Spiel nur mit alkoholischen Getränken gespielt werden.</p>
          {isHost && (
            <label className="accept-check">
              <input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} />
              <span>Hinweis gelesen und verstanden</span>
            </label>
          )}
        </div>
      </section>

      {isHost ? (
        <div className="lobby-actions">
          <button type="button" className="secondary-button danger-button" onClick={() => void onClose()}>
            <Trash2 size={18} /> Raum schließen
          </button>
          <button
            type="button"
            className="primary-button large-button start-button"
            onClick={() => void onStart(accepted)}
            disabled={connectedCount < 2 || !accepted || (room.selectedGame === 'estimation' && !estimationReady)}
          >
            <Play size={20} fill="currentColor" /> Spiel starten
          </button>
        </div>
      ) : (
        <div className="waiting-host">
          <span className="waiting-dots"><i /><i /><i /></span>
          Warte darauf, dass der Host das Spiel startet.
        </div>
      )}

      <button type="button" className="text-button leave-button" onClick={() => void onLeave()}>
        <LogOut size={17} /> Raum verlassen
      </button>
    </div>
  );
}
