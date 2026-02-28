/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import HomeScreen from './components/HomeScreen';
import FiqhScreen from './components/FiqhScreen';
import HadithScreen from './components/HadithScreen';
import StatsScreen from './components/StatsScreen';
import TasbihScreen from './components/TasbihScreen';
import { Home, BookOpen, Quote, BarChart2, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'fiqh':
        return <FiqhScreen />;
      case 'hadith':
        return <HadithScreen />;
      case 'tasbih':
        return <TasbihScreen />;
      case 'stats':
        return <StatsScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-50 font-sans text-slate-900 overflow-hidden relative pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]" dir="rtl">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-0 w-full h-64 bg-emerald-500/5 blur-[100px] pointer-events-none rounded-full" />

      <main className="flex-1 overflow-y-auto relative z-10 pb-[calc(6rem+env(safe-area-inset-bottom))]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="h-full"
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Glassmorphic Navigation */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] z-50 pointer-events-none">
        <nav className="max-w-md mx-auto bg-white/80 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.08)] rounded-3xl px-1 py-3 pointer-events-auto">
          <div className="flex justify-around items-center relative">
            <NavItem
              icon={<Home />}
              label="الرئيسية"
              isActive={activeTab === 'home'}
              onClick={() => setActiveTab('home')}
            />
            <NavItem
              icon={<BookOpen />}
              label="الفقه"
              isActive={activeTab === 'fiqh'}
              onClick={() => setActiveTab('fiqh')}
            />
            <NavItem
              icon={<Heart />}
              label="المسبحة"
              isActive={activeTab === 'tasbih'}
              onClick={() => setActiveTab('tasbih')}
            />
            <NavItem
              icon={<Quote />}
              label="الحديث"
              isActive={activeTab === 'hadith'}
              onClick={() => setActiveTab('hadith')}
            />
            <NavItem
              icon={<BarChart2 />}
              label="إحصائيات"
              isActive={activeTab === 'stats'}
              onClick={() => setActiveTab('stats')}
            />
          </div>
        </nav>
      </div>
    </div>
  );
}

function NavItem({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center gap-1 w-[4.5rem] h-14 transition-all duration-300 ease-out ${isActive ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
    >
      {isActive && (
        <motion.div
          layoutId="nav-indicator"
          className="absolute inset-0 bg-emerald-50 rounded-2xl -z-10"
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
      <motion.div
        animate={{ y: isActive ? -2 : 0, scale: isActive ? 1.1 : 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {React.cloneElement(icon as React.ReactElement<{ className?: string }>, {
          className: `w-6 h-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`
        })}
      </motion.div>
      <motion.span
        animate={{ opacity: isActive ? 1 : 0.7, scale: isActive ? 1 : 0.9 }}
        className={`text-[10px] font-medium ${isActive ? 'font-bold' : ''}`}
      >
        {label}
      </motion.span>
    </button>
  );
}
