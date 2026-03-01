import https from 'https';
import { KlusInvoer } from '../../types';
import { KLUS_TYPES, ONDERGRONDEN } from '../../constants/klusTypes';

const CLAUDE_API_HOSTNAME = 'api.anthropic.com';
const CLAUDE_API_PATH = '/v1/messages';

const SYSTEM_PROMPT = `Je bent een expert bouwmaterialen adviseur voor de Nederlandse markt. Je genereert nauwkeurige materialenlijsten voor klussen op basis van afmetingen en specificaties.

REGELS:
1. Geef ALTIJD specifieke producttypes, niet generieke namen
   - GOED: "Flexibele tegellijm C2TE (bijv. Weber Flex)"
   - FOUT: "Tegellijm"
2. Bereken ALTIJD 10% extra voor snijverlies/marge
3. Gebruik Nederlandse productnamen en merken (Weber, Knauf, Gyproc, Soudal)
4. Geef hoeveelheden in standaard verpakkingseenheden
   - Tegellijm: zakken van 25kg
   - Voegmiddel: zakken van 5kg
   - Primer: emmers van 5 of 10 liter
5. Waarschuw bij specifieke ondergronden (bijv. gipsblokken = altijd primer + flex lijm)
6. Houd rekening met de ruimte: vochtige ruimte = andere materialen dan droge ruimte
7. Geef geschatte arbeidstijd gebaseerd op gemiddelde vakman snelheid

OUTPUT FORMAT: Geef antwoord ALLEEN als geldig JSON zonder uitleg, met deze structuur:
{
  "materialen": [
    {
      "naam": "string",
      "specificatie": "string",
      "hoeveelheid": number,
      "eenheid": "string",
      "prijsPerEenheid": number,
      "totaalPrijs": number,
      "categorie": "hoofdmateriaal|hulpmateriaal|gereedschap",
      "opmerking": "string (optioneel)"
    }
  ],
  "totaalMateriaalkosten": number,
  "geschatteArbeidstijd": number,
  "tips": ["string"],
  "waarschuwingen": ["string"]
}`;

function bouwUserPrompt(invoer: KlusInvoer): string {
  const klusInfo = KLUS_TYPES.find((k) => k.id === invoer.klusType);
  const ondergrondInfo = ONDERGRONDEN.find((o) => o.id === invoer.ondergrond);
  return `Klus: ${klusInfo?.label ?? invoer.klusType}
Afmetingen: ${invoer.afmetingen.lengte}m × ${invoer.afmetingen.breedte}m × ${invoer.afmetingen.hoogte}m
Ondergrond: ${ondergrondInfo?.label ?? invoer.ondergrond}
Ruimte: ${invoer.ruimteType}
Kwaliteitsniveau: ${invoer.kwaliteit}
Bijzonderheden: ${invoer.bijzonderheden || 'geen'}

Genereer een complete materialenlijst met exacte hoeveelheden en geschatte prijzen (Nederlandse markt, 2025/2026 prijsniveau).`;
}

function claudeRequest(apiKey: string, body: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const bodyBuffer = Buffer.from(body, 'utf-8');
    const options = {
      hostname: CLAUDE_API_HOSTNAME,
      path: CLAUDE_API_PATH,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': bodyBuffer.length,
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      timeout: 60000,
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if ((res.statusCode ?? 500) >= 400) {
          reject(new Error(`Claude API fout (${res.statusCode}): ${data}`));
        } else {
          resolve(data);
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Claude API timeout na 60 seconden'));
    });

    req.write(bodyBuffer);
    req.end();
  });
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return Response.json({ error: 'API sleutel niet geconfigureerd' }, { status: 500 });
  }

  let invoer: KlusInvoer;
  try {
    invoer = await request.json();
  } catch {
    return Response.json({ error: 'Ongeldig verzoek' }, { status: 400 });
  }

  try {
    const requestBody = JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: bouwUserPrompt(invoer) }],
    });

    const responseText = await claudeRequest(apiKey, requestBody);
    const data = JSON.parse(responseText);
    const tekst: string = data.content?.[0]?.text ?? '';

    const jsonMatch = tekst.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return Response.json({ error: 'Geen geldig JSON in Claude response' }, { status: 500 });
    }

    const resultaat = JSON.parse(jsonMatch[0]);
    return Response.json(resultaat);
  } catch (err) {
    const bericht = err instanceof Error ? err.message : 'Onbekende fout';
    return Response.json({ error: bericht }, { status: 500 });
  }
}
