import React, { useMemo, useEffect, useState } from 'react';
import { hadiths, HadithCategory, Hadith } from '../data/hadiths';
import { Card, CardContent } from './ui/Card';
import { Quote, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { usePrayerStore } from '../store/usePrayerStore';
import { format, subDays, getDay } from 'date-fns';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
};

export default function HadithScreen() {
  const { logs } = usePrayerStore();
  const [dailyHadith, setDailyHadith] = useState<Hadith>(hadiths[0]);
  const [aiMessage, setAiMessage] = useState('');

  useEffect(() => {
    // --- Advanced Local AI Logic ---

    // 1. Analyze Prayer Stats (Last 7 Days)
    let totalPrayersLast7Days = 0;
    let fajrMissedCount = 0;
    let ishaMissedCount = 0;
    let perfectDaysStreak = 0;
    let missedAllYesterday = false;
    let perfectYesterday = false;

    for (let i = 0; i < 7; i++) {
      const d = format(subDays(new Date(), i), 'yyyy-MM-dd');
      const dayLog = logs[d];

      if (dayLog) {
        const completedCount = Object.values(dayLog).filter(Boolean).length;
        totalPrayersLast7Days += completedCount;

        if (!dayLog.Fajr) fajrMissedCount++;
        if (!dayLog.Isha) ishaMissedCount++;

        if (completedCount === 5) {
          if (i === 0 || perfectDaysStreak > 0) perfectDaysStreak++;
        } else {
          if (i === 0) perfectDaysStreak = 0; // Break streak if today isn't perfect
        }

        if (i === 1) { // Yesterday
          if (completedCount === 0) missedAllYesterday = true;
          if (completedCount === 5) perfectYesterday = true;
        }
      } else {
        // No log means missed all
        fajrMissedCount++;
        ishaMissedCount++;
        if (i === 1) missedAllYesterday = true;
      }
    }

    // 2. Analyze Tasbih Stats
    const tasbeehTotal = parseInt(localStorage.getItem('tasbeeh-total') || '0', 10);
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const tasbeehToday = parseInt(localStorage.getItem(`tasbeeh-count-${todayStr}`) || '0', 10);

    // 3. Time Context
    const isFriday = getDay(new Date()) === 5; // 0 is Sunday, 5 is Friday

    // 4. AI Decision Engine (Determine User State & Category)
    let targetCategory: HadithCategory = 'general_motivation';
    let message = '';

    if (isFriday) {
      targetCategory = 'friday';
      message = 'اليوم جمعة، عيد الأسبوع! إليك هذا الحديث لتغتنم فضله:';
    } else if (fajrMissedCount >= 4) {
      targetCategory = 'fajr_struggle';
      message = 'لاحظت أنك تواجه صعوبة في الاستيقاظ لصلاة الفجر مؤخراً، هذا الحديث لك:';
    } else if (ishaMissedCount >= 4) {
      targetCategory = 'isha_struggle';
      message = 'يبدو أن صلاة العشاء تفوتك كثيراً هذه الأيام، تذكر هذا الحديث العظيم:';
    } else if (totalPrayersLast7Days === 0 && Object.keys(logs).length >= 2) {
      targetCategory = 'prayer_abandonment';
      message = 'غيابك طال عن الصلاة.. الصلاة هي الرابط بينك وبين خالقك، اقرأ هذا الحديث بقلبك:';
    } else if (missedAllYesterday && totalPrayersLast7Days > 0) {
      targetCategory = 'repentance';
      message = 'أمس كان يوماً صعباً ولم تصلِّ، لكن باب التوبة مفتوح دائماً:';
    } else if (perfectDaysStreak >= 3) {
      targetCategory = 'prayer_excellence';
      message = 'ما شاء الله! التزامك بالصلوات رائع في الأيام الماضية، استمر على هذا النور:';
    } else if (tasbeehTotal > 500 && tasbeehToday > 50) {
      targetCategory = 'tasbih_excellence';
      message = 'لسانك رطب بذكر الله! أداؤك في التسبيح ممتاز اليوم، اقرأ هذا الحديث:';
    } else if (totalPrayersLast7Days >= 25 && tasbeehToday === 0) {
      targetCategory = 'tasbih_neglect';
      message = 'صلواتك ممتازة! لكنك نسيت التسبيح اليوم، هذا الحديث سيشجعك:';
    } else if (perfectDaysStreak > 0) {
      targetCategory = 'consistency';
      message = 'أنت تحافظ على صلاتك بشكل جيد، تذكر هذا الحديث عن المداومة:';
    } else {
      targetCategory = 'general_motivation';
      message = 'أنت في الطريق الصحيح، إليك حديث اليوم ليزيدك إيماناً وثباتاً:';
    }

    // 5. Select Hadith
    const eligibleHadiths = hadiths.filter(h => h.category === targetCategory);

    // Use day of year + category seed to randomize but keep it stable for the day
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
    const categorySeed = targetCategory.charCodeAt(0) + targetCategory.charCodeAt(targetCategory.length - 1);

    const selectedIndex = (dayOfYear + categorySeed) % eligibleHadiths.length;
    const selected = eligibleHadiths[selectedIndex] || hadiths[0];

    setDailyHadith(selected);
    setAiMessage(message);
  }, [logs]);

  return (
    <div className="flex flex-col min-h-full pt-8 px-5 pb-8">
      <header className="mb-8 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-extrabold text-slate-900 tracking-tight"
        >
          حديث اليوم
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="text-slate-500 text-sm mt-2 font-medium"
        >
          قبس من نور النبوة
        </motion.p>
      </header>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-amber-200/50 rounded-3xl blur-xl transform rotate-3 scale-105 -z-10" />
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100/50 relative overflow-hidden rounded-3xl shadow-lg">
          <div className="absolute -top-6 -right-6 p-6 opacity-5 text-amber-600 pointer-events-none">
            <Quote size={160} className="rotate-180" />
          </div>
          <CardContent className="p-8 flex flex-col items-center text-center relative z-10">

            {/* AI Message Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-3 rounded-2xl mb-6 shadow-sm border border-amber-100/50 w-full"
            >
              <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
              <p className="text-xs font-bold text-slate-700 leading-relaxed text-right">{aiMessage}</p>
            </motion.div>

            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring" }}
              className="w-14 h-14 bg-white shadow-sm rounded-full flex items-center justify-center mb-6 text-amber-500"
            >
              <Quote size={24} />
            </motion.div>

            <p className="text-2xl leading-relaxed font-bold text-slate-800 mb-8 drop-shadow-sm">
              "{dailyHadith.text}"
            </p>

            <div className="inline-flex items-center justify-center px-5 py-2 bg-white/60 backdrop-blur-sm rounded-full text-sm font-bold text-amber-700 shadow-sm border border-amber-100">
              {dailyHadith.source}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="mt-10">
        <motion.h3
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="font-bold text-slate-900 text-lg mb-4 px-2"
        >
          أحاديث أخرى
        </motion.h3>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-4"
        >
          {hadiths.filter(h => h.id !== dailyHadith.id).map((hadith) => (
            <motion.div key={hadith.id} variants={itemVariants} whileHover={{ scale: 1.02 }}>
              <Card className="rounded-2xl border-none shadow-sm hover:shadow-md transition-shadow bg-white">
                <CardContent className="p-5">
                  <p className="text-slate-700 leading-relaxed font-medium mb-3 text-lg">"{hadith.text}"</p>
                  <p className="text-sm text-emerald-600 font-bold">{hadith.source}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
