import { StyleSheet, View, Text, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { KLEUREN } from '../constants/kleuren';
import { KLUS_TYPES } from '../constants/klusTypes';
import { KlusType } from '../types';

interface Props {
  geselecteerd: KlusType | null;
  onSelecteer: (type: KlusType) => void;
}

export default function KlusTypeSelector({ geselecteerd, onSelecteer }: Props) {
  return (
    <View>
      <Text style={stijlen.label}>Kies het type klus *</Text>
      <View style={stijlen.raster}>
        {KLUS_TYPES.map((klus) => {
          const isActief = geselecteerd === klus.id;
          return (
            <Pressable
              key={klus.id}
              style={[
                stijlen.tegel,
                isActief && { borderColor: KLEUREN.primary, borderWidth: 2, backgroundColor: '#E8F8F0' },
              ]}
              onPress={() => onSelecteer(klus.id)}
            >
              <View
                style={[
                  stijlen.icoonWrapper,
                  { backgroundColor: isActief ? KLEUREN.primary : klus.kleur + '20' },
                ]}
              >
                <MaterialCommunityIcons
                  name={klus.icoon as any}
                  size={28}
                  color={isActief ? KLEUREN.white : klus.kleur}
                />
              </View>
              <Text style={[stijlen.klusNaam, isActief && { color: KLEUREN.primary }]}>
                {klus.label}
              </Text>
              <Text style={stijlen.klusBeschrijving}>{klus.beschrijving}</Text>
              {isActief && (
                <View style={stijlen.checkBadge}>
                  <MaterialCommunityIcons name="check-circle" size={18} color={KLEUREN.primary} />
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
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
  raster: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tegel: {
    width: '47%',
    backgroundColor: KLEUREN.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: KLEUREN.border,
    position: 'relative',
    shadowColor: '#1B2631',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  icoonWrapper: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  klusNaam: {
    fontSize: 13,
    fontWeight: '700',
    color: KLEUREN.text,
    marginBottom: 3,
  },
  klusBeschrijving: {
    fontSize: 11,
    color: KLEUREN.textSecondary,
    lineHeight: 15,
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});
