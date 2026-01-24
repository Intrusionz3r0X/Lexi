import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Check, X, Trophy, Brain, Volume2, 
  Target, Award, ArrowLeft, Sparkles,
  CheckCircle, XCircle, Flame, Zap, TrendingUp
} from 'lucide-react';

// ============================================================================
// CONSTANTES DE CONFIGURACIÓN (PARÁMETRIZABLES)
// ============================================================================

const GAME_CONFIG = {
  WORDS_PER_PAGE: 5,
  CONFETTI_DURATION: 4000,
  PAGE_TRANSITION_DELAY: 300,
  FEEDBACK_DURATION: 800,
  GLOW_DURATION: 1000,
  SUCCESS_SCORE_INCREMENT: 10,
  HOVER_AUDIO_DELAY: 300, // Delay antes de reproducir audio en hover
  XP_PER_CORRECT: 10,
  XP_PENALTY: 2,
};

const FEEDBACK_TYPES = {
  CORRECT: 'correct',
  INCORRECT: 'incorrect',
  NONE: 'none',
};

const SLIDE_DIRECTIONS = {
  NEXT: 'next',
  PREV: 'prev',
  NONE: '',
};

// ============================================================================
// DATOS DE EJEMPLO (ESTOS VENDRÍAN DE LA CONFIGURACIÓN DEL USUARIO)
// ============================================================================

// Estas variables deberían venir de props o configuración
const TARGET_LANGUAGE = 'Francés'; // Ejemplo: idioma que se está aprendiendo
const USER_LANGUAGE = 'Español'; // Ejemplo: idioma nativo del usuario

const createWordPair = (targetWord, nativeWord) => ({ 
  targetWord, 
  nativeWord,
  id: `${targetWord}-${nativeWord}` 
});

const ALL_WORDS = [
  createWordPair("Bonjour", "Hola"),
  createWordPair("Merci", "Gracias"),
  createWordPair("Chat", "Gato"),
  createWordPair("Chien", "Perro"),
  createWordPair("Maison", "Casa"),
  createWordPair("Eau", "Agua"),
  createWordPair("Pain", "Pan"),
  createWordPair("Ami", "Amigo"),
  createWordPair("Livre", "Libro"),
  createWordPair("Fleur", "Flor"),
  createWordPair("Soleil", "Sol"),
  createWordPair("Lune", "Luna"),
  createWordPair("Étoile", "Estrella"),
  createWordPair("Arbre", "Árbol"),
  createWordPair("Oiseau", "Pájaro"),
  createWordPair("Pomme", "Manzana"),
  createWordPair("Fromage", "Queso"),
  createWordPair("Vin", "Vino"),
  createWordPair("Rue", "Calle"),
  createWordPair("Voiture", "Coche"),
  createWordPair("Train", "Tren"),
  createWordPair("Avion", "Avión"),
  createWordPair("Bateau", "Barco"),
];

// ============================================================================
// SERVICIO DE AUDIO PARA HOVER
// ============================================================================

class AudioService {
  constructor() {
    this.audioContext = null;
    this.speechSynth = window.speechSynthesis;
    this.hoverTimeout = null;
    this.initializeAudioContext();
  }

  initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (error) {
      console.warn("AudioContext no disponible:", error);
    }
  }

  // Reproducir sonido de éxito/error
  playTone(frequency, duration, type = 'sine', volume = 0.3) {
    if (!this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      oscillator.type = type;

      gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        this.audioContext.currentTime + duration,
      );

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (error) {
      console.warn("Error reproduciendo sonido:", error);
    }
  }

  playSuccessSound() {
    this.playTone(523.25, 0.1);
    setTimeout(() => this.playTone(659.25, 0.1), 100);
    setTimeout(() => this.playTone(783.99, 0.1), 200);
  }

  playErrorSound() {
    this.playTone(200, 0.1, 'sawtooth');
    setTimeout(() => this.playTone(150, 0.1, 'sawtooth'), 100);
  }

  // Reproducir palabra con síntesis de voz
  speakWord(text, lang = 'fr-FR') {
    if (this.speechSynth.speaking) {
      this.speechSynth.cancel();
    }

    // Clear any existing timeout
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
    }

    // Delay para evitar audio spam en hover rápido
    this.hoverTimeout = setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.9;
      utterance.volume = 0.8;
      
      this.speechSynth.speak(utterance);
    }, GAME_CONFIG.HOVER_AUDIO_DELAY);
  }

  cancelHoverAudio() {
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
      this.hoverTimeout = null;
    }
    if (this.speechSynth.speaking) {
      this.speechSynth.cancel();
    }
  }
}

