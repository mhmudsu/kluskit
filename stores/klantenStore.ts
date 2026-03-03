import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Klant } from '../types';

interface KlantenState {
  klanten: Klant[];
  voegKlantToe: (klant: Klant) => void;
  werkKlantBij: (id: string, wijzigingen: Partial<Klant>) => void;
  verwijderKlant: (id: string) => void;
}

export const useKlantenStore = create<KlantenState>()(
  persist(
    (set) => ({
      klanten: [],

      voegKlantToe: (klant) =>
        set((state) => ({ klanten: [klant, ...state.klanten] })),

      werkKlantBij: (id, wijzigingen) =>
        set((state) => ({
          klanten: state.klanten.map((k) =>
            k.id === id ? { ...k, ...wijzigingen } : k
          ),
        })),

      verwijderKlant: (id) =>
        set((state) => ({
          klanten: state.klanten.filter((k) => k.id !== id),
        })),
    }),
    {
      name: 'kluskit-klanten-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
