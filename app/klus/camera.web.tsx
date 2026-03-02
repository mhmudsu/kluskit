import { StyleSheet, View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { KLEUREN } from '../../constants/kleuren';

export default function CameraSchermWeb() {
  return (
    <View style={stijlen.container}>
      <View style={stijlen.kaart}>
        <MaterialCommunityIcons name="cellphone" size={64} color={KLEUREN.primary} />
        <Text style={stijlen.titel}>Alleen beschikbaar in de app</Text>
        <Text style={stijlen.tekst}>
          De camera en foto-analyse functie werkt alleen in de KlusKit mobiele app.
          Download de app op je telefoon om ruimtes te scannen.
        </Text>
        <Pressable style={stijlen.knop} onPress={() => router.push('/klus/invoer')}>
          <MaterialCommunityIcons name="calculator-variant" size={20} color={KLEUREN.white} />
          <Text style={stijlen.knopTekst}>Handmatig invoeren</Text>
        </Pressable>
      </View>
    </View>
  );
}

const stijlen = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: KLEUREN.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  kaart: {
    backgroundColor: KLEUREN.white,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
    borderWidth: 1,
    borderColor: KLEUREN.border,
  },
  titel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: KLEUREN.text,
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  tekst: {
    fontSize: 15,
    color: KLEUREN.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  knop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: KLEUREN.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  knopTekst: {
    fontSize: 16,
    fontWeight: 'bold',
    color: KLEUREN.white,
  },
});
