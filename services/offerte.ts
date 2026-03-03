import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Offerte, GebruikersProfiel } from '../types';

// ─────────────────────────────────────────────
// Hulpfuncties
// ─────────────────────────────────────────────

function formateerPrijs(bedrag: number): string {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(bedrag);
}

function formateerDatum(date: Date): string {
  return new Date(date).toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function initials(naam: string): string {
  return naam
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

/** Escapes HTML special characters zodat gebruikerstekst veilig in HTML staat. */
function esc(tekst: string): string {
  return tekst
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\n/g, '<br>');
}

// ─────────────────────────────────────────────
// Gedeelde CSS
// ─────────────────────────────────────────────

const BASIS_CSS = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 13px;
    color: #1B2631;
    background: #fff;
  }
  .header {
    background: #1B2631;
    padding: 24px 32px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }
  .header-links { display: flex; align-items: center; gap: 14px; }
  .logo-box {
    width: 50px; height: 50px;
    background: #2ECC71;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; font-weight: 900; color: #fff; letter-spacing: -1px;
    flex-shrink: 0;
  }
  .company-naam { font-size: 19px; font-weight: 700; color: #fff; margin-bottom: 3px; }
  .company-detail { font-size: 11px; color: rgba(255,255,255,0.65); margin-top: 2px; }
  .accent { height: 4px; background: #2ECC71; }
  .section-label {
    font-size: 9px; font-weight: 700; color: #999;
    letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px;
  }
  .section { padding: 18px 32px; border-bottom: 1px solid #EEEEEE; }
`;

// ─────────────────────────────────────────────
// Offerte HTML (pagina 1)
// ─────────────────────────────────────────────

export function genereerOfferteHTML(o: Offerte): string {
  const p = o.bedrijfsProfiel;
  const logoTekst = initials(p.bedrijfsnaam || p.naam || 'KK');
  const heeftVoorwaarden = Boolean(p.algVoorwaarden?.trim());

  const materialenRijen = o.materialen
    .map(
      (m, i) => `
    <tr class="${i % 2 === 0 ? 'even' : 'odd'}">
      <td>
        <div class="mat-naam">${esc(m.naam)}</div>
        <div class="mat-spec">${esc(m.specificatie)}</div>
      </td>
      <td class="right">${m.hoeveelheid} ${esc(m.eenheid)}</td>
      <td class="right">${formateerPrijs(m.prijsPerEenheid)}</td>
      <td class="right">${formateerPrijs(m.totaalPrijs)}</td>
    </tr>`
    )
    .join('');

  const arbeidRij = `
    <tr class="arbeid">
      <td>
        <div class="mat-naam">Arbeidskosten</div>
        <div class="mat-spec">${o.arbeidsUren} uur &times; &euro;${o.uurtarief}/uur</div>
      </td>
      <td class="right">${o.arbeidsUren} uur</td>
      <td class="right">&euro;${o.uurtarief}</td>
      <td class="right">${formateerPrijs(o.arbeidskosten)}</td>
    </tr>`;

  const btwRegel =
    o.btwType === '21%'
      ? `<tr class="totaal-rij">
          <td colspan="3" class="totaal-label">BTW 21%</td>
          <td class="right totaal-waarde">${formateerPrijs(o.btwBedrag)}</td>
        </tr>`
      : `<tr class="totaal-rij">
          <td colspan="3" class="totaal-label">BTW verlegd</td>
          <td class="right totaal-waarde">-</td>
        </tr>`;

  // Betalingsvoorwaarden + standaard condities
  const betalingVW = p.betalingsvoorwaarden?.trim()
    ? `<div class="vw-item"><span class="vw-bullet">&#x2022;</span><span class="vw-tekst">${esc(p.betalingsvoorwaarden)}</span></div>`
    : '';

  const algVWRegel = heeftVoorwaarden
    ? `<div class="vw-item"><span class="vw-bullet">&#x2022;</span><span class="vw-tekst"><strong>Op deze offerte zijn onze algemene voorwaarden van toepassing, zie bijlage.</strong></span></div>`
    : '';

  // Voorwaarden appendix: tweede pagina (alleen als voorwaarden ingesteld)
  const voorwaardenPagina = heeftVoorwaarden
    ? `
    <div style="page-break-before: always;"></div>
    <div class="header">
      <div class="header-links">
        <div class="logo-box">${logoTekst}</div>
        <div>
          <div class="company-naam">${esc(p.bedrijfsnaam || p.naam || 'Mijn Bedrijf')}</div>
          ${p.naam && p.bedrijfsnaam ? `<div class="company-detail">${esc(p.naam)}</div>` : ''}
        </div>
      </div>
      <div style="text-align:right;">
        <div class="company-detail">Bijlage bij offerte ${esc(o.offerteNummer)}</div>
      </div>
    </div>
    <div class="accent"></div>
    <div style="padding: 28px 32px;">
      <div style="font-size:20px; font-weight:700; color:#1B2631; margin-bottom:20px;">
        Algemene Voorwaarden
      </div>
      <div style="font-size:13px; color:#1B2631; line-height:1.8; white-space:pre-wrap;">${esc(p.algVoorwaarden ?? '')}</div>
    </div>`
    : '';

  return `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  ${BASIS_CSS}

  .meta { display:flex; justify-content:space-between; align-items:flex-start; padding:22px 32px; border-bottom:1px solid #EEEEEE; }
  .offerte-label { font-size:9px; font-weight:700; color:#999; letter-spacing:2px; text-transform:uppercase; margin-bottom:4px; }
  .offerte-nummer { font-size:28px; font-weight:700; color:#2ECC71; font-family:'Courier New',Courier,monospace; }
  .datum-blok { text-align:right; }
  .datum-label { font-size:9px; color:#999; letter-spacing:1px; text-transform:uppercase; margin-top:6px; margin-bottom:2px; }
  .datum-waarde { font-size:13px; font-weight:600; color:#1B2631; }
  .klant-naam { font-size:15px; font-weight:700; color:#1B2631; margin-bottom:3px; }
  .klant-detail { font-size:12px; color:#666; margin-top:2px; }
  .werk-tekst { font-size:13px; color:#1B2631; line-height:1.6; }

  table { width:100%; border-collapse:collapse; }
  thead th { font-size:9px; font-weight:700; color:#999; letter-spacing:1px; text-transform:uppercase; padding:6px 4px; border-bottom:2px solid #1B2631; text-align:left; }
  thead th.right { text-align:right; }
  td { padding:9px 4px; font-size:12px; color:#1B2631; vertical-align:top; border-bottom:1px solid #F0F0F0; }
  td.right { text-align:right; font-family:'Courier New',Courier,monospace; white-space:nowrap; }
  tr.even td { background:#FAFAFA; }
  tr.arbeid td { background:#FFF8F0; border-bottom:none; }
  .mat-naam { font-weight:600; font-size:12px; }
  .mat-spec { font-size:10px; color:#888; margin-top:2px; }

  .totalen { padding:16px 32px; border-bottom:1px solid #EEEEEE; }
  table.totalen-tabel { width:auto; margin-left:auto; min-width:340px; }
  .totaal-rij td { border-bottom:none; padding:4px 8px; }
  .totaal-label { font-size:13px; color:#666; text-align:right; padding-right:16px !important; }
  .totaal-waarde { font-size:13px; color:#1B2631; font-family:'Courier New',Courier,monospace; text-align:right !important; }
  .totaal-label-bold { font-size:13px; font-weight:600; color:#1B2631; text-align:right; padding-right:16px !important; }
  .totaal-waarde-bold { font-size:13px; font-weight:700; color:#1B2631; font-family:'Courier New',Courier,monospace; text-align:right !important; }
  .divider-dun { border:none; border-top:1px solid #EEEEEE; margin:4px 0; }
  .divider-dik { border:none; border-top:2px solid #1B2631; margin:6px 0; }
  .totaal-eind-rij { background:#FFF5EE; border-radius:6px; }
  .totaal-eind-rij td { padding:10px 12px; border:none; }
  .totaal-eind-label { font-size:15px; font-weight:700; color:#1B2631; text-align:right; padding-right:20px !important; }
  .totaal-eind-waarde { font-size:26px; font-weight:700; color:#2ECC71; font-family:'Courier New',Courier,monospace; text-align:right !important; white-space:nowrap; }

  .voorwaarden { padding:18px 32px; }
  .vw-item { display:flex; gap:8px; margin-top:6px; }
  .vw-bullet { color:#2ECC71; font-size:14px; line-height:1.5; flex-shrink:0; }
  .vw-tekst { font-size:11px; color:#666; line-height:1.6; }

  .footer { margin-top:32px; background:#F2F4F5; padding:14px 32px; display:flex; justify-content:space-between; align-items:center; border-top:1px solid #D5D8DC; }
  .footer-tekst { font-size:10px; color:#AAA; }
  .footer-merk { font-size:10px; font-weight:700; color:#1B2631; opacity:0.35; }
</style>
</head>
<body>

<div class="header">
  <div class="header-links">
    <div class="logo-box">${logoTekst}</div>
    <div>
      <div class="company-naam">${esc(p.bedrijfsnaam || p.naam || 'Mijn Bedrijf')}</div>
      ${p.naam && p.bedrijfsnaam ? `<div class="company-detail">${esc(p.naam)}</div>` : ''}
      ${p.telefoon ? `<div class="company-detail">Tel: ${esc(p.telefoon)}</div>` : ''}
      ${p.adres ? `<div class="company-detail">${esc(p.adres)}</div>` : ''}
    </div>
  </div>
  <div style="text-align:right;">
    ${p.kvkNummer ? `<div class="company-detail">KvK: ${esc(p.kvkNummer)}</div>` : ''}
    ${p.btwNummer ? `<div class="company-detail">BTW: ${esc(p.btwNummer)}</div>` : ''}
  </div>
</div>
<div class="accent"></div>

<div class="meta">
  <div>
    <div class="offerte-label">Offerte</div>
    <div class="offerte-nummer">${esc(o.offerteNummer)}</div>
  </div>
  <div class="datum-blok">
    <div class="datum-label">Datum</div>
    <div class="datum-waarde">${formateerDatum(o.datum)}</div>
    <div class="datum-label">Geldig tot</div>
    <div class="datum-waarde">${formateerDatum(o.geldigTot)}</div>
  </div>
</div>

<div class="section">
  <div class="section-label">Voor</div>
  <div class="klant-naam">${esc(o.klantNaam)}</div>
  ${o.klantAdres ? `<div class="klant-detail">${esc(o.klantAdres)}</div>` : ''}
  ${o.klantTelefoon ? `<div class="klant-detail">Tel: ${esc(o.klantTelefoon)}</div>` : ''}
  ${o.klantEmail ? `<div class="klant-detail">${esc(o.klantEmail)}</div>` : ''}
</div>

<div class="section">
  <div class="section-label">Werkbeschrijving</div>
  <div class="werk-tekst">${esc(o.werkbeschrijving)}</div>
</div>

<div class="section">
  <div class="section-label">Specificatie</div>
  <table>
    <thead>
      <tr>
        <th class="left">Omschrijving</th>
        <th class="right">Aantal</th>
        <th class="right">Prijs/eenheid</th>
        <th class="right">Totaal</th>
      </tr>
    </thead>
    <tbody>
      ${materialenRijen}
      ${arbeidRij}
    </tbody>
  </table>
</div>

<div class="totalen">
  <table class="totalen-tabel">
    <tr class="totaal-rij">
      <td class="totaal-label">Materiaalkosten</td>
      <td class="totaal-waarde">${formateerPrijs(o.totaalMateriaalkosten)}</td>
    </tr>
    <tr class="totaal-rij">
      <td class="totaal-label">Arbeidskosten</td>
      <td class="totaal-waarde">${formateerPrijs(o.arbeidskosten)}</td>
    </tr>
    <tr><td colspan="2"><hr class="divider-dun"></td></tr>
    <tr class="totaal-rij">
      <td class="totaal-label-bold">Subtotaal excl. BTW</td>
      <td class="totaal-waarde-bold">${formateerPrijs(o.subtotaal)}</td>
    </tr>
    ${btwRegel}
    <tr><td colspan="2"><hr class="divider-dik"></td></tr>
    <tr class="totaal-eind-rij">
      <td class="totaal-eind-label">Totaal incl. BTW</td>
      <td class="totaal-eind-waarde">${formateerPrijs(o.totaalInclBtw)}</td>
    </tr>
  </table>
</div>

<div class="voorwaarden">
  <div class="section-label">Voorwaarden</div>
  ${betalingVW}
  ${[
    '50% aanbetaling bij opdrachtverstrekking',
    'Restant betaling bij oplevering',
    'Meerwerk alleen na schriftelijke toestemming',
    `Offerte geldig tot ${formateerDatum(o.geldigTot)}`,
    'Prijzen zijn onder voorbehoud van prijswijzigingen',
  ]
    .map((v) => `<div class="vw-item"><span class="vw-bullet">&#x2022;</span><span class="vw-tekst">${v}</span></div>`)
    .join('')}
  ${algVWRegel}
</div>

<div class="footer">
  <span class="footer-tekst">Bedankt voor uw vertrouwen &mdash; wij zien uw opdracht graag tegemoet.</span>
  <span class="footer-merk">KlusKit</span>
</div>

${voorwaardenPagina}

</body>
</html>`;
}

// ─────────────────────────────────────────────
// Exportfuncties
// ─────────────────────────────────────────────

/**
 * Controleert of een offerte gedeeld mag worden.
 * Retourneert null als OK, of een foutmelding als er iets ontbreekt.
 */
export function controleDeelbaar(offerte: Offerte): string | null {
  const p = offerte.bedrijfsProfiel;
  if (!p.algVoorwaarden?.trim()) {
    return 'Voeg eerst je algemene voorwaarden toe in je Profiel. Zonder voorwaarden mag een offerte niet worden verstuurd.';
  }
  return null;
}

/**
 * Genereert een PDF-bestand (offerte + voorwaarden als bijlage op pagina 2).
 * Geeft het lokale bestandspad terug.
 */
export async function genereerOffertePdf(offerte: Offerte): Promise<string> {
  const html = genereerOfferteHTML(offerte);
  const { uri } = await Print.printToFileAsync({ html, base64: false });
  return uri;
}

/**
 * Genereert een gecombineerde PDF (offerte + voorwaarden) en opent het native deelvenster.
 * Gooit een fout als de algemene voorwaarden niet zijn ingesteld.
 */
export async function deelOffertePdf(offerte: Offerte): Promise<void> {
  const fout = controleDeelbaar(offerte);
  if (fout) throw new Error(fout);

  const pdfUri = await genereerOffertePdf(offerte);
  const kanDelen = await Sharing.isAvailableAsync();
  if (!kanDelen) throw new Error('Delen is niet beschikbaar op dit apparaat');

  await Sharing.shareAsync(pdfUri, {
    mimeType: 'application/pdf',
    dialogTitle: `Offerte ${offerte.offerteNummer} + Algemene Voorwaarden`,
    UTI: 'com.adobe.pdf',
  });
}
