import React, { createContext, useContext, useEffect, useState } from "react";
import * as authApi from "../api/auth";

interface User {
    id: number;
    username: string;
    email?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (u: string, p: string) => Promise<void>;
    googleLogin: (token: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        authApi.getMe()
            .then(res => setUser(res.data))
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, []);

    const login = async (username: string, password: string) => {
        await authApi.getCSRF();
        const res = await authApi.login(username, password);
        setUser(res.data.user);
    };

    const googleLogin = async (token: string) => {
        try {
          const res = await authApi.googleLogin(token);
          
          // Store the JWT token
          localStorage.setItem('authToken', res.data.access_token);
          if (res.data.refresh_token) {
            localStorage.setItem('refreshToken', res.data.refresh_token);
          }
          
          // Set the user in context
          setUser(res.data.user);
        } catch (error) {
          console.error('Google login failed:', error);
          throw error;
        }
      };

    const logout = async () => {
        await authApi.logout();
        // Clear tokens
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, googleLogin, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
};
