import React, { useState } from 'react';
import { fiqhTopics, FiqhTopic } from '../data/fiqh';
import { Card, CardContent } from './ui/Card';
import { ChevronLeft, BookOpen, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
};

export default function FiqhScreen() {
  const [selectedTopic, setSelectedTopic] = useState<FiqhTopic | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTopics = fiqhTopics.filter(t =>
    t.title.includes(searchQuery) || t.content.includes(searchQuery)
  );

  return (
    <div className="flex flex-col min-h-full pt-8 px-5 pb-8">
      <AnimatePresence mode="wait">
        {!selectedTopic ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
            className="flex flex-col gap-6"
          >
            <header className="text-center">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">فقه الصلاة</h1>
              <p className="text-slate-500 text-sm mt-2 font-medium">من كتاب فقه الصلاة للشيخ يوسف القرضاوي</p>
            </header>

            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="relative"
            >
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="ابحث في الفقه..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-14 pl-4 pr-12 rounded-2xl border-none shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-900 font-medium transition-shadow placeholder:text-slate-400"
              />
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="flex flex-col gap-3 mt-2"
            >
              {filteredTopics.map((topic) => (
                <motion.div key={topic.id} variants={itemVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Card
                    className="cursor-pointer border-none shadow-sm hover:shadow-md transition-all rounded-2xl bg-white"
                    onClick={() => setSelectedTopic(topic)}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                          <BookOpen className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-slate-800 text-lg">{topic.title}</h3>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center">
                        <ChevronLeft className="w-5 h-5 text-slate-400" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
              {filteredTopics.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-500 font-medium">لا توجد نتائج مطابقة للبحث</p>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
            className="flex flex-col h-full"
          >
            <button
              onClick={() => setSelectedTopic(null)}
              className="flex items-center gap-2 text-emerald-600 font-bold mb-8 mt-2 w-fit hover:text-emerald-700 transition-colors bg-emerald-50 px-4 py-2 rounded-full"
            >
              <ChevronLeft className="w-5 h-5 rotate-180" />
              <span>العودة للفهرس</span>
            </button>

            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-6">
                <BookOpen className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-6 leading-tight">{selectedTopic.title}</h2>

              <div className="prose prose-slate prose-lg max-w-none text-slate-700 pb-10">
                {selectedTopic.content.split('\n').map((paragraph, idx) => (
                  <p key={idx} className="leading-loose mb-6 font-medium text-lg">{paragraph}</p>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
