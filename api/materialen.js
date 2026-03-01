// Vercel serverless function — identiek aan netlify/functions/materialen.js
const https = require('https');

const SYSTEM_PROMPT = `Je bent een expert bouwmaterialen adviseur voor de Nederlandse markt. Je genereert nauwkeurige materialenlijsten voor klussen op basis van afmetingen en specificaties.

REGELS:
1. Geef ALTIJD specifieke producttypes, niet generieke namen
2. Bereken ALTIJD 10% extra voor snijverlies/marge
3. Gebruik Nederlandse productnamen en merken (Weber, Knauf, Gyproc, Soudal)
4. Geef hoeveelheden in standaard verpakkingseenheden
5. Waarschuw bij specifieke ondergronden
6. Houd rekening met de ruimte: vochtige ruimte = andere materialen dan droge ruimte
7. Geef geschatte arbeidstijd gebaseerd op gemiddelde vakman snelheid

OUTPUT FORMAT: Geef antwoord ALLEEN als geldig JSON zonder uitleg, met deze structuur:
{
  "materialen": [{"naam":"string","specificatie":"string","hoeveelheid":0,"eenheid":"string","prijsPerEenheid":0,"totaalPrijs":0,"categorie":"hoofdmateriaal|hulpmateriaal|gereedschap","opmerking":"string"}],
  "totaalMateriaalkosten": 0,
  "geschatteArbeidstijd": 0,
  "tips": ["string"],
  "waarschuwingen": ["string"]
}`;

const KLUS_LABELS = {
  tegelen: 'Badkamer tegelen', schilderen: 'Muur/wand schilderen',
  laminaat: 'Laminaat/parket leggen', gipsplaten: 'Gipsplaten plaatsen', stucen: 'Stucen/pleisteren',
};
const ONDERGROND_LABELS = {
  beton: 'Beton', gipsblokken: 'Gipsblokken', hout: 'Hout',
  bestaande_tegels: 'Bestaande tegels', metselwerk: 'Metselwerk', gipsplaat: 'Gipsplaat',
};

function claudeRequest(apiKey, body) {
  return new Promise((resolve, reject) => {
    const buf = Buffer.from(body, 'utf-8');
    const req = https.request({
      hostname: 'api.anthropic.com', path: '/v1/messages', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': buf.length,
        'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      timeout: 60000,
    }, (res) => {
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => {
        if ((res.statusCode ?? 500) >= 400) reject(new Error(`Claude fout (${res.statusCode}): ${data}`));
        else resolve(data);
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    req.write(buf); req.end();
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API sleutel niet geconfigureerd' });

  let invoer;
  try { invoer = req.body; } catch { return res.status(400).json({ error: 'Ongeldig verzoek' }); }

  try {
    const prompt = `Klus: ${KLUS_LABELS[invoer.klusType] ?? invoer.klusType}
Afmetingen: ${invoer.afmetingen.lengte}m × ${invoer.afmetingen.breedte}m × ${invoer.afmetingen.hoogte}m
Ondergrond: ${ONDERGROND_LABELS[invoer.ondergrond] ?? invoer.ondergrond}
Ruimte: ${invoer.ruimteType} | Kwaliteit: ${invoer.kwaliteit}
Bijzonderheden: ${invoer.bijzonderheden || 'geen'}

Genereer een complete materialenlijst (Nederlandse markt, 2025/2026 prijsniveau).`;

    const responseText = await claudeRequest(apiKey, JSON.stringify({
      model: 'claude-sonnet-4-20250514', max_tokens: 4096,
      system: SYSTEM_PROMPT, messages: [{ role: 'user', content: prompt }],
    }));

    const data = JSON.parse(responseText);
    const tekst = data.content?.[0]?.text ?? '';
    const match = tekst.match(/\{[\s\S]*\}/);
    if (!match) return res.status(500).json({ error: 'Geen geldig JSON in response' });

    res.status(200).json(JSON.parse(match[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
