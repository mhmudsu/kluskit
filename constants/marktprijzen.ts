import { KlusType } from '../types';

export interface MarktprijsRange {
  min: number;  // € per m² (materiaal + arbeid totaal)
  max: number;
}

/** Gemiddelde marktprijzen inclusief materiaal én arbeid, per m², Nederlandse markt 2025/2026. */
export const MARKTPRIJZEN: Record<KlusType, MarktprijsRange> = {
  tegelen:    { min: 75,  max: 120 },
  schilderen: { min: 20,  max: 40  },
  laminaat:   { min: 30,  max: 70  },
  gipsplaten: { min: 35,  max: 60  },
  stucen:     { min: 33,  max: 63  },
};

export type MarktprijsStatus = 'onder' | 'marktconform' | 'boven';

export function bepaalMarktprijsStatus(
  prijsPerM2: number,
  range: MarktprijsRange
): MarktprijsStatus {
  if (prijsPerM2 < range.min) return 'onder';
  if (prijsPerM2 > range.max) return 'boven';
  return 'marktconform';
}
