import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./styles/variables.css"; // First import variables
import "./styles/base.css";      // Then base styles
import "./styles/components.css"; // Then component styles (Fixed typo: mport -> import)
import "./styles/utilities.css";
import "./styles/responsive.css";
import "./styles/darkMode.css";
import "./index.css";           // General styles last
import App from "./App";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <App />
    </BrowserRouter>
  </React.StrictMode>
);