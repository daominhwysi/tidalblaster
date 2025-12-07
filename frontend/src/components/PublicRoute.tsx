import { useAuth } from "@/auth/context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

export const PublicRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg text-brand">
        Loading...
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
