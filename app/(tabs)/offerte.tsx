import { StyleSheet, View, Text, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { KLEUREN } from '../../constants/kleuren';
import { useKlusStore } from '../../stores/klusStore';
import { formateerPrijs } from '../../utils/formatters';
import { Offerte } from '../../types';

const STATUS_KLEUREN: Record<Offerte['status'], string> = {
  concept: KLEUREN.textSecondary,
  verzonden: '#2980B9',
  geaccepteerd: KLEUREN.success,
  afgewezen: KLEUREN.error,
};

const STATUS_LABELS: Record<Offerte['status'], string> = {
  concept: 'Concept',
  verzonden: 'Verzonden',
  geaccepteerd: 'Geaccepteerd',
  afgewezen: 'Afgewezen',
};

export default function OfferteScherm() {
  const { offertes } = useKlusStore();

  if (offertes.length === 0) {
    return (
      <View style={stijlen.container}>
        <View style={stijlen.legeStaat}>
          <MaterialCommunityIcons name="file-document-outline" size={80} color={KLEUREN.border} />
          <Text style={stijlen.titel}>Geen offertes</Text>
          <Text style={stijlen.tekst}>
            Maak een materialenlijst aan en klik op "Maak offerte" om een offerte te genereren.
          </Text>
          <Pressable
            style={stijlen.nieuwKnop}
            onPress={() => router.push('/klus/invoer')}
          >
            <MaterialCommunityIcons name="plus-circle" size={20} color={KLEUREN.white} />
            <Text style={stijlen.nieuwKnopTekst}>Nieuwe klus berekenen</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={stijlen.container}>
      <ScrollView contentContainerStyle={stijlen.inhoud}>
        <View style={stijlen.headerRij}>
          <Text style={stijlen.headerTekst}>
            {offertes.length} offerte{offertes.length !== 1 ? 's' : ''}
          </Text>
          <Pressable onPress={() => router.push('/klus/invoer')}>
            <MaterialCommunityIcons name="plus-circle-outline" size={24} color={KLEUREN.primary} />
          </Pressable>
        </View>

        {offertes.map((offerte) => (
          <Pressable key={offerte.id} style={stijlen.offerteKaart}>
            <View style={stijlen.kaartHeader}>
              <Text style={stijlen.offerteNummer}>{offerte.offerteNummer}</Text>
              <View
                style={[
                  stijlen.statusBadge,
                  { backgroundColor: STATUS_KLEUREN[offerte.status] + '22' },
                ]}
              >
                <Text style={[stijlen.statusTekst, { color: STATUS_KLEUREN[offerte.status] }]}>
                  {STATUS_LABELS[offerte.status]}
                </Text>
              </View>
            </View>

            <Text style={stijlen.klantNaam}>{offerte.klantNaam}</Text>
            {offerte.klantAdres ? (
              <Text style={stijlen.klantAdres} numberOfLines={1}>
                {offerte.klantAdres}
              </Text>
            ) : null}

            <Text style={stijlen.werkbeschrijving} numberOfLines={2}>
              {offerte.werkbeschrijving}
            </Text>

            <View style={stijlen.kaartFooter}>
              <Text style={stijlen.datumTekst}>
                {new Date(offerte.datum).toLocaleDateString('nl-NL', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
              <Text style={stijlen.totaalBedrag}>{formateerPrijs(offerte.totaalInclBtw)}</Text>
            </View>
          </Pressable>
        ))}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const stijlen = StyleSheet.create({
  container: { flex: 1, backgroundColor: KLEUREN.background },
  inhoud: { padding: 16 },
  legeStaat: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    paddingTop: 80,
  },
  titel: { fontSize: 22, fontWeight: 'bold', color: KLEUREN.text, marginTop: 20 },
  tekst: {
    fontSize: 15,
    color: KLEUREN.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  nieuwKnop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: KLEUREN.primary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginTop: 24,
  },
  nieuwKnopTekst: { fontSize: 15, fontWeight: 'bold', color: KLEUREN.white },
  headerRij: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerTekst: { fontSize: 16, fontWeight: '700', color: KLEUREN.text },
  offerteKaart: {
    backgroundColor: KLEUREN.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#1B2631',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  kaartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  offerteNummer: {
    fontSize: 14,
    fontWeight: '700',
    color: KLEUREN.primary,
    fontFamily: 'SpaceMono',
  },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  statusTekst: { fontSize: 12, fontWeight: '600' },
  klantNaam: { fontSize: 16, fontWeight: '700', color: KLEUREN.text, marginBottom: 2 },
  klantAdres: { fontSize: 13, color: KLEUREN.textSecondary, marginBottom: 4 },
  werkbeschrijving: {
    fontSize: 13,
    color: KLEUREN.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  kaartFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: KLEUREN.border,
  },
  datumTekst: { fontSize: 12, color: KLEUREN.textSecondary },
  totaalBedrag: {
    fontSize: 18,
    fontWeight: 'bold',
    color: KLEUREN.primary,
    fontFamily: 'SpaceMono',
  },
});
