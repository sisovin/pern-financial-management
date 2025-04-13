import React, { createContext, useState, useContext, ReactNode } from 'react';
import theme from '../config/theme';

interface ThemeContextProps {
  theme: typeof theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(theme);

  const toggleTheme = () => {
    setCurrentTheme((prevTheme) => ({
      ...prevTheme,
      colors: {
        ...prevTheme.colors,
        primary: prevTheme.colors.primary === '#3498db' ? '#2ecc71' : '#3498db',
      },
    }));
  };

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextProps => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
