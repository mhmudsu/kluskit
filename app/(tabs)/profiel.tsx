import { StyleSheet, View, Text, ScrollView, TextInput, Pressable, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { KLEUREN } from '../../constants/kleuren';
import { useUserStore } from '../../stores/userStore';

export default function ProfielScherm() {
  const { profiel, setProfiel } = useUserStore();

  const heeftVoorwaarden = Boolean(profiel.algVoorwaarden?.trim());

  function slaOp() {
    Alert.alert('Opgeslagen', 'Je profiel is bijgewerkt.');
  }

  return (
    <ScrollView style={stijlen.container} contentContainerStyle={stijlen.inhoud}>
      {/* Avatar sectie */}
      <View style={stijlen.avatarSectie}>
        <View style={stijlen.avatar}>
          <MaterialCommunityIcons name="account-hard-hat" size={48} color={KLEUREN.white} />
        </View>
        <Text style={stijlen.bedrijfsnaam}>
          {profiel.bedrijfsnaam || 'Jouw Bedrijf'}
        </Text>
        <Text style={stijlen.zzpLabel}>ZZP Klusser</Text>
      </View>

      {/* Waarschuwing: geen algemene voorwaarden */}
      {!heeftVoorwaarden && (
        <View style={stijlen.waarschuwingBalk}>
          <MaterialCommunityIcons name="alert" size={20} color={KLEUREN.error} />
          <Text style={stijlen.waarschuwingTekst}>
            Voeg je algemene voorwaarden toe. Een link is{' '}
            <Text style={stijlen.waarschuwingVet}>NIET</Text> voldoende — stuur ze altijd
            mee als bijlage bij je offerte.
          </Text>
        </View>
      )}

      {/* Bedrijfsgegevens */}
      <View style={stijlen.sectie}>
        <Text style={stijlen.sectieKop}>Bedrijfsgegevens</Text>

        <View style={stijlen.invoerGroep}>
          <Text style={stijlen.invoerLabel}>Naam</Text>
          <TextInput
            style={stijlen.invoer}
            value={profiel.naam}
            onChangeText={(v) => setProfiel({ naam: v })}
            placeholder="Je volledige naam"
            placeholderTextColor={KLEUREN.textSecondary}
          />
        </View>

        <View style={stijlen.invoerGroep}>
          <Text style={stijlen.invoerLabel}>Bedrijfsnaam</Text>
          <TextInput
            style={stijlen.invoer}
            value={profiel.bedrijfsnaam}
            onChangeText={(v) => setProfiel({ bedrijfsnaam: v })}
            placeholder="Jouw Klusbedrijf"
            placeholderTextColor={KLEUREN.textSecondary}
          />
        </View>

        <View style={stijlen.invoerGroep}>
          <Text style={stijlen.invoerLabel}>KvK-nummer</Text>
          <TextInput
            style={stijlen.invoer}
            value={profiel.kvkNummer}
            onChangeText={(v) => setProfiel({ kvkNummer: v })}
            placeholder="12345678"
            placeholderTextColor={KLEUREN.textSecondary}
            keyboardType="numeric"
          />
        </View>

        <View style={stijlen.invoerGroep}>
          <Text style={stijlen.invoerLabel}>BTW-nummer</Text>
          <TextInput
            style={stijlen.invoer}
            value={profiel.btwNummer}
            onChangeText={(v) => setProfiel({ btwNummer: v })}
            placeholder="NL000000000B01"
            placeholderTextColor={KLEUREN.textSecondary}
          />
        </View>

        <View style={stijlen.invoerGroep}>
          <Text style={stijlen.invoerLabel}>Telefoon</Text>
          <TextInput
            style={stijlen.invoer}
            value={profiel.telefoon}
            onChangeText={(v) => setProfiel({ telefoon: v })}
            placeholder="06-12345678"
            placeholderTextColor={KLEUREN.textSecondary}
            keyboardType="phone-pad"
          />
        </View>

        <View style={stijlen.invoerGroep}>
          <Text style={stijlen.invoerLabel}>Adres</Text>
          <TextInput
            style={stijlen.invoer}
            value={profiel.adres}
            onChangeText={(v) => setProfiel({ adres: v })}
            placeholder="Straatnaam 1, 1234 AB Stad"
            placeholderTextColor={KLEUREN.textSecondary}
          />
        </View>
      </View>

      {/* Uurtarief */}
      <View style={stijlen.sectie}>
        <Text style={stijlen.sectieKop}>Uurtarief</Text>
        <View style={stijlen.tariefKaart}>
          <MaterialCommunityIcons name="currency-eur" size={28} color={KLEUREN.primary} />
          <View style={stijlen.tariefInfo}>
            <Text style={stijlen.tariefLabel}>Uurtarief excl. BTW</Text>
            <View style={stijlen.tariefInvoerRij}>
              <Text style={stijlen.eurTeken}>€</Text>
              <TextInput
                style={stijlen.tariefInvoer}
                value={profiel.uurtarief.toString()}
                onChangeText={(v) => {
                  const num = parseFloat(v);
                  if (!isNaN(num)) setProfiel({ uurtarief: num });
                }}
                keyboardType="decimal-pad"
              />
              <Text style={stijlen.perUurTekst}>per uur</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Betalingsvoorwaarden */}
      <View style={stijlen.sectie}>
        <Text style={stijlen.sectieKop}>Betalingsvoorwaarden</Text>
        <Text style={stijlen.sectionHint}>
          Wordt automatisch opgenomen in elke offerte.
        </Text>
        <TextInput
          style={[stijlen.invoer, stijlen.invoerMultiline]}
          value={profiel.betalingsvoorwaarden ?? ''}
          onChangeText={(v) => setProfiel({ betalingsvoorwaarden: v })}
          placeholder="Betaling binnen 14 dagen na factuurdatum."
          placeholderTextColor={KLEUREN.textSecondary}
          multiline
          numberOfLines={2}
          textAlignVertical="top"
        />
      </View>

      {/* Algemene Voorwaarden */}
      <View style={stijlen.sectie}>
        <View style={stijlen.sectieHeaderRij}>
          <Text style={stijlen.sectieKop}>Algemene Voorwaarden</Text>
          {heeftVoorwaarden ? (
            <View style={stijlen.statusBadgeGroen}>
              <MaterialCommunityIcons name="check-circle" size={14} color={KLEUREN.success} />
              <Text style={stijlen.statusBadgeGroenTekst}>Ingesteld</Text>
            </View>
          ) : (
            <View style={stijlen.statusBadgeRood}>
              <MaterialCommunityIcons name="alert-circle" size={14} color={KLEUREN.error} />
              <Text style={stijlen.statusBadgeRoodTekst}>Ontbreekt</Text>
            </View>
          )}
        </View>

        <Text style={stijlen.sectionHint}>
          Plak hier de volledige tekst van je algemene voorwaarden. Deze worden als bijlage
          toegevoegd aan elke gedeelde offerte-PDF.
        </Text>

        {!heeftVoorwaarden && (
          <View style={stijlen.voorwaardenWaarschuwing}>
            <MaterialCommunityIcons name="alert-circle-outline" size={16} color={KLEUREN.error} />
            <Text style={stijlen.voorwaardenWaarschuwingTekst}>
              Zonder algemene voorwaarden kun je geen offerte als PDF delen.
            </Text>
          </View>
        )}

        <TextInput
          style={[stijlen.invoer, stijlen.invoerVoorwaarden, !heeftVoorwaarden && stijlen.invoerFout]}
          value={profiel.algVoorwaarden ?? ''}
          onChangeText={(v) => setProfiel({ algVoorwaarden: v })}
          placeholder={
            'Artikel 1 - Toepasselijkheid\nDeze algemene voorwaarden zijn van toepassing op alle offertes en overeenkomsten...'
          }
          placeholderTextColor={KLEUREN.textSecondary}
          multiline
          textAlignVertical="top"
        />

        {heeftVoorwaarden && (
          <View style={stijlen.tekenTeller}>
            <Text style={stijlen.tekenTellerTekst}>
              {profiel.algVoorwaarden?.length ?? 0} tekens
            </Text>
          </View>
        )}
      </View>

      {/* Opslaan knop */}
      <Pressable style={stijlen.opslaanKnop} onPress={slaOp}>
        <MaterialCommunityIcons name="content-save" size={22} color={KLEUREN.white} />
        <Text style={stijlen.opslaanKnopTekst}>Profiel Opslaan</Text>
      </Pressable>

      <View style={{ height: 32 }} />
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
  avatarSectie: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 8,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: KLEUREN.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bedrijfsnaam: {
    fontSize: 22,
    fontWeight: 'bold',
    color: KLEUREN.text,
    marginTop: 12,
  },
  zzpLabel: {
    fontSize: 14,
    color: KLEUREN.textSecondary,
    marginTop: 4,
  },

  // Waarschuwingsbalk (bovenaan als geen voorwaarden)
  waarschuwingBalk: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: KLEUREN.error,
  },
  waarschuwingTekst: {
    flex: 1,
    fontSize: 13,
    color: KLEUREN.error,
    lineHeight: 19,
  },
  waarschuwingVet: {
    fontWeight: '900',
  },

  sectie: {
    backgroundColor: KLEUREN.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: KLEUREN.border,
  },
  sectieKop: {
    fontSize: 16,
    fontWeight: '700',
    color: KLEUREN.text,
    marginBottom: 4,
  },
  sectieHeaderRij: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sectionHint: {
    fontSize: 12,
    color: KLEUREN.textSecondary,
    marginBottom: 12,
    lineHeight: 17,
  },
  statusBadgeGroen: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusBadgeGroenTekst: {
    fontSize: 11,
    fontWeight: '600',
    color: KLEUREN.success,
  },
  statusBadgeRood: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusBadgeRoodTekst: {
    fontSize: 11,
    fontWeight: '600',
    color: KLEUREN.error,
  },
  voorwaardenWaarschuwing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  voorwaardenWaarschuwingTekst: {
    flex: 1,
    fontSize: 12,
    color: KLEUREN.error,
    lineHeight: 17,
  },

  invoerGroep: {
    marginBottom: 12,
  },
  invoerLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: KLEUREN.textSecondary,
    marginBottom: 6,
  },
  invoer: {
    backgroundColor: KLEUREN.background,
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: KLEUREN.text,
    borderWidth: 1,
    borderColor: KLEUREN.border,
  },
  invoerMultiline: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  invoerVoorwaarden: {
    minHeight: 180,
    fontSize: 13,
    lineHeight: 20,
  },
  invoerFout: {
    borderColor: KLEUREN.error,
    borderWidth: 1.5,
  },
  tekenTeller: {
    alignItems: 'flex-end',
    marginTop: 6,
  },
  tekenTellerTekst: {
    fontSize: 11,
    color: KLEUREN.textSecondary,
  },

  tariefKaart: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: KLEUREN.border,
    backgroundColor: KLEUREN.background,
  },
  tariefInfo: {
    flex: 1,
    marginLeft: 12,
  },
  tariefLabel: {
    fontSize: 13,
    color: KLEUREN.textSecondary,
  },
  tariefInvoerRij: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  eurTeken: {
    fontSize: 22,
    fontWeight: 'bold',
    color: KLEUREN.primary,
    marginRight: 4,
  },
  tariefInvoer: {
    fontSize: 28,
    fontWeight: 'bold',
    color: KLEUREN.primary,
    minWidth: 80,
  },
  perUurTekst: {
    fontSize: 14,
    color: KLEUREN.textSecondary,
    marginLeft: 8,
    alignSelf: 'flex-end',
    marginBottom: 4,
  },

  opslaanKnop: {
    backgroundColor: KLEUREN.primary,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    elevation: 3,
  },
  opslaanKnopTekst: {
    fontSize: 17,
    fontWeight: 'bold',
    color: KLEUREN.white,
  },
});
