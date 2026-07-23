/**
 * Kompatibilitätsdatei für ältere Deployments.
 *
 * Frühere Versionen haben hier den inzwischen entfernten Typ `PlayMode`
 * importiert. Die aktuelle Anwendung verwendet fest die Schluck-Begriffe;
 * deshalb benötigt dieses Modul keinen Import mehr. Die Datei darf im
 * GitHub-Repository verbleiben, ohne den TypeScript-Build zu blockieren.
 */
export interface GameWording {
  singular: string;
  plural: string;
  countLabel: string;
  resultAction: (count: number) => string;
  finalAction: string;
}

export function getWording(): GameWording {
  return {
    singular: 'Schluck',
    plural: 'Schlücke',
    countLabel: 'Schlücke',
    resultAction: (count) => `${count} ${count === 1 ? 'Schluck' : 'Schlücke'} trinken`,
    finalAction: 'trinken zum Abschluss jeweils noch einen Schluck.',
  };
}
