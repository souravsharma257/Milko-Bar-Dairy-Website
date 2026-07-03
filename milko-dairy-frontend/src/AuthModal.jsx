import React, { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { authAPI } from './services/api';

const AuthModal = ({ showAuth, authMode, onClose }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState(authMode);
  const [loading, setLoading] = useState(false);
  
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  useEffect(() => {
    if (showAuth) {
      setTimeout(() => {
        emailInputRef.current?.focus();
      }, 100);
    }
  }, [showAuth]);

  useEffect(() => {
    setMode(authMode);
  }, [authMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      let userData;
  
      if (mode === 'login') {
        userData = await authAPI.login({
          email: formData.email,
          password: formData.password
        });
      } else {
        userData = await authAPI.register({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          password: formData.password
        });
      }

      // fullName properly set karo
      const fullName = userData.fullName || 
                       `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 
                       'User';

      const userToStore = {
        ...userData,
        fullName
      };

      // Save to localStorage
      localStorage.setItem('token', userData.token);
      localStorage.setItem('user', JSON.stringify(userToStore));

      alert(mode === 'login' ? 'Login successful! ✅' : 'Registration successful! ✅');
      handleClose();
      
      // Page reload karo to refresh user state
      setTimeout(() => window.location.reload(), 500);

    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Something went wrong';
      alert('❌ ' + errorMsg);
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      password: ''
    });
    setShowPassword(false);
  };

  const handleClose = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      password: ''
    });
    setShowPassword(false);
    onClose();
  };

  if (!showAuth) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 rounded-xl max-w-md w-full mx-4 relative">
        <button 
          onClick={handleClose}
          type="button"
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold leading-none"
        >
          ×
        </button>

        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          {mode === 'login' ? 'Login' : 'Register'}
        </h2>

        <form onSubmit={handleSubmit} autoComplete="on">
          {mode === 'register' && (
            <>
              <input 
                type="text"
                name="firstName"
                placeholder="First Name" 
                value={formData.firstName}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required 
                autoComplete="given-name"
              />
              <input 
                type="text"
                name="lastName"
                placeholder="Last Name" 
                value={formData.lastName}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required 
                autoComplete="family-name"
              />
              <input 
                type="tel"
                name="phone"
                placeholder="Phone Number" 
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required 
                autoComplete="tel"
              />
              <input 
                type="text"
                name="address"
                placeholder="Address" 
                value={formData.address}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required 
                autoComplete="street-address"
              />
            </>
          )}

          <input 
            ref={emailInputRef}
            type="email"
            name="email"
            placeholder="Email Address" 
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required 
            autoComplete="email"
          />

          <div className="relative mb-4">
            <input 
              ref={passwordInputRef}
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password" 
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required 
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : (mode === 'login' ? 'Login' : 'Register')}
          </button>

          <button 
            type="button"
            onClick={toggleMode}
            className="w-full mt-3 text-blue-600 hover:text-blue-800 transition font-medium"
          >
            {mode === 'login' ? "Don't have an account? Register" : 'Already have an account? Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;