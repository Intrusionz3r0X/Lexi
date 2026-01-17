import React from 'react';
import { Play, Award, Book, Zap, TrendingUp } from 'lucide-react';

const HomeScreen = () => {
  return (
    <div className="space-y-6 pb-8">
      {/* Mensaje de bienvenida personalizado */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-slate-800 mb-3">
          Bonjour, Adrian! 👋
        </h1>
        <p className="text-slate-600 text-lg">
          Hoy tu plan de estudio incluye: <span className="font-semibold text-violet-600">10 palabras nuevas</span>, 
          <span className="font-semibold text-violet-600"> 1 historia</span> y 
          <span className="font-semibold text-violet-600"> 2 ejercicios</span>
        </p>
      </div>

      {/* Racha diaria - Destacada */}
      <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-3xl p-8 text-white shadow-xl border border-white/20 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                <Zap className="text-white" size={28} />
              </div>
              <div>
                <div className="text-sm text-white/80 font-medium">Racha actual</div>
                <div className="text-4xl font-bold">7 días 🔥</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-white/80">Récord personal</div>
              <div className="text-2xl font-bold">12 días</div>
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/30">
            <p className="text-sm text-white/90">
              ¡Increíble! Estás a solo 5 días de tu mejor racha. ¡Sigue así! 💪
            </p>
          </div>
        </div>
      </div>

      {/* Progreso de palabras */}
      <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 border border-white/40 shadow-lg">
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-gradient-to-b from-violet-500 to-purple-500 rounded-full" />
          Progreso de Vocabulario
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-2 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center border border-emerald-200/50">
              <Award className="text-emerald-600" size={28} />
            </div>
            <div className="text-3xl font-bold text-slate-800">245</div>
            <div className="text-xs text-slate-600 font-medium">Dominadas</div>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-2 rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center border border-blue-200/50">
              <Book className="text-blue-600" size={28} />
            </div>
            <div className="text-3xl font-bold text-slate-800">89</div>
            <div className="text-xs text-slate-600 font-medium">Aprendidas</div>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-2 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center border border-violet-200/50">
              <Zap className="text-violet-600" size={28} />
            </div>
            <div className="text-3xl font-bold text-slate-800">10</div>
            <div className="text-xs text-slate-600 font-medium">Nuevas hoy</div>
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
              <div className="text-2xl font-bold text-slate-800">24</div>
              <div className="text-xs text-slate-600">Lecciones</div>
            </div>
          </div>
          <div className="bg-white/50 backdrop-blur-sm rounded-full h-2 overflow-hidden border border-white/40">
            <div className="h-full bg-gradient-to-r from-violet-500 to-purple-500 w-[65%]" />
          </div>
          <div className="text-xs text-slate-600 mt-1.5">65% completado</div>
        </div>

        {/* Tiempo total */}
        <div className="bg-white/60 backdrop-blur-md rounded-2xl p-5 border border-white/40 shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center border border-emerald-200/50">
              <TrendingUp className="text-emerald-600" size={22} />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">12.5h</div>
              <div className="text-xs text-slate-600">Este mes</div>
            </div>
          </div>
          <div className="bg-white/50 backdrop-blur-sm rounded-full h-2 overflow-hidden border border-white/40">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 w-[80%]" />
          </div>
          <div className="text-xs text-slate-600 mt-1.5">+20% vs mes anterior</div>
        </div>
      </div>

      {/* Mini-logros / Badges */}
      <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 border border-white/40 shadow-lg">
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full" />
          Logros Recientes
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 text-center border border-amber-200/50">
            <div className="text-3xl mb-2">🏆</div>
            <div className="text-xs font-bold text-slate-800">7 días racha</div>
          </div>
          <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-4 text-center border border-violet-200/50">
            <div className="text-3xl mb-2">⭐</div>
            <div className="text-xs font-bold text-slate-800">245 palabras</div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 text-center border border-blue-200/50">
            <div className="text-3xl mb-2">🎯</div>
            <div className="text-xs font-bold text-slate-800">Primera historia</div>
          </div>
        </div>
      </div>

      {/* Sugerencia de acción de Lexi (CTA) */}
      <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-3xl p-6 border border-rose-200/50 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-200/30 rounded-full blur-2xl" />
        <div className="relative z-10">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-2xl">💡</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Recomendación de Lexi</h3>
              <p className="text-slate-600 text-sm">
                Tienes <span className="font-semibold text-rose-600">12 palabras débiles</span> que necesitan repaso. 
                ¡Practícalas ahora para fortalecerlas!
              </p>
            </div>
          </div>
          <button className="w-full py-3.5 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2">
            <Play size={20} fill="white" />
            Repasar palabras débiles
          </button>
        </div>
      </div>

      {/* Botón principal de acción */}
      <button className="w-full py-5 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02] flex items-center justify-center gap-3">
        <Play size={28} fill="white" />
        Continuar aprendiendo
      </button>
    </div>
  );
};

export default HomeScreen;