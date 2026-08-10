"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { UserContext, getMe } from "../api";
import { httpClient } from "@/lib/http-client";

interface AuthState {
  user: UserContext | null;
  isLoading: boolean;
  login: (token: string, userData: UserContext) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState>({
  user: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem("marg_access_token");
        const cachedUser = localStorage.getItem("marg_user_context");
        
        if (token) {
          httpClient.setHeader("Authorization", `Bearer ${token}`);
          
          if (navigator.onLine) {
            try {
              const userData = await getMe();
              setUser(userData);
              localStorage.setItem("marg_user_context", JSON.stringify(userData));
            } catch (err) {
              console.warn("Auth token might be invalid or network is down, using cached user if available");
              if (cachedUser) {
                setUser(JSON.parse(cachedUser));
              }
            }
          } else if (cachedUser) {
            console.log("Offline mode: using cached user identity");
            setUser(JSON.parse(cachedUser));
          }
        }
      } catch (e) {
        console.error("Auth init error:", e);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = (token: string, userData: UserContext) => {
    localStorage.setItem("marg_access_token", token);
    localStorage.setItem("marg_user_context", JSON.stringify(userData));
    httpClient.setHeader("Authorization", `Bearer ${token}`);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("marg_access_token");
    localStorage.removeItem("marg_user_context");
    httpClient.removeHeader("Authorization");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
