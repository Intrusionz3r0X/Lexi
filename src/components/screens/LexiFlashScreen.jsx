import React, { useState, useEffect, useRef } from "react";
import {
  Volume2,
  RotateCcw,
  Check,
  X,
  Clock,
  ArrowRight,
  Mic,
  Keyboard,
  MicOff,
  ChevronRight,
  Target,
  Brain,
  Award,
  Zap,
} from "lucide-react";
import cardExamples from "../../data/cardsexamples.json";
import InteractiveWords from "../../shared/InteractiveWords";

// ----------------------------------------------------------------------
// FUNCIONES DE UTILIDAD
// ----------------------------------------------------------------------

/**
 * Mezcla aleatoriamente un array usando el algoritmo Fisher-Yates
 * @param {Array} array - Array a mezclar
 * @returns {Array} - Array mezclado
 */
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Calcula la distancia de Levenshtein entre dos cadenas
 * Usado para coincidencias aproximadas (fuzzy matching)
 */
const levenshtein = (a, b) => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1,
        );
      }
    }
  }

  return matrix[b.length][a.length];
};

/**
 * Normaliza texto para comparaciones (minúsculas, sin acentos, sin puntuación)
 */
const normalizeText = (text) => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/[^a-z0-9\s]/g, "");
};

/**
 * Verifica si hay una coincidencia aproximada entre dos textos
 */
const isFuzzyMatch = (input, target, threshold = 2) => {
  return levenshtein(normalizeText(input), normalizeText(target)) <= threshold;
};

/**
 * Verifica si la respuesta del usuario es correcta
 * Soporta coincidencias exactas y aproximadas según el modo
 */
const checkAnswer = (
  userAnswer,
  correctWord,
  correctMeaning,
  exactMode = false,
) => {
  const normalized = normalizeText(userAnswer);
  const normalizedWord = normalizeText(correctWord);
  const normalizedMeanings = correctMeaning
    .split("/")
    .map((m) => normalizeText(m));

  // Verificación de coincidencia exacta
  if (normalized === normalizedWord) return true;
  if (normalizedMeanings.some((meaning) => normalized === meaning)) return true;

  // Verificación de coincidencia aproximada (solo si no está en modo exacto)
  if (!exactMode) {
    if (isFuzzyMatch(normalized, normalizedWord)) return true;
    if (normalizedMeanings.some((meaning) => isFuzzyMatch(normalized, meaning)))
      return true;
  }

  return false;
};

// ----------------------------------------------------------------------
// COMPONENTE DE CONFETTI PARA CELEBRACIONES
// ----------------------------------------------------------------------

const Confetti = () => {
  const colors = ["#6366f1", "#8b5cf6", "#ec4899", "#10b981", "#f59e0b"];
  const confetti = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    animationDelay: Math.random() * 3,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * 360,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confetti.map((conf) => (
        <div
          key={conf.id}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: `${conf.left}%`,
            top: "-5%",
            backgroundColor: conf.color,
            animation: `confettiFall 3s linear ${conf.animationDelay}s forwards`,
            transform: `rotate(${conf.rotation}deg)`,
          }}
        />
      ))}
    </div>
  );
};

