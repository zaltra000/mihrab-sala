import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Heart, ChevronRight, ChevronLeft, Award } from 'lucide-react';
import { Card, CardContent } from './ui/Card';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

const dhikrList = [
  { id: 1, text: 'سبحان الله', target: 33 },
  { id: 2, text: 'الحمد لله', target: 33 },
  { id: 3, text: 'الله أكبر', target: 33 },
  { id: 4, text: 'لا إله إلا الله', target: 100 },
  { id: 5, text: 'أستغفر الله', target: 100 },
  { id: 6, text: 'اللهم صل وسلم على نبينا محمد', target: 10 },
];

export default function TasbihScreen() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [count, setCount] = useState(0);
  const [totalSessionCount, setTotalSessionCount] = useState(() => {
    return parseInt(localStorage.getItem('tasbeeh-total') || '0', 10);
  });
  const [isCompleted, setIsCompleted] = useState(false);

  // Save to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('tasbeeh-total', totalSessionCount.toString());
  }, [totalSessionCount]);

  const currentDhikr = dhikrList[selectedIndex];
  const progress = Math.min((count / currentDhikr.target) * 100, 100);

  // SVG Circle setup
  const radius = 110;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const handleTap = useCallback(async () => {
    if (count >= currentDhikr.target) return; // Stop at target

    const newCount = count + 1;
    setCount(newCount);
    setTotalSessionCount(c => c + 1);

    if (newCount === currentDhikr.target) {
      setIsCompleted(true);
      try {
        await Haptics.notification({ type: NotificationType.Success });
      } catch (e) {
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([100, 50, 100]);
      }
    } else {
      try {
        await Haptics.impact({ style: ImpactStyle.Light });
      } catch (e) {
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(15);
      }
    }
  }, [count, currentDhikr.target]);

  const reset = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setCount(0);
    setIsCompleted(false);
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (e) {
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(30);
    }
  };

  const nextDhikr = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIndex((i) => (i + 1) % dhikrList.length);
    setCount(0);
    setIsCompleted(false);
    try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) {}
  };

  const prevDhikr = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIndex((i) => (i - 1 + dhikrList.length) % dhikrList.length);
    setCount(0);
    setIsCompleted(false);
    try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) {}
  };

  return (
    <div className="flex flex-col min-h-full pt-8 px-5 pb-8">
      <header className="mb-8 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-extrabold text-slate-900 tracking-tight"
        >
          المسبحة الإلكترونية
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="text-slate-500 text-sm mt-2 font-medium"
        >
          ألا بذكر الله تطمئن القلوب
        </motion.p>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center max-w-sm mx-auto w-full gap-8">
        
        {/* Dhikr Selector */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="w-full"
        >
          <Card className="bg-white border-none shadow-sm rounded-3xl overflow-hidden">
            <CardContent className="p-2 flex items-center justify-between">
              <button onClick={prevDhikr} className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-colors">
                <ChevronRight className="w-6 h-6" />
              </button>
              
              <div className="flex-1 text-center px-2">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentDhikr.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h2 className="text-xl font-bold text-slate-800 leading-tight py-2">
                      {currentDhikr.text}
                    </h2>
                    <p className="text-xs font-bold text-emerald-600 bg-emerald-50 inline-block px-3 py-1 rounded-full">
                      الهدف: {currentDhikr.target}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              <button onClick={nextDhikr} className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-colors">
                <ChevronLeft className="w-6 h-6" />
              </button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Interactive Tasbih Button */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, type: "spring" }}
          className="relative flex items-center justify-center"
        >
          {/* Background Glow */}
          <div className={`absolute inset-0 rounded-full blur-3xl transition-colors duration-700 opacity-50 ${isCompleted ? 'bg-emerald-400' : 'bg-teal-200'}`} />
          
          <button 
            onClick={handleTap}
            className="relative z-10 group outline-none"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <motion.div 
              whileTap={{ scale: 0.92 }}
              className="relative flex items-center justify-center bg-white rounded-full shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)]"
              style={{ width: radius * 2, height: radius * 2 }}
            >
              {/* SVG Progress Ring */}
              <svg
                height={radius * 2}
                width={radius * 2}
                className="absolute inset-0 transform -rotate-90 pointer-events-none"
              >
                {/* Background Ring */}
                <circle
                  stroke="#f1f5f9"
                  fill="transparent"
                  strokeWidth={stroke}
                  r={normalizedRadius}
                  cx={radius}
                  cy={radius}
                />
                {/* Progress Ring */}
                <motion.circle
                  stroke={isCompleted ? "#10b981" : "#14b8a6"}
                  fill="transparent"
                  strokeWidth={stroke}
                  strokeLinecap="round"
                  r={normalizedRadius}
                  cx={radius}
                  cy={radius}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ type: "spring", stiffness: 60, damping: 15 }}
                  style={{ strokeDasharray: circumference }}
                />
              </svg>

              {/* Inner Content */}
              <div className="flex flex-col items-center justify-center text-center z-20">
                <AnimatePresence mode="wait">
                  {isCompleted ? (
                    <motion.div
                      key="completed"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", bounce: 0.5 }}
                      className="text-emerald-500 flex flex-col items-center"
                    >
                      <Award className="w-12 h-12 mb-2" />
                      <span className="text-sm font-bold">أحسنت!</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="counting"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex flex-col items-center"
                    >
                      <span className="text-6xl font-black text-slate-800 tracking-tighter">
                        {count}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Ripple Effect Container */}
              <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                <AnimatePresence>
                  {count > 0 && !isCompleted && (
                    <motion.div
                      key={count}
                      initial={{ scale: 0, opacity: 0.3 }}
                      animate={{ scale: 2, opacity: 0 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="absolute inset-0 bg-teal-100 rounded-full origin-center"
                    />
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </button>
        </motion.div>

        {/* Controls & Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="flex items-center justify-between w-full px-4"
        >
          <button 
            onClick={reset}
            className="flex items-center gap-2 px-5 py-3 bg-white text-slate-500 hover:text-rose-500 hover:bg-rose-50 rounded-2xl shadow-sm transition-all font-bold text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            تصفير
          </button>

          <div className="flex flex-col items-end">
            <span className="text-xs text-slate-400 font-medium mb-1">مجموع الجلسة</span>
            <div className="px-4 py-2 bg-slate-800 text-white rounded-xl font-mono font-bold text-lg shadow-md">
              {totalSessionCount}
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}