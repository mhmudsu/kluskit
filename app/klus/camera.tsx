import { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { KLEUREN } from '../../constants/kleuren';
import { useKlusStore } from '../../stores/klusStore';

interface AnalyseData {
  ruimteType: string;
  beschrijving: string;
  huidigeStaat: string;
  geschatteAfmetingen: {
    lengte: number | null;
    breedte: number | null;
    hoogte: number | null;
    notitie: string;
  };
  ondergrond: string;
  suggestieKlusType: string | null;
  suggestieReden: string;
  aanbevelingen: string[];
}

const RUIMTE_LABELS: Record<string, string> = {
  badkamer: 'Badkamer', keuken: 'Keuken', slaapkamer: 'Slaapkamer',
  woonkamer: 'Woonkamer', toilet: 'Toilet', hal: 'Hal',
  garage: 'Garage', kelder: 'Kelder', zolder: 'Zolder',
  buiten: 'Buiten', anders: 'Anders',
};

const KLUS_LABELS: Record<string, string> = {
  tegelen: 'Tegelen', schilderen: 'Schilderen', laminaat: 'Laminaat leggen',
  gipsplaten: 'Gipsplaten plaatsen', stucen: 'Stucen/pleisteren',
};

export default function CameraSchermWeb() {
  const router = useRouter();
  const { setKlusType, setAfmeting, setOndergrond, setRuimteType, setFotoAnalyseResultaat } =
    useKlusStore();
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [isLadenAnalyse, setIsLadenAnalyse] = useState(false);
  const [analyse, setAnalyse] = useState<AnalyseData | null>(null);
  const [fout, setFout] = useState<string | null>(null);

  function kiesFoto() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        setFotoUri(evt.target?.result as string);
        setAnalyse(null);
        setFout(null);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }

  async function analyseerFoto() {
    if (!fotoUri) return;
    setIsLadenAnalyse(true);
    setFout(null);
    try {
      const [prefix, imageBase64] = fotoUri.split(',');
      const mimeMatch = prefix.match(/:(.*?);/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

      const response = await fetch('/api/analyseer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, mimeType }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Analyse mislukt');
      setAnalyse(data);
      setFotoAnalyseResultaat(data as any);
    } catch (err) {
      setFout(err instanceof Error ? err.message : 'Analyse mislukt');
    } finally {
      setIsLadenAnalyse(false);
    }
  }

  function gaInvoerMet() {
    if (analyse) {
      if (analyse.suggestieKlusType && analyse.suggestieKlusType !== 'null') {
        setKlusType(analyse.suggestieKlusType as any);
      }
      const a = analyse.geschatteAfmetingen;
      if (a.lengte) setAfmeting('lengte', a.lengte);
      if (a.breedte) setAfmeting('breedte', a.breedte);
      if (a.hoogte) setAfmeting('hoogte', a.hoogte);
      if (analyse.ondergrond && analyse.ondergrond !== 'onbekend') {
        setOndergrond(analyse.ondergrond as any);
      }
      const ruimteMap: Record<string, 'droog' | 'vochtig' | 'buiten'> = {
        badkamer: 'vochtig', toilet: 'vochtig', keuken: 'vochtig', buiten: 'buiten',
      };
      setRuimteType(ruimteMap[analyse.ruimteType] ?? 'droog');
    }
    router.push('/klus/invoer');
  }

  return (
    <ScrollView style={stijlen.container} contentContainerStyle={stijlen.inhoud}>
      {/* Upload zone */}
      <Pressable style={stijlen.uploadZone} onPress={kiesFoto}>
        {fotoUri ? (
          <Image source={{ uri: fotoUri }} style={stijlen.fotoPreview} resizeMode="cover" />
        ) : (
          <>
            <View style={stijlen.uploadIcoonWrapper}>
              <MaterialCommunityIcons name="camera-plus" size={40} color={KLEUREN.primary} />
            </View>
            <Text style={stijlen.uploadTitel}>Foto uploaden</Text>
            <Text style={stijlen.uploadSubtitel}>Klik om een foto van de ruimte te kiezen</Text>
          </>
        )}
      </Pressable>

      {/* Knoppen na foto selectie */}
      {fotoUri && (
        <View style={stijlen.actiesRij}>
          <Pressable style={stijlen.knopSecundair} onPress={kiesFoto}>
            <MaterialCommunityIcons name="image-edit" size={18} color={KLEUREN.primary} />
            <Text style={stijlen.knopSecundairTekst}>Andere foto</Text>
          </Pressable>
          <Pressable
            style={[stijlen.knopPrimair, isLadenAnalyse && stijlen.knopUit]}
            onPress={analyseerFoto}
            disabled={isLadenAnalyse}
          >
            {isLadenAnalyse ? (
              <>
                <ActivityIndicator size="small" color={KLEUREN.white} />
                <Text style={stijlen.knopPrimairTekst}>AI analyseert...</Text>
              </>
            ) : (
              <>
                <MaterialCommunityIcons name="brain" size={18} color={KLEUREN.white} />
                <Text style={stijlen.knopPrimairTekst}>AI Analyseren</Text>
              </>
            )}
          </Pressable>
        </View>
      )}

      {/* Foutmelding */}
      {fout && (
        <View style={stijlen.foutBalk}>
          <MaterialCommunityIcons name="alert-circle" size={18} color={KLEUREN.error} />
          <Text style={stijlen.foutTekst}>{fout}</Text>
        </View>
      )}

      {/* Analyse resultaat */}
      {analyse && (
        <View style={stijlen.resultaatKaart}>
          <View style={stijlen.resultaatHeader}>
            <MaterialCommunityIcons name="check-circle" size={20} color={KLEUREN.white} />
            <Text style={stijlen.resultaatHeaderTekst}>AI Analyse Resultaat</Text>
          </View>

          <View style={stijlen.resultaatBody}>
            <View style={stijlen.analyseRij}>
              <Text style={stijlen.analyseLabel}>Ruimte</Text>
              <Text style={stijlen.analyseWaarde}>
                {RUIMTE_LABELS[analyse.ruimteType] ?? analyse.ruimteType}
              </Text>
            </View>

            <Text style={stijlen.beschrijvingTekst}>{analyse.beschrijving}</Text>

            {(analyse.geschatteAfmetingen.lengte || analyse.geschatteAfmetingen.breedte) && (
              <View style={stijlen.analyseRij}>
                <Text style={stijlen.analyseLabel}>Geschatte afmetingen</Text>
                <Text style={stijlen.analyseWaarde}>
                  {analyse.geschatteAfmetingen.lengte ?? '?'}m ×{' '}
                  {analyse.geschatteAfmetingen.breedte ?? '?'}m
                  {analyse.geschatteAfmetingen.hoogte
                    ? ` × ${analyse.geschatteAfmetingen.hoogte}m`
                    : ''}
                </Text>
              </View>
            )}

            {analyse.suggestieKlusType && analyse.suggestieKlusType !== 'null' && (
              <View style={stijlen.suggestieBalk}>
                <MaterialCommunityIcons name="lightbulb-on" size={16} color={KLEUREN.primary} />
                <Text style={stijlen.suggestieTekst}>
                  Aanbevolen klus:{' '}
                  <Text style={{ fontWeight: 'bold' }}>
                    {KLUS_LABELS[analyse.suggestieKlusType] ?? analyse.suggestieKlusType}
                  </Text>
                </Text>
              </View>
            )}

            {analyse.aanbevelingen.length > 0 && (
              <>
                <Text style={stijlen.aanbevelingenTitel}>Aanbevelingen</Text>
                {analyse.aanbevelingen.map((a, i) => (
                  <View key={i} style={stijlen.aanbevelingRij}>
                    <MaterialCommunityIcons name="check" size={14} color={KLEUREN.success} />
                    <Text style={stijlen.aanbevelingTekst}>{a}</Text>
                  </View>
                ))}
              </>
            )}
          </View>

          <Pressable style={stijlen.gaInvoerKnop} onPress={gaInvoerMet}>
            <MaterialCommunityIcons name="calculator-variant" size={20} color={KLEUREN.white} />
            <Text style={stijlen.gaInvoerKnopTekst}>Gebruik in klus invoer</Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color={KLEUREN.white} />
          </Pressable>
        </View>
      )}

      {/* Handmatig invoeren */}
      <Pressable style={stijlen.handmatigKnop} onPress={() => router.push('/klus/invoer')}>
        <MaterialCommunityIcons name="pencil-outline" size={18} color={KLEUREN.textSecondary} />
        <Text style={stijlen.handmatigKnopTekst}>Handmatig invoeren zonder foto</Text>
      </Pressable>
    </ScrollView>
  );
}

const stijlen = StyleSheet.create({
  container: { flex: 1, backgroundColor: KLEUREN.background },
  inhoud: { padding: 16, paddingBottom: 40 },

  uploadZone: {
    backgroundColor: KLEUREN.white,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: KLEUREN.primary,
    borderStyle: 'dashed',
    minHeight: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    overflow: 'hidden',
  } as any,
  fotoPreview: {
    width: '100%',
    height: 220,
  },
  uploadIcoonWrapper: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: 'rgba(46,204,113,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  uploadTitel: {
    fontSize: 17,
    fontWeight: '700',
    color: KLEUREN.text,
    marginBottom: 6,
  },
  uploadSubtitel: {
    fontSize: 13,
    color: KLEUREN.textSecondary,
    textAlign: 'center',
  },

  actiesRij: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  knopSecundair: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: KLEUREN.primary,
    backgroundColor: KLEUREN.white,
  },
  knopSecundairTekst: {
    fontSize: 14,
    fontWeight: '600',
    color: KLEUREN.primary,
  },
  knopPrimair: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: KLEUREN.primary,
  },
  knopUit: { opacity: 0.6 },
  knopPrimairTekst: {
    fontSize: 15,
    fontWeight: '700',
    color: KLEUREN.white,
  },

  foutBalk: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FFEBEE',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    borderLeftWidth: 4,
    borderLeftColor: KLEUREN.error,
  },
  foutTekst: { flex: 1, fontSize: 13, color: KLEUREN.error, lineHeight: 18 },

  resultaatKaart: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 14,
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
  resultaatBody: {
    backgroundColor: KLEUREN.white,
    padding: 16,
  },
  analyseRij: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: KLEUREN.border,
    marginBottom: 6,
  },
  analyseLabel: { fontSize: 13, color: KLEUREN.textSecondary, fontWeight: '600' },
  analyseWaarde: { fontSize: 14, color: KLEUREN.text, fontWeight: '700' },
  beschrijvingTekst: {
    fontSize: 13,
    color: KLEUREN.text,
    lineHeight: 20,
    marginBottom: 12,
    marginTop: 4,
  },
  suggestieBalk: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E8F8F0',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  suggestieTekst: { flex: 1, fontSize: 13, color: KLEUREN.text },
  aanbevelingenTitel: {
    fontSize: 13,
    fontWeight: '700',
    color: KLEUREN.text,
    marginBottom: 8,
  },
  aanbevelingRij: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  aanbevelingTekst: { flex: 1, fontSize: 13, color: KLEUREN.text, lineHeight: 18 },
  gaInvoerKnop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: KLEUREN.primary,
    padding: 16,
  },
  gaInvoerKnopTekst: {
    fontSize: 15,
    fontWeight: '700',
    color: KLEUREN.white,
    flex: 1,
    textAlign: 'center',
  },

  handmatigKnop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: KLEUREN.border,
    backgroundColor: KLEUREN.white,
  },
  handmatigKnopTekst: {
    fontSize: 14,
    color: KLEUREN.textSecondary,
    fontWeight: '500',
  },
});
