# Lexi



```
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install lucide-react
npm run dev
```

```
lexi-app/
├── src/
│   ├── components/
│   │   ├── games/                      ← Nueva carpeta para todos los minijuegos
│   │   │   ├── LexiFlash/              ← Tu juego actual refactorizado
│   │   │   │   ├── LexiFlashScreen.jsx
│   │   │   │   ├── index.js
│   │   │   │   ├── hooks/
│   │   │   │   ├── components/
│   │   │   │   └── utils/
│   │   │   ├── LexiMatch/              ← Nuevo juego
│   │   │   │   ├── LexiMatchScreen.jsx
│   │   │   │   ├── index.js
│   │   │   │   ├── hooks/
│   │   │   │   ├── components/
│   │   │   │   └── utils/
│   │   │   ├── LexiSpeak/              ← Futuro juego de speaking
│   │   │   ├── LexiWrite/              ← Futuro juego de writing
│   │   │   └── index.js                ← Exporta todos los juegos
│   │   ├── screens/
│   │   │   ├── HomeScreen.jsx
│   │   │   ├── LessonsScreen.jsx
│   │   │   ├── GameSelectorScreen.jsx  ← Nueva pantalla para elegir juego
│   │   │   ├── LexiFlashScreen.jsx     ← Este ahora importa de /games
│   │   │   └── ...
│   ├── data/
│   │   ├── games/                      ← Datos específicos por juego
│   │   │   ├── lexiFlashCards.js
│   │   │   ├── lexiMatchPairs.js
│   │   │   └── index.js
│   │   ├── stories.js
│   │   ├── lessonCategories.js
│   │   └── languages.js
│   ├── shared/                         ← Recursos compartidos
│   │   ├── components/                 ← Componentes reutilizables
│   │   │   ├── GameLayout.jsx         ← Layout común para juegos
│   │   │   ├── ProgressBar.jsx
│   │   │   ├── ScoreDisplay.jsx
│   │   │   ├── Timer.jsx
│   │   │   └── Confetti.jsx           ← Mover aquí para reusar
│   │   ├── hooks/                      ← Hooks reutilizables
│   │   │   ├── useAudio.js
│   │   │   ├── useTimer.js
│   │   │   ├── useScore.js
│   │   │   └── useGameState.js
│   │   └── utils/                      ← Utilidades compartidas
│   │       ├── stringUtils.js
│   │       ├── audioUtils.js
│   │       └── gameUtils.js
│   ├── services/
│   │   └── ttsService.js
│   ├── styles/
│   │   └── animations.css
│   └── ... resto ...
```