import React from 'react';
import { Play, Volume2, Mic, Book } from 'lucide-react';
import { stories } from '../../data/stories';

const StoriesScreen = ({ onSelectStory }) => {
  return (
    <div className="space-y-6 pb-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Historias & Podcasts
        </h1>
        <p className="text-slate-500">Aprende escuchando contenido auténtico</p>
      </div>

      {/* Grid de historias */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {stories.map((story) => (
          <div
            key={story.id}
            onClick={() => onSelectStory(story)}
            className="group cursor-pointer transition-all duration-300 hover:scale-[1.02]"
          >
            {/* Card estilo Netflix con glassmorphism */}
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-xl shadow-slate-200/50 backdrop-blur-sm border border-white/40">
              <div className={`absolute inset-0 bg-gradient-to-br ${story.color}`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  {story.type === 'Podcast' ? (
                    <Mic className="text-white/20 drop-shadow-2xl" size={120} />
                  ) : (
                    <Book className="text-white/20 drop-shadow-2xl" size={120} />
                  )}
                </div>
              </div>
              
              {/* Gradiente inferior cristalino */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              {/* Overlay cristalino en hover */}
              <div className="absolute inset-0 bg-white/20 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                <div className="w-20 h-20 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform">
                  <Play className="text-violet-600 ml-1" size={36} fill="currentColor" />
                </div>
              </div>

              {/* Badge de tipo con glassmorphism */}
              <div className="absolute top-4 right-4 px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-semibold border border-white/30 shadow-lg">
                {story.difficulty}
              </div>

              {/* Badge de tipo (Historia/Podcast) */}
              <div className="absolute top-4 left-4">
                <span className={`px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r ${story.color} text-white shadow-lg border border-white/30`}>
                  {story.type === 'Podcast' ? '🎙️ PODCAST' : '📖 HISTORIA'}
                </span>
              </div>

              {/* Información inferior con glassmorphism */}
              <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/80 to-transparent backdrop-blur-sm">
                <h3 className="font-bold text-xl text-white mb-2 drop-shadow-lg">
                  {story.title}
                </h3>
                <div className="flex items-center gap-3 text-sm text-white/90">
                  <span className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/30">
                    <Volume2 size={14} />
                    {story.narrator}
                  </span>
                  <span className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/30">
                    <Play size={14} />
                    {Math.floor(story.duration / 60)}:{(story.duration % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              </div>

              {/* Brillo superior */}
              <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoriesScreen;