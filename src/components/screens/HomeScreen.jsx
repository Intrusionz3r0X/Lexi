// src/screens/HomeScreen.jsx
import React from 'react';
import { Play, Award, Book, Zap, TrendingUp } from 'lucide-react';
import { useUserSettings } from '../../hooks/useUserSettings';
import { useTranslation } from '../../i18n';

const HomeScreen = () => {
  const { user } = useUserSettings();
  const nativeLang = user.profile.nativeLang;

  // Hook de traducción
  const { t } = useTranslation(nativeLang);

  // Datos de ejemplo
  const name = user.profile.name;
  const streakDays = 7;
  const recordDays = 12;
  const daysLeft = recordDays - streakDays;
  const vocabMastered = 245;
  const vocabLearned = 89;
  const vocabNewToday = 10;
  const lessonsCompleted = 24;
  const lessonsPercent = 65;
  const monthlyHours = 12.5;
  const growthPercent = 20;

  return (
    <div className="space-y-6 pb-8">

      {/* Mensaje de bienvenida */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-slate-800 mb-3">
          {t('home.welcome', { name })}
        </h1>
      </div>

      {/* Racha diaria */}
      <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-3xl p-8 text-white shadow-xl border border-white/20 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                <Zap className="text-white" size={28} />
              </div>
              <div>
                <div className="text-sm text-white/80 font-medium">
                  {t('home.streak.current')}
                </div>
                <div className="text-4xl font-bold">
                  {t('home.streak.days', { days: streakDays })}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-white/80">
                {t('home.streak.record')}
              </div>
              <div className="text-2xl font-bold">
                {t('home.streak.recordDays', { recordDays })}
              </div>
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/30">
            <p className="text-sm text-white/90">
              {t('home.streak.motivation', { daysLeft })}
            </p>
          </div>
        </div>
      </div>

      {/* Progreso de vocabulario */}
      <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 border border-white/40 shadow-lg">
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-gradient-to-b from-violet-500 to-purple-500 rounded-full" />
          {t('home.vocabProgress.title')}
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-2 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center border border-emerald-200/50">
              <Award className="text-emerald-600" size={28} />
            </div>
            <div className="text-3xl font-bold text-slate-800">{vocabMastered}</div>
            <div className="text-xs text-slate-600 font-medium">
              {t('home.vocabProgress.mastered')}
            </div>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-2 rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center border border-blue-200/50">
              <Book className="text-blue-600" size={28} />
            </div>
            <div className="text-3xl font-bold text-slate-800">{vocabLearned}</div>
            <div className="text-xs text-slate-600 font-medium">
              {t('home.vocabProgress.learned')}
            </div>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-2 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center border border-violet-200/50">
              <Zap className="text-violet-600" size={28} />
            </div>
            <div className="text-3xl font-bold text-slate-800">{vocabNewToday}</div>
            <div className="text-xs text-slate-600 font-medium">
              {t('home.vocabProgress.newToday')}
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas generales */}
      <div className="grid grid-cols-2 gap-4">
        {/* Lecciones completadas */}
        <div className="bg-white/60 backdrop-blur-md rounded-2xl p-5 border border-white/40 shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-100 to-purple-100 rounded-xl flex items-center justify-center border border-violet-200/50">
              <Book className="text-violet-600" size={22} />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">{lessonsCompleted}</div>
              <div className="text-xs text-slate-600">{t('stats.lessons')}</div>
            </div>
          </div>
          <div className="bg-white/50 backdrop-blur-sm rounded-full h-2 overflow-hidden border border-white/40">
            <div className="h-full bg-gradient-to-r from-violet-500 to-purple-500 w-[65%]" />
          </div>
          <div className="text-xs text-slate-600 mt-1.5">
            {t('stats.lessonsCompletion', { percent: lessonsPercent })}
          </div>
        </div>

        {/* Tiempo total */}
        <div className="bg-white/60 backdrop-blur-md rounded-2xl p-5 border border-white/40 shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center border border-emerald-200/50">
              <TrendingUp className="text-emerald-600" size={22} />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">{monthlyHours}h</div>
              <div className="text-xs text-slate-600">{t('stats.month')}</div>
            </div>
          </div>
          <div className="bg-white/50 backdrop-blur-sm rounded-full h-2 overflow-hidden border border-white/40">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 w-[80%]" />
          </div>
          <div className="text-xs text-slate-600 mt-1.5">
            {t('stats.growth', { percent: growthPercent })}
          </div>
        </div>
      </div>

      {/* Mini-logros / Badges */}
      <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 border border-white/40 shadow-lg">
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full" />
          {t('home.recentAchievements.title')}
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 text-center border border-amber-200/50">
            <div className="text-3xl mb-2">🏆</div>
            <div className="text-xs font-bold text-slate-800">
              {t('home.recentAchievements.streak')}
            </div>
          </div>
          <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-4 text-center border border-violet-200/50">
            <div className="text-3xl mb-2">⭐</div>
            <div className="text-xs font-bold text-slate-800">
              {t('home.recentAchievements.words')}
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 text-center border border-blue-200/50">
            <div className="text-3xl mb-2">🎯</div>
            <div className="text-xs font-bold text-slate-800">
              {t('home.recentAchievements.firstStory')}
            </div>
          </div>
        </div>
      </div>

      {/* Botón principal */}
      <button className="w-full py-5 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02] flex items-center justify-center gap-3">
        <Play size={28} fill="white" />
        {t('home.mainButton')}
      </button>
    </div>
  );
};

export default HomeScreen;
