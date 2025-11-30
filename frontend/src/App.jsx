import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import Login from './pages/Login';
import Register from './pages/Register';
import Debug from './pages/Debug';
import Home from './pages/Home';
import Profile from './pages/Profile';
import CarList from './pages/CarList';
import AdminUsers from './pages/AdminUsers';
import useAuthStore from './store/authStore';

function App() {
  const { checkAuth, isAuthenticated } = useAuthStore();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    checkAuth().finally(() => setAuthChecked(true));
  }, [checkAuth]);

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-xl flex items-center justify-center mb-4">
              <span className="text-3xl">🚗</span>
            </div>
          </div>
          <AiOutlineLoading3Quarters className="animate-spin h-8 w-8 text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/" replace /> : <Register />}
        />
        <Route path="/" element={<Home />} />
        <Route
          path="/profile"
          element={isAuthenticated ? <Profile /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/cars"
          element={
            isAuthenticated ? (
              useAuthStore.getState().user?.permissions?.includes('cars.create') ||
              useAuthStore.getState().user?.permissions?.includes('cars.update') ||
              useAuthStore.getState().user?.permissions?.includes('cars.delete') ? (
                <CarList />
              ) : (
                <Navigate to="/" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/admin/users"
          element={
            isAuthenticated ? (
              useAuthStore.getState().user?.roles?.some((r) => r.name === 'admin') ? (
                <AdminUsers />
              ) : (
                <Navigate to="/" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/debug"
          element={isAuthenticated ? <Debug /> : <Navigate to="/login" replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
