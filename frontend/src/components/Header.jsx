import { useNavigate } from 'react-router-dom';
import { FaCar, FaCog, FaUsers } from 'react-icons/fa';
import { HiOutlineLogout, HiArrowLeft, HiOutlineChevronDown } from 'react-icons/hi';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { MdWifiOff } from 'react-icons/md';
import { useState, useRef, useEffect } from 'react';
import useAuthStore from '../store/authStore';

const Header = ({ title, showBackButton = false }) => {
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleNavigateHome = () => {
    navigate('/');
  };

  const handleNavigateCars = () => {
    navigate('/cars');
  };

  const handleNavigateAdminUsers = () => {
    navigate('/admin/users');
  };

  const handleNavigateProfile = () => {
    navigate('/profile');
    setDropdownOpen(false);
  };

  // Real-time clock update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Network status listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  // Format time with AM/PM
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  return (
    <header className="sticky top-0 z-50 glass-effect border-b border-gray-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20 transition-smooth">
          {/* Left Side - Logo and Title */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {showBackButton && (
              <button
                onClick={handleGoBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 text-gray-700 hover:text-gray-900"
                aria-label="Go back"
                title="Go back"
              >
                <HiArrowLeft className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={handleNavigateHome}
              className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity duration-200 group"
              aria-label="Home"
            >
              <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-blue-600 shadow-md group-hover:shadow-lg group-hover:bg-blue-700 transition-all duration-200 flex-shrink-0">
                <FaCar className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 hidden sm:block tracking-tight">
                {title || 'Car Market Hub'}
              </h1>
            </button>
          </div>

          {/* Center - Real-Time Clock */}
          <div className="hidden lg:flex items-center">
            <span className="text-base font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 font-mono tracking-wide">
              {formatTime(currentTime)}
            </span>
          </div>

          {/* Right Side - Navigation and User Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Network Status Indicator */}
            {!isOnline && (
              <div className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg animate-pulse">
                <MdWifiOff className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Offline</span>
              </div>
            )}

            {user ? (
              <>
                {(user?.permissions?.some?.((p) => p.name === 'cars.create') ||
                  user?.roles?.some?.((r) => r.name === 'seller') ||
                  user?.roles?.some?.((r) => r.name === 'admin')) && (
                  <button
                    onClick={handleNavigateCars}
                    className="hidden sm:inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all duration-200 hover:shadow-md active:scale-95"
                    title="Manage your cars"
                  >
                    <FaCog className="w-4 h-4" />
                    <span>Manage Cars</span>
                  </button>
                )}

                {user?.roles?.some?.((r) => r.name === 'admin') && (
                  <button
                    onClick={handleNavigateAdminUsers}
                    className="hidden sm:inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-semibold text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-all duration-200 hover:shadow-md active:scale-95"
                    title="Manage users"
                  >
                    <FaUsers className="w-4 h-4" />
                    <span>Manage Users</span>
                  </button>
                )}

                {/* User Dropdown Menu */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200 hover:shadow-md active:scale-95 group"
                    aria-label="User menu"
                    aria-expanded={dropdownOpen}
                    aria-haspopup="true"
                  >
                    {user.profile_image_url ? (
                      <img
                        src={user.profile_image_url}
                        alt={user.name}
                        className="w-7 h-7 sm:w-6 sm:h-6 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-7 h-7 sm:w-6 sm:h-6 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-xs sm:text-sm flex-shrink-0 group-hover:bg-blue-700 transition-colors">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="font-medium hidden md:block text-gray-900">{user.name}</span>
                    <HiOutlineChevronDown
                      className={`w-4 h-4 text-gray-600 transition-transform duration-300 hidden sm:block ${dropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden z-50 animate-slideDown">
                      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                        <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-600 truncate mt-0.5">{user.email}</p>
                      </div>
                      <nav className="py-1">
                        <button
                          onClick={handleNavigateProfile}
                          className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3 font-medium"
                        >
                          {user.profile_image_url ? (
                            <img
                              src={user.profile_image_url}
                              alt={user.name}
                              className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span>My Profile</span>
                        </button>
                        <div className="border-t border-gray-100 my-1"></div>
                        <button
                          onClick={handleLogout}
                          disabled={isLoading}
                          className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading ? (
                            <AiOutlineLoading3Quarters className="animate-spin w-4 h-4" />
                          ) : (
                            <HiOutlineLogout className="w-4 h-4" />
                          )}
                          <span>{isLoading ? 'Logging out...' : 'Logout'}</span>
                        </button>
                      </nav>
                    </div>
                  )}
                </div>

                {/* Logout button for mobile */}
                <button
                  onClick={handleLogout}
                  disabled={isLoading}
                  className="sm:hidden p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center hover:shadow-md"
                  aria-label="Logout"
                  title="Logout"
                >
                  {isLoading ? (
                    <AiOutlineLoading3Quarters className="animate-spin w-5 h-5" />
                  ) : (
                    <HiOutlineLogout className="w-5 h-5" />
                  )}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200 hover:shadow-md active:scale-95"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm font-semibold text-white bg-gray-700 hover:bg-gray-800 rounded-lg transition-all duration-200 hover:shadow-md active:scale-95"
                >
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
