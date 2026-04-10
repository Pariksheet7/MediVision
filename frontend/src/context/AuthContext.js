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

  // 🔥 LOGOUT
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }, []);

  // 🔥 CLEAR HISTORY
  const clearHistory = useCallback(async () => {
    try {
      await api.delete("/api/clear-history");
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || "Failed to clear history",
      };
    }
  }, []);

  // 🔥 UPDATE USER
  const updateUser = useCallback((updatedData) => {
    setUser(prev => {
      if (!prev) return updatedData;
      const newUser = { ...prev, ...updatedData };
      localStorage.setItem("user", JSON.stringify(newUser));
      return newUser;
    });
  }, []);

  // 🔥 LOAD FROM LOCAL STORAGE
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken && storedUser !== "undefined") {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch (e) {
        console.error("User parse error:", e);
        logout();
      }
    }

    setLoading(false);
  }, [logout]);

  // 🔥 AUTO TOKEN HEADER
  useEffect(() => {
    const interceptor = api.interceptors.request.use((config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    return () => api.interceptors.request.eject(interceptor);
  }, [token]);

  // 🔥 HANDLE AUTH
  const handleAuth = useCallback((accessToken, userData) => {
    const normalizedUser = {
      ...userData,
      name: userData.name || userData.full_name || "User"
    };

    setToken(accessToken);
    setUser(normalizedUser);

    localStorage.setItem("token", accessToken);
    localStorage.setItem("user", JSON.stringify(normalizedUser));
  }, []);

  // 🔥 LOGIN
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

  // 🔥 REGISTER
  const register = useCallback(async (email, password, full_name) => {
    try {
      const res = await api.post("/api/auth/register", {
        email,
        password,
        full_name
      });

      handleAuth(res.data.access_token, res.data.user);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.detail || "Registration failed",
      };
    }
  }, [handleAuth]);

  // 🔥 FINAL VALUE (IMPORTANT)
  const value = useMemo(() => ({
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    clearHistory,
    api
  }), [user, token, loading, login, register, logout, updateUser, clearHistory]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};