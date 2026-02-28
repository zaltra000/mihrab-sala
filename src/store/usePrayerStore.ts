import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PrayerName = 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';
export type CalcMethod = 'MuslimWorldLeague' | 'Egyptian' | 'Karachi' | 'UmmAlQura' | 'Dubai' | 'MoonsightingCommittee' | 'NorthAmerica' | 'Kuwait' | 'Qatar' | 'Singapore' | 'Tehran' | 'Turkey';
export type MadhabType = 'Shafi' | 'Hanafi';

export interface DailyLog {
  date: string; // YYYY-MM-DD
  prayers: Record<PrayerName, boolean>;
}

interface PrayerState {
  logs: Record<string, Record<PrayerName, boolean>>;
  coordinates: { lat: number; lng: number } | null;
  calculationMethod: CalcMethod;
  madhab: MadhabType;
  notificationsEnabled: boolean;
  togglePrayer: (date: string, prayer: PrayerName) => void;
  getLogForDate: (date: string) => Record<PrayerName, boolean>;
  setCoordinates: (lat: number, lng: number) => void;
  setCalculationMethod: (method: CalcMethod) => void;
  setMadhab: (madhab: MadhabType) => void;
  toggleNotifications: () => void;
}

const defaultPrayers: Record<PrayerName, boolean> = {
  Fajr: false,
  Dhuhr: false,
  Asr: false,
  Maghrib: false,
  Isha: false,
};

export const usePrayerStore = create<PrayerState>()(
  persist(
    (set, get) => ({
      logs: {},
      coordinates: null,
      calculationMethod: 'MuslimWorldLeague',
      madhab: 'Shafi',
      notificationsEnabled: true,
      togglePrayer: (date, prayer) => set((state) => {
        const currentLog = state.logs[date] || { ...defaultPrayers };
        return {
          logs: {
            ...state.logs,
            [date]: {
              ...currentLog,
              [prayer]: !currentLog[prayer]
            }
          }
        };
      }),
      getLogForDate: (date) => {
        return get().logs[date] || { ...defaultPrayers };
      },
      setCoordinates: (lat, lng) => set({ coordinates: { lat, lng } }),
      setCalculationMethod: (method) => set({ calculationMethod: method }),
      setMadhab: (madhab) => set({ madhab }),
      toggleNotifications: () => set((state) => ({ notificationsEnabled: !state.notificationsEnabled })),
    }),
    {
      name: 'prayer-storage',
    }
  )
);
