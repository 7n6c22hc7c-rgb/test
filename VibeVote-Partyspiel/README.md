# VibeVote – gemeinsame Partyspiele

VibeVote ist eine responsive Echtzeit-Webanwendung für gemeinsame Spielrunden auf mehreren Smartphones. Eine Person erstellt einen Raum, teilt den fünfstelligen Code und übernimmt zunächst die Host-Rolle. Vollständig spielbar sind:

- **Wer würde eher?** mit 120 Partyfragen, geheimer Abstimmung und gemeinsamen Ergebnissen
- **Schätzfragen** mit 120 Wissens- und Zahlenfragen, Kategorien, Schwierigkeitsstufen und serverseitiger Auswertung

Die Anwendung ist keine Design-Demo. Raumverwaltung, Lobby, geheime Antworten, gemeinsame Auflösung, Statistiken, Wiederverbindung und Host-Übergabe laufen über einen echten Socket.IO-Server.

## Funktionsumfang

- Räume mit zufälligem, gut lesbarem Code erstellen und betreten
- verständliche Fehler für unbekannte Räume, leere oder doppelte Namen und bereits gestartete Spiele
- Echtzeit-Lobby mit Verbindungsstatus aller Personen
- geschützte Host-Aktionen: Spielauswahl, Einstellungen, Start, Entfernen von Personen und Schließen des Raumes
- automatische Host-Übergabe bei Verlassen oder Verbindungsabbruch
- Wiederverbindung über ein lokales Sitzungstoken
- gemeinsame Ergebnisanzeige auf allen verbundenen Geräten
- responsive Bedienung für Smartphone, Tablet und Desktop
- keine Datenbank, kein Konto und kein kostenpflichtiger Dienst erforderlich

Noch nicht umgesetzte Spiele bleiben sichtbar als „Demnächst verfügbar“.

## Spiel „Wer würde eher?“

- 120 getrennt gepflegte Fragen aus zwölf Kategorien
- 10, 20, 30, 40, 50 oder maximal 60 Fragen pro Partie
- Abstimmungstimer mit 10, 20 oder 30 Sekunden
- geheime und verbindliche Abstimmung, optional mit Selbstwahl
- automatische Ergebnisanzeige nach der letzten Stimme oder nach Timerablauf
- manueller Wechsel zur nächsten Frage durch den Host
- reduzierte Live-Statistik für die Anzahl gewählter Runden
- Abschlussrangliste und bestehende Abschlussregel

## Spiel „Schätzfragen“

### Spielprinzip

Alle Personen sehen pro Runde dieselbe Frage. Es gibt zwei Fragetypen:

1. **Zahlenfragen:** Jede Person gibt eine freie Zahl ein. Wer am weitesten von der richtigen Lösung entfernt liegt, trinkt einen Schluck. Bei gleicher größter Abweichung trinken alle betroffenen Personen.
2. **Auswahlfragen:** Jede Person wählt eine von drei bis sechs angebotenen Antworten. Alle falschen Antworten führen zu einem Schluck; wenn alle richtig antworten, trinkt niemand.

Antworten bleiben bis zur Auflösung geheim. Sobald alle aktuell aktiven Personen geantwortet haben, zeigt der Server das Ergebnis gleichzeitig auf allen Geräten. Danach bleibt die Ergebnisansicht geöffnet, bis der Host „Nächste Frage“ auswählt. Es gibt keinen automatischen Fragenwechsel.

### Einstellungen

Der Host kann vor dem Start festlegen:

- **5 bis 60 Fragen** als ganze Zahl
- Kategorien: Allgemeinwissen, Geographie, Geschichte, Sport, Natur und Kultur
- Schwierigkeitsstufen: Leicht, Mittel und Schwer

Kategorien und Schwierigkeitsstufen erlauben Mehrfachauswahl sowie „Alle auswählen“ und „Alle abwählen“. Die Anwendung zeigt die Größe des passenden Pools an und begrenzt die Rundenzahl automatisch, wenn weniger Fragen verfügbar sind. Ohne Kategorie, Schwierigkeitsstufe, genügend Fragen oder mindestens zwei verbundene Personen ist kein Start möglich.

### Fragenbestand

Der Pool enthält genau 120 eindeutige Fragen:

- 20 Fragen pro Kategorie
- je Kategorie 7 leichte, 7 mittlere und 6 schwere Fragen
- Mischung aus Zahlen- und Auswahlfragen
- keine Wiederholung innerhalb derselben Partie
- richtige Lösung und Auswertung ausschließlich auf dem Server

