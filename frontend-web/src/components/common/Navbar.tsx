import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="flex justify-between items-center px-8 py-3 bg-primary shadow">
      <div className="font-bold text-xl">
        <Link to="/" className="text-white font-bold">Financial Management</Link>
      </div>
      <div className="flex items-center gap-6">
        <Link to="/dashboard" className="text-white font-medium hover:underline">Dashboard</Link>
        <Link to="/transactions" className="text-white font-medium hover:underline">Transactions</Link>
        <Link to="/goals" className="text-white font-medium hover:underline">Goals</Link>
        <Link to="/reports" className="text-white font-medium hover:underline">Reports</Link>
        {user ? (
          <>
            <span className="text-white font-medium bg-primary-hover px-3 py-1 rounded">
              {user.name}
            </span>
            <button 
              onClick={logout} 
              className="bg-error text-white font-medium px-4 py-2 rounded hover:bg-opacity-90 transition-colors"
            >
              Logout
            </button>
          </>
        ) : (
          <Link 
            to="/login" 
            className="bg-secondary text-white font-medium px-4 py-2 rounded hover:bg-opacity-90 transition-colors"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;