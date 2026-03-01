import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GebruikersProfiel } from '../types';

interface UserState {
  profiel: GebruikersProfiel;
  setProfiel: (profiel: Partial<GebruikersProfiel>) => void;
}

const standaardProfiel: GebruikersProfiel = {
  naam: '',
  bedrijfsnaam: '',
  kvkNummer: '',
  btwNummer: '',
  telefoon: '',
  adres: '',
  uurtarief: 45,
  betalingsvoorwaarden: 'Betaling binnen 14 dagen na factuurdatum.',
  algVoorwaarden: '',
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      profiel: standaardProfiel,
      setProfiel: (nieuwProfiel) =>
        set((state) => ({
          profiel: { ...state.profiel, ...nieuwProfiel },
        })),
    }),
    {
      name: 'kluskit-user-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
