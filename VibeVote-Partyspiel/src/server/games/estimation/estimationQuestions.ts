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
 * 120 getrennt gepflegte Fragen: je 20 pro Kategorie und in jeder Kategorie
 * sieben leichte, sieben mittlere und sechs schwere Fragen.
 */
export const estimationQuestions: EstimationQuestion[] = [
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
