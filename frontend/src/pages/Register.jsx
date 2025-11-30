import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineUser,
  HiOutlineChevronDown,
} from 'react-icons/hi';
import { FaCar, FaShoppingCart, FaTags, FaArrowLeft } from 'react-icons/fa';
import useAuthStore from '../store/authStore';

const Register = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated, isLoading, error, clearError } = useAuthStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: '',
    company_name: '',
  });
  const [localError, setLocalError] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    clearError();
    // Reset local error without triggering setState in effect
    return () => {
      setLocalError('');
    };
  }, [clearError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear errors when user starts typing
    if (error || localError) {
      clearError();
      setLocalError('');
    }
  };

  const handleRoleSelect = (role) => {
    setFormData((prev) => ({
      ...prev,
      role: role,
    }));
    setDropdownOpen(false);
    // Clear errors when user selects role
    if (error || localError) {
      clearError();
      setLocalError('');
    }
  };

  const validateStep1 = () => {
    setLocalError('');
    if (!formData.name) {
      setLocalError('Please fill in all required fields for this step');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    setLocalError('');
    if (
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.company_name
    ) {
      setLocalError('Please fill in all fields for this step');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setLocalError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    // Final validation - only required fields
    if (!formData.name || !formData.email || !formData.password || !formData.role) {
      setLocalError('Please fill in all required fields');
      return;
    }

    const fullName = formData.name;

    // Build metadata object with only non-empty optional fields
    const metadata = {};
    if (formData.first_name) metadata.first_name = formData.first_name;
    if (formData.last_name) metadata.last_name = formData.last_name;
    if (formData.phone) metadata.phone = formData.phone;
    if (formData.company_name) metadata.company_name = formData.company_name;

    const result = await register(
      fullName,
      formData.email,
      formData.password,
      formData.role,
      metadata
    );
    if (result?.success) {
      navigate('/');
    } else {
      setLocalError(result?.error || 'Registration failed');
    }
  };

  const displayError = error || localError;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 mb-4 shadow-lg">
            <FaCar className="h-8 w-8 text-white" aria-hidden="true" />
          </div>
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-3">
            Car Market Hub
          </h1>
          <p className="text-gray-600 text-lg">Create your account</p>
        </div>

        {/* Step Indicator - Outside Form */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4 mb-6 max-w-xs mx-auto">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                    currentStep >= step
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div
                    className={`h-1 w-8 mx-2 rounded-full transition-all duration-300 ${
                      currentStep > step
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600'
                        : 'bg-gray-200'
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900">
              {currentStep === 1 && 'Personal Information'}
              {currentStep === 2 && 'Account Credentials'}
              {currentStep === 3 && 'Select Your Role'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {currentStep === 1 && 'Step 1 of 3: Tell us about yourself'}
              {currentStep === 2 && 'Step 2 of 3: Create your credentials'}
              {currentStep === 3 && 'Step 3 of 3: Choose your account type'}
            </p>
          </div>
        </div>

        {/* Register Card */}
        <div className="glass-effect rounded-3xl p-8">
          <form
            onSubmit={currentStep === 3 ? handleSubmit : (e) => e.preventDefault()}
            className="space-y-6"
          >
            {/* STEP 1: Personal Information */}
            {currentStep === 1 && (
              <div className="animate-fadeIn space-y-4">
                {/* Name Field */}
                <div className="space-y-2 animate-slideUp" style={{ animationDelay: '0.05s' }}>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
                    Full Name
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-600">
                      <HiOutlineUser
                        className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600"
                        aria-hidden="true"
                      />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white outline-none transition-all duration-300 placeholder:text-gray-400 hover:border-gray-300"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                {/* First Name Field */}
                <div className="space-y-2 animate-slideUp" style={{ animationDelay: '0.15s' }}>
                  <label htmlFor="first_name" className="block text-sm font-semibold text-gray-700">
                    First Name <span className="text-gray-400 font-normal text-xs">(Optional)</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-600">
                      <HiOutlineUser
                        className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600"
                        aria-hidden="true"
                      />
                    </div>
                    <input
                      id="first_name"
                      name="first_name"
                      type="text"
                      autoComplete="given-name"
                      value={formData.first_name}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white outline-none transition-all duration-300 placeholder:text-gray-400 hover:border-gray-300"
                      placeholder="John"
                    />
                  </div>
                </div>

                {/* Last Name Field */}
                <div className="space-y-2 animate-slideUp" style={{ animationDelay: '0.25s' }}>
                  <label htmlFor="last_name" className="block text-sm font-semibold text-gray-700">
                    Last Name <span className="text-gray-400 font-normal text-xs">(Optional)</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-600">
                      <HiOutlineUser
                        className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600"
                        aria-hidden="true"
                      />
                    </div>
                    <input
                      id="last_name"
                      name="last_name"
                      type="text"
                      autoComplete="family-name"
                      value={formData.last_name}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white outline-none transition-all duration-300 placeholder:text-gray-400 hover:border-gray-300"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                {/* Phone Field */}
                <div className="space-y-2 animate-slideUp" style={{ animationDelay: '0.35s' }}>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-700">
                    Phone Number{' '}
                    <span className="text-gray-400 font-normal text-xs">(Optional)</span>
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white outline-none transition-all duration-300 placeholder:text-gray-400 hover:border-gray-300"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>
            )}

            {/* STEP 2: Account Credentials */}
            {currentStep === 2 && (
              <div className="animate-fadeIn space-y-4">
                {/* Email Field */}
                <div className="space-y-2 animate-slideUp" style={{ animationDelay: '0.1s' }}>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-600">
                      <HiOutlineMail
                        className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600"
                        aria-hidden="true"
                      />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white outline-none transition-all duration-300 placeholder:text-gray-400 hover:border-gray-300"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2 animate-slideUp" style={{ animationDelay: '0.2s' }}>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                    Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-600">
                      <HiOutlineLockClosed
                        className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600"
                        aria-hidden="true"
                      />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white outline-none transition-all duration-300 placeholder:text-gray-400 hover:border-gray-300"
                      placeholder="••••••••"
                    />
                  </div>
                  <p className="text-xs text-gray-500">At least 6 characters</p>
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2 animate-slideUp" style={{ animationDelay: '0.3s' }}>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Confirm Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-600">
                      <HiOutlineLockClosed
                        className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600"
                        aria-hidden="true"
                      />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white outline-none transition-all duration-300 placeholder:text-gray-400 hover:border-gray-300"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {/* Company Name Field */}
                <div className="space-y-2 animate-slideUp" style={{ animationDelay: '0.4s' }}>
                  <label
                    htmlFor="company_name"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Company Name
                  </label>
                  <input
                    id="company_name"
                    name="company_name"
                    type="text"
                    autoComplete="organization"
                    value={formData.company_name}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white outline-none transition-all duration-300 placeholder:text-gray-400 hover:border-gray-300"
                    placeholder="Your Company"
                  />
                </div>
              </div>
            )}

            {/* STEP 3: Role Selection */}
            {currentStep === 3 && (
              <div className="animate-fadeIn space-y-3">
                <label className="block text-sm font-semibold text-gray-700">Account Type</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-full pl-4 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white outline-none transition-all duration-300 hover:border-gray-300 flex items-center justify-between text-left font-medium text-gray-700"
                  >
                    <span className="flex items-center gap-2">
                      {formData.role === 'buyer' ? (
                        <>
                          <FaShoppingCart className="h-4 w-4 text-blue-600" />
                          <span>Buy cars (Buyer)</span>
                        </>
                      ) : formData.role === 'seller' ? (
                        <>
                          <FaTags className="h-4 w-4 text-orange-600" />
                          <span>Sell cars (Seller)</span>
                        </>
                      ) : (
                        <span className="text-gray-400">Select your account type</span>
                      )}
                    </span>
                    <HiOutlineChevronDown
                      className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`}
                      aria-hidden="true"
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                      {/* Buyer Option */}
                      <button
                        type="button"
                        onClick={() => handleRoleSelect('buyer')}
                        className={`w-full px-4 py-4 text-left transition-all duration-200 flex items-start gap-3 border-b border-gray-100 hover:bg-blue-50 ${
                          formData.role === 'buyer' ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex-shrink-0 mt-1">
                          <FaShoppingCart
                            className={`h-5 w-5 ${formData.role === 'buyer' ? 'text-blue-600' : 'text-gray-400'}`}
                          />
                        </div>
                        <div className="flex-1">
                          <p
                            className={`font-semibold ${formData.role === 'buyer' ? 'text-blue-900' : 'text-gray-900'}`}
                          >
                            Buy cars (Buyer)
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Browse and purchase vehicles from our marketplace
                          </p>
                        </div>
                        {formData.role === 'buyer' && (
                          <div className="flex-shrink-0 mt-1">
                            <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                          </div>
                        )}
                      </button>

                      {/* Seller Option */}
                      <button
                        type="button"
                        onClick={() => handleRoleSelect('seller')}
                        className={`w-full px-4 py-4 text-left transition-all duration-200 flex items-start gap-3 hover:bg-orange-50 ${
                          formData.role === 'seller' ? 'bg-orange-50' : ''
                        }`}
                      >
                        <div className="flex-shrink-0 mt-1">
                          <FaTags
                            className={`h-5 w-5 ${formData.role === 'seller' ? 'text-orange-600' : 'text-gray-400'}`}
                          />
                        </div>
                        <div className="flex-1">
                          <p
                            className={`font-semibold ${formData.role === 'seller' ? 'text-orange-900' : 'text-gray-900'}`}
                          >
                            Sell cars (Seller)
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            List your vehicles and connect with potential buyers
                          </p>
                        </div>
                        {formData.role === 'seller' && (
                          <div className="flex-shrink-0 mt-1">
                            <div className="h-2 w-2 bg-orange-600 rounded-full"></div>
                          </div>
                        )}
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {formData.role === 'buyer'
                    ? 'You will be able to browse and purchase cars'
                    : 'You will be able to list and manage your inventory'}
                </p>
              </div>
            )}

            {/* Error Message */}
            {displayError && (
              <div className="bg-red-50/80 border border-red-200/50 text-red-700 px-4 py-3 rounded-xl text-sm font-medium backdrop-blur-sm">
                {displayError}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="flex items-center justify-center gap-2 px-6 py-3.5 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-300 hover:border-gray-300 hover:bg-gray-50"
                >
                  <FaArrowLeft className="h-4 w-4" />
                  Back
                </button>
              )}
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className={`flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-smooth flex items-center justify-center shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] btn-focus ${
                    currentStep === 1 ? 'ml-auto' : ''
                  }`}
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-smooth disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] btn-focus"
                >
                  {isLoading ? (
                    <>
                      <AiOutlineLoading3Quarters
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        aria-hidden="true"
                      />
                      <span>Creating account...</span>
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>
              )}
            </div>
          </form>

          {/* Login Link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <a
                href="/login"
                className="font-semibold text-blue-600 hover:text-blue-700 transition-colors hover:underline underline-offset-2"
              >
                Sign in
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-gray-500">
          © 2025 Car Market Hub. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Register;
