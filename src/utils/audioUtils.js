/**
 * Crea un contexto de audio
 */
export const createAudioContext = () => {
  return new (window.AudioContext || window.webkitAudioContext)();
};

/**
 * Reproduce sonido de éxito
 */
export const playSuccessSound = (ctx) => {
  try {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.setValueAtTime(523.25, ctx.currentTime);
    oscillator.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.5);
  } catch {
    console.log('Audio no disponible');
  }
};

/**
 * Reproduce sonido de error
 */
export const playErrorSound = (ctx) => {
  try {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.setValueAtTime(200, ctx.currentTime);
    oscillator.type = 'sawtooth';
    
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.3);
  } catch {
    console.log('Audio no disponible');
  }
};

/**
 * Sintetiza voz para leer texto
 */
export const speak = (text, lang = 'fr-FR') => {
  return new Promise((resolve) => {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.8;
    utterance.onend = resolve;
    speechSynthesis.speak(utterance);
  });
};