import React from 'react';
import type { Screen, NavigationProps } from '../../types';
import { HomeIcon, HistoryIcon, UserIcon, PhoneIcon, ChevronLeftIcon, XCircleIcon } from '../Icons';

// Reusable Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent';
  children: React.ReactNode;
}
export const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, className, ...props }) => {
  const baseClasses = 'w-full font-bold py-3 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ease-in-out';
  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary-hover active:bg-primary-active focus:ring-primary',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400',
    accent: 'bg-accent text-primary font-bold hover:bg-yellow-400 focus:ring-accent',
  };
  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

// Reusable Input Component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  label: string;
}
export const Input: React.FC<InputProps> = ({ icon, label, id, ...props }) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        {icon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">{icon}</div>}
        <input
          id={id}
          className={`block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm ${icon ? 'pl-10' : ''}`}
          {...props}
        />
      </div>
    </div>
  );
};

// App Header
interface HeaderProps {
    title: string;
    onBack?: () => void;
}
export const Header: React.FC<HeaderProps> = ({ title, onBack }) => {
    return (
        <header className="bg-white shadow-md sticky top-0 z-10">
            <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
                {onBack ? (
                    <button onClick={onBack} className="text-primary p-2 -ml-2">
                        <ChevronLeftIcon className="w-6 h-6" />
                    </button>
                ) : <div className="w-8"></div> }
                <h1 className="text-xl font-display font-bold text-primary text-center">{title}</h1>
                <div className="w-8">
                </div>
            </div>
        </header>
    );
};

// Customer Bottom Navigation
interface BottomNavProps extends NavigationProps {
  activeScreen: Screen;
}

export const BottomNav: React.FC<BottomNavProps> = ({ navigate, activeScreen }) => {
  const navItems = [
    { screen: 'ServiceSelection', icon: HomeIcon, label: 'Home' },
    { screen: 'TripHistory', icon: HistoryIcon, label: 'History' },
    { screen: 'AccountProfile', icon: UserIcon, label: 'Profile' },
  ];
  const isActive = (screen: Screen) => activeScreen.startsWith(screen);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] z-10 max-w-md mx-auto">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.screen as Screen)}
            className={`flex flex-col items-center justify-center space-y-1 w-full h-full text-sm font-medium transition-colors ${
              isActive(item.screen as Screen) ? 'text-primary' : 'text-gray-500 hover:text-primary'
            }`}
          >
            <item.icon className="w-6 h-6" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// Floating Action Buttons
export const FloatingActionButtons: React.FC = () => {
    return (
        <div className="fixed bottom-20 right-4 space-y-3 z-20">
             <a href="https://wa.me/233000000000" target="_blank" rel="noopener noreferrer" className="bg-green-500 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 4.315 1.731 6.086l-.219.324-1.123 4.144 4.224-1.105.327-.224z"/></svg>
            </a>
            <a href="tel:911" className="bg-red-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-red-700">
                <PhoneIcon className="w-7 h-7" />
            </a>
        </div>
    );
};

// Container for screens
export const ScreenContainer: React.FC<{children: React.ReactNode}> = ({ children }) => {
    return <div className="max-w-md mx-auto bg-white min-h-screen pb-24">{children}</div>;
};

// Toast Notification
interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}
export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const baseClasses = 'fixed top-5 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg text-white font-semibold z-50 animate-fade-in-down';
  const typeClasses = {
    success: 'bg-green-500',
    error: 'bg-red-500',
  };

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`}>
      {message}
    </div>
  );
};

// Reusable Modal Component
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}
export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold font-display text-primary">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {children}
        </div>
        <div className="p-4 bg-gray-50 border-t text-right">
            <Button variant="secondary" onClick={onClose} className="w-auto px-6">Close</Button>
        </div>
      </div>
    </div>
  );
};