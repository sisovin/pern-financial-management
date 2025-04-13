import { createBrowserRouter } from 'react-router-dom';
import React from 'react';
import HomePage from './pages/HomePage.tsx';

// Define your routes with future flags
export const router = createBrowserRouter(
  [
    {
      path: "/",
      element: React.createElement(HomePage)
    }
    // Add more routes here
  ],
  {
    future: {
      // Using only supported future flags
      v7_relativeSplatPath: true
    }
  }
);