import { useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Image,
  ScrollView,
  TextInput,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system/legacy';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { KLEUREN } from '../../constants/kleuren';
import { useKlusStore } from '../../stores/klusStore';
import { FotoType, KlusFoto } from '../../types';

const FOTO_TYPE_LABELS: Record<Exclude<FotoType, 'analyse'>, string> = {
  voor: 'Voor-foto',
  tijdens: 'Tijdens-foto',
  na: 'Na-foto',
};

const FOTO_TYPE_ICONEN: Record<Exclude<FotoType, 'analyse'>, string> = {
  voor: 'image-plus',
  tijdens: 'progress-wrench',
  na: 'image-check',
};

// ─── Web upload scherm ────────────────────────────────────────────────────────

function WebUploadScherm() {
  const { voegFotoToe, setFotoAnalyseResultaat, setAnalyseeFotoUri } = useKlusStore();

  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [fotoBase64, setFotoBase64] = useState<string | null>(null);
  const [isLaden, setIsLaden] = useState(false);
  const [opslaanType, setOpslaanType] = useState<Exclude<FotoType, 'analyse'>>('voor');
  const [notitie, setNotitie] = useState('');
  const [opslaanKlaar, setOpslaanKlaar] = useState(false);

  function kiesBestand() {
    if (typeof document === 'undefined') return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      setIsLaden(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const base64 = dataUrl.split(',')[1];
        setFotoUri(dataUrl);
        setFotoBase64(base64);
        setIsLaden(false);
      };
      reader.onerror = () => {
        Alert.alert('Fout', 'Kon bestand niet lezen.');
        setIsLaden(false);
      };
      reader.readAsDataURL(file);
    };
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  }

  function opnieuw() {
    setFotoUri(null);
    setFotoBase64(null);
    setOpslaanKlaar(false);
    setNotitie('');
  }

  async function analyseerMetAI() {
    if (!fotoBase64) {
      Alert.alert('Geen foto', 'Selecteer eerst een foto.');
      return;
    }
    setIsLaden(true);
    try {
      const response = await fetch('/api/analyseer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: fotoBase64, mimeType: 'image/jpeg' }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? `Server fout (${response.status})`);
      setFotoAnalyseResultaat(data);
      setAnalyseeFotoUri(fotoUri);
      router.push('/klus/foto-analyse');
    } catch (err) {
      Alert.alert('Analyse mislukt', err instanceof Error ? err.message : 'Onbekende fout');
    } finally {
      setIsLaden(false);
    }
  }

  function slaFotoOp() {
    if (!fotoUri) return;
    const id = Date.now().toString();
    const foto: KlusFoto = {
      id,
      uri: fotoUri,
      type: opslaanType,
      notitie: notitie.trim() || undefined,
      tijdstempel: new Date(),
    };
    voegFotoToe(foto);
    setOpslaanKlaar(true);
  }

  return (
    <View style={stijlen.container}>
      <ScrollView contentContainerStyle={stijlen.inhoud} keyboardShouldPersistTaps="handled">

        {!fotoUri ? (
          /* Upload sectie */
          <View style={stijlen.uploadSectie}>
            <MaterialCommunityIcons name="image-plus" size={64} color={KLEUREN.border} />
            <Text style={stijlen.uploadTitel}>Selecteer een foto</Text>
            <Text style={stijlen.uploadSubtitel}>
              Kies een foto van de ruimte voor AI-analyse of documentatie
            </Text>
            <Pressable style={stijlen.uploadKnop} onPress={kiesBestand}>
              {isLaden ? (
                <ActivityIndicator size="small" color={KLEUREN.white} />
              ) : (
                <MaterialCommunityIcons name="folder-open" size={22} color={KLEUREN.white} />
              )}
              <Text style={stijlen.uploadKnopTekst}>
                {isLaden ? 'Laden...' : 'Kies bestand'}
              </Text>
            </Pressable>
          </View>
        ) : (
          <>
            {/* Foto preview */}
            <View style={stijlen.fotoPreviewContainer}>
              <Image source={{ uri: fotoUri }} style={stijlen.fotoPreview} resizeMode="cover" />
              <Pressable style={stijlen.opnieuwKnop} onPress={opnieuw}>
                <MaterialCommunityIcons name="refresh" size={18} color={KLEUREN.white} />
                <Text style={stijlen.opnieuwKnopTekst}>Andere foto</Text>
              </Pressable>
            </View>

            {/* AI Analyse */}
            <View style={stijlen.sectie}>
              <View style={stijlen.sectieHeader}>
                <MaterialCommunityIcons name="robot-outline" size={22} color={KLEUREN.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={stijlen.sectieKop}>Analyseer met AI</Text>
                  <Text style={stijlen.sectieSubtitel}>
                    Claude herkent ruimte, afmetingen en ondergrond
                  </Text>
                </View>
              </View>
              <Pressable
                style={[stijlen.analyseKnop, isLaden && stijlen.analyseKnopLaden]}
                onPress={analyseerMetAI}
              >
                {isLaden ? (
                  <>
                    <ActivityIndicator size="small" color={KLEUREN.white} />
                    <Text style={stijlen.analyseKnopTekst}>AI analyseert foto...</Text>
                  </>
                ) : (
                  <>
                    <MaterialCommunityIcons name="magnify-scan" size={22} color={KLEUREN.white} />
                    <Text style={stijlen.analyseKnopTekst}>Start analyse →</Text>
                  </>
                )}
              </Pressable>
            </View>

            {/* Foto opslaan */}
            <View style={stijlen.sectie}>
              <View style={stijlen.sectieHeader}>
                <MaterialCommunityIcons name="image-plus" size={22} color={KLEUREN.secondary} />
                <View style={{ flex: 1 }}>
                  <Text style={stijlen.sectieKop}>Opslaan als projectfoto</Text>
                  <Text style={stijlen.sectieSubtitel}>Documenteer de klus (voor/tijdens/na)</Text>
                </View>
              </View>

              <View style={stijlen.fotoTypeRij}>
                {(['voor', 'tijdens', 'na'] as const).map((type) => (
                  <Pressable
                    key={type}
                    style={[
                      stijlen.fotoTypeKnop,
                      opslaanType === type && stijlen.fotoTypeKnopActief,
                    ]}
                    onPress={() => { setOpslaanType(type); setOpslaanKlaar(false); }}
                  >
                    <MaterialCommunityIcons
                      name={FOTO_TYPE_ICONEN[type] as any}
                      size={18}
                      color={opslaanType === type ? KLEUREN.white : KLEUREN.textSecondary}
                    />
                    <Text style={[
                      stijlen.fotoTypeTekst,
                      opslaanType === type && stijlen.fotoTypeTekstActief,
                    ]}>
                      {FOTO_TYPE_LABELS[type]}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <TextInput
                style={stijlen.notitieInput}
                value={notitie}
                onChangeText={setNotitie}
                placeholder="Notitie (optioneel)..."
                placeholderTextColor={KLEUREN.textSecondary}
              />

              {opslaanKlaar ? (
                <View style={stijlen.opslaanKlaarBalk}>
                  <MaterialCommunityIcons name="check-circle" size={20} color={KLEUREN.success} />
                  <Text style={stijlen.opslaanKlaarTekst}>
                    {FOTO_TYPE_LABELS[opslaanType]} opgeslagen!
                  </Text>
                </View>
              ) : (
                <Pressable style={stijlen.opslaanKnop} onPress={slaFotoOp}>
                  <MaterialCommunityIcons name="content-save" size={20} color={KLEUREN.secondary} />
                  <Text style={stijlen.opslaanKnopTekst}>Foto opslaan</Text>
                </Pressable>
              )}
            </View>
          </>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

// ─── Hoofd component ──────────────────────────────────────────────────────────

export default function CameraScherm() {
  const { voegFotoToe, setFotoAnalyseResultaat, setAnalyseeFotoUri } = useKlusStore();

  const [permission, requestPermission] = useCameraPermissions();
  const [cameraType, setCameraType] = useState<CameraType>('back');
  const [mode, setMode] = useState<'camera' | 'preview'>('camera');
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [fotoBase64, setFotoBase64] = useState<string | null>(null);
  const [isLaden, setIsLaden] = useState(false);
  const [opslaanType, setOpslaanType] = useState<Exclude<FotoType, 'analyse'>>('voor');
  const [notitie, setNotitie] = useState('');
  const [opslaanKlaar, setOpslaanKlaar] = useState(false);

  const cameraRef = useRef<CameraView>(null);

  // Web: toon upload UI
  if (Platform.OS === 'web') {
    return <WebUploadScherm />;
  }

  // Native: toestemmingen
  if (!permission) {
    return (
      <View style={stijlen.centered}>
        <ActivityIndicator size="large" color={KLEUREN.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={stijlen.toestemmingContainer}>
        <MaterialCommunityIcons name="camera-off" size={64} color={KLEUREN.border} />
        <Text style={stijlen.toestemmingTitel}>Camera toegang nodig</Text>
        <Text style={stijlen.toestemmingTekst}>
          KlusKit heeft toegang tot de camera nodig om foto's te maken voor analyse en documentatie.
        </Text>
        <Pressable style={stijlen.toestemmingKnop} onPress={requestPermission}>
          <Text style={stijlen.toestemmingKnopTekst}>Geef toestemming</Text>
        </Pressable>
      </View>
    );
  }

  async function maakFoto() {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.6,
        exif: false,
      });
      if (photo) {
        setFotoUri(photo.uri);
        setFotoBase64(photo.base64 ?? null);
        setMode('preview');
      }
    } catch {
      Alert.alert('Fout', 'Kon geen foto maken. Probeer opnieuw.');
    }
  }

  function opnieuw() {
    setFotoUri(null);
    setFotoBase64(null);
    setMode('camera');
    setOpslaanKlaar(false);
    setNotitie('');
  }

  async function analyseerMetAI() {
    if (!fotoBase64) return;
    setIsLaden(true);
    try {
      const response = await fetch('/api/analyseer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: fotoBase64, mimeType: 'image/jpeg' }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? `Server fout (${response.status})`);
      setFotoAnalyseResultaat(data);
      setAnalyseeFotoUri(fotoUri);
      router.push('/klus/foto-analyse');
    } catch (err) {
      Alert.alert('Analyse mislukt', err instanceof Error ? err.message : 'Onbekende fout');
    } finally {
      setIsLaden(false);
    }
  }

  async function slaFotoOp() {
    if (!fotoUri) return;
    setIsLaden(true);
    try {
      const id = Date.now().toString();
      const permanentUri = `${FileSystem.documentDirectory}klus-foto-${id}.jpg`;
      await FileSystem.copyAsync({ from: fotoUri, to: permanentUri });
      const foto: KlusFoto = {
        id,
        uri: permanentUri,
        type: opslaanType,
        notitie: notitie.trim() || undefined,
        tijdstempel: new Date(),
      };
      voegFotoToe(foto);
      setOpslaanKlaar(true);
    } catch {
      Alert.alert('Fout', 'Kon foto niet opslaan. Probeer opnieuw.');
    } finally {
      setIsLaden(false);
    }
  }

  // Camera view
  if (mode === 'camera') {
    return (
      <View style={stijlen.cameraContainer}>
        <CameraView ref={cameraRef} style={stijlen.camera} facing={cameraType}>
          <View style={stijlen.cameraOverlay}>
            <View style={stijlen.cameraTopBalk}>
              <Pressable style={stijlen.cameraIconKnop} onPress={() => router.back()}>
                <MaterialCommunityIcons name="close" size={24} color={KLEUREN.white} />
              </Pressable>
              <Text style={stijlen.cameraTitel}>Foto maken</Text>
              <Pressable
                style={stijlen.cameraIconKnop}
                onPress={() => setCameraType(cameraType === 'back' ? 'front' : 'back')}
              >
                <MaterialCommunityIcons name="camera-flip" size={24} color={KLEUREN.white} />
              </Pressable>
            </View>
            <View style={stijlen.cameraHint}>
              <MaterialCommunityIcons name="scan-helper" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={stijlen.cameraHintTekst}>Zorg dat de hele ruimte in beeld is</Text>
            </View>
            <View style={stijlen.cameraOnderBalk}>
              <Pressable style={stijlen.sluitKnop} onPress={maakFoto}>
                <View style={stijlen.sluitKnopBinnen} />
              </Pressable>
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  // Preview view (native)
  return (
    <View style={stijlen.container}>
      <ScrollView contentContainerStyle={stijlen.inhoud} keyboardShouldPersistTaps="handled">
        <View style={stijlen.fotoPreviewContainer}>
          {fotoUri && (
            <Image source={{ uri: fotoUri }} style={stijlen.fotoPreview} resizeMode="cover" />
          )}
          <Pressable style={stijlen.opnieuwKnop} onPress={opnieuw}>
            <MaterialCommunityIcons name="camera-retake" size={18} color={KLEUREN.white} />
            <Text style={stijlen.opnieuwKnopTekst}>Opnieuw</Text>
          </Pressable>
        </View>

        <View style={stijlen.sectie}>
          <View style={stijlen.sectieHeader}>
            <MaterialCommunityIcons name="robot-outline" size={22} color={KLEUREN.primary} />
            <View style={{ flex: 1 }}>
              <Text style={stijlen.sectieKop}>Analyseer met AI</Text>
              <Text style={stijlen.sectieSubtitel}>Claude herkent ruimte, afmetingen en ondergrond</Text>
            </View>
          </View>
          <Pressable
            style={[stijlen.analyseKnop, isLaden && stijlen.analyseKnopLaden]}
            onPress={analyseerMetAI}
          >
            {isLaden ? (
              <>
                <ActivityIndicator size="small" color={KLEUREN.white} />
                <Text style={stijlen.analyseKnopTekst}>AI analyseert foto...</Text>
              </>
            ) : (
              <>
                <MaterialCommunityIcons name="magnify-scan" size={22} color={KLEUREN.white} />
                <Text style={stijlen.analyseKnopTekst}>Start analyse →</Text>
              </>
            )}
          </Pressable>
        </View>

        <View style={stijlen.sectie}>
          <View style={stijlen.sectieHeader}>
            <MaterialCommunityIcons name="image-plus" size={22} color={KLEUREN.secondary} />
            <View style={{ flex: 1 }}>
              <Text style={stijlen.sectieKop}>Opslaan als projectfoto</Text>
              <Text style={stijlen.sectieSubtitel}>Documenteer de klus (voor/tijdens/na)</Text>
            </View>
          </View>
          <View style={stijlen.fotoTypeRij}>
            {(['voor', 'tijdens', 'na'] as const).map((type) => (
              <Pressable
                key={type}
                style={[stijlen.fotoTypeKnop, opslaanType === type && stijlen.fotoTypeKnopActief]}
                onPress={() => { setOpslaanType(type); setOpslaanKlaar(false); }}
              >
                <MaterialCommunityIcons
                  name={FOTO_TYPE_ICONEN[type] as any}
                  size={18}
                  color={opslaanType === type ? KLEUREN.white : KLEUREN.textSecondary}
                />
                <Text style={[stijlen.fotoTypeTekst, opslaanType === type && stijlen.fotoTypeTekstActief]}>
                  {FOTO_TYPE_LABELS[type]}
                </Text>
              </Pressable>
            ))}
          </View>
          <TextInput
            style={stijlen.notitieInput}
            value={notitie}
            onChangeText={setNotitie}
            placeholder="Notitie (optioneel)..."
            placeholderTextColor={KLEUREN.textSecondary}
          />
          {opslaanKlaar ? (
            <View style={stijlen.opslaanKlaarBalk}>
              <MaterialCommunityIcons name="check-circle" size={20} color={KLEUREN.success} />
              <Text style={stijlen.opslaanKlaarTekst}>{FOTO_TYPE_LABELS[opslaanType]} opgeslagen!</Text>
            </View>
          ) : (
            <Pressable
              style={[stijlen.opslaanKnop, isLaden && { opacity: 0.6 }]}
              onPress={slaFotoOp}
            >
              {isLaden ? (
                <ActivityIndicator size="small" color={KLEUREN.secondary} />
              ) : (
                <MaterialCommunityIcons name="content-save" size={20} color={KLEUREN.secondary} />
              )}
              <Text style={stijlen.opslaanKnopTekst}>{isLaden ? 'Opslaan...' : 'Foto opslaan'}</Text>
            </Pressable>
          )}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const stijlen = StyleSheet.create({
  container: { flex: 1, backgroundColor: KLEUREN.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  inhoud: { padding: 16 },

  // Web upload
  uploadSectie: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  uploadTitel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: KLEUREN.text,
    marginTop: 8,
  },
  uploadSubtitel: {
    fontSize: 14,
    color: KLEUREN.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  uploadKnop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: KLEUREN.primary,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginTop: 8,
  },
  uploadKnopTekst: {
    fontSize: 16,
    fontWeight: 'bold',
    color: KLEUREN.white,
  },

  // Toestemming
  toestemmingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: KLEUREN.background,
  },
  toestemmingTitel: { fontSize: 20, fontWeight: 'bold', color: KLEUREN.text, marginTop: 20 },
  toestemmingTekst: {
    fontSize: 14, color: KLEUREN.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 20,
  },
  toestemmingKnop: {
    backgroundColor: KLEUREN.primary, borderRadius: 12,
    paddingVertical: 14, paddingHorizontal: 32, marginTop: 24,
  },
  toestemmingKnopTekst: { fontSize: 15, fontWeight: 'bold', color: KLEUREN.white },

  // Camera
  cameraContainer: { flex: 1 },
  camera: { flex: 1 },
  cameraOverlay: { flex: 1, backgroundColor: 'transparent', justifyContent: 'space-between' },
  cameraTopBalk: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, paddingTop: 48, backgroundColor: 'rgba(0,0,0,0.4)',
  },
  cameraIconKnop: { padding: 8, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.3)' },
  cameraTitel: { fontSize: 16, fontWeight: '700', color: KLEUREN.white },
  cameraHint: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: 'rgba(0,0,0,0.3)', paddingVertical: 8,
  },
  cameraHintTekst: { fontSize: 12, color: 'rgba(255,255,255,0.85)' },
  cameraOnderBalk: {
    alignItems: 'center', paddingBottom: 48,
    backgroundColor: 'rgba(0,0,0,0.4)', paddingTop: 20,
  },
  sluitKnop: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: KLEUREN.white,
  },
  sluitKnopBinnen: { width: 54, height: 54, borderRadius: 27, backgroundColor: KLEUREN.white },

  // Preview
  fotoPreviewContainer: {
    height: 240, borderRadius: 14, overflow: 'hidden',
    marginBottom: 14, backgroundColor: KLEUREN.secondary,
  },
  fotoPreview: { width: '100%', height: '100%' },
  opnieuwKnop: {
    position: 'absolute', bottom: 12, right: 12,
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20,
    paddingVertical: 8, paddingHorizontal: 14,
  },
  opnieuwKnopTekst: { fontSize: 13, fontWeight: '600', color: KLEUREN.white },

  // Secties
  sectie: {
    backgroundColor: KLEUREN.white, borderRadius: 14, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: KLEUREN.border,
  },
  sectieHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 14 },
  sectieKop: { fontSize: 15, fontWeight: '700', color: KLEUREN.text },
  sectieSubtitel: { fontSize: 12, color: KLEUREN.textSecondary, marginTop: 2 },

  analyseKnop: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, backgroundColor: KLEUREN.primary, borderRadius: 12, paddingVertical: 16,
  },
  analyseKnopLaden: { opacity: 0.7 },
  analyseKnopTekst: { fontSize: 16, fontWeight: 'bold', color: KLEUREN.white },

  fotoTypeRij: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  fotoTypeKnop: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, paddingVertical: 10, borderRadius: 10,
    borderWidth: 1.5, borderColor: KLEUREN.border, backgroundColor: KLEUREN.background,
  },
  fotoTypeKnopActief: { borderColor: KLEUREN.secondary, backgroundColor: KLEUREN.secondary },
  fotoTypeTekst: { fontSize: 11, fontWeight: '600', color: KLEUREN.textSecondary },
  fotoTypeTekstActief: { color: KLEUREN.white },
  notitieInput: {
    borderWidth: 1, borderColor: KLEUREN.border, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 14,
    color: KLEUREN.text, backgroundColor: KLEUREN.background, marginBottom: 12,
  },
  opslaanKnop: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 12, borderRadius: 10,
    borderWidth: 1.5, borderColor: KLEUREN.secondary, backgroundColor: KLEUREN.background,
  },
  opslaanKnopTekst: { fontSize: 14, fontWeight: '600', color: KLEUREN.secondary },
  opslaanKlaarBalk: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 12, borderRadius: 10, backgroundColor: '#E8F5E9',
  },
  opslaanKlaarTekst: { fontSize: 14, fontWeight: '600', color: KLEUREN.success },
});
