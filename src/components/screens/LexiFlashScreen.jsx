import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
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
  Sparkles,
  TrendingUp,
  CheckCircle,
  XCircle,
  Flame,
} from "lucide-react";
import cardExamples from "../../data/cardsexamples.json";
import InteractiveWords from "../../shared/InteractiveWords";

// ============================================================================
// CONSTANTES DE CONFIGURACIÓN
// ============================================================================

const GAME_CONFIG = {
  COUNTDOWN_DURATION: 10,
  FUZZY_MATCH_THRESHOLD: 2,
  FEEDBACK_DELAY: 1500,
  AUDIO_DELAY: 500,
  CONFETTI_DURATION: 5000,
  COUNTDOWN_INTERVAL: 1000,
};

const GAME_PHASES = {
  IDLE: "idle",
  LISTENING_WORD: "listening-word",
  LISTENING_CONTEXT: "listening-context",
  REFLECTION: "reflection",
  ANSWER: "answer",
  FEEDBACK_CORRECT: "feedback-correct",
  FEEDBACK_INCORRECT: "feedback-incorrect",
};

const INPUT_MODES = {
  TEXT: "text",
  VOICE: "voice",
};

const FEEDBACK_TYPES = {
  CORRECT: "correct",
  INCORRECT: "incorrect",
};

// ============================================================================
// FUNCIONES DE UTILIDAD
// ============================================================================

/**
 * Mezcla aleatoriamente un array usando el algoritmo Fisher-Yates
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
 * Calcula la distancia de Levenshtein entre dos cadenas
 */
const levenshteinDistance = (a, b) => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = Array(b.length + 1)
    .fill()
    .map(() => Array(a.length + 1).fill(0));

  for (let i = 0; i <= b.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = b.charAt(i - 1) === a.charAt(j - 1) ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }

  return matrix[b.length][a.length];
};

/**
 * Verifica si hay coincidencia aproximada entre dos textos
 */
const isFuzzyMatch = (
  input,
  target,
  threshold = GAME_CONFIG.FUZZY_MATCH_THRESHOLD,
) => {
  return (
    levenshteinDistance(normalizeText(input), normalizeText(target)) <=
    threshold
  );
};

/**
 * Verifica si la respuesta del usuario es correcta
 */
const checkAnswer = (
  userAnswer,
  correctWord,
  correctMeaning,
  exactMode = false,
) => {
  const normalizedAnswer = normalizeText(userAnswer);
  const normalizedWord = normalizeText(correctWord);
  const normalizedMeanings = correctMeaning
    .split("/")
    .map((meaning) => normalizeText(meaning));

  // Coincidencia exacta con palabra o significado
  if (normalizedAnswer === normalizedWord) return true;
  if (normalizedMeanings.includes(normalizedAnswer)) return true;

  // Coincidencia aproximada (solo si no está en modo exacto)
  if (!exactMode) {
    if (isFuzzyMatch(normalizedAnswer, normalizedWord)) return true;
    if (
      normalizedMeanings.some((meaning) =>
        isFuzzyMatch(normalizedAnswer, meaning),
      )
    )
      return true;
  }

  return false;
};

// ============================================================================
// COMPONENTE DE CONFETTI
// ============================================================================

