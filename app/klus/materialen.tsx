import { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { KLEUREN } from '../../constants/kleuren';
import { useKlusStore } from '../../stores/klusStore';
import { useUserStore } from '../../stores/userStore';
import { formateerPrijs, formateerUren, formateerHoeveelheid } from '../../utils/formatters';
import { Materiaal, MateriaalCategorie } from '../../types';

const CATEGORIE_LABELS: Record<MateriaalCategorie, string> = {
  hoofdmateriaal: 'Hoofdmaterialen',
  hulpmateriaal: 'Hulpmaterialen',
  gereedschap: 'Gereedschap',
};

const CATEGORIE_ICONEN: Record<MateriaalCategorie, string> = {
  hoofdmateriaal: 'package-variant',
  hulpmateriaal: 'tools',
  gereedschap: 'wrench',
};

const LEEG_MATERIAAL: Partial<Materiaal> = {
  naam: '',
  specificatie: '',
  hoeveelheid: 0,
  eenheid: 'stuks',
  prijsPerEenheid: 0,
  totaalPrijs: 0,
  categorie: 'hoofdmateriaal',
  opmerking: '',
};

export default function MaterialenScherm() {
  const { materiaalResultaat, resetInvoer, verwijderMateriaal, bewerkMateriaal, voegMateriaalToe } =
    useKlusStore();
  const { profiel } = useUserStore();

  const [klusUurtarief, setKlusUurtarief] = useState(String(profiel.uurtarief));
  const [bewerkModal, setBewerkModal] = useState<{ zichtbaar: boolean; index: number | null }>({
    zichtbaar: false,
    index: null,
  });
  const [modalWaarden, setModalWaarden] = useState<Partial<Materiaal>>(LEEG_MATERIAAL);

  if (!materiaalResultaat) {
    return (
      <View style={stijlen.leegContainer}>
        <MaterialCommunityIcons name="alert-circle-outline" size={64} color={KLEUREN.border} />
        <Text style={stijlen.leegTekst}>Geen materialenlijst beschikbaar</Text>
        <Pressable style={stijlen.terugKnop} onPress={() => router.back()}>
          <Text style={stijlen.terugKnopTekst}>Terug naar invoer</Text>
        </Pressable>
      </View>
    );
  }

  const { materialen, totaalMateriaalkosten, geschatteArbeidstijd, tips, waarschuwingen } =
    materiaalResultaat;

  const uurtariefGetal = parseFloat(klusUurtarief) || 0;
  const arbeidskosten = geschatteArbeidstijd * uurtariefGetal;
  const subtotaal = totaalMateriaalkosten + arbeidskosten;
  const btwBedrag = subtotaal * 0.21;
  const totaalInclBtw = subtotaal + btwBedrag;

  const categorieën: MateriaalCategorie[] = ['hoofdmateriaal', 'hulpmateriaal', 'gereedschap'];
  const groepenPerCategorie = categorieën
    .map((cat) => ({
      categorie: cat,
      items: materialen
        .map((m, i) => ({ materiaal: m, globalIndex: i }))
        .filter(({ materiaal }) => materiaal.categorie === cat),
    }))
    .filter((g) => g.items.length > 0);

  function openBewerkModal(index: number) {
    setModalWaarden({ ...materialen[index] });
    setBewerkModal({ zichtbaar: true, index });
  }

  function openToevoegModal() {
    setModalWaarden({ ...LEEG_MATERIAAL });
    setBewerkModal({ zichtbaar: true, index: null });
  }

  function sluitModal() {
    setBewerkModal({ zichtbaar: false, index: null });
    setModalWaarden(LEEG_MATERIAAL);
  }

  function slaModalOp() {
    const hoeveelheid = parseFloat(String(modalWaarden.hoeveelheid)) || 0;
    const prijs = parseFloat(String(modalWaarden.prijsPerEenheid)) || 0;
    const materiaal: Materiaal = {
      naam: modalWaarden.naam || '',
      specificatie: modalWaarden.specificatie || '',
      hoeveelheid,
      eenheid: modalWaarden.eenheid || 'stuks',
      prijsPerEenheid: prijs,
      totaalPrijs: hoeveelheid * prijs,
      categorie: modalWaarden.categorie || 'hoofdmateriaal',
      opmerking: modalWaarden.opmerking || undefined,
    };

    if (bewerkModal.index !== null) {
      bewerkMateriaal(bewerkModal.index, materiaal);
    } else {
      voegMateriaalToe(materiaal);
    }
    sluitModal();
  }

  function bevestigVerwijder(index: number, naam: string) {
    Alert.alert(
      'Verwijderen?',
      `Wil je "${naam}" verwijderen uit de materialenlijst?`,
      [
        { text: 'Annuleer', style: 'cancel' },
        {
          text: 'Verwijder',
          style: 'destructive',
          onPress: () => verwijderMateriaal(index),
        },
      ]
    );
  }

  return (
    <View style={stijlen.container}>
      <ScrollView contentContainerStyle={stijlen.inhoud}>
        {/* Samenvatting balk */}
        <View style={stijlen.samenvattingKaart}>
          <View style={stijlen.samenvattingItem}>
            <Text style={stijlen.samenvattingLabel}>Totaal materialen</Text>
            <Text style={stijlen.samenvattingWaarde}>
              {formateerPrijs(totaalMateriaalkosten)}
            </Text>
          </View>
          <View style={stijlen.samenvattingDivider} />
          <View style={stijlen.samenvattingItem}>
            <Text style={stijlen.samenvattingLabel}>Geschatte arbeidstijd</Text>
            <Text style={stijlen.samenvattingWaarde}>
              {formateerUren(geschatteArbeidstijd)}
            </Text>
          </View>
          <View style={stijlen.samenvattingDivider} />
          <View style={stijlen.samenvattingItem}>
            <Text style={stijlen.samenvattingLabel}>Aantal materialen</Text>
            <Text style={stijlen.samenvattingWaarde}>{materialen.length} items</Text>
          </View>
        </View>

        {/* Waarschuwingen */}
        {waarschuwingen.length > 0 && (
          <View style={stijlen.sectie}>
            <Text style={stijlen.sectieKop}>
              <MaterialCommunityIcons name="alert" size={16} color={KLEUREN.warning} />
              {' '}Waarschuwingen
            </Text>
            {waarschuwingen.map((w, i) => (
              <View key={i} style={stijlen.waarschuwingItem}>
                <MaterialCommunityIcons name="alert-circle-outline" size={16} color={KLEUREN.warning} />
                <Text style={stijlen.waarschuwingTekst}>{w}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Materialen per categorie */}
        {groepenPerCategorie.map(({ categorie, items }) => (
          <View key={categorie} style={stijlen.sectie}>
            <View style={stijlen.sectieHeader}>
              <MaterialCommunityIcons
                name={CATEGORIE_ICONEN[categorie] as any}
                size={20}
                color={KLEUREN.primary}
              />
              <Text style={stijlen.sectieKop}>{CATEGORIE_LABELS[categorie]}</Text>
              <Text style={stijlen.sectieAantal}>{items.length} items</Text>
            </View>

            {items.map(({ materiaal, globalIndex }) => (
              <View
                key={globalIndex}
                style={[stijlen.materiaalRij, globalIndex > 0 && stijlen.materiaalRijRand]}
              >
                <View style={stijlen.materiaalInfo}>
                  <Text style={stijlen.materiaalNaam}>{materiaal.naam}</Text>
                  <Text style={stijlen.materiaalSpec}>{materiaal.specificatie}</Text>
                  {materiaal.opmerking ? (
                    <Text style={stijlen.materiaalOpmerking}>{materiaal.opmerking}</Text>
                  ) : null}
                </View>
                <View style={stijlen.materiaalPrijzen}>
                  <Text style={stijlen.materiaalHoeveelheid}>
                    {formateerHoeveelheid(materiaal.hoeveelheid, materiaal.eenheid)}
                  </Text>
                  <Text style={stijlen.materiaalPrijsPerEenheid}>
                    {formateerPrijs(materiaal.prijsPerEenheid)}/{materiaal.eenheid}
                  </Text>
                  <Text style={stijlen.materiaalTotaal}>
                    {formateerPrijs(materiaal.totaalPrijs)}
                  </Text>
                </View>
                <View style={stijlen.materiaalActies}>
                  <Pressable
                    style={stijlen.actieIconKnop}
                    onPress={() => openBewerkModal(globalIndex)}
                  >
                    <MaterialCommunityIcons name="pencil" size={18} color={KLEUREN.primary} />
                  </Pressable>
                  <Pressable
                    style={stijlen.actieIconKnop}
                    onPress={() => bevestigVerwijder(globalIndex, materiaal.naam)}
                  >
                    <MaterialCommunityIcons name="trash-can-outline" size={18} color={KLEUREN.error} />
                  </Pressable>
                </View>
              </View>
            ))}

            {/* Subtotaal */}
            <View style={stijlen.subtotaalRij}>
              <Text style={stijlen.subtotaalLabel}>Subtotaal {CATEGORIE_LABELS[categorie]}</Text>
              <Text style={stijlen.subtotaalWaarde}>
                {formateerPrijs(items.reduce((som, { materiaal }) => som + materiaal.totaalPrijs, 0))}
              </Text>
            </View>
          </View>
        ))}

        {/* Tips */}
        {tips.length > 0 && (
          <View style={stijlen.sectie}>
            <View style={stijlen.sectieHeader}>
              <MaterialCommunityIcons name="lightbulb-on" size={20} color={KLEUREN.success} />
              <Text style={stijlen.sectieKop}>Vakman Tips</Text>
            </View>
            {tips.map((tip, i) => (
              <View key={i} style={stijlen.tipItem}>
                <MaterialCommunityIcons name="check-circle" size={16} color={KLEUREN.success} />
                <Text style={stijlen.tipTekst}>{tip}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Materiaal toevoegen knop */}
        <Pressable style={stijlen.toevoegKnop} onPress={openToevoegModal}>
          <MaterialCommunityIcons name="plus-circle-outline" size={20} color={KLEUREN.primary} />
          <Text style={stijlen.toevoegKnopTekst}>Materiaal toevoegen</Text>
        </Pressable>

        {/* Kostenoverzicht */}
        <View style={stijlen.sectie}>
          <View style={stijlen.sectieHeader}>
            <MaterialCommunityIcons name="calculator" size={20} color={KLEUREN.primary} />
            <Text style={stijlen.sectieKop}>Kostenoverzicht</Text>
          </View>

          {/* Uurtarief invoer */}
          <View style={stijlen.uurtariefRij}>
            <Text style={stijlen.uurtariefLabel}>Uurtarief</Text>
            <View style={stijlen.uurtariefInvoer}>
              <Text style={stijlen.uurtariefPrefix}>€</Text>
              <TextInput
                style={stijlen.uurtariefInput}
                value={klusUurtarief}
                onChangeText={setKlusUurtarief}
                keyboardType="decimal-pad"
                selectTextOnFocus
              />
              <Text style={stijlen.uurtariefSuffix}>/uur</Text>
            </View>
          </View>

          <View style={stijlen.kostenDivider} />

          {/* Regels */}
          <View style={stijlen.kostenRij}>
            <Text style={stijlen.kostenLabel}>Materiaalkosten</Text>
            <Text style={stijlen.kostenWaarde}>{formateerPrijs(totaalMateriaalkosten)}</Text>
          </View>

          <View style={stijlen.kostenRij}>
            <Text style={stijlen.kostenLabel}>
              Arbeid: {geschatteArbeidstijd} uur × {formateerPrijs(uurtariefGetal)}/uur
            </Text>
            <Text style={stijlen.kostenWaarde}>{formateerPrijs(arbeidskosten)}</Text>
          </View>

          <View style={stijlen.kostenDivider} />

          <View style={stijlen.kostenRij}>
            <Text style={stijlen.kostenLabelBold}>Subtotaal excl. BTW</Text>
            <Text style={stijlen.kostenWaardeBold}>{formateerPrijs(subtotaal)}</Text>
          </View>

          <View style={stijlen.kostenRij}>
            <Text style={stijlen.kostenLabel}>BTW 21%</Text>
            <Text style={stijlen.kostenWaarde}>{formateerPrijs(btwBedrag)}</Text>
          </View>

          <View style={stijlen.kostenDivider} />

          <View style={stijlen.totaalInclBtwRij}>
            <Text style={stijlen.totaalInclBtwLabel}>TOTAAL incl. BTW</Text>
            <Text style={stijlen.totaalInclBtwWaarde}>{formateerPrijs(totaalInclBtw)}</Text>
          </View>
        </View>

        {/* Acties */}
        <View style={stijlen.actieRij}>
          <Pressable
            style={stijlen.actieKnopSecundair}
            onPress={() => {
              resetInvoer();
              router.push('/klus/invoer');
            }}
          >
            <MaterialCommunityIcons name="plus" size={20} color={KLEUREN.primary} />
            <Text style={stijlen.actieKnopSecundairTekst}>Nieuwe klus</Text>
          </Pressable>

          <Pressable
            style={stijlen.actieKnopPrimair}
            onPress={() => router.push('/klus/offerte')}
          >
            <MaterialCommunityIcons name="file-document-edit" size={20} color={KLEUREN.white} />
            <Text style={stijlen.actieKnopPrimairTekst}>Maak offerte</Text>
          </Pressable>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Bewerk/Toevoeg Modal */}
      <Modal
        visible={bewerkModal.zichtbaar}
        animationType="slide"
        transparent
        onRequestClose={sluitModal}
      >
        <KeyboardAvoidingView
          style={stijlen.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={stijlen.modalContainer}>
            <View style={stijlen.modalHeader}>
              <Text style={stijlen.modalTitel}>
                {bewerkModal.index !== null ? 'Materiaal bewerken' : 'Materiaal toevoegen'}
              </Text>
              <Pressable onPress={sluitModal}>
                <MaterialCommunityIcons name="close" size={24} color={KLEUREN.text} />
              </Pressable>
            </View>

            <ScrollView style={stijlen.modalInhoud} showsVerticalScrollIndicator={false}>
              {/* Naam */}
              <Text style={stijlen.inputLabel}>Naam</Text>
              <TextInput
                style={stijlen.textInput}
                value={modalWaarden.naam}
                onChangeText={(v) => setModalWaarden((p) => ({ ...p, naam: v }))}
                placeholder="bijv. Tegellijm C2TE"
                placeholderTextColor={KLEUREN.textSecondary}
              />

              {/* Specificatie */}
              <Text style={stijlen.inputLabel}>Specificatie</Text>
              <TextInput
                style={stijlen.textInput}
                value={modalWaarden.specificatie}
                onChangeText={(v) => setModalWaarden((p) => ({ ...p, specificatie: v }))}
                placeholder="bijv. Weber Flex, 25kg zak"
                placeholderTextColor={KLEUREN.textSecondary}
              />

              {/* Hoeveelheid + Eenheid */}
              <View style={stijlen.tweeKolommen}>
                <View style={{ flex: 1 }}>
                  <Text style={stijlen.inputLabel}>Hoeveelheid</Text>
                  <TextInput
                    style={stijlen.textInput}
                    value={String(modalWaarden.hoeveelheid || '')}
                    onChangeText={(v) =>
                      setModalWaarden((p) => ({ ...p, hoeveelheid: parseFloat(v) || 0 }))
                    }
                    keyboardType="decimal-pad"
                    placeholder="0"
                    placeholderTextColor={KLEUREN.textSecondary}
                  />
                </View>
                <View style={{ width: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={stijlen.inputLabel}>Eenheid</Text>
                  <TextInput
                    style={stijlen.textInput}
                    value={modalWaarden.eenheid}
                    onChangeText={(v) => setModalWaarden((p) => ({ ...p, eenheid: v }))}
                    placeholder="m², kg, stuks"
                    placeholderTextColor={KLEUREN.textSecondary}
                  />
                </View>
              </View>

              {/* Prijs per eenheid */}
              <Text style={stijlen.inputLabel}>Prijs per eenheid (€)</Text>
              <TextInput
                style={stijlen.textInput}
                value={String(modalWaarden.prijsPerEenheid || '')}
                onChangeText={(v) =>
                  setModalWaarden((p) => ({ ...p, prijsPerEenheid: parseFloat(v) || 0 }))
                }
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={KLEUREN.textSecondary}
              />

              {/* Berekend totaal preview */}
              <View style={stijlen.totaalPreview}>
                <Text style={stijlen.totaalPreviewLabel}>Totaalprijs:</Text>
                <Text style={stijlen.totaalPreviewWaarde}>
                  {formateerPrijs(
                    (parseFloat(String(modalWaarden.hoeveelheid)) || 0) *
                    (parseFloat(String(modalWaarden.prijsPerEenheid)) || 0)
                  )}
                </Text>
              </View>

              {/* Categorie knoppen */}
              <Text style={stijlen.inputLabel}>Categorie</Text>
              <View style={stijlen.categorieKnoppen}>
                {(['hoofdmateriaal', 'hulpmateriaal', 'gereedschap'] as MateriaalCategorie[]).map(
                  (cat) => (
                    <Pressable
                      key={cat}
                      style={[
                        stijlen.categorieKnop,
                        modalWaarden.categorie === cat && stijlen.categorieKnopActief,
                      ]}
                      onPress={() => setModalWaarden((p) => ({ ...p, categorie: cat }))}
                    >
                      <Text
                        style={[
                          stijlen.categorieKnopTekst,
                          modalWaarden.categorie === cat && stijlen.categorieKnopTekstActief,
                        ]}
                      >
                        {CATEGORIE_LABELS[cat]}
                      </Text>
                    </Pressable>
                  )
                )}
              </View>

              {/* Opmerking */}
              <Text style={stijlen.inputLabel}>Opmerking (optioneel)</Text>
              <TextInput
                style={[stijlen.textInput, stijlen.textInputMultiline]}
                value={modalWaarden.opmerking}
                onChangeText={(v) => setModalWaarden((p) => ({ ...p, opmerking: v }))}
                placeholder="Extra toelichting..."
                placeholderTextColor={KLEUREN.textSecondary}
                multiline
                numberOfLines={2}
              />

              <View style={{ height: 16 }} />
            </ScrollView>

            {/* Modal acties */}
            <View style={stijlen.modalActies}>
              <Pressable style={stijlen.modalAnnuleer} onPress={sluitModal}>
                <Text style={stijlen.modalAnnuleerTekst}>Annuleer</Text>
              </Pressable>
              <Pressable style={stijlen.modalOpslaan} onPress={slaModalOp}>
                <Text style={stijlen.modalOpslaanTekst}>Opslaan</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const stijlen = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: KLEUREN.background,
  },
  inhoud: {
    padding: 16,
  },
  leegContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: KLEUREN.background,
  },
  leegTekst: {
    fontSize: 17,
    color: KLEUREN.textSecondary,
    marginTop: 16,
  },
  terugKnop: {
    marginTop: 20,
    backgroundColor: KLEUREN.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  terugKnopTekst: {
    color: KLEUREN.white,
    fontWeight: 'bold',
    fontSize: 15,
  },
  samenvattingKaart: {
    backgroundColor: KLEUREN.secondary,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    marginBottom: 16,
  },
  samenvattingItem: {
    flex: 1,
    alignItems: 'center',
  },
  samenvattingLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  samenvattingWaarde: {
    fontSize: 16,
    fontWeight: 'bold',
    color: KLEUREN.white,
    marginTop: 4,
    textAlign: 'center',
  },
  samenvattingDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 4,
  },
  sectie: {
    backgroundColor: KLEUREN.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: KLEUREN.border,
  },
  sectieHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 8,
  },
  sectieKop: {
    fontSize: 15,
    fontWeight: '700',
    color: KLEUREN.text,
    flex: 1,
  },
  sectieAantal: {
    fontSize: 12,
    color: KLEUREN.textSecondary,
    backgroundColor: KLEUREN.background,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  materiaalRij: {
    flexDirection: 'row',
    paddingVertical: 12,
    alignItems: 'flex-start',
  },
  materiaalRijRand: {
    borderTopWidth: 1,
    borderTopColor: KLEUREN.border,
  },
  materiaalInfo: {
    flex: 1,
    marginRight: 8,
  },
  materiaalNaam: {
    fontSize: 14,
    fontWeight: '600',
    color: KLEUREN.text,
  },
  materiaalSpec: {
    fontSize: 12,
    color: KLEUREN.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  materiaalOpmerking: {
    fontSize: 11,
    color: KLEUREN.warning,
    marginTop: 4,
    fontStyle: 'italic',
  },
  materiaalPrijzen: {
    alignItems: 'flex-end',
    minWidth: 80,
    marginRight: 4,
  },
  materiaalHoeveelheid: {
    fontSize: 14,
    fontWeight: '700',
    color: KLEUREN.text,
    fontFamily: 'SpaceMono',
  },
  materiaalPrijsPerEenheid: {
    fontSize: 10,
    color: KLEUREN.textSecondary,
    marginTop: 2,
  },
  materiaalTotaal: {
    fontSize: 14,
    fontWeight: '700',
    color: KLEUREN.primary,
    marginTop: 4,
    fontFamily: 'SpaceMono',
  },
  materiaalActies: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  actieIconKnop: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: KLEUREN.background,
  },
  subtotaalRij: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginTop: 4,
    borderTopWidth: 1.5,
    borderTopColor: KLEUREN.border,
  },
  subtotaalLabel: {
    fontSize: 13,
    color: KLEUREN.textSecondary,
    fontWeight: '500',
  },
  subtotaalWaarde: {
    fontSize: 14,
    fontWeight: 'bold',
    color: KLEUREN.text,
    fontFamily: 'SpaceMono',
  },
  waarschuwingItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingVertical: 6,
  },
  waarschuwingTekst: {
    flex: 1,
    fontSize: 13,
    color: '#7B4F00',
    lineHeight: 18,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingVertical: 6,
  },
  tipTekst: {
    flex: 1,
    fontSize: 13,
    color: KLEUREN.text,
    lineHeight: 18,
  },
  toevoegKnop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: KLEUREN.primary,
    borderStyle: 'dashed',
    backgroundColor: KLEUREN.white,
  },
  toevoegKnopTekst: {
    fontSize: 15,
    fontWeight: '600',
    color: KLEUREN.primary,
  },
  // Kostenoverzicht
  uurtariefRij: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  uurtariefLabel: {
    fontSize: 14,
    color: KLEUREN.text,
    fontWeight: '500',
  },
  uurtariefInvoer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: KLEUREN.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: KLEUREN.background,
  },
  uurtariefPrefix: {
    fontSize: 15,
    color: KLEUREN.textSecondary,
    marginRight: 2,
  },
  uurtariefInput: {
    fontSize: 16,
    fontWeight: '700',
    color: KLEUREN.text,
    minWidth: 48,
    textAlign: 'right',
    fontFamily: 'SpaceMono',
    padding: 0,
  },
  uurtariefSuffix: {
    fontSize: 13,
    color: KLEUREN.textSecondary,
    marginLeft: 2,
  },
  kostenDivider: {
    height: 1,
    backgroundColor: KLEUREN.border,
    marginVertical: 8,
  },
  kostenRij: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  kostenLabel: {
    fontSize: 13,
    color: KLEUREN.textSecondary,
    flex: 1,
    marginRight: 8,
  },
  kostenWaarde: {
    fontSize: 14,
    color: KLEUREN.text,
    fontFamily: 'SpaceMono',
  },
  kostenLabelBold: {
    fontSize: 14,
    color: KLEUREN.text,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  kostenWaardeBold: {
    fontSize: 15,
    color: KLEUREN.text,
    fontWeight: '700',
    fontFamily: 'SpaceMono',
  },
  totaalInclBtwRij: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  totaalInclBtwLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: KLEUREN.text,
  },
  totaalInclBtwWaarde: {
    fontSize: 22,
    fontWeight: 'bold',
    color: KLEUREN.primary,
    fontFamily: 'SpaceMono',
  },
  actieRij: {
    flexDirection: 'row',
    gap: 12,
  },
  actieKnopSecundair: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: KLEUREN.primary,
    backgroundColor: KLEUREN.white,
  },
  actieKnopSecundairTekst: {
    fontSize: 15,
    fontWeight: 'bold',
    color: KLEUREN.primary,
  },
  actieKnopPrimair: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 14,
    backgroundColor: KLEUREN.secondary,
  },
  actieKnopPrimairTekst: {
    fontSize: 15,
    fontWeight: 'bold',
    color: KLEUREN.white,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: KLEUREN.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: KLEUREN.border,
  },
  modalTitel: {
    fontSize: 18,
    fontWeight: '700',
    color: KLEUREN.text,
  },
  modalInhoud: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: KLEUREN.textSecondary,
    marginBottom: 6,
    marginTop: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: KLEUREN.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: KLEUREN.text,
    backgroundColor: KLEUREN.background,
  },
  textInputMultiline: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  tweeKolommen: {
    flexDirection: 'row',
  },
  totaalPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: KLEUREN.background,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginTop: 8,
  },
  totaalPreviewLabel: {
    fontSize: 13,
    color: KLEUREN.textSecondary,
  },
  totaalPreviewWaarde: {
    fontSize: 16,
    fontWeight: '700',
    color: KLEUREN.primary,
    fontFamily: 'SpaceMono',
  },
  categorieKnoppen: {
    flexDirection: 'row',
    gap: 8,
  },
  categorieKnop: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: KLEUREN.border,
    alignItems: 'center',
    backgroundColor: KLEUREN.background,
  },
  categorieKnopActief: {
    borderColor: KLEUREN.primary,
    backgroundColor: KLEUREN.primary,
  },
  categorieKnopTekst: {
    fontSize: 11,
    fontWeight: '600',
    color: KLEUREN.textSecondary,
    textAlign: 'center',
  },
  categorieKnopTekstActief: {
    color: KLEUREN.white,
  },
  modalActies: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: KLEUREN.border,
  },
  modalAnnuleer: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: KLEUREN.border,
    alignItems: 'center',
  },
  modalAnnuleerTekst: {
    fontSize: 15,
    fontWeight: '600',
    color: KLEUREN.textSecondary,
  },
  modalOpslaan: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: KLEUREN.primary,
    alignItems: 'center',
  },
  modalOpslaanTekst: {
    fontSize: 15,
    fontWeight: 'bold',
    color: KLEUREN.white,
  },
});
