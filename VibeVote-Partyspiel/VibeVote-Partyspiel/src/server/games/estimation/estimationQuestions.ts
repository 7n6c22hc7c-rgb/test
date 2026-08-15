import type {
  EstimationCategory,
  EstimationChoiceQuestion,
  EstimationDifficulty,
  EstimationNumberQuestion,
  EstimationQuestion,
} from '../../../shared/estimationTypes';

interface NumberOptions {
  unit?: string;
  allowDecimals?: boolean;
  allowNegative?: boolean;
  answerNote?: string;
}

function numberQuestion(
  id: string,
  category: EstimationCategory,
  difficulty: EstimationDifficulty,
  text: string,
  correctAnswer: number,
  options: NumberOptions = {},
): EstimationNumberQuestion {
  return { id, type: 'number', category, difficulty, text, correctAnswer, ...options };
}

function choiceQuestion(
  id: string,
  category: EstimationCategory,
  difficulty: EstimationDifficulty,
  text: string,
  correctAnswer: string,
  options: string[],
  answerNote?: string,
): EstimationChoiceQuestion {
  return { id, type: 'choice', category, difficulty, text, correctAnswer, options, answerNote };
}

const n = numberQuestion;
const c = choiceQuestion;

/**
 * Die ursprünglichen 120 Fragen bleiben als eigener Block erhalten.
 * Weitere Fragen werden darunter ergänzt, ohne bestehende IDs zu verändern.
 */
