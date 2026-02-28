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
  seedData: () => void;
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
      seedData: () => set((state) => {
        if (Object.keys(state.logs).length >= 7) return state; // Only seed if less than 7 days of data
        
        const newLogs: Record<string, Record<PrayerName, boolean>> = { ...state.logs };
        const today = new Date();
        
        // Generate 14 days of mock data
        for (let i = 1; i <= 14; i++) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          
          if (!newLogs[dateStr]) {
            // Randomly complete prayers, but make it realistic (mostly complete, sometimes miss Fajr or Isha)
            newLogs[dateStr] = {
              Fajr: Math.random() > 0.3, // 70% chance
              Dhuhr: Math.random() > 0.1, // 90% chance
              Asr: Math.random() > 0.1, // 90% chance
              Maghrib: Math.random() > 0.05, // 95% chance
              Isha: Math.random() > 0.2, // 80% chance
            };
          }
        }
        
        return { logs: newLogs };
      }),
    }),
    {
      name: 'prayer-storage',
    }
  )
);
