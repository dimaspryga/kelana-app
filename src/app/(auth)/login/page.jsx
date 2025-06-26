"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from "sonner";
import { Loader2 } from 'lucide-react';
import Image from "next/image";
import { LoginForm } from "@/components/forms/login-form";

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
        toast.error("Please enter both email and password.");
        return;
    }

    const result = await login(email, password);

    if (result.success) {
      toast.success("Login successful! Redirecting...");
    } else {
      toast.error(result.message || "Failed to log in.");
    }
  };

return (
    <div className="relative grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2 font-medium">
            <Image
              className="dark:invert"
              src="/assets/kelana.webp"
              alt="Kelana-logo"
              width={150}
              height={38}
              priority
            />
          </a>
        </div>
        <div className="flex items-center justify-center flex-1">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img
          src="/assets/banner-authpage.png"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale opacity-80"
        />
      </div>

      <img
        src="/assets/login-2.png"
        alt="vector"
        className="absolute bottom-0 left-0 z-[-100] w-48 h-24 sm:w-40 sm:h-20 md:w-48 md:h-24 lg:w-74 lg:h-32 hidden lg:block"
      />
    </div>
  );
};

export default LoginPage;
