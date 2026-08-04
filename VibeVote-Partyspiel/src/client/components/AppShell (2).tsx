import type { ReactNode } from 'react';
import { Radio, Sparkles, Wifi, WifiOff, X } from 'lucide-react';
import type { ServerNotice } from '../../shared/types';

interface AppShellProps {
  connected: boolean;
  reconnecting: boolean;
  toast?: ServerNotice;
  onDismissToast: () => void;
  children: ReactNode;
}

export function Brand() {
  return (
    <div className="brand" aria-label="VibeVote">
      <span className="brand-mark"><Sparkles size={20} /></span>
      <span>VibeVote</span>
    </div>
  );
}

export function AppShell({ connected, reconnecting, toast, onDismissToast, children }: AppShellProps) {
  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="global-header">
        <Brand />
        <div className={`connection-pill ${connected ? 'is-online' : 'is-offline'}`}>
          {connected ? <Wifi size={14} /> : <WifiOff size={14} />}
          <span>{connected ? (reconnecting ? 'Synchronisiere …' : 'Live verbunden') : 'Verbindung getrennt'}</span>
          {connected && <Radio size={11} className="connection-pulse" />}
        </div>
      </header>

      {!connected && (
        <div className="offline-banner" role="status">
          Verbindung unterbrochen – deine Sitzung wird automatisch wiederhergestellt.
        </div>
      )}

      <main className="main-content">{children}</main>

      {toast && (
        <div className={`toast toast-${toast.type}`} role="status">
          <span>{toast.message}</span>
          <button type="button" onClick={onDismissToast} aria-label="Hinweis schließen">
            <X size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
