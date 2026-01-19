"use client";

import { createContext, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User, LoginRequest, SignupRequest } from "@/lib/types/auth";
import { api } from "@/lib/api/client";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  signup: (data: SignupRequest) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "auth_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Fetch current user info
  const fetchUser = useCallback(async () => {
    if (!token) return;
    try {
      // We already have the token in state/api client (assuming client handles it? No, client gets from localStorage)
      // actually client.ts reads from localStorage.
      const data = await api.auth.me();
      setUser(data);
    } catch (error) {
      console.error("Failed to fetch user:", error);
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
    }
  }, [token]);

  // Initialize auth state
  useEffect(() => {
    if (token) {
      fetchUser().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [token, fetchUser]);

  const login = useCallback(
    async (credentials: LoginRequest) => {
      try {
        const data = await api.auth.signin(credentials);

        // Store token
        localStorage.setItem(TOKEN_KEY, data.token);
        setToken(data.token);

        // Set user from JWT response
        setUser({
          id: data.id,
          username: data.username,
          displayName: data.displayName,
          role: data.roles[0]?.replace("ROLE_", "") as User["role"],
          isStudent: data.isStudent,
        });

        // Redirect to dashboard
        router.push("/dashboard");
      } catch (error) {
        throw error;
      }
    },
    [router]
  );

  const signup = useCallback(async (data: SignupRequest) => {
    try {
      await api.auth.signup(data);
      // Signup successful - redirect to login
      router.push("/login");
    } catch (error) {
      throw error;
    }
  }, [router]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    router.push("/login");
  }, [router]);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
