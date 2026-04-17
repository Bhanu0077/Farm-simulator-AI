import { createContext, useContext, useEffect, useState } from "react";

import api from "../services/api";


const AuthContext = createContext(null);


export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("smart_farm_user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("smart_farm_token"));
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    setIsAuthReady(true);
  }, []);

  const persistAuth = (authToken, authUser) => {
    localStorage.setItem("smart_farm_token", authToken);
    localStorage.setItem("smart_farm_user", JSON.stringify(authUser));
    setToken(authToken);
    setUser(authUser);
  };

  const clearAuth = () => {
    localStorage.removeItem("smart_farm_token");
    localStorage.removeItem("smart_farm_user");
    setToken(null);
    setUser(null);
  };

  const register = async (payload) => {
    await api.post("/auth/register", payload);
    const response = await api.post("/auth/login", {
      email: payload.email,
      password: payload.password,
    });

    persistAuth(response.data.access_token, response.data.user);
    return response.data;
  };

  const login = async (payload) => {
    const response = await api.post("/auth/login", payload);
    persistAuth(response.data.access_token, response.data.user);
    return response.data;
  };

  const logout = () => {
    clearAuth();
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token),
    isAuthReady,
    register,
    login,
    logout,
    clearAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
