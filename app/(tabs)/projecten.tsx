import { StyleSheet, View, Text, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { KLEUREN } from '../../constants/kleuren';
import { useKlusStore } from '../../stores/klusStore';
import { KLUS_TYPES } from '../../constants/klusTypes';

export default function ProjectenScherm() {
  const { projecten } = useKlusStore();

  const getKlusLabel = (type: string) =>
    KLUS_TYPES.find((k) => k.id === type)?.label ?? type;

  return (
    <View style={stijlen.container}>
      {projecten.length === 0 ? (
        <View style={stijlen.legeStaat}>
          <MaterialCommunityIcons name="folder-open-outline" size={80} color={KLEUREN.border} />
          <Text style={stijlen.legeStaatTitel}>Geen projecten</Text>
          <Text style={stijlen.legeStaatTekst}>
            Bereken je eerste klus om een project op te slaan
          </Text>
          <Pressable
            style={stijlen.nieuweKlusKnop}
            onPress={() => router.push('/klus/invoer')}
          >
            <Text style={stijlen.nieuweKlusKnopTekst}>Nieuwe Klus Berekenen</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={stijlen.lijst}>
          {projecten.map((project) => (
            <View key={project.id} style={stijlen.projectKaart}>
              <View style={stijlen.projectHeader}>
                <MaterialCommunityIcons
                  name="briefcase-outline"
                  size={28}
                  color={KLEUREN.primary}
                />
                <View style={stijlen.projectInfo}>
                  <Text style={stijlen.projectNaam}>{project.naam}</Text>
                  <Text style={stijlen.projectType}>{getKlusLabel(project.klusType)}</Text>
                </View>
                <View
                  style={[
                    stijlen.statusBadge,
                    {
                      backgroundColor:
                        project.status === 'afgerond' ? KLEUREN.success : KLEUREN.warning,
                    },
                  ]}
                >
                  <Text style={stijlen.statusTekst}>{project.status}</Text>
                </View>
              </View>

              {project.materialen && (
                <View style={stijlen.kostenRij}>
                  <View style={stijlen.kostenItem}>
                    <Text style={stijlen.kostenLabel}>Materialen</Text>
                    <Text style={stijlen.kostenWaarde}>
                      €{project.materialen.totaalMateriaalkosten.toFixed(0)}
                    </Text>
                  </View>
                  <View style={stijlen.kostenItem}>
                    <Text style={stijlen.kostenLabel}>Arbeidstijd</Text>
                    <Text style={stijlen.kostenWaarde}>
                      {project.materialen.geschatteArbeidstijd} uur
                    </Text>
                  </View>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const stijlen = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: KLEUREN.background,
  },
  legeStaat: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  legeStaatTitel: {
    fontSize: 22,
    fontWeight: 'bold',
    color: KLEUREN.text,
    marginTop: 20,
  },
  legeStaatTekst: {
    fontSize: 15,
    color: KLEUREN.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  nieuweKlusKnop: {
    backgroundColor: KLEUREN.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 28,
    marginTop: 24,
  },
  nieuweKlusKnopTekst: {
    color: KLEUREN.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  lijst: {
    padding: 16,
    gap: 12,
  },
  projectKaart: {
    backgroundColor: KLEUREN.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#1B2631',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  projectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  projectInfo: {
    flex: 1,
    marginLeft: 12,
  },
  projectNaam: {
    fontSize: 16,
    fontWeight: '700',
    color: KLEUREN.text,
  },
  projectType: {
    fontSize: 13,
    color: KLEUREN.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusTekst: {
    fontSize: 11,
    color: KLEUREN.white,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  kostenRij: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: KLEUREN.border,
  },
  kostenItem: {
    flex: 1,
  },
  kostenLabel: {
    fontSize: 12,
    color: KLEUREN.textSecondary,
  },
  kostenWaarde: {
    fontSize: 18,
    fontWeight: 'bold',
    color: KLEUREN.primary,
    marginTop: 2,
  },
});
