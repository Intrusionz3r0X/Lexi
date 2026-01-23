/**
 * Mezcla aleatoriamente un array usando el algoritmo Fisher-Yates
 */
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Calcula la distancia de Levenshtein entre dos cadenas
 */
export const levenshtein = (a, b) => {
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
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
};

/**
 * Normaliza texto para comparaciones
 */
export const normalizeText = (text) => {
  return text.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/[^a-z0-9\s]/g, '');
};

/**
 * Verifica si hay una coincidencia aproximada
 */
export const isFuzzyMatch = (input, target, threshold = 2) => {
  return levenshtein(normalizeText(input), normalizeText(target)) <= threshold;
};

/**
 * Verifica si la respuesta del usuario es correcta
 */
export const checkAnswer = (userAnswer, correctWord, correctMeaning, exactMode = false) => {
  const normalized = normalizeText(userAnswer);
  const normalizedWord = normalizeText(correctWord);
  const normalizedMeanings = correctMeaning.split('/').map(m => normalizeText(m));

  // Verificación de coincidencia exacta
  if (normalized === normalizedWord) return true;
  if (normalizedMeanings.some(meaning => normalized === meaning)) return true;

  // Verificación de coincidencia aproximada
  if (!exactMode) {
    if (isFuzzyMatch(normalized, normalizedWord)) return true;
    if (normalizedMeanings.some(meaning => isFuzzyMatch(normalized, meaning))) return true;
  }

  return false;
};