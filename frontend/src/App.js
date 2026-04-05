import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// FIX: Import directly from 'sonner' package
import { Toaster } from 'sonner'; 
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import PredictPage from './pages/PredictPage';
import ResultPage from './pages/ResultPage';
import HistoryPage from './pages/HistoryPage';
import Profile from './pages/profile'; 

// Components
import MedicalChatbot from './components/MedicalChatbot'; 

import '@/App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* TOASTER must be inside BrowserRouter if you use it in navigation hooks */}
        <Toaster position="top-right" richColors closeButton />

        {/* Global Chatbot */}
        <MedicalChatbot />

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/predict"
            element={
              <ProtectedRoute>
                <PredictPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/result"
            element={
              <ProtectedRoute>
                <ResultPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <HistoryPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;