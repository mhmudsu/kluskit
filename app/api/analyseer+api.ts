import https from 'https';

const CLAUDE_API_HOSTNAME = 'api.anthropic.com';
const CLAUDE_API_PATH = '/v1/messages';

const SYSTEM_PROMPT = `Je bent een expert bouwvakker en ruimte-analist. Analyseer de foto en geef een beoordeling van de ruimte.

Geef je antwoord ALLEEN als geldig JSON (geen uitleg, geen markdown), met deze structuur:
{
  "ruimteType": "badkamer|keuken|slaapkamer|woonkamer|toilet|hal|garage|kelder|zolder|buiten|anders",
  "beschrijving": "Korte beschrijving van wat je ziet in de ruimte",
  "huidigeStaat": "Beschrijving van de huidige staat: oud/nieuw, beschadigd/goed, stijl, bijzonderheden",
  "geschatteAfmetingen": {
    "lengte": 3.5,
    "breedte": 2.5,
    "hoogte": 2.4,
    "notitie": "Schatting op basis van zichtbare elementen zoals deuren, ramen, tegels"
  },
  "ondergrond": "beton|gipsblokken|hout|bestaande_tegels|metselwerk|gipsplaat|onbekend",
  "suggestieKlusType": "tegelen|schilderen|laminaat|gipsplaten|stucen|null",
  "suggestieReden": "Waarom dit klustype passend is op basis van de foto",
  "aanbevelingen": ["aanbeveling 1", "aanbeveling 2", "aanbeveling 3"]
}

Als je afmetingen niet kunt schatten, gebruik dan null voor die waarden. Wees eerlijk over onzekerheid.`;

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

  let imageBase64: string;
  let mimeType: string;

  try {
    const body = await request.json();
    imageBase64 = body.imageBase64;
    mimeType = body.mimeType ?? 'image/jpeg';
  } catch {
    return Response.json({ error: 'Ongeldig verzoek' }, { status: 400 });
  }

  if (!imageBase64) {
    return Response.json({ error: 'Geen afbeelding meegestuurd' }, { status: 400 });
  }

  try {
    const requestBody = JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mimeType,
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: 'Analyseer deze ruimte en geef je beoordeling als JSON.',
            },
          ],
        },
      ],
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
