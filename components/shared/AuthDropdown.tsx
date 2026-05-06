import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button, Input } from './UI';
import { EyeIcon, EyeOffIcon, GoogleIcon } from '../Icons';

interface AuthDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
}

export const AuthDropdown: React.FC<AuthDropdownProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [tab, setTab] = useState<'signin' | 'register'>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Form states
  const [signinLoginStr, setSigninLoginStr] = useState('');
  const [signinPassword, setSigninPassword] = useState('');
  const [signinError, setSigninError] = useState('');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const [regErrors, setRegErrors] = useState<{
    email?: string;
    phone?: string;
    password?: string;
    confirm?: string;
  }>({});

  const validateSignin = (e: React.FormEvent) => {
    e.preventDefault();
    setSigninError('');
    if (!signinLoginStr || !signinPassword) {
      setSigninError('Please correctly fill out all fields.');
      return;
    }
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signinLoginStr);
    const isPhone = /^\+?[\d\s-]{8,}$/.test(signinLoginStr);
    if (!isEmail && !isPhone) {
      setSigninError('Please enter a valid email or phone number.');
      return;
    }
    onLoginSuccess?.();
    onClose();
  };

  const validateRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: any = {};
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail)) {
      errors.email = 'Invalid email address.';
    }
    
    if (!/^\+?[\d\s-]{8,}$/.test(regPhone)) {
      errors.phone = 'Invalid phone number format.';
    }

    if (regPassword.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
    }

    if (regPassword !== regConfirmPassword) {
      errors.confirm = 'Passwords do not match.';
    }

    if (Object.keys(errors).length > 0) {
      setRegErrors(errors);
      return;
    }
    
    setRegErrors({});
    onLoginSuccess?.();
    onClose();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when closed
      setTimeout(() => setTab('signin'), 300);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="fixed left-2 right-2 top-20 md:absolute md:top-full md:right-0 md:left-auto mt-2 md:w-[700px] bg-white shadow-2xl rounded-lg overflow-y-auto max-h-[85vh] border border-gray-100 z-50 origin-top"
        >
          <div className="flex flex-col md:flex-row">
            {/* Left Panel - Informational */}
            <div className="w-full md:w-5/12 bg-gray-50 p-6 md:p-8 flex flex-col justify-center border-b md:border-b-0 md:border-r border-gray-100">
              <h3 className="text-xl font-bold text-primary mb-3">
                New to XTASS? Create an account
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Join our platform to book airport transfers, private cars, and manage your trips all in one place.
              </p>
              <ul className="text-sm text-gray-600 space-y-2 mb-6">
                <li className="flex items-center">
                  <span className="text-accent mr-2">✓</span> Faster bookings
                </li>
                <li className="flex items-center">
                  <span className="text-accent mr-2">✓</span> Track your rides
                </li>
                <li className="flex items-center">
                  <span className="text-accent mr-2">✓</span> Exclusive offers
                </li>
              </ul>
              {tab === 'signin' ? (
                <div className="mt-auto">
                  <p className="text-sm font-medium mb-2 text-gray-800">Need to complete your enrollment?</p>
                  <button onClick={() => setTab('register')} className="text-primary font-bold hover:underline text-sm">
                    Create Account &gt;
                  </button>
                </div>
              ) : (
                <div className="mt-auto">
                  <p className="text-sm font-medium mb-2 text-gray-800">Already a member?</p>
                  <button onClick={() => setTab('signin')} className="text-primary font-bold hover:underline text-sm">
                    Sign In &gt;
                  </button>
                </div>
              )}
            </div>

            {/* Right Panel - Forms */}
            <div className="w-full md:w-7/12 p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold font-display text-gray-900">
                  {tab === 'signin' ? 'Sign In to XTASS' : 'Register an Account'}
                </h2>
                
                {/* Mobile Tab Switcher visible only on mobile/tablet */}
                <div className="md:hidden flex text-sm">
                  <button onClick={() => setTab('signin')} className={`px-2 py-1 ${tab === 'signin' ? 'font-bold text-primary border-b-2 border-primary' : 'text-gray-500'}`}>Sign In</button>
                  <button onClick={() => setTab('register')} className={`px-2 py-1 ml-2 ${tab === 'register' ? 'font-bold text-primary border-b-2 border-primary' : 'text-gray-500'}`}>Register</button>
                </div>
              </div>

              {tab === 'signin' && (
                <form className="space-y-4" onSubmit={validateSignin}>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Email or Phone Number</label>
                    <input 
                      type="text" 
                      value={signinLoginStr}
                      onChange={(e) => setSigninLoginStr(e.target.value)}
                      className={`w-full border ${signinError ? 'border-red-500' : 'border-gray-300'} px-3 py-2 rounded focus:outline-none focus:border-primary`}
                      placeholder="Email or Phone"
                      required
                    />
                  </div>
                  <div className="relative">
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm text-gray-700">Password</label>
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-xs text-primary font-bold flex items-center hover:underline"
                      >
                        {showPassword ? 'Hide' : 'Show'} 
                        {showPassword ? <EyeOffIcon className="w-4 h-4 ml-1"/> : <EyeIcon className="w-4 h-4 ml-1"/>}
                      </button>
                    </div>
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      value={signinPassword}
                      onChange={(e) => setSigninPassword(e.target.value)}
                      className={`w-full border ${signinError ? 'border-red-500' : 'border-gray-300'} px-3 py-2 rounded focus:outline-none focus:border-primary pr-10`}
                      placeholder="Password"
                      required
                    />
                  </div>
                  
                  {signinError && <p className="text-red-500 text-xs mt-1">{signinError}</p>}

                  <div className="flex items-center mt-4">
                    <input type="checkbox" id="keepSignedIn" className="mr-2 text-primary focus:ring-primary h-4 w-4 rounded border-gray-300" />
                    <label htmlFor="keepSignedIn" className="text-sm text-gray-600">Keep me signed in</label>
                  </div>

                  <div className="pt-4">
                    <button type="submit" className="w-full font-bold py-3 px-4 rounded shadow-sm focus:outline-none transition-all duration-200 ease-in-out min-h-[48px] flex items-center justify-center bg-[#FFD700] hover:bg-[#F2CC00] text-[#341f26]">Sign In</button>
                    <button type="button" onClick={() => { onLoginSuccess?.(); onClose(); }} className="mt-3 w-full font-bold py-3 px-4 border border-gray-300 rounded shadow-sm focus:outline-none transition-all duration-200 ease-in-out min-h-[48px] flex items-center justify-center bg-white hover:bg-gray-50 text-gray-700">
                      <GoogleIcon className="w-5 h-5 mr-2" />
                      Continue with Google
                    </button>
                  </div>
                  
                  <div className="text-center mt-4">
                    <button type="button" className="text-sm font-bold text-primary hover:underline">
                      Forgot Password? &gt;
                    </button>
                  </div>
                </form>
              )}

              {tab === 'register' && (
                <form className="space-y-4" onSubmit={validateRegister}>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-primary"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Email</label>
                    <input 
                      type="email" 
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className={`w-full border ${regErrors.email ? 'border-red-500' : 'border-gray-300'} px-3 py-2 rounded focus:outline-none focus:border-primary`}
                      placeholder="john@example.com"
                      required
                    />
                    {regErrors.email && <p className="text-red-500 text-xs mt-1">{regErrors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Phone Number</label>
                    <input 
                      type="tel" 
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className={`w-full border ${regErrors.phone ? 'border-red-500' : 'border-gray-300'} px-3 py-2 rounded focus:outline-none focus:border-primary`}
                      placeholder="024 123 4567"
                      required
                    />
                    {regErrors.phone && <p className="text-red-500 text-xs mt-1">{regErrors.phone}</p>}
                  </div>
                  <div className="relative">
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm text-gray-700">Password</label>
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-xs text-primary font-bold flex items-center hover:underline"
                      >
                        {showPassword ? 'Hide' : 'Show'} 
                        {showPassword ? <EyeOffIcon className="w-4 h-4 ml-1"/> : <EyeIcon className="w-4 h-4 ml-1"/>}
                      </button>
                    </div>
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className={`w-full border ${regErrors.password ? 'border-red-500' : 'border-gray-300'} px-3 py-2 rounded focus:outline-none focus:border-primary`}
                      placeholder="Password"
                      required
                    />
                    {regErrors.password && <p className="text-red-500 text-xs mt-1">{regErrors.password}</p>}
                  </div>
                  <div className="relative">
                    <label className="block text-sm text-gray-700 mb-1">Confirm Password</label>
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      className={`w-full border ${regErrors.confirm ? 'border-red-500' : 'border-gray-300'} px-3 py-2 rounded focus:outline-none focus:border-primary`}
                      placeholder="Confirm Password"
                      required
                    />
                    {regErrors.confirm && <p className="text-red-500 text-xs mt-1">{regErrors.confirm}</p>}
                  </div>

                  <div className="pt-4">
                    <button type="submit" className="w-full font-bold py-3 px-4 rounded shadow-sm focus:outline-none transition-all duration-200 ease-in-out min-h-[48px] flex items-center justify-center bg-[#FFD700] hover:bg-[#F2CC00] text-[#341f26]">Create Account</button>
                    <button type="button" onClick={() => { onLoginSuccess?.(); onClose(); }} className="mt-3 w-full font-bold py-3 px-4 border border-gray-300 rounded shadow-sm focus:outline-none transition-all duration-200 ease-in-out min-h-[48px] flex items-center justify-center bg-white hover:bg-gray-50 text-gray-700">
                      <GoogleIcon className="w-5 h-5 mr-2" />
                      Continue with Google
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
