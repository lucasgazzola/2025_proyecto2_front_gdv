import React, { useState, useEffect } from "react";
import { type ReactNode } from "react";

// Tipo para las traducciones, permitiendo propiedades anidadas
// Define lenguages disponibles

interface Translations {
  [key: string]: string | Translations; // Valor puede ser string o un objeto con más claves
}

// Definir las propiedades del proveedor de lenguaje
interface LanguageProviderProps {
  children: ReactNode;
  defaultLanguage?: Language;
}

// Importar los archivos de traducción
import es from "@/translations/es";
import en from "@/translations/en";

import { LanguageContext, type Language } from "../LanguageContext";

// Crear un objeto de traducciones que contenga los archivos de traducción
const translations: Record<string, Translations> = {
  es,
  en,
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
  defaultLanguage = "es",
}) => {
  // Obtener el idioma guardado en localStorage o usar el idioma por defecto
  // Si el idioma guardado no es válido, usar el idioma por defecto
  const [language, setLanguageState] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem("language") as Language;
    const isValidLanguage =
      savedLanguage && (savedLanguage === "es" || savedLanguage === "en");
    return isValidLanguage ? (savedLanguage as Language) : defaultLanguage;
  });

  // Cambiar el idioma y guardar en localStorage
  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem("language", newLanguage);
    document.documentElement.setAttribute("lang", newLanguage);
  };

  // Actualizar el atributo lang del elemento HTML cuando el idioma cambia
  // Esto es útil para la accesibilidad y SEO
  useEffect(() => {
    document.documentElement.setAttribute("lang", language);
  }, [language]);

  // Función de traducción
  const t = (key: string): string => {
    // Separa la clave por el punto (.) para acceder a propiedades anidadas
    // usa . porques es el separador de propiedades en los objetos
    const keys = key.split(".");

    // Accede a la traducción correspondiente al idioma actual
    let translation: Translations | string = translations[language];

    // Navega por las claves anidadas en el objeto de traducción
    for (const k of keys) {
      // Navega por las claves anidadas en el objeto de traducción
      translation = (translation as Translations)?.[k];
      if (!translation) {
        // console.warn(`Translation key not found: ${key}`);
        return key; // Si no se encuentra, retorna la clave original
      }
    }

    return translation as string; // Devuelve la traducción si se encontró
  };

  // Proveer el contexto de lenguaje a los componentes hijos
  // El valor del contexto incluye el idioma actual, la función para cambiarlo y la función de traducción
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
