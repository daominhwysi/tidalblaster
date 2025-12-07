import { createRoot } from "react-dom/client";
import "./index.css";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import LoginPage from "@/auth/login/page";
import SignUpPage from "@/auth/signup/page";
import DashboardPage from "@/dashboard/page";
import { AuthProvider } from "@/auth/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PublicRoute } from "@/components/PublicRoute";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);
