export type KlusType =
  | 'tegelen'
  | 'schilderen'
  | 'laminaat'
  | 'gipsplaten'
  | 'stucen';

export type Ondergrond =
  | 'beton'
  | 'gipsblokken'
  | 'hout'
  | 'bestaande_tegels'
  | 'metselwerk'
  | 'gipsplaat';

export type RuimteType = 'droog' | 'vochtig' | 'buiten';
export type Kwaliteit = 'budget' | 'standaard' | 'premium';
export type MateriaalCategorie = 'hoofdmateriaal' | 'hulpmateriaal' | 'gereedschap';

export interface Afmetingen {
  lengte: number;
  breedte: number;
  hoogte: number;
}

export interface Materiaal {
  naam: string;
  specificatie: string;
  hoeveelheid: number;
  eenheid: string;
  prijsPerEenheid: number;
  totaalPrijs: number;
  categorie: MateriaalCategorie;
  opmerking?: string;
}

export interface MaterialenResultaat {
  materialen: Materiaal[];
  totaalMateriaalkosten: number;
  geschatteArbeidstijd: number;
  tips: string[];
  waarschuwingen: string[];
}

export interface KlusInvoer {
  klusType: KlusType | null;
  afmetingen: Afmetingen;
  ondergrond: Ondergrond | null;
  ruimteType: RuimteType;
  kwaliteit: Kwaliteit;
  bijzonderheden: string;
}

export interface Project {
  id: string;
  naam: string;
  klantNaam?: string;
  klantAdres?: string;
  klantTelefoon?: string;
  klusType: KlusType;
  afmetingen: Afmetingen;
  ondergrond: Ondergrond;
  ruimteType: RuimteType;
  kwaliteit: Kwaliteit;
  bijzonderheden?: string;
  materialen?: MaterialenResultaat;
  status: 'concept' | 'offerte' | 'actief' | 'afgerond';
  aangemaaktOp: Date;
}

export interface GebruikersProfiel {
  naam: string;
  bedrijfsnaam: string;
  kvkNummer: string;
  btwNummer: string;
  telefoon: string;
  adres: string;
  uurtarief: number;
  logoUrl?: string;
  betalingsvoorwaarden?: string;  // bijv. "Betaling binnen 14 dagen na factuurdatum"
  algVoorwaarden?: string;         // Tekst van de algemene voorwaarden
}

export type OfferteBtwType = '21%' | 'verlegd';

export type FotoType = 'voor' | 'tijdens' | 'na' | 'analyse';

export interface KlusFoto {
  id: string;
  uri: string;
  base64?: string;
  type: FotoType;
  notitie?: string;
  tijdstempel: Date;
}

export interface FotoAnalyseResultaat {
  ruimteType: string;
  beschrijving: string;
  huidigeStaat: string;
  geschatteAfmetingen: {
    lengte?: number;
    breedte?: number;
    hoogte?: number;
    notitie?: string;
  };
  ondergrond: string;
  suggestieKlusType: KlusType | null;
  suggestieReden: string;
  aanbevelingen: string[];
}

export interface Offerte {
  id: string;
  offerteNummer: string;
  datum: Date;
  geldigTot: Date;
  klantNaam: string;
  klantAdres: string;
  klantTelefoon: string;
  klantEmail: string;
  werkbeschrijving: string;
  materialen: Materiaal[];
  totaalMateriaalkosten: number;
  arbeidsUren: number;
  uurtarief: number;
  btwType: OfferteBtwType;
  arbeidskosten: number;
  subtotaal: number;
  btwBedrag: number;
  totaalInclBtw: number;
  bedrijfsProfiel: GebruikersProfiel;
  status: 'concept' | 'verzonden' | 'geaccepteerd' | 'afgewezen';
}
