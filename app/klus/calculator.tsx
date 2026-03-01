import { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { KLEUREN } from '../../constants/kleuren';
import { KLUS_TYPES } from '../../constants/klusTypes';
import { KLUS_PRIJZEN, berekenKlus } from '../../constants/calculator';
import { useKlusStore } from '../../stores/klusStore';
import { formateerPrijs } from '../../utils/formatters';
import { KlusType, Kwaliteit } from '../../types';

const KWALITEIT_OPTIES: { id: Kwaliteit; label: string }[] = [
  { id: 'budget',    label: 'Budget' },
  { id: 'standaard', label: 'Standaard' },
  { id: 'premium',   label: 'Premium' },
];

function MargeBalk({ percent }: { percent: number }) {
  const kleur =
    percent >= 50 ? KLEUREN.success :
    percent >= 35 ? KLEUREN.warning :
    KLEUREN.error;

  const label =
    percent >= 50 ? 'Goede marge' :
    percent >= 35 ? 'Redelijke marge' :
    'Lage marge';

  return (
    <View style={margeStijlen.container}>
      <View style={margeStijlen.header}>
        <Text style={margeStijlen.label}>Arbeidsaandeel</Text>
        <Text style={[margeStijlen.waarde, { color: kleur }]}>
          {Math.round(percent)}% — {label}
        </Text>
      </View>
      <View style={margeStijlen.balk}>
        <View style={[margeStijlen.vulling, { width: `${Math.min(percent, 100)}%` as any, backgroundColor: kleur }]} />
      </View>
      <Text style={margeStijlen.toelichting}>
        Deel van de omzet (excl. BTW) dat je verdient als arbeidsloon
      </Text>
    </View>
  );
}

const margeStijlen = StyleSheet.create({
  container: { marginTop: 14 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { fontSize: 12, color: KLEUREN.textSecondary, fontWeight: '600' },
  waarde: { fontSize: 12, fontWeight: '700' },
  balk: {
    height: 8,
    backgroundColor: KLEUREN.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  vulling: { height: 8, borderRadius: 4 },
  toelichting: { fontSize: 11, color: KLEUREN.textSecondary, marginTop: 4 },
});

export default function CalculatorScherm() {
  const { setKlusType, setAfmeting, setKwaliteit } = useKlusStore();

  const [geselecteerdType, setGeselecteerdType] = useState<KlusType | null>(null);
  const [lengte, setLengte] = useState('');
  const [breedte, setBreedte] = useState('');
  const [kwaliteit, setKwaliteitState] = useState<Kwaliteit>('standaard');

  const l = parseFloat(lengte) || 0;
  const b = parseFloat(breedte) || 0;
  const heeftInvoer = geselecteerdType !== null && l > 0 && b > 0;

  const resultaat = heeftInvoer
    ? berekenKlus(geselecteerdType!, kwaliteit, l, b)
    : null;

  function gaNaarVolleBerekening() {
    if (!geselecteerdType) return;
    setKlusType(geselecteerdType);
    setAfmeting('lengte', l);
    setAfmeting('breedte', b);
    setKwaliteit(kwaliteit);
    router.push('/klus/invoer');
  }

  return (
    <View style={stijlen.container}>
      <ScrollView contentContainerStyle={stijlen.inhoud} keyboardShouldPersistTaps="handled">

        {/* Info banner */}
        <View style={stijlen.infoBanner}>
          <MaterialCommunityIcons name="lightning-bolt" size={18} color={KLEUREN.primary} />
          <Text style={stijlen.infoBannerTekst}>
            Directe berekening — geen AI, geen wachttijd
          </Text>
        </View>

        {/* Klus type selectie */}
        <View style={stijlen.sectie}>
          <Text style={stijlen.sectieKop}>Klus type</Text>
          <View style={stijlen.typeGrid}>
            {KLUS_TYPES.map((klus) => {
              const actief = geselecteerdType === klus.id;
              return (
                <Pressable
                  key={klus.id}
                  style={[
                    stijlen.typeTegel,
                    actief && stijlen.typeTegelActief,
                    { borderColor: actief ? klus.kleur : KLEUREN.border },
                  ]}
                  onPress={() => setGeselecteerdType(klus.id)}
                  
                >
                  <MaterialCommunityIcons
                    name={klus.icoon as any}
                    size={26}
                    color={actief ? klus.kleur : KLEUREN.textSecondary}
                  />
                  <Text style={[stijlen.typeLabel, actief && { color: klus.kleur }]}>
                    {klus.label}
                  </Text>
                  {geselecteerdType === klus.id && (
                    <Text style={[stijlen.typePrijs, { color: klus.kleur }]}>
                      €{KLUS_PRIJZEN[klus.id].materiaalPerM2[kwaliteit]}–
                      {KLUS_PRIJZEN[klus.id].arbeidPerM2[kwaliteit] +
                        KLUS_PRIJZEN[klus.id].materiaalPerM2[kwaliteit]}
                      /m²
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Afmetingen */}
        <View style={stijlen.sectie}>
          <Text style={stijlen.sectieKop}>Oppervlakte</Text>
          <View style={stijlen.afmetingenRij}>
            <View style={stijlen.afmetingVeld}>
              <Text style={stijlen.afmetingLabel}>Lengte (m)</Text>
              <TextInput
                style={stijlen.afmetingInput}
                value={lengte}
                onChangeText={setLengte}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={KLEUREN.textSecondary}
                selectTextOnFocus
              />
            </View>

            <Text style={stijlen.maalteken}>×</Text>

            <View style={stijlen.afmetingVeld}>
              <Text style={stijlen.afmetingLabel}>Breedte (m)</Text>
              <TextInput
                style={stijlen.afmetingInput}
                value={breedte}
                onChangeText={setBreedte}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={KLEUREN.textSecondary}
                selectTextOnFocus
              />
            </View>

            <Text style={stijlen.maalteken}>=</Text>

            <View style={stijlen.oppervlakteResultaat}>
              <Text style={stijlen.afmetingLabel}>Oppervlakte</Text>
              <Text style={stijlen.oppervlakteWaarde}>
                {l > 0 && b > 0 ? `${Math.round(l * b * 10) / 10} m²` : '— m²'}
              </Text>
            </View>
          </View>
        </View>

        {/* Kwaliteit */}
        <View style={stijlen.sectie}>
          <Text style={stijlen.sectieKop}>Kwaliteitsniveau</Text>
          <View style={stijlen.kwaliteitRij}>
            {KWALITEIT_OPTIES.map((opt) => (
              <Pressable
                key={opt.id}
                style={[
                  stijlen.kwaliteitKnop,
                  kwaliteit === opt.id && stijlen.kwaliteitKnopActief,
                ]}
                onPress={() => setKwaliteitState(opt.id)}
              >
                <Text
                  style={[
                    stijlen.kwaliteitTekst,
                    kwaliteit === opt.id && stijlen.kwaliteitTekstActief,
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Resultaat */}
        {!heeftInvoer ? (
          <View style={stijlen.leegResultaat}>
            <MaterialCommunityIcons name="calculator-variant-outline" size={48} color={KLEUREN.border} />
            <Text style={stijlen.leegResultaatTekst}>
              Selecteer een klustype en vul afmetingen in
            </Text>
          </View>
        ) : (
          <View style={stijlen.resultaatKaart}>
            <View style={stijlen.resultaatHeader}>
              <MaterialCommunityIcons name="calculator" size={20} color={KLEUREN.white} />
              <Text style={stijlen.resultaatHeaderTekst}>Kostenberekening</Text>
              <Text style={stijlen.resultaatM2}>
                {Math.round(resultaat!.oppervlakte * 10) / 10} m²
              </Text>
            </View>

            <View style={stijlen.resultaatBody}>
              {/* Regels */}
              <View style={stijlen.kostenRij}>
                <Text style={stijlen.kostenLabel}>Materiaalkosten</Text>
                <Text style={stijlen.kostenWaarde}>
                  {formateerPrijs(resultaat!.materiaalkosten)}
                </Text>
              </View>
              <View style={stijlen.kostenRij}>
                <Text style={stijlen.kostenLabel}>Arbeidskosten</Text>
                <Text style={stijlen.kostenWaarde}>
                  {formateerPrijs(resultaat!.arbeidskosten)}
                </Text>
              </View>

              <View style={stijlen.kostenDivider} />

              <View style={stijlen.kostenRij}>
                <Text style={stijlen.kostenLabelBold}>Subtotaal excl. BTW</Text>
                <Text style={stijlen.kostenWaardeBold}>
                  {formateerPrijs(resultaat!.subtotaal)}
                </Text>
              </View>
              <View style={stijlen.kostenRij}>
                <Text style={stijlen.kostenLabel}>BTW 21%</Text>
                <Text style={stijlen.kostenWaarde}>
                  {formateerPrijs(resultaat!.btwBedrag)}
                </Text>
              </View>

              <View style={stijlen.kostenDivider} />

              <View style={stijlen.totaalRij}>
                <Text style={stijlen.totaalLabel}>TOTAAL incl. BTW</Text>
                <Text style={stijlen.totaalWaarde}>
                  {formateerPrijs(resultaat!.totaalInclBtw)}
                </Text>
              </View>

              {/* Per m² overzicht */}
              <View style={stijlen.perM2Balk}>
                <Text style={stijlen.perM2Tekst}>
                  ≈ {formateerPrijs(resultaat!.totaalInclBtw / resultaat!.oppervlakte)} per m²
                </Text>
              </View>

              {/* Winstmarge indicator */}
              <MargeBalk percent={resultaat!.arbeidMargePercent} />
            </View>
          </View>
        )}

        {/* Doorstuur knop */}
        {heeftInvoer && (
          <Pressable
            style={stijlen.vollBerekKnop}
            onPress={gaNaarVolleBerekening}
            
          >
            <View style={stijlen.vollBerekContent}>
              <MaterialCommunityIcons name="robot-outline" size={22} color={KLEUREN.primary} />
              <View style={stijlen.vollBerekTeksten}>
                <Text style={stijlen.vollBerekTitel}>Volledige materialenlijst</Text>
                <Text style={stijlen.vollBerekSubtitel}>
                  AI genereert exacte materialen + hoeveelheden
                </Text>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={KLEUREN.primary} />
          </Pressable>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const stijlen = StyleSheet.create({
  container: { flex: 1, backgroundColor: KLEUREN.background },
  inhoud: { padding: 16 },

  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF3E0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    borderLeftWidth: 3,
    borderLeftColor: KLEUREN.primary,
  },
  infoBannerTekst: { fontSize: 13, color: KLEUREN.primary, fontWeight: '600', flex: 1 },

  sectie: {
    backgroundColor: KLEUREN.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: KLEUREN.border,
  },
  sectieKop: { fontSize: 15, fontWeight: '700', color: KLEUREN.text, marginBottom: 14 },

  // Klus type grid
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeTegel: {
    width: '48%',
    borderRadius: 10,
    borderWidth: 1.5,
    padding: 12,
    alignItems: 'center',
    backgroundColor: KLEUREN.background,
    gap: 4,
  },
  typeTegelActief: { backgroundColor: KLEUREN.white },
  typeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: KLEUREN.textSecondary,
    textAlign: 'center',
  },
  typePrijs: { fontSize: 11, fontWeight: '700', textAlign: 'center' },

  // Afmetingen
  afmetingenRij: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  afmetingVeld: { flex: 1 },
  afmetingLabel: { fontSize: 11, color: KLEUREN.textSecondary, fontWeight: '600', marginBottom: 4 },
  afmetingInput: {
    borderWidth: 1.5,
    borderColor: KLEUREN.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 18,
    fontWeight: '700',
    color: KLEUREN.text,
    textAlign: 'center',
    backgroundColor: KLEUREN.background,
    fontFamily: 'SpaceMono',
  },
  maalteken: { fontSize: 20, color: KLEUREN.textSecondary, fontWeight: '300', marginTop: 14 },
  oppervlakteResultaat: { flex: 1, alignItems: 'center' },
  oppervlakteWaarde: {
    fontSize: 16,
    fontWeight: '700',
    color: KLEUREN.primary,
    fontFamily: 'SpaceMono',
    textAlign: 'center',
  },

  // Kwaliteit
  kwaliteitRij: { flexDirection: 'row', gap: 8 },
  kwaliteitKnop: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: KLEUREN.border,
    alignItems: 'center',
    backgroundColor: KLEUREN.background,
  },
  kwaliteitKnopActief: { borderColor: KLEUREN.primary, backgroundColor: KLEUREN.primary },
  kwaliteitTekst: { fontSize: 13, fontWeight: '600', color: KLEUREN.textSecondary },
  kwaliteitTekstActief: { color: KLEUREN.white },

  // Leeg resultaat
  leegResultaat: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  leegResultaatTekst: {
    fontSize: 14,
    color: KLEUREN.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Resultaat kaart
  resultaatKaart: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: KLEUREN.border,
  },
  resultaatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: KLEUREN.secondary,
    padding: 14,
  },
  resultaatHeaderTekst: {
    fontSize: 15,
    fontWeight: '700',
    color: KLEUREN.white,
    flex: 1,
  },
  resultaatM2: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    fontFamily: 'SpaceMono',
  },
  resultaatBody: {
    backgroundColor: KLEUREN.white,
    padding: 16,
  },

  // Kosten regels
  kostenRij: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  kostenLabel: { fontSize: 13, color: KLEUREN.textSecondary },
  kostenWaarde: { fontSize: 14, color: KLEUREN.text, fontFamily: 'SpaceMono' },
  kostenLabelBold: { fontSize: 14, fontWeight: '600', color: KLEUREN.text },
  kostenWaardeBold: { fontSize: 14, fontWeight: '700', color: KLEUREN.text, fontFamily: 'SpaceMono' },
  kostenDivider: { height: 1, backgroundColor: KLEUREN.border, marginVertical: 6 },

  totaalRij: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  totaalLabel: { fontSize: 16, fontWeight: '700', color: KLEUREN.text },
  totaalWaarde: {
    fontSize: 24,
    fontWeight: 'bold',
    color: KLEUREN.primary,
    fontFamily: 'SpaceMono',
  },

  perM2Balk: {
    backgroundColor: KLEUREN.background,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  perM2Tekst: { fontSize: 12, color: KLEUREN.textSecondary, fontWeight: '600' },

  // Doorstuur knop
  vollBerekKnop: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: KLEUREN.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: KLEUREN.primary,
  },
  vollBerekContent: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  vollBerekTeksten: { flex: 1 },
  vollBerekTitel: { fontSize: 15, fontWeight: '700', color: KLEUREN.primary },
  vollBerekSubtitel: { fontSize: 12, color: KLEUREN.textSecondary, marginTop: 2 },
});
