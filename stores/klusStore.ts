import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FotoAnalyseResultaat, KlusFoto, KlusInvoer, Materiaal, MaterialenResultaat, Offerte, Project, KlusType, Ondergrond } from '../types';

interface KlusState {
  // Huidige klus invoer
  huidigInvoer: KlusInvoer;
  // Resultaat van AI berekening
  materiaalResultaat: MaterialenResultaat | null;
  // Opgeslagen projecten
  projecten: Project[];
  // Laad- en foutstatus
  isLadenAI: boolean;
  foutmelding: string | null;

  // Acties
  setKlusType: (type: KlusType) => void;
  setAfmeting: (veld: 'lengte' | 'breedte' | 'hoogte', waarde: number) => void;
  setOndergrond: (ondergrond: Ondergrond) => void;
  setRuimteType: (ruimte: KlusInvoer['ruimteType']) => void;
  setKwaliteit: (kwaliteit: KlusInvoer['kwaliteit']) => void;
  setBijzonderheden: (tekst: string) => void;
  setMateriaalResultaat: (resultaat: MaterialenResultaat | null) => void;
  setIsLadenAI: (laden: boolean) => void;
  setFoutmelding: (fout: string | null) => void;
  resetInvoer: () => void;
  slaProjectOp: (project: Project) => void;
  verwijderMateriaal: (index: number) => void;
  bewerkMateriaal: (index: number, materiaal: Materiaal) => void;
  voegMateriaalToe: (materiaal: Materiaal) => void;
  // Offerte
  offertes: Offerte[];
  offerteConcept: Offerte | null;
  aantalOffertes: number;
  setOfferteConcept: (offerte: Offerte | null) => void;
  slaOfferteOp: (offerte: Offerte) => void;
  // Foto documentatie
  fotoDocumentatie: KlusFoto[];
  voegFotoToe: (foto: KlusFoto) => void;
  verwijderFoto: (id: string) => void;
  fotoAnalyseResultaat: FotoAnalyseResultaat | null;
  setFotoAnalyseResultaat: (resultaat: FotoAnalyseResultaat | null) => void;
  analyseeFotoUri: string | null;
  setAnalyseeFotoUri: (uri: string | null) => void;
}

const initieleInvoer: KlusInvoer = {
  klusType: null,
  afmetingen: { lengte: 0, breedte: 0, hoogte: 0 },
  ondergrond: null,
  ruimteType: 'droog',
  kwaliteit: 'standaard',
  bijzonderheden: '',
};

export const useKlusStore = create<KlusState>()(
  persist(
    (set) => ({
      huidigInvoer: initieleInvoer,
      materiaalResultaat: null,
      projecten: [],
      isLadenAI: false,
      foutmelding: null,
      offertes: [],
      offerteConcept: null,
      aantalOffertes: 0,
      fotoDocumentatie: [],
      fotoAnalyseResultaat: null,
      analyseeFotoUri: null,

      setKlusType: (type) =>
        set((state) => ({
          huidigInvoer: { ...state.huidigInvoer, klusType: type },
        })),

      setAfmeting: (veld, waarde) =>
        set((state) => ({
          huidigInvoer: {
            ...state.huidigInvoer,
            afmetingen: { ...state.huidigInvoer.afmetingen, [veld]: waarde },
          },
        })),

      setOndergrond: (ondergrond) =>
        set((state) => ({
          huidigInvoer: { ...state.huidigInvoer, ondergrond },
        })),

      setRuimteType: (ruimteType) =>
        set((state) => ({
          huidigInvoer: { ...state.huidigInvoer, ruimteType },
        })),

      setKwaliteit: (kwaliteit) =>
        set((state) => ({
          huidigInvoer: { ...state.huidigInvoer, kwaliteit },
        })),

      setBijzonderheden: (tekst) =>
        set((state) => ({
          huidigInvoer: { ...state.huidigInvoer, bijzonderheden: tekst },
        })),

      setMateriaalResultaat: (resultaat) => set({ materiaalResultaat: resultaat }),

      setIsLadenAI: (laden) => set({ isLadenAI: laden }),

      setFoutmelding: (fout) => set({ foutmelding: fout }),

      resetInvoer: () =>
        set({
          huidigInvoer: initieleInvoer,
          materiaalResultaat: null,
          foutmelding: null,
        }),

      slaProjectOp: (project) =>
        set((state) => ({
          projecten: [project, ...state.projecten],
        })),

      verwijderMateriaal: (index) =>
        set((state) => {
          if (!state.materiaalResultaat) return {};
          const nieuweMaterialen = state.materiaalResultaat.materialen.filter((_, i) => i !== index);
          return {
            materiaalResultaat: {
              ...state.materiaalResultaat,
              materialen: nieuweMaterialen,
              totaalMateriaalkosten: nieuweMaterialen.reduce((som, m) => som + m.totaalPrijs, 0),
            },
          };
        }),

      bewerkMateriaal: (index, materiaal) =>
        set((state) => {
          if (!state.materiaalResultaat) return {};
          const nieuweMaterialen = state.materiaalResultaat.materialen.map((m, i) =>
            i === index ? materiaal : m
          );
          return {
            materiaalResultaat: {
              ...state.materiaalResultaat,
              materialen: nieuweMaterialen,
              totaalMateriaalkosten: nieuweMaterialen.reduce((som, m) => som + m.totaalPrijs, 0),
            },
          };
        }),

      voegMateriaalToe: (materiaal) =>
        set((state) => {
          if (!state.materiaalResultaat) return {};
          const nieuweMaterialen = [...state.materiaalResultaat.materialen, materiaal];
          return {
            materiaalResultaat: {
              ...state.materiaalResultaat,
              materialen: nieuweMaterialen,
              totaalMateriaalkosten: nieuweMaterialen.reduce((som, m) => som + m.totaalPrijs, 0),
            },
          };
        }),

      setOfferteConcept: (offerte) => set({ offerteConcept: offerte }),

      slaOfferteOp: (offerte) =>
        set((state) => ({
          offertes: [offerte, ...state.offertes],
          aantalOffertes: state.aantalOffertes + 1,
          offerteConcept: null,
        })),

      voegFotoToe: (foto) =>
        set((state) => ({ fotoDocumentatie: [...state.fotoDocumentatie, foto] })),

      verwijderFoto: (id) =>
        set((state) => ({
          fotoDocumentatie: state.fotoDocumentatie.filter((f) => f.id !== id),
        })),

      setFotoAnalyseResultaat: (resultaat) => set({ fotoAnalyseResultaat: resultaat }),
      setAnalyseeFotoUri: (uri) => set({ analyseeFotoUri: uri }),
    }),
    {
      name: 'kluskit-klus-store',
      storage: createJSONStorage(() => AsyncStorage),
      // Alleen persistente data opslaan, sessie-state weggooien
      partialize: (state) => ({
        projecten: state.projecten,
        offertes: state.offertes,
        aantalOffertes: state.aantalOffertes,
        // Foto's zonder base64 (te zwaar voor opslag)
        fotoDocumentatie: state.fotoDocumentatie.map(
          ({ base64: _omit, ...rest }) => rest
        ),
      }),
    }
  )
);
