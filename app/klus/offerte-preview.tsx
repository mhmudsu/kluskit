import { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { KLEUREN } from '../../constants/kleuren';
import { useKlusStore } from '../../stores/klusStore';
import { formateerPrijs } from '../../utils/formatters';
import { Offerte } from '../../types';
import { deelOffertePdf, genereerOffertePdf, controleDeelbaar } from '../../services/offerte';

function formateerDatum(date: Date): string {
  return new Date(date).toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function OffertePreviewScherm() {
  const { offerteConcept, slaOfferteOp } = useKlusStore();
  const [isLadenPdf, setIsLadenPdf] = useState(false);

  if (!offerteConcept) {
    return (
      <View style={stijlen.leegContainer}>
        <MaterialCommunityIcons name="alert-circle-outline" size={64} color={KLEUREN.border} />
        <Text style={stijlen.leegTekst}>Geen offerte beschikbaar</Text>
        <Pressable style={stijlen.terugKnop} onPress={() => router.back()}>
          <Text style={stijlen.terugKnopTekst}>Terug</Text>
        </Pressable>
      </View>
    );
  }

  const o = offerteConcept;
  const deelFout = controleDeelbaar(o);

  async function deelAlsPdf() {
    if (deelFout) {
      Alert.alert('Kan niet delen', deelFout);
      return;
    }
    setIsLadenPdf(true);
    try {
      await deelOffertePdf(o);
    } catch (err) {
      const bericht = err instanceof Error ? err.message : 'Onbekende fout';
      Alert.alert('PDF fout', bericht);
    } finally {
      setIsLadenPdf(false);
    }
  }

  async function downloadPdf() {
    setIsLadenPdf(true);
    try {
      const pdfUri = await genereerOffertePdf(o);
      Alert.alert(
        'PDF opgeslagen',
        `Offerte ${o.offerteNummer} is opgeslagen als PDF.`,
        [{ text: 'OK' }]
      );
      return pdfUri;
    } catch (err) {
      const bericht = err instanceof Error ? err.message : 'Onbekende fout';
      Alert.alert('PDF fout', bericht);
    } finally {
      setIsLadenPdf(false);
    }
  }

  function slaOp() {
    slaOfferteOp({ ...o, status: 'concept' });
    Alert.alert(
      'Offerte opgeslagen',
      `${o.offerteNummer} is opgeslagen in je offertes.`,
      [
        {
          text: 'OK',
          onPress: () => router.push('/(tabs)/offerte'),
        },
      ]
    );
  }

  return (
    <View style={stijlen.container}>
      <ScrollView contentContainerStyle={stijlen.inhoud}>
        {/* Document kaart */}
        <View style={stijlen.document}>
          {/* Header: bedrijfsgegevens */}
          <View style={stijlen.documentHeader}>
            <View style={stijlen.bedrijfsLogo}>
              <Text style={stijlen.bedrijfsLogoTekst}>
                {(o.bedrijfsProfiel.bedrijfsnaam || o.bedrijfsProfiel.naam || 'KK')
                  .split(' ')
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((w: string) => w[0].toUpperCase())
                  .join('')}
              </Text>
            </View>
            <View style={stijlen.bedrijfsInfo}>
              <Text style={stijlen.bedrijfsNaam}>
                {o.bedrijfsProfiel.bedrijfsnaam || o.bedrijfsProfiel.naam || 'Mijn Bedrijf'}
              </Text>
              {o.bedrijfsProfiel.naam && o.bedrijfsProfiel.bedrijfsnaam ? (
                <Text style={stijlen.bedrijfsDetail}>{o.bedrijfsProfiel.naam}</Text>
              ) : null}
              {o.bedrijfsProfiel.telefoon ? (
                <Text style={stijlen.bedrijfsDetail}>{o.bedrijfsProfiel.telefoon}</Text>
              ) : null}
              {o.bedrijfsProfiel.kvkNummer ? (
                <Text style={stijlen.bedrijfsDetail}>KvK: {o.bedrijfsProfiel.kvkNummer}</Text>
              ) : null}
              {o.bedrijfsProfiel.btwNummer ? (
                <Text style={stijlen.bedrijfsDetail}>BTW: {o.bedrijfsProfiel.btwNummer}</Text>
              ) : null}
            </View>
          </View>

          {/* Oranje accent streep */}
          <View style={stijlen.accentStreep} />

          <View style={stijlen.documentDivider} />

          {/* Offerte nummer + datum */}
          <View style={stijlen.offerteMeta}>
            <View>
              <Text style={stijlen.offerteNummerLabel}>OFFERTE</Text>
              <Text style={stijlen.offerteNummer}>{o.offerteNummer}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={stijlen.offerteDatumLabel}>Datum</Text>
              <Text style={stijlen.offerteDatum}>{formateerDatum(o.datum)}</Text>
              <Text style={stijlen.offerteDatumLabel}>Geldig tot</Text>
              <Text style={stijlen.offerteDatum}>{formateerDatum(o.geldigTot)}</Text>
            </View>
          </View>

          <View style={stijlen.documentDivider} />

          {/* Klantgegevens */}
          <View style={stijlen.sectieBlok}>
            <Text style={stijlen.sectieBlokLabel}>VOOR</Text>
            <Text style={stijlen.klantNaam}>{o.klantNaam}</Text>
            {o.klantAdres ? <Text style={stijlen.klantDetail}>{o.klantAdres}</Text> : null}
            {o.klantTelefoon ? <Text style={stijlen.klantDetail}>{o.klantTelefoon}</Text> : null}
            {o.klantEmail ? <Text style={stijlen.klantDetail}>{o.klantEmail}</Text> : null}
          </View>

          <View style={stijlen.documentDivider} />

          {/* Werkbeschrijving */}
          <View style={stijlen.sectieBlok}>
            <Text style={stijlen.sectieBlokLabel}>WERKBESCHRIJVING</Text>
            <Text style={stijlen.werkbeschrijvingTekst}>{o.werkbeschrijving}</Text>
          </View>

          <View style={stijlen.documentDivider} />

          {/* Materialen tabel */}
          <View style={stijlen.sectieBlok}>
            <Text style={stijlen.sectieBlokLabel}>SPECIFICATIE</Text>

            <View style={stijlen.tabelHeader}>
              <Text style={[stijlen.tabelHeaderTekst, { flex: 3 }]}>Omschrijving</Text>
              <Text style={[stijlen.tabelHeaderTekst, { flex: 1, textAlign: 'right' }]}>Aantal</Text>
              <Text style={[stijlen.tabelHeaderTekst, { flex: 1.5, textAlign: 'right' }]}>Totaal</Text>
            </View>

            {o.materialen.map((m, i) => (
              <View key={i} style={[stijlen.tabelRij, i % 2 === 0 && stijlen.tabelRijEven]}>
                <View style={{ flex: 3 }}>
                  <Text style={stijlen.tabelNaam}>{m.naam}</Text>
                  <Text style={stijlen.tabelSpec} numberOfLines={1}>{m.specificatie}</Text>
                </View>
                <Text style={[stijlen.tabelWaarde, { flex: 1, textAlign: 'right' }]}>
                  {m.hoeveelheid} {m.eenheid}
                </Text>
                <Text style={[stijlen.tabelWaarde, { flex: 1.5, textAlign: 'right' }]}>
                  {formateerPrijs(m.totaalPrijs)}
                </Text>
              </View>
            ))}

            <View style={[stijlen.tabelRij, stijlen.tabelRijArbeid]}>
              <View style={{ flex: 3 }}>
                <Text style={stijlen.tabelNaam}>Arbeidskosten</Text>
                <Text style={stijlen.tabelSpec}>
                  {o.arbeidsUren} uur × €{o.uurtarief}/uur
                </Text>
              </View>
              <Text style={[stijlen.tabelWaarde, { flex: 1, textAlign: 'right' }]}>
                {o.arbeidsUren} uur
              </Text>
              <Text style={[stijlen.tabelWaarde, { flex: 1.5, textAlign: 'right' }]}>
                {formateerPrijs(o.arbeidskosten)}
              </Text>
            </View>
          </View>

          <View style={stijlen.documentDivider} />

          {/* Kosten samenvatting */}
          <View style={stijlen.kostenBlok}>
            <View style={stijlen.kostenRij}>
              <Text style={stijlen.kostenLabel}>Materiaalkosten</Text>
              <Text style={stijlen.kostenWaarde}>{formateerPrijs(o.totaalMateriaalkosten)}</Text>
            </View>
            <View style={stijlen.kostenRij}>
              <Text style={stijlen.kostenLabel}>Arbeidskosten</Text>
              <Text style={stijlen.kostenWaarde}>{formateerPrijs(o.arbeidskosten)}</Text>
            </View>
            <View style={stijlen.kostenDividerDun} />
            <View style={stijlen.kostenRij}>
              <Text style={stijlen.kostenLabelBold}>Subtotaal excl. BTW</Text>
              <Text style={stijlen.kostenWaardeBold}>{formateerPrijs(o.subtotaal)}</Text>
            </View>
            <View style={stijlen.kostenRij}>
              <Text style={stijlen.kostenLabel}>
                {o.btwType === '21%' ? 'BTW 21%' : 'BTW verlegd'}
              </Text>
              <Text style={stijlen.kostenWaarde}>{formateerPrijs(o.btwBedrag)}</Text>
            </View>
            <View style={stijlen.kostenDividerDik} />
            <View style={stijlen.totaalEindRij}>
              <Text style={stijlen.totaalEindLabel}>TOTAAL incl. BTW</Text>
              <Text style={stijlen.totaalEindWaarde}>{formateerPrijs(o.totaalInclBtw)}</Text>
            </View>
          </View>

          <View style={stijlen.documentDivider} />

          {/* Voorwaarden */}
          <View style={stijlen.sectieBlok}>
            <Text style={stijlen.sectieBlokLabel}>VOORWAARDEN</Text>

            {/* Betalingsvoorwaarden uit profiel */}
            {o.bedrijfsProfiel.betalingsvoorwaarden ? (
              <View style={stijlen.voorwaardeRij}>
                <Text style={stijlen.voorwaardeBullet}>•</Text>
                <Text style={stijlen.voorwaardeTekst}>
                  {o.bedrijfsProfiel.betalingsvoorwaarden}
                </Text>
              </View>
            ) : null}

            {/* Standaard condities */}
            {[
              '50% aanbetaling bij opdrachtverstrekking',
              'Restant betaling bij oplevering',
              'Meerwerk alleen na schriftelijke toestemming',
              `Offerte geldig tot ${formateerDatum(o.geldigTot)}`,
              'Prijzen zijn onder voorbehoud van prijswijzigingen',
            ].map((v, i) => (
              <View key={i} style={stijlen.voorwaardeRij}>
                <Text style={stijlen.voorwaardeBullet}>•</Text>
                <Text style={stijlen.voorwaardeTekst}>{v}</Text>
              </View>
            ))}

            {/* Verwijzing naar algemene voorwaarden bijlage */}
            {o.bedrijfsProfiel.algVoorwaarden ? (
              <View style={[stijlen.voorwaardeRij, stijlen.algVwRij]}>
                <MaterialCommunityIcons name="file-document-outline" size={13} color={KLEUREN.primary} />
                <Text style={[stijlen.voorwaardeTekst, stijlen.algVwTekst]}>
                  Op deze offerte zijn onze algemene voorwaarden van toepassing, zie bijlage.
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={{ height: 140 }} />
      </ScrollView>

      {/* Actie knoppen */}
      <View style={stijlen.actiesBalk}>
        {/* Blokkade melding als geen voorwaarden */}
        {deelFout ? (
          <View style={stijlen.blokkadeBalk}>
            <MaterialCommunityIcons name="lock" size={16} color={KLEUREN.error} />
            <Text style={stijlen.blokkadeTekst}>
              Voeg je{' '}
              <Text style={{ fontWeight: '700' }}>algemene voorwaarden</Text>
              {' '}toe in Profiel om de offerte als PDF te delen.
            </Text>
          </View>
        ) : null}

        {/* PDF knoppen rij */}
        <View style={stijlen.pdfRij}>
          <Pressable
            style={[
              stijlen.pdfKnop,
              stijlen.pdfKnopPrimair,
              deelFout ? stijlen.pdfKnopGeblokkeerd : null,
            ]}
            onPress={deelAlsPdf}
            disabled={isLadenPdf}
          >
            {isLadenPdf ? (
              <ActivityIndicator size="small" color={KLEUREN.white} />
            ) : (
              <MaterialCommunityIcons
                name={deelFout ? 'lock' : 'share-variant'}
                size={20}
                color={KLEUREN.white}
              />
            )}
            <Text style={stijlen.pdfKnopTekstPrimair}>
              {isLadenPdf ? 'PDF maken...' : 'Deel als PDF'}
            </Text>
          </Pressable>

          <Pressable
            style={[stijlen.pdfKnop, stijlen.pdfKnopSecundair]}
            onPress={downloadPdf}
            disabled={isLadenPdf}
          >
            <MaterialCommunityIcons name="download" size={20} color={KLEUREN.primary} />
            <Text style={stijlen.pdfKnopTekstSecundair}>Download PDF</Text>
          </Pressable>
        </View>

        {/* Opslaan knop */}
        <Pressable style={stijlen.opslaanKnop} onPress={slaOp}>
          <MaterialCommunityIcons name="content-save" size={22} color={KLEUREN.white} />
          <Text style={stijlen.opslaanKnopTekst}>Offerte opslaan</Text>
        </Pressable>
      </View>
    </View>
  );
}

const stijlen = StyleSheet.create({
  container: { flex: 1, backgroundColor: KLEUREN.background },
  inhoud: { padding: 16 },
  leegContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: KLEUREN.background,
  },
  leegTekst: { fontSize: 17, color: KLEUREN.textSecondary, marginTop: 16 },
  terugKnop: {
    marginTop: 20,
    backgroundColor: KLEUREN.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  terugKnopTekst: { color: KLEUREN.white, fontWeight: 'bold', fontSize: 15 },

  // Document
  document: {
    backgroundColor: KLEUREN.white,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D0D0D0',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    overflow: 'hidden',
  },
  documentDivider: { height: 1, backgroundColor: '#E8E8E8' },
  accentStreep: { height: 4, backgroundColor: KLEUREN.primary },

  // Header
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 20,
    backgroundColor: KLEUREN.secondary,
    gap: 14,
  },
  bedrijfsLogo: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: KLEUREN.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bedrijfsLogoTekst: {
    fontSize: 18,
    fontWeight: '900',
    color: KLEUREN.white,
    letterSpacing: -1,
  },
  bedrijfsInfo: { flex: 1 },
  bedrijfsNaam: {
    fontSize: 17,
    fontWeight: 'bold',
    color: KLEUREN.white,
    marginBottom: 2,
  },
  bedrijfsDetail: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 1 },

  // Offerte meta
  offerteMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 18,
    backgroundColor: KLEUREN.white,
  },
  offerteNummerLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: KLEUREN.textSecondary,
    letterSpacing: 1,
  },
  offerteNummer: {
    fontSize: 22,
    fontWeight: 'bold',
    color: KLEUREN.primary,
    fontFamily: 'SpaceMono',
    marginTop: 2,
  },
  offerteDatumLabel: {
    fontSize: 10,
    color: KLEUREN.textSecondary,
    letterSpacing: 0.5,
    marginTop: 4,
  },
  offerteDatum: { fontSize: 13, fontWeight: '600', color: KLEUREN.text, textAlign: 'right' },

  // Secties
  sectieBlok: { padding: 18 },
  sectieBlokLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: KLEUREN.textSecondary,
    letterSpacing: 1.2,
    marginBottom: 8,
  },

  // Klant
  klantNaam: { fontSize: 16, fontWeight: '700', color: KLEUREN.text, marginBottom: 2 },
  klantDetail: { fontSize: 13, color: KLEUREN.textSecondary, marginTop: 2 },

  // Werkbeschrijving
  werkbeschrijvingTekst: { fontSize: 14, color: KLEUREN.text, lineHeight: 20 },

  // Tabel
  tabelHeader: {
    flexDirection: 'row',
    paddingBottom: 6,
    marginBottom: 4,
    borderBottomWidth: 1.5,
    borderBottomColor: KLEUREN.secondary,
  },
  tabelHeaderTekst: {
    fontSize: 10,
    fontWeight: '700',
    color: KLEUREN.textSecondary,
    letterSpacing: 0.5,
  },
  tabelRij: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: KLEUREN.border,
  },
  tabelRijEven: { backgroundColor: '#FAFAFA' },
  tabelRijArbeid: {
    backgroundColor: '#FFF8F0',
    borderBottomWidth: 0,
    borderRadius: 4,
    paddingHorizontal: 4,
    marginTop: 4,
  },
  tabelNaam: { fontSize: 13, fontWeight: '600', color: KLEUREN.text },
  tabelSpec: { fontSize: 11, color: KLEUREN.textSecondary, marginTop: 1 },
  tabelWaarde: { fontSize: 13, color: KLEUREN.text, fontFamily: 'SpaceMono' },

  // Kosten samenvatting
  kostenBlok: { padding: 18, paddingTop: 14 },
  kostenRij: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  kostenLabel: { fontSize: 13, color: KLEUREN.textSecondary },
  kostenWaarde: { fontSize: 13, color: KLEUREN.text, fontFamily: 'SpaceMono' },
  kostenLabelBold: { fontSize: 14, fontWeight: '600', color: KLEUREN.text },
  kostenWaardeBold: { fontSize: 14, fontWeight: '700', color: KLEUREN.text, fontFamily: 'SpaceMono' },
  kostenDividerDun: { height: 1, backgroundColor: KLEUREN.border, marginVertical: 6 },
  kostenDividerDik: { height: 2, backgroundColor: KLEUREN.secondary, marginVertical: 8 },
  totaalEindRij: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#FFF5EE',
    borderRadius: 8,
  },
  totaalEindLabel: { fontSize: 16, fontWeight: '700', color: KLEUREN.text },
  totaalEindWaarde: {
    fontSize: 24,
    fontWeight: 'bold',
    color: KLEUREN.primary,
    fontFamily: 'SpaceMono',
  },

  // Voorwaarden
  voorwaardeRij: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 5, gap: 6 },
  voorwaardeBullet: { fontSize: 13, color: KLEUREN.primary, lineHeight: 19 },
  voorwaardeTekst: { fontSize: 12, color: KLEUREN.textSecondary, flex: 1, lineHeight: 19 },
  algVwRij: { marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: KLEUREN.border },
  algVwTekst: { color: KLEUREN.text, fontStyle: 'italic' },

  // Actie balk
  actiesBalk: {
    backgroundColor: KLEUREN.white,
    borderTopWidth: 1,
    borderTopColor: KLEUREN.border,
    padding: 16,
    paddingBottom: 24,
    gap: 10,
  },
  pdfRij: { flexDirection: 'row', gap: 10 },
  pdfKnop: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 12,
  },
  pdfKnopPrimair: {
    backgroundColor: KLEUREN.primary,
  },
  pdfKnopSecundair: {
    borderWidth: 1.5,
    borderColor: KLEUREN.primary,
    backgroundColor: KLEUREN.background,
  },
  pdfKnopTekstPrimair: {
    fontSize: 14,
    fontWeight: '700',
    color: KLEUREN.white,
  },
  pdfKnopGeblokkeerd: {
    backgroundColor: KLEUREN.textSecondary,
  },
  pdfKnopTekstSecundair: {
    fontSize: 14,
    fontWeight: '600',
    color: KLEUREN.primary,
  },
  blokkadeBalk: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FFEBEE',
    borderRadius: 10,
    padding: 12,
    marginBottom: 4,
    borderLeftWidth: 3,
    borderLeftColor: KLEUREN.error,
  },
  blokkadeTekst: {
    flex: 1,
    fontSize: 12,
    color: KLEUREN.error,
    lineHeight: 17,
  },
  opslaanKnop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: KLEUREN.secondary,
  },
  opslaanKnopTekst: { fontSize: 16, fontWeight: 'bold', color: KLEUREN.white },
});
