import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserType } from '../../types';
import ThemeToggle from './ThemeToggle';
import AnimatedLogo from './AnimatedLogo';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  const getTitle = () => {
    if (!user) return "NotifyEdu";
    switch (user.type) {
      case UserType.School:
        return "School Portal";
      case UserType.Student:
        return "Student Portal";
      case UserType.SuperAdmin:
        return "Super Admin Portal";
      case UserType.Guard:
        return "Guard Portal";
      case UserType.Bus:
        return "Bus Portal";
      case UserType.AcademicWork:
        return "Academic Work Portal";
      default:
        return "NotifyEdu";
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2 logo-container">
             <AnimatedLogo />
            <h1 className="text-xl font-bold text-neutral dark:text-gray-200">
              {getTitle()}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300 hidden sm:block">Welcome, {user?.name}</span>
            <ThemeToggle />
            <button
              onClick={logout}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-focus transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;