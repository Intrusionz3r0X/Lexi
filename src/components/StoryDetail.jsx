import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  BookmarkPlus,
  X,
  Speaker
} from 'lucide-react';
import ttsService from '../services/ttsService';

// Mapeo de colores válidos para Tailwind
const gradientMap = {
  'from-rose-400 to-pink-500': 'from-rose-400 to-pink-500',
  'from-amber-400 to-orange-500': 'from-amber-400 to-orange-500',
  'from-indigo-400 to-purple-500': 'from-indigo-400 to-purple-500'
};

const StoryDetail = ({ story, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedWord, setSelectedWord] = useState(null);
  const [playbackRate, setPlaybackRate] = useState(1.0);

  const transcript = story.transcript || [];
  const totalDuration = story.duration || 38;
  const culturalContent = story.culturalContent || null;

  // Obtener línea actual según el tiempo
  const currentLine = transcript.find(
    (line) => currentTime >= line.startTime && currentTime < line.endTime
  );

  // Simulación de reproducción
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalDuration) {
            setIsPlaying(false);
            return totalDuration;
          }
          return parseFloat((prev + 0.1).toFixed(1));
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handlePlayPause = () => setIsPlaying(!isPlaying);
  const handleSkipBack = () => setCurrentTime(Math.max(0, currentTime - 5));
  const handleSkipForward = () => setCurrentTime(Math.min(totalDuration, currentTime + 5));

  const handleWordClick = (word) => {
    setSelectedWord(word);
    setIsPlaying(false);
    ttsService.speakFrench(word.text);
  };

  const handlePlayWordAudio = () => {
    if (selectedWord) ttsService.speakFrench(selectedWord.text);
  };

  const handleAddToDeck = (word) => {
    console.log('Palabra agregada al deck:', word);
    alert(`"${word.text}" agregada a tu deck de vocabulario ✅`);
    setSelectedWord(null);
  };

  const cyclePlaybackRate = () => {
    const rates = [0.5, 0.75, 1.0, 1.25, 1.5];
    const currentIndex = rates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    const newRate = rates[nextIndex];
    setPlaybackRate(newRate);
    ttsService.setRate(newRate);
  };

  const progress = (currentTime / totalDuration) * 100;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Clases de gradiente seguras para Tailwind
  const gradientClass = gradientMap[story.color] || 'from-slate-400 to-slate-500';

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
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

      {/* Card principal */}
      <div className="bg-white/60 backdrop-blur-md rounded-3xl overflow-hidden shadow-xl border border-white/40">
        <div className={`relative aspect-video bg-gradient-to-br ${gradientClass}`}>
          <div className="absolute inset-0 flex items-center justify-center">
            <BookmarkPlus className="text-white/20 drop-shadow-2xl" size={100} />
          </div>
          <div className="absolute top-4 left-4 flex gap-2">
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r ${gradientClass} text-white shadow-lg border border-white/30`}>
              📖 {story.type.toUpperCase()}
            </span>
            <span className="px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-semibold border border-white/30 shadow-lg">
              {story.difficulty}
            </span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        </div>

        {/* Controles */}
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <div className="bg-slate-200/50 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${gradientClass} transition-all duration-300`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-600">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(totalDuration)}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6">
            <button
              onClick={handleSkipBack}
              className="w-12 h-12 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-all"
            >
              <SkipBack className="text-slate-700" size={20} />
            </button>

            <button
              onClick={handlePlayPause}
              className={`w-16 h-16 rounded-full bg-gradient-to-br ${gradientClass} shadow-xl hover:shadow-2xl flex items-center justify-center transition-all hover:scale-105`}
            >
              {isPlaying ? (
                <Pause className="text-white" size={28} fill="white" />
              ) : (
                <Play className="text-white ml-1" size={28} fill="white" />
              )}
            </button>

            <button
              onClick={handleSkipForward}
              className="w-12 h-12 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-all"
            >
              <SkipForward className="text-slate-700" size={20} />
            </button>
          </div>

          <div className="flex justify-center gap-4 pt-2">
            <button
              onClick={cyclePlaybackRate}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-all"
            >
              <Volume2 size={16} />
              {playbackRate}x
            </button>
          </div>
        </div>
      </div>

      {/* Karaoke de palabras */}
      <div className="bg-white/60 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/40 min-h-[300px] flex flex-col items-center justify-center">
        {currentLine ? (
          <div className="w-full space-y-8">
            <div className="text-center leading-relaxed">
              <div className="flex flex-wrap justify-center gap-3 text-3xl font-bold">
                {currentLine.words.map((word, index) => {
                  const isActive = currentTime >= word.start && currentTime < word.end;
                  const isPast = currentTime >= word.end;
                  return (
                    <span
                      key={index}
                      onClick={() => handleWordClick(word)}
                      className={`cursor-pointer transition-all duration-300 hover:scale-110 inline-block ${
                        isActive
                          ? 'text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600 scale-110 drop-shadow-lg'
                          : isPast
                          ? 'text-slate-400'
                          : 'text-slate-300'
                      }`}
                    >
                      {word.text}
                    </span>
                  );
                })}
              </div>
            </div>

       

            <div className="flex justify-center">
              <div className="h-1.5 w-32 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full animate-pulse" />
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
              <Play className="text-violet-600" size={32} />
            </div>
            <p className="text-slate-500 text-lg font-medium">Presiona play para comenzar</p>
          </div>
        )}
      </div>

      {/* Modal palabra seleccionada */}
      {/* Modal de palabra seleccionada */}
{selectedWord && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-white/40">
      {/* Header con palabra */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <h3 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600 mb-2">
            {selectedWord.text}
          </h3>
          <p className="text-xl text-slate-600">
            {selectedWord.translation}
          </p>
        </div>
        <button
          onClick={() => setSelectedWord(null)}
          className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-all flex-shrink-0 ml-4"
        >
          <X className="text-slate-700" size={20} />
        </button>
      </div>

      {/* Botones de acción */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={handlePlayWordAudio}
          className="py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
        >
          <Speaker size={20} />
          Audio
        </button>

        <button
          onClick={() => handleAddToDeck(selectedWord)}
          className="py-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
        >
          <BookmarkPlus size={20} />
          Guardar
        </button>
      </div>

      {/* Contenido generado dinámicamente */}
      <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-5 border border-violet-100">
        <h4 className="text-sm font-bold text-violet-900 mb-3 flex items-center gap-2">
          <BookmarkPlus className="text-violet-600" size={16} />
          Información interesante
        </h4>
        <div className="space-y-3">
          {/* Aquí pondremos los párrafos generados por IA */}
          {selectedWord.iaContent
            ? selectedWord.iaContent.map((p, idx) => (
                <p key={idx} className="text-sm text-slate-700 leading-relaxed">
                  {p}
                </p>
              ))
            : <p className="text-sm text-slate-700 leading-relaxed">Generando contenido...</p>
          }
        </div>
      </div>
    </div>
  </div>
)}


      {/* Estadísticas */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/60 backdrop-blur-md rounded-2xl p-5 border border-white/40 shadow-lg">
          <div className="text-sm text-slate-600 mb-1">Palabras únicas</div>
          <div className="text-2xl font-bold text-slate-800">{story.wordsCount || 42}</div>
          <div className="text-xs text-slate-500 mt-1">En esta historia</div>
        </div>

        <div className="bg-white/60 backdrop-blur-md rounded-2xl p-5 border border-white/40 shadow-lg">
          <div className="text-sm text-slate-600 mb-1">Progreso</div>
          <div className="text-2xl font-bold text-slate-800">{Math.round(progress)}%</div>
          <div className="text-xs text-slate-500 mt-1">Completado</div>
        </div>
      </div>
    </div>
  );
};

export default StoryDetail;
