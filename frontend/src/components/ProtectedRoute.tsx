import { useAuth } from "@/auth/context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

export const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center text-brand">
        Loading...
      </div>
    );

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};
