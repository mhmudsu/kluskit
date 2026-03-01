import { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { KLEUREN } from '../../constants/kleuren';
import { useKlusStore } from '../../stores/klusStore';
import { useUserStore } from '../../stores/userStore';
import { formateerPrijs } from '../../utils/formatters';
import { KLUS_TYPES } from '../../constants/klusTypes';
import { MARKTPRIJZEN, bepaalMarktprijsStatus, MarktprijsStatus } from '../../constants/marktprijzen';
import { Offerte, OfferteBtwType } from '../../types';

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

  const [klantNaam, setKlantNaam] = useState('');
  const [klantAdres, setKlantAdres] = useState('');
  const [klantTelefoon, setKlantTelefoon] = useState('');
  const [klantEmail, setKlantEmail] = useState('');
  const [werkbeschrijving, setWerkbeschrijving] = useState(() =>
    genereerWerkbeschrijving(
      huidigInvoer.klusType,
      huidigInvoer.bijzonderheden,
      huidigInvoer.afmetingen
    )
  );
  const [arbeidsUren, setArbeidsUren] = useState(() =>
    String(materiaalResultaat?.geschatteArbeidstijd ?? 8)
  );
  const [uurtarief, setUurtarief] = useState(() => String(profiel.uurtarief));
  const [btwType, setBtwType] = useState<OfferteBtwType>('21%');

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

  const uren = parseFloat(arbeidsUren) || 0;
  const tarief = parseFloat(uurtarief) || 0;
  const arbeid = uren * tarief;
  const subtotaal = materiaalResultaat.totaalMateriaalkosten + arbeid;
  const btwBedrag = btwType === '21%' ? subtotaal * 0.21 : 0;
  const totaal = subtotaal + btwBedrag;

  const jaar = new Date().getFullYear();
  const offerteNummer = `KK-${jaar}-${String(aantalOffertes + 1).padStart(3, '0')}`;

  function gaaNaarPreview() {
    if (!klantNaam.trim()) {
      Alert.alert('Naam vereist', 'Vul de naam van de klant in.');
      return;
    }

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
      materialen: materiaalResultaat!.materialen,
      totaalMateriaalkosten: materiaalResultaat!.totaalMateriaalkosten,
      arbeidsUren: uren,
      uurtarief: tarief,
      btwType,
      arbeidskosten: arbeid,
      subtotaal,
      btwBedrag,
      totaalInclBtw: totaal,
      bedrijfsProfiel: profiel,
      status: 'concept',
    };

    setOfferteConcept(offerte);
    router.push('/klus/offerte-preview');
  }

  return (
    <View style={stijlen.container}>
      <ScrollView contentContainerStyle={stijlen.inhoud} keyboardShouldPersistTaps="handled">
        {/* Offerte nummer balk */}
        <View style={stijlen.nummerBalk}>
          <MaterialCommunityIcons name="file-document-outline" size={18} color={KLEUREN.primary} />
          <Text style={stijlen.nummerTekst}>{offerteNummer}</Text>
          <Text style={stijlen.nummerDatum}>
            {new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}
          </Text>
        </View>

        {/* Klantgegevens */}
        <View style={stijlen.sectie}>
          <View style={stijlen.sectieHeader}>
            <MaterialCommunityIcons name="account" size={20} color={KLEUREN.primary} />
            <Text style={stijlen.sectieKop}>Klantgegevens</Text>
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

        {/* Materiaalkosten samenvatting */}
        <View style={stijlen.sectie}>
          <View style={stijlen.sectieHeader}>
            <MaterialCommunityIcons name="package-variant" size={20} color={KLEUREN.primary} />
            <Text style={stijlen.sectieKop}>Materiaalkosten</Text>
            <Text style={stijlen.sectieKopWaarde}>
              {formateerPrijs(materiaalResultaat.totaalMateriaalkosten)}
            </Text>
          </View>
          {materiaalResultaat.materialen.slice(0, 4).map((m, i) => (
            <View key={i} style={stijlen.materiaalRij}>
              <Text style={stijlen.materiaalNaam} numberOfLines={1}>
                {m.naam}
              </Text>
              <Text style={stijlen.materiaalPrijs}>{formateerPrijs(m.totaalPrijs)}</Text>
            </View>
          ))}
          {materiaalResultaat.materialen.length > 4 && (
            <Text style={stijlen.meerdereItems}>
              + {materiaalResultaat.materialen.length - 4} meer materialen
            </Text>
          )}
        </View>

        {/* Arbeidskosten */}
        <View style={stijlen.sectie}>
          <View style={stijlen.sectieHeader}>
            <MaterialCommunityIcons name="account-hard-hat" size={20} color={KLEUREN.primary} />
            <Text style={stijlen.sectieKop}>Arbeidskosten</Text>
          </View>
          <View style={stijlen.tweeKolommen}>
            <View style={{ flex: 1 }}>
              <Text style={stijlen.label}>Uren</Text>
              <TextInput
                style={stijlen.input}
                value={arbeidsUren}
                onChangeText={setArbeidsUren}
                keyboardType="decimal-pad"
                selectTextOnFocus
              />
            </View>
            <View style={{ width: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={stijlen.label}>Uurtarief (€)</Text>
              <TextInput
                style={stijlen.input}
                value={uurtarief}
                onChangeText={setUurtarief}
                keyboardType="decimal-pad"
                selectTextOnFocus
              />
            </View>
          </View>
          <View style={stijlen.arbeidTotaalRij}>
            <Text style={stijlen.arbeidTotaalLabel}>
              {uren} uur × {formateerPrijs(tarief)}/uur
            </Text>
            <Text style={stijlen.arbeidTotaalWaarde}>{formateerPrijs(arbeid)}</Text>
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
              <Text
                style={[stijlen.btwKnopTekst, btwType === '21%' && stijlen.btwKnopTekstActief]}
              >
                21% BTW
              </Text>
            </Pressable>
            <Pressable
              style={[stijlen.btwKnop, btwType === 'verlegd' && stijlen.btwKnopActief]}
              onPress={() => setBtwType('verlegd')}
            >
              <Text
                style={[
                  stijlen.btwKnopTekst,
                  btwType === 'verlegd' && stijlen.btwKnopTekstActief,
                ]}
              >
                BTW verlegd
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Live totaal berekening */}
        <View style={stijlen.totaalKaart}>
          <View style={stijlen.totaalRij}>
            <Text style={stijlen.totaalLabel}>Materiaalkosten</Text>
            <Text style={stijlen.totaalWaarde}>
              {formateerPrijs(materiaalResultaat.totaalMateriaalkosten)}
            </Text>
          </View>
          <View style={stijlen.totaalRij}>
            <Text style={stijlen.totaalLabel}>Arbeidskosten</Text>
            <Text style={stijlen.totaalWaarde}>{formateerPrijs(arbeid)}</Text>
          </View>
          <View style={stijlen.totaalDivider} />
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
          <View style={stijlen.totaalDivider} />
          <View style={stijlen.totaalEindRij}>
            <Text style={stijlen.totaalEindLabel}>TOTAAL incl. BTW</Text>
            <Text style={stijlen.totaalEindWaarde}>{formateerPrijs(totaal)}</Text>
          </View>
        </View>

        {/* Marktprijs indicatie */}
        {huidigInvoer.klusType && (() => {
          const m2 = huidigInvoer.afmetingen.lengte * huidigInvoer.afmetingen.breedte;
          if (m2 <= 0) return null;
          const prijsPerM2 = totaal / m2;
          const range = MARKTPRIJZEN[huidigInvoer.klusType];
          const status: MarktprijsStatus = bepaalMarktprijsStatus(prijsPerM2, range);

          const statusKleur =
            status === 'marktconform' ? KLEUREN.success :
            status === 'boven'        ? KLEUREN.warning :
            '#2980B9';  // blauw = onder markt

          const statusLabel =
            status === 'marktconform' ? 'Marktconform' :
            status === 'boven'        ? 'Boven markt' :
            'Onder markt';

          const statusIcoon =
            status === 'marktconform' ? 'check-circle' :
            status === 'boven'        ? 'alert-circle' :
            'information';

          const statusToelichting =
            status === 'marktconform'
              ? 'Je prijs past goed binnen het gangbare tarief.'
              : status === 'boven'
              ? 'Je prijs ligt boven het gebruikelijke markttarief.'
              : 'Je prijs ligt onder het marktgemiddelde — mogelijk minder winstgevend.';

          return (
            <View style={[stijlen.marktKaart, { borderLeftColor: statusKleur }]}>
              <View style={stijlen.marktHeader}>
                <MaterialCommunityIcons name="trending-up" size={18} color={statusKleur} />
                <Text style={stijlen.marktTitel}>Marktprijs indicatie</Text>
                <View style={[stijlen.marktBadge, { backgroundColor: statusKleur + '20' }]}>
                  <MaterialCommunityIcons name={statusIcoon as any} size={12} color={statusKleur} />
                  <Text style={[stijlen.marktBadgeTekst, { color: statusKleur }]}>{statusLabel}</Text>
                </View>
              </View>

              <View style={stijlen.marktRijen}>
                <View style={stijlen.marktRij}>
                  <Text style={stijlen.marktLabel}>Marktgemiddelde</Text>
                  <Text style={stijlen.marktWaarde}>
                    €{range.min}–€{range.max}/m²
                  </Text>
                </View>
                <View style={stijlen.marktRij}>
                  <Text style={stijlen.marktLabel}>Jouw prijs</Text>
                  <Text style={[stijlen.marktWaardeBold, { color: statusKleur }]}>
                    €{Math.round(prijsPerM2)}/m²
                  </Text>
                </View>
              </View>

              <Text style={stijlen.marktToelichting}>{statusToelichting}</Text>
            </View>
          );
        })()}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Vaste knop onderaan */}
      <View style={stijlen.knopenBalk}>
        <Pressable style={stijlen.previewKnop} onPress={gaaNaarPreview}>
          <MaterialCommunityIcons name="eye" size={24} color={KLEUREN.white} />
          <Text style={stijlen.previewKnopTekst}>Offerte bekijken</Text>
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
  nummerBalk: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: KLEUREN.white,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: KLEUREN.border,
    gap: 8,
  },
  nummerTekst: {
    fontSize: 15,
    fontWeight: '700',
    color: KLEUREN.primary,
    flex: 1,
    fontFamily: 'SpaceMono',
  },
  nummerDatum: { fontSize: 12, color: KLEUREN.textSecondary },
  sectie: {
    backgroundColor: KLEUREN.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: KLEUREN.border,
  },
  sectieHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 8,
  },
  sectieKop: {
    fontSize: 15,
    fontWeight: '700',
    color: KLEUREN.text,
    flex: 1,
  },
  sectieKopWaarde: {
    fontSize: 15,
    fontWeight: '700',
    color: KLEUREN.primary,
    fontFamily: 'SpaceMono',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: KLEUREN.textSecondary,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: KLEUREN.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: KLEUREN.text,
    backgroundColor: KLEUREN.background,
  },
  inputMultiline: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  tweeKolommen: { flexDirection: 'row', marginTop: 2 },
  arbeidTotaalRij: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: KLEUREN.border,
  },
  arbeidTotaalLabel: { fontSize: 13, color: KLEUREN.textSecondary },
  arbeidTotaalWaarde: {
    fontSize: 15,
    fontWeight: '700',
    color: KLEUREN.text,
    fontFamily: 'SpaceMono',
  },
  materiaalRij: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    borderTopWidth: 1,
    borderTopColor: KLEUREN.border,
  },
  materiaalNaam: { fontSize: 13, color: KLEUREN.text, flex: 1, marginRight: 8 },
  materiaalPrijs: {
    fontSize: 13,
    color: KLEUREN.textSecondary,
    fontFamily: 'SpaceMono',
  },
  meerdereItems: {
    fontSize: 12,
    color: KLEUREN.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    fontStyle: 'italic',
  },
  btwKnoppen: { flexDirection: 'row', gap: 10 },
  btwKnop: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: KLEUREN.border,
    alignItems: 'center',
    backgroundColor: KLEUREN.background,
  },
  btwKnopActief: { borderColor: KLEUREN.primary, backgroundColor: KLEUREN.primary },
  btwKnopTekst: { fontSize: 14, fontWeight: '600', color: KLEUREN.textSecondary },
  btwKnopTekstActief: { color: KLEUREN.white },
  totaalKaart: {
    backgroundColor: KLEUREN.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: KLEUREN.border,
  },
  totaalRij: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  totaalLabel: { fontSize: 13, color: KLEUREN.textSecondary },
  totaalWaarde: { fontSize: 14, color: KLEUREN.text, fontFamily: 'SpaceMono' },
  totaalLabelBold: { fontSize: 14, fontWeight: '600', color: KLEUREN.text },
  totaalWaardeBold: {
    fontSize: 15,
    fontWeight: '700',
    color: KLEUREN.text,
    fontFamily: 'SpaceMono',
  },
  totaalDivider: { height: 1, backgroundColor: KLEUREN.border, marginVertical: 6 },
  totaalEindRij: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  totaalEindLabel: { fontSize: 16, fontWeight: '700', color: KLEUREN.text },
  totaalEindWaarde: {
    fontSize: 22,
    fontWeight: 'bold',
    color: KLEUREN.primary,
    fontFamily: 'SpaceMono',
  },
  marktKaart: {
    backgroundColor: KLEUREN.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: KLEUREN.border,
    borderLeftWidth: 4,
  },
  marktHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  marktTitel: {
    fontSize: 14,
    fontWeight: '700',
    color: KLEUREN.text,
    flex: 1,
  },
  marktBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  marktBadgeTekst: {
    fontSize: 11,
    fontWeight: '700',
  },
  marktRijen: {
    gap: 6,
    marginBottom: 10,
  },
  marktRij: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  marktLabel: {
    fontSize: 13,
    color: KLEUREN.textSecondary,
  },
  marktWaarde: {
    fontSize: 13,
    color: KLEUREN.text,
    fontFamily: 'SpaceMono',
  },
  marktWaardeBold: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'SpaceMono',
  },
  marktToelichting: {
    fontSize: 12,
    color: KLEUREN.textSecondary,
    lineHeight: 17,
    fontStyle: 'italic',
  },
  knopenBalk: {
    padding: 16,
    paddingBottom: 24,
    backgroundColor: KLEUREN.white,
    borderTopWidth: 1,
    borderTopColor: KLEUREN.border,
  },
  previewKnop: {
    backgroundColor: KLEUREN.primary,
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  previewKnopTekst: { fontSize: 18, fontWeight: 'bold', color: KLEUREN.white },
});
