# KlusKit - AI Klus-Assistent voor ZZP Bouwvakkers

## Project Overzicht
KlusKit is een mobiele app (iOS + Android) die ZZP-klussers helpt bij het voorbereiden van klussen. De app genereert automatisch materialenlijsten, berekent kosten, maakt professionele offertes, en documenteert klussen met foto's.

## Tech Stack
- **Framework**: Expo (React Native) met TypeScript
- **Navigation**: Expo Router (file-based routing)
- **UI**: React Native Paper (Material Design) + custom components
- **Backend**: Supabase (auth, database, storage)
- **AI**: Anthropic Claude API (claude-sonnet-4-20250514) voor materialenlijst generatie
- **PDF**: react-native-html-to-pdf voor offerte generatie
- **State**: Zustand voor lokale state management
- **Language**: App UI is in het **Nederlands**

## Architectuur

### Directory Structuur
```
kluskit/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab navigator
│   │   ├── index.tsx      # Home - Nieuwe klus starten
│   │   ├── projecten.tsx  # Projecten overzicht
│   │   ├── offerte.tsx    # Offertes beheer
│   │   └── profiel.tsx    # Profiel & instellingen
│   ├── klus/
│   │   ├── invoer.tsx     # Klus invoer formulier
│   │   ├── materialen.tsx # Materialenlijst resultaat
│   │   └── offerte.tsx    # Offerte genereren & preview
│   └── _layout.tsx        # Root layout
├── components/
│   ├── KlusTypeSelector.tsx    # Klus type selectie grid
│   ├── AfmetingenInput.tsx     # Afmetingen invoer
│   ├── OndergrondSelector.tsx  # Ondergrond type selectie
│   ├── MateriaalLijst.tsx      # Materiaal lijst display
│   ├── OffertePreview.tsx      # Offerte PDF preview
│   ├── FotoDocumentatie.tsx    # Foto capture & gallery
│   └── KostenCalculator.tsx    # Kosten berekening display
├── services/
│   ├── ai.ts              # Claude API integratie
│   ├── supabase.ts        # Supabase client
│   ├── offerte.ts         # Offerte PDF generatie
│   └── storage.ts         # Foto opslag
├── stores/
│   ├── klusStore.ts       # Klus state (Zustand)
│   └── userStore.ts       # User/profiel state
├── constants/
│   ├── klusTypes.ts       # Klus type definities
│   ├── materialen.ts      # Materiaal database
│   └── pricing.ts         # Prijzen referentie data
├── types/
│   └── index.ts           # TypeScript types
└── utils/
    ├── calculations.ts    # Materiaal berekeningen
    └── formatters.ts      # Prijs/eenheid formatters
```

## Core Features

### Feature 1: Materialenlijst Generator (MVP - Prioriteit 1)
**Flow**: Klus type selecteren → Afmetingen invoeren → Ondergrond selecteren → AI genereert materialenlijst

**Klus types voor MVP** (start met deze 5):
1. Badkamer tegelen (vloer + wanden)
2. Muur/wand schilderen
3. Laminaat/parket leggen
4. Gipsplaten plaatsen
5. Stucen/pleisteren

**Input velden per klus:**
- Type klus (verplicht)
- Afmetingen: lengte × breedte × hoogte in meters (verplicht)
- Type ondergrond: beton, gipsblokken, hout, bestaande tegels, etc. (verplicht)
- Bijzonderheden: vochtige ruimte, buitenwerk, etc. (optioneel)
- Kwaliteitsniveau: budget / standaard / premium (verplicht)

**Output:**
- Complete materialenlijst met:
  - Productnaam
  - Specificatie (bijv. "flexibele tegellijm C2TE" niet gewoon "tegellijm")
  - Hoeveelheid (met 10% snijverlies/marge inbegrepen)
  - Eenheid (m², kg, stuks, tubes, rollen)
  - Geschatte prijs per eenheid
  - Geschatte totaalprijs
- Totaal materiaalkosten
- Geschatte arbeidstijd in uren
- Tips/waarschuwingen (bijv. "Bij gipsblokken altijd eerst gronden")

### Feature 2: Offerte Generator (Prioriteit 2)
**Input**: Materialenlijst + gebruikersprofiel (naam, KvK, uurtarief)
**Output**: Professionele offerte PDF met:
- Bedrijfsgegevens (logo, naam, KvK, BTW)
- Klantgegevens
- Werkbeschrijving
- Materiaalkosten (itemized)
- Arbeidskosten (uren × uurtarief)
- BTW berekening (21%)
- Totaalbedrag
- Geldigheidsduur (standaard 30 dagen)
- Voorwaarden

De PDF moet er **professioneel** uitzien - niet als een Word template maar als een echt ontworpen document.

### Feature 3: Klus Calculator (Prioriteit 3)
Snelle berekening zonder volledige materialenlijst:
- "Wat kost het om een kamer van X×Y te schilderen?"
- Materiaalkosten + arbeid = totaal
- Vergelijking: als ik €X per uur reken, is deze klus rendabel?
- Winstmarge calculator

### Feature 4: Foto Documentatie (Prioriteit 4)
- Per project: voor-foto's en na-foto's
- Automatische datum/tijd stempel
- Notities bij foto's
- Export als PDF rapport (voor klant of administratie)

## AI Prompt Strategie

### System Prompt voor Materialenlijst Generatie
```
Je bent een expert bouwmaterialen adviseur voor de Nederlandse markt. Je genereert nauwkeurige materialenlijsten voor klussen op basis van afmetingen en specificaties.

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

OUTPUT FORMAT: Geef antwoord als JSON met deze structuur:
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
}
```

