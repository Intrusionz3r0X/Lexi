import React, { useState } from 'react';
import { Camera, Mail, Bell, LogOut } from 'lucide-react';
import { languages } from '../../data/languages';
import { useUserSettings } from '../../hooks/useUserSettings';
import { useTranslation } from '../../i18n';

const SettingsScreen = () => {
  const { user } = useUserSettings();
  const nativeLang = user.profile.nativeLang;
  const { t } = useTranslation(nativeLang);

  const [nativeLangState, setNativeLangState] = useState(user.profile.nativeLang);
  const [targetLangState, setTargetLangState] = useState(user.profile.learningLang);

  const [showTooltip, setShowTooltip] = useState({
    wordsPerSession: false,
    storyRatio: false,
    reflectionTime: false,
    syntaxComplexity: false,
  });

  const toggleTooltip = (key) => {
    setShowTooltip((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const hideTooltip = (key) => {
    setShowTooltip((prev) => ({ ...prev, [key]: false }));
  };

  return (
    <div className="space-y-6 pb-8">

      {/* Perfil de usuario */}
      <div className="bg-white rounded-3xl p-6 shadow-lg shadow-slate-200/60 border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="relative group cursor-pointer">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {user.profile.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="absolute bottom-0 right-0 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-white group-hover:scale-110 transition-transform">
              <Camera className="text-violet-600" size={14} />
            </div>
          </div>
          <div className="flex-1 space-y-1">
            <h2 className="text-2xl font-bold text-slate-800">{user.profile.name}</h2>
            <p className="text-slate-500">{user.profile.email}</p>
          </div>
        </div>
      </div>

      {/* Información personal */}
      <div className="bg-white rounded-3xl p-6 shadow-lg shadow-slate-200/60 border border-slate-100 space-y-4">
        <h3 className="text-lg font-bold text-slate-800 mb-4">{t('settings.profile.title')}</h3>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">{t('settings.profile.name')}</label>
          <input
            type="text"
            defaultValue={user.profile.name}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-slate-800"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">{t('settings.profile.email')}</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="email"
              defaultValue={user.profile.email}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* Idioma nativo */}
      <div className="bg-white rounded-3xl p-6 shadow-lg shadow-slate-200/60 border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-4">{t('settings.languages.native')}</h3>
        <select
          value={nativeLangState}
          onChange={(e) => setNativeLangState(e.target.value)}
          className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-slate-800"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.name}
            </option>
          ))}
        </select>
      </div>

      {/* Idioma objetivo */}
      <div className="bg-white rounded-3xl p-6 shadow-lg shadow-slate-200/60 border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-4">{t('settings.languages.target')}</h3>
        <select
          value={targetLangState}
          onChange={(e) => setTargetLangState(e.target.value)}
          className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-slate-800"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.name}
            </option>
          ))}
        </select>
      </div>

      {/* Dificultad */}
      <div className="bg-white rounded-3xl p-6 shadow-lg shadow-slate-200/60 border border-slate-100 space-y-4">
        <h3 className="text-lg font-bold text-slate-800 mb-4">{t('settings.difficulty.title')}</h3>

        {/* Cantidad de palabras nuevas por sesión */}
        <div className="relative mb-4" onMouseLeave={() => hideTooltip('wordsPerSession')}>
          <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
            {t('settings.difficulty.wordsPerSession')}
            <button
              type="button"
              onClick={() => toggleTooltip('wordsPerSession')}
              className="w-5 h-5 bg-violet-100 rounded-full flex items-center justify-center text-violet-600 text-xs font-bold hover:bg-violet-200 transition-all"
            >
              ?
            </button>
          </label>
          {showTooltip.wordsPerSession && (
            <div className="absolute left-0 mt-1 w-72 p-3 bg-slate-50 border border-slate-200 rounded-xl shadow-lg text-slate-800 text-sm z-10">
              <p>{t('settings.difficulty.wordsPerSessionTooltip')}</p>
            </div>
          )}
          <input
            type="number"
            defaultValue={5}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
          />
        </div>

        {/* Proporción en historias */}
        <div className="relative mb-4" onMouseLeave={() => hideTooltip('storyRatio')}>
          <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
            {t('settings.difficulty.storyRatio')}
            <button
              type="button"
              onClick={() => toggleTooltip('storyRatio')}
              className="w-5 h-5 bg-violet-100 rounded-full flex items-center justify-center text-violet-600 text-xs font-bold hover:bg-violet-200 transition-all"
            >
              ?
            </button>
          </label>
          {showTooltip.storyRatio && (
            <div className="absolute left-0 mt-1 w-72 p-3 bg-slate-50 border border-slate-200 rounded-xl shadow-lg text-slate-800 text-sm z-10">
              <p>{t('settings.difficulty.storyRatioTooltip')}</p>
            </div>
          )}
          <select className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-slate-800">
            <option>{t('settings.difficulty.easy')}</option>
            <option>{t('settings.difficulty.normal')}</option>
            <option>{t('settings.difficulty.hard')}</option>
          </select>
        </div>

        {/* Tiempo de reflexión */}
        <div className="relative mb-4" onMouseLeave={() => hideTooltip('reflectionTime')}>
          <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
            {t('settings.difficulty.reflectionTime')}
            <button
              type="button"
              onClick={() => toggleTooltip('reflectionTime')}
              className="w-5 h-5 bg-violet-100 rounded-full flex items-center justify-center text-violet-600 text-xs font-bold hover:bg-violet-200 transition-all"
            >
              ?
            </button>
          </label>
          {showTooltip.reflectionTime && (
            <div className="absolute left-0 mt-1 w-72 p-3 bg-slate-50 border border-slate-200 rounded-xl shadow-lg text-slate-800 text-sm z-10">
              <p>{t('settings.difficulty.reflectionTimeTooltip')}</p>
            </div>
          )}
          <select className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-slate-800">
            <option>{t('settings.difficulty.easy')}</option>
            <option>{t('settings.difficulty.normal')}</option>
            <option>{t('settings.difficulty.hard')}</option>
          </select>
        </div>

        {/* Complejidad sintáctica */}
        <div className="relative mb-4" onMouseLeave={() => hideTooltip('syntaxComplexity')}>
          <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
            {t('settings.difficulty.syntaxComplexity')}
            <button
              type="button"
              onClick={() => toggleTooltip('syntaxComplexity')}
              className="w-5 h-5 bg-violet-100 rounded-full flex items-center justify-center text-violet-600 text-xs font-bold hover:bg-violet-200 transition-all"
            >
              ?
            </button>
          </label>
          {showTooltip.syntaxComplexity && (
            <div className="absolute left-0 mt-1 w-72 p-3 bg-slate-50 border border-slate-200 rounded-xl shadow-lg text-slate-800 text-sm z-10">
              <p>{t('settings.difficulty.syntaxComplexityTooltip')}</p>
            </div>
          )}
          <select className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-slate-800">
            <option>{t('settings.difficulty.easy')}</option>
            <option>{t('settings.difficulty.normal')}</option>
            <option>{t('settings.difficulty.hard')}</option>
          </select>
        </div>
      </div>

      {/* Notificaciones */}
      <div className="bg-white rounded-3xl p-6 shadow-lg shadow-slate-200/60 border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
              <Bell className="text-violet-600" size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">{t('settings.notifications.title')}</h3>
              <p className="text-sm text-slate-500">{t('settings.notifications.subtitle')}</p>
            </div>
          </div>
          <button className="w-12 h-7 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full relative shadow-lg">
            <div className="absolute right-0.5 top-0.5 w-6 h-6 bg-white rounded-full shadow-sm" />
          </button>
        </div>
      </div>

      {/* Cerrar sesión */}
      <button className="w-full py-4 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 border border-red-100">
        <LogOut size={20} />
        {t('settings.logout')}
      </button>
    </div>
  );
};

export default SettingsScreen;