// ============================================================================
// COMPONENTES DE UI
// ============================================================================

const Confetti = ({ active }) => {
  if (!active) return null;

  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];
  
  const confettiPieces = useMemo(() => 
    Array.from({ length: 50 }, (_, index) => ({
      id: index,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      color: colors[Math.floor(Math.random() * colors.length)],
    })), []
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confettiPieces.map(piece => (
        <div
          key={piece.id}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: `${piece.left}%`,
            backgroundColor: piece.color,
            animation: `confettiFall 3s linear ${piece.delay}s forwards`,
            top: '-5%',
          }}
        />
      ))}
    </div>
  );
};

const PageIndicator = ({ totalPages, currentPage, completedPages }) => {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: totalPages }, (_, index) => {
        const isCompleted = completedPages.has(index);
        const isCurrent = index === currentPage;
        
        return (
          <div
            key={index}
            className={`
              transition-all duration-300 rounded-full flex items-center justify-center
              ${isCurrent 
                ? 'w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
                : isCompleted
                  ? 'w-6 h-6 bg-emerald-500'
                  : 'w-3 h-3 bg-slate-300'
              }
            `}
            aria-label={`Página ${index + 1}`}
          >
            {isCurrent && <span className="text-xs font-bold">{index + 1}</span>}
          </div>
        );
      })}
    </div>
  );
};

const CompletionModal = ({ score, accuracy, onRestart, xp, totalCorrect, totalErrors, streak }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
    <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-md mx-4 text-center border border-slate-200 animate-bounce-in">
      <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full mb-8 shadow-lg">
        <Award size={48} className="text-white" />
      </div>
      <h2 className="text-4xl font-bold text-slate-800 mb-4">¡Dominado!</h2>
      <p className="text-slate-600 text-lg mb-8">
        Has completado todas las {ALL_WORDS.length} palabras
      </p>
      <div className="bg-gradient-to-r from-slate-50 to-white rounded-xl p-6 mb-8 border border-slate-200">
        <div className="text-4xl font-bold text-slate-800 mb-2">{score} puntos</div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-sm text-slate-600">XP</div>
            <div className="text-xl font-bold text-indigo-600">{xp}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-slate-600">Racha</div>
            <div className="text-xl font-bold text-yellow-600">{streak}</div>
          </div>
        </div>
        <div className="text-slate-600">
          Precisión: <span className="font-semibold text-emerald-600">{accuracy}%</span>
        </div>
      </div>
      <button
        onClick={onRestart}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-10 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all shadow-lg w-full"
      >
        Jugar de Nuevo
      </button>
    </div>
  </div>
);

