import { StyleSheet, View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { KLEUREN } from '../../constants/kleuren';
import { useKlusStore } from '../../stores/klusStore';

export default function HomeScherm() {
  const router = useRouter();
  const { projecten } = useKlusStore();
  const recenteProjecten = projecten.slice(0, 3);

  return (
    <ScrollView style={stijlen.container} contentContainerStyle={stijlen.inhoud}>
      {/* Header banner */}
      <View style={stijlen.banner}>
        <MaterialCommunityIcons name="hammer-wrench" size={48} color={KLEUREN.white} />
        <Text style={stijlen.bannerTitel}>KlusKit</Text>
        <Text style={stijlen.bannerSubtitel}>AI-assistent voor de vakman</Text>
      </View>

      {/* Hoofdactie knop */}
      <Pressable style={stijlen.hoofdKnop} onPress={() => router.push('/klus/invoer')}>
        <MaterialCommunityIcons name="calculator-variant" size={32} color={KLEUREN.white} />
        <View style={stijlen.hoofdKnopTekst}>
          <Text style={stijlen.hoofdKnopTitel}>Nieuwe Klus Berekenen</Text>
          <Text style={stijlen.hoofdKnopSubtitel}>Materialenlijst in seconden</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={28} color={KLEUREN.white} />
      </Pressable>

      {/* Camera scan banner */}
      <Pressable style={stijlen.cameraBanner} onPress={() => router.push('/klus/camera')}>
        <View style={stijlen.calcBannerLinks}>
          <MaterialCommunityIcons name="camera-outline" size={22} color={KLEUREN.white} />
          <View style={stijlen.calcBannerTeksten}>
            <Text style={[stijlen.calcBannerTitel, { color: KLEUREN.white }]}>
              Scan ruimte met camera
            </Text>
            <Text style={[stijlen.calcBannerSubtitel, { color: 'rgba(255,255,255,0.8)' }]}>
              AI herkent ruimte, afmetingen en ondergrond
            </Text>
          </View>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={20} color={KLEUREN.white} />
      </Pressable>

      {/* Snelle berekening banner */}
      <Pressable style={stijlen.calcBanner} onPress={() => router.push('/klus/calculator')}>
        <View style={stijlen.calcBannerLinks}>
          <MaterialCommunityIcons name="lightning-bolt" size={22} color={KLEUREN.primary} />
          <View style={stijlen.calcBannerTeksten}>
            <Text style={stijlen.calcBannerTitel}>Snelle Berekening</Text>
            <Text style={stijlen.calcBannerSubtitel}>Direct resultaat, geen AI nodig</Text>
          </View>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={20} color={KLEUREN.primary} />
      </Pressable>

      {/* Snelle acties */}
      <Text style={stijlen.sectieLabel}>Snelle Acties</Text>
      <View style={stijlen.actieTegels}>
        <Pressable style={stijlen.actieTegel} onPress={() => router.push('/klus/invoer')}>
          <MaterialCommunityIcons name="calculator-variant" size={32} color={KLEUREN.primary} />
          <Text style={stijlen.actieTitelTekst}>AI Berekening</Text>
        </Pressable>
        <Pressable style={stijlen.actieTegel} onPress={() => router.push('/klus/calculator')}>
          <MaterialCommunityIcons name="lightning-bolt" size={32} color={KLEUREN.primary} />
          <Text style={stijlen.actieTitelTekst}>Snelle Calc</Text>
        </Pressable>
        <Pressable style={stijlen.actieTegel} onPress={() => router.push('/(tabs)/offerte')}>
          <MaterialCommunityIcons name="file-document-edit" size={32} color={KLEUREN.primary} />
          <Text style={stijlen.actieTitelTekst}>Offertes</Text>
        </Pressable>
      </View>

      {/* Recente projecten */}
      {recenteProjecten.length > 0 && (
        <>
          <Text style={stijlen.sectieLabel}>Recente Klussen</Text>
          {recenteProjecten.map((project) => (
            <View key={project.id} style={stijlen.projectKaart}>
              <MaterialCommunityIcons
                name="briefcase-check"
                size={24}
                color={KLEUREN.primary}
              />
              <View style={stijlen.projectInfo}>
                <Text style={stijlen.projectNaam}>{project.naam}</Text>
                <Text style={stijlen.projectStatus}>{project.klusType}</Text>
              </View>
              <Text style={stijlen.projectKosten}>
                {project.materialen
                  ? `€${project.materialen.totaalMateriaalkosten.toFixed(0)}`
                  : '—'}
              </Text>
            </View>
          ))}
        </>
      )}

      {/* Lege staat */}
      {projecten.length === 0 && (
        <View style={stijlen.legeStaat}>
          <MaterialCommunityIcons name="toolbox-outline" size={64} color={KLEUREN.border} />
          <Text style={stijlen.legeStaatTekst}>Nog geen klussen</Text>
          <Text style={stijlen.legeStaatSubtekst}>
            Druk op "Nieuwe Klus Berekenen" om te beginnen
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const stijlen = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: KLEUREN.background,
  },
  inhoud: {
    padding: 16,
    paddingBottom: 32,
  },
  banner: {
    backgroundColor: KLEUREN.secondary,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  bannerTitel: {
    fontSize: 28,
    fontWeight: 'bold',
    color: KLEUREN.white,
    marginTop: 8,
  },
  bannerSubtitel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  hoofdKnop: {
    backgroundColor: KLEUREN.primary,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#1B2631',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  hoofdKnopTekst: {
    flex: 1,
    marginLeft: 16,
  },
  hoofdKnopTitel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: KLEUREN.white,
  },
  hoofdKnopSubtitel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  cameraBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: KLEUREN.secondary,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  calcBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: KLEUREN.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: KLEUREN.primary,
  },
  calcBannerLinks: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  calcBannerTeksten: { flex: 1 },
  calcBannerTitel: { fontSize: 14, fontWeight: '700', color: KLEUREN.primary },
  calcBannerSubtitel: { fontSize: 12, color: KLEUREN.textSecondary, marginTop: 1 },
  sectieLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: KLEUREN.text,
    marginBottom: 12,
    marginTop: 4,
  },
  actieTegels: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actieTegel: {
    flex: 1,
    backgroundColor: KLEUREN.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#1B2631',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  actieTitelTekst: {
    fontSize: 12,
    fontWeight: '600',
    color: KLEUREN.text,
    marginTop: 8,
  },
  projectKaart: {
    backgroundColor: KLEUREN.white,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#1B2631',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  projectInfo: {
    flex: 1,
    marginLeft: 12,
  },
  projectNaam: {
    fontSize: 15,
    fontWeight: '600',
    color: KLEUREN.text,
  },
  projectStatus: {
    fontSize: 13,
    color: KLEUREN.textSecondary,
    marginTop: 2,
  },
  projectKosten: {
    fontSize: 16,
    fontWeight: 'bold',
    color: KLEUREN.primary,
  },
  legeStaat: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  legeStaatTekst: {
    fontSize: 18,
    fontWeight: '600',
    color: KLEUREN.textSecondary,
    marginTop: 16,
  },
  legeStaatSubtekst: {
    fontSize: 14,
    color: KLEUREN.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
});
