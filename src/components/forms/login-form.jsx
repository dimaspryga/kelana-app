"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { toast } from "sonner";
import { Loader2, Sparkles, Mail, Lock } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({ className, ...props }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }

    await login(email, password);
  };

  return (
    <form onSubmit={handleLogin} className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl tracking-tight">Welcome Back</h1>
        </div>
        <p className="text-gray-600 text-balance text-sm md:text-base">
          Ready to continue your adventure? Sign in to unlock amazing experiences
        </p>
      </div>

      <div className="grid gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-gray-400" />
              <input
                id="email"
                type="email"
                placeholder="Enter your email address"
                className="w-full pl-10 pr-4 py-3 text-base border border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300 hover:bg-white/90"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-gray-400" />
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="w-full pl-10 pr-4 py-3 text-base border border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300 hover:bg-white/90"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
        </div>
        <Button 
          type="submit" 
          className="w-full h-12 text-lg font-semibold text-white transition-all duration-200 bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg hover:from-blue-700 hover:to-blue-800 rounded-xl hover:shadow-xl hover:scale-105" 
          disabled={loading}
        >
          {loading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
          Sign In & Continue
        </Button>
      </div>
      <div className="text-center">
        <p className="text-gray-600 text-sm">
          New to Kelana?{" "}
          <Link href="/register" className="font-semibold text-blue-600 underline-offset-4 hover:underline hover:text-blue-700 transition-colors duration-200">
            Create your account
          </Link>
        </p>
      </div>

      <div className="pt-4 text-center border-t border-blue-100">
        <p className="text-xs text-gray-500">
          By signing in, you agree to our{" "}
          <a href="/terms" className="text-blue-600 underline-offset-4 hover:underline hover:text-blue-700 transition-colors duration-200">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" className="text-blue-600 underline-offset-4 hover:underline hover:text-blue-700 transition-colors duration-200">
            Privacy Policy
          </a>
        </p>
      </div>
    </form>
  );
}