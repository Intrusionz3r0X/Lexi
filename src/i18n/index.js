// src/i18n/index.js
import { useCallback } from "react";
import en from "./en.json";
import fr from "./fr.json";
import es from "./es.json";

const translations = { en, fr, es };

export const useTranslation = (lang, fallbackLang) => {
  const t = useCallback(
    (key, vars = {}) => {
      const keys = key.split(".");
      // Busca primero en lang, si no existe busca en fallbackLang
      let text =
        keys.reduce((obj, k) => obj?.[k], translations[lang]) ||
        keys.reduce((obj, k) => obj?.[k], translations[fallbackLang]) ||
        key;

      Object.keys(vars).forEach((v) => {
        const regex = new RegExp(`{{${v}}}`, "g");
        text = text.replace(regex, vars[v]);
      });

      return text;
    },
    [lang, fallbackLang]
  );

  return { t };
};
