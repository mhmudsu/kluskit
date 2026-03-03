import { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { KLEUREN } from '../../constants/kleuren';
import { useKlusStore } from '../../stores/klusStore';
import { genereerMaterialenlijst } from '../../services/ai';
import KlusTypeSelector from '../../components/KlusTypeSelector';
import AfmetingenInput from '../../components/AfmetingenInput';
import OndergrondSelector from '../../components/OndergrondSelector';

const STAPPEN = ['Klus type', 'Afmetingen', 'Ondergrond', 'Berekenen'];

export default function InvoerScherm() {
  const {
    huidigInvoer,
    isLadenAI,
    foutmelding,
    setKlusType,
    setAfmeting,
    setOndergrond,
    setRuimteType,
    setKwaliteit,
    setBijzonderheden,
    setMateriaalResultaat,
    setIsLadenAI,
    setFoutmelding,
  } = useKlusStore();

  const [huidigStap, setHuidigStap] = useState(1);

  const stap1Klaar = huidigInvoer.klusType !== null;
  const stap2Klaar =
    huidigInvoer.afmetingen.lengte > 0 && huidigInvoer.afmetingen.breedte > 0;
  const stap3Klaar = huidigInvoer.ondergrond !== null;
  const isFormulierGeldig = stap1Klaar && stap2Klaar && stap3Klaar;

  const huidigStapKlaar =
    huidigStap === 1 ? stap1Klaar :
    huidigStap === 2 ? stap2Klaar :
    huidigStap === 3 ? stap3Klaar : true;

  function gaVolgende() {
    if (huidigStapKlaar && huidigStap < 4) {
      setHuidigStap(huidigStap + 1);
    }
  }

  function gaVorige() {
    if (huidigStap > 1) setHuidigStap(huidigStap - 1);
  }

  async function berekenMaterialen() {
    if (!isFormulierGeldig) return;
    setIsLadenAI(true);
    setFoutmelding(null);
    try {
      const resultaat = await genereerMaterialenlijst(huidigInvoer);
      setMateriaalResultaat(resultaat);
      router.push('/klus/materialen');
    } catch (fout) {
      const bericht = fout instanceof Error ? fout.message : 'Er is een fout opgetreden.';
      setFoutmelding(bericht);
      Alert.alert('Fout', bericht);
    } finally {
      setIsLadenAI(false);
    }
  }

  return (
    <View style={stijlen.container}>
      <ScrollView
        style={stijlen.scroll}
        contentContainerStyle={stijlen.inhoud}
        keyboardShouldPersistTaps="handled"
      >
        {/* Stepper bovenaan */}
        <View style={stijlen.stepper}>
          {STAPPEN.map((stap, i) => {
            const stapNum = i + 1;
            const isActief = huidigStap === stapNum;
            const isKlaar =
              (i === 0 && stap1Klaar && huidigStap > 1) ||
              (i === 1 && stap2Klaar && huidigStap > 2) ||
              (i === 2 && stap3Klaar && huidigStap > 3);

            return (
              <View key={stap} style={stijlen.stapItem}>
                <View
                  style={[
                    stijlen.stapCircel,
                    isKlaar && { backgroundColor: KLEUREN.success },
                    isActief && { backgroundColor: KLEUREN.primary },
                    !isKlaar && !isActief && { backgroundColor: KLEUREN.border },
                  ]}
                >
                  {isKlaar ? (
                    <MaterialCommunityIcons name="check" size={13} color={KLEUREN.white} />
                  ) : i === 3 ? (
                    <MaterialCommunityIcons name="calculator" size={13} color={KLEUREN.white} />
                  ) : (
                    <Text style={stijlen.stapNummer}>{stapNum}</Text>
                  )}
                </View>
                <Text
                  style={[
                    stijlen.stapTekst,
                    isActief && { color: KLEUREN.primary, fontWeight: '700' },
                    isKlaar && { color: KLEUREN.success },
                  ]}
                >
                  {stap}
                </Text>
                {i < 3 && (
                  <View
                    style={[
                      stijlen.stapLijn,
                      isKlaar && { backgroundColor: KLEUREN.success },
                    ]}
                  />
                )}
              </View>
            );
          })}
        </View>

        {/* Stap 1: Klus type */}
        {huidigStap === 1 && (
          <View style={stijlen.sectie}>
            <KlusTypeSelector
              geselecteerd={huidigInvoer.klusType}
              onSelecteer={(type) => {
                setKlusType(type);
                // Auto-advance naar stap 2 na selectie
                setHuidigStap(2);
              }}
            />
          </View>
        )}

        {/* Stap 2: Afmetingen */}
        {huidigStap === 2 && (
          <View style={stijlen.sectie}>
            <AfmetingenInput
              afmetingen={huidigInvoer.afmetingen}
              onWijzig={setAfmeting}
            />
          </View>
        )}

        {/* Stap 3: Ondergrond + ruimte + kwaliteit */}
        {huidigStap === 3 && (
          <View style={stijlen.sectie}>
            <OndergrondSelector
              geselecteerdeOndergrond={huidigInvoer.ondergrond}
              geselecteerdeRuimte={huidigInvoer.ruimteType}
              geselecteerdeKwaliteit={huidigInvoer.kwaliteit}
              onSelecteerOndergrond={setOndergrond}
              onSelecteerRuimte={setRuimteType}
              onSelecteerKwaliteit={setKwaliteit}
            />
          </View>
        )}

        {/* Stap 4: Bijzonderheden + samenvatting */}
        {huidigStap === 4 && (
          <>
            {/* Samenvatting */}
            <View style={stijlen.samenvattingKaart}>
              <Text style={stijlen.samenvattingKop}>Samenvatting</Text>
              <View style={stijlen.samenvattingRij}>
                <MaterialCommunityIcons name="hammer-wrench" size={16} color={KLEUREN.primary} />
                <Text style={stijlen.samenvattingTekst}>
                  {huidigInvoer.klusType?.charAt(0).toUpperCase()}{huidigInvoer.klusType?.slice(1)}
                </Text>
              </View>
              <View style={stijlen.samenvattingRij}>
                <MaterialCommunityIcons name="ruler" size={16} color={KLEUREN.primary} />
                <Text style={stijlen.samenvattingTekst}>
                  {huidigInvoer.afmetingen.lengte}m × {huidigInvoer.afmetingen.breedte}m
                  {huidigInvoer.afmetingen.hoogte > 0
                    ? ` × ${huidigInvoer.afmetingen.hoogte}m`
                    : ''}
                  {' '}= {(huidigInvoer.afmetingen.lengte * huidigInvoer.afmetingen.breedte).toFixed(1)} m²
                </Text>
              </View>
              <View style={stijlen.samenvattingRij}>
                <MaterialCommunityIcons name="layers" size={16} color={KLEUREN.primary} />
                <Text style={stijlen.samenvattingTekst}>
                  {huidigInvoer.ondergrond} · {huidigInvoer.ruimteType} · {huidigInvoer.kwaliteit}
                </Text>
              </View>
            </View>

            {/* Bijzonderheden */}
            <View style={stijlen.sectie}>
              <Text style={stijlen.label}>Bijzonderheden (optioneel)</Text>
              <TextInput
                style={stijlen.bijzonderhedenInvoer}
                value={huidigInvoer.bijzonderheden}
                onChangeText={setBijzonderheden}
                placeholder="Bijv. rondom douchebak, oudere woning, specifieke tegelgrootte..."
                placeholderTextColor={KLEUREN.textSecondary}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Foutmelding */}
            {foutmelding && (
              <View style={stijlen.foutBalk}>
                <MaterialCommunityIcons name="alert-circle" size={20} color={KLEUREN.error} />
                <Text style={stijlen.foutTekst}>{foutmelding}</Text>
              </View>
            )}
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Navigatie balk onderaan */}
      <View style={stijlen.navigatieBalk}>
        {huidigStap > 1 ? (
          <Pressable style={stijlen.vorigeKnop} onPress={gaVorige}>
            <MaterialCommunityIcons name="chevron-left" size={22} color={KLEUREN.primary} />
            <Text style={stijlen.vorigeKnopTekst}>Vorige</Text>
          </Pressable>
        ) : (
          <View style={{ width: 90 }} />
        )}

        {huidigStap < 4 ? (
          <Pressable
            style={[stijlen.volgendeKnop, !huidigStapKlaar && stijlen.volgendeKnopUit]}
            onPress={gaVolgende}
          >
            <Text style={stijlen.volgendeKnopTekst}>Volgende</Text>
            <MaterialCommunityIcons name="chevron-right" size={22} color={KLEUREN.white} />
          </Pressable>
        ) : (
          <Pressable
            style={[
              stijlen.berekenKnop,
              (!isFormulierGeldig || isLadenAI) && stijlen.berekenKnopUit,
            ]}
            onPress={berekenMaterialen}
          >
            {isLadenAI ? (
              <>
                <ActivityIndicator size="small" color={KLEUREN.white} />
                <Text style={stijlen.berekenKnopTekst}>AI berekent...</Text>
              </>
            ) : (
              <>
                <MaterialCommunityIcons name="calculator-variant" size={22} color={KLEUREN.white} />
                <Text style={stijlen.berekenKnopTekst}>Bereken Materialen</Text>
              </>
            )}
          </Pressable>
        )}
      </View>
    </View>
  );
}

const stijlen = StyleSheet.create({
  container: { flex: 1, backgroundColor: KLEUREN.background },
  scroll: { flex: 1 },
  inhoud: { padding: 16 },

  // Stepper
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  stapItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stapCircel: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stapNummer: {
    fontSize: 11,
    fontWeight: 'bold',
    color: KLEUREN.white,
  },
  stapTekst: {
    fontSize: 9,
    color: KLEUREN.textSecondary,
    marginLeft: 4,
    fontWeight: '500',
  },
  stapLijn: {
    flex: 1,
    height: 1.5,
    backgroundColor: KLEUREN.border,
    marginHorizontal: 4,
  },

  // Sectie kaart
  sectie: {
    backgroundColor: KLEUREN.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#1B2631',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  // Samenvatting
  samenvattingKaart: {
    backgroundColor: '#E8F8F0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: KLEUREN.primary,
  },
  samenvattingKop: {
    fontSize: 13,
    fontWeight: '700',
    color: KLEUREN.primary,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  samenvattingRij: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  samenvattingTekst: {
    fontSize: 14,
    color: KLEUREN.text,
    fontWeight: '500',
  },

  // Bijzonderheden
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: KLEUREN.text,
    marginBottom: 12,
  },
  bijzonderhedenInvoer: {
    backgroundColor: KLEUREN.inputBackground,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: KLEUREN.text,
    borderWidth: 1.5,
    borderColor: KLEUREN.border,
    minHeight: 80,
  },

  // Fout
  foutBalk: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFEBEE',
    borderRadius: 10,
    padding: 12,
    gap: 8,
    borderLeftWidth: 4,
    borderLeftColor: KLEUREN.error,
    marginBottom: 12,
  },
  foutTekst: {
    flex: 1,
    fontSize: 13,
    color: KLEUREN.error,
    lineHeight: 18,
  },

  // Navigatie balk
  navigatieBalk: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 24,
    backgroundColor: KLEUREN.white,
    borderTopWidth: 1,
    borderTopColor: KLEUREN.border,
    elevation: 8,
  },
  vorigeKnop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: KLEUREN.primary,
  },
  vorigeKnopTekst: {
    fontSize: 15,
    fontWeight: '600',
    color: KLEUREN.primary,
  },
  volgendeKnop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    backgroundColor: KLEUREN.primary,
  },
  volgendeKnopUit: {
    backgroundColor: KLEUREN.border,
  },
  volgendeKnopTekst: {
    fontSize: 16,
    fontWeight: 'bold',
    color: KLEUREN.white,
  },
  berekenKnop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: KLEUREN.primary,
    elevation: 4,
  },
  berekenKnopUit: {
    backgroundColor: KLEUREN.border,
    elevation: 0,
  },
  berekenKnopTekst: {
    fontSize: 16,
    fontWeight: 'bold',
    color: KLEUREN.white,
  },
});
