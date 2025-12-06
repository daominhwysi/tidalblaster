import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simulate login attempt
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      // Replace with actual authentication logic
      console.log("Login attempt with:", { email, password });
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      {/* Header */}
      <header className="w-full border-b bg-brand-bg">
        <div className="max-w-[1060px] mx-auto px-4">
          <nav className="flex items-center justify-between py-4">
            <Link to="/" className="text-brand font-semibold text-lg">
              Acme
            </Link>
            <div className="flex items-center space-x-4">
              <span className="inline">
                <span className="hidden sm:inline">Don't have an account?</span>
                <Link to="/signup" className="ml-4">
                  Sign up
                </Link>
              </span>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-[420px]">
          {/* Login Card */}
          <div className="flex flex-col gap-8">
            {/* Heading */}
            <div className="flex flex-col gap-3 text-center">
              <h1 className="text-brand text-4xl md:text-5xl font-serif font-normal">
                Welcome back
              </h1>
              <p className="text-brand/70 text-base font-medium">
                Sign in to your account to continue
              </p>
            </div>
            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* Email Input */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="email"
                  className="text-brand text-sm font-medium"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="px-4 py-3 rounded-lg border border-brand/12 bg-white text-brand placeholder-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                  required
                />
              </div>

              {/* Password Input */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-brand text-sm font-medium"
                  >
                    Password
                  </label>
                  <a
                    href="#"
                    className="text-brand/70 text-sm font-medium hover:text-brand transition-colors"
                  >
                    Forgot?
                  </a>
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="px-4 py-3 rounded-lg border border-brand/12 bg-white text-brand placeholder-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                  required
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 rounded-lg bg-[#fee2e2] text-[#991b1b] text-sm font-medium">
                  {error}
                </div>
              )}

              {/* Sign In Button */}
              <Button
                type="submit"
                disabled={loading}
                className="h-11 w-full bg-brand hover:bg-brand/90 text-white rounded-full font-medium text-base shadow-md disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
            {/* Divider
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-brand/12"></div>
              <span className="text-brand/50 text-sm font-medium">or</span>
              <div className="flex-1 h-px bg-brand/12"></div>
            </div> */}
            {/* Social Login */}
            {/* <div className="flex flex-col gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-11 border border-brand/12 text-brand hover:bg-brand/5 rounded-lg font-medium text-base bg-transparent"
              >
                Continue with Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11 border border-brand/12 text-brand hover:bg-brand/5 rounded-lg font-medium text-base bg-transparent"
              >
                Continue with GitHub
              </Button>
            </div> */}
            {/* Sign Up Link */}
            <p className="text-center text-brand text-sm font-medium">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-brand font-semibold hover:underline"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      {/* <footer className="w-full border-t border-brand/6 bg-[#f7f5f3]">
        <div className="max-w-[1060px] mx-auto px-4 py-8 flex items-center justify-between text-sm text-brand">
          <p>© 2025 Acme . All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-brand transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-brand transition-colors">
              Terms
            </a>
          </div>
        </div>
      </footer> */}
    </div>
  );
}