const DraggingGhost = ({ draggedWord, dragPosition, isDragging }) => {
  if (!isDragging || !draggedWord) return null;

  return (
    <div
      className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2 animate-drag-glow"
      style={{
        left: `${dragPosition.x}px`,
        top: `${dragPosition.y}px`,
      }}
    >
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-4 shadow-2xl rotate-3">
        <div className="text-xl font-bold text-white flex items-center gap-3">
          <span className="text-2xl">🎯</span>
          {draggedWord.targetWord}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const LexiMatch = () => {
  // ==========================================================================
  // ESTADOS
  // ==========================================================================
  
  const [currentPage, setCurrentPage] = useState(0);
  const [nativeShuffleOrder, setNativeShuffleOrder] = useState([]);
  const [matches, setMatches] = useState({});
  const [draggedWord, setDraggedWord] = useState(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [completedWords, setCompletedWords] = useState(new Set());
  const [completedPages, setCompletedPages] = useState(new Set());
  const [feedback, setFeedback] = useState({});
  const [glowWord, setGlowWord] = useState(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [slideDirection, setSlideDirection] = useState(SLIDE_DIRECTIONS.NONE);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Estados transferibles entre juegos (nuevos)
  const [xp, setXp] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalErrors, setTotalErrors] = useState(0);
  const [streak, setStreak] = useState(0);
  
  const audioServiceRef = useRef(null);
  const hoverTimeoutRef = useRef(null);

  // ==========================================================================
  // VARIABLES DERIVADAS
  // ==========================================================================
  
  const totalPages = useMemo(
    () => Math.ceil(ALL_WORDS.length / GAME_CONFIG.WORDS_PER_PAGE),
    []
  );

  const currentWords = useMemo(
    () => ALL_WORDS.slice(
      currentPage * GAME_CONFIG.WORDS_PER_PAGE,
      (currentPage + 1) * GAME_CONFIG.WORDS_PER_PAGE
    ),
    [currentPage]
  );

  const currentNativeWords = useMemo(() => {
    if (!nativeShuffleOrder[currentPage]) return currentWords;
    
    return nativeShuffleOrder[currentPage].map(idx => currentWords[idx]);
  }, [nativeShuffleOrder, currentPage, currentWords]);

  const isPageComplete = useMemo(
    () => currentWords.every(word => completedWords.has(word.nativeWord)),
    [currentWords, completedWords]
  );

  const accuracy = useMemo(() => {
    if (attempts === 0) return 0;
    return Math.round((score / (attempts * GAME_CONFIG.SUCCESS_SCORE_INCREMENT)) * 100);
  }, [score, attempts]);

  // Variables para la barra de progreso (nuevas)
  const totalWords = useMemo(() => ALL_WORDS.length, []);
  const completedWordsCount = useMemo(() => completedWords.size, [completedWords]);
  const progressPercentage = useMemo(() => {
    if (totalWords === 0) return 0;
    return Math.round((completedWordsCount / totalWords) * 100);
  }, [completedWordsCount, totalWords]);

  const wordsRemaining = useMemo(() => totalWords - completedWordsCount, [totalWords, completedWordsCount]);

  // ==========================================================================
  // EFECTOS
  // ==========================================================================
  
  useEffect(() => {
    audioServiceRef.current = new AudioService();
    initializeGame();
    
    return () => {
      // Cleanup
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      if (audioServiceRef.current) {
        audioServiceRef.current.cancelHoverAudio();
      }
    };
  }, []);

  useEffect(() => {
    if (isPageComplete && !gameComplete) {
      console.log('Página completada, procesando...');
      
      const timer = setTimeout(() => {
        setCompletedPages(prev => {
          const newSet = new Set(prev);
          newSet.add(currentPage);
          return newSet;
        });
        
        if (currentPage === totalPages - 1) {
          setGameComplete(true);
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), GAME_CONFIG.CONFETTI_DURATION);
        } else {
          console.log('Avanzando a página:', currentPage + 1);
          // Animar y cambiar página
          setSlideDirection(SLIDE_DIRECTIONS.NEXT);
          setTimeout(() => {
            setCurrentPage(prev => prev + 1);
            setTimeout(() => setSlideDirection(SLIDE_DIRECTIONS.NONE), 50);
          }, GAME_CONFIG.PAGE_TRANSITION_DELAY);
        }
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [isPageComplete, gameComplete, currentPage, totalPages]);

  // ==========================================================================
  // FUNCIONES DE INICIALIZACIÓN
  // ==========================================================================
  
  const initializeGame = () => {
    const shuffleIndices = generateShuffleIndices();
    setNativeShuffleOrder(shuffleIndices);
    resetGameState();
  };

  const generateShuffleIndices = () => {
    return Array.from({ length: totalPages }, (_, page) => {
      const startIdx = page * GAME_CONFIG.WORDS_PER_PAGE;
      const endIdx = Math.min(startIdx + GAME_CONFIG.WORDS_PER_PAGE, ALL_WORDS.length);
      const pageSize = endIdx - startIdx;
      
      const indices = Array.from({ length: pageSize }, (_, i) => i);
      
      // Shuffle using Fisher-Yates algorithm
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      
      return indices;
    });
  };

  const resetGameState = () => {
    setCurrentPage(0);
    setMatches({});
    setScore(0);
    setAttempts(0);
    setCompletedWords(new Set());
    setCompletedPages(new Set());
    setFeedback({});
    setGlowWord(null);
    setGameComplete(false);
    setShowConfetti(false);
    setSlideDirection(SLIDE_DIRECTIONS.NONE);
    setDraggedWord(null);
    setIsDragging(false);
    setIsProcessing(false);
    
    // Resetear estados transferibles
    setXp(0);
    setTotalCorrect(0);
    setTotalErrors(0);
    setStreak(0);
  };

  // ==========================================================================
  // FUNCIONES DE NAVEGACIÓN
  // ==========================================================================
  
  const goToPreviousPage = useCallback(() => {
    if (currentPage > 0) {
      setSlideDirection(SLIDE_DIRECTIONS.PREV);
      setTimeout(() => {
        setCurrentPage(prev => prev - 1);
        setTimeout(() => setSlideDirection(SLIDE_DIRECTIONS.NONE), 50);
      }, GAME_CONFIG.PAGE_TRANSITION_DELAY);
    }
  }, [currentPage]);

  // ==========================================================================
  // FUNCIONES DE DRAG & DROP
  // ==========================================================================
  
  const handleDragStart = useCallback((e, word) => {
    if (completedWords.has(word.nativeWord)) return;
    
    setDraggedWord(word);
    setIsDragging(true);
    
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setDragImage(new Image(), 0, 0);
    
    setDragPosition({ 
      x: e.clientX - offsetX, 
      y: e.clientY - offsetY 
    });
  }, [completedWords]);

  const handleDrag = useCallback((e) => {
    if (e.clientX === 0 && e.clientY === 0) return;
    setDragPosition({ 
      x: e.clientX - 50, 
      y: e.clientY - 25 
    });
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setDraggedWord(null);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e, nativeWord) => {
    e.preventDefault();
    
    if (!draggedWord || completedWords.has(nativeWord.nativeWord) || isProcessing) {
      return;
    }

    setIsProcessing(true);
    const isCorrect = draggedWord.nativeWord === nativeWord.nativeWord;
    
    // Actualizar intentos
    setAttempts(prev => prev + 1);
    
    if (isCorrect) {
      // Reproducir sonido de éxito
      audioServiceRef.current?.playSuccessSound();
      
      // Actualizar feedback inmediatamente
      setFeedback(prev => ({
        ...prev,
        [nativeWord.nativeWord]: FEEDBACK_TYPES.CORRECT
      }));
      
      // Efecto de glow
      setGlowWord(nativeWord.nativeWord);
      
      // Actualizar matches
      setMatches(prev => ({
        ...prev,
        [nativeWord.nativeWord]: draggedWord.targetWord
      }));
      
      // Actualizar score
      setScore(prev => prev + GAME_CONFIG.SUCCESS_SCORE_INCREMENT);
      
      // Añadir a completadas
      setCompletedWords(prev => {
        const newSet = new Set(prev);
        newSet.add(nativeWord.nativeWord);
        return newSet;
      });
      
      // Actualizar estadísticas transferibles
      setTotalCorrect(prev => prev + 1);
      setStreak(prev => prev + 1);
      setXp(prev => prev + GAME_CONFIG.XP_PER_CORRECT);
      
      // Limpiar glow después del delay
      setTimeout(() => {
        setGlowWord(null);
      }, GAME_CONFIG.GLOW_DURATION);
    } else {
      // Reproducir sonido de error
      audioServiceRef.current?.playErrorSound();
      
      // Mostrar feedback de error
      setFeedback(prev => ({
        ...prev,
        [nativeWord.nativeWord]: FEEDBACK_TYPES.INCORRECT
      }));
      
      // Actualizar estadísticas de errores
      setTotalErrors(prev => prev + 1);
      setStreak(0);
      setXp(prev => Math.max(prev - GAME_CONFIG.XP_PENALTY, 0));
    }
    
    // Limpiar draggedWord
    setDraggedWord(null);
    setIsDragging(false);
    
    // Limpiar feedback después de un tiempo
    setTimeout(() => {
      setFeedback(prev => {
        const newFeedback = { ...prev };
        delete newFeedback[nativeWord.nativeWord];
        return newFeedback;
      });
      setIsProcessing(false);
    }, GAME_CONFIG.FEEDBACK_DURATION);
    
  }, [draggedWord, completedWords, isProcessing]);

  const handleWordHover = useCallback((word) => {
    if (completedWords.has(word.nativeWord)) return;
    
    // Cancelar cualquier audio pendiente
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    // Reproducir audio después de un pequeño delay
    hoverTimeoutRef.current = setTimeout(() => {
      audioServiceRef.current?.speakWord(word.targetWord, 'fr-FR');
    }, GAME_CONFIG.HOVER_AUDIO_DELAY);
  }, [completedWords]);

  const handleWordHoverLeave = useCallback(() => {
    // Cancelar timeout y audio si el mouse sale
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    audioServiceRef.current?.cancelHoverAudio();
  }, []);

  // ==========================================================================
  // RENDERIZADO DE COMPONENTES
  // ==========================================================================
  
  const renderTargetWord = useCallback((word, index) => {
    const isCompleted = completedWords.has(word.nativeWord);
    
    return (
      <div
        key={`${word.id}-${index}-${isCompleted}`}
        draggable={!isCompleted}
        onDragStart={(e) => !isCompleted && handleDragStart(e, word)}
        onDrag={!isCompleted ? handleDrag : undefined}
        onDragEnd={!isCompleted ? handleDragEnd : undefined}
        onMouseEnter={() => !isCompleted && handleWordHover(word)}
        onMouseLeave={handleWordHoverLeave}
        className={`
          group relative rounded-xl p-5 transition-all duration-300
          ${isCompleted 
            ? 'bg-slate-100 cursor-not-allowed border-2 border-dashed border-slate-300' 
            : 'bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 cursor-grab active:cursor-grabbing hover:scale-[1.02] hover:shadow-lg border-2 border-blue-100'
          }
        `}
        style={{
          animation: `slideInLeft 0.4s ease-out ${index * 0.08}s both`
        }}
      >
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold text-slate-800">
            {word.targetWord}
          </div>
          {!isCompleted && (
            <div className="flex items-center gap-2">
              <Volume2 size={18} className="text-blue-500 opacity-70 group-hover:opacity-100 transition-opacity" />
              <div className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                arrastra
              </div>
            </div>
          )}
        </div>
        
        {isCompleted && (
          <div className="absolute inset-0 bg-white/80 rounded-xl flex items-center justify-center">
            <Check size={32} className="text-emerald-500" />
          </div>
        )}
      </div>
    );
  }, [completedWords, handleDragStart, handleDrag, handleDragEnd, handleWordHover, handleWordHoverLeave]);

  const renderNativeWord = useCallback((word, index) => {
    const isMatched = matches[word.nativeWord];
    const feedbackState = feedback[word.nativeWord];
    const isGlowing = glowWord === word.nativeWord;
    const isCompleted = completedWords.has(word.nativeWord);
    
    return (
      <div
        key={`${currentPage}-native-${index}`}
        onDragOver={!isCompleted ? handleDragOver : undefined}
        onDrop={!isCompleted ? (e) => handleDrop(e, word) : undefined}
        className={`
          rounded-xl p-5 transition-all duration-300 border-2
          ${isMatched 
            ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200 transform scale-[1.02] shadow-md' 
            : isCompleted
              ? 'bg-slate-50 border-slate-200 cursor-not-allowed'
              : 'bg-gradient-to-br from-slate-50 to-white border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'
          }
          ${feedbackState === FEEDBACK_TYPES.INCORRECT ? 'animate-shake bg-rose-50 border-rose-200' : ''}
          ${feedbackState === FEEDBACK_TYPES.CORRECT ? 'animate-pulse-success' : ''}
          ${isGlowing ? 'ring-2 ring-emerald-500 ring-offset-2' : ''}
        `}
        style={{
          animation: `slideInRight 0.4s ease-out ${index * 0.08}s both`
        }}
      >
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold text-slate-800">
            {word.nativeWord}
          </div>
          
          {isMatched && (
            <div className="flex items-center gap-3">
              <span className="text-slate-600 text-sm font-medium px-3 py-1 bg-indigo-100 rounded-full">
                {isMatched}
              </span>
              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                <Check size={20} className="text-white" />
              </div>
            </div>
          )}
          
          {feedbackState === FEEDBACK_TYPES.INCORRECT && (
            <div className="w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center animate-shake">
              <X size={20} className="text-white" />
            </div>
          )}
        </div>
        
        {!isMatched && !feedbackState && !isCompleted && (
          <div className="mt-3 text-sm text-slate-500 flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-slate-400"></div>
            <span>Suelta aquí la palabra en {TARGET_LANGUAGE.toLowerCase()}</span>
          </div>
        )}
      </div>
    );
  }, [currentPage, matches, feedback, glowWord, completedWords, handleDragOver, handleDrop]);

  const renderGameBoard = () => (
    <div className={`
      grid lg:grid-cols-2 gap-6 mb-8
      ${slideDirection === SLIDE_DIRECTIONS.NEXT ? 'opacity-0 transform -translate-x-20' : ''}
      ${slideDirection === SLIDE_DIRECTIONS.PREV ? 'opacity-0 transform translate-x-20' : ''}
      transition-all duration-300
    `}>
      {/* Palabras en Idioma Objetivo */}
      <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <span className="text-3xl">🎯</span> {TARGET_LANGUAGE}
            <span className="text-sm font-normal text-slate-500 ml-2">(Arrastra)</span>
          </h2>
        </div>
        
        <div className="space-y-4">
          {currentWords.map((word, index) => renderTargetWord(word, index))}
        </div>
      </div>

      {/* Palabras en Idioma Nativo */}
      <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <span className="text-3xl">🏠</span> {USER_LANGUAGE}
            <span className="text-sm font-normal text-slate-500 ml-2">(Suelta aquí)</span>
          </h2>
        </div>
        
        <div className="space-y-4">
          {currentNativeWords.map((word, index) => renderNativeWord(word, index))}
        </div>
      </div>
    </div>
  );

  const renderNavigationControls = () => {
    const currentPageCompletedCount = currentWords.filter(word => 
      completedWords.has(word.nativeWord)
    ).length;
    
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 mb-8">
        <div className="flex items-center justify-between">
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 0}
            className={`
              flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all
              ${currentPage === 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-slate-100 to-white text-slate-700 hover:bg-slate-200 hover:scale-105 border border-slate-300'
              }
            `}
          >
            <ArrowLeft size={20} />
            <span>Anterior</span>
          </button>

          <div className="text-slate-600 text-sm font-medium">
            {isPageComplete ? (
              <div className="flex items-center gap-2 text-emerald-600">
                <Check size={18} />
                <span>Página completada - Avanzando...</span>
              </div>
            ) : (
              <span>
                {currentPageCompletedCount}/{GAME_CONFIG.WORDS_PER_PAGE} completadas
              </span>
            )}
          </div>

          <div className="w-24"></div> {/* Espacio para balance */}
        </div>
      </div>
    );
  };

  // ==========================================================================
  // RENDERIZADO PRINCIPAL
  // ==========================================================================
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-4 md:p-6 font-sans">
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes slideInLeft {
          from { transform: translateX(-30px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(30px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes bounceIn {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        @keyframes pulseSuccess {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes dragGlow {
          0%, 100% { box-shadow: 0 10px 25px rgba(99, 102, 241, 0.3); }
          50% { box-shadow: 0 15px 35px rgba(99, 102, 241, 0.5); }
        }
        .animate-fade-in { animation: fadeIn 0.5s ease-out; }
        .animate-bounce-in { animation: bounceIn 0.5s ease-out; }
        .animate-shake { animation: shake 0.5s ease-out; }
        .animate-pulse-success { animation: pulseSuccess 0.5s ease-out; }
        .animate-drag-glow { animation: dragGlow 1.5s ease-in-out infinite; }
      `}</style>

      {showConfetti && <Confetti active={showConfetti} />}
      {gameComplete && (
        <CompletionModal 
          score={score} 
          accuracy={accuracy}
          xp={xp}
          totalCorrect={totalCorrect}
          totalErrors={totalErrors}
          streak={streak}
          onRestart={initializeGame}
        />
      )}

      <DraggingGhost
        draggedWord={draggedWord}
        dragPosition={dragPosition}
        isDragging={isDragging}
      />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-8 text-center">
          <div className="inline-flex items-center gap-3 mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-full">
            <Brain size={24} />
            <h1 className="text-3xl font-bold tracking-tight">LexiMatch</h1>
          </div>
          <p className="text-slate-600 text-sm font-medium tracking-wide uppercase">
            Arrastra para emparejar • {TARGET_LANGUAGE} ↔ {USER_LANGUAGE}
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
                    {completedWordsCount} / {totalWords}
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

        {/* Indicador de Página */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
              <span className="text-slate-700 font-medium">
                Página <span className="text-indigo-600 font-bold">{currentPage + 1}</span> de {totalPages}
              </span>
            </div>
            <PageIndicator
              totalPages={totalPages}
              currentPage={currentPage}
              completedPages={completedPages}
            />
          </div>
        </div>

        {/* Tablero de Juego */}
        {renderGameBoard()}

        {/* Controles de Navegación (solo anterior) */}
        {renderNavigationControls()}

        {/* Footer */}
        <footer className="pt-8 border-t border-slate-200 text-center">
          <p className="text-slate-600 text-sm">
            <span className="font-semibold text-slate-700">LexiMatch</span> • 
            Aprendizaje activo mediante emparejamiento
          </p>
          <div className="flex justify-center gap-6 mt-4">
            <span className="text-xs text-slate-400">• Arrastra y suelta</span>
            <span className="text-xs text-slate-400">• Audio en {TARGET_LANGUAGE.toLowerCase()}</span>
            <span className="text-xs text-slate-400">• Memoria espacial</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LexiMatch;