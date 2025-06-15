"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useLogin } from "@/hooks/useLogin";

export function LoginForm({ className, ...props }) {

  const {
    email,
    password,
    handleChangeEmail,
    handleChangePassword,
    handleLogin,
  } = useLogin();

  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-sm text-muted-foreground text-balance">
          Enter your email below to login to your account
        </p>
      </div>

      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input
            onChange={handleChangeEmail}
            value={email}
            id="email"
            type="email"
            placeholder="m@example.com"
            required
          />
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <Input
            onChange={handleChangePassword}
            value={password}
            id="password"
            type="password"
            placeholder="••••••••"
            required
          />
        </div>
        <Button
          onClick={(e) => handleLogin(e)}
          className="w-full bg-blue-400 hover:bg-blue-500"
        >
          Login
        </Button>
        
      </div>
      <div className="text-sm text-center">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="underline underline-offset-4">
          Sign up
        </Link>
      </div>

      <div className="text-sm text-center">
        <p className="text-sm text-center text-muted-foreground">
          By signing in, you agree to our{" "}
          <a href="/terms" className="underline underline-offset-4">
            Terms of Service
          </a>{" "}
          and acknowledge you have read and understand our{" "}
          <a href="/privacy" className="underline underline-offset-4">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </form>
  );
}
