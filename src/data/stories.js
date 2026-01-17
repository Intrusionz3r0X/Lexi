import storiesData from './storiesData.json';

// Exportar las historias desde el JSON
export const stories = storiesData.stories;

// Función helper para obtener una historia por ID
export const getStoryById = (id) => {
  return stories.find(story => story.id === id);
};

// Función helper para obtener historias por dificultad
export const getStoriesByDifficulty = (difficulty) => {
  return stories.filter(story => story.difficulty === difficulty);
};

// Función helper para obtener historias por tipo
export const getStoriesByType = (type) => {
  return stories.filter(story => story.type === type);
};