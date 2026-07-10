# VibeVote – gemeinsames Partyspiel

VibeVote ist eine responsive Echtzeit-Webanwendung für gemeinsame Spielrunden auf mehreren Smartphones. Eine Person erstellt einen Raum, teilt den fünfstelligen Code und übernimmt zunächst die Host-Rolle. Die erste vollständig umgesetzte Spielart ist **„Wer würde eher?“** mit 120 Fragen.

Die Anwendung ist keine Design-Demo: Raumverwaltung, Lobby, geheime Abstimmungen, Timer, gemeinsame Ergebnisanzeige, Statistiken, Wiederverbindung und Host-Übergabe laufen über einen echten Socket.IO-Server.

## Funktionsumfang

- Räume mit zufälligem, gut lesbarem Code erstellen und betreten
- Prüfung auf unbekannte Räume, leere oder doppelte Namen und bereits gestartete Spiele
- Echtzeit-Lobby mit Verbindungsstatus aller Personen
- geschützte Host-Aktionen: Einstellungen, Start, Entfernen von Personen und Schließen des Raumes
- Platzhalter für weitere Spiele
- 120 getrennt gepflegte Fragen aus zwölf Kategorien
- zufällig gemischter Fragenpool ohne Wiederholungen innerhalb einer Partie
- 10, 20, 30, 40, 50 oder maximal 60 Fragen pro Partie
- geheime und verbindliche Abstimmung, optional mit Selbstwahl
- Abstimmungstimer mit 10, 20 oder 30 Sekunden
- synchrones Ergebnis mit Gleichstandsregel und Konfetti
- fortlaufende Stimmen-, Runden- und Schluckstatistik
- Abschlussrangliste einschließlich erster und letzter Plätze bei Gleichständen
- neue Partie mit derselben Gruppe oder Rückkehr zur Spielauswahl
- Wiederverbindung über ein lokales Sitzungstoken
- automatische Host-Übergabe bei Verlassen oder Verbindungsabbruch
- responsive Bedienung für Smartphone, Tablet und Desktop

## Voraussetzungen

