import React, { useState } from 'react';
import { Play } from 'lucide-react';
import { lessonCategories } from '../../data/lessonCategories';
import { useUserSettings } from '../../hooks/useUserSettings';
import { useTranslation } from '../../i18n';
import LexiFlash from './LexiFlashScreen'; // tu minijuego

const LessonsScreen = () => {
  const { user } = useUserSettings();
  const nativeLang = user.profile.nativeLang;
  const { t } = useTranslation(nativeLang);

  // Estado para saber si estamos jugando
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleDeckClick = (category) => {
    setSelectedCategory(category);
    setIsPlaying(true); // activa LexiFlash
  };

  const handleBack = () => {
    setIsPlaying(false);
    setSelectedCategory(null); // vuelve a la lista de decks
  };

  // Si estamos jugando, renderiza LexiFlash
  if (isPlaying && selectedCategory) {
    return <LexiFlash category={selectedCategory} onBack={handleBack} />;
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          {t('lessons.title')}
        </h1>
        <p className="text-slate-500">{t('lessons.subtitle')}</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {lessonCategories.map((category) => (
          <div
            key={category.id}
            className="group cursor-pointer transition-all duration-300 hover:scale-105"
            onClick={() => handleDeckClick(category)} // cada deck elige LexiFlash
          >
            {/* Card compacta */}
            <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg shadow-slate-200/50 backdrop-blur-sm border border-white/40">
              <div
                className={`absolute inset-0 bg-gradient-to-br ${category.color} flex items-center justify-center`}
              >
                <span className="text-5xl group-hover:scale-110 transition-transform duration-300 drop-shadow-2xl">
                  {category.image}
                </span>
              </div>

              <div className="absolute inset-0 bg-white/20 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform">
                  <Play className="text-violet-600 ml-0.5" size={20} fill="currentColor" />
                </div>
              </div>

              <div className="absolute top-2 left-2 px-2 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-semibold border border-white/30 shadow-lg">
                {Math.round((category.progress / category.total) * 100)}%
              </div>

              <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
            </div>

            <div className="mt-3">
              <h3 className="text-sm font-bold text-slate-800 mb-1 group-hover:text-violet-600 transition-colors line-clamp-1">
                {category.title}
              </h3>

              <div className="bg-white/50 backdrop-blur-sm rounded-full h-1.5 overflow-hidden border border-white/40 shadow-inner">
                <div
                  className={`h-full bg-gradient-to-r ${category.color} shadow-lg transition-all duration-500`}
                  style={{ width: `${(category.progress / category.total) * 100}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {category.progress}/{category.total}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LessonsScreen;
