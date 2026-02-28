import React, { useEffect, useState, useRef } from 'react';
import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { ar } from 'date-fns/locale';
import { usePrayerStore, PrayerName, CalcMethod } from '../store/usePrayerStore';
import { Card, CardContent } from './ui/Card';
import { CheckCircle2, Circle, MapPin, Settings, Bell, BellOff, Moon, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Geolocation } from '@capacitor/geolocation';
import { schedulePrayerNotifications, cancelAllNotifications } from '../services/notificationService';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const PRAYER_NAMES_AR: Record<PrayerName, string> = {
  Fajr: 'الفجر',
  Dhuhr: 'الظهر',
  Asr: 'العصر',
  Maghrib: 'المغرب',
  Isha: 'العشاء'
};

const METHOD_NAMES_AR: Record<CalcMethod, string> = {
  MuslimWorldLeague: 'رابطة العالم الإسلامي',
  Egyptian: 'الهيئة المصرية العامة للمساحة',
  Karachi: 'جامعة العلوم الإسلامية بكراتشي',
  UmmAlQura: 'جامعة أم القرى، مكة المكرمة',
  Dubai: 'دبي',
  MoonsightingCommittee: 'لجنة رؤية الهلال',
  NorthAmerica: 'الجمعية الإسلامية لأمريكا الشمالية (ISNA)',
  Kuwait: 'الكويت',
  Qatar: 'قطر',
  Singapore: 'سنغافورة',
  Tehran: 'معهد الجيوفيزياء بجامعة طهران',
  Turkey: 'رئاسة الشؤون الدينية التركية'
};

const getMethodForCountry = (code: string): CalcMethod => {
  switch (code) {
    case 'SA': return 'UmmAlQura';
    case 'EG': case 'SD': case 'LY': return 'Egyptian';
    case 'PK': case 'IN': case 'BD': case 'AF': case 'LK': return 'Karachi';
    case 'US': case 'CA': return 'NorthAmerica';
    case 'AE': return 'Dubai';
    case 'KW': return 'Kuwait';
    case 'QA': return 'Qatar';
    case 'SG': case 'MY': case 'ID': return 'Singapore';
    case 'TR': return 'Turkey';
    case 'IR': return 'Tehran';
    default: return 'MuslimWorldLeague';
  }
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
};

