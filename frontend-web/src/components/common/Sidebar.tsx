import React from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar: React.FC = () => {
  const location = useLocation();
  
  // Function to check if a link is active
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="w-64 bg-surface border-r border-border h-full py-6 px-4">
      <h3 className="text-lg font-bold mb-4 text-text">Menu</h3>
      <ul className="space-y-2">
        <li>
          <Link 
            to="/dashboard" 
            className={`block py-2 px-4 rounded transition-colors font-medium ${
              isActive('/dashboard') 
                ? 'bg-primary text-white' 
                : 'text-text hover:bg-gray-100'
            }`}
          >
            Dashboard
          </Link>
        </li>
        <li>
          <Link 
            to="/transactions" 
            className={`block py-2 px-4 rounded transition-colors font-medium ${
              isActive('/transactions') 
                ? 'bg-primary text-white' 
                : 'text-text hover:bg-gray-100'
            }`}
          >
            Transactions
          </Link>
        </li>
        <li>
          <Link 
            to="/goals" 
            className={`block py-2 px-4 rounded transition-colors font-medium ${
              isActive('/goals') 
                ? 'bg-primary text-white' 
                : 'text-text hover:bg-gray-100'
            }`}
          >
            Financial Goals
          </Link>
        </li>
        <li>
          <Link 
            to="/reports" 
            className={`block py-2 px-4 rounded transition-colors font-medium ${
              isActive('/reports') 
                ? 'bg-primary text-white' 
                : 'text-text hover:bg-gray-100'
            }`}
          >
            Reports
          </Link>
        </li>
        <li>
          <Link 
            to="/settings" 
            className={`block py-2 px-4 rounded transition-colors font-medium ${
              isActive('/settings') 
                ? 'bg-primary text-white' 
                : 'text-text hover:bg-gray-100'
            }`}
          >
            Settings
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;