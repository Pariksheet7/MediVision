import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";

const AuthContext = createContext(null);

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000'
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }, []);

  // --- NEW: Function to sync profile changes without re-logging in ---
  const updateUser = useCallback((updatedData) => {
    setUser(prev => {
      const newUser = { ...prev, ...updatedData };
      localStorage.setItem("user", JSON.stringify(newUser));
      return newUser;
    });
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch (e) {
        console.error("Failed to parse user data", e);
        logout(); 
      }
    }
    setLoading(false);
  }, [logout]);

  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use((config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    return () => api.interceptors.request.eject(requestInterceptor);
  }, [token]);

  const handleAuth = useCallback((accessToken, userData) => {
    setToken(accessToken);
    setUser(userData);
    localStorage.setItem("token", accessToken);
    localStorage.setItem("user", JSON.stringify(userData));
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const res = await api.post("/api/auth/login", { email, password });
      handleAuth(res.data.access_token, res.data.user);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.detail || "Login failed",
      };
    }
  }, [handleAuth]);

  const register = useCallback(async (email, password, full_name) => {
    try {
      const res = await api.post("/api/auth/register", { email, password, full_name });
      handleAuth(res.data.access_token, res.data.user);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.detail || "Registration failed",
      };
    }
  }, [handleAuth]);

  const value = useMemo(() => ({
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser, // Exported to be used in Profile.js
    api
  }), [user, token, loading, login, register, logout, updateUser]);

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : (
        <div className="flex h-screen w-screen items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};