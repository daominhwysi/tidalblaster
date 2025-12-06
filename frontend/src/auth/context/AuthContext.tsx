import {
  createContext,
  useState,
  useEffect,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import * as api from "@/api/index";

interface User {
  id: number;
  username: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: api.UserIn) => Promise<void>;
  register: (credentials: api.UserCreate) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoggedIn = async () => {
      const access_token = localStorage.getItem("access_token");
      if (!access_token) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await api.me();
        setUser(res.data);
      } catch {
        localStorage.removeItem("access_token");
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkLoggedIn();
  }, []);

  const login = async (credential: api.UserIn) => {
    const res = await api.login(credential);

    localStorage.setItem("access_token", res.data.access_token);
    const me = await api.me();
    setUser(me.data);

    navigate("/");
  };

  const register = async (credential: api.UserCreate) => {
    await api.register(credential);
    console.log(credential);
    await login({
      username: credential.username,
      password: credential.password,
    });
  };

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      localStorage.removeItem("access_token");
      setUser(null);
      navigate("/login");
    }
  };
  const value = useMemo(
    () => ({ user, isLoading, login, register, logout }),
    [user, isLoading]
  );
  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
