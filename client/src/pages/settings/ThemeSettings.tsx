import React from 'react';
import useDarkMode from '../../hooks/useDarkMode';

const ThemeSettings = () => {
  const [theme, setTheme] = useDarkMode();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="theme-settings">
      <h2>Theme Settings</h2>
      <button onClick={toggleTheme}>
        Switch to {theme === 'dark' ? 'light' : 'dark'} mode
      </button>
    </div>
  );
};

export default ThemeSettings;
