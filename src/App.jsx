import React, { useState } from 'react';
import HomeScreen from './components/screens/HomeScreen';
import LessonsScreen from './components/screens/LessonsScreen';
import StoriesScreen from './components/screens/StoriesScreen';
import SettingsScreen from './components/screens/SettingsScreen';
import StoryDetail from './components/StoryDetail';
import NavBar from './components/NavBar';
import AnimatedBackground from './components/AnimatedBackground';

const App = () => {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedStory, setSelectedStory] = useState(null);

  const handleNavigate = (screen) => {
    setCurrentScreen(screen);
    setSelectedStory(null); // Limpiar historia seleccionada al cambiar de pantalla
  };

  const handleSelectStory = (story) => {
    setSelectedStory(story);
  };

  const handleCloseStory = () => {
    setSelectedStory(null);
  };

  const renderScreen = () => {
    // Si hay una historia seleccionada, mostrar el detalle
    if (selectedStory) {
      return <StoryDetail story={selectedStory} onClose={handleCloseStory} />;
    }

    switch (currentScreen) {
      case 'home':
        return <HomeScreen />;
      case 'lessons':
        return <LessonsScreen />;
      case 'stories':
        return <StoriesScreen onSelectStory={handleSelectStory} />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden bg-white" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <AnimatedBackground />
      
      {/* Contenido principal */}
      <div className="relative z-0 max-w-2xl mx-auto p-6">
        {renderScreen()}
      </div>
      
      <NavBar currentScreen={currentScreen} onNavigate={handleNavigate} />
    </div>
  );
};

export default App;