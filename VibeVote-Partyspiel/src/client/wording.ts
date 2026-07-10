import type { PlayMode } from '../shared/types';

export interface GameWording {
  singular: string;
  plural: string;
  countLabel: string;
  shortRule: string;
  resultAction: (count: number) => string;
  finalAction: string;
}

export function getWording(mode: PlayMode): GameWording {
  switch (mode) {
    case 'point':
      return {
        singular: 'Punkt',
        plural: 'Punkte',
        countLabel: 'Punkte',
        shortRule: 'Wer die meisten Stimmen erhält, bekommt einen Punkt.',
        resultAction: (count) => `${count} ${count === 1 ? 'Punkt' : 'Punkte'} erhalten`,
        finalAction: 'erhalten zum Abschluss jeweils noch einen Punkt.',
      };
    case 'task':
      return {
        singular: 'Aufgabe',
        plural: 'Aufgaben',
        countLabel: 'Aufgaben',
        shortRule: 'Wer die meisten Stimmen erhält, erfüllt eine Aufgabe.',
        resultAction: (count) => `${count} ${count === 1 ? 'Aufgabe' : 'Aufgaben'} erfüllen`,
        finalAction: 'erfüllen zum Abschluss jeweils noch eine Aufgabe.',
      };
    case 'drink':
    default:
      return {
        singular: 'Schluck',
        plural: 'Schlücke',
        countLabel: 'Schlücke',
        shortRule: 'Wer die meisten Stimmen erhält, trinkt einen Schluck.',
        resultAction: (count) => `${count} ${count === 1 ? 'Schluck' : 'Schlücke'} trinken`,
        finalAction: 'trinken zum Abschluss jeweils noch einen Schluck.',
      };
  }
}
