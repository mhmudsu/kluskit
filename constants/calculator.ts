import { KlusType, Kwaliteit } from '../types';

export interface KlusPrijzen {
  materiaalPerM2: Record<Kwaliteit, number>;
  arbeidPerM2: Record<Kwaliteit, number>;  // €/m²
  eenheid: string;
  beschrijving: string;
}

export const KLUS_PRIJZEN: Record<KlusType, KlusPrijzen> = {
  tegelen: {
    materiaalPerM2: { budget: 35, standaard: 50, premium: 65 },
    arbeidPerM2:    { budget: 40, standaard: 47, premium: 55 },
    eenheid: 'm²',
    beschrijving: 'Vloer + wanden betegelen',
  },
  schilderen: {
    materiaalPerM2: { budget: 5,  standaard: 10, premium: 15 },
    arbeidPerM2:    { budget: 15, standaard: 20, premium: 25 },
    eenheid: 'm²',
    beschrijving: 'Muur of wand verven',
  },
  laminaat: {
    materiaalPerM2: { budget: 15, standaard: 30, premium: 45 },
    arbeidPerM2:    { budget: 15, standaard: 20, premium: 25 },
    eenheid: 'm²',
    beschrijving: 'Laminaat of parket leggen',
  },
  gipsplaten: {
    materiaalPerM2: { budget: 10, standaard: 15, premium: 20 },
    arbeidPerM2:    { budget: 25, standaard: 32, premium: 40 },
    eenheid: 'm²',
    beschrijving: 'Gipsplaten plaatsen',
  },
  stucen: {
    materiaalPerM2: { budget: 8,  standaard: 13, premium: 18 },
    arbeidPerM2:    { budget: 25, standaard: 35, premium: 45 },
    eenheid: 'm²',
    beschrijving: 'Wand of plafond stucen',
  },
};

export interface BerekeningResultaat {
  oppervlakte: number;
  materiaalkosten: number;
  arbeidskosten: number;
  subtotaal: number;
  btwBedrag: number;
  totaalInclBtw: number;
  arbeidMargePercent: number;
}

export function berekenKlus(
  klusType: KlusType,
  kwaliteit: Kwaliteit,
  lengte: number,
  breedte: number
): BerekeningResultaat {
  const prijzen = KLUS_PRIJZEN[klusType];
  const oppervlakte = lengte * breedte;
  const materiaalkosten = oppervlakte * prijzen.materiaalPerM2[kwaliteit];
  const arbeidskosten = oppervlakte * prijzen.arbeidPerM2[kwaliteit];
  const subtotaal = materiaalkosten + arbeidskosten;
  const btwBedrag = subtotaal * 0.21;
  const totaalInclBtw = subtotaal + btwBedrag;
  const arbeidMargePercent = subtotaal > 0 ? (arbeidskosten / subtotaal) * 100 : 0;

  return {
    oppervlakte,
    materiaalkosten,
    arbeidskosten,
    subtotaal,
    btwBedrag,
    totaalInclBtw,
    arbeidMargePercent,
  };
}
