import React from 'react';
import '../styles/animations.css';

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Líneas de circuito horizontales y verticales animadas */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(139, 92, 246, 0)" />
            <stop offset="50%" stopColor="rgba(139, 92, 246, 0.3)" />
            <stop offset="100%" stopColor="rgba(139, 92, 246, 0)" />
          </linearGradient>
        </defs>
        
        {/* Líneas horizontales que se mueven */}
        <line x1="0" y1="100" x2="1000" y2="100" stroke="url(#lineGradient)" strokeWidth="1" className="animate-circuit-h1" />
        <line x1="0" y1="250" x2="1000" y2="250" stroke="url(#lineGradient)" strokeWidth="1" className="animate-circuit-h2" />
        <line x1="0" y1="400" x2="1000" y2="400" stroke="url(#lineGradient)" strokeWidth="1" className="animate-circuit-h3" />
        <line x1="0" y1="550" x2="1000" y2="550" stroke="url(#lineGradient)" strokeWidth="1" className="animate-circuit-h1" />
        <line x1="0" y1="700" x2="1000" y2="700" stroke="url(#lineGradient)" strokeWidth="1" className="animate-circuit-h2" />
        
        {/* Líneas verticales que se mueven */}
        <line x1="150" y1="0" x2="150" y2="1000" stroke="url(#lineGradient)" strokeWidth="1" className="animate-circuit-v1" />
        <line x1="350" y1="0" x2="350" y2="1000" stroke="url(#lineGradient)" strokeWidth="1" className="animate-circuit-v2" />
        <line x1="550" y1="0" x2="550" y2="1000" stroke="url(#lineGradient)" strokeWidth="1" className="animate-circuit-v3" />
        <line x1="750" y1="0" x2="750" y2="1000" stroke="url(#lineGradient)" strokeWidth="1" className="animate-circuit-v1" />
      </svg>

      {/* Partículas blancas/violetas que aparecen y desaparecen */}
      <div className="absolute top-[15%] left-[20%] w-1 h-1 bg-violet-400 rounded-full animate-particle-fade" style={{ animationDelay: '0s' }} />
      <div className="absolute top-[25%] left-[40%] w-1.5 h-1.5 bg-white rounded-full animate-particle-fade" style={{ animationDelay: '1s' }} />
      <div className="absolute top-[35%] left-[60%] w-1 h-1 bg-violet-300 rounded-full animate-particle-fade" style={{ animationDelay: '2s' }} />
      <div className="absolute top-[45%] left-[80%] w-1 h-1 bg-white rounded-full animate-particle-fade" style={{ animationDelay: '1.5s' }} />
      <div className="absolute top-[55%] left-[30%] w-1.5 h-1.5 bg-violet-400 rounded-full animate-particle-fade" style={{ animationDelay: '2.5s' }} />
      <div className="absolute top-[65%] left-[50%] w-1 h-1 bg-white rounded-full animate-particle-fade" style={{ animationDelay: '3s' }} />
      <div className="absolute top-[75%] left-[70%] w-1 h-1 bg-violet-300 rounded-full animate-particle-fade" style={{ animationDelay: '0.5s' }} />
      <div className="absolute top-[85%] left-[25%] w-1.5 h-1.5 bg-white rounded-full animate-particle-fade" style={{ animationDelay: '3.5s' }} />
      <div className="absolute top-[20%] left-[75%] w-1 h-1 bg-violet-400 rounded-full animate-particle-fade" style={{ animationDelay: '1.2s' }} />
      <div className="absolute top-[60%] left-[15%] w-1 h-1 bg-white rounded-full animate-particle-fade" style={{ animationDelay: '2.8s' }} />

      {/* Efecto de escaneo sutil */}
      <div className="absolute inset-0 animate-scan" style={{
        background: 'linear-gradient(to bottom, transparent 0%, rgba(139, 92, 246, 0.05) 50%, transparent 100%)',
        height: '200px',
      }} />

      {/* Rejilla de circuito de fondo */}
      <div className="absolute inset-0" style={{
        backgroundImage: `
          linear-gradient(to right, rgba(139, 92, 246, 0.03) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(139, 92, 246, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '100px 100px'
      }} />

      {/* Nodos de circuito */}
      <div className="absolute top-[20%] left-[30%] w-2 h-2 bg-violet-400/40 rounded-full animate-pulse-slow" />
      <div className="absolute top-[40%] left-[60%] w-2 h-2 bg-violet-400/40 rounded-full animate-pulse-slow" style={{ animationDelay: '1s' }} />
      <div className="absolute top-[60%] left-[40%] w-2 h-2 bg-violet-400/40 rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }} />
      <div className="absolute top-[80%] left-[70%] w-2 h-2 bg-violet-400/40 rounded-full animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
    </div>
  );
};

export default AnimatedBackground;