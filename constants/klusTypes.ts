import { KlusType, Ondergrond } from '../types';

export interface KlusTypeInfo {
  id: KlusType;
  label: string;
  icoon: string;
  beschrijving: string;
  kleur: string;
}

export const KLUS_TYPES: KlusTypeInfo[] = [
  {
    id: 'tegelen',
    label: 'Badkamer tegelen',
    icoon: 'view-grid',
    beschrijving: 'Vloer + wanden betegelen',
    kleur: '#2980B9',
  },
  {
    id: 'schilderen',
    label: 'Muur schilderen',
    icoon: 'brush',
    beschrijving: 'Muur of wand verven',
    kleur: '#27AE60',
  },
  {
    id: 'laminaat',
    label: 'Laminaat leggen',
    icoon: 'layers-triple',
    beschrijving: 'Laminaat of parket plaatsen',
    kleur: '#8E6914',
  },
  {
    id: 'gipsplaten',
    label: 'Gipsplaten',
    icoon: 'wall',
    beschrijving: 'Gipsplaten plaatsen',
    kleur: '#7F8C8D',
  },
  {
    id: 'stucen',
    label: 'Stucen / Pleisteren',
    icoon: 'texture',
    beschrijving: 'Wand of plafond stucen',
    kleur: '#E67E22',
  },
];

export interface OndergrondInfo {
  id: Ondergrond;
  label: string;
  waarschuwing?: string;
}

export const ONDERGRONDEN: OndergrondInfo[] = [
  {
    id: 'beton',
    label: 'Beton',
  },
  {
    id: 'gipsblokken',
    label: 'Gipsblokken',
    waarschuwing: 'Altijd voorgronden + flexibele lijm gebruiken',
  },
  {
    id: 'hout',
    label: 'Hout / Multiplex',
    waarschuwing: 'Bewegingsgevoelig, gebruik flexibele materialen',
  },
  {
    id: 'bestaande_tegels',
    label: 'Bestaande tegels',
    waarschuwing: 'Controleer hechting van bestaande tegels eerst',
  },
  {
    id: 'metselwerk',
    label: 'Metselwerk',
  },
  {
    id: 'gipsplaat',
    label: 'Gipsplaat / Rigips',
    waarschuwing: 'In natte ruimten watervaste gipsplaat gebruiken',
  },
];

export const RUIMTE_TYPES = [
  { id: 'droog' as const, label: 'Droge ruimte' },
  { id: 'vochtig' as const, label: 'Vochtige ruimte (badkamer/keuken)' },
  { id: 'buiten' as const, label: 'Buiten / buitenwerk' },
];

export const KWALITEIT_NIVEAUS = [
  {
    id: 'budget' as const,
    label: 'Budget',
    beschrijving: 'Standaard materialen, scherpe prijs',
  },
  {
    id: 'standaard' as const,
    label: 'Standaard',
    beschrijving: 'Goede kwaliteit/prijs verhouding',
  },
  {
    id: 'premium' as const,
    label: 'Premium',
    beschrijving: 'Beste kwaliteit materialen',
  },
];
