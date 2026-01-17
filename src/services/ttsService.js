/**
 * Servicio de Text-to-Speech para Lexi App
 * Maneja la pronunciación de palabras usando la Web Speech API
 */

class TTSService {
  constructor() {
    this.synth = window.speechSynthesis;
    this.defaultLang = 'fr-FR';
    this.defaultRate = 0.8;
    this.defaultPitch = 1;
    this.defaultVolume = 1;
    this.currentRate = 0.8; // Rate actual que se puede modificar
  }

  /**
   * Verifica si el navegador soporta TTS
   */
  isSupported() {
    return 'speechSynthesis' in window;
  }

  /**
   * Establece la velocidad de reproducción global
   */
  setRate(rate) {
    this.currentRate = rate;
  }

  /**
   * Obtiene la velocidad actual
   */
  getRate() {
    return this.currentRate;
  }

  /**
   * Reproduce una palabra o frase
   * @param {string} text - Texto a reproducir
   * @param {object} options - Opciones de configuración
   */
  speak(text, options = {}) {
    if (!this.isSupported()) {
      console.warn('Text-to-Speech no está soportado en este navegador');
      return;
    }

    // Cancelar cualquier reproducción en curso
    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configurar opciones (usar currentRate si no se especifica)
    utterance.lang = options.lang || this.defaultLang;
    utterance.rate = options.rate !== undefined ? options.rate : this.currentRate;
    utterance.pitch = options.pitch || this.defaultPitch;
    utterance.volume = options.volume || this.defaultVolume;

    // Callbacks opcionales
    if (options.onStart) {
      utterance.onstart = options.onStart;
    }
    
    if (options.onEnd) {
      utterance.onend = options.onEnd;
    }

    if (options.onError) {
      utterance.onerror = options.onError;
    }

    // Reproducir
    this.synth.speak(utterance);
  }

  /**
   * Reproduce una palabra en francés con configuración por defecto
   * @param {string} word - Palabra a pronunciar
   */
  speakFrench(word, callback) {
    this.speak(word, {
      lang: 'fr-FR',
      rate: this.currentRate,
      onEnd: callback
    });
  }

  /**
   * Reproduce una palabra en español
   * @param {string} word - Palabra a pronunciar
   */
  speakSpanish(word, callback) {
    this.speak(word, {
      lang: 'es-ES',
      rate: this.currentRate,
      onEnd: callback
    });
  }

  /**
   * Detiene cualquier reproducción en curso
   */
  stop() {
    if (this.isSupported()) {
      this.synth.cancel();
    }
  }

  /**
   * Pausa la reproducción actual
   */
  pause() {
    if (this.isSupported()) {
      this.synth.pause();
    }
  }

  /**
   * Reanuda la reproducción pausada
   */
  resume() {
    if (this.isSupported()) {
      this.synth.resume();
    }
  }

  /**
   * Obtiene las voces disponibles
   */
  getVoices() {
    if (this.isSupported()) {
      return this.synth.getVoices();
    }
    return [];
  }

  /**
   * Obtiene voces específicas por idioma
   * @param {string} lang - Código de idioma (ej: 'fr-FR', 'es-ES')
   */
  getVoicesByLang(lang) {
    return this.getVoices().filter(voice => voice.lang === lang);
  }
}

// Exportar instancia única (Singleton)
export const ttsService = new TTSService();

export default ttsService;