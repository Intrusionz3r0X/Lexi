import React, { useState } from 'react';
import { ArrowLeft, Play, Pause, SkipBack, SkipForward, Volume2, Settings, BookOpen, Headphones } from 'lucide-react';

const StoryDetail = ({ story, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);

  // Datos de ejemplo para la transcripción
  const transcript = [
    {
      time: '0:00',
      french: 'Bonjour! Je m\'appelle Marie et aujourd\'hui je vais vous raconter une histoire.',
      spanish: 'Hola! Me llamo Marie y hoy voy a contarles una historia.',
      highlighted: progress > 0 && progress < 15
    },
    {
      time: '0:08',
      french: 'C\'est une belle journée à Paris. Le soleil brille et les oiseaux chantent.',
      spanish: 'Es un hermoso día en París. El sol brilla y los pájaros cantan.',
      highlighted: progress >= 15 && progress < 30
    },
    {
      time: '0:15',
      french: 'Je marche dans les rues de Montmartre avec mon appareil photo.',
      spanish: 'Camino por las calles de Montmartre con mi cámara.',
      highlighted: progress >= 30 && progress < 45
    },
    {
      time: '0:22',
      french: 'Les cafés sont pleins de gens qui prennent leur petit-déjeuner.',
      spanish: 'Los cafés están llenos de gente que está desayunando.',
      highlighted: progress >= 45 && progress < 60
    },
    {
      time: '0:30',
      french: 'L\'odeur des croissants frais remplit l\'air. C\'est magnifique!',
      spanish: 'El olor de los croissants frescos llena el aire. ¡Es magnífico!',
      highlighted: progress >= 60
    }
  ];

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    // Aquí iría la lógica real de reproducción de audio
    if (!isPlaying) {
      // Simular progreso del audio
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsPlaying(false);
            return 100;
          }
          return prev + 1;
        });
      }, 100);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header con botón de regresar */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-xl bg-white/60 backdrop-blur-md border border-white/40 shadow-lg flex items-center justify-center hover:bg-white/80 transition-all"
        >
          <ArrowLeft className="text-slate-800" size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-800">{story.title}</h1>
          <p className="text-sm text-slate-500">{story.narrator}</p>
        </div>
      </div>

      {/* Card principal de la historia */}
      <div className="bg-white/60 backdrop-blur-md rounded-3xl overflow-hidden shadow-xl border border-white/40">
        {/* Imagen/Cover de la historia */}
        <div className={`relative aspect-video bg-gradient-to-br ${story.color}`}>
          <div className="absolute inset-0 flex items-center justify-center">
            {story.type === 'Podcast' ? (
              <Headphones className="text-white/30 drop-shadow-2xl" size={120} />
            ) : (
              <BookOpen className="text-white/30 drop-shadow-2xl" size={120} />
            )}
          </div>
          
          {/* Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r ${story.color} text-white shadow-lg border border-white/30`}>
              {story.type === 'Podcast' ? '🎙️ PODCAST' : '📖 HISTORIA'}
            </span>
            <span className="px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-semibold border border-white/30 shadow-lg">
              {story.difficulty}
            </span>
          </div>

          {/* Gradiente inferior */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        </div>

        {/* Controles de reproducción */}
        <div className="p-6 space-y-4">
          {/* Barra de progreso */}
          <div className="space-y-2">
            <div className="bg-slate-200/50 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${story.color} transition-all duration-300`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-600">
              <span>{Math.floor(progress / 100 * 330)}s</span>
              <span>{story.duration}</span>
            </div>
          </div>

          {/* Botones de control */}
          <div className="flex items-center justify-center gap-6">
            <button className="w-12 h-12 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-all">
              <SkipBack className="text-slate-700" size={20} />
            </button>
            
            <button
              onClick={handlePlayPause}
              className={`w-16 h-16 rounded-full bg-gradient-to-br ${story.color} shadow-xl hover:shadow-2xl flex items-center justify-center transition-all hover:scale-105`}
            >
              {isPlaying ? (
                <Pause className="text-white" size={28} fill="white" />
              ) : (
                <Play className="text-white ml-1" size={28} fill="white" />
              )}
            </button>

            <button className="w-12 h-12 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-all">
              <SkipForward className="text-slate-700" size={20} />
            </button>
          </div>

          {/* Opciones adicionales */}
          <div className="flex justify-center gap-4 pt-2">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-all">
              <Volume2 size={16} />
              Velocidad: 1.0x
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-all">
              <Settings size={16} />
              Ajustes
            </button>
          </div>
        </div>
      </div>

      {/* Toggle para mostrar transcripción */}
      <button
        onClick={() => setShowTranscript(!showTranscript)}
        className="w-full py-4 bg-white/60 backdrop-blur-md rounded-2xl border border-white/40 shadow-lg hover:bg-white/80 transition-all flex items-center justify-center gap-2 font-semibold text-slate-800"
      >
        <BookOpen size={20} />
        {showTranscript ? 'Ocultar transcripción' : 'Ver transcripción'}
      </button>

      {/* Transcripción interactiva */}
      {showTranscript && (
        <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/40 space-y-4">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-gradient-to-b from-violet-500 to-purple-500 rounded-full" />
            Transcripción
          </h2>

          <div className="space-y-4">
            {transcript.map((item, index) => (
              <div
                key={index}
                className={`p-4 rounded-2xl transition-all ${
                  item.highlighted
                    ? 'bg-gradient-to-r from-violet-50 to-purple-50 border-2 border-violet-300 shadow-md'
                    : 'bg-white/50 border border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-violet-600 bg-violet-100 px-2 py-1 rounded-full">
                    {item.time}
                  </span>
                  {item.highlighted && (
                    <span className="text-xs font-bold text-violet-600 animate-pulse">
                      ▶ Reproduciendo
                    </span>
                  )}
                </div>
                <p className="text-base font-semibold text-slate-800 mb-2">
                  🇫🇷 {item.french}
                </p>
                <p className="text-sm text-slate-600">
                  🇪🇸 {item.spanish}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Información adicional */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/60 backdrop-blur-md rounded-2xl p-5 border border-white/40 shadow-lg">
          <div className="text-sm text-slate-600 mb-1">Palabras nuevas</div>
          <div className="text-2xl font-bold text-slate-800">24</div>
          <div className="text-xs text-slate-500 mt-1">En esta historia</div>
        </div>

        <div className="bg-white/60 backdrop-blur-md rounded-2xl p-5 border border-white/40 shadow-lg">
          <div className="text-sm text-slate-600 mb-1">Veces escuchada</div>
          <div className="text-2xl font-bold text-slate-800">0</div>
          <div className="text-xs text-slate-500 mt-1">¡Primera vez!</div>
        </div>
      </div>

      {/* Botón de acción */}
      <button className="w-full py-5 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02] flex items-center justify-center gap-3">
        <BookOpen size={24} />
        Practicar vocabulario de esta historia
      </button>
    </div>
  );
};

export default StoryDetail;