const Confetti = () => {
  const colors = ["#6366f1", "#8b5cf6", "#ec4899", "#10b981", "#f59e0b"];
  const confetti = useMemo(
    () =>
      Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        animationDelay: Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
      })),
    [],
  );

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

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const LexiFlashScreen = ({ category }) => {
  // ==========================================================================
  // ESTADOS
  // ==========================================================================

  // Estados del juego
  const [isLoading, setIsLoading] = useState(true);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [deck, setDeck] = useState([]);
  const [correctCards, setCorrectCards] = useState([]);
  const [currentCard, setCurrentCard] = useState(null);

  // Estados de UI
  const [showSummary, setShowSummary] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [phase, setPhase] = useState(GAME_PHASES.IDLE);
  const [countdown, setCountdown] = useState(GAME_CONFIG.COUNTDOWN_DURATION);
  const [countdownProgress, setCountdownProgress] = useState(1);
  const [showOverlay, setShowOverlay] = useState(false);
  const [isReplaying, setIsReplaying] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [initialCardsLoaded, setInitialCardsLoaded] = useState(false);

  // Estados de entrada
  const [inputMode, setInputMode] = useState(INPUT_MODES.TEXT);
  const [userInput, setUserInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [timeoutExpired, setTimeoutExpired] = useState(false);
  const [audioAvailable, setAudioAvailable] = useState(false);

  // Estados transferibles entre juegos
  const [xp, setXp] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalErrors, setTotalErrors] = useState(0);
  const [streak, setStreak] = useState(0);

  // ==========================================================================
  // REFERENCIAS
  // ==========================================================================

  const countdownIntervalRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const audioContextRef = useRef(null);
  const recognitionRef = useRef(null);
  const inputRef = useRef(null);
  const timeoutRef = useRef(null);
  const phaseRef = useRef(phase);

  // ==========================================================================
  // VARIABLES DERIVADAS
  // ==========================================================================

  const totalCards = useMemo(
    () => deck.length + correctCards.length,
    [deck.length, correctCards.length],
  );
  const progressPercentage = useMemo(
    () => (totalCards > 0 ? (correctCards.length / totalCards) * 100 : 0),
    [correctCards.length, totalCards],
  );

  const isCompleted = useMemo(
    () => initialCardsLoaded && deck.length === 0 && correctCards.length > 0,
    [initialCardsLoaded, deck.length, correctCards.length],
  );

  // ==========================================================================
  // EFECTOS
  // ==========================================================================

  // Efecto para actualizar la referencia de fase
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  // Efecto para inicializar el juego cuando cambia la categoría
  useEffect(() => {
    if (!category) return;

    const initializeGame = () => {
      const filteredCards = cardExamples.filter(
        (card) => card.deckId === category.id,
      );
      setDeck(shuffleArray(filteredCards));
      setInitialCardsLoaded(true);
      setIsLoading(false);

      // Resetear estados
      resetGameStates();
    };

    initializeGame();
  }, [category]);

  // Efecto para iniciar una nueva carta cuando sea apropiado
  useEffect(() => {
    if (
      deck.length > 0 &&
      !currentCard &&
      phase === GAME_PHASES.IDLE &&
      initialCardsLoaded
    ) {
      startNewCard();
    }
  }, [deck, currentCard, phase, initialCardsLoaded]);

  // Efecto para mostrar confetti cuando se completa la sesión
  useEffect(() => {
    if (isCompleted && !sessionCompleted) {
      setSessionCompleted(true);
      setShowConfetti(true);
      playSuccessSound();

      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, GAME_CONFIG.CONFETTI_DURATION);

      return () => clearTimeout(timer);
    }
  }, [isCompleted, sessionCompleted]);

  // Efecto para inicializar audio y reconocimiento de voz
  useEffect(() => {
    initializeAudio();
    initializeSpeechRecognition();

    return cleanupResources;
  }, []);

  // ==========================================================================
  // FUNCIONES DE INICIALIZACIÓN Y LIMPIEZA
  // ==========================================================================

  const initializeAudio = () => {
    try {
      audioContextRef.current = new (
        window.AudioContext || window.webkitAudioContext
      )();
    } catch (error) {
      console.warn("AudioContext no disponible:", error);
    }
  };

  const initializeSpeechRecognition = () => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "es-ES";

      recognitionRef.current.onresult = handleSpeechResult;
      recognitionRef.current.onerror = handleSpeechError;
      recognitionRef.current.onend = handleSpeechEnd;
    }
  };

  const cleanupResources = () => {
    clearInterval(countdownIntervalRef.current);
    clearInterval(progressIntervalRef.current);
    clearTimeout(timeoutRef.current);

    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        // Silenciar error si ya está detenido
      }
    }
  };

  const resetGameStates = () => {
    setCorrectCards([]);
    setCurrentCard(null);
    setShowSummary(false);
    setFeedback(null);
    setPhase(GAME_PHASES.IDLE);
    setShowOverlay(false);
    setIsReplaying(false);
    setSessionCompleted(false);
    setShowConfetti(false);
    setUserInput("");
    setIsRecording(false);
    setIsListening(false);
    setTimeoutExpired(false);
    setAudioAvailable(false);
    setCountdown(GAME_CONFIG.COUNTDOWN_DURATION);
    setCountdownProgress(1);
  };

  // ==========================================================================
  // MANEJADORES DE RECONOCIMIENTO DE VOZ
  // ==========================================================================

  const handleSpeechResult = (event) => {
    const transcript = event.results[0][0].transcript;
    setUserInput(transcript);
    setIsRecording(false);
    setIsListening(false);
  };

  const handleSpeechError = (event) => {
    console.error("Error en reconocimiento de voz:", event.error);
    setIsRecording(false);
    setIsListening(false);
  };

  const handleSpeechEnd = () => {
    setIsRecording(false);
    setIsListening(false);
  };

  // ==========================================================================
  // FUNCIONES DE AUDIO
  // ==========================================================================

  const playSound = (frequency, duration, type = "sine") => {
    try {
      const ctx = audioContextRef.current;
      if (!ctx) return;

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
      oscillator.type = type;

      gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        ctx.currentTime + duration,
      );

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (error) {
      console.warn("Audio no disponible:", error);
    }
  };

  const playSuccessSound = () => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

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
    } catch (error) {
      console.warn("Error reproduciendo sonido de éxito:", error);
    }
  };

  const playErrorSound = () => {
    playSound(200, 0.3, "sawtooth");
  };

  const playTickSound = () => {
    playSound(800, 0.1, "sine");
  };

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

  // ==========================================================================
  // FUNCIONES DE FLUJO DE JUEGO
  // ==========================================================================

  const clearTimers = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const startCountdown = () => {
    clearTimers();

    let count = GAME_CONFIG.COUNTDOWN_DURATION;
    setCountdown(count);

    let progress = 1;
    setCountdownProgress(progress);

    const totalSteps =
      (GAME_CONFIG.COUNTDOWN_DURATION * 1000) / GAME_CONFIG.COUNTDOWN_INTERVAL;
    let currentStep = 0;

    countdownIntervalRef.current = setInterval(() => {
      currentStep++;
      count = Math.ceil(
        GAME_CONFIG.COUNTDOWN_DURATION -
          (currentStep * GAME_CONFIG.COUNTDOWN_INTERVAL) / 1000,
      );
      count = Math.max(count, 0);
      setCountdown(count);

      progress = 1 - currentStep / totalSteps;
      progress = Math.max(progress, 0);
      setCountdownProgress(progress);

      if (count > 0) {
        playTickSound();
      }

      if (count === 0) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
        handleTimeout(); // <-- AÑADE ESTA LÍNEA
      }

      if (currentStep >= totalSteps) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    }, GAME_CONFIG.COUNTDOWN_INTERVAL);
  };

  const handleTimeout = useCallback(() => {
    if (phaseRef.current !== GAME_PHASES.REFLECTION) return;

    setFeedback(FEEDBACK_TYPES.INCORRECT);
    setPhase(GAME_PHASES.FEEDBACK_INCORRECT);
    setTimeoutExpired(true);
    playErrorSound();

    setTimeout(() => {
      setShowSummary(true);
      setShowOverlay(false);
    }, GAME_CONFIG.FEEDBACK_DELAY);
  }, []);

  const startNewCard = async () => {
    if (deck.length === 0) return;

    clearTimers();
    resetUICardStates();

    const card = deck[0];
    setCurrentCard(card);

    // Fase 1: Escuchar la palabra
    setPhase(GAME_PHASES.LISTENING_WORD);
    await speak(card.word);

    // Fase 2: Escuchar el contexto
    setPhase(GAME_PHASES.LISTENING_CONTEXT);
    await new Promise((resolve) =>
      setTimeout(resolve, GAME_CONFIG.AUDIO_DELAY),
    );
    await speak(card.context);

    // Fase 3: Tiempo de reflexión
    setPhase(GAME_PHASES.REFLECTION);
    phaseRef.current = GAME_PHASES.REFLECTION;
    setAudioAvailable(true);

    // Configurar timeout
    timeoutRef.current = setTimeout(() => {
      handleTimeout();
    }, GAME_CONFIG.COUNTDOWN_DURATION * 1000);

    // Iniciar cuenta regresiva visual
    startCountdown();
  };

  const resetUICardStates = () => {
    setShowSummary(false);
    setFeedback(null);
    setShowOverlay(false);
    setUserInput("");
    setTimeoutExpired(false);
    setAudioAvailable(false);
  };

  const startRecording = () => {
    if (!recognitionRef.current) {
      alert(
        "El reconocimiento de voz no está disponible en tu navegador. Por favor, usa Chrome o Edge.",
      );
      return;
    }

    setIsRecording(true);
    setIsListening(true);
    setUserInput("");

    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error("Error al iniciar reconocimiento:", error);
      setIsRecording(false);
      setIsListening(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error("Error al detener reconocimiento:", error);
      }
    }
  };

  const handleSubmit = (event) => {
    if (event) event.preventDefault();

    clearTimers();

    // Validar fase actual
    if (phase !== GAME_PHASES.REFLECTION && phase !== GAME_PHASES.ANSWER)
      return;

    // Validar respuesta vacía
    if (!userInput.trim()) {
      handleIncorrectAnswer();
      return;
    }

    // Verificar respuesta
    const exactMode = inputMode === INPUT_MODES.TEXT;
    const isCorrect = checkAnswer(
      userInput,
      currentCard.word,
      currentCard.meaning,
      exactMode,
    );

    // Procesar resultado
    if (isCorrect) {
      setFeedback(FEEDBACK_TYPES.CORRECT);
      setPhase(GAME_PHASES.FEEDBACK_CORRECT);
      playSuccessSound();
      setTotalCorrect((prev) => prev + 1);
      setStreak((prev) => prev + 1);
      setXp((prev) => prev + 10); // o cualquier valor que quieras dar por acierto
    } else {
      handleIncorrectAnswer();
    }

    // Mostrar resumen después de delay
    setTimeout(() => {
      setShowSummary(true);
      setShowOverlay(false);
    }, GAME_CONFIG.FEEDBACK_DELAY);
  };

  const handleIncorrectAnswer = () => {
    setFeedback(FEEDBACK_TYPES.INCORRECT);
    setPhase(GAME_PHASES.FEEDBACK_INCORRECT);
    setTimeoutExpired(false);
    setTotalErrors((prev) => prev + 1);
    setStreak(0); // reset racha
    setXp((prev) => Math.max(prev - 2, 0)); // opcional: penalización XP
    playErrorSound();
  };

  const handleNext = () => {
    // Mover carta según resultado
    if (feedback === FEEDBACK_TYPES.CORRECT) {
      setCorrectCards((prev) => [...prev, currentCard]);
      setDeck((prev) => prev.slice(1));
    } else {
      // Mover al final del mazo
      const newDeck = [...deck.slice(1), deck[0]];
      setDeck(newDeck);
    }

    // Resetear para siguiente carta
    setCurrentCard(null);
    setFeedback(null);
    setShowSummary(false);
    setUserInput("");
    setTimeoutExpired(false);
    setPhase(GAME_PHASES.IDLE);
    setAudioAvailable(false);
  };

  const resetDeck = () => {
    if (!category) return;

    const filteredCards = cardExamples.filter(
      (card) => card.deckId === category.id,
    );
    setDeck(shuffleArray(filteredCards));
    resetGameStates();
    setInitialCardsLoaded(true);
  };

  const replayAudio = async () => {
    if (!currentCard || isReplaying || !audioAvailable) return;

    setIsReplaying(true);

    await speak(currentCard.word);
    await new Promise((resolve) =>
      setTimeout(resolve, GAME_CONFIG.AUDIO_DELAY),
    );
    await speak(currentCard.context);

    setIsReplaying(false);
  };

  const handleWordClick = (word) => {
    InteractiveWords.speak(word.text);
  };

  // ==========================================================================
  // RENDERIZADO CONDICIONAL
  // ==========================================================================

  const renderLoadingScreen = () => (
    <div className="text-center py-12">
      <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-slate-700 font-medium">Cargando cartas...</p>
    </div>
  );

  const renderCompletedScreen = () => (
    <div className="bg-gradient-to-br from-white to-indigo-50 rounded-3xl shadow-2xl p-12 text-center border border-slate-200 pop-in">
      <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mb-8 shadow-lg">
        <Award size={48} className="text-white" />
      </div>
      <h2 className="text-4xl font-bold text-slate-800 mb-4">¡Dominado!</h2>
      <p className="text-slate-600 text-lg mb-8 max-w-md mx-auto">
        Has completado todas las tarjetas con maestría. Tu memoria está más
        fuerte que nunca.
      </p>
      <button
        onClick={resetDeck}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-10 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all shadow-lg"
      >
        Repetir Lección
      </button>
    </div>
  );

  const renderWaitingScreen = () => (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 rounded-full mb-8">
        <Volume2 size={32} className="text-indigo-600" />
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mb-4">
        Preparando la siguiente fase...
      </h2>
      <p className="text-slate-600"></p>
    </div>
  );

  const renderInputModeSelector = () => (
    <div className="flex justify-center gap-2 mb-8">
      <button
        onClick={() => setInputMode(INPUT_MODES.TEXT)}
        className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all ${
          inputMode === INPUT_MODES.TEXT
            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
        }`}
      >
        <Keyboard size={20} />
        <span>Escribir</span>
      </button>
      <button
        onClick={() => setInputMode(INPUT_MODES.VOICE)}
        className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all ${
          inputMode === INPUT_MODES.VOICE
            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
        }`}
      >
        <Mic size={20} />
        <span>Hablar</span>
      </button>
    </div>
  );

  const renderTextInput = () => (
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
        className={`w-full py-4 rounded-xl font-semibold text-lg transition-all shadow-lg ${
          userInput.trim()
            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-xl hover:scale-[1.02]"
            : "bg-slate-200 text-slate-400 cursor-not-allowed"
        }`}
      >
        Verificar Respuesta
      </button>
    </form>
  );

  const renderVoiceInput = () => (
    <div className="space-y-6">
      <div
        className={`p-8 rounded-xl border-2 transition-all ${
          isListening
            ? "border-red-400 bg-red-50"
            : "border-slate-300 bg-slate-50"
        }`}
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
              onClick={isRecording ? stopRecording : startRecording}
              className={`mx-auto flex items-center justify-center w-16 h-16 rounded-full transition-all shadow-lg ${
                isRecording
                  ? "bg-red-500 text-white pulse-subtle"
                  : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-xl hover:scale-110"
              }`}
            >
              {isRecording ? <MicOff size={24} /> : <Mic size={24} />}
            </button>
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!userInput.trim()}
        className={`w-full py-4 rounded-xl font-semibold text-lg transition-all shadow-lg ${
          userInput.trim()
            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-xl hover:scale-[1.02]"
            : "bg-slate-200 text-slate-400 cursor-not-allowed"
        }`}
      >
        Verificar Respuesta
      </button>
    </div>
  );

  const renderCountdownTimer = () => (
    <div className="text-center pt-8 border-t border-slate-100">
      <div className="inline-flex flex-col items-center">
        <Clock size={32} className="text-blue-600 mb-3" />
        <div className="relative w-48 h-2 bg-slate-200 rounded-full overflow-hidden mb-2">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all"
            style={{ width: `${countdownProgress * 100}%` }}
          ></div>
        </div>
        <div className="text-xl font-bold text-blue-600 mb-2">{countdown}s</div>
        <p className="text-slate-600 text-sm">Tiempo restante para responder</p>
      </div>
    </div>
  );

  const renderFeedback = () => (
    <div
      className={`py-8 px-10 rounded-2xl text-center ${
        feedback === FEEDBACK_TYPES.CORRECT
          ? "bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200"
          : "bg-gradient-to-r from-rose-50 to-red-50 border-2 border-rose-200"
      }`}
    >
      <div
        className={`inline-flex items-center gap-4 px-8 py-4 rounded-full mb-6 ${
          feedback === FEEDBACK_TYPES.CORRECT
            ? "bg-emerald-500 text-white"
            : "bg-rose-500 text-white"
        }`}
      >
        {feedback === FEEDBACK_TYPES.CORRECT ? (
          <>
            <Check size={28} />
            <span className="text-2xl font-bold">¡Perfecto!</span>
          </>
        ) : (
          <>
            <X size={28} />
            <span className="text-2xl font-bold">
              {timeoutExpired ? "Tiempo agotado" : "Inténtalo de nuevo"}
            </span>
          </>
        )}
      </div>
      <p className="text-slate-700 text-lg">
        {feedback === FEEDBACK_TYPES.CORRECT
          ? "Has fortalecido esta conexión en tu memoria."
          : timeoutExpired
            ? "El tiempo de reflexión ha terminado. Sigue practicando."
            : "La práctica constante lleva al dominio. Sigue intentándolo."}
      </p>
    </div>
  );

  const renderCardContent = () => {
    switch (phase) {
      case GAME_PHASES.LISTENING_WORD:
      case GAME_PHASES.LISTENING_CONTEXT:
        return (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 rounded-full mb-8">
              <Volume2 size={32} className="text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              {phase === GAME_PHASES.LISTENING_WORD
                ? "Presta atención a la palabra"
                : "Escucha el contexto"}
            </h2>
            <p className="text-slate-600">
              La repetición activa fortalece la memoria
            </p>
          </div>
        );

      case GAME_PHASES.REFLECTION:
      case GAME_PHASES.ANSWER:
        return (
          <div className="space-y-8">
            {renderInputModeSelector()}
            {inputMode === INPUT_MODES.TEXT
              ? renderTextInput()
              : renderVoiceInput()}
            {phase === GAME_PHASES.REFLECTION && renderCountdownTimer()}
          </div>
        );

      default:
        return feedback ? renderFeedback() : null;
    }
  };

  const renderCardHeader = () => {
    let phaseText = "";
    switch (phase) {
      case GAME_PHASES.LISTENING_WORD:
        phaseText = "Escuchando";
        break;
      case GAME_PHASES.LISTENING_CONTEXT:
        phaseText = "Contexto";
        break;
      case GAME_PHASES.REFLECTION:
        phaseText = "Reflexión";
        break;
      default:
        phaseText = "Tu respuesta";
    }

    return (
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${
              phase === GAME_PHASES.LISTENING_WORD ||
              phase === GAME_PHASES.LISTENING_CONTEXT
                ? "bg-amber-500 animate-pulse"
                : phase === GAME_PHASES.REFLECTION
                  ? "bg-blue-500"
                  : "bg-emerald-500"
            }`}
          ></div>
          <span className="text-slate-600 font-medium text-sm uppercase tracking-wide">
            {phaseText}
          </span>
        </div>

        <button
          onClick={replayAudio}
          disabled={isReplaying || !audioAvailable}
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
    );
  };

  const renderSummary = () => (
    <div className="pop-in">
      <div className="relative rounded-3xl shadow-2xl overflow-hidden bg-white border border-slate-100">
        {/* Encabezado */}
        <div
          className={`p-6 ${
            feedback === FEEDBACK_TYPES.CORRECT
              ? "bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100"
              : "bg-gradient-to-r from-rose-50 to-pink-50 border-b border-rose-100"
          }`}
        >
          <div className="text-center">
            <div
              className={`inline-flex items-center justify-center w-14 h-14 rounded-full mb-4 ${
                feedback === FEEDBACK_TYPES.CORRECT
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-rose-100 text-rose-600"
              }`}
            >
              {feedback === FEEDBACK_TYPES.CORRECT ? (
                <Check size={28} />
              ) : (
                <X size={28} />
              )}
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              {feedback === FEEDBACK_TYPES.CORRECT
                ? "¡Correcto!"
                : "Respuesta Incorrecta"}
            </h2>
            <p className="text-slate-600">
              {timeoutExpired
                ? "El tiempo de reflexión ha terminado"
                : feedback === FEEDBACK_TYPES.CORRECT
                  ? "Has dominado esta palabra"
                  : `Respuesta: "${userInput}"`}
            </p>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-8">
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
                      onWordClick={handleWordClick}
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
                    onWordClick={handleWordClick}
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
              <ArrowRight
                size={22}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCard = () => (
    <div className="mb-8 slide-up">
      <div
        className={`bg-white rounded-3xl shadow-2xl overflow-hidden border-2 ${
          feedback === FEEDBACK_TYPES.CORRECT
            ? "border-emerald-500"
            : feedback === FEEDBACK_TYPES.INCORRECT
              ? "border-rose-500"
              : "border-slate-100"
        }`}
      >
        {/* Encabezado */}
        <div className="bg-gradient-to-r from-slate-50 to-white p-6 border-b border-slate-100">
          {renderCardHeader()}
        </div>

        {/* Contenido */}
        <div className="p-8 md:p-12">{renderCardContent()}</div>
      </div>
    </div>
  );

  // ==========================================================================
  // RENDERIZADO PRINCIPAL
  // ==========================================================================

  return (
    <div className="min-h-screen p-4 md:p-6 font-sans">
      {/* Estilos CSS */}
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

      {/* Confetti */}
      {showConfetti && <Confetti />}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-8 text-center">
          <div className="inline-flex items-center gap-3 mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-full">
            <Brain size={24} />
            <h1 className="text-3xl font-bold tracking-tight">LexiFlash</h1>
          </div>
          <p className="text-slate-600 text-sm font-medium tracking-wide uppercase">
            {category?.title}
          </p>
        </header>

        {/* Panel de progreso completo */}
        
        <div className="bg-gradient-to-r from-white to-slate-50 rounded-2xl shadow-xl p-4 mb-8 border border-slate-100 slide-up hover:shadow-2xl transition-shadow duration-300">
          <div className="flex items-center justify-between gap-6">
            {/* Progreso y barra */}
            <div className="flex-1 flex items-center gap-4">
              {/* Icono y numérico */}
              <div className="flex items-center gap-3 min-w-[100px]">
                <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg shadow-md">
                  <Target className="text-white" size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-800 font-bold text-lg">
                    {correctCards.length} / {totalCards}
                  </span>
                  <span className="text-slate-500 text-sm">Progreso</span>
                </div>
              </div>

              {/* Barra de progreso */}
              <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>

              {/* Porcentaje */}
              <span className="text-slate-700 font-medium min-w-[50px] text-center">
                {progressPercentage}%
              </span>
            </div>

            {/* Métricas clave */}
            <div className="flex items-center gap-4">
              {/* XP */}
              <div className="flex items-center gap-1 px-2 py-1 bg-indigo-50 rounded-lg border border-indigo-100 shadow-sm">
                <Sparkles className="text-indigo-600" size={16} />
                <span className="text-slate-800 font-bold">{xp}</span>
              </div>

              {/* Aciertos */}
              <div className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded-lg border border-green-100 shadow-sm">
                <CheckCircle className="text-green-600" size={16} />
                <span className="text-slate-800 font-bold">{totalCorrect}</span>
              </div>

              {/* Errores */}
              <div className="flex items-center gap-1 px-2 py-1 bg-red-50 rounded-lg border border-red-100 shadow-sm">
                <XCircle className="text-red-600" size={16} />
                <span className="text-slate-800 font-bold">{totalErrors}</span>
              </div>

              {/* Racha */}
              <div className="flex items-center gap-1 px-2 py-1 bg-yellow-50 rounded-lg border border-yellow-100 shadow-sm">
                <Flame className="text-yellow-600" size={16} />
                <span className="text-slate-800 font-bold">{streak}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        {isLoading ? (
          renderLoadingScreen()
        ) : deck.length === 0 &&
          correctCards.length === 0 &&
          !isLoading &&
          initialCardsLoaded ? (
          renderCompletedScreen()
        ) : currentCard ? (
          <>
            {!showSummary && renderCard()}
            {showSummary && renderSummary()}
          </>
        ) : (
          renderWaitingScreen()
        )}

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-slate-200 text-center">
          <p className="text-slate-500 text-sm">
            LexiFlash activa la{" "}
            <span className="font-semibold text-slate-700">
              memoria visual y auditiva
            </span>{" "}
            para mejorar la consolidación neuronal del vocabulario
          </p>

          <div className="flex justify-center gap-6 mt-4">
            <span className="text-xs text-slate-400">
              • Aprendizaje multisensorial
            </span>
            <span className="text-xs text-slate-400">
              • Recuperación activa
            </span>
            <span className="text-xs text-slate-400">• Feedback inmediato</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LexiFlashScreen;
