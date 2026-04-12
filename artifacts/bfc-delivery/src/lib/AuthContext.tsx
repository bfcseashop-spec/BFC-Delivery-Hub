import { createContext, useContext, ReactNode, useCallback } from "react";
import { useGetMe, getGetMeQueryKey, useLogin, useLogout, useSignup } from "@workspace/api-client-react";
import type { AuthUser, LoginBody, SignupBody } from "@workspace/api-client-react/src/generated/api.schemas";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useLocation } from "wouter";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (data: LoginBody) => Promise<void>;
  logout: () => Promise<void>;
  signup: (data: SignupBody) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const { data: user, isLoading } = useGetMe({
    query: {
      queryKey: getGetMeQueryKey(),
      retry: false,
    },
  });

  const loginMutation = useLogin();
  const logoutMutation = useLogout();
  const signupMutation = useSignup();

  const login = useCallback(async (data: LoginBody) => {
    try {
      const u = await loginMutation.mutateAsync({ data });
      queryClient.setQueryData(getGetMeQueryKey(), u);
      toast.success(`Welcome back, ${u.name}!`);
      if (u.role === "admin") {
        setLocation("/admin");
      } else {
        setLocation("/");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Login failed");
      throw err;
    }
  }, [loginMutation, queryClient, setLocation]);

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
      queryClient.setQueryData(getGetMeQueryKey(), null);
      toast.success("Logged out successfully");
      setLocation("/");
    } catch (err: any) {
      toast.error("Logout failed");
    }
  }, [logoutMutation, queryClient, setLocation]);

  const signup = useCallback(async (data: SignupBody) => {
    try {
      const u = await signupMutation.mutateAsync({ data });
      queryClient.setQueryData(getGetMeQueryKey(), u);
      toast.success(`Account created, welcome ${u.name}!`);
      if (u.role === "admin") {
        setLocation("/admin");
      } else {
        setLocation("/");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Signup failed");
      throw err;
    }
  }, [signupMutation, queryClient, setLocation]);

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        login,
        logout,
        signup,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
