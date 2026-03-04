const https = require('https');

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

const KLUS_LABELS = {
  tegelen: 'Badkamer tegelen',
  schilderen: 'Muur/wand schilderen',
  laminaat: 'Laminaat/parket leggen',
  gipsplaten: 'Gipsplaten plaatsen',
  stucen: 'Stucen/pleisteren',
};

const ONDERGROND_LABELS = {
  beton: 'Beton',
  gipsblokken: 'Gipsblokken',
  hout: 'Hout',
  bestaande_tegels: 'Bestaande tegels',
  metselwerk: 'Metselwerk',
  gipsplaat: 'Gipsplaat',
};

function bouwUserPrompt(invoer) {
  const klusLabel = KLUS_LABELS[invoer.klusType] ?? invoer.klusType;
  const ondergrondLabel = ONDERGROND_LABELS[invoer.ondergrond] ?? invoer.ondergrond;
  return `Klus: ${klusLabel}
Afmetingen: ${invoer.afmetingen.lengte}m × ${invoer.afmetingen.breedte}m × ${invoer.afmetingen.hoogte}m
Ondergrond: ${ondergrondLabel}
Ruimte: ${invoer.ruimteType}
Kwaliteitsniveau: ${invoer.kwaliteit}
Bijzonderheden: ${invoer.bijzonderheden || 'geen'}

Genereer een complete materialenlijst met exacte hoeveelheden en geschatte prijzen (Nederlandse markt, 2025/2026 prijsniveau).`;
}

function claudeRequest(apiKey, body) {
  return new Promise((resolve, reject) => {
    const bodyBuffer = Buffer.from(body, 'utf-8');
    const options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
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

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'API sleutel niet geconfigureerd op de server' }),
    };
  }

  let invoer;
  try {
    invoer = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Ongeldig verzoek' }) };
  }

  try {
    const requestBody = JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: bouwUserPrompt(invoer) }],
    });

    const responseText = await claudeRequest(apiKey, requestBody);
    const data = JSON.parse(responseText);
    const tekst = data.content?.[0]?.text ?? '';

    const jsonMatch = tekst.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Geen geldig JSON in Claude response' }),
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: jsonMatch[0],
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
