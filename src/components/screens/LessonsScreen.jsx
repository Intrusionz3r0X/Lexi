import React, { useState } from 'react';
import { Play } from 'lucide-react';
import { lessonCategories } from '../../data/lessonCategories';
import { useUserSettings } from '../../hooks/useUserSettings';
import { useTranslation } from '../../i18n';
import LexiFlash from './LexiFlashScreen';

const LessonsScreen = () => {
  const { user } = useUserSettings();
  const nativeLang = user.profile.nativeLang;
  const { t } = useTranslation(nativeLang);

  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleDeckClick = (category) => {
    setSelectedCategory(category);
    setIsPlaying(true);
  };

  const handleBack = () => {
    setIsPlaying(false);
    setSelectedCategory(null);
  };

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

      <div className="grid grid-cols-3 gap-6">
        {lessonCategories.map((category) => {
          const progressPercent = Math.round((category.progress / category.total) * 100);
          return (
            <div
              key={category.id}
              className="group cursor-pointer transition-transform duration-300 hover:scale-105"
              onClick={() => handleDeckClick(category)}
            >
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-md border border-slate-200">
                {/* Fondo con color y icono */}
                <div
                  className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${category.color} transition-transform duration-500 group-hover:scale-105`}
                >
                  <span className="text-5xl drop-shadow-lg">{category.image}</span>
                </div>

                {/* Botón Play discreto */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-10 h-10 bg-white/80 rounded-full flex items-center justify-center shadow-md">
                    <Play className="text-violet-600" size={20} />
                  </div>
                </div>

                {/* Panel discreto de nuevas / repaso */}
                <div className="absolute bottom-2 left-2 right-2 flex justify-between text-xs font-medium text-slate-700 bg-white/30 backdrop-blur-sm rounded-full px-2 py-1">
                  <span className="px-2 py-0.5 bg-green-100/70 rounded-full border border-green-200">
                    Nuevas: {category.newCards || 0}
                  </span>
                  <span className="px-2 py-0.5 bg-yellow-100/70 rounded-full border border-yellow-200">
                    Repaso: {category.reviewCards || 0}
                  </span>
                </div>

                {/* Progreso porcentaje */}
                <div className="absolute top-2 right-2 px-2 py-1 bg-white/30 backdrop-blur-sm rounded-full text-xs font-semibold text-slate-800 border border-white/30 shadow-sm">
                  {progressPercent}%
                </div>
              </div>

              {/* Título y barra de progreso */}
              <div className="mt-3">
                <h3 className="text-sm font-semibold text-slate-800 mb-1 group-hover:text-violet-600 transition-colors line-clamp-1">
                  {category.title}
                </h3>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                  <div
                    className={`h-full bg-gradient-to-r ${category.color} transition-all duration-500`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {category.progress}/{category.total}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LessonsScreen;
