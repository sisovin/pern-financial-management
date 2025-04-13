import { useState, useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import SplashScreen from "./components/SplashScreen.tsx";
import DarkModeToggle from "./components/DarkModeToggle.tsx";
import { router } from "./router.config.ts"; // Import the router with .ts extension
import "./styles/App.css";

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Initialize dark mode based on saved preference or system preference
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    return savedTheme === "dark" || (!savedTheme && prefersDark);
  });

  // Initialize dark mode on first render
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Splash screen timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);

      // Re-apply dark mode after splash screen
      const savedTheme = localStorage.getItem("theme");
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      const shouldBeDark =
        savedTheme === "dark" || (!savedTheme && prefersDark);

      if (shouldBeDark) {
        document.documentElement.classList.add("dark");
        setIsDarkMode(true);
      } else {
        document.documentElement.classList.remove("dark");
        setIsDarkMode(false);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Toggle dark mode function to pass to DarkModeToggle
  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => {
      const newMode = !prevMode;
      if (newMode) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
      return newMode;
    });
  };
  

  // In your return statement, add the ToggleSidebar component
  return (
    <div className="App">
      {showSplash ? (
        <SplashScreen darkMode={isDarkMode} />
      ) : (
        <>
          {/* Dark mode toggle - always show this */}
          <div className="fixed top-4 right-4 z-50">
            <DarkModeToggle
              isDarkMode={isDarkMode}
              toggleDarkMode={toggleDarkMode}
            />
          </div>          

          <RouterProvider router={router} />
        </>
      )}
    </div>
  );
}

export default App;
