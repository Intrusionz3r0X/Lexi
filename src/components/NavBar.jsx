import React from 'react';
import { Home, Book, Mic, Settings, Award } from 'lucide-react';
import { useUserSettings } from '../hooks/useUserSettings';
import { useTranslation } from '../i18n';

const NavBar = ({ currentScreen, onNavigate }) => {
  const { user } = useUserSettings();
  const nativeLang = user.profile.nativeLang;

  // Hook de traducción
  const { t } = useTranslation(nativeLang);

  const navItems = [
    { id: 'home', icon: Home, label: t('navBar.home') },
    { id: 'lessons', icon: Book, label: t('navBar.lessons') },
    { id: 'stories', icon: Mic, label: t('navBar.stories') },
    { id: 'achievements', icon: Award, label: t('navBar.achievements') },
    { id: 'settings', icon: Settings, label: t('navBar.settings') },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-200 px-6 py-3 shadow-lg">
      <div className="max-w-2xl mx-auto flex justify-around">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className="flex flex-col items-center gap-1.5 transition-all group"
          >
            <div
              className={`p-2.5 rounded-xl transition-all ${
                currentScreen === item.id
                  ? 'bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-purple-500/30'
                  : 'text-slate-400 group-hover:text-slate-600'
              }`}
            >
              <item.icon
                size={22}
                className={currentScreen === item.id ? 'text-white' : ''}
              />
            </div>
            <span
              className={`text-xs font-semibold ${
                currentScreen === item.id ? 'text-violet-600' : 'text-slate-400'
              }`}
            >
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default NavBar;