// ----------------------------------------------------------------------
// COMPONENTE PRINCIPAL DE LA APLICACIÓN
// ----------------------------------------------------------------------
const LexiFlashScreen = ({ category }) => {
  // --------------------------------------------------------------------
  // ESTADOS DE LA APLICACIÓN
  // --------------------------------------------------------------------
  const [isLoading, setIsLoading] = useState(true);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  // Estado del mazo de cartas
  const [deck, setDeck] = useState([]);
  useEffect(() => {
    if (!category) return;

    const filteredCards = cardExamples.filter((c) => c.deckId === category.id);
    setDeck(shuffleArray(filteredCards));

    // RESETEA isFirstLoad aquí también
    setInitialCardsLoaded(true);
    setIsLoading(false);
    setCorrectCards([]);
    setCurrentCard(null);
    setShowSummary(false);
    setFeedback(null);
    setPhase("idle");
    setShowOverlay(false);
    setIsReplaying(false);
    setSessionCompleted(false);
    setShowConfetti(false);
    setUserInput("");
    setIsRecording(false);
    setIsListening(false);
    setAudioAvailable(false);
  }, [category]);
  // Cartas respondidas correctamente
  const [correctCards, setCorrectCards] = useState([]);

  // Carta actual en juego
  const [currentCard, setCurrentCard] = useState(null);

  // Estados de UI y flujo
  const [showSummary, setShowSummary] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [phase, setPhase] = useState("idle");
  const [countdown, setCountdown] = useState(3);
  const [countdownProgress, setCountdownProgress] = useState(1);
  const [showOverlay, setShowOverlay] = useState(false);
  const [isReplaying, setIsReplaying] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [initialCardsLoaded, setInitialCardsLoaded] = useState(false);
  // Estados para modos de entrada
  const [inputMode, setInputMode] = useState("text");
  const [userInput, setUserInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [timeoutExpired, setTimeoutExpired] = useState(false);
  const [audioAvailable, setAudioAvailable] = useState(false);

  // --------------------------------------------------------------------
  // REFERENCIAS Y EFECTOS
  // --------------------------------------------------------------------
  const countdownDuration = 10;
  const countdownInterval = useRef(null);
  const progressInterval = useRef(null);
  const audioContext = useRef(null);
  const recognition = useRef(null);
  const inputRef = useRef(null);
  const timeoutRef = useRef(null);

  //-------------------------
  // TotalCards
  //----------------------
  const totalCards = deck.length + correctCards.length;

  // Efecto para inicializar audio y reconocimiento de voz
  useEffect(() => {
    // Inicializar contexto de audio
    audioContext.current = new (
      window.AudioContext || window.webkitAudioContext
    )();

    // Configurar reconocimiento de voz si está disponible
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = "es-ES";

      // Manejar resultados del reconocimiento
      recognition.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setUserInput(transcript);
        setIsRecording(false);
        setIsListening(false);
      };

      // Manejar errores
      recognition.current.onerror = (event) => {
        console.error("Error en reconocimiento de voz:", event.error);
        setIsRecording(false);
        setIsListening(false);
      };

      recognition.current.onend = () => {
        setIsRecording(false);
        setIsListening(false);
      };
    }

    // Limpieza al desmontar el componente
    return () => {
      if (countdownInterval.current) clearInterval(countdownInterval.current);
      if (progressInterval.current) clearInterval(progressInterval.current);
      if (audioContext.current) audioContext.current.close();
      if (recognition.current) {
        try {
          recognition.current.stop();
        } catch {
          // Ya estaba detenido
        }
      }
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    // Iniciar nueva carta si hay cartas disponibles
    if (
      deck.length > 0 &&
      !currentCard &&
      phase === "idle" &&
      initialCardsLoaded
    ) {
      startNewCard();
    }
  }, [deck, currentCard, phase, initialCardsLoaded]);

  useEffect(() => {
    // Mostrar confetti cuando se completan todas las cartas
    if (initialCardsLoaded && deck.length === 0 && correctCards.length > 0) {
      const hasCompleted = correctCards.length === totalCards;
      if (hasCompleted && !sessionCompleted) {
        setSessionCompleted(true); // Marcar que la sesión se completó
        setShowConfetti(true);
        playSuccessSound();
        setTimeout(() => setShowConfetti(false), 5000);
      }
    }
  }, [deck, correctCards, totalCards, initialCardsLoaded, sessionCompleted]);

  // --------------------------------------------------------------------
  // FUNCIONES DE AUDIO Y SONIDO
  // --------------------------------------------------------------------

  /**
   * Reproduce sonido de éxito (tres tonos ascendentes)
   */
  const playSuccessSound = () => {
    try {
      const ctx = audioContext.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Secuencia de tonos ascendentes
      oscillator.frequency.setValueAtTime(523.25, ctx.currentTime);
      oscillator.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);

      // Fade out
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.5);
    } catch {
      console.log("Audio no disponible");
    }
  };

  /**
   * Reproduce sonido de error (tono bajo y desagradable)
   */
  const playErrorSound = () => {
    try {
      const ctx = audioContext.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.setValueAtTime(200, ctx.currentTime);
      oscillator.type = "sawtooth";

      gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    } catch {
      console.log("Audio no disponible");
    }
  };

  const playTickSound = () => {
    try {
      const ctx = audioContext.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Sonido corto y agudo para el tick
      oscillator.frequency.setValueAtTime(800, ctx.currentTime);
      oscillator.type = "sine";

      // Fade rápido
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.1);
    } catch {
      console.log("Audio no disponible");
    }
  };

  /**
   * Sintetiza voz para leer texto
   */
  const speak = (text, lang = "fr-FR") => {
    return new Promise((resolve) => {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.8;
      utterance.onend = resolve;
      speechSynthesis.speak(utterance);
    });
  };

  // --------------------------------------------------------------------
  // FUNCIONES DE FLUJO DE JUEGO
  // --------------------------------------------------------------------

  /**
   * Inicia la cuenta regresiva para la fase de reflexión
   */
  const startCountdown = () => {
    if (countdownInterval.current) clearInterval(countdownInterval.current);

    let count = countdownDuration;
    setCountdown(count);
    let progress = 1;
    setCountdownProgress(progress);

    const intervalMs = 1000; // Cambié a 1000ms (1 segundo) para sonido por segundo
    const steps = (countdownDuration * 1000) / intervalMs;
    let currentStep = 0;

    countdownInterval.current = setInterval(() => {
      currentStep++;
      count = Math.ceil(countdownDuration - (currentStep * intervalMs) / 1000);
      count = count >= 0 ? count : 0;
      setCountdown(count);

      progress = 1 - currentStep / steps;
      progress = progress >= 0 ? progress : 0;
      setCountdownProgress(progress);

      // Reproducir sonido de tick en cada segundo (excepto en 0)
      if (count > 0) {
        playTickSound();
      }

      if (currentStep >= steps) {
        clearInterval(countdownInterval.current);
        countdownInterval.current = null;
      }
    }, intervalMs);
  };

  /**
   * Procesa automáticamente como incorrecto cuando se acaba el tiempo
   */
  const handleTimeout = () => {
    if (phaseRef.current !== "reflection") return; // ⚡ importante
    setFeedback("incorrect");
    setPhase("feedback-incorrect");
    setTimeoutExpired(true);
    playErrorSound();

    setTimeout(() => {
      setShowSummary(true);
      setShowOverlay(false);
    }, 1500);
  };

  /**
   * Inicia una nueva carta del mazo
   */
  const startNewCard = async () => {
    if (deck.length === 0) return;

    // Limpiar timeout e intervalos anteriores
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (countdownInterval.current) {
      clearInterval(countdownInterval.current);
      countdownInterval.current = null;
    }
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }

    // Resetear estados de UI
    setShowSummary(false);
    setFeedback(null);
    setShowOverlay(false);
    setUserInput("");
    setTimeoutExpired(false);
    setAudioAvailable(false);

    // Limpiar timeout anterior si existe
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Obtener primera carta del mazo
    const card = deck[0];
    setCurrentCard(card);

    // Fase 1: Escuchar la palabra
    setPhase("listening-word");
    await speak(card.word);

    // Fase 2: Escuchar el contexto
    setPhase("listening-context");
    await new Promise((resolve) => setTimeout(resolve, 500));
    await speak(card.context);

    // Fase 3: Tiempo de reflexión
    setPhase("reflection");
    phaseRef.current = "reflection"; // ⚡ Actualiza inmediatamente la referencia
    setAudioAvailable(true);
    // Configurar timeout para cuando se acabe el tiempo
    timeoutRef.current = setTimeout(() => {
      console.log("Timeout ejecutándose - tiempo agotado");
      handleTimeout();
    }, countdownDuration * 1000);

    // Iniciar cuenta regresiva visual
    startCountdown(); // solo visual
  };
  const phaseRef = useRef(phase);
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  /**
   * Inicia la grabación de voz
   */
  const startRecording = () => {
    if (!recognition.current) {
      alert(
        "El reconocimiento de voz no está disponible en tu navegador. Por favor, usa Chrome o Edge.",
      );
      return;
    }

    setIsRecording(true);
    setIsListening(true);
    setUserInput("");

    try {
      recognition.current.start();
    } catch (e) {
      console.error("Error al iniciar reconocimiento:", e);
      setIsRecording(false);
      setIsListening(false);
    }
  };

  /**
   * Detiene la grabación de voz
   */
  const stopRecording = () => {
    if (recognition.current && isRecording) {
      try {
        recognition.current.stop();
      } catch (e) {
        console.error("Error al detener reconocimiento:", e);
      }
    }
  };

  /**
   * Procesa la respuesta del usuario
   */
  const handleSubmit = (e) => {
    if (countdownInterval.current) {
      clearInterval(countdownInterval.current);
      countdownInterval.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (e) e.preventDefault();

    // Si se está en fase de reflexión o respuesta, procesar
    if (phase !== "reflection" && phase !== "answer") return;

    // Si no hay respuesta, marcar como incorrecto
    if (!userInput.trim()) {
      setFeedback("incorrect");
      setPhase("feedback-incorrect");
      setTimeoutExpired(false);
      playErrorSound();

      setTimeout(() => {
        setShowSummary(true);
        setShowOverlay(false);
      }, 1500);
      return;
    }


    // Verificar respuesta (modo exacto solo para texto)
    const exactMode = inputMode === "text";
    const isCorrect = checkAnswer(
      userInput,
      currentCard.word,
      currentCard.meaning,
      exactMode,
    );

    // Procesar resultado
    if (isCorrect) {
      setFeedback("correct");
      setPhase("feedback-correct");
      playSuccessSound();
    } else {
      setFeedback("incorrect");
      setPhase("feedback-incorrect");
      playErrorSound();
    }

    // Mostrar resumen después de un breve delay
    setTimeout(() => {
      setShowSummary(true);
      setShowOverlay(false);
    }, 1500);
  };

  /**
   * Avanza a la siguiente carta
   */

  const handleNext = () => {
    console.log(
      "Siguiente carta - feedback:",
      feedback,
      "timeoutExpired:",
      timeoutExpired,
    );

    // Si la respuesta fue correcta, mover la carta a correctCards
    if (feedback === "correct") {
      setCorrectCards([...correctCards, currentCard]);
      setDeck(deck.slice(1));
    }
    // Si fue incorrecta (por tiempo o respuesta incorrecta), mover la carta al final del mazo
    else {
      const newDeck = [...deck.slice(1), deck[0]];
      setDeck(newDeck);
    }

    // Resetear estados para la siguiente carta
    setCurrentCard(null);
    setFeedback(null);
    setShowSummary(false);
    setUserInput("");
    setTimeoutExpired(false);
    setPhase("idle");
    setAudioAvailable(false);
  };

  /**
   * Reinicia completamente el mazo y todos los estados
   */
  const resetDeck = () => {
    if (!category) return;

    const filteredCards = cardExamples.filter((c) => c.deckId === category.id);
    setDeck(shuffleArray(filteredCards));
    setCorrectCards([]);
    setCurrentCard(null);
    setInitialCardsLoaded(true);
    setSessionCompleted(false);
    setShowSummary(false);
    setFeedback(null);
    setPhase("idle");
    setShowOverlay(false);
    setIsReplaying(false);
    setShowConfetti(false);
    setUserInput("");
    setIsRecording(false);
    setIsListening(false);
    setTimeoutExpired(false);
    setAudioAvailable(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  /**
   * Reproduce el audio de la carta actual
   */
  // ENCUENTRA la función replayAudio (alrededor de la línea 370) y MODIFÍCALA:
  const replayAudio = async () => {
    // Solo permitir si hay carta, no está reproduciendo Y el audio está disponible
    if (!currentCard || isReplaying || !audioAvailable) return;

    setIsReplaying(true);

    await speak(currentCard.word);
    await new Promise((resolve) => setTimeout(resolve, 500));
    await speak(currentCard.context);

    setIsReplaying(false);
  };

  // --------------------------------------------------------------------
  // RENDERIZADO DEL COMPONENTE
  // --------------------------------------------------------------------
  return (
    <div className="min-h-screen p-4 md:p-6 font-sans">
      {/* Estilos CSS personalizados */}
      <style>{`
      @keyframes confettiFall {
        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
      }
      @keyframes cardFlip {
        0% { transform: rotateY(0); }
        100% { transform: rotateY(180deg); }
      }
      @keyframes cardRemoval {
        0% { transform: translateX(0) scale(1); opacity: 1; }
        100% { transform: translateX(-100%) scale(0.8); opacity: 0; }
      }
      @keyframes cardToQueue {
        0% { transform: translateX(0) scale(1); opacity: 1; }
        50% { transform: translateX(100%) scale(0.8); opacity: 0.5; }
        100% { transform: translateX(200%) scale(0); opacity: 0; }
      }
      @keyframes popIn {
        0% { transform: scale(0.95); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
      }
      @keyframes slideUp {
        0% { transform: translateY(20px); opacity: 0; }
        100% { transform: translateY(0); opacity: 1; }
      }
      @keyframes pulseSubtle {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
      .card-flip {
        animation: cardFlip 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      }
      .card-removal {
        animation: cardRemoval 0.5s ease-out forwards;
      }
      .card-to-queue {
        animation: cardToQueue 0.8s ease-in-out forwards;
      }
      .pop-in {
        animation: popIn 0.3s ease-out forwards;
      }
      .slide-up {
        animation: slideUp 0.4s ease-out forwards;
      }
      .pulse-subtle {
        animation: pulseSubtle 2s ease-in-out infinite;
      }
    `}</style>

      {/* Confetti para celebración */}
      {showConfetti && <Confetti />}

      <div className="max-w-6xl mx-auto">
        {/* HEADER - Diseño minimalista y profesional */}
        <header className="mb-8 text-center">
          <div className="inline-flex items-center gap-3 mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-full">
            <Brain size={24} />
            <h1 className="text-3xl font-bold tracking-tight">LexiFlash</h1>
          </div>
          <p className="text-slate-600 text-sm font-medium tracking-wide uppercase">
            {category?.title}
          </p>
        </header>

        {/* PANEL DE PROGRESO */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-slate-200 slide-up">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Target className="text-indigo-600" size={20} />
                  <span className="text-slate-700 font-semibold">Progreso</span>
                </div>
                <span className="text-2xl font-bold text-slate-800">
                  {correctCards.length}
                  <span className="text-slate-400">/{totalCards}</span>
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${(correctCards.length / totalCards) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-lg">
                <Zap size={16} className="text-indigo-600" />
                <span className="text-slate-700 font-medium">
                  {deck.length}
                </span>
                <span className="text-slate-500 text-sm">restantes</span>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        {isLoading ? (
          // PANTALLA DE CARGA
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-700 font-medium">Cargando cartas...</p>
          </div>
        ) : deck.length === 0 &&
          correctCards.length === 0 &&
          !isLoading &&
          initialCardsLoaded ? (
          // PANTALLA DE COMPLETADO
          <div className="bg-gradient-to-br from-white to-indigo-50 rounded-3xl shadow-2xl p-12 text-center border border-slate-200 pop-in">
            <div className="inline-flex items-center justify-center w-24 h-24a bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mb-8 shadow-lg">
              <Award size={48} className="text-white" />
            </div>
            <h2 className="text-4xl font-bold text-slate-800 mb-4">
              ¡Dominado!
            </h2>
            <p className="text-slate-600 text-lg mb-8 max-w-md mx-auto">
              Has completado todas las tarjetas con maestría. Tu memoria está
              más fuerte que nunca.
            </p>
            <button
              onClick={resetDeck}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-10 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all shadow-lg"
            >
              Repetir Lección
            </button>
          </div>
        ) : currentCard ? (
          // INTERFAZ DE APRENDIZAJE (cuando hay carta actual)
          <>
            
            

            {/* TARJETA PRINCIPAL */}
            {!showSummary && (
              <div className="mb-8 slide-up">
                <div
                  className={`bg-white rounded-3xl shadow-2xl overflow-hidden border-2 ${feedback === "correct" ? "border-emerald-500" : feedback === "incorrect" ? "border-rose-500" : "border-slate-100"}`}
                >
                  {/* Encabezado de la tarjeta */}
                  <div className="bg-gradient-to-r from-slate-50 to-white p-6 border-b border-slate-100">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${phase === "listening-word" || phase === "listening-context" ? "bg-amber-500 animate-pulse" : phase === "reflection" ? "bg-blue-500" : "bg-emerald-500"}`}
                        ></div>
                        <span className="text-slate-600 font-medium text-sm uppercase tracking-wide">
                          {phase === "listening-word"
                            ? "Escuchando"
                            : phase === "listening-context"
                              ? "Contexto"
                              : phase === "reflection"
                                ? "Reflexión"
                                : "Tu respuesta"}
                        </span>
                      </div>

                      <button
                        onClick={replayAudio}
                        disabled={isReplaying || !audioAvailable} // ⬅️ AGREGAR !audioAvailable
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                          isReplaying || !audioAvailable
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                            : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                        }`}
                        title={
                          !audioAvailable
                            ? "Disponible después del contexto"
                            : "Repetir audio"
                        }
                      >
                        <Volume2 size={18} />
                        <span className="text-sm font-medium">Repetir</span>
                      </button>
                    </div>
                  </div>

                  {/* Contenido de la tarjeta */}
                  <div className="p-8 md:p-12">
                    {(phase === "listening-word" ||
                      phase === "listening-context") && (
                      <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 rounded-full mb-8">
                          <Volume2 size={32} className="text-indigo-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-4">
                          {phase === "listening-word"
                            ? "Presta atención a la palabra"
                            : "Escucha el contexto"}
                        </h2>
                        <p className="text-slate-600">
                          La repetición activa fortalece la memoria
                        </p>
                      </div>
                    )}

                    {phase === "reflection" && !feedback && (
                      <div className="space-y-8">
                        {/* Selector de modo de entrada - AHORA DISPONIBLE DURANTE REFLEXIÓN */}
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => setInputMode("text")}
                            className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all ${inputMode === "text" ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                          >
                            <Keyboard size={20} />
                            <span>Escribir</span>
                          </button>
                          <button
                            onClick={() => setInputMode("voice")}
                            className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all ${inputMode === "voice" ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                          >
                            <Mic size={20} />
                            <span>Hablar</span>
                          </button>
                        </div>

                        {/* Entrada según el modo - AHORA DISPONIBLE DURANTE REFLEXIÓN */}
                        {inputMode === "text" ? (
                          <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                              <label className="block text-slate-700 text-sm font-medium mb-3 text-center">
                                Escribe lo que escuchaste.
                              </label>
                              <input
                                ref={inputRef}
                                type="text"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                placeholder="Escribe aquí tu respuesta..."
                                className="w-full px-6 py-4 text-lg border-2 border-slate-300 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                                autoComplete="off"
                                autoFocus
                              />
                            </div>
                            <button
                              type="submit"
                              disabled={!userInput.trim()}
                              className={`w-full py-4 rounded-xl font-semibold text-lg transition-all shadow-lg ${userInput.trim() ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-xl hover:scale-[1.02]" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
                            >
                              Verificar Respuesta
                            </button>
                          </form>
                        ) : (
                          <div className="space-y-6">
                            <div
                              className={`p-8 rounded-xl border-2 transition-all ${isListening ? "border-red-400 bg-red-50" : "border-slate-300 bg-slate-50"}`}
                            >
                              {userInput ? (
                                <div className="text-center">
                                  <p className="text-xl text-slate-800 mb-2 font-semibold">
                                    "{userInput}"
                                  </p>
                                  <p className="text-slate-600 text-sm">
                                    Presiona el botón para verificar
                                  </p>
                                </div>
                              ) : (
                                <div className="text-center">
                                  <p className="text-slate-600 mb-6">
                                    {isListening
                                      ? "🎤 Escuchando... habla ahora"
                                      : "Presiona el botón y di tu respuesta en tu idioma nativo."}
                                  </p>
                                  <button
                                    type="button"
                                    onClick={
                                      isRecording
                                        ? stopRecording
                                        : startRecording
                                    }
                                    className={`mx-auto flex items-center justify-center w-16 h-16 rounded-full transition-all shadow-lg ${isRecording ? "bg-red-500 text-white pulse-subtle" : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-xl hover:scale-110"}`}
                                  >
                                    {isRecording ? (
                                      <MicOff size={24} />
                                    ) : (
                                      <Mic size={24} />
                                    )}
                                  </button>
                                </div>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={handleSubmit}
                              disabled={!userInput.trim()}
                              className={`w-full py-4 rounded-xl font-semibold text-lg transition-all shadow-lg ${userInput.trim() ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-xl hover:scale-[1.02]" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
                            >
                              Verificar Respuesta
                            </button>
                          </div>
                        )}

                        {/* Cuenta regresiva visual */}
                        <div className="text-center pt-8 border-t border-slate-100">
                          <div className="inline-flex flex-col items-center">
                            <Clock size={32} className="text-blue-600 mb-3" />
                            <div className="relative w-48 h-2 bg-slate-200 rounded-full overflow-hidden mb-2">
                              <div
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all"
                                style={{ width: `${countdownProgress * 100}%` }}
                              ></div>
                            </div>
                            <div className="text-xl font-bold text-blue-600 mb-2">
                              {countdown}s
                            </div>
                            <p className="text-slate-600 text-sm">
                              Tiempo restante para responder
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {phase === "answer" && !feedback && (
                      <div className="space-y-8">
                        {/* Selector de modo de entrada */}
                        <div className="flex justify-center gap-2 mb-8">
                          <button
                            onClick={() => setInputMode("text")}
                            className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all ${inputMode === "text" ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                          >
                            <Keyboard size={20} />
                            <span>Escribir</span>
                          </button>
                          <button
                            onClick={() => setInputMode("voice")}
                            className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all ${inputMode === "voice" ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                          >
                            <Mic size={20} />
                            <span>Hablar</span>
                          </button>
                        </div>

                        {/* Entrada según el modo */}
                        {inputMode === "text" ? (
                          <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                              <label className="block text-slate-700 text-sm font-medium mb-3 text-center">
                                Escribe lo que escuchaste.
                              </label>
                              <input
                                ref={inputRef}
                                type="text"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                placeholder="Escribe aquí tu respuesta..."
                                className="w-full px-6 py-4 text-lg border-2 border-slate-300 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                                autoComplete="off"
                              />
                            </div>
                            <button
                              type="submit"
                              disabled={!userInput.trim()}
                              className={`w-full py-4 rounded-xl font-semibold text-lg transition-all shadow-lg ${userInput.trim() ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-xl hover:scale-[1.02]" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
                            >
                              Verificar Respuesta
                            </button>
                          </form>
                        ) : (
                          <div className="space-y-6">
                            <div
                              className={`p-8 rounded-xl border-2 transition-all ${isListening ? "border-red-400 bg-red-50" : "border-slate-300 bg-slate-50"}`}
                            >
                              {userInput ? (
                                <div className="text-center">
                                  <p className="text-xl text-slate-800 mb-2 font-semibold">
                                    "{userInput}"
                                  </p>
                                  <p className="text-slate-600 text-sm">
                                    Presiona el botón para verificar
                                  </p>
                                </div>
                              ) : (
                                <div className="text-center">
                                  <p className="text-slate-600 mb-6">
                                    {isListening
                                      ? "🎤 Escuchando... habla ahora"
                                      : "Presiona el botón y di tu respuesta en tu idioma nativo."}
                                  </p>
                                  <button
                                    type="button"
                                    onClick={
                                      isRecording
                                        ? stopRecording
                                        : startRecording
                                    }
                                    className={`mx-auto flex items-center justify-center w-16 h-16 rounded-full transition-all shadow-lg ${isRecording ? "bg-red-500 text-white pulse-subtle" : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-xl hover:scale-110"}`}
                                  >
                                    {isRecording ? (
                                      <MicOff size={24} />
                                    ) : (
                                      <Mic size={24} />
                                    )}
                                  </button>
                                </div>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={handleSubmit}
                              disabled={!userInput.trim()}
                              className={`w-full py-4 rounded-xl font-semibold text-lg transition-all shadow-lg ${userInput.trim() ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-xl hover:scale-[1.02]" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
                            >
                              Verificar Respuesta
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Feedback inmediato */}
                    {feedback && !showSummary && (
                      <div
                        className={`py-8 px-10 rounded-2xl text-center ${feedback === "correct" ? "bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200" : "bg-gradient-to-r from-rose-50 to-red-50 border-2 border-rose-200"}`}
                      >
                        <div
                          className={`inline-flex items-center gap-4 px-8 py-4 rounded-full mb-6 ${feedback === "correct" ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"}`}
                        >
                          {feedback === "correct" ? (
                            <>
                              <Check size={28} />
                              <span className="text-2xl font-bold">
                                ¡Perfecto!
                              </span>
                            </>
                          ) : (
                            <>
                              <X size={28} />
                              <span className="text-2xl font-bold">
                                {timeoutExpired
                                  ? "Tiempo agotado"
                                  : "Inténtalo de nuevo"}
                              </span>
                            </>
                          )}
                        </div>
                        <p className="text-slate-700 text-lg">
                          {feedback === "correct"
                            ? "Has fortalecido esta conexión en tu memoria."
                            : timeoutExpired
                              ? "El tiempo de reflexión ha terminado. Sigue practicando."
                              : "La práctica constante lleva al dominio. Sigue intentándolo."}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* RESUMEN DESPUÉS DE LA RESPUESTA */}
            {/* RESUMEN DESPUÉS DE LA RESPUESTA */}
{showSummary && (
  <div className="pop-in">
    <div className="relative rounded-3xl shadow-2xl overflow-hidden bg-white border border-slate-100">
      {/* Encabezado minimalista */}
      <div className={`p-6 ${feedback === "correct" ? "bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100" : "bg-gradient-to-r from-rose-50 to-pink-50 border-b border-rose-100"}`}>
        <div className="text-center">
          <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full mb-4 ${feedback === "correct" ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"}`}>
            {feedback === "correct" ? (
              <Check size={28} />
            ) : (
              <X size={28} />
            )}
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            {feedback === "correct" ? "¡Correcto!" : "Respuesta Incorrecta"}
          </h2>
          <p className="text-slate-600">
            {timeoutExpired 
              ? "El tiempo de reflexión ha terminado" 
              : feedback === "correct" 
                ? "Has dominado esta palabra" 
                : `Respuesta: "${userInput}"`
            }
          </p>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="p-8">
        {/* Tarjeta de contenido principal */}
        <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-8 border border-slate-200 shadow-sm mb-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Palabra y significado */}
            <div className="space-y-8">
              <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
                  Palabra en Francés
                </h3>
                <div className="text-5xl font-bold text-indigo-700 leading-tight">
                  <InteractiveWords
                    text={currentCard.word}
                    onWordClick={(word) => {
                      InteractiveWords.speak(word.text);
                    }}
                  />
                </div>
              </div>
              
              <div className="pt-6 border-t border-slate-200">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
                  Significado
                </h3>
                <div className="text-2xl font-semibold text-slate-800">
                  {currentCard.meaning}
                </div>
              </div>
            </div>

            {/* Contexto */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-8 bg-indigo-500 rounded-full"></div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    Contexto
                  </h3>
                  <p className="text-sm text-slate-500">
                    Haz clic en cualquier palabra para escucharla
                  </p>
                </div>
              </div>
              <div className="text-lg text-slate-700 leading-relaxed bg-white p-6 rounded-xl border border-slate-200">
                <InteractiveWords
                  text={currentCard.context}
                  onWordClick={(word) => {
                    InteractiveWords.speak(word.text);
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Botón para continuar */}
        <div className="flex justify-center">
          <button
            onClick={handleNext}
            className="group flex items-center justify-center gap-3 px-10 py-4 rounded-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-xl hover:scale-105 transition-all shadow-lg min-w-[200px]"
          >
            <span>Continuar</span>
            <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  </div>
)}
          </>
        ) : (
          // PANTALLA DE ESPERA (entre cartas o al inicio)
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 rounded-full mb-8">
              <Volume2 size={32} className="text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              Preparando la lección...
            </h2>
            <p className="text-slate-600">
              La primera carta comenzará en breve
            </p>
          </div>
        )}

        {/* FOOTER */}
        <footer className="mt-12 pt-8 border-t border-slate-200 text-center">
          <p className="text-slate-500 text-sm">
            LexiAudio utiliza el método de{" "}
            <span className="font-semibold text-slate-700">
              recuperación espaciada
            </span>{" "}
            para una memorización óptima
          </p>
          <div className="flex justify-center gap-6 mt-4">
            <span className="text-xs text-slate-400">
              • Coincidencia inteligente
            </span>
            <span className="text-xs text-slate-400">• Repetición activa</span>
            <span className="text-xs text-slate-400">
              • Progreso adaptativo
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LexiFlashScreen;
