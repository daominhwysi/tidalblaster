import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import LoginPage from "./auth/login/page";
import SignUpPage from "./auth/signup/page";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    {" "}
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
    </Routes>
  </BrowserRouter>
);
