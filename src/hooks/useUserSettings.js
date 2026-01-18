import { useState } from "react";
import userData from "../data/user.json";

export const useUserSettings = () => {
  const [user, setUser] = useState(userData); // inicializamos directo

  const setLearningLang = (lang) => {
    setUser((prev) => ({
      ...prev,
      profile: { ...prev.profile, learningLang: lang },
    }));
  };

  const setTheme = (theme) => {
    setUser((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, theme },
    }));
  };

  return { user, setLearningLang, setTheme };
};
