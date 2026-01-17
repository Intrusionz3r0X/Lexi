import React from 'react';
import { Camera, Mail, Bell, LogOut } from 'lucide-react';
import { languages } from '../../data/languages';

const SettingsScreen = () => {
  return (
    <div className="space-y-6 pb-8">
      {/* Perfil de usuario */}
      <div className="bg-white rounded-3xl p-6 shadow-lg shadow-slate-200/60 border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="relative group cursor-pointer">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              AD
            </div>
            <div className="absolute bottom-0 right-0 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-white group-hover:scale-110 transition-transform">
              <Camera className="text-violet-600" size={14} />
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-800">Adrian</h2>
            <p className="text-slate-500">adrian@lexi.app</p>
          </div>
        </div>
      </div>

      {/* Información personal */}
      <div className="bg-white rounded-3xl p-6 shadow-lg shadow-slate-200/60 border border-slate-100 space-y-4">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Información personal</h3>
        
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre completo</label>
          <input
            type="text"
            defaultValue="Adrian"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all text-slate-800"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Correo electrónico</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="email"
              defaultValue="adrian@lexi.app"
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* Preferencias de idioma */}
      <div className="bg-white rounded-3xl p-6 shadow-lg shadow-slate-200/60 border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Idioma nativo</h3>
        
        <div className="grid grid-cols-2 gap-3">
          {languages.map((lang) => (
            <button
              key={lang.code}
              className={`p-4 rounded-xl border-2 transition-all ${
                lang.code === 'es'
                  ? 'border-violet-500 bg-violet-50'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="text-3xl mb-1">{lang.flag}</div>
              <div className="text-sm font-semibold text-slate-800">{lang.name}</div>
            </button>
          ))}
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
              <h3 className="text-base font-bold text-slate-800">Recordatorios diarios</h3>
              <p className="text-sm text-slate-500">Mantén tu racha activa</p>
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
        Cerrar sesión
      </button>
    </div>
  );
};

export default SettingsScreen;