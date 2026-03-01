import { StyleSheet, View, Text, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { KLEUREN } from '../constants/kleuren';
import { ONDERGRONDEN, RUIMTE_TYPES, KWALITEIT_NIVEAUS } from '../constants/klusTypes';
import { Ondergrond, RuimteType, Kwaliteit } from '../types';

interface Props {
  geselecteerdeOndergrond: Ondergrond | null;
  geselecteerdeRuimte: RuimteType;
  geselecteerdeKwaliteit: Kwaliteit;
  onSelecteerOndergrond: (ondergrond: Ondergrond) => void;
  onSelecteerRuimte: (ruimte: RuimteType) => void;
  onSelecteerKwaliteit: (kwaliteit: Kwaliteit) => void;
}

export default function OndergrondSelector({
  geselecteerdeOndergrond,
  geselecteerdeRuimte,
  geselecteerdeKwaliteit,
  onSelecteerOndergrond,
  onSelecteerRuimte,
  onSelecteerKwaliteit,
}: Props) {
  const geselecteerdeOndergrondInfo = ONDERGRONDEN.find((o) => o.id === geselecteerdeOndergrond);

  return (
    <View>
      {/* Ondergrond type */}
      <Text style={stijlen.label}>Type ondergrond *</Text>
      <View style={stijlen.opties}>
        {ONDERGRONDEN.map((ondergrond) => {
          const isActief = geselecteerdeOndergrond === ondergrond.id;
          return (
            <Pressable
              key={ondergrond.id}
              style={[stijlen.optie, isActief && stijlen.optieActief]}
              onPress={() => onSelecteerOndergrond(ondergrond.id)}
            >
              <MaterialCommunityIcons
                name={isActief ? 'radiobox-marked' : 'radiobox-blank'}
                size={20}
                color={isActief ? KLEUREN.primary : KLEUREN.textSecondary}
              />
              <Text style={[stijlen.optieTekst, isActief && stijlen.optieTekstActief]}>
                {ondergrond.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Waarschuwing voor ondergrond */}
      {geselecteerdeOndergrondInfo?.waarschuwing && (
        <View style={stijlen.waarschuwingBalk}>
          <MaterialCommunityIcons name="alert-outline" size={18} color={KLEUREN.warning} />
          <Text style={stijlen.waarschuwingTekst}>{geselecteerdeOndergrondInfo.waarschuwing}</Text>
        </View>
      )}

      {/* Ruimte type */}
      <Text style={[stijlen.label, { marginTop: 20 }]}>Type ruimte *</Text>
      <View style={stijlen.ruimteRij}>
        {RUIMTE_TYPES.map((ruimte) => {
          const isActief = geselecteerdeRuimte === ruimte.id;
          return (
            <Pressable
              key={ruimte.id}
              style={[stijlen.ruimteKnop, isActief && stijlen.ruimteKnopActief]}
              onPress={() => onSelecteerRuimte(ruimte.id)}
            >
              <MaterialCommunityIcons
                name={
                  ruimte.id === 'droog'
                    ? 'home-variant'
                    : ruimte.id === 'vochtig'
                    ? 'shower'
                    : 'weather-sunny'
                }
                size={18}
                color={isActief ? KLEUREN.white : KLEUREN.textSecondary}
              />
              <Text style={[stijlen.ruimteTekst, isActief && stijlen.ruimteTekstActief]}>
                {ruimte.id === 'droog' ? 'Droog' : ruimte.id === 'vochtig' ? 'Vochtig' : 'Buiten'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Kwaliteitsniveau */}
      <Text style={[stijlen.label, { marginTop: 20 }]}>Kwaliteitsniveau *</Text>
      <View style={stijlen.kwaliteitRij}>
        {KWALITEIT_NIVEAUS.map((kwaliteit) => {
          const isActief = geselecteerdeKwaliteit === kwaliteit.id;
          return (
            <Pressable
              key={kwaliteit.id}
              style={[stijlen.kwaliteitKnop, isActief && stijlen.kwaliteitKnopActief]}
              onPress={() => onSelecteerKwaliteit(kwaliteit.id)}
            >
              <Text style={[stijlen.kwaliteitTitel, isActief && stijlen.kwaliteitTitelActief]}>
                {kwaliteit.label}
              </Text>
              <Text
                style={[stijlen.kwaliteitBeschrijving, isActief && stijlen.kwaliteitBeschrijvingActief]}
              >
                {kwaliteit.beschrijving}
              </Text>
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
  opties: {
    gap: 8,
  },
  optie: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: KLEUREN.white,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1.5,
    borderColor: KLEUREN.border,
    gap: 10,
  },
  optieActief: {
    borderColor: KLEUREN.primary,
    backgroundColor: '#FFF3E0',
  },
  optieTekst: {
    fontSize: 15,
    color: KLEUREN.text,
    fontWeight: '500',
  },
  optieTekstActief: {
    color: KLEUREN.primary,
    fontWeight: '700',
  },
  waarschuwingBalk: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF8E1',
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
    gap: 8,
    borderLeftWidth: 4,
    borderLeftColor: KLEUREN.warning,
  },
  waarschuwingTekst: {
    flex: 1,
    fontSize: 13,
    color: '#7B4F00',
    lineHeight: 18,
  },
  ruimteRij: {
    flexDirection: 'row',
    gap: 8,
  },
  ruimteKnop: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    padding: 12,
    backgroundColor: KLEUREN.white,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: KLEUREN.border,
    gap: 6,
  },
  ruimteKnopActief: {
    backgroundColor: KLEUREN.primary,
    borderColor: KLEUREN.primary,
  },
  ruimteTekst: {
    fontSize: 11,
    color: KLEUREN.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  ruimteTekstActief: {
    color: KLEUREN.white,
  },
  kwaliteitRij: {
    flexDirection: 'row',
    gap: 8,
  },
  kwaliteitKnop: {
    flex: 1,
    padding: 12,
    backgroundColor: KLEUREN.white,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: KLEUREN.border,
    alignItems: 'center',
  },
  kwaliteitKnopActief: {
    backgroundColor: KLEUREN.secondary,
    borderColor: KLEUREN.secondary,
  },
  kwaliteitTitel: {
    fontSize: 13,
    fontWeight: '700',
    color: KLEUREN.text,
    marginBottom: 4,
  },
  kwaliteitTitelActief: {
    color: KLEUREN.white,
  },
  kwaliteitBeschrijving: {
    fontSize: 10,
    color: KLEUREN.textSecondary,
    textAlign: 'center',
    lineHeight: 13,
  },
  kwaliteitBeschrijvingActief: {
    color: 'rgba(255,255,255,0.75)',
  },
});