const baseEstimationQuestions: EstimationQuestion[] = [
  // Allgemeinwissen · Leicht
  n('all-l-01', 'Allgemeinwissen', 'Leicht', 'Wie viele Sekunden hat eine Stunde?', 3600, { unit: 'Sekunden' }),
  n('all-l-02', 'Allgemeinwissen', 'Leicht', 'Wie viele Minuten hat ein vollständiger Tag?', 1440, { unit: 'Minuten' }),
  n('all-l-03', 'Allgemeinwissen', 'Leicht', 'Wie viele Seiten hat ein Sechseck?', 6, { unit: 'Seiten' }),
  n('all-l-04', 'Allgemeinwissen', 'Leicht', 'Wie viele Tage hat ein Schaltjahr?', 366, { unit: 'Tage' }),
  c('all-l-05', 'Allgemeinwissen', 'Leicht', 'Welcher Planet ist der Sonne am nächsten?', 'Merkur', ['Venus', 'Merkur', 'Mars', 'Erde']),
  c('all-l-06', 'Allgemeinwissen', 'Leicht', 'Welches chemische Symbol steht für Gold?', 'Au', ['Ag', 'Fe', 'Au', 'Gd']),
  c('all-l-07', 'Allgemeinwissen', 'Leicht', 'Welches ist das größte Organ des menschlichen Körpers?', 'Haut', ['Leber', 'Lunge', 'Haut', 'Gehirn']),

  // Allgemeinwissen · Mittel
  n('all-m-01', 'Allgemeinwissen', 'Mittel', 'Wie viele Knochen hat das Skelett eines erwachsenen Menschen normalerweise?', 206, { unit: 'Knochen' }),
  n('all-m-02', 'Allgemeinwissen', 'Mittel', 'Wie viele bestätigte Elemente enthält das Periodensystem?', 118, { unit: 'Elemente' }),
  n('all-m-03', 'Allgemeinwissen', 'Mittel', 'Welchen pH-Wert hat reines neutrales Wasser bei etwa 25 °C?', 7, { unit: 'pH' }),
  n('all-m-04', 'Allgemeinwissen', 'Mittel', 'Wie viele Karten enthält ein Standard-Kartenspiel ohne Joker?', 52, { unit: 'Karten' }),
  c('all-m-05', 'Allgemeinwissen', 'Mittel', 'Welche SI-Basiseinheit misst die elektrische Stromstärke?', 'Ampere', ['Volt', 'Watt', 'Ampere', 'Ohm']),
  c('all-m-06', 'Allgemeinwissen', 'Mittel', 'Welche drei Farben sind die additiven Grundfarben des Lichts?', 'Rot, Grün und Blau', ['Rot, Gelb und Blau', 'Cyan, Magenta und Gelb', 'Rot, Grün und Blau', 'Orange, Grün und Violett']),
  c('all-m-07', 'Allgemeinwissen', 'Mittel', 'In welchem Land wurde Papier nach heutigem Wissensstand zuerst hergestellt?', 'China', ['Ägypten', 'China', 'Griechenland', 'Indien']),

  // Allgemeinwissen · Schwer
  n('all-s-01', 'Allgemeinwissen', 'Schwer', 'Wie schnell ist Licht im Vakuum?', 299792.458, { unit: 'km/s', allowDecimals: true, answerNote: 'Der exakte SI-Wert beträgt 299.792,458 km/s.' }),
  n('all-s-02', 'Allgemeinwissen', 'Schwer', 'Wie viele Nullen hat eine Milliarde in der deutschen Zahlenskala?', 9, { unit: 'Nullen' }),
  n('all-s-03', 'Allgemeinwissen', 'Schwer', 'Welchen Dezimalwert hat die Binärzahl 11111111?', 255),
  c('all-s-04', 'Allgemeinwissen', 'Schwer', 'Welche dieser Zahlen ist die kleinste Primzahl?', '2', ['0', '1', '2', '3']),
  c('all-s-05', 'Allgemeinwissen', 'Schwer', 'Wie wird die Zahl 49 korrekt als römische Zahl geschrieben?', 'XLIX', ['IL', 'XLIX', 'XXXXVIIII', 'LXI']),
  c('all-s-06', 'Allgemeinwissen', 'Schwer', 'Welches Element besitzt die Ordnungszahl 79?', 'Gold', ['Silber', 'Gold', 'Platin', 'Quecksilber']),

  // Geographie · Leicht
  n('geo-l-01', 'Geographie', 'Leicht', 'Wie viele Bundesländer hat Deutschland?', 16, { unit: 'Bundesländer' }),
  n('geo-l-02', 'Geographie', 'Leicht', 'An wie viele Staaten grenzt Deutschland?', 9, { unit: 'Staaten' }),
  n('geo-l-03', 'Geographie', 'Leicht', 'Wie hoch ist die Zugspitze?', 2962, { unit: 'Meter' }),
  n('geo-l-04', 'Geographie', 'Leicht', 'Über wie viele Zeitzonen erstreckt sich Russland?', 11, { unit: 'Zeitzonen' }),
  c('geo-l-05', 'Geographie', 'Leicht', 'Was ist die Hauptstadt von Australien?', 'Canberra', ['Sydney', 'Melbourne', 'Canberra', 'Perth']),
  c('geo-l-06', 'Geographie', 'Leicht', 'Welches Land ist flächenmäßig das größte der Erde?', 'Russland', ['Kanada', 'China', 'USA', 'Russland']),
  c('geo-l-07', 'Geographie', 'Leicht', 'Welche Insel ist – Kontinente nicht mitgezählt – die größte der Erde?', 'Grönland', ['Neuguinea', 'Borneo', 'Madagaskar', 'Grönland']),

  // Geographie · Mittel
  n('geo-m-01', 'Geographie', 'Mittel', 'Wie lang ist der Rhein ungefähr?', 1233, { unit: 'Kilometer', answerNote: 'Die international verwendete Gesamtlänge beträgt rund 1.233 km.' }),
  n('geo-m-02', 'Geographie', 'Mittel', 'Wie lang ist die Donau ungefähr?', 2850, { unit: 'Kilometer', answerNote: 'Je nach Messmethode werden leicht abweichende Werte angegeben.' }),
  n('geo-m-03', 'Geographie', 'Mittel', 'Wie lang ist der Erdäquator ungefähr?', 40075, { unit: 'Kilometer' }),
  n('geo-m-04', 'Geographie', 'Mittel', 'Wie hoch ist der Mount Everest nach der gemeinsamen Vermessung Nepals und Chinas?', 8848.86, { unit: 'Meter', allowDecimals: true }),
  c('geo-m-05', 'Geographie', 'Mittel', 'Welches Land hat die längste Küstenlinie?', 'Kanada', ['Russland', 'Indonesien', 'Kanada', 'Australien']),
  c('geo-m-06', 'Geographie', 'Mittel', 'Welcher Ozean ist flächenmäßig der größte?', 'Pazifischer Ozean', ['Atlantischer Ozean', 'Indischer Ozean', 'Pazifischer Ozean', 'Arktischer Ozean']),
  c('geo-m-07', 'Geographie', 'Mittel', 'Welcher Fluss fließt durch Budapest?', 'Donau', ['Rhein', 'Donau', 'Elbe', 'Weichsel']),

  // Geographie · Schwer
  n('geo-s-01', 'Geographie', 'Schwer', 'Wie viele Kantone hat die Schweiz?', 26, { unit: 'Kantone' }),
  n('geo-s-02', 'Geographie', 'Schwer', 'Wie lang ist der Suezkanal ungefähr?', 193.3, { unit: 'Kilometer', allowDecimals: true }),
  n('geo-s-03', 'Geographie', 'Schwer', 'Wie groß ist die Fläche Mallorcas ungefähr?', 3640, { unit: 'Quadratkilometer' }),
  c('geo-s-04', 'Geographie', 'Schwer', 'Welcher Staat besitzt drei verschiedene Hauptstädte?', 'Südafrika', ['Bolivien', 'Sri Lanka', 'Südafrika', 'Niederlande']),
  c('geo-s-05', 'Geographie', 'Schwer', 'Welcher Staat ist vollständig von Südafrika umschlossen?', 'Lesotho', ['Eswatini', 'Lesotho', 'Botswana', 'Namibia']),
  c('geo-s-06', 'Geographie', 'Schwer', 'Welche dieser Hauptstädte liegt am nördlichsten?', 'Helsinki', ['Oslo', 'Stockholm', 'Helsinki', 'Kopenhagen']),

  // Geschichte · Leicht
  n('ges-l-01', 'Geschichte', 'Leicht', 'In welchem Jahr fiel die Berliner Mauer?', 1989, { unit: 'Jahr' }),
  n('ges-l-02', 'Geschichte', 'Leicht', 'In welchem Jahr wurde Deutschland wiedervereinigt?', 1990, { unit: 'Jahr' }),
  n('ges-l-03', 'Geschichte', 'Leicht', 'In welchem Jahr betraten erstmals Menschen den Mond?', 1969, { unit: 'Jahr' }),
  n('ges-l-04', 'Geschichte', 'Leicht', 'In welchem Jahr begann der Erste Weltkrieg?', 1914, { unit: 'Jahr' }),
  c('ges-l-05', 'Geschichte', 'Leicht', 'Wer war der erste Bundeskanzler der Bundesrepublik Deutschland?', 'Konrad Adenauer', ['Willy Brandt', 'Konrad Adenauer', 'Ludwig Erhard', 'Theodor Heuss']),
  c('ges-l-06', 'Geschichte', 'Leicht', 'In welchem heutigen Land stehen die Pyramiden von Gizeh?', 'Ägypten', ['Mexiko', 'Ägypten', 'Sudan', 'Jordanien']),
  c('ges-l-07', 'Geschichte', 'Leicht', 'Welche Kultur errichtete Machu Picchu?', 'Inka', ['Maya', 'Azteken', 'Inka', 'Römer']),

  // Geschichte · Mittel
  n('ges-m-01', 'Geschichte', 'Mittel', 'In welchem Jahr begann die Französische Revolution?', 1789, { unit: 'Jahr' }),
  n('ges-m-02', 'Geschichte', 'Mittel', 'In welchem Jahr wurde die amerikanische Unabhängigkeitserklärung verabschiedet?', 1776, { unit: 'Jahr' }),
  n('ges-m-03', 'Geschichte', 'Mittel', 'In welchem Jahr veröffentlichte Martin Luther seine 95 Thesen?', 1517, { unit: 'Jahr' }),
  n('ges-m-04', 'Geschichte', 'Mittel', 'In welchem Jahr wurde die Magna Carta besiegelt?', 1215, { unit: 'Jahr' }),
  c('ges-m-05', 'Geschichte', 'Mittel', 'Wessen nahezu unberührtes Grab entdeckte Howard Carter 1922?', 'Tutanchamun', ['Ramses II.', 'Tutanchamun', 'Cheops', 'Echnaton']),
  c('ges-m-06', 'Geschichte', 'Mittel', 'Welcher Vertrag regelte 1919 den Frieden mit Deutschland nach dem Ersten Weltkrieg?', 'Vertrag von Versailles', ['Westfälischer Frieden', 'Vertrag von Versailles', 'Wiener Kongress', 'Vertrag von Maastricht']),
  c('ges-m-07', 'Geschichte', 'Mittel', 'In welchem antiken Land entstanden die Olympischen Spiele?', 'Griechenland', ['Römisches Reich', 'Ägypten', 'Griechenland', 'Persien']),

  // Geschichte · Schwer
  n('ges-s-01', 'Geschichte', 'Schwer', 'In welchem Jahr endete das Weströmische Reich traditionell?', 476, { unit: 'Jahr' }),
  n('ges-s-02', 'Geschichte', 'Schwer', 'In welchem Jahr wurde das Kolosseum in Rom eröffnet?', 80, { unit: 'Jahr n. Chr.' }),
  n('ges-s-03', 'Geschichte', 'Schwer', 'Wie viele Jahre dauerte der Dreißigjährige Krieg?', 30, { unit: 'Jahre' }),
  c('ges-s-04', 'Geschichte', 'Schwer', 'Welcher Herrscher wurde 1815 bei Waterloo endgültig besiegt?', 'Napoleon Bonaparte', ['Ludwig XIV.', 'Napoleon Bonaparte', 'Otto von Bismarck', 'Zar Alexander I.']),
  c('ges-s-05', 'Geschichte', 'Schwer', 'Welche Stadt war die Hauptstadt des Byzantinischen Reiches?', 'Konstantinopel', ['Athen', 'Alexandria', 'Konstantinopel', 'Antiochia']),
  c('ges-s-06', 'Geschichte', 'Schwer', 'Welche frühe Hochkultur entwickelte die Keilschrift?', 'Sumerer', ['Phönizier', 'Sumerer', 'Minoer', 'Hethiter']),

  // Sport · Leicht
  n('spo-l-01', 'Sport', 'Leicht', 'Wie viele Spieler stehen beim Fußball pro Mannschaft regulär auf dem Feld?', 11, { unit: 'Spieler' }),
  n('spo-l-02', 'Sport', 'Leicht', 'Wie viele Minuten dauert ein Fußballspiel regulär ohne Nachspielzeit?', 90, { unit: 'Minuten' }),
  n('spo-l-03', 'Sport', 'Leicht', 'Wie viele Ringe zeigt das olympische Symbol?', 5, { unit: 'Ringe' }),
  n('spo-l-04', 'Sport', 'Leicht', 'Wie viele Grand-Slam-Turniere gibt es im Tennis pro Jahr?', 4, { unit: 'Turniere' }),
  c('spo-l-05', 'Sport', 'Leicht', 'Welche Nationalmannschaft gewann die Fußball-Weltmeisterschaft 2014?', 'Deutschland', ['Argentinien', 'Brasilien', 'Deutschland', 'Spanien']),
  c('spo-l-06', 'Sport', 'Leicht', 'Auf welchem Belag wird Wimbledon traditionell gespielt?', 'Rasen', ['Sand', 'Hartplatz', 'Rasen', 'Teppich']),
  c('spo-l-07', 'Sport', 'Leicht', 'Zu welcher Sportart gehört die Tour de France?', 'Radsport', ['Motorsport', 'Radsport', 'Laufsport', 'Skisport']),

  // Sport · Mittel
  n('spo-m-01', 'Sport', 'Mittel', 'Wie lang ist ein Marathon?', 42.195, { unit: 'Kilometer', allowDecimals: true }),
  n('spo-m-02', 'Sport', 'Mittel', 'Wie hoch hängt ein Basketballkorb regulär?', 3.05, { unit: 'Meter', allowDecimals: true }),
  n('spo-m-03', 'Sport', 'Mittel', 'Wie viele Spieler stehen beim Hallenhandball pro Team gleichzeitig auf dem Feld?', 7, { unit: 'Spieler' }),
  n('spo-m-04', 'Sport', 'Mittel', 'Wie viele Spieler stehen beim Eishockey pro Team einschließlich Torwart normalerweise gleichzeitig auf dem Eis?', 6, { unit: 'Spieler' }),
  c('spo-m-05', 'Sport', 'Mittel', 'In welcher Reihenfolge werden die Disziplinen eines klassischen Triathlons absolviert?', 'Schwimmen, Radfahren, Laufen', ['Laufen, Schwimmen, Radfahren', 'Schwimmen, Laufen, Radfahren', 'Schwimmen, Radfahren, Laufen', 'Radfahren, Schwimmen, Laufen']),
  c('spo-m-06', 'Sport', 'Mittel', 'Welche beiden Disziplinen verbindet Biathlon?', 'Skilanglauf und Schießen', ['Abfahrt und Schießen', 'Skilanglauf und Schießen', 'Laufen und Bogenschießen', 'Skispringen und Schießen']),
  c('spo-m-07', 'Sport', 'Mittel', 'In welcher Sportart wird mit einem Federball gespielt?', 'Badminton', ['Squash', 'Badminton', 'Lacrosse', 'Padel']),

  // Sport · Schwer
  n('spo-s-01', 'Sport', 'Schwer', 'Wie viele Sekunden umfasst die Shot Clock in der NBA?', 24, { unit: 'Sekunden' }),
  n('spo-s-02', 'Sport', 'Schwer', 'Wie weit ist der Elfmeterpunkt im Fußball von der Torlinie entfernt?', 11, { unit: 'Meter' }),
  n('spo-s-03', 'Sport', 'Schwer', 'Wie viele Punkte benötigt man im Badminton regulär zum Gewinn eines Satzes?', 21, { unit: 'Punkte' }),
  n('spo-s-04', 'Sport', 'Schwer', 'Aus wie vielen Einzeldisziplinen besteht ein Zehnkampf?', 10, { unit: 'Disziplinen' }),
  c('spo-s-05', 'Sport', 'Schwer', 'In welcher Sportart wird der America’s Cup ausgetragen?', 'Segeln', ['Rudern', 'Segeln', 'Golf', 'Polo']),
  c('spo-s-06', 'Sport', 'Schwer', 'Zu welcher Sportart gehört das Gerät Pauschenpferd?', 'Gerätturnen', ['Reitsport', 'Gerätturnen', 'Moderner Fünfkampf', 'Gewichtheben']),

  // Natur · Leicht
  n('nat-l-01', 'Natur', 'Leicht', 'Wie viele Beine hat eine Spinne?', 8, { unit: 'Beine' }),
  n('nat-l-02', 'Natur', 'Leicht', 'Wie viele Kammern besitzt das menschliche Herz?', 4, { unit: 'Kammern' }),
  n('nat-l-03', 'Natur', 'Leicht', 'Bei wie viel Grad Celsius kocht Wasser auf Meereshöhe ungefähr?', 100, { unit: 'Grad Celsius' }),
  n('nat-l-04', 'Natur', 'Leicht', 'Wie viele Zähne hat ein vollständiges Erwachsenengebiss einschließlich Weisheitszähnen?', 32, { unit: 'Zähne' }),
  c('nat-l-05', 'Natur', 'Leicht', 'Welches ist das größte heute lebende Landtier?', 'Afrikanischer Elefant', ['Giraffe', 'Afrikanischer Elefant', 'Nashorn', 'Flusspferd']),
  c('nat-l-06', 'Natur', 'Leicht', 'An welchem Baum wachsen Eicheln?', 'Eiche', ['Buche', 'Eiche', 'Ahorn', 'Birke']),
  c('nat-l-07', 'Natur', 'Leicht', 'Welches Gas nehmen Pflanzen bei der Fotosynthese aus der Luft auf?', 'Kohlenstoffdioxid', ['Sauerstoff', 'Stickstoff', 'Kohlenstoffdioxid', 'Wasserstoff']),

  // Natur · Mittel
  n('nat-m-01', 'Natur', 'Mittel', 'Wie lange dauert die Tragzeit eines Afrikanischen Elefanten ungefähr?', 22, { unit: 'Monate' }),
  n('nat-m-02', 'Natur', 'Mittel', 'Wie groß ist die mittlere Entfernung zwischen Erde und Mond?', 384400, { unit: 'Kilometer' }),
  n('nat-m-03', 'Natur', 'Mittel', 'Wie viele Chromosomen besitzt eine menschliche Körperzelle normalerweise?', 46, { unit: 'Chromosomen' }),
  n('nat-m-04', 'Natur', 'Mittel', 'Wie hoch ist der durchschnittliche Salzgehalt der Ozeane ungefähr?', 3.5, { unit: 'Prozent', allowDecimals: true }),
  c('nat-m-05', 'Natur', 'Mittel', 'Welches dieser Säugetiere legt Eier?', 'Schnabeltier', ['Otter', 'Schnabeltier', 'Biber', 'Faultier']),
  c('nat-m-06', 'Natur', 'Mittel', 'Welcher natürliche Stoff gilt als besonders hart?', 'Diamant', ['Quarz', 'Granit', 'Diamant', 'Obsidian']),
  c('nat-m-07', 'Natur', 'Mittel', 'Welches ist das größte heute lebende Tier?', 'Blauwal', ['Walhai', 'Blauwal', 'Afrikanischer Elefant', 'Riesenkalmar']),

  // Natur · Schwer
  n('nat-s-01', 'Natur', 'Schwer', 'Wie alt ist die Erde nach heutiger wissenschaftlicher Schätzung?', 4.54, { unit: 'Milliarden Jahre', allowDecimals: true }),
  n('nat-s-02', 'Natur', 'Schwer', 'Bei welcher Temperatur liegt der absolute Nullpunkt in Grad Celsius?', -273.15, { unit: 'Grad Celsius', allowDecimals: true, allowNegative: true }),
  n('nat-s-03', 'Natur', 'Schwer', 'Wie viele Halswirbel besitzen fast alle Säugetiere – auch Giraffen?', 7, { unit: 'Halswirbel' }),
  c('nat-s-04', 'Natur', 'Schwer', 'Welches Tier besitzt drei Herzen?', 'Oktopus', ['Seestern', 'Oktopus', 'Hai', 'Qualle']),
  c('nat-s-05', 'Natur', 'Schwer', 'In welchem Zellbestandteil findet bei Pflanzen die Fotosynthese statt?', 'Chloroplasten', ['Mitochondrien', 'Zellkern', 'Chloroplasten', 'Ribosomen']),
  c('nat-s-06', 'Natur', 'Schwer', 'Welche Art ist die größte heute lebende Echse?', 'Komodowaran', ['Grüner Leguan', 'Komodowaran', 'Gila-Krustenechse', 'Nilwaran']),

  // Kultur · Leicht
  n('kul-l-01', 'Kultur', 'Leicht', 'Wie viele Tasten besitzt ein modernes Standardklavier?', 88, { unit: 'Tasten' }),
  n('kul-l-02', 'Kultur', 'Leicht', 'Wie viele Romane umfasst die Harry-Potter-Hauptreihe?', 7, { unit: 'Romane' }),
  n('kul-l-03', 'Kultur', 'Leicht', 'Aus wie vielen Musikerinnen oder Musikern besteht ein klassisches Streichquartett?', 4, { unit: 'Personen' }),
  c('kul-l-04', 'Kultur', 'Leicht', 'Wer malte die Mona Lisa?', 'Leonardo da Vinci', ['Michelangelo', 'Leonardo da Vinci', 'Raffael', 'Sandro Botticelli']),
  c('kul-l-05', 'Kultur', 'Leicht', 'Wer schrieb das Drama „Hamlet“?', 'William Shakespeare', ['Charles Dickens', 'William Shakespeare', 'Oscar Wilde', 'Johann Wolfgang von Goethe']),
  c('kul-l-06', 'Kultur', 'Leicht', 'Aus welcher englischen Stadt stammen die Beatles?', 'Liverpool', ['London', 'Manchester', 'Liverpool', 'Birmingham']),
  c('kul-l-07', 'Kultur', 'Leicht', 'In welcher Stadt steht das berühmte Opernhaus mit den segelförmigen Dächern?', 'Sydney', ['Auckland', 'Sydney', 'Melbourne', 'Kapstadt']),

  // Kultur · Mittel
  n('kul-m-01', 'Kultur', 'Mittel', 'Wie viele vollendete nummerierte Sinfonien komponierte Ludwig van Beethoven?', 9, { unit: 'Sinfonien' }),
  n('kul-m-02', 'Kultur', 'Mittel', 'In welchem Jahr kam der erste veröffentlichte Star-Wars-Kinofilm heraus?', 1977, { unit: 'Jahr' }),
  n('kul-m-03', 'Kultur', 'Mittel', 'Wie hoch ist der Eiffelturm einschließlich seiner heutigen Antenne ungefähr?', 330, { unit: 'Meter' }),
  n('kul-m-04', 'Kultur', 'Mittel', 'Wie hoch ist eine Oscar-Statuette ungefähr?', 34.3, { unit: 'Zentimeter', allowDecimals: true }),
  c('kul-m-05', 'Kultur', 'Mittel', 'Wer malte die Decke der Sixtinischen Kapelle?', 'Michelangelo', ['Raffael', 'Michelangelo', 'Leonardo da Vinci', 'Caravaggio']),
  c('kul-m-06', 'Kultur', 'Mittel', 'Wer schuf das Gemälde „Der Schrei“?', 'Edvard Munch', ['Gustav Klimt', 'Edvard Munch', 'Claude Monet', 'Salvador Dalí']),
  c('kul-m-07', 'Kultur', 'Mittel', 'Wer schrieb „Der kleine Prinz“?', 'Antoine de Saint-Exupéry', ['Jules Verne', 'Victor Hugo', 'Antoine de Saint-Exupéry', 'Albert Camus']),

  // Kultur · Schwer
  n('kul-s-01', 'Kultur', 'Schwer', 'In welchem Jahr wurde das Bauhaus in Weimar gegründet?', 1919, { unit: 'Jahr' }),
  n('kul-s-02', 'Kultur', 'Schwer', 'In welchem Jahr fand die erste documenta in Kassel statt?', 1955, { unit: 'Jahr' }),
  n('kul-s-03', 'Kultur', 'Schwer', 'Wie viele Verse hat ein klassisches Sonett?', 14, { unit: 'Verse' }),
  c('kul-s-04', 'Kultur', 'Schwer', 'Wer malte „Guernica“?', 'Pablo Picasso', ['Joan Miró', 'Pablo Picasso', 'Salvador Dalí', 'Francisco de Goya']),
  c('kul-s-05', 'Kultur', 'Schwer', 'Welche Institution wählt die Preisträgerin oder den Preisträger des Literaturnobelpreises?', 'Schwedische Akademie', ['Norwegisches Nobelkomitee', 'Schwedische Akademie', 'Königliche Oper Stockholm', 'Europäische Kommission']),
  c('kul-s-06', 'Kultur', 'Schwer', 'In welcher Sprache wurde die Gutenberg-Bibel gedruckt?', 'Latein', ['Deutsch', 'Latein', 'Griechisch', 'Hebräisch']),
];

