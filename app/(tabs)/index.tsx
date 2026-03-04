import { StyleSheet, View, Text, ScrollView, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { KLEUREN } from '../../constants/kleuren';
import { useKlusStore } from '../../stores/klusStore';

function begroeting(): string {
  const uur = new Date().getHours();
  if (uur < 12) return 'Goedemorgen';
  if (uur < 18) return 'Goedemiddag';
  return 'Goedenavond';
}

function formatDatum(): string {
  return new Date().toLocaleDateString('nl-NL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export default function HomeScherm() {
  const { projecten } = useKlusStore();
  const recenteProjecten = projecten.slice(0, 3);
  const totaalWaarde = projecten.reduce(
    (som, p) => som + (p.materialen?.totaalMateriaalkosten ?? 0),
    0
  );

  return (
    <ScrollView
      style={stijlen.container}
      contentContainerStyle={stijlen.inhoud}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Hero header ── */}
      <View style={stijlen.hero}>
        <View style={stijlen.heroTop}>
          <View>
            <Text style={stijlen.begroeting}>{begroeting()}</Text>
            <Text style={stijlen.datum}>{formatDatum()}</Text>
          </View>
          <View style={stijlen.logoBadge}>
            <MaterialCommunityIcons name="hammer-wrench" size={20} color={KLEUREN.primary} />
          </View>
        </View>

        {/* Stats chips */}
        <View style={stijlen.statsRij}>
          <View style={stijlen.statChip}>
            <Text style={stijlen.statGetal}>{projecten.length}</Text>
            <Text style={stijlen.statLabel}>klussen</Text>
          </View>
          <View style={stijlen.statLijn} />
          <View style={stijlen.statChip}>
            <Text style={stijlen.statGetal}>
              {totaalWaarde > 0 ? `€${totaalWaarde.toFixed(0)}` : '€—'}
            </Text>
            <Text style={stijlen.statLabel}>materiaalwaarde</Text>
          </View>
          <View style={stijlen.statLijn} />
          <View style={stijlen.statChip}>
            <MaterialCommunityIcons name="shield-check" size={14} color={KLEUREN.primary} />
            <Text style={[stijlen.statLabel, { color: KLEUREN.primary, marginLeft: 4 }]}>
              AI actief
            </Text>
          </View>
        </View>
      </View>

      {/* ── Hoofd CTA ── */}
      <Link href="/klus/invoer" asChild>
        <Pressable style={({ pressed }) => [stijlen.ctaKaart, pressed && { opacity: 0.88 }]}>
          <View style={stijlen.ctaIconWrapper}>
            <MaterialCommunityIcons name="brain" size={26} color={KLEUREN.white} />
          </View>
          <View style={stijlen.ctaTeksten}>
            <Text style={stijlen.ctaTitel}>Nieuwe klus berekenen</Text>
            <Text style={stijlen.ctaSubtitel}>AI maakt direct een materialenlijst</Text>
          </View>
          <MaterialCommunityIcons name="arrow-right" size={22} color="rgba(255,255,255,0.85)" />
        </Pressable>
      </Link>

      {/* ── Snelle acties 2×2 grid ── */}
      <Text style={stijlen.sectieLabel}>Snelle acties</Text>
      <View style={stijlen.actieGrid}>
        <Link href="/klus/camera" asChild>
          <Pressable style={[stijlen.actieKaart, stijlen.kaartDonker]}>
            <View style={[stijlen.actieIconRing, { borderColor: 'rgba(46,204,113,0.3)' }]}>
              <MaterialCommunityIcons name="camera-enhance" size={22} color={KLEUREN.primary} />
            </View>
            <Text style={[stijlen.actieNaam, stijlen.tekstWit]}>Scan ruimte</Text>
            <Text style={[stijlen.actieOmschrijving, stijlen.tekstDimWit]}>AI camera</Text>
          </Pressable>
        </Link>

        <Link href="/klus/calculator" asChild>
          <Pressable style={[stijlen.actieKaart, stijlen.kaartLicht]}>
            <View style={[stijlen.actieIconRing, { borderColor: 'rgba(243,156,18,0.3)' }]}>
              <MaterialCommunityIcons name="lightning-bolt" size={22} color={KLEUREN.warning} />
            </View>
            <Text style={stijlen.actieNaam}>Calculator</Text>
            <Text style={stijlen.actieOmschrijving}>Snelle schatting</Text>
          </Pressable>
        </Link>

        <Link href="/(tabs)/offerte" asChild>
          <Pressable style={[stijlen.actieKaart, stijlen.kaartLicht]}>
            <View style={[stijlen.actieIconRing, { borderColor: 'rgba(46,204,113,0.25)' }]}>
              <MaterialCommunityIcons name="file-sign" size={22} color={KLEUREN.primary} />
            </View>
            <Text style={stijlen.actieNaam}>Offerte</Text>
            <Text style={stijlen.actieOmschrijving}>PDF genereren</Text>
          </Pressable>
        </Link>

        <Link href="/(tabs)/projecten" asChild>
          <Pressable style={[stijlen.actieKaart, stijlen.kaartDonker]}>
            <View style={[stijlen.actieIconRing, { borderColor: 'rgba(255,255,255,0.12)' }]}>
              <MaterialCommunityIcons name="briefcase-outline" size={22} color={KLEUREN.white} />
            </View>
            <Text style={[stijlen.actieNaam, stijlen.tekstWit]}>Projecten</Text>
            <Text style={[stijlen.actieOmschrijving, stijlen.tekstDimWit]}>
              {projecten.length} opgeslagen
            </Text>
          </Pressable>
        </Link>
      </View>

      {/* ── Recente klussen ── */}
      {recenteProjecten.length > 0 && (
        <>
          <View style={stijlen.sectieHeader}>
            <Text style={stijlen.sectieLabel}>Recente klussen</Text>
            <Link href="/(tabs)/projecten" asChild>
              <Pressable>
                <Text style={stijlen.allesZien}>Alles zien →</Text>
              </Pressable>
            </Link>
          </View>

          <View style={stijlen.projectenKaart}>
            {recenteProjecten.map((project, index) => (
              <View
                key={project.id}
                style={[
                  stijlen.projectRij,
                  index < recenteProjecten.length - 1 && stijlen.projectRijScheiding,
                ]}
              >
                <View style={stijlen.projectIndex}>
                  <Text style={stijlen.projectIndexTekst}>{index + 1}</Text>
                </View>
                <View style={stijlen.projectInfo}>
                  <Text style={stijlen.projectNaam} numberOfLines={1}>
                    {project.naam}
                  </Text>
                  <Text style={stijlen.projectType}>{project.klusType}</Text>
                </View>
                <Text style={stijlen.projectBedrag}>
                  {project.materialen
                    ? `€${project.materialen.totaalMateriaalkosten.toFixed(0)}`
                    : '—'}
                </Text>
              </View>
            ))}
          </View>
        </>
      )}

      {/* ── Lege staat ── */}
      {projecten.length === 0 && (
        <View style={stijlen.legeStaat}>
          <View style={stijlen.legeIconWrapper}>
            <MaterialCommunityIcons name="toolbox-outline" size={36} color={KLEUREN.primary} />
          </View>
          <Text style={stijlen.legeStaatTitel}>Nog geen klussen</Text>
          <Text style={stijlen.legeStaatSubtekst}>
            Druk op "Nieuwe klus berekenen" om te starten
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
    paddingBottom: 40,
  },

  // ─── Hero ───────────────────────────────────────────────
  hero: {
    backgroundColor: KLEUREN.secondary,
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: 20,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  begroeting: {
    fontSize: 26,
    fontWeight: '700',
    color: KLEUREN.white,
    letterSpacing: -0.3,
  },
  datum: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 3,
    textTransform: 'capitalize',
  },
  logoBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(46,204,113,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(46,204,113,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRij: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  statChip: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  statGetal: {
    fontSize: 15,
    fontWeight: '700',
    color: KLEUREN.white,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
  },
  statLijn: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },

  // ─── Hoofd CTA ──────────────────────────────────────────
  ctaKaart: {
    backgroundColor: KLEUREN.primary,
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 24,
    shadowColor: KLEUREN.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaTeksten: {
    flex: 1,
    marginLeft: 14,
  },
  ctaTitel: {
    fontSize: 17,
    fontWeight: '700',
    color: KLEUREN.white,
  },
  ctaSubtitel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },

  // ─── Grid ───────────────────────────────────────────────
  sectieLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: KLEUREN.text,
    marginBottom: 12,
    marginTop: 4,
    paddingHorizontal: 16,
  },
  actieGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 28,
  },
  actieKaart: {
    width: '47.5%',
    borderRadius: 18,
    padding: 16,
    minHeight: 110,
    justifyContent: 'space-between',
  },
  kaartDonker: {
    backgroundColor: KLEUREN.secondary,
  },
  kaartLicht: {
    backgroundColor: KLEUREN.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  actieIconRing: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  actieNaam: {
    fontSize: 14,
    fontWeight: '700',
    color: KLEUREN.text,
  },
  actieOmschrijving: {
    fontSize: 12,
    color: KLEUREN.textSecondary,
    marginTop: 2,
  },
  tekstWit: {
    color: KLEUREN.white,
  },
  tekstDimWit: {
    color: 'rgba(255,255,255,0.45)',
  },

  // ─── Recente projecten ──────────────────────────────────
  sectieHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  allesZien: {
    fontSize: 13,
    color: KLEUREN.primary,
    fontWeight: '600',
  },
  projectenKaart: {
    backgroundColor: KLEUREN.white,
    borderRadius: 18,
    marginHorizontal: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  projectRij: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  projectRijScheiding: {
    borderBottomWidth: 1,
    borderBottomColor: KLEUREN.border,
  },
  projectIndex: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: KLEUREN.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  projectIndexTekst: {
    fontSize: 12,
    fontWeight: '700',
    color: KLEUREN.textSecondary,
  },
  projectInfo: {
    flex: 1,
  },
  projectNaam: {
    fontSize: 14,
    fontWeight: '600',
    color: KLEUREN.text,
  },
  projectType: {
    fontSize: 12,
    color: KLEUREN.textSecondary,
    marginTop: 2,
  },
  projectBedrag: {
    fontSize: 15,
    fontWeight: '700',
    color: KLEUREN.primary,
  },

  // ─── Lege staat ─────────────────────────────────────────
  legeStaat: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 32,
    marginTop: 8,
  },
  legeIconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: 'rgba(46,204,113,0.1)',
    borderWidth: 1.5,
    borderColor: 'rgba(46,204,113,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  legeStaatTitel: {
    fontSize: 17,
    fontWeight: '700',
    color: KLEUREN.text,
    marginBottom: 8,
  },
  legeStaatSubtekst: {
    fontSize: 14,
    color: KLEUREN.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
