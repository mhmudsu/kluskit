import { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { KLEUREN } from '../../constants/kleuren';
import { useKlusStore } from '../../stores/klusStore';
import { KLUS_TYPES, ONDERGRONDEN } from '../../constants/klusTypes';
import { KlusType, Ondergrond } from '../../types';

const ONDERGROND_MAP: Record<string, Ondergrond> = {
  beton: 'beton',
  gipsblokken: 'gipsblokken',
  gipsblok: 'gipsblokken',
  hout: 'hout',
  multiplex: 'hout',
  bestaande_tegels: 'bestaande_tegels',
  tegels: 'bestaande_tegels',
  metselwerk: 'metselwerk',
  baksteen: 'metselwerk',
  gipsplaat: 'gipsplaat',
  rigips: 'gipsplaat',
};

function mapOndergrond(ai: string): Ondergrond | null {
  return ONDERGROND_MAP[ai?.toLowerCase()] ?? null;
}

function mapKlusType(ai: string | null): KlusType | null {
  const types: KlusType[] = ['tegelen', 'schilderen', 'laminaat', 'gipsplaten', 'stucen'];
  return types.find((t) => t === ai) ?? null;
}

export default function FotoAnalyseScherm() {
  const { fotoAnalyseResultaat, analyseeFotoUri, setKlusType, setAfmeting, setOndergrond } =
    useKlusStore();

  const ai = fotoAnalyseResultaat;

  const [geselecteerdType, setGeselecteerdType] = useState<KlusType | null>(
    mapKlusType(ai?.suggestieKlusType ?? null)
  );
  const [lengte, setLengte] = useState(
    ai?.geschatteAfmetingen?.lengte ? String(ai.geschatteAfmetingen.lengte) : ''
  );
  const [breedte, setBreedte] = useState(
    ai?.geschatteAfmetingen?.breedte ? String(ai.geschatteAfmetingen.breedte) : ''
  );
  const [geselecteerdeOndergrond, setGeselecteerdeOndergrond] = useState<Ondergrond | null>(
    mapOndergrond(ai?.ondergrond ?? '')
  );

  if (!ai) {
    return (
      <View style={stijlen.leegContainer}>
        <MaterialCommunityIcons name="alert-circle-outline" size={64} color={KLEUREN.border} />
        <Text style={stijlen.leegTekst}>Geen analyseresultaat beschikbaar</Text>
        <Pressable style={stijlen.terugKnop} onPress={() => router.back()}>
          <Text style={stijlen.terugKnopTekst}>Terug naar camera</Text>
        </Pressable>
      </View>
    );
  }

  function gaNaarMaterialenlijst() {
    if (!geselecteerdType) return;

    setKlusType(geselecteerdType);
    setAfmeting('lengte', parseFloat(lengte) || 0);
    setAfmeting('breedte', parseFloat(breedte) || 0);
    if (geselecteerdeOndergrond) setOndergrond(geselecteerdeOndergrond);

    router.push('/klus/invoer');
  }

  const kanDoorgaan = geselecteerdType !== null;

  return (
    <View style={stijlen.container}>
      <ScrollView contentContainerStyle={stijlen.inhoud}>

        {/* Foto + AI-badge */}
        {analyseeFotoUri && (
          <View style={stijlen.fotoBanner}>
            <Image source={{ uri: analyseeFotoUri }} style={stijlen.fotoThumb} resizeMode="cover" />
            <View style={stijlen.aiBadge}>
              <MaterialCommunityIcons name="robot" size={14} color={KLEUREN.white} />
              <Text style={stijlen.aiBadgeTekst}>AI Analyse</Text>
            </View>
          </View>
        )}

        {/* Analyse resultaat */}
        <View style={stijlen.analyseKaart}>
          <View style={stijlen.analyseHeader}>
            <Text style={stijlen.ruimteType}>
              {ai.ruimteType.charAt(0).toUpperCase() + ai.ruimteType.slice(1)}
            </Text>
            <View style={stijlen.zekerheidsLabel}>
              <MaterialCommunityIcons name="check-circle" size={14} color={KLEUREN.success} />
              <Text style={stijlen.zekerheidsTekst}>Geanalyseerd</Text>
            </View>
          </View>

          <Text style={stijlen.beschrijving}>{ai.beschrijving}</Text>

          <View style={stijlen.staatRij}>
            <MaterialCommunityIcons name="information-outline" size={14} color={KLEUREN.textSecondary} />
            <Text style={stijlen.staatTekst}>{ai.huidigeStaat}</Text>
          </View>

          {ai.geschatteAfmetingen?.notitie && (
            <View style={stijlen.staatRij}>
              <MaterialCommunityIcons name="ruler" size={14} color={KLEUREN.textSecondary} />
              <Text style={stijlen.staatTekst}>{ai.geschatteAfmetingen.notitie}</Text>
            </View>
          )}

          {/* Aanbevelingen */}
          {ai.aanbevelingen?.length > 0 && (
            <View style={stijlen.aanbevelingen}>
              <Text style={stijlen.aanbevelingenTitel}>Aanbevelingen</Text>
              {ai.aanbevelingen.map((a, i) => (
                <View key={i} style={stijlen.aanbevelingRij}>
                  <MaterialCommunityIcons name="lightbulb-on" size={14} color={KLEUREN.warning} />
                  <Text style={stijlen.aanbevelingTekst}>{a}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Klustype bevestigen */}
        <View style={stijlen.sectie}>
          <Text style={stijlen.sectieKop}>
            <MaterialCommunityIcons name="wrench" size={15} color={KLEUREN.primary} />
            {' '}Wat moet er gebeuren?
          </Text>
          {ai.suggestieKlusType && (
            <View style={stijlen.suggestieBalk}>
              <MaterialCommunityIcons name="robot-outline" size={14} color={KLEUREN.primary} />
              <Text style={stijlen.suggestieTekst}>AI suggereert: {ai.suggestieReden}</Text>
            </View>
          )}
          <View style={stijlen.typeGrid}>
            {KLUS_TYPES.map((klus) => {
              const actief = geselecteerdType === klus.id;
              return (
                <Pressable
                  key={klus.id}
                  style={[
                    stijlen.typeTegel,
                    actief && { borderColor: klus.kleur, backgroundColor: klus.kleur + '15' },
                    ai.suggestieKlusType === klus.id && !actief && stijlen.typeTegelSuggestie,
                  ]}
                  onPress={() => setGeselecteerdType(klus.id)}
                >
                  <MaterialCommunityIcons
                    name={klus.icoon as any}
                    size={22}
                    color={actief ? klus.kleur : KLEUREN.textSecondary}
                  />
                  <Text style={[stijlen.typeLabel, actief && { color: klus.kleur, fontWeight: '700' }]}>
                    {klus.label}
                  </Text>
                  {ai.suggestieKlusType === klus.id && (
                    <View style={stijlen.aiChip}>
                      <Text style={stijlen.aiChipTekst}>AI</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Afmetingen bevestigen */}
        <View style={stijlen.sectie}>
          <Text style={stijlen.sectieKop}>
            <MaterialCommunityIcons name="ruler-square" size={15} color={KLEUREN.primary} />
            {' '}Afmetingen (m) — bevestig of corrigeer
          </Text>
          <View style={stijlen.afmetingenRij}>
            <View style={{ flex: 1 }}>
              <Text style={stijlen.inputLabel}>Lengte</Text>
              <TextInput
                style={stijlen.numInput}
                value={lengte}
                onChangeText={setLengte}
                keyboardType="decimal-pad"
                placeholder="bijv. 3.5"
                placeholderTextColor={KLEUREN.textSecondary}
                selectTextOnFocus
              />
            </View>
            <Text style={stijlen.maalteken}>×</Text>
            <View style={{ flex: 1 }}>
              <Text style={stijlen.inputLabel}>Breedte</Text>
              <TextInput
                style={stijlen.numInput}
                value={breedte}
                onChangeText={setBreedte}
                keyboardType="decimal-pad"
                placeholder="bijv. 2.5"
                placeholderTextColor={KLEUREN.textSecondary}
                selectTextOnFocus
              />
            </View>
            {lengte && breedte ? (
              <>
                <Text style={stijlen.maalteken}>=</Text>
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={stijlen.inputLabel}>m²</Text>
                  <Text style={stijlen.oppWaarde}>
                    {Math.round(parseFloat(lengte) * parseFloat(breedte) * 10) / 10}
                  </Text>
                </View>
              </>
            ) : null}
          </View>
        </View>

        {/* Ondergrond bevestigen */}
        <View style={stijlen.sectie}>
          <Text style={stijlen.sectieKop}>
            <MaterialCommunityIcons name="layers" size={15} color={KLEUREN.primary} />
            {' '}Ondergrond — bevestig of kies
          </Text>
          {ai.ondergrond && ai.ondergrond !== 'onbekend' && (
            <View style={stijlen.suggestieBalk}>
              <MaterialCommunityIcons name="robot-outline" size={14} color={KLEUREN.primary} />
              <Text style={stijlen.suggestieTekst}>AI herkende: {ai.ondergrond}</Text>
            </View>
          )}
          <View style={stijlen.ondergrondGrid}>
            {ONDERGRONDEN.map((o) => {
              const actief = geselecteerdeOndergrond === o.id;
              const isAiSuggestie = mapOndergrond(ai.ondergrond ?? '') === o.id;
              return (
                <Pressable
                  key={o.id}
                  style={[
                    stijlen.ondergrondKnop,
                    actief && stijlen.ondergrondKnopActief,
                    isAiSuggestie && !actief && stijlen.ondergrondKnopSuggestie,
                  ]}
                  onPress={() => setGeselecteerdeOndergrond(o.id)}
                >
                  <Text
                    style={[
                      stijlen.ondergrondTekst,
                      actief && stijlen.ondergrondTekstActief,
                    ]}
                  >
                    {o.label}
                  </Text>
                  {isAiSuggestie && (
                    <View style={stijlen.aiChip}>
                      <Text style={stijlen.aiChipTekst}>AI</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Vaste knop onderaan */}
      <View style={stijlen.knopenBalk}>
        {!kanDoorgaan && (
          <Text style={stijlen.validatieTekst}>Selecteer eerst een klustype</Text>
        )}
        <Pressable
          style={[stijlen.doorgaanKnop, !kanDoorgaan && stijlen.doorgaanKnopUit]}
          onPress={gaNaarMaterialenlijst}
          disabled={!kanDoorgaan}

        >
          <MaterialCommunityIcons name="robot-excited" size={24} color={KLEUREN.white} />
          <Text style={stijlen.doorgaanKnopTekst}>Genereer materialenlijst met AI</Text>
          <MaterialCommunityIcons name="chevron-right" size={22} color={KLEUREN.white} />
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

  // Foto banner
  fotoBanner: {
    height: 180,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: KLEUREN.secondary,
  },
  fotoThumb: { width: '100%', height: '100%' },
  aiBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: KLEUREN.primary,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  aiBadgeTekst: { fontSize: 11, fontWeight: '700', color: KLEUREN.white },

  // Analyse kaart
  analyseKaart: {
    backgroundColor: KLEUREN.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: KLEUREN.border,
  },
  analyseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  ruimteType: { fontSize: 20, fontWeight: '800', color: KLEUREN.text },
  zekerheidsLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  zekerheidsTekst: { fontSize: 11, color: KLEUREN.success, fontWeight: '600' },
  beschrijving: { fontSize: 14, color: KLEUREN.text, lineHeight: 20, marginBottom: 8 },
  staatRij: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 4,
  },
  staatTekst: { fontSize: 13, color: KLEUREN.textSecondary, flex: 1, lineHeight: 18 },
  aanbevelingen: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: KLEUREN.border },
  aanbevelingenTitel: { fontSize: 12, fontWeight: '700', color: KLEUREN.textSecondary, marginBottom: 6 },
  aanbevelingRij: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 4 },
  aanbevelingTekst: { fontSize: 12, color: KLEUREN.text, flex: 1, lineHeight: 18 },

  // Secties
  sectie: {
    backgroundColor: KLEUREN.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: KLEUREN.border,
  },
  sectieKop: { fontSize: 15, fontWeight: '700', color: KLEUREN.text, marginBottom: 10 },
  suggestieBalk: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
  },
  suggestieTekst: { fontSize: 12, color: KLEUREN.primary, flex: 1, lineHeight: 16 },

  // Klus type grid
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeTegel: {
    width: '48%',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: KLEUREN.border,
    padding: 10,
    alignItems: 'center',
    backgroundColor: KLEUREN.background,
    gap: 4,
    position: 'relative',
  },
  typeTegelSuggestie: { borderColor: KLEUREN.primary + '60', borderStyle: 'dashed' },
  typeLabel: { fontSize: 12, fontWeight: '500', color: KLEUREN.textSecondary, textAlign: 'center' },
  aiChip: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: KLEUREN.primary,
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  aiChipTekst: { fontSize: 9, fontWeight: '800', color: KLEUREN.white },

  // Afmetingen
  afmetingenRij: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  inputLabel: { fontSize: 11, color: KLEUREN.textSecondary, fontWeight: '600', marginBottom: 4 },
  numInput: {
    borderWidth: 1.5,
    borderColor: KLEUREN.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 17,
    fontWeight: '700',
    color: KLEUREN.text,
    textAlign: 'center',
    backgroundColor: KLEUREN.background,
    fontFamily: 'SpaceMono',
  },
  maalteken: { fontSize: 18, color: KLEUREN.textSecondary, marginTop: 14 },
  oppWaarde: {
    fontSize: 17,
    fontWeight: '700',
    color: KLEUREN.primary,
    fontFamily: 'SpaceMono',
    textAlign: 'center',
  },

  // Ondergrond
  ondergrondGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  ondergrondKnop: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: KLEUREN.border,
    backgroundColor: KLEUREN.background,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ondergrondKnopActief: { borderColor: KLEUREN.primary, backgroundColor: KLEUREN.primary },
  ondergrondKnopSuggestie: { borderColor: KLEUREN.primary + '60', borderStyle: 'dashed' },
  ondergrondTekst: { fontSize: 12, fontWeight: '600', color: KLEUREN.textSecondary },
  ondergrondTekstActief: { color: KLEUREN.white },

  // Onderste balk
  knopenBalk: {
    padding: 16,
    paddingBottom: 24,
    backgroundColor: KLEUREN.white,
    borderTopWidth: 1,
    borderTopColor: KLEUREN.border,
  },
  validatieTekst: {
    fontSize: 12,
    color: KLEUREN.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  doorgaanKnop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: KLEUREN.primary,
    borderRadius: 16,
    paddingVertical: 18,
  },
  doorgaanKnopUit: { backgroundColor: KLEUREN.border },
  doorgaanKnopTekst: { fontSize: 16, fontWeight: 'bold', color: KLEUREN.white, flex: 1, textAlign: 'center' },
});
