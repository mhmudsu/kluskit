import { StyleSheet, View, Text, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { KLEUREN } from '../constants/kleuren';
import { Afmetingen } from '../types';

interface Props {
  afmetingen: Afmetingen;
  onWijzig: (veld: 'lengte' | 'breedte' | 'hoogte', waarde: number) => void;
}

interface DimensieVeld {
  veld: keyof Afmetingen;
  label: string;
  icoon: string;
  beschrijving: string;
}

const VELDEN: DimensieVeld[] = [
  { veld: 'lengte', label: 'Lengte', icoon: 'arrow-left-right', beschrijving: 'in meters' },
  { veld: 'breedte', label: 'Breedte', icoon: 'arrow-up-down', beschrijving: 'in meters' },
  { veld: 'hoogte', label: 'Hoogte', icoon: 'arrow-collapse-up', beschrijving: 'in meters' },
];

export default function AfmetingenInput({ afmetingen, onWijzig }: Props) {
  const oppervlak = afmetingen.lengte * afmetingen.breedte;
  const volume = afmetingen.lengte * afmetingen.breedte * afmetingen.hoogte;

  return (
    <View>
      <Text style={stijlen.label}>Afmetingen (in meters) *</Text>
      <View style={stijlen.velden}>
        {VELDEN.map(({ veld, label, icoon, beschrijving }) => (
          <View key={veld} style={stijlen.veldContainer}>
            <View style={stijlen.veldHeader}>
              <MaterialCommunityIcons name={icoon as any} size={16} color={KLEUREN.primary} />
              <Text style={stijlen.veldLabel}>{label}</Text>
            </View>
            <View style={stijlen.invoerWrapper}>
              <TextInput
                style={stijlen.invoer}
                value={afmetingen[veld] > 0 ? afmetingen[veld].toString() : ''}
                onChangeText={(v) => {
                  const getal = parseFloat(v.replace(',', '.'));
                  onWijzig(veld, isNaN(getal) ? 0 : getal);
                }}
                placeholder="0"
                placeholderTextColor={KLEUREN.textSecondary}
                keyboardType="decimal-pad"
              />
              <Text style={stijlen.eenheid}>m</Text>
            </View>
            <Text style={stijlen.veldBeschrijving}>{beschrijving}</Text>
          </View>
        ))}
      </View>

      {/* Berekend oppervlak */}
      {oppervlak > 0 && (
        <View style={stijlen.berekeningBalk}>
          <View style={stijlen.berekeningItem}>
            <Text style={stijlen.berekeningLabel}>Oppervlak</Text>
            <Text style={stijlen.berekeningWaarde}>
              {oppervlak.toFixed(1)} m²
            </Text>
          </View>
          {volume > 0 && (
            <View style={stijlen.berekeningItem}>
              <Text style={stijlen.berekeningLabel}>Volume</Text>
              <Text style={stijlen.berekeningWaarde}>
                {volume.toFixed(1)} m³
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const stijlen = StyleSheet.create({
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: KLEUREN.text,
    marginBottom: 12,
  },
  velden: {
    flexDirection: 'row',
    gap: 10,
  },
  veldContainer: {
    flex: 1,
  },
  veldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  veldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: KLEUREN.textSecondary,
  },
  invoerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: KLEUREN.white,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: KLEUREN.border,
    paddingRight: 10,
  },
  invoer: {
    flex: 1,
    padding: 12,
    fontSize: 20,
    fontWeight: 'bold',
    color: KLEUREN.text,
    fontFamily: 'SpaceMono',
  },
  eenheid: {
    fontSize: 14,
    color: KLEUREN.textSecondary,
    fontWeight: '600',
  },
  veldBeschrijving: {
    fontSize: 10,
    color: KLEUREN.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  berekeningBalk: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    gap: 20,
  },
  berekeningItem: {
    flex: 1,
  },
  berekeningLabel: {
    fontSize: 11,
    color: KLEUREN.textSecondary,
    fontWeight: '500',
  },
  berekeningWaarde: {
    fontSize: 16,
    fontWeight: 'bold',
    color: KLEUREN.primary,
    marginTop: 2,
  },
});
