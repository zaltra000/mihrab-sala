import React, { useMemo, useEffect } from 'react';
import { usePrayerStore, PrayerName } from '../store/usePrayerStore';
import { format, subDays, isBefore, startOfDay, parseISO, differenceInDays } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Card, CardContent } from './ui/Card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'motion/react';
import { Trophy, Target, TrendingUp, Flame, Star, AlertCircle, Activity } from 'lucide-react';

const PRAYER_NAMES_AR: Record<PrayerName, string> = {
  Fajr: 'الفجر',
  Dhuhr: 'الظهر',
  Asr: 'العصر',
  Maghrib: 'المغرب',
  Isha: 'العشاء'
};

export default function StatsScreen() {
  const { logs, seedData } = usePrayerStore();

  useEffect(() => {
    seedData();
  }, [seedData]);

  const stats = useMemo(() => {
    const data = [];
    let totalCompletedThisWeek = 0;
    
    // 1. Weekly Chart Data
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayLog = logs[dateStr];
      
      let completed = 0;
      if (dayLog) {
        completed = Object.values(dayLog).filter(Boolean).length;
      }
      totalCompletedThisWeek += completed;
      
      data.push({
        name: format(date, 'EEEE', { locale: ar }).replace('يوم ', ''),
        completed,
        total: 5
      });
    }

    // 2. Advanced Metrics
    let currentStreak = 0;
    let bestStreak = 0;
    let totalPrayersEver = 0;
    const missedCounts: Record<PrayerName, number> = { Fajr: 0, Dhuhr: 0, Asr: 0, Maghrib: 0, Isha: 0 };
    let totalDaysLogged = 0;

    const sortedDates = Object.keys(logs).sort((a, b) => b.localeCompare(a)); // Newest first
    
    let tempStreak = 0;
    let isCurrentStreakActive = true;
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');

    // Calculate streaks and totals
    if (sortedDates.length > 0) {
      // Check if current streak is broken (didn't complete 5 yesterday or today)
      const todayCompleted = logs[todayStr] ? Object.values(logs[todayStr]).filter(Boolean).length : 0;
      const yesterdayCompleted = logs[yesterdayStr] ? Object.values(logs[yesterdayStr]).filter(Boolean).length : 0;
      
      if (todayCompleted < 5 && yesterdayCompleted < 5) {
        isCurrentStreakActive = false;
      }

      // Calculate historical streaks
      let currentDateObj = startOfDay(new Date());
      
      // We need to iterate through all past days to find the best streak
      const oldestDateStr = sortedDates[sortedDates.length - 1];
      const oldestDate = parseISO(oldestDateStr);
      const daysDiff = differenceInDays(currentDateObj, oldestDate);

      for (let i = 0; i <= daysDiff; i++) {
        const dStr = format(subDays(currentDateObj, i), 'yyyy-MM-dd');
        const dayLog = logs[dStr];
        
        if (dayLog) {
          totalDaysLogged++;
          const completedCount = Object.values(dayLog).filter(Boolean).length;
          totalPrayersEver += completedCount;
          
          Object.entries(dayLog).forEach(([prayer, isDone]) => {
            if (!isDone) missedCounts[prayer as PrayerName]++;
          });

          if (completedCount === 5) {
            tempStreak++;
            if (isCurrentStreakActive && i === tempStreak - 1) {
              // If we are looking at consecutive days from today backwards
              currentStreak = tempStreak;
            }
            if (tempStreak > bestStreak) bestStreak = tempStreak;
          } else {
            tempStreak = 0;
          }
        } else {
          // Missing log means missed prayers
          Object.keys(missedCounts).forEach(p => missedCounts[p as PrayerName]++);
          tempStreak = 0;
        }
      }
    }

    // Find most missed prayer
    let mostMissed: PrayerName | null = null;
    let maxMissed = -1;
    Object.entries(missedCounts).forEach(([prayer, count]) => {
      if (count > maxMissed) {
        maxMissed = count;
        mostMissed = prayer as PrayerName;
      }
    });

    return {
      chartData: data,
      totalCompletedThisWeek,
      percentage: Math.round((totalCompletedThisWeek / 35) * 100) || 0,
      currentStreak,
      bestStreak,
      totalPrayersEver,
      mostMissed: maxMissed > 0 && mostMissed ? PRAYER_NAMES_AR[mostMissed] : 'لا يوجد',
      maxMissedCount: maxMissed
    };
  }, [logs]);

  return (
    <div className="flex flex-col min-h-full pt-8 px-5 pb-8">
      <header className="mb-8 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-extrabold text-slate-900 tracking-tight"
        >
          إحصائياتي
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="text-slate-500 text-sm mt-2 font-medium"
        >
          تحليل الأداء والالتزام
        </motion.p>
      </header>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: "spring", delay: 0.1 }}>
          <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 border-none shadow-lg shadow-emerald-500/20 text-white rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl -mr-10 -mt-10" />
            <CardContent className="p-5 flex flex-col items-center justify-center text-center h-full relative z-10">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-2">
                <Target className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-3xl font-black mb-1">{stats.percentage}%</h3>
              <p className="text-xs text-emerald-50 font-medium">نسبة الأسبوع</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: "spring", delay: 0.2 }}>
          <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 border-none shadow-lg shadow-blue-500/20 text-white rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl -mr-10 -mt-10" />
            <CardContent className="p-5 flex flex-col items-center justify-center text-center h-full relative z-10">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-2">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-3xl font-black mb-1">{stats.currentStreak}</h3>
              <p className="text-xs text-blue-50 font-medium">أيام متتالية (Streak)</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: "spring", delay: 0.3 }}>
          <Card className="bg-white border-none shadow-sm rounded-3xl">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 bg-amber-50 rounded-xl">
                <Star className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">أفضل سلسلة</p>
                <p className="text-lg font-black text-slate-800">{stats.bestStreak} <span className="text-xs font-medium text-slate-500">أيام</span></p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: "spring", delay: 0.4 }}>
          <Card className="bg-white border-none shadow-sm rounded-3xl">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 bg-rose-50 rounded-xl">
                <AlertCircle className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">الأكثر تفويتاً</p>
                <p className="text-sm font-black text-slate-800">{stats.mostMissed}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ type: "spring", delay: 0.5 }}
      >
        <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden">
          <CardContent className="p-6 pt-8">
            <div className="flex items-center justify-between mb-8 px-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 rounded-lg">
                  <Activity className="w-5 h-5 text-emerald-500" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">أداء الأسبوع</h3>
              </div>
              <div className="text-left">
                <p className="text-2xl font-black text-slate-800">{stats.totalCompletedThisWeek}<span className="text-sm text-slate-400 font-medium">/35</span></p>
              </div>
            </div>
            <div className="h-64 w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 13, fill: '#64748b', fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                    domain={[0, 5]}
                    ticks={[0, 1, 2, 3, 4, 5]}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="completed" radius={[6, 6, 6, 6]} maxBarSize={32}>
                    {stats.chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.completed === 5 ? '#10b981' : '#6ee7b7'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
