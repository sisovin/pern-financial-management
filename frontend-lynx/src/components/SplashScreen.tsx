import React from "react";

interface SplashScreenProps {
  darkMode?: boolean;
}

// Try to import the logo if it exists, or use a fallback
let lynxLogo: string;
try {
  lynxLogo = require("../assets/lynx-logo.png");
} catch (e) {
  // Fallback if the logo doesn't exist
  lynxLogo = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%234f46e5' rx='20' /%3E%3Ctext x='50' y='55' font-family='Arial' font-size='24' text-anchor='middle' fill='white'%3ELynx%3C/text%3E%3C/svg%3E";
}

// Import the CSS
import "../styles/SplashScreen.css";

const SplashScreen: React.FC<SplashScreenProps> = ({ darkMode = false }) => {
  return (
    <div className={`splash-screen ${darkMode ? 'dark-splash' : 'light-splash'}`}>
      <div className="splash-screen__center">
        <img src={lynxLogo} className="splash-screen__logo" alt="Lynx Logo" />
        <div className="splash-screen__text">Lynxjs Notes App</div>
      </div>
    </div>
  );
};

export default SplashScreen;