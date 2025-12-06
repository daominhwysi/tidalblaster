import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BASE_API_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
export interface UserIn {
  username: string;
  password: string;
}
export interface UserCreate {
  username: string;
  password: string;
  name: string;
}

export interface UserOut {
  id: number;
  username: string;
}
export interface Token {
  access_token: string;
}
export const login = async (credentials: UserIn) =>
  await apiClient.post<Token>("/auth/login", credentials);
export const register = async (credentials: UserCreate) =>
  await apiClient.post("/auth/register", credentials);

export const me = async () => apiClient.get("/auth/me");

export const logout = async () => console.log("móc logout");
