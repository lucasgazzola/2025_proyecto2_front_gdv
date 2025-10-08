import { createContext } from "react";

export type Language = "es" | "en";
// Define la interfaz para el contexto de lenguaje
interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string; // Función de traducción
}

export const LanguageContext = createContext<LanguageContextType | null>(null);
