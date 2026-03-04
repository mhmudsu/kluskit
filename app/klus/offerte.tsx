import { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Switch,
  Modal,
  FlatList,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { KLEUREN } from '../../constants/kleuren';
import { useKlusStore } from '../../stores/klusStore';
import { useUserStore } from '../../stores/userStore';
import { useKlantenStore } from '../../stores/klantenStore';
import { formateerPrijs } from '../../utils/formatters';
import { KLUS_TYPES } from '../../constants/klusTypes';
import { MARKTPRIJZEN, bepaalMarktprijsStatus } from '../../constants/marktprijzen';
import { Offerte, OfferteBtwType, OfferteWeergave, Klant } from '../../types';

type Tab = 'berekening' | 'offerte';

function genereerWerkbeschrijving(
  klusType: string | null,
  bijzonderheden: string,
  afmetingen: { lengte: number; breedte: number; hoogte: number }
): string {
  const klusInfo = KLUS_TYPES.find((k) => k.id === klusType);
  const klusLabel = klusInfo?.label || klusType || 'Klus';
  const afmeting = `${afmetingen.lengte}m × ${afmetingen.breedte}m`;
  let beschrijving = `${klusLabel} (${afmeting})`;
  if (afmetingen.hoogte > 0) beschrijving += ` × ${afmetingen.hoogte}m hoog`;
  if (bijzonderheden) beschrijving += `. ${bijzonderheden}`;
  return beschrijving;
}

export default function OfferteInvoerScherm() {
  const { materiaalResultaat, huidigInvoer, aantalOffertes, setOfferteConcept } = useKlusStore();
  const { profiel } = useUserStore();
  const { klanten, voegKlantToe } = useKlantenStore();

  const [actieveTab, setActieveTab] = useState<Tab>('berekening');

  // ── Berekening state ──────────────────────────────────────────────────────
  const [materiaalMarge, setMateriaalMarge] = useState(20);
  const [arbeidBuffer, setArbeidBuffer] = useState(20);
  const [isSpoed, setIsSpoed] = useState(false);
  const [btwType, setBtwType] = useState<OfferteBtwType>('21%');

  // ── Klant offerte state ───────────────────────────────────────────────────
  const [weergaveType, setWeergaveType] = useState<OfferteWeergave>('gespecificeerd');
  const [klantNaam, setKlantNaam] = useState('');
  const [klantAdres, setKlantAdres] = useState('');
  const [klantTelefoon, setKlantTelefoon] = useState('');
  const [klantEmail, setKlantEmail] = useState('');
  const [werkbeschrijving, setWerkbeschrijving] = useState(() =>
    genereerWerkbeschrijving(huidigInvoer.klusType, huidigInvoer.bijzonderheden, huidigInvoer.afmetingen)
  );
  const [uurtarief, setUurtarief] = useState(() => String(profiel.uurtarief));
  const [klantKiezerZichtbaar, setKlantKiezerZichtbaar] = useState(false);

  if (!materiaalResultaat) {
    return (
      <View style={stijlen.leegContainer}>
        <MaterialCommunityIcons name="alert-circle-outline" size={64} color={KLEUREN.border} />
        <Text style={stijlen.leegTekst}>Geen materialenlijst beschikbaar</Text>
        <Pressable style={stijlen.terugKnop} onPress={() => router.back()}>
          <Text style={stijlen.terugKnopTekst}>Terug</Text>
        </Pressable>
      </View>
    );
  }

  // ── Berekeningen ──────────────────────────────────────────────────────────
  const inkoop = materiaalResultaat.totaalMateriaalkosten;
  const margeBedrag = inkoop * (materiaalMarge / 100);
  const materiaalVerkoop = inkoop + margeBedrag;

  const basisUren = materiaalResultaat.geschatteArbeidstijd;
  const gebufferdUren = basisUren * (1 + arbeidBuffer / 100);
  const tarief = parseFloat(uurtarief) || 0;
  const arbeidskosten = gebufferdUren * tarief;

  const spoedtoeslag = isSpoed ? arbeidskosten * 0.4 : 0;
  const subtotaal = materiaalVerkoop + arbeidskosten + spoedtoeslag;
  const btwBedrag = btwType === '21%' ? subtotaal * 0.21 : 0;
  const totaal = subtotaal + btwBedrag;

  const winst = margeBedrag + arbeidskosten + spoedtoeslag;
  const winstPercent = subtotaal > 0 ? (winst / subtotaal) * 100 : 0;

  const jaar = new Date().getFullYear();
  const offerteNummer = `KK-${jaar}-${String(aantalOffertes + 1).padStart(3, '0')}`;

  // ── Klant kiezen ──────────────────────────────────────────────────────────
  function kiesKlant(klant: Klant) {
    setKlantNaam(klant.naam);
    setKlantAdres(klant.adres ?? '');
    setKlantTelefoon(klant.telefoon ?? '');
    setKlantEmail(klant.email ?? '');
    setKlantKiezerZichtbaar(false);
  }

  function slaKlantOp() {
    if (!klantNaam.trim()) return;
    const bestaand = klanten.find(
      (k) => k.naam.toLowerCase() === klantNaam.trim().toLowerCase()
    );
    if (!bestaand) {
      voegKlantToe({
        id: Date.now().toString(),
        naam: klantNaam.trim(),
        adres: klantAdres.trim() || undefined,
        telefoon: klantTelefoon.trim() || undefined,
        email: klantEmail.trim() || undefined,
      });
    }
  }

  // ── Naar preview ──────────────────────────────────────────────────────────
  function gaaNaarPreview() {
    if (!klantNaam.trim()) {
      Alert.alert('Naam vereist', 'Vul de naam van de klant in.');
      setActieveTab('offerte');
      return;
    }

    slaKlantOp();

    const datum = new Date();
    const geldigTot = new Date();
    geldigTot.setDate(geldigTot.getDate() + 30);

    const offerte: Offerte = {
      id: Date.now().toString(),
      offerteNummer,
      datum,
      geldigTot,
      klantNaam: klantNaam.trim(),
      klantAdres: klantAdres.trim(),
      klantTelefoon: klantTelefoon.trim(),
      klantEmail: klantEmail.trim(),
      werkbeschrijving: werkbeschrijving.trim(),
      materialen: materiaalResultaat?.materialen ?? [],
      totaalMateriaalkosten: inkoop,
      materiaalMarge,
      materiaalVerkoopprijs: materiaalVerkoop,
      arbeidsUren: basisUren,
      arbeidBuffer,
      uurtarief: tarief,
      btwType,
      isSpoed,
      spoedtoeslag,
      arbeidskosten,
      subtotaal,
      btwBedrag,
      totaalInclBtw: totaal,
      weergaveType,
      bedrijfsProfiel: profiel,
      status: 'concept',
    };

    setOfferteConcept(offerte);
    router.push('/klus/offerte-preview');
  }

  return (
    <View style={stijlen.container}>
      {/* Tab balk */}
      <View style={stijlen.tabBalk}>
        <Pressable
          style={[stijlen.tab, actieveTab === 'berekening' && stijlen.tabActief]}
          onPress={() => setActieveTab('berekening')}
        >
          <MaterialCommunityIcons
            name="calculator-variant"
            size={16}
            color={actieveTab === 'berekening' ? KLEUREN.primary : KLEUREN.textSecondary}
          />
          <Text style={[stijlen.tabTekst, actieveTab === 'berekening' && stijlen.tabTekstActief]}>
            Mijn berekening
          </Text>
        </Pressable>
        <Pressable
          style={[stijlen.tab, actieveTab === 'offerte' && stijlen.tabActief]}
          onPress={() => setActieveTab('offerte')}
        >
          <MaterialCommunityIcons
            name="file-document-outline"
            size={16}
            color={actieveTab === 'offerte' ? KLEUREN.primary : KLEUREN.textSecondary}
          />
          <Text style={[stijlen.tabTekst, actieveTab === 'offerte' && stijlen.tabTekstActief]}>
            Klant offerte
          </Text>
        </Pressable>
      </View>

      <ScrollView
        style={stijlen.scroll}
        contentContainerStyle={stijlen.inhoud}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── TAB 1: MIJN BEREKENING ── */}
        {actieveTab === 'berekening' && (
          <>
            {/* Materiaalkosten sectie */}
            <View style={stijlen.sectie}>
              <View style={stijlen.sectieHeader}>
                <MaterialCommunityIcons name="package-variant" size={20} color={KLEUREN.primary} />
                <Text style={stijlen.sectieKop}>Materiaalkosten</Text>
              </View>

              {/* Per materiaal: inkoop → verkoop */}
              {materiaalResultaat.materialen.slice(0, 5).map((m, i) => {
                const verkoop = m.totaalPrijs * (1 + materiaalMarge / 100);
                return (
                  <View key={i} style={stijlen.materiaalRijBerekening}>
                    <Text style={stijlen.materiaalNaamBerekening} numberOfLines={1}>
                      {m.naam}
                    </Text>
                    <Text style={stijlen.materiaalInkoop}>{formateerPrijs(m.totaalPrijs)}</Text>
                    <MaterialCommunityIcons name="arrow-right" size={14} color={KLEUREN.textSecondary} />
                    <Text style={stijlen.materiaalVerkoop}>{formateerPrijs(verkoop)}</Text>
                  </View>
                );
              })}
              {materiaalResultaat.materialen.length > 5 && (
                <Text style={stijlen.meerItems}>
                  + {materiaalResultaat.materialen.length - 5} meer materialen
                </Text>
              )}

              {/* Marge instelling */}
              <View style={stijlen.margeRij}>
                <View style={{ flex: 1 }}>
                  <Text style={stijlen.margeLabel}>Materiaal marge</Text>
                  <Text style={stijlen.margeHint}>Dekt ophalen, uitzoektijd, klein materiaal</Text>
                </View>
                <View style={stijlen.margeInvoerWrapper}>
                  <TextInput
                    style={stijlen.margeInput}
                    value={String(materiaalMarge)}
                    onChangeText={(v) => setMateriaalMarge(parseFloat(v) || 0)}
                    keyboardType="decimal-pad"
                    selectTextOnFocus
                  />
                  <Text style={stijlen.margeProcent}>%</Text>
                </View>
              </View>

              <View style={stijlen.margeResultaatRij}>
                <Text style={stijlen.margeResultaatLabel}>Inkoop: {formateerPrijs(inkoop)}</Text>
                <Text style={stijlen.margeResultaatLabel}>+{formateerPrijs(margeBedrag)}</Text>
                <Text style={stijlen.margeResultaatVerkoop}>= {formateerPrijs(materiaalVerkoop)}</Text>
              </View>
            </View>

            {/* Arbeidskosten sectie */}
            <View style={stijlen.sectie}>
              <View style={stijlen.sectieHeader}>
                <MaterialCommunityIcons name="account-hard-hat" size={20} color={KLEUREN.primary} />
                <Text style={stijlen.sectieKop}>Arbeidskosten</Text>
              </View>

              <View style={stijlen.bufferHint}>
                <MaterialCommunityIcons name="information-outline" size={14} color={KLEUREN.textSecondary} />
                <Text style={stijlen.bufferHintTekst}>
                  {basisUren} uur verwacht → {gebufferdUren.toFixed(1)} gefactureerd = geen verlies bij tegenslag
                </Text>
              </View>

              <View style={stijlen.arbeidGrid}>
                <View style={{ flex: 1 }}>
                  <Text style={stijlen.arbeidLabel}>Uurtarief (€)</Text>
                  <View style={stijlen.arbeidInvoerWrapper}>
                    <TextInput
                      style={stijlen.arbeidInput}
                      value={uurtarief}
                      onChangeText={setUurtarief}
                      keyboardType="decimal-pad"
                      selectTextOnFocus
                    />
                  </View>
                </View>
                <View style={{ width: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={stijlen.arbeidLabel}>Buffer</Text>
                  <View style={stijlen.margeInvoerWrapper}>
                    <TextInput
                      style={stijlen.margeInput}
                      value={String(arbeidBuffer)}
                      onChangeText={(v) => setArbeidBuffer(parseFloat(v) || 0)}
                      keyboardType="decimal-pad"
                      selectTextOnFocus
                    />
                    <Text style={stijlen.margeProcent}>%</Text>
                  </View>
                </View>
              </View>

              <View style={stijlen.margeResultaatRij}>
                <Text style={stijlen.margeResultaatLabel}>{gebufferdUren.toFixed(1)} uur</Text>
                <Text style={stijlen.margeResultaatLabel}>× {formateerPrijs(tarief)}/uur</Text>
                <Text style={stijlen.margeResultaatVerkoop}>= {formateerPrijs(arbeidskosten)}</Text>
              </View>
            </View>

            {/* BTW keuze */}
            <View style={stijlen.sectie}>
              <View style={stijlen.sectieHeader}>
                <MaterialCommunityIcons name="percent" size={20} color={KLEUREN.primary} />
                <Text style={stijlen.sectieKop}>BTW</Text>
              </View>
              <View style={stijlen.btwKnoppen}>
                <Pressable
                  style={[stijlen.btwKnop, btwType === '21%' && stijlen.btwKnopActief]}
                  onPress={() => setBtwType('21%')}
                >
                  <Text style={[stijlen.btwKnopTekst, btwType === '21%' && stijlen.btwKnopTekstActief]}>
                    21% BTW
                  </Text>
                </Pressable>
                <Pressable
                  style={[stijlen.btwKnop, btwType === 'verlegd' && stijlen.btwKnopActief]}
                  onPress={() => setBtwType('verlegd')}
                >
                  <Text style={[stijlen.btwKnopTekst, btwType === 'verlegd' && stijlen.btwKnopTekstActief]}>
                    BTW verlegd
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Spoedklus toggle */}
            <View style={stijlen.sectie}>
              <View style={stijlen.spoedRij}>
                <View style={{ flex: 1 }}>
                  <Text style={stijlen.sectieKopInline}>Spoedklus</Text>
                  <Text style={stijlen.spoedHint}>+40% toeslag op arbeid</Text>
                </View>
                <Switch
                  value={isSpoed}
                  onValueChange={setIsSpoed}
                  trackColor={{ false: KLEUREN.border, true: KLEUREN.primary + '80' }}
                  thumbColor={isSpoed ? KLEUREN.primary : KLEUREN.white}
                />
              </View>
              {isSpoed && (
                <View style={stijlen.spoedWaarschuwing}>
                  <MaterialCommunityIcons name="alert" size={14} color={KLEUREN.warning} />
                  <Text style={stijlen.spoedWaarschuwingTekst}>
                    Communiceer spoedtoeslag altijd vooraf met de klant
                  </Text>
                </View>
              )}
            </View>

            {/* Samenvatting kaart */}
            <View style={stijlen.samenvattingKaart}>
              <Text style={stijlen.samenvattingKop}>Jouw kostenplaatje</Text>

              <View style={stijlen.samenvattingRij}>
                <Text style={stijlen.samenvattingLabel}>Materiaal inkoop</Text>
                <Text style={stijlen.samenvattingWaarde}>{formateerPrijs(inkoop)}</Text>
              </View>
              <View style={stijlen.samenvattingRij}>
                <Text style={stijlen.samenvattingLabel}>Materiaal marge (+{materiaalMarge}%)</Text>
                <Text style={stijlen.samenvattingWaarde}>{formateerPrijs(margeBedrag)}</Text>
              </View>
              <View style={stijlen.samenvattingRij}>
                <Text style={stijlen.samenvattingLabel}>Arbeid (incl. {arbeidBuffer}% buffer)</Text>
                <Text style={stijlen.samenvattingWaarde}>{formateerPrijs(arbeidskosten)}</Text>
              </View>
              {isSpoed && (
                <View style={stijlen.samenvattingRij}>
                  <Text style={[stijlen.samenvattingLabel, { color: KLEUREN.warning }]}>
                    Spoedtoeslag (40%)
                  </Text>
                  <Text style={[stijlen.samenvattingWaarde, { color: KLEUREN.warning }]}>
                    {formateerPrijs(spoedtoeslag)}
                  </Text>
                </View>
              )}
              <View style={stijlen.divider} />
              <View style={stijlen.samenvattingRij}>
                <Text style={stijlen.samenvattingLabelBold}>Subtotaal excl. BTW</Text>
                <Text style={stijlen.samenvattingWaardeBold}>{formateerPrijs(subtotaal)}</Text>
              </View>
              <View style={stijlen.samenvattingRij}>
                <Text style={stijlen.samenvattingLabel}>
                  {btwType === '21%' ? 'BTW 21%' : 'BTW verlegd'}
                </Text>
                <Text style={stijlen.samenvattingWaarde}>{formateerPrijs(btwBedrag)}</Text>
              </View>
              <View style={stijlen.divider} />
              <View style={stijlen.samenvattingRij}>
                <Text style={stijlen.samenvattingLabelBold}>TOTAAL incl. BTW</Text>
                <Text style={stijlen.samenvattingWaardeBold}>{formateerPrijs(totaal)}</Text>
              </View>

              {/* Winst */}
              <View style={stijlen.winstBalk}>
                <View style={{ flex: 1 }}>
                  <Text style={stijlen.winstLabel}>JOUW WINST</Text>
                  <Text style={stijlen.winstPercent}>{Math.round(winstPercent)}% van omzet</Text>
                </View>
                <Text style={stijlen.winstBedrag}>{formateerPrijs(winst)}</Text>
              </View>

              {winstPercent < 25 ? (
                <View style={stijlen.margeBadgeAmber}>
                  <MaterialCommunityIcons name="alert-circle" size={14} color={KLEUREN.warning} />
                  <Text style={stijlen.margeBadgeAmberTekst}>
                    Onder aanbevolen minimum (25%) — verhoog marge of uurtarief
                  </Text>
                </View>
              ) : (
                <View style={stijlen.margeBadgeGroen}>
                  <MaterialCommunityIcons name="check-circle" size={14} color={KLEUREN.success} />
                  <Text style={stijlen.margeBadgeGroenTekst}>Gezonde marge</Text>
                </View>
              )}
            </View>

            {/* Marktprijs indicatie */}
            {huidigInvoer.klusType && (() => {
              const m2 = huidigInvoer.afmetingen.lengte * huidigInvoer.afmetingen.breedte;
              if (m2 <= 0) return null;
              const prijsPerM2 = totaal / m2;
              const range = MARKTPRIJZEN[huidigInvoer.klusType];
              const status = bepaalMarktprijsStatus(prijsPerM2, range);
              const kleur = status === 'marktconform' ? KLEUREN.success : status === 'boven' ? KLEUREN.warning : '#2980B9';
              const label = status === 'marktconform' ? 'Marktconform' : status === 'boven' ? 'Boven markt' : 'Onder markt';
              return (
                <View style={[stijlen.marktKaart, { borderLeftColor: kleur }]}>
                  <View style={stijlen.marktHeader}>
                    <MaterialCommunityIcons name="trending-up" size={16} color={kleur} />
                    <Text style={stijlen.marktTitel}>Marktprijs indicatie</Text>
                    <View style={[stijlen.marktBadge, { backgroundColor: kleur + '20' }]}>
                      <Text style={[stijlen.marktBadgeTekst, { color: kleur }]}>{label}</Text>
                    </View>
                  </View>
                  <Text style={stijlen.marktTekst}>
                    Markt: €{range.min}–€{range.max}/m² · Jij: €{Math.round(prijsPerM2)}/m²
                  </Text>
                </View>
              );
            })()}

            {/* Knop naar klant offerte tab */}
            <Pressable style={stijlen.doorgaanKnop} onPress={() => setActieveTab('offerte')}>
              <Text style={stijlen.doorgaanKnopTekst}>Naar klant offerte →</Text>
            </Pressable>
          </>
        )}

        {/* ── TAB 2: KLANT OFFERTE ── */}
        {actieveTab === 'offerte' && (
          <>
            {/* Offerte nummer */}
            <View style={stijlen.nummerBalk}>
              <MaterialCommunityIcons name="file-document-outline" size={18} color={KLEUREN.primary} />
              <Text style={stijlen.nummerTekst}>{offerteNummer}</Text>
              <Text style={stijlen.nummerDatum}>
                {new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}
              </Text>
            </View>

            {/* Weergave keuze */}
            <View style={stijlen.sectie}>
              <View style={stijlen.sectieHeader}>
                <MaterialCommunityIcons name="eye-outline" size={20} color={KLEUREN.primary} />
                <Text style={stijlen.sectieKop}>Wat ziet de klant?</Text>
              </View>
              <View style={stijlen.weergaveOpties}>
                {(
                  [
                    { id: 'gespecificeerd', label: 'Gespecificeerd', hint: 'Materialen + arbeid apart' },
                    { id: 'materiaal_arbeid', label: 'Materiaal + arbeid', hint: 'Twee regels' },
                    { id: 'vaste_prijs', label: 'Vaste prijs', hint: 'Één totaalbedrag' },
                  ] as { id: OfferteWeergave; label: string; hint: string }[]
                ).map((opt) => (
                  <Pressable
                    key={opt.id}
                    style={[
                      stijlen.weergaveKnop,
                      weergaveType === opt.id && stijlen.weergaveKnopActief,
                    ]}
                    onPress={() => setWeergaveType(opt.id)}
                  >
                    <Text style={[stijlen.weergaveKnopTekst, weergaveType === opt.id && stijlen.weergaveKnopTekstActief]}>
                      {opt.label}
                    </Text>
                    <Text style={[stijlen.weergaveKnopHint, weergaveType === opt.id && { color: KLEUREN.primary + 'BB' }]}>
                      {opt.hint}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Klantgegevens */}
            <View style={stijlen.sectie}>
              <View style={stijlen.sectieHeaderRij}>
                <View style={stijlen.sectieHeaderLinks}>
                  <MaterialCommunityIcons name="account" size={20} color={KLEUREN.primary} />
                  <Text style={stijlen.sectieKop}>Klantgegevens</Text>
                </View>
                {klanten.length > 0 && (
                  <Pressable
                    style={stijlen.kiesKlantKnop}
                    onPress={() => setKlantKiezerZichtbaar(true)}
                  >
                    <MaterialCommunityIcons name="account-search" size={16} color={KLEUREN.primary} />
                    <Text style={stijlen.kiesKlantTekst}>Kies klant</Text>
                  </Pressable>
                )}
              </View>

              <Text style={stijlen.label}>Naam *</Text>
              <TextInput
                style={stijlen.input}
                value={klantNaam}
                onChangeText={setKlantNaam}
                placeholder="Jan Janssen"
                placeholderTextColor={KLEUREN.textSecondary}
              />
              <Text style={stijlen.label}>Adres</Text>
              <TextInput
                style={stijlen.input}
                value={klantAdres}
                onChangeText={setKlantAdres}
                placeholder="Hoofdstraat 1, Amsterdam"
                placeholderTextColor={KLEUREN.textSecondary}
              />
              <Text style={stijlen.label}>Telefoon</Text>
              <TextInput
                style={stijlen.input}
                value={klantTelefoon}
                onChangeText={setKlantTelefoon}
                placeholder="06-12345678"
                placeholderTextColor={KLEUREN.textSecondary}
                keyboardType="phone-pad"
              />
              <Text style={stijlen.label}>E-mail</Text>
              <TextInput
                style={stijlen.input}
                value={klantEmail}
                onChangeText={setKlantEmail}
                placeholder="klant@email.nl"
                placeholderTextColor={KLEUREN.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Werkbeschrijving */}
            <View style={stijlen.sectie}>
              <View style={stijlen.sectieHeader}>
                <MaterialCommunityIcons name="clipboard-text" size={20} color={KLEUREN.primary} />
                <Text style={stijlen.sectieKop}>Werkbeschrijving</Text>
              </View>
              <TextInput
                style={[stijlen.input, stijlen.inputMultiline]}
                value={werkbeschrijving}
                onChangeText={setWerkbeschrijving}
                placeholder="Beschrijf het werk..."
                placeholderTextColor={KLEUREN.textSecondary}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Offerte samenvatting (verkoopprijzen) */}
            <View style={stijlen.offerteSamenvatting}>
              <Text style={stijlen.offerteSamenvattingKop}>Wat de klant betaalt</Text>
              {weergaveType === 'gespecificeerd' && (
                <>
                  <View style={stijlen.totaalRij}>
                    <Text style={stijlen.totaalLabel}>Materialen</Text>
                    <Text style={stijlen.totaalWaarde}>{formateerPrijs(materiaalVerkoop)}</Text>
                  </View>
                  <View style={stijlen.totaalRij}>
                    <Text style={stijlen.totaalLabel}>
                      Arbeid ({gebufferdUren.toFixed(1)} uur × €{tarief}/u)
                      {isSpoed ? ' + spoed' : ''}
                    </Text>
                    <Text style={stijlen.totaalWaarde}>{formateerPrijs(arbeidskosten + spoedtoeslag)}</Text>
                  </View>
                </>
              )}
              {weergaveType === 'materiaal_arbeid' && (
                <>
                  <View style={stijlen.totaalRij}>
                    <Text style={stijlen.totaalLabel}>Materiaalkosten</Text>
                    <Text style={stijlen.totaalWaarde}>{formateerPrijs(materiaalVerkoop)}</Text>
                  </View>
                  <View style={stijlen.totaalRij}>
                    <Text style={stijlen.totaalLabel}>Arbeidskosten{isSpoed ? ' (incl. spoed)' : ''}</Text>
                    <Text style={stijlen.totaalWaarde}>{formateerPrijs(arbeidskosten + spoedtoeslag)}</Text>
                  </View>
                </>
              )}
              {weergaveType === 'vaste_prijs' && (
                <View style={stijlen.totaalRij}>
                  <Text style={stijlen.totaalLabel}>Totaalprijs (all-in)</Text>
                  <Text style={stijlen.totaalWaarde}>{formateerPrijs(subtotaal)}</Text>
                </View>
              )}
              <View style={stijlen.divider} />
              <View style={stijlen.totaalRij}>
                <Text style={stijlen.totaalLabelBold}>Subtotaal excl. BTW</Text>
                <Text style={stijlen.totaalWaardeBold}>{formateerPrijs(subtotaal)}</Text>
              </View>
              <View style={stijlen.totaalRij}>
                <Text style={stijlen.totaalLabel}>
                  {btwType === '21%' ? 'BTW 21%' : 'BTW verlegd'}
                </Text>
                <Text style={stijlen.totaalWaarde}>{formateerPrijs(btwBedrag)}</Text>
              </View>
              <View style={stijlen.divider} />
              <View style={stijlen.totaalEindRij}>
                <Text style={stijlen.totaalEindLabel}>TOTAAL incl. BTW</Text>
                <Text style={stijlen.totaalEindWaarde}>{formateerPrijs(totaal)}</Text>
              </View>

              {/* Betalingsvoorwaarden */}
              {profiel.betalingsvoorwaarden ? (
                <Text style={stijlen.betalingsVW}>{profiel.betalingsvoorwaarden}</Text>
              ) : null}
              <Text style={stijlen.algVWNota}>
                Op deze offerte zijn onze algemene voorwaarden van toepassing, zie bijlage.
              </Text>
            </View>
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Vaste knop onderaan */}
      <View style={stijlen.knopenBalk}>
        {actieveTab === 'berekening' ? (
          <Pressable style={stijlen.doorgaanKnopVast} onPress={() => setActieveTab('offerte')}>
            <MaterialCommunityIcons name="file-document-outline" size={22} color={KLEUREN.white} />
            <Text style={stijlen.doorgaanKnopVastTekst}>Naar klant offerte</Text>
          </Pressable>
        ) : (
          <Pressable style={stijlen.previewKnop} onPress={gaaNaarPreview}>
            <MaterialCommunityIcons name="eye" size={22} color={KLEUREN.white} />
            <Text style={stijlen.previewKnopTekst}>Offerte bekijken</Text>
          </Pressable>
        )}
      </View>

      {/* Klant kiezen modal */}
      <Modal
        visible={klantKiezerZichtbaar}
        animationType="slide"
        transparent
        onRequestClose={() => setKlantKiezerZichtbaar(false)}
      >
        <View style={stijlen.modalOverlay}>
          <View style={stijlen.modalContainer}>
            <View style={stijlen.modalHeader}>
              <Text style={stijlen.modalTitel}>Kies een klant</Text>
              <Pressable onPress={() => setKlantKiezerZichtbaar(false)}>
                <MaterialCommunityIcons name="close" size={24} color={KLEUREN.text} />
              </Pressable>
            </View>
            <FlatList
              data={klanten}
              keyExtractor={(k) => k.id}
              renderItem={({ item }) => (
                <Pressable style={stijlen.klantRij} onPress={() => kiesKlant(item)}>
                  <View style={stijlen.klantIconWrapper}>
                    <MaterialCommunityIcons name="account-circle" size={36} color={KLEUREN.textSecondary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={stijlen.klantNaamTekst}>{item.naam}</Text>
                    {item.adres ? (
                      <Text style={stijlen.klantDetailTekst} numberOfLines={1}>{item.adres}</Text>
                    ) : null}
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={20} color={KLEUREN.border} />
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const stijlen = StyleSheet.create({
  container: { flex: 1, backgroundColor: KLEUREN.background },
  scroll: { flex: 1 },
  inhoud: { padding: 16 },

  leegContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: KLEUREN.background,
  },
  leegTekst: { fontSize: 17, color: KLEUREN.textSecondary, marginTop: 16 },
  terugKnop: { marginTop: 20, backgroundColor: KLEUREN.primary, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24 },
  terugKnopTekst: { color: KLEUREN.white, fontWeight: 'bold', fontSize: 15 },

  // Tab balk
  tabBalk: {
    flexDirection: 'row',
    backgroundColor: KLEUREN.white,
    borderBottomWidth: 1,
    borderBottomColor: KLEUREN.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActief: { borderBottomColor: KLEUREN.primary },
  tabTekst: { fontSize: 14, fontWeight: '600', color: KLEUREN.textSecondary },
  tabTekstActief: { color: KLEUREN.primary },

  // Sectie kaart
  sectie: {
    backgroundColor: KLEUREN.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#1B2631',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  sectieHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 8 },
  sectieHeaderRij: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  sectieHeaderLinks: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectieKop: { fontSize: 15, fontWeight: '700', color: KLEUREN.text, flex: 1 },
  sectieKopInline: { fontSize: 15, fontWeight: '700', color: KLEUREN.text },

  // Materiaal rijen (berekening tab)
  materiaalRijBerekening: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: KLEUREN.border,
  },
  materiaalNaamBerekening: { flex: 1, fontSize: 13, color: KLEUREN.text },
  materiaalInkoop: { fontSize: 12, color: KLEUREN.textSecondary, fontFamily: 'SpaceMono' },
  materiaalVerkoop: { fontSize: 13, fontWeight: '700', color: KLEUREN.primary, fontFamily: 'SpaceMono' },
  meerItems: { fontSize: 12, color: KLEUREN.textSecondary, textAlign: 'center', marginTop: 6, fontStyle: 'italic' },

  // Marge instelling
  margeRij: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: KLEUREN.border,
    gap: 12,
  },
  margeLabel: { fontSize: 14, fontWeight: '600', color: KLEUREN.text },
  margeHint: { fontSize: 11, color: KLEUREN.textSecondary, marginTop: 2 },
  margeInvoerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: KLEUREN.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: KLEUREN.background,
    minWidth: 80,
  },
  margeInput: {
    fontSize: 18,
    fontWeight: '700',
    color: KLEUREN.text,
    minWidth: 40,
    textAlign: 'right',
    padding: 0,
    fontFamily: 'SpaceMono',
  },
  margeProcent: { fontSize: 14, color: KLEUREN.textSecondary, marginLeft: 2 },
  margeResultaatRij: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
    backgroundColor: '#E8F8F0',
    borderRadius: 10,
    padding: 10,
  },
  margeResultaatLabel: { fontSize: 12, color: KLEUREN.textSecondary },
  margeResultaatVerkoop: { fontSize: 14, fontWeight: '700', color: KLEUREN.primary, fontFamily: 'SpaceMono' },

  // Arbeid
  bufferHint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: '#E8F8F0',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  bufferHintTekst: { flex: 1, fontSize: 12, color: KLEUREN.textSecondary, lineHeight: 17 },
  arbeidGrid: { flexDirection: 'row' },
  arbeidLabel: { fontSize: 12, fontWeight: '600', color: KLEUREN.textSecondary, marginBottom: 6 },
  arbeidInvoerWrapper: {
    borderWidth: 1.5,
    borderColor: KLEUREN.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: KLEUREN.background,
  },
  arbeidInput: {
    fontSize: 18,
    fontWeight: '700',
    color: KLEUREN.text,
    padding: 0,
    fontFamily: 'SpaceMono',
  },

  // BTW
  btwKnoppen: { flexDirection: 'row', gap: 10 },
  btwKnop: {
    flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5,
    borderColor: KLEUREN.border, alignItems: 'center', backgroundColor: KLEUREN.background,
  },
  btwKnopActief: { borderColor: KLEUREN.primary, backgroundColor: KLEUREN.primary },
  btwKnopTekst: { fontSize: 14, fontWeight: '600', color: KLEUREN.textSecondary },
  btwKnopTekstActief: { color: KLEUREN.white },

  // Spoed
  spoedRij: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  spoedHint: { fontSize: 12, color: KLEUREN.textSecondary, marginTop: 2 },
  spoedWaarschuwing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF8E7',
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
  },
  spoedWaarschuwingTekst: { flex: 1, fontSize: 12, color: KLEUREN.warning, lineHeight: 17 },

  // Samenvatting kaart (berekening tab)
  samenvattingKaart: {
    backgroundColor: KLEUREN.secondary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  samenvattingKop: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  samenvattingRij: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  samenvattingLabel: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  samenvattingWaarde: { fontSize: 13, color: KLEUREN.white, fontFamily: 'SpaceMono' },
  samenvattingLabelBold: { fontSize: 14, fontWeight: '600', color: KLEUREN.white },
  samenvattingWaardeBold: { fontSize: 15, fontWeight: '700', color: KLEUREN.white, fontFamily: 'SpaceMono' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginVertical: 8 },

  winstBalk: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(46,204,113,0.15)',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  winstLabel: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.8)', letterSpacing: 0.5 },
  winstPercent: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  winstBedrag: {
    fontSize: 28,
    fontWeight: '900',
    color: KLEUREN.primary,
    fontFamily: 'SpaceMono',
  },
  margeBadgeAmber: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF8E7',
    borderRadius: 10,
    padding: 10,
  },
  margeBadgeAmberTekst: { flex: 1, fontSize: 12, color: KLEUREN.warning, lineHeight: 17 },
  margeBadgeGroen: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(46,204,113,0.15)',
    borderRadius: 10,
    padding: 10,
  },
  margeBadgeGroenTekst: { fontSize: 12, color: KLEUREN.primary, fontWeight: '600' },

  // Markt kaart
  marktKaart: {
    backgroundColor: KLEUREN.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#1B2631',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  marktHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  marktTitel: { fontSize: 13, fontWeight: '700', color: KLEUREN.text, flex: 1 },
  marktBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  marktBadgeTekst: { fontSize: 11, fontWeight: '700' },
  marktTekst: { fontSize: 12, color: KLEUREN.textSecondary },

  // Doorsturen knop (in scroll)
  doorgaanKnop: {
    backgroundColor: '#E8F8F0',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  doorgaanKnopTekst: { fontSize: 15, fontWeight: '700', color: KLEUREN.primary },

  // Offerte tab elementen
  nummerBalk: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: KLEUREN.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    gap: 8,
    shadowColor: '#1B2631',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  nummerTekst: { fontSize: 15, fontWeight: '700', color: KLEUREN.primary, flex: 1, fontFamily: 'SpaceMono' },
  nummerDatum: { fontSize: 12, color: KLEUREN.textSecondary },

  weergaveOpties: { gap: 8 },
  weergaveKnop: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: KLEUREN.border,
    backgroundColor: KLEUREN.background,
  },
  weergaveKnopActief: { borderColor: KLEUREN.primary, backgroundColor: '#E8F8F0' },
  weergaveKnopTekst: { fontSize: 14, fontWeight: '700', color: KLEUREN.textSecondary },
  weergaveKnopTekstActief: { color: KLEUREN.primary },
  weergaveKnopHint: { fontSize: 12, color: KLEUREN.textSecondary, marginTop: 2 },

  kiesKlantKnop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F8F0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  kiesKlantTekst: { fontSize: 13, fontWeight: '600', color: KLEUREN.primary },

  label: { fontSize: 12, fontWeight: '600', color: KLEUREN.textSecondary, marginBottom: 6, marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: KLEUREN.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: KLEUREN.text,
    backgroundColor: KLEUREN.background,
  },
  inputMultiline: { minHeight: 72, textAlignVertical: 'top' },
  tweeKolommen: { flexDirection: 'row', marginTop: 2 },

  // Offerte samenvatting kaart
  offerteSamenvatting: {
    backgroundColor: KLEUREN.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#1B2631',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  offerteSamenvattingKop: {
    fontSize: 11,
    fontWeight: '700',
    color: KLEUREN.textSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  totaalRij: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  totaalLabel: { fontSize: 13, color: KLEUREN.textSecondary, flex: 1, marginRight: 8 },
  totaalWaarde: { fontSize: 14, color: KLEUREN.text, fontFamily: 'SpaceMono' },
  totaalLabelBold: { fontSize: 14, fontWeight: '600', color: KLEUREN.text },
  totaalWaardeBold: { fontSize: 15, fontWeight: '700', color: KLEUREN.text, fontFamily: 'SpaceMono' },
  totaalEindRij: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  totaalEindLabel: { fontSize: 16, fontWeight: '700', color: KLEUREN.text },
  totaalEindWaarde: { fontSize: 22, fontWeight: 'bold', color: KLEUREN.primary, fontFamily: 'SpaceMono' },
  betalingsVW: { fontSize: 11, color: KLEUREN.textSecondary, marginTop: 12, lineHeight: 16, fontStyle: 'italic' },
  algVWNota: { fontSize: 11, color: KLEUREN.textSecondary, marginTop: 6, lineHeight: 16 },

  // Knoppen balk
  knopenBalk: {
    padding: 16, paddingBottom: 24, backgroundColor: KLEUREN.white,
    borderTopWidth: 1, borderTopColor: KLEUREN.border,
  },
  doorgaanKnopVast: {
    backgroundColor: KLEUREN.secondary,
    borderRadius: 16, paddingVertical: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
  },
  doorgaanKnopVastTekst: { fontSize: 17, fontWeight: 'bold', color: KLEUREN.white },
  previewKnop: {
    backgroundColor: KLEUREN.primary,
    borderRadius: 16, paddingVertical: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
  },
  previewKnopTekst: { fontSize: 17, fontWeight: 'bold', color: KLEUREN.white },

  // Klant modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: KLEUREN.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '70%' },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 20, borderBottomWidth: 1, borderBottomColor: KLEUREN.border,
  },
  modalTitel: { fontSize: 18, fontWeight: '700', color: KLEUREN.text },
  klantRij: {
    flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12,
    borderBottomWidth: 1, borderBottomColor: KLEUREN.border,
  },
  klantIconWrapper: { width: 40, alignItems: 'center' },
  klantNaamTekst: { fontSize: 15, fontWeight: '600', color: KLEUREN.text },
  klantDetailTekst: { fontSize: 12, color: KLEUREN.textSecondary, marginTop: 2 },
});
