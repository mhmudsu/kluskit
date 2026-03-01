export function formateerPrijs(bedrag: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
  }).format(bedrag);
}

export function formateerUren(uren: number): string {
  if (uren < 1) {
    return `${Math.round(uren * 60)} minuten`;
  }
  const geheleUren = Math.floor(uren);
  const minuten = Math.round((uren - geheleUren) * 60);
  if (minuten === 0) {
    return `${geheleUren} uur`;
  }
  return `${geheleUren} uur ${minuten} min`;
}

export function formateerHoeveelheid(hoeveelheid: number, eenheid: string): string {
  const afgerond = Math.round(hoeveelheid * 10) / 10;
  return `${afgerond} ${eenheid}`;
}