### User Prompt Template
```
Klus: {klusType}
Afmetingen: {lengte}m × {breedte}m × {hoogte}m
Ondergrond: {ondergrond}
Ruimte: {ruimteType} (droog/vochtig/buiten)
Kwaliteitsniveau: {kwaliteit} (budget/standaard/premium)
Bijzonderheden: {bijzonderheden}

Genereer een complete materialenlijst met exacte hoeveelheden en geschatte prijzen (Nederlandse markt, 2025/2026 prijsniveau).
```

## UI/UX Richtlijnen

### Design Principes
- **Industrieel/Utilitarian** - past bij de doelgroep (bouwvakkers)
- Grote knoppen (worden gebruikt met werkhandschoenen aan)
- Hoog contrast (wordt gebruikt op bouwplaatsen in zonlicht)
- Minimale tekst, maximale duidelijkheid
- Snelle flow: van invoer naar resultaat in max 3 taps

### Kleurenpalet
- Primary: #FF6B00 (bouw-oranje)
- Secondary: #1A1A2E (donker blauw-zwart)
- Background: #F5F5F0 (warm wit/licht grijs)
- Success: #2ECC71
- Warning: #F39C12
- Error: #E74C3C
- Text: #1A1A2E
- Text Secondary: #666666

### Typografie
- Headers: Bold, groot (24-32px)
- Body: Regular, leesbaar (16-18px)  
- Getallen/prijzen: Monospace, duidelijk leesbaar

### Iconen
- Gebruik simpele, herkenbare iconen voor klustypen
- Tegel-icoon, verfroller, zaag, etc.
- Expo Vector Icons (MaterialCommunityIcons heeft bouw-iconen)

## Database Schema (Supabase)

### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  bedrijfsnaam TEXT,
  kvk_nummer TEXT,
  btw_nummer TEXT,
  telefoon TEXT,
  adres TEXT,
  uurtarief DECIMAL(10,2) DEFAULT 45.00,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### projecten
```sql
CREATE TABLE projecten (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  naam TEXT NOT NULL,
  klant_naam TEXT,
  klant_adres TEXT,
  klant_telefoon TEXT,
  klus_type TEXT NOT NULL,
  afmetingen JSONB NOT NULL,
  ondergrond TEXT,
  ruimte_type TEXT DEFAULT 'droog',
  kwaliteit TEXT DEFAULT 'standaard',
  bijzonderheden TEXT,
  materialen JSONB,
  totaal_materiaalkosten DECIMAL(10,2),
  geschatte_arbeidstijd DECIMAL(5,1),
  status TEXT DEFAULT 'concept',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### offertes
```sql
CREATE TABLE offertes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projecten(id),
  user_id UUID REFERENCES users(id),
  offerte_nummer TEXT UNIQUE NOT NULL,
  klant_naam TEXT NOT NULL,
  klant_adres TEXT,
  werkbeschrijving TEXT,
  materiaalkosten DECIMAL(10,2),
  arbeidskosten DECIMAL(10,2),
  btw_bedrag DECIMAL(10,2),
  totaal_bedrag DECIMAL(10,2),
  geldig_tot DATE,
  status TEXT DEFAULT 'concept',
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### fotos
```sql
CREATE TABLE fotos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projecten(id),
  user_id UUID REFERENCES users(id),
  foto_url TEXT NOT NULL,
  type TEXT CHECK (type IN ('voor', 'tijdens', 'na')),
  notitie TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Monetization
- Freemium: 3 materialenlijsten per maand gratis
- Pay-per-use: €2,99 per extra berekening
- Pro: €14,99/maand unlimited
- Jaarabonnement: €119/jaar (€9,99/maand)

Gebruik RevenueCat voor in-app purchases en subscription management (werkt met Expo).

## Development Fases

### Fase 1: MVP (Week 1-2)
- [x] Project setup met Expo
- [ ] Klus invoer scherm (type + afmetingen + ondergrond)
- [ ] Claude API integratie voor materialenlijst
- [ ] Materialenlijst display scherm
- [ ] Basis navigatie (tabs)

### Fase 2: Offerte (Week 3-4)
- [ ] Gebruikersprofiel (bedrijfsgegevens)
- [ ] Offerte generator met PDF export
- [ ] Offerte preview scherm
- [ ] Delen via WhatsApp/email

### Fase 3: Calculator & Foto's (Week 5-6)
- [ ] Klus calculator
- [ ] Foto documentatie per project
- [ ] Projecten overzicht
- [ ] Supabase integratie (opslag & sync)

### Fase 4: Monetization & Launch (Week 7-8)
- [ ] RevenueCat integratie
- [ ] Freemium limiet implementatie
- [ ] App Store assets (screenshots, beschrijving)
- [ ] Submit naar Apple App Store & Google Play

## Code Stijl
- TypeScript strict mode
- Functionele componenten met hooks
- Geen class components
- Beschrijvende Nederlandse variabelen waar het UI betreft
- Engelse code conventies voor technische namen
- Altijd error handling bij API calls
- Loading states bij async operaties

## Belangrijke Dependencies
```json
{
  "expo": "~52",
  "expo-router": "~4",
  "react-native-paper": "^5",
  "@supabase/supabase-js": "^2",
  "zustand": "^4",
  "react-native-html-to-pdf": "^0.12",
  "expo-camera": "~16",
  "expo-file-system": "~18",
  "expo-sharing": "~13",
  "react-native-purchases": "^8"
}
```