/**
 * 200 zusätzliche Fragen. Die sechs Kategorien und drei Schwierigkeitsstufen
 * sind möglichst gleichmäßig verteilt; Zahlen- und Auswahlfragen wechseln sich ab.
 */
const additionalEstimationQuestions: EstimationQuestion[] = [
  // Allgemeinwissen · Leicht · 12 zusätzliche Fragen
  n('all-l-08', 'Allgemeinwissen', 'Leicht', 'Wie viele Stunden hat eine Woche?', 168, { unit: 'Stunden' }),
  n('all-l-09', 'Allgemeinwissen', 'Leicht', 'Wie viele Zentimeter sind ein Kilometer?', 100000, { unit: 'Zentimeter' }),
  n('all-l-10', 'Allgemeinwissen', 'Leicht', 'Wie viele Flächen hat ein Würfel?', 6, { unit: 'Flächen' }),
  n('all-l-11', 'Allgemeinwissen', 'Leicht', 'Wie viele Monate eines Jahres haben 31 Tage?', 7, { unit: 'Monate' }),
  n('all-l-12', 'Allgemeinwissen', 'Leicht', 'Wie viel ist ein Viertel von 100?', 25),
  n('all-l-13', 'Allgemeinwissen', 'Leicht', 'Wie viele Grad hat ein vollständiger Kreis?', 360, { unit: 'Grad' }),
  c('all-l-14', 'Allgemeinwissen', 'Leicht', 'Welches chemische Symbol steht für Sauerstoff?', 'O', ['S', 'O', 'Sa', 'Ox']),
  c('all-l-15', 'Allgemeinwissen', 'Leicht', 'Welcher Planet ist der größte unseres Sonnensystems?', 'Jupiter', ['Erde', 'Saturn', 'Jupiter', 'Neptun']),
  c('all-l-16', 'Allgemeinwissen', 'Leicht', 'Welches Gerät misst den Luftdruck?', 'Barometer', ['Thermometer', 'Barometer', 'Tachometer', 'Hygrometer']),
  c('all-l-17', 'Allgemeinwissen', 'Leicht', 'Welche Farben hat die deutsche Flagge?', 'Schwarz, Rot und Gold', ['Schwarz, Rot und Gold', 'Blau, Weiß und Rot', 'Rot, Weiß und Grün', 'Schwarz, Gelb und Rot']),
  c('all-l-18', 'Allgemeinwissen', 'Leicht', 'Welchen Wert hat die römische Zahl X?', '10', ['5', '10', '50', '100']),
  c('all-l-19', 'Allgemeinwissen', 'Leicht', 'Welche Sprache wird in Brasilien überwiegend gesprochen?', 'Portugiesisch', ['Spanisch', 'Portugiesisch', 'Französisch', 'Englisch']),

  // Allgemeinwissen · Mittel · 11 zusätzliche Fragen
  n('all-m-08', 'Allgemeinwissen', 'Mittel', 'Wie viele Bits bilden ein Byte?', 8, { unit: 'Bits' }),
  n('all-m-09', 'Allgemeinwissen', 'Mittel', 'Wie viele Augen zeigt ein normaler sechsseitiger Würfel insgesamt?', 21, { unit: 'Augen' }),
  n('all-m-10', 'Allgemeinwissen', 'Mittel', 'Wie viele einzelne Stück sind ein Gros?', 144, { unit: 'Stück' }),
  n('all-m-11', 'Allgemeinwissen', 'Mittel', 'Wie viel Prozent entsprechen drei Vierteln?', 75, { unit: 'Prozent' }),
  n('all-m-12', 'Allgemeinwissen', 'Mittel', 'Bei wie viel Grad Fahrenheit gefriert Wasser?', 32, { unit: 'Grad Fahrenheit' }),
  c('all-m-13', 'Allgemeinwissen', 'Mittel', 'Welche SI-Einheit misst die Frequenz?', 'Hertz', ['Joule', 'Pascal', 'Hertz', 'Tesla']),
  c('all-m-14', 'Allgemeinwissen', 'Mittel', 'Welches Gas macht den größten Anteil der Erdatmosphäre aus?', 'Stickstoff', ['Sauerstoff', 'Kohlenstoffdioxid', 'Stickstoff', 'Argon']),
  c('all-m-15', 'Allgemeinwissen', 'Mittel', 'Welches Gerät misst die Windgeschwindigkeit?', 'Anemometer', ['Anemometer', 'Seismograf', 'Altimeter', 'Odometer']),
  c('all-m-16', 'Allgemeinwissen', 'Mittel', 'Wer erfand das World Wide Web?', 'Tim Berners-Lee', ['Alan Turing', 'Tim Berners-Lee', 'Steve Wozniak', 'Bill Gates']),
  c('all-m-17', 'Allgemeinwissen', 'Mittel', 'Welches ist das größte innere Organ des menschlichen Körpers?', 'Leber', ['Herz', 'Leber', 'Lunge', 'Niere']),
  c('all-m-18', 'Allgemeinwissen', 'Mittel', 'Welchem Bruchteil entspricht die Vorsilbe „Milli-“?', 'Ein Tausendstel', ['Ein Zehntel', 'Ein Hundertstel', 'Ein Tausendstel', 'Ein Millionstel']),

  // Allgemeinwissen · Schwer · 11 zusätzliche Fragen
  n('all-s-07', 'Allgemeinwissen', 'Schwer', 'Welchen Dezimalwert hat die Hexadezimalzahl 2A?', 42),
  n('all-s-08', 'Allgemeinwissen', 'Schwer', 'Wie groß ist die Summe der Innenwinkel eines Achtecks?', 1080, { unit: 'Grad' }),
  n('all-s-09', 'Allgemeinwissen', 'Schwer', 'Wie viele Ecken besitzt ein regelmäßiges Dodekaeder?', 20, { unit: 'Ecken' }),
  n('all-s-10', 'Allgemeinwissen', 'Schwer', 'Welchen Wert hat die Fakultät von null, also 0!?', 1),
  n('all-s-11', 'Allgemeinwissen', 'Schwer', 'Wie viele Sekunden umfasst ein julianisches Jahr mit exakt 365,25 Tagen?', 31557600, { unit: 'Sekunden' }),
  c('all-s-12', 'Allgemeinwissen', 'Schwer', 'Welche SI-Basiseinheit misst die Lichtstärke?', 'Candela', ['Lumen', 'Lux', 'Candela', 'Weber']),
  c('all-s-13', 'Allgemeinwissen', 'Schwer', 'Für welches Element steht das chemische Symbol W?', 'Wolfram', ['Wismut', 'Wolfram', 'Wasserstoff', 'Weißgold']),
  c('all-s-14', 'Allgemeinwissen', 'Schwer', 'Welche Vorsilbe steht im SI-System für 10 hoch minus 12?', 'Piko', ['Nano', 'Piko', 'Femto', 'Mikro']),
  c('all-s-15', 'Allgemeinwissen', 'Schwer', 'Welche Konstante beschreibt das Verhältnis von Kreisumfang zu Kreisdurchmesser?', 'Pi', ['Euler-Zahl', 'Pi', 'Goldener Schnitt', 'Avogadro-Konstante']),
  c('all-s-16', 'Allgemeinwissen', 'Schwer', 'Wie heißt das Sammel- und Forschungsgebiet rund um Münzen?', 'Numismatik', ['Philatelie', 'Numismatik', 'Heraldik', 'Genealogie']),
  c('all-s-17', 'Allgemeinwissen', 'Schwer', 'Wie heißt ein Wort, das vorwärts und rückwärts gleich gelesen wird?', 'Palindrom', ['Anagramm', 'Palindrom', 'Akronym', 'Homonym']),

  // Geographie · Leicht · 12 zusätzliche Fragen
  n('geo-l-08', 'Geographie', 'Leicht', 'Wie viele Kontinente werden im üblichen deutschsprachigen Modell gezählt?', 7, { unit: 'Kontinente' }),
  n('geo-l-09', 'Geographie', 'Leicht', 'Wie viele Ozeane werden heute üblicherweise unterschieden?', 5, { unit: 'Ozeane' }),
  n('geo-l-10', 'Geographie', 'Leicht', 'An wie viele Staaten grenzt die Schweiz?', 5, { unit: 'Staaten' }),
  n('geo-l-11', 'Geographie', 'Leicht', 'Aus wie vielen Landesteilen besteht das Vereinigte Königreich?', 4, { unit: 'Landesteile' }),
  c('geo-l-12', 'Geographie', 'Leicht', 'Was ist die Hauptstadt von Kanada?', 'Ottawa', ['Toronto', 'Vancouver', 'Ottawa', 'Montreal']),
  c('geo-l-13', 'Geographie', 'Leicht', 'Welcher Fluss fließt durch Paris?', 'Seine', ['Loire', 'Seine', 'Rhône', 'Garonne']),
  c('geo-l-14', 'Geographie', 'Leicht', 'Welche große Wüste liegt im Norden Afrikas?', 'Sahara', ['Gobi', 'Kalahari', 'Sahara', 'Atacama']),
  c('geo-l-15', 'Geographie', 'Leicht', 'Welches europäische Land wird wegen seiner Form oft mit einem Stiefel verglichen?', 'Italien', ['Portugal', 'Italien', 'Kroatien', 'Griechenland']),
  c('geo-l-16', 'Geographie', 'Leicht', 'Welches Gebirge gilt traditionell als Teil der Grenze zwischen Europa und Asien?', 'Ural', ['Alpen', 'Ural', 'Pyrenäen', 'Karpaten']),
  c('geo-l-17', 'Geographie', 'Leicht', 'Zu welchem Land gehört die Insel Ibiza?', 'Spanien', ['Italien', 'Spanien', 'Portugal', 'Frankreich']),
  c('geo-l-18', 'Geographie', 'Leicht', 'Welches Meer liegt zwischen Schweden und den baltischen Staaten?', 'Ostsee', ['Nordsee', 'Ostsee', 'Schwarzes Meer', 'Adriatisches Meer']),
  c('geo-l-19', 'Geographie', 'Leicht', 'In welchem Land liegt der Berg Fuji?', 'Japan', ['China', 'Japan', 'Südkorea', 'Nepal']),

  // Geographie · Mittel · 11 zusätzliche Fragen
  n('geo-m-08', 'Geographie', 'Mittel', 'Wie viele Bundesstaaten haben die USA?', 50, { unit: 'Bundesstaaten' }),
  n('geo-m-09', 'Geographie', 'Mittel', 'Wie viele allgemein anerkannte souveräne Staaten gibt es in Afrika?', 54, { unit: 'Staaten' }),
  n('geo-m-10', 'Geographie', 'Mittel', 'Wie viele souveräne Staaten liegen in Südamerika?', 12, { unit: 'Staaten' }),
  n('geo-m-11', 'Geographie', 'Mittel', 'Wie viele Bundesländer hat Österreich?', 9, { unit: 'Bundesländer' }),
  n('geo-m-12', 'Geographie', 'Mittel', 'Wie viele Provinzen haben die Niederlande?', 12, { unit: 'Provinzen' }),
  c('geo-m-13', 'Geographie', 'Mittel', 'Was ist die Hauptstadt von Neuseeland?', 'Wellington', ['Auckland', 'Wellington', 'Christchurch', 'Dunedin']),
  c('geo-m-14', 'Geographie', 'Mittel', 'Welcher Fluss ist der längste Europas?', 'Wolga', ['Donau', 'Wolga', 'Rhein', 'Dnepr']),
  c('geo-m-15', 'Geographie', 'Mittel', 'Welche Meerenge trennt Spanien von Marokko?', 'Straße von Gibraltar', ['Bosporus', 'Straße von Gibraltar', 'Beringstraße', 'Straße von Dover']),
  c('geo-m-16', 'Geographie', 'Mittel', 'Was ist die Hauptstadt von Marokko?', 'Rabat', ['Casablanca', 'Marrakesch', 'Rabat', 'Fès']),
  c('geo-m-17', 'Geographie', 'Mittel', 'Welcher See ist flächenmäßig der größte Süßwassersee der Erde?', 'Oberer See', ['Victoriasee', 'Baikalsee', 'Oberer See', 'Tanganjikasee']),
  c('geo-m-18', 'Geographie', 'Mittel', 'Auf welchem Kontinent erstrecken sich die Anden?', 'Südamerika', ['Nordamerika', 'Südamerika', 'Asien', 'Europa']),

  // Geographie · Schwer · 11 zusätzliche Fragen
  n('geo-s-07', 'Geographie', 'Schwer', 'Wie viele Landessprachen hat die Schweiz?', 4, { unit: 'Landessprachen' }),
  n('geo-s-08', 'Geographie', 'Schwer', 'Wie viele Provinzen hat Kanada?', 10, { unit: 'Provinzen' }),
  n('geo-s-09', 'Geographie', 'Schwer', 'Wie viele Territorien hat Kanada?', 3, { unit: 'Territorien' }),
  n('geo-s-10', 'Geographie', 'Schwer', 'Wie groß ist die Fläche der Vatikanstadt ungefähr?', 0.49, { unit: 'Quadratkilometer', allowDecimals: true }),
  c('geo-s-11', 'Geographie', 'Schwer', 'Welches Land umschließt sowohl die Vatikanstadt als auch San Marino vollständig?', 'Italien', ['Frankreich', 'Italien', 'Spanien', 'Österreich']),
  c('geo-s-12', 'Geographie', 'Schwer', 'Was ist die Hauptstadt von Bhutan?', 'Thimphu', ['Paro', 'Thimphu', 'Kathmandu', 'Dhaka']),
  c('geo-s-13', 'Geographie', 'Schwer', 'Welcher Fluss fließt durch Bagdad?', 'Tigris', ['Euphrat', 'Tigris', 'Jordan', 'Indus']),
  c('geo-s-14', 'Geographie', 'Schwer', 'Welcher See ist der tiefste der Erde?', 'Baikalsee', ['Kaspisches Meer', 'Baikalsee', 'Tanganjikasee', 'Oberer See']),
  c('geo-s-15', 'Geographie', 'Schwer', 'In welchem Land liegt der Aconcagua, der höchste Berg außerhalb Asiens?', 'Argentinien', ['Chile', 'Argentinien', 'Peru', 'Bolivien']),
  c('geo-s-16', 'Geographie', 'Schwer', 'Welche Meerenge trennt Asien und Nordamerika?', 'Beringstraße', ['Magellanstraße', 'Beringstraße', 'Straße von Malakka', 'Torres-Straße']),
  c('geo-s-17', 'Geographie', 'Schwer', 'Welche Wüste gilt als trockenste nichtpolare Wüste der Erde?', 'Atacama', ['Namib', 'Atacama', 'Gobi', 'Kalahari']),

  // Geschichte · Leicht · 11 zusätzliche Fragen
  n('ges-l-08', 'Geschichte', 'Leicht', 'In welchem Jahr begann der Zweite Weltkrieg in Europa?', 1939, { unit: 'Jahr' }),
  n('ges-l-09', 'Geschichte', 'Leicht', 'In welchem Jahr endete der Zweite Weltkrieg in Europa?', 1945, { unit: 'Jahr' }),
  n('ges-l-10', 'Geschichte', 'Leicht', 'In welchem Jahr trat das deutsche Grundgesetz in Kraft?', 1949, { unit: 'Jahr' }),
  n('ges-l-11', 'Geschichte', 'Leicht', 'In welchem Jahr erreichte Christoph Kolumbus Amerika?', 1492, { unit: 'Jahr' }),
  n('ges-l-12', 'Geschichte', 'Leicht', 'In welchem Jahr wurden Euro-Banknoten und -Münzen eingeführt?', 2002, { unit: 'Jahr' }),
  c('ges-l-13', 'Geschichte', 'Leicht', 'Wer gilt als erster römischer Kaiser?', 'Augustus', ['Julius Caesar', 'Augustus', 'Nero', 'Trajan']),
  c('ges-l-14', 'Geschichte', 'Leicht', 'Welche antike Stadt wurde 79 n. Chr. beim Ausbruch des Vesuvs verschüttet?', 'Pompeji', ['Sparta', 'Pompeji', 'Troja', 'Karthago']),
  c('ges-l-15', 'Geschichte', 'Leicht', 'Für welches Land kämpfte Jeanne d’Arc?', 'Frankreich', ['England', 'Frankreich', 'Spanien', 'Italien']),
  c('ges-l-16', 'Geschichte', 'Leicht', 'Für wen wurden die großen Pyramiden des Alten Ägypten hauptsächlich als Grabmäler errichtet?', 'Pharaonen', ['Händler', 'Pharaonen', 'Soldaten', 'Priesterinnen']),
  c('ges-l-17', 'Geschichte', 'Leicht', 'Welche beiden Teile der Stadt trennte die Berliner Mauer?', 'Ost- und West-Berlin', ['Nord- und Süd-Berlin', 'Ost- und West-Berlin', 'Berlin und Potsdam', 'Berlin und Brandenburg']),
  c('ges-l-18', 'Geschichte', 'Leicht', 'Wer war der erste Präsident der Vereinigten Staaten?', 'George Washington', ['Thomas Jefferson', 'George Washington', 'Abraham Lincoln', 'John Adams']),

  // Geschichte · Mittel · 11 zusätzliche Fragen
  n('ges-m-08', 'Geschichte', 'Mittel', 'In welchem Jahr eroberten die Osmanen Konstantinopel?', 1453, { unit: 'Jahr' }),
  n('ges-m-09', 'Geschichte', 'Mittel', 'In welchem Jahr sank die Titanic?', 1912, { unit: 'Jahr' }),
  n('ges-m-10', 'Geschichte', 'Mittel', 'In welchem Jahr wurden die Vereinten Nationen gegründet?', 1945, { unit: 'Jahr' }),
  n('ges-m-11', 'Geschichte', 'Mittel', 'In welchem Jahr fanden die ersten Olympischen Spiele der Neuzeit statt?', 1896, { unit: 'Jahr' }),
  n('ges-m-12', 'Geschichte', 'Mittel', 'In welchem Jahr begann die Berlin-Blockade?', 1948, { unit: 'Jahr' }),
  c('ges-m-13', 'Geschichte', 'Mittel', 'In welchem heutigen Land nahm die Renaissance ihren Anfang?', 'Italien', ['Frankreich', 'Italien', 'Deutschland', 'Griechenland']),
  c('ges-m-14', 'Geschichte', 'Mittel', 'Was war die Hanse?', 'Ein Handels- und Städtebund', ['Ein Ritterorden', 'Ein Handels- und Städtebund', 'Eine Königsdynastie', 'Eine Bauernbewegung']),
  c('ges-m-15', 'Geschichte', 'Mittel', 'Welche Schrift konnte mithilfe des Steins von Rosette entziffert werden?', 'Ägyptische Hieroglyphen', ['Keilschrift', 'Ägyptische Hieroglyphen', 'Runen', 'Linear B']),
  c('ges-m-16', 'Geschichte', 'Mittel', 'In welchem Land begann die Industrielle Revolution?', 'Großbritannien', ['Frankreich', 'Großbritannien', 'USA', 'Deutschland']),
  c('ges-m-17', 'Geschichte', 'Mittel', 'In welcher Stadt wurde 1914 Erzherzog Franz Ferdinand ermordet?', 'Sarajevo', ['Wien', 'Sarajevo', 'Belgrad', 'Prag']),
  c('ges-m-18', 'Geschichte', 'Mittel', 'Welche antike Stadt gilt als Wiege der Demokratie?', 'Athen', ['Rom', 'Athen', 'Sparta', 'Alexandria']),

  // Geschichte · Schwer · 11 zusätzliche Fragen
  n('ges-s-07', 'Geschichte', 'Schwer', 'In welchem Jahr wurde der Westfälische Frieden geschlossen?', 1648, { unit: 'Jahr' }),
  n('ges-s-08', 'Geschichte', 'Schwer', 'In welchem Jahr fand die Schlacht bei Hastings statt?', 1066, { unit: 'Jahr' }),
  n('ges-s-09', 'Geschichte', 'Schwer', 'In welchem Jahr begann das erste Konzil von Nicäa?', 325, { unit: 'Jahr n. Chr.' }),
  n('ges-s-10', 'Geschichte', 'Schwer', 'In welchem Jahr begann der Dreißigjährige Krieg?', 1618, { unit: 'Jahr' }),
  n('ges-s-11', 'Geschichte', 'Schwer', 'In welchem Jahr wurde die Verfassung der Vereinigten Staaten unterzeichnet?', 1787, { unit: 'Jahr' }),
  c('ges-s-12', 'Geschichte', 'Schwer', 'Welcher Vertrag teilte 1494 außereuropäische Einflussgebiete zwischen Spanien und Portugal?', 'Vertrag von Tordesillas', ['Vertrag von Utrecht', 'Vertrag von Tordesillas', 'Vertrag von Paris', 'Vertrag von Lissabon']),
  c('ges-s-13', 'Geschichte', 'Schwer', 'Zu welcher Dynastie gehörte Karl der Große?', 'Karolinger', ['Merowinger', 'Karolinger', 'Ottonen', 'Staufer']),
  c('ges-s-14', 'Geschichte', 'Schwer', 'In welchem Land fand die Meiji-Restauration statt?', 'Japan', ['China', 'Japan', 'Korea', 'Thailand']),
  c('ges-s-15', 'Geschichte', 'Schwer', 'Welche beiden Mächte kämpften in den Punischen Kriegen gegeneinander?', 'Rom und Karthago', ['Athen und Sparta', 'Rom und Karthago', 'Persien und Ägypten', 'Rom und Gallien']),
  c('ges-s-16', 'Geschichte', 'Schwer', 'Was war die Hauptstadt des Inkareichs?', 'Cusco', ['Lima', 'Cusco', 'Quito', 'Tenochtitlán']),
  c('ges-s-17', 'Geschichte', 'Schwer', 'Welcher König ging 1077 zum sprichwörtlichen Gang nach Canossa?', 'Heinrich IV.', ['Friedrich I.', 'Heinrich IV.', 'Otto I.', 'Ludwig der Fromme']),

  // Sport · Leicht · 11 zusätzliche Fragen
  n('spo-l-08', 'Sport', 'Leicht', 'Wie viele Spieler stehen beim Basketball pro Team gleichzeitig auf dem Feld?', 5, { unit: 'Spieler' }),
  n('spo-l-09', 'Sport', 'Leicht', 'Wie viele Spieler stehen beim Hallenvolleyball pro Team gleichzeitig auf dem Feld?', 6, { unit: 'Spieler' }),
  n('spo-l-10', 'Sport', 'Leicht', 'Wie viele Minuten dauert ein Handballspiel der Erwachsenen regulär?', 60, { unit: 'Minuten' }),
  n('spo-l-11', 'Sport', 'Leicht', 'Wie lang ist ein olympisches Schwimmbecken?', 50, { unit: 'Meter' }),
  n('spo-l-12', 'Sport', 'Leicht', 'Wie viele Pins stehen beim klassischen Bowling zu Beginn eines Frames?', 10, { unit: 'Pins' }),
  c('spo-l-13', 'Sport', 'Leicht', 'In welcher Sportart ist der Ball typischerweise oval?', 'Rugby', ['Basketball', 'Rugby', 'Volleyball', 'Tennis']),
  c('spo-l-14', 'Sport', 'Leicht', 'In welcher Sportart erzielt man einen Home Run?', 'Baseball', ['Cricket', 'Baseball', 'Golf', 'Eishockey']),
  c('spo-l-15', 'Sport', 'Leicht', 'Wer trägt bei der Tour de France das Gelbe Trikot?', 'Der Führende der Gesamtwertung', ['Der jüngste Fahrer', 'Der beste Sprinter', 'Der Führende der Gesamtwertung', 'Der beste Bergfahrer']),
  c('spo-l-16', 'Sport', 'Leicht', 'Zu welcher Sportart gehört der Slam Dunk?', 'Basketball', ['Volleyball', 'Basketball', 'Handball', 'Wasserball']),
  c('spo-l-17', 'Sport', 'Leicht', 'Welche Art von Wettbewerb ist die Formel 1?', 'Motorsport', ['Radsport', 'Motorsport', 'Segelsport', 'Wintersport']),
  c('spo-l-18', 'Sport', 'Leicht', 'In welcher Sportart bezeichnet „Hole-in-one“ einen perfekten Schlag?', 'Golf', ['Tennis', 'Golf', 'Baseball', 'Billard']),

  // Sport · Mittel · 11 zusätzliche Fragen
  n('spo-m-08', 'Sport', 'Mittel', 'Wie viele Punkte braucht man im Tischtennis regulär zum Gewinn eines Satzes?', 11, { unit: 'Punkte' }),
  n('spo-m-09', 'Sport', 'Mittel', 'Wie viele Innings hat ein reguläres Baseballspiel?', 9, { unit: 'Innings' }),
  n('spo-m-10', 'Sport', 'Mittel', 'Wie viele Spieler stehen beim Rugby Union pro Mannschaft auf dem Feld?', 15, { unit: 'Spieler' }),
  n('spo-m-11', 'Sport', 'Mittel', 'Aus wie vielen Vierteln besteht ein Basketballspiel?', 4, { unit: 'Viertel' }),
  n('spo-m-12', 'Sport', 'Mittel', 'Aus wie vielen Dritteln besteht ein reguläres Eishockeyspiel?', 3, { unit: 'Drittel' }),
  c('spo-m-13', 'Sport', 'Mittel', 'In welcher Sportart wird der Davis Cup ausgetragen?', 'Tennis', ['Tennis', 'Golf', 'Badminton', 'Squash']),
  c('spo-m-14', 'Sport', 'Mittel', 'In welcher Sportart wird der Ryder Cup ausgetragen?', 'Golf', ['Polo', 'Golf', 'Rudern', 'Segeln']),
  c('spo-m-15', 'Sport', 'Mittel', 'In welcher Kampfsportart kann ein Ippon den Kampf sofort entscheiden?', 'Judo', ['Boxen', 'Judo', 'Fechten', 'Ringen']),
  c('spo-m-16', 'Sport', 'Mittel', 'In welcher Sportart findet der Giro d’Italia statt?', 'Radsport', ['Motorradsport', 'Radsport', 'Laufsport', 'Skilanglauf']),
  c('spo-m-17', 'Sport', 'Mittel', 'Zu welcher Sportart gehört der Super Bowl?', 'American Football', ['Baseball', 'American Football', 'Basketball', 'Eishockey']),
  c('spo-m-18', 'Sport', 'Mittel', 'In welchem Spiel beendet ein Schachmatt die Partie?', 'Schach', ['Dame', 'Schach', 'Go', 'Backgammon']),

  // Sport · Schwer · 11 zusätzliche Fragen
  n('spo-s-07', 'Sport', 'Schwer', 'Wie viele Punkte zählt ein maximales Break im Snooker ohne Foul- oder Sonderbälle?', 147, { unit: 'Punkte' }),
  n('spo-s-08', 'Sport', 'Schwer', 'Wie viele Hürden stehen beim 110-Meter-Hürdenlauf der Männer auf der Bahn?', 10, { unit: 'Hürden' }),
  n('spo-s-09', 'Sport', 'Schwer', 'Wie viele Bases gibt es auf einem Baseballfeld einschließlich der Home Plate?', 4, { unit: 'Bases' }),
  n('spo-s-10', 'Sport', 'Schwer', 'Wie viele Spieler stehen beim Wasserball pro Team einschließlich Torwart gleichzeitig im Becken?', 7, { unit: 'Spieler' }),
  n('spo-s-11', 'Sport', 'Schwer', 'Wie viele Punkte zählt ein Versuch im Rugby Union?', 5, { unit: 'Punkte' }),
  c('spo-s-12', 'Sport', 'Schwer', 'Zu welcher Disziplin gehört der Fosbury-Flop?', 'Hochsprung', ['Stabhochsprung', 'Hochsprung', 'Weitsprung', 'Dreisprung']),
  c('spo-s-13', 'Sport', 'Schwer', 'In welcher Sportart wird der Stanley Cup vergeben?', 'Eishockey', ['Basketball', 'Eishockey', 'Baseball', 'Lacrosse']),
  c('spo-s-14', 'Sport', 'Schwer', 'In welcher Sportart spielen England und Australien um „The Ashes“?', 'Cricket', ['Rugby', 'Cricket', 'Polo', 'Tennis']),
  c('spo-s-15', 'Sport', 'Schwer', 'Zu welcher Sportart gehört der Degen?', 'Fechten', ['Moderner Fünfkampf', 'Fechten', 'Bogenschießen', 'Kendo']),
  c('spo-s-16', 'Sport', 'Schwer', 'In welcher Sportart ist das Gedränge, auf Englisch „Scrum“, ein zentrales Spielelement?', 'Rugby', ['American Football', 'Rugby', 'Eishockey', 'Handball']),
  c('spo-s-17', 'Sport', 'Schwer', 'Bei welchem Golfturnier erhält der Sieger traditionell ein grünes Jackett?', 'The Masters', ['US Open', 'The Masters', 'The Open Championship', 'PGA Championship']),

  // Natur · Leicht · 11 zusätzliche Fragen
  n('nat-l-08', 'Natur', 'Leicht', 'Wie viele Beine hat ein Insekt?', 6, { unit: 'Beine' }),
  n('nat-l-09', 'Natur', 'Leicht', 'Wie viele Planeten hat unser Sonnensystem?', 8, { unit: 'Planeten' }),
  n('nat-l-10', 'Natur', 'Leicht', 'Wie viele Arme hat ein typischer Seestern?', 5, { unit: 'Arme' }),
  n('nat-l-11', 'Natur', 'Leicht', 'Wie viele Flügel hat eine Honigbiene?', 4, { unit: 'Flügel' }),
  n('nat-l-12', 'Natur', 'Leicht', 'Wie viele Magenabteilungen besitzt ein Rind?', 4, { unit: 'Abteilungen' }),
  c('nat-l-13', 'Natur', 'Leicht', 'Welches Tier durchläuft die Entwicklungsstadien Raupe und Puppe?', 'Schmetterling', ['Libelle', 'Schmetterling', 'Spinne', 'Heuschrecke']),
  c('nat-l-14', 'Natur', 'Leicht', 'Welcher dieser Bäume ist ein Nadelbaum?', 'Kiefer', ['Eiche', 'Buche', 'Kiefer', 'Ahorn']),
  c('nat-l-15', 'Natur', 'Leicht', 'Welches dieser Tiere ist ein Amphibium?', 'Frosch', ['Eidechse', 'Frosch', 'Schildkröte', 'Maus']),
  c('nat-l-16', 'Natur', 'Leicht', 'Welches ist das schnellste Landtier?', 'Gepard', ['Löwe', 'Gepard', 'Strauß', 'Antilope']),
  c('nat-l-17', 'Natur', 'Leicht', 'Welcher Stern ist der Erde am nächsten?', 'Sonne', ['Proxima Centauri', 'Sirius', 'Sonne', 'Polarstern']),
  c('nat-l-18', 'Natur', 'Leicht', 'Welcher Planet wird als Roter Planet bezeichnet?', 'Mars', ['Venus', 'Mars', 'Merkur', 'Jupiter']),

  // Natur · Mittel · 11 zusätzliche Fragen
  n('nat-m-08', 'Natur', 'Mittel', 'Wie viele Chromosomenpaare besitzt der Mensch normalerweise?', 23, { unit: 'Paare' }),
  n('nat-m-09', 'Natur', 'Mittel', 'Wie viele Rippen besitzt ein Mensch normalerweise insgesamt?', 24, { unit: 'Rippen' }),
  n('nat-m-10', 'Natur', 'Mittel', 'Wie schnell breitet sich Schall in trockener Luft bei 20 °C ungefähr aus?', 343, { unit: 'Meter pro Sekunde' }),
  n('nat-m-11', 'Natur', 'Mittel', 'Wie groß ist die Erdbeschleunigung nahe der Erdoberfläche ungefähr?', 9.81, { unit: 'Meter pro Quadratsekunde', allowDecimals: true }),
  n('nat-m-12', 'Natur', 'Mittel', 'Wie viele Wochen dauert eine menschliche Schwangerschaft gerechnet ab der letzten Periode ungefähr?', 40, { unit: 'Wochen' }),
  c('nat-m-13', 'Natur', 'Mittel', 'Welches ist die größte heute lebende Katzenart?', 'Tiger', ['Löwe', 'Tiger', 'Jaguar', 'Leopard']),
  c('nat-m-14', 'Natur', 'Mittel', 'Welches Säugetier orientiert sich unter anderem mit Echoortung?', 'Fledermaus', ['Igel', 'Fledermaus', 'Eichhörnchen', 'Bär']),
  c('nat-m-15', 'Natur', 'Mittel', 'Welches ist die härteste Substanz im menschlichen Körper?', 'Zahnschmelz', ['Knochen', 'Zahnschmelz', 'Knorpel', 'Keratin']),
  c('nat-m-16', 'Natur', 'Mittel', 'Welche Blutgruppe der roten Blutkörperchen gilt bei Notfalltransfusionen als Universalspender?', '0 negativ', ['A positiv', 'AB negativ', '0 negativ', '0 positiv']),
  c('nat-m-17', 'Natur', 'Mittel', 'Welches Organ produziert das Hormon Insulin?', 'Bauchspeicheldrüse', ['Leber', 'Bauchspeicheldrüse', 'Schilddrüse', 'Nebenniere']),
  c('nat-m-18', 'Natur', 'Mittel', 'Wie nennt man Bäume, die saisonal ihre Blätter abwerfen?', 'Laubbäume', ['Nadelbäume', 'Laubbäume', 'Sukkulenten', 'Farne']),

  // Natur · Schwer · 11 zusätzliche Fragen
  n('nat-s-07', 'Natur', 'Schwer', 'Welche Ordnungszahl hat Kohlenstoff?', 6),
  n('nat-s-08', 'Natur', 'Schwer', 'Wie groß ist die Fluchtgeschwindigkeit von der Erde ungefähr?', 11.2, { unit: 'Kilometer pro Sekunde', allowDecimals: true }),
  n('nat-s-09', 'Natur', 'Schwer', 'Wie groß ist eine Astronomische Einheit ungefähr?', 149.6, { unit: 'Millionen Kilometer', allowDecimals: true }),
  n('nat-s-10', 'Natur', 'Schwer', 'Wie schnell breitet sich Schall in Süßwasser bei etwa 20 °C ungefähr aus?', 1480, { unit: 'Meter pro Sekunde' }),
  n('nat-s-11', 'Natur', 'Schwer', 'Wie viele Milliarden Basenpaare umfasst das haploide menschliche Genom ungefähr?', 3.2, { unit: 'Milliarden Basenpaare', allowDecimals: true }),
  c('nat-s-12', 'Natur', 'Schwer', 'Wie heißt die Wissenschaft von den Pilzen?', 'Mykologie', ['Bryologie', 'Mykologie', 'Entomologie', 'Limnologie']),
  c('nat-s-13', 'Natur', 'Schwer', 'Welches ist die größte heute lebende Haiart?', 'Walhai', ['Weißer Hai', 'Walhai', 'Tigerhai', 'Riesenhai']),
  c('nat-s-14', 'Natur', 'Schwer', 'Welcher Farbstoff transportiert Sauerstoff in roten Blutkörperchen?', 'Hämoglobin', ['Melanin', 'Hämoglobin', 'Keratin', 'Chlorophyll']),
  c('nat-s-15', 'Natur', 'Schwer', 'Welche Form der Zellteilung erzeugt beim Menschen Ei- und Samenzellen?', 'Meiose', ['Mitose', 'Meiose', 'Knospung', 'Binärspaltung']),
  c('nat-s-16', 'Natur', 'Schwer', 'Welches Element ist im Universum am häufigsten?', 'Wasserstoff', ['Helium', 'Sauerstoff', 'Wasserstoff', 'Kohlenstoff']),
  c('nat-s-17', 'Natur', 'Schwer', 'Zu welcher Wirbeltierklasse gehört der Axolotl?', 'Amphibien', ['Fische', 'Amphibien', 'Reptilien', 'Säugetiere']),

  // Kultur · Leicht · 11 zusätzliche Fragen
  n('kul-l-08', 'Kultur', 'Leicht', 'Wie viele Saiten hat eine klassische Gitarre?', 6, { unit: 'Saiten' }),
  n('kul-l-09', 'Kultur', 'Leicht', 'Aus wie vielen Mitgliedern bestanden die Beatles?', 4, { unit: 'Mitglieder' }),
  n('kul-l-10', 'Kultur', 'Leicht', 'Wie viele Farben werden traditionell im Regenbogen genannt?', 7, { unit: 'Farben' }),
  n('kul-l-11', 'Kultur', 'Leicht', 'Wie viele Linien hat ein übliches Notensystem?', 5, { unit: 'Linien' }),
  n('kul-l-12', 'Kultur', 'Leicht', 'Wie viele Felder hat ein Schachbrett?', 64, { unit: 'Felder' }),
  c('kul-l-13', 'Kultur', 'Leicht', 'Wer schrieb die Harry-Potter-Romane?', 'J. K. Rowling', ['Suzanne Collins', 'J. K. Rowling', 'Cornelia Funke', 'Stephenie Meyer']),
  c('kul-l-14', 'Kultur', 'Leicht', 'Welcher Superheld beschützt die fiktive Stadt Gotham City?', 'Batman', ['Superman', 'Batman', 'Spider-Man', 'Iron Man']),
  c('kul-l-15', 'Kultur', 'Leicht', 'Aus welchem Land stammt der Tango?', 'Argentinien', ['Spanien', 'Argentinien', 'Brasilien', 'Kuba']),
  c('kul-l-16', 'Kultur', 'Leicht', 'Wer komponierte den Konzertzyklus „Die vier Jahreszeiten“?', 'Antonio Vivaldi', ['Wolfgang Amadeus Mozart', 'Antonio Vivaldi', 'Johann Sebastian Bach', 'Franz Schubert']),
  c('kul-l-17', 'Kultur', 'Leicht', 'In welcher Stadt befindet sich der Louvre?', 'Paris', ['Rom', 'Paris', 'Madrid', 'Wien']),
  c('kul-l-18', 'Kultur', 'Leicht', 'Wie heißt der grüne Frosch aus der Muppet Show?', 'Kermit', ['Gonzo', 'Kermit', 'Fozzie', 'Rowlf']),

  // Kultur · Mittel · 11 zusätzliche Fragen
  n('kul-m-08', 'Kultur', 'Mittel', 'Wie viele Sonette umfasst die bekannte Sammlung von William Shakespeare?', 154, { unit: 'Sonette' }),
  n('kul-m-09', 'Kultur', 'Mittel', 'Welche Frequenz hat der übliche Kammerton a?', 440, { unit: 'Hertz' }),
  n('kul-m-10', 'Kultur', 'Mittel', 'Wie viele Karten enthält ein traditionelles Tarotdeck?', 78, { unit: 'Karten' }),
  n('kul-m-11', 'Kultur', 'Mittel', 'Wie viele Silben hat ein traditionelles japanisches Haiku nach dem 5-7-5-Schema?', 17, { unit: 'Silben' }),
  n('kul-m-12', 'Kultur', 'Mittel', 'In welchem Jahr fand die erste Oscarverleihung statt?', 1929, { unit: 'Jahr' }),
  c('kul-m-13', 'Kultur', 'Mittel', 'Wer schrieb den Roman „1984“?', 'George Orwell', ['Aldous Huxley', 'George Orwell', 'Ray Bradbury', 'H. G. Wells']),
  c('kul-m-14', 'Kultur', 'Mittel', 'Wer malte „Sternennacht“?', 'Vincent van Gogh', ['Paul Cézanne', 'Vincent van Gogh', 'Claude Monet', 'Paul Gauguin']),
  c('kul-m-15', 'Kultur', 'Mittel', 'In welcher Stadt befindet sich das Museo del Prado?', 'Madrid', ['Barcelona', 'Madrid', 'Lissabon', 'Sevilla']),
  c('kul-m-16', 'Kultur', 'Mittel', 'Wer komponierte die Oper „Die Zauberflöte“?', 'Wolfgang Amadeus Mozart', ['Ludwig van Beethoven', 'Wolfgang Amadeus Mozart', 'Richard Wagner', 'Giuseppe Verdi']),
  c('kul-m-17', 'Kultur', 'Mittel', 'Welcher Architekt prägte die Sagrada Família maßgeblich?', 'Antoni Gaudí', ['Le Corbusier', 'Antoni Gaudí', 'Frank Gehry', 'Santiago Calatrava']),
  c('kul-m-18', 'Kultur', 'Mittel', 'Wer schrieb „Don Quijote“?', 'Miguel de Cervantes', ['Federico García Lorca', 'Miguel de Cervantes', 'Jorge Luis Borges', 'Gabriel García Márquez']),

  // Kultur · Schwer · 11 zusätzliche Fragen
  n('kul-s-07', 'Kultur', 'Schwer', 'Wie viele Brandenburgische Konzerte komponierte Johann Sebastian Bach?', 6, { unit: 'Konzerte' }),
  n('kul-s-08', 'Kultur', 'Schwer', 'Aus wie vielen Opern besteht Richard Wagners „Ring des Nibelungen“?', 4, { unit: 'Opern' }),
  n('kul-s-09', 'Kultur', 'Schwer', 'Wie viele Gesänge umfasst Dantes „Göttliche Komödie“ insgesamt?', 100, { unit: 'Gesänge' }),
  n('kul-s-10', 'Kultur', 'Schwer', 'Wie viele Variationen umfasst Bachs Werk „Goldberg-Variationen“ neben der Aria?', 30, { unit: 'Variationen' }),
  n('kul-s-11', 'Kultur', 'Schwer', 'Aus wie vielen Musikerinnen oder Musikern besteht ein Oktett?', 8, { unit: 'Personen' }),
  c('kul-s-12', 'Kultur', 'Schwer', 'Wer führte Regie bei dem Film „Die sieben Samurai“?', 'Akira Kurosawa', ['Yasujirō Ozu', 'Akira Kurosawa', 'Hayao Miyazaki', 'Hirokazu Koreeda']),
  c('kul-s-13', 'Kultur', 'Schwer', 'In welcher Stadt entstand 1916 die Dada-Bewegung rund um das Cabaret Voltaire?', 'Zürich', ['Berlin', 'Paris', 'Zürich', 'Wien']),
  c('kul-s-14', 'Kultur', 'Schwer', 'Wer schrieb den Roman „Ulysses“?', 'James Joyce', ['Virginia Woolf', 'James Joyce', 'Samuel Beckett', 'T. S. Eliot']),
  c('kul-s-15', 'Kultur', 'Schwer', 'Wer komponierte das Ballett „Le Sacre du printemps“?', 'Igor Strawinsky', ['Sergei Prokofjew', 'Igor Strawinsky', 'Pjotr Tschaikowski', 'Maurice Ravel']),
  c('kul-s-16', 'Kultur', 'Schwer', 'Mit welcher Kunstbewegung wird Piet Mondrian besonders verbunden?', 'De Stijl', ['Futurismus', 'De Stijl', 'Dadaismus', 'Surrealismus']),
  c('kul-s-17', 'Kultur', 'Schwer', 'Wer entwarf das Haus „Fallingwater“?', 'Frank Lloyd Wright', ['Walter Gropius', 'Frank Lloyd Wright', 'Mies van der Rohe', 'Alvar Aalto']),
];

export const estimationQuestions: EstimationQuestion[] = [
  ...baseEstimationQuestions,
  ...additionalEstimationQuestions,
];
