"use client";

import Image from "next/image";
import { LoginForm } from "@/components/forms/login-form";

const LoginPage = () => {
  return (
    <div className="relative grid min-h-svh lg:grid-cols-2 bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2 font-medium transition-all duration-200 hover:opacity-80">
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
          <div className="w-full max-w-sm">
            <div className="p-8 shadow-2xl bg-white/95 backdrop-blur-md rounded-3xl border border-white/20">
              <LoginForm />
            </div>
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img
          src="/assets/banner-authpage.png"
          alt="Login Banner"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/40 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-blue-600/30"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-blue-600/10 via-transparent to-transparent"></div>
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