export default function HomeScreen() {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: Date } | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [locationName, setLocationName] = useState<string>('جاري تحديد الموقع...');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const hijriDate = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  const { togglePrayer, getLogForDate, coordinates, setCoordinates, calculationMethod, setCalculationMethod, notificationsEnabled, toggleNotifications } = usePrayerStore();
  const todayLog = getLogForDate(todayStr);

  useEffect(() => {
    if (coordinates && notificationsEnabled) {
      schedulePrayerNotifications(coordinates.lat, coordinates.lng, calculationMethod);
    } else if (!notificationsEnabled) {
      cancelAllNotifications();
    }
  }, [coordinates, calculationMethod, notificationsEnabled]);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const position = await Geolocation.getCurrentPosition();
        setCoordinates(position.coords.latitude, position.coords.longitude);

        // Reverse geocoding using free BigDataCloud API
        const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=ar`);
        const data = await response.json();

        if (data.city || data.countryName) {
          setLocationName(`${data.city || ''} ${data.countryName ? ', ' + data.countryName : ''}`.trim().replace(/^,|,$/g, ''));
        } else {
          setLocationName('موقعك الحالي');
        }

        // Auto-detect calculation method if we just got location for the first time
        if (data.countryCode && !coordinates) {
          setCalculationMethod(getMethodForCountry(data.countryCode));
        }
      } catch (error) {
        console.error('Error getting location, trying IP fallback', error);
        try {
          // Fallback to IP-based location if Geolocation is denied or fails in iframe
          const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?localityLanguage=ar`);
          const data = await response.json();

          if (data.latitude && data.longitude) {
            setCoordinates(data.latitude, data.longitude);
            setLocationName(`${data.city || ''} ${data.countryName ? ', ' + data.countryName : ''}`.trim().replace(/^,|,$/g, ''));

            if (data.countryCode && !coordinates) {
              setCalculationMethod(getMethodForCountry(data.countryCode));
            }
          } else {
            setLocationName('مكة المكرمة (افتراضي)');
          }
        } catch (fallbackError) {
          setLocationName('مكة المكرمة (افتراضي)');
        }
      }
    };

    if (!coordinates) {
      fetchLocation();
    } else {
      // Try to get name if we already have coordinates but no name
      fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coordinates.lat}&longitude=${coordinates.lng}&localityLanguage=ar`)
        .then(res => res.json())
        .then(data => {
          if (data.city || data.countryName) {
            setLocationName(`${data.city || ''} ${data.countryName ? ', ' + data.countryName : ''}`.trim().replace(/^,|,$/g, ''));
          } else {
            setLocationName('موقعك الحالي');
          }
        })
        .catch(() => setLocationName('موقعك الحالي'));
    }
  }, []);

  useEffect(() => {
    // Default to Mecca if no coordinates
    const lat = coordinates?.lat || 21.4225;
    const lng = coordinates?.lng || 39.8262;

    let coords = new Coordinates(lat, lng);
    const params = CalculationMethod[calculationMethod]();
    const date = new Date();

    const pTimes = new PrayerTimes(coords, date, params);
    setPrayerTimes(pTimes);

    const updateNextPrayer = () => {
      const now = new Date();
      let next = pTimes.nextPrayer();
      let nextTime = pTimes.timeForPrayer(next);

      if (next === 'none' || !nextTime) {
        // Next prayer is Fajr tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowTimes = new PrayerTimes(coords, tomorrow, params);
        next = 'fajr';
        nextTime = tomorrowTimes.fajr;
      }

      if (nextTime) {
        const nameMap: Record<string, PrayerName> = {
          fajr: 'Fajr',
          dhuhr: 'Dhuhr',
          asr: 'Asr',
          maghrib: 'Maghrib',
          isha: 'Isha'
        };
        const pName = nameMap[next] || 'Fajr';
        setNextPrayer({ name: PRAYER_NAMES_AR[pName], time: nextTime });

        setTimeRemaining(formatDistanceToNowStrict(nextTime, { locale: ar, addSuffix: false }));
      }
    };

    updateNextPrayer();
    const interval = setInterval(updateNextPrayer, 1000);
    return () => clearInterval(interval);
  }, [coordinates, calculationMethod]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const prayersList: { id: PrayerName; time: Date | null }[] = [
    { id: 'Fajr', time: prayerTimes?.fajr || null },
    { id: 'Dhuhr', time: prayerTimes?.dhuhr || null },
    { id: 'Asr', time: prayerTimes?.asr || null },
    { id: 'Maghrib', time: prayerTimes?.maghrib || null },
    { id: 'Isha', time: prayerTimes?.isha || null },
  ];

  return (
    <div className="flex flex-col gap-8 pt-8 px-5 pb-8">
      <header className="text-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2 mb-2"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Moon className="w-6 h-6 text-white fill-white/20" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            مِحْرَاب
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="flex flex-col items-center gap-1 mt-4"
        >
          <p className="text-emerald-700 text-sm font-bold bg-emerald-50 px-4 py-1.5 rounded-full shadow-sm">
            {hijriDate}
          </p>
          <p className="text-slate-500 text-xs font-medium mt-1">
            {format(new Date(), 'EEEE، d MMMM yyyy', { locale: ar })}
          </p>
          <div className="flex items-center gap-1 mt-2 text-slate-400 text-xs">
            <MapPin className="w-3 h-3" />
            <span>{locationName}</span>
          </div>

          <div className="flex items-center justify-center gap-2 mt-3 w-full max-w-[280px]">
            <div className="relative flex-1" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl shadow-sm text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <Settings className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="truncate">{METHOD_NAMES_AR[calculationMethod]}</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-100 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto"
                  >
                    <div className="p-1 flex flex-col gap-0.5">
                      {Object.entries(METHOD_NAMES_AR).map(([key, name]) => (
                        <button
                          key={key}
                          onClick={() => {
                            setCalculationMethod(key as CalcMethod);
                            setIsDropdownOpen(false);
                          }}
                          className={`text-right px-3 py-2.5 text-xs rounded-lg transition-colors ${calculationMethod === key
                              ? 'bg-emerald-50 text-emerald-700 font-bold'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                            }`}
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={toggleNotifications}
              className={`p-2 rounded-xl shadow-sm transition-colors border ${notificationsEnabled
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                  : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
                }`}
              title={notificationsEnabled ? 'إيقاف الإشعارات' : 'تفعيل الإشعارات'}
            >
              {notificationsEnabled ? (
                <Bell className="w-4 h-4" />
              ) : (
                <BellOff className="w-4 h-4" />
              )}
            </button>
          </div>
        </motion.div>
      </header>

      {nextPrayer && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
          className="relative group"
        >
          {/* Dynamic Glow based on prayer */}
          <div className={`absolute inset-0 rounded-3xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500 ${nextPrayer.name === 'الفجر' ? 'bg-gradient-to-r from-indigo-400 to-cyan-500' :
              nextPrayer.name === 'الظهر' ? 'bg-gradient-to-r from-amber-400 to-orange-500' :
                nextPrayer.name === 'العصر' ? 'bg-gradient-to-r from-orange-400 to-rose-400' :
                  nextPrayer.name === 'المغرب' ? 'bg-gradient-to-r from-rose-500 to-purple-600' :
                    'bg-gradient-to-r from-indigo-600 to-slate-800'
            }`} />

          <Card className={`text-white border-none shadow-2xl overflow-hidden relative rounded-3xl transition-colors duration-1000 ${nextPrayer.name === 'الفجر' ? 'bg-gradient-to-br from-indigo-500 to-cyan-700' :
              nextPrayer.name === 'الظهر' ? 'bg-gradient-to-br from-amber-500 to-orange-600' :
                nextPrayer.name === 'العصر' ? 'bg-gradient-to-br from-orange-500 to-rose-600' :
                  nextPrayer.name === 'المغرب' ? 'bg-gradient-to-br from-rose-600 to-purple-800' :
                    'bg-gradient-to-br from-indigo-800 to-slate-900'
            }`}>
            {/* Decorative background circles */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 rounded-full bg-black/20 blur-xl" />

            <CardContent className="flex flex-col items-center justify-center py-10 relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-semibold tracking-wide mb-4 shadow-sm"
              >
                الصلاة القادمة
              </motion.div>
              <h2 className="text-5xl font-black mb-4 tracking-tight drop-shadow-md">{nextPrayer.name}</h2>
              <div className="text-4xl font-mono tracking-widest font-light opacity-90 drop-shadow-sm">
                -{timeRemaining}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="flex flex-col gap-4">
        <motion.h3
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="font-bold text-slate-900 text-lg px-1"
        >
          صلوات اليوم
        </motion.h3>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-3"
        >
          {prayersList.map((prayer) => {
            const isCompleted = todayLog[prayer.id];
            const now = new Date();
            const isFuture = prayer.time ? prayer.time > now : false;

            return (
              <motion.div
                key={prayer.id}
                variants={itemVariants}
                whileHover={!isFuture ? { scale: 1.02 } : {}}
                whileTap={!isFuture ? { scale: 0.98 } : {}}
              >
                <Card
                  className={`transition-all duration-300 border-transparent shadow-sm rounded-2xl ${isFuture
                      ? 'bg-slate-50 opacity-60 cursor-not-allowed'
                      : isCompleted
                        ? 'bg-emerald-50/80 border-emerald-100 cursor-pointer hover:shadow-md'
                        : 'bg-white cursor-pointer hover:shadow-md'
                    }`}
                  onClick={async () => {
                    if (!isFuture) {
                      togglePrayer(todayStr, prayer.id);
                      try {
                        await Haptics.impact({ style: ImpactStyle.Medium });
                      } catch (e) {
                        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(20);
                      }
                    }
                  }}
                >
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <AnimatePresence mode="wait">
                          {isCompleted ? (
                            <motion.div
                              key="checked"
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              exit={{ scale: 0, rotate: 180 }}
                              transition={{ type: "spring", stiffness: 300, damping: 20 }}
                              className="text-emerald-500"
                            >
                              <CheckCircle2 className="w-8 h-8 fill-emerald-100" />
                            </motion.div>
                          ) : (
                            <motion.div
                              key="unchecked"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              className={isFuture ? "text-slate-100" : "text-slate-200"}
                            >
                              <Circle className="w-8 h-8" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <div>
                        <h4 className={`font-bold text-lg transition-colors duration-300 ${isCompleted ? 'text-emerald-900' : isFuture ? 'text-slate-400' : 'text-slate-800'
                          }`}>
                          {PRAYER_NAMES_AR[prayer.id]}
                        </h4>
                        <p className={`text-sm font-mono mt-0.5 font-medium ${isFuture ? 'text-slate-400' : 'text-slate-500'}`}>
                          {prayer.time ? format(prayer.time, 'hh:mm a') : '--:--'}
                        </p>
                      </div>
                    </div>
                    {isFuture && (
                      <div className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                        لم يحن وقتها
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