- [Node.js](https://nodejs.org/) ab Version 20.19
- npm ab Version 10
- für mehrere Smartphones: alle Geräte befinden sich im selben lokalen Netzwerk

Es werden keine Datenbank, kein Konto und kein kostenpflichtiger Dienst benötigt.

## Installation

```bash
npm install
```

## Entwicklung starten

```bash
npm run dev
```

Danach stehen standardmäßig zur Verfügung:

- Oberfläche: `http://localhost:5173`
- Socket.IO-Server und API: `http://localhost:3001`

Vite leitet in der Entwicklung `/socket.io` und `/api` automatisch an den Server weiter.

### Mit mehreren Smartphones im WLAN testen

1. Rechner und Smartphones mit demselben WLAN verbinden.
2. Lokale IP-Adresse des Rechners ermitteln:
   - Windows: `ipconfig`
   - macOS/Linux: `ifconfig` oder `ip addr`
3. Auf jedem Smartphone `http://IP-DES-RECHNERS:5173` öffnen, zum Beispiel `http://192.168.178.42:5173`.
4. Falls der Zugriff blockiert wird, Node.js beziehungsweise die Ports 5173 und 3001 in der lokalen Firewall zulassen.

## Produktionsversion bauen und starten

```bash
npm run build
npm start
```

Die gebaute Anwendung ist anschließend vollständig unter `http://localhost:3001` erreichbar. Ein anderer Port kann über die Umgebungsvariable `PORT` gesetzt werden.

macOS/Linux:

```bash
PORT=8080 npm start
```

Windows PowerShell:

```powershell
$env:PORT=8080; npm start
```

## Tests und Qualitätsprüfungen

```bash
# Automatisierte Unit- und Multiplayer-Integrationstests
npm test

# TypeScript-Prüfung
npm run typecheck

# Vollständiger Produktions-Build
npm run build
```

Die Tests prüfen unter anderem:

- Anzahl und Eindeutigkeit der Fragen
- Mischen ohne Verlust oder Duplikate
- eindeutige Ergebnisse und Gleichstände
- Abschlussstatistik und einmalige Bonusregel
- keine Fragewiederholung in einer Partie
- Timer bei unvollständiger Abstimmung
- doppelte Namen und unbekannte Raumcodes
- geschützte Host-Aktionen
- synchronen Zustand für mehrere Socket.IO-Clients
- Wiederverbindung und Host-Übergabe

## Architektur

Die Anwendung verwendet einen gemeinsamen TypeScript-Codebestand:

- **React + Vite** rendert die Oberfläche und verwaltet ausschließlich lokalen UI-Zustand wie die aktuell markierte Auswahl.
- **Node.js + Express** liefert die Produktionsdateien und einen Health-Endpunkt aus.
- **Socket.IO** synchronisiert Lobby, Abstimmung, Ergebnisse und Statistiken in Echtzeit.
- **RoomManager** ist die autoritative Spiellogik. Stimmen, Tokens und Timer werden ausschließlich auf dem Server verarbeitet.
- **Shared Types** definieren dasselbe Datenmodell für Browser und Server.

Der Server sendet nach jeder relevanten Änderung einen öffentlichen `RoomSnapshot` an alle Geräte des Raumes. Die konkrete Wahl einer anderen Person wird darin nicht übertragen; sichtbar ist nur, wie viele Personen bereits abgestimmt haben.

### Datenhaltung

Räume und Spielstände werden absichtlich nur im Arbeitsspeicher des lokalen Servers gehalten. Dadurch funktioniert die erste Version ohne externe Dienste. Bei einem Neustart des Servers werden aktive Räume gelöscht. Für einen späteren dauerhaften oder horizontal skalierten Betrieb kann die `RoomManager`-Schicht durch eine Redis- oder Datenbankanbindung ergänzt werden.

Das Sitzungstoken liegt im `localStorage` des jeweiligen Browsers und erlaubt eine Wiederverbindung innerhalb von 60 Sekunden. Es wird nicht an andere Spieler gesendet.

## Projektstruktur

```text
.
├── src
│   ├── client
│   │   ├── components       Wiederverwendbare UI-Bausteine
│   │   ├── screens          Start, Lobby, Spiel und Abschluss
│   │   ├── App.tsx          Socket-Zustand und Seitennavigation
│   │   ├── socket.ts        Bestätigte Socket.IO-Aufrufe
│   │   ├── styles.css       Responsives Design und Animationen
│   │   └── wording.ts       Kompatibilität mit älteren Deployments
│   ├── server
│   │   ├── RoomManager.ts   Räume, Rechte, Timer und Spielfluss
│   │   ├── gameUtils.ts     Mischen, Ergebnisse und Statistik
│   │   ├── socketHandlers.ts Socket.IO-Ereignisse und Fehlerantworten
│   │   └── index.ts         Express-/Socket.IO-Server
│   └── shared
│       ├── questions.ts     120 separat bearbeitbare Fragen
│       └── types.ts         Gemeinsame Datenmodelle
├── tests                    Unit- und Multiplayer-Integrationstests
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Wichtige Socket.IO-Ereignisse

| Client an Server | Zweck |
| --- | --- |
| `room:create`, `room:join`, `room:reconnect` | Sitzung herstellen |
| `room:update-settings`, `room:kick`, `room:close` | Lobby verwalten |
| `game:start`, `game:vote`, `game:reveal` | Partie und Abstimmung |
| `game:next`, `game:end`, `game:restart` | Spielfluss steuern |
| `game:return-lobby`, `room:leave` | Navigation und Austritt |

| Server an Client | Zweck |
| --- | --- |
| `room:state` | gemeinsamer, öffentlicher Raumzustand |
| `room:notice` | Beitritt, Abbruch oder Host-Wechsel |
| `room:closed`, `player:kicked` | Sitzung sauber beenden |

## Fragen ergänzen

Neue Fragen werden in `src/shared/questions.ts` als Tupel aus Kategorie und Text ergänzt. Die ID wird automatisch erzeugt. Die Spiellogik muss dafür nicht angepasst werden.

```ts
['Party', 'Wer würde eher ...?'],
```

Vor einem Commit empfiehlt sich `npm test`, da dabei auch doppelte Fragen und IDs erkannt werden.