Zahlenfelder unterstützen je nach Frage ganze Zahlen, Dezimalzahlen und ausdrücklich erlaubte negative Werte. Ungültige, nicht endliche oder manipulierte Werte werden zusätzlich serverseitig abgelehnt. Bei Auswahlfragen akzeptiert der Server ausschließlich angebotene Antworten.

### Statistiken und Auszeichnungen

Für jede Person erfasst der Server:

- beantwortete Fragen
- richtige Auswahlantworten
- verlorene Zahlenfragen
- Runden mit Trinkfolge
- gesamte, durchschnittliche und größte Abweichung bei Zahlenfragen

Die Abschlussansicht vergibt bei Gleichständen alle passenden Namen:

- **Schätzmeister:** niedrigste durchschnittliche Abweichung; dafür sind mindestens drei Zahlenantworten erforderlich
- **Wissensmeister:** meiste richtige Auswahlantworten
- **Am weitesten daneben:** meiste verlorene Zahlenfragen
- **Trinkmeister:** meiste Runden mit Trinkfolge

## Voraussetzungen

- [Node.js](https://nodejs.org/) ab Version 20.19
- npm ab Version 10
- für mehrere Smartphones im lokalen Test: alle Geräte im selben Netzwerk

## Installation

```bash
npm install
```

Für eine exakt reproduzierbare Installation mit vorhandener Lockdatei:

```bash
npm ci
```

## Entwicklung starten

```bash
npm run dev
```

Danach stehen standardmäßig zur Verfügung:

- Oberfläche: `http://localhost:5173`
- Socket.IO-Server und API: `http://localhost:3001`

Vite leitet in der Entwicklung `/socket.io` und `/api` automatisch an den Server weiter. Der gemeinsame Entwicklungsstarter reicht zusätzliche Vite-Argumente weiter und beendet beide Prozesse gemeinsam.

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

Der Health-Endpunkt `GET /api/health` meldet den Serverstatus und die Größe beider Fragenpools.

## Tests und Qualitätsprüfungen

```bash
# Automatisierte Unit- und Multiplayer-Integrationstests
npm test

# TypeScript-Prüfung
npm run typecheck

# Frontend- und Backend-Produktions-Build
npm run build
```

Die Tests prüfen unter anderem:

- 120 eindeutige Schätzfragen und ihre Verteilung
- gültige Lösungen und Auswahlmöglichkeiten
- Filterung nach Kategorie und Schwierigkeitsstufe
- Rundenzahl und automatische Begrenzung auf den verfügbaren Pool
- Zahlenvalidierung einschließlich Dezimal- und Negativregeln
- Ablehnung manipulierter Auswahlantworten
- Berechnung der absoluten Abweichung
- eindeutige Verlierer und Gleichstände
- alle richtig beziehungsweise alle falsch bei Auswahlfragen
- keine Fragewiederholung
- automatische Auflösung nach der letzten aktiven Antwort
- manuelles Weitergehen ausschließlich durch den Host
- Verhalten beim Verlassen und bei Verbindungsabbrüchen
- Wiederverbindung mit erhaltener eigener Antwort
- personalisierte, geheime Socket.IO-Zustände
- synchrones Ergebnis für drei Socket.IO-Clients
- bestehende Abläufe von „Wer würde eher?“

## Architektur

Die Anwendung verwendet einen gemeinsamen TypeScript-Codebestand:

- **React + Vite** rendert die Oberfläche und hält nur lokalen UI-Zustand wie eine noch nicht bestätigte Eingabe.
- **Node.js + Express** liefert die Produktionsdateien und den Health-Endpunkt aus.
- **Socket.IO** synchronisiert Lobby, Antworten, Ergebnisse und Statistiken in Echtzeit.
- **RoomManager** verwaltet Räume, Rechte, Phasen und den gemeinsamen Spielzustand.
- **Estimation-Module** filtern Fragen, validieren Antworten und berechnen Ergebnisse auf dem Server.
- **Shared Types** definieren das Datenmodell für Browser und Server.

Nach jeder relevanten Änderung erhält jedes Gerät einen personalisierten `RoomSnapshot`. Vor der Auflösung enthält dieser weder die richtige Lösung noch Antworten anderer Personen. Nur das eigene Gerät erhält die bereits bestätigte eigene Antwort, damit eine Wiederverbindung korrekt fortgesetzt werden kann.

### Datenhaltung

Räume und Spielstände liegen im Arbeitsspeicher des Servers. Bei einem Serverneustart werden aktive Räume gelöscht. Das Sitzungstoken liegt im `localStorage` des jeweiligen Browsers und ermöglicht standardmäßig 60 Sekunden lang eine Wiederverbindung. Für mehrere parallel laufende Serverinstanzen wäre später eine gemeinsame Redis- oder Datenbankschicht erforderlich.

## Projektstruktur

```text
.
├── scripts
│   └── dev.mjs                         Gemeinsamer lokaler Entwicklungsstarter
├── src
│   ├── client
│   │   ├── components                  Wiederverwendbare UI-Bausteine
│   │   ├── games/estimation
│   │   │   ├── EstimationSettings.tsx
│   │   │   ├── EstimationGameScreen.tsx
│   │   │   ├── EstimationProgress.tsx
│   │   │   ├── EstimationResult.tsx
│   │   │   └── EstimationFinishedScreen.tsx
│   │   ├── screens                     Start, Lobby und „Wer würde eher?“
│   │   ├── App.tsx                     Socket-Zustand und Navigation
│   │   ├── socket.ts                   Bestätigte Socket.IO-Aufrufe
│   │   └── styles.css                  Responsives Design und Animationen
│   ├── server
│   │   ├── games/estimation
│   │   │   ├── estimationQuestions.ts  120 serverseitige Fragen
│   │   │   ├── estimationGame.ts       Filter und Validierung
│   │   │   └── estimationScoring.ts    Ergebnis und Statistik
│   │   ├── RoomManager.ts              Räume, Rechte und Spielfluss
│   │   ├── gameUtils.ts                „Wer würde eher?“-Auswertung
│   │   ├── socketHandlers.ts           Socket.IO-Ereignisse
│   │   └── index.ts                    Express-/Socket.IO-Server
│   └── shared
│       ├── estimationTypes.ts           Gemeinsame Schätzfragen-Typen
│       ├── questions.ts                 120 „Wer würde eher?“-Fragen
│       └── types.ts                     Gemeinsamer Raumzustand
├── tests                                Unit- und Multiplayer-Tests
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Socket.IO-Ereignisse

| Client an Server | Zweck |
| --- | --- |
| `room:create`, `room:join`, `room:reconnect` | Sitzung herstellen |
| `room:select-game` | verfügbares Spiel auswählen |
| `room:update-settings` | „Wer würde eher?“-Einstellungen ändern |
| `estimation:update-settings` | Kategorien, Schwierigkeit und Rundenzahl ändern |
| `room:kick`, `room:close`, `room:leave` | Raum verwalten |
| `game:start`, `game:next`, `game:end`, `game:restart` | gemeinsamen Spielfluss steuern |
| `game:vote` | geheime Stimme bei „Wer würde eher?“ abgeben |
| `estimation:submit-answer` | validierte Schätz- oder Auswahlantwort abgeben |
| `game:return-lobby` | zu Einstellungen und Spielauswahl zurückkehren |

| Server an Client | Zweck |
| --- | --- |
| `room:state` | personalisierter gemeinsamer Raumzustand |
| `room:notice` | Beitritt, Abbruch oder Host-Wechsel |
| `room:closed`, `player:kicked` | Sitzung sauber beenden |

## Neue Schätzfragen ergänzen

Neue Fragen werden in `src/server/games/estimation/estimationQuestions.ts` ergänzt. Jede ID und jeder Fragetext müssen eindeutig sein.

Zahlenfrage:

```ts
n('geo-m-08', 'Geographie', 'Mittel', 'Wie lang ist ...?', 1234, {
  unit: 'Kilometer',
  allowDecimals: false,
  allowNegative: false,
});
```

Auswahlfrage:

```ts
c(
  'kul-m-08',
  'Kultur',
  'Mittel',
  'Wer schuf ...?',
  'Richtige Antwort',
  ['Antwort A', 'Richtige Antwort', 'Antwort C', 'Antwort D'],
);
```

Danach `npm test` ausführen. Die Tests erkennen doppelte IDs oder Texte, ungültige Auswahlmöglichkeiten und eine fehlerhafte Verteilung.

## Bereitstellung auf Render

Für einen Render-Web-Service:

- Runtime: **Node**
- Build Command: `npm ci && npm run build`
- Start Command: `npm start`
- Health Check Path: `/api/health`

Render setzt `PORT` automatisch; der Server bindet an `0.0.0.0` und verwendet diesen Wert. Es ist keine zusätzliche Datenbank erforderlich. Da Räume im Arbeitsspeicher liegen, sollte diese Version mit genau einer laufenden Instanz betrieben werden.

Nach Änderungen empfiehlt sich „Deploy latest commit“. Falls Render alte Dateien zwischenspeichert, kann einmalig „Clear build cache & deploy“ verwendet werden.
