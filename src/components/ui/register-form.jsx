"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRegister } from "@/hooks/useRegister";

export function RegisterForm({ className, ...props }) {
  const {
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    name,
    setName,
    phoneNumber,
    setPhoneNumber,
    role,
    setRole,
    loading,
    handleRegister,
  } = useRegister();

  return (
    <form
      onSubmit={handleRegister}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Register your account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Sign up to enjoy the feature of Revolutie
        </p>
      </div>
      <div className="grid gap-6">
        <div>
          <Label htmlFor="user" className="block mb-3">
            Select Role
          </Label>

          <div className="grid grid-cols-2 gap-3">

            <div className="grid gap-3">
              <Input
                onChange={(e) => setRole(e.target.value)}
                id="user"
                name="role"
                type="radio"
                value="user"
                className="peer hidden"
                required
              />
              <Label
                htmlFor="user"
                className={cn(
                  "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                  "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                  "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
                  "transition-colors border-gray-300 cursor-pointer peer-checked:border-blue-400 peer-checked:bg-blue-50 items-center justify-center",
                  className
                )}
              >
                <svg
                  width="15px"
                  height="15px"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 21C5 17.134 8.13401 14 12 14C15.866 14 19 17.134 19 21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z"
                    stroke="#000000"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-sm">Users</span>
              </Label>
            </div>


            <div className="grid gap-3">
              <Input
                onChange={(e) => setRole(e.target.value)}
                id="admin"
                name="role"
                type="radio"
                value="admin"
                className="peer hidden"
                required
              />
              <Label
                htmlFor="admin"
                className={cn(
                  "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity50 md:text-sm",
                  "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                  "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
                  "transition-colors border-gray-300 cursor-pointer peer-checked:border-blue-400 peer-checked:bg-blue-50 justify-center",
                  className
                )}
              >
                <svg
                  width="15px"
                  height="15px"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M19 18.0039V17C19 15.8954 18.1046 15 17 15C15.8954 15 15 15.8954 15 17V18.0039M4 21C4 17.134 7.13401 14 11 14C11.3395 14 11.6734 14.0242 12 14.0709M15.5 21H18.5C18.9659 21 19.1989 21 19.3827 20.9239C19.6277 20.8224 19.8224 20.6277 19.9239 20.3827C20 20.1989 20 19.9659 20 19.5C20 19.0341 20 18.8011 19.9239 18.6173C19.8224 18.3723 19.6277 18.1776 19.3827 18.0761C19.1989 18 18.9659 18 18.5 18H15.5C15.0341 18 14.8011 18 14.6173 18.0761C14.3723 18.1776 14.1776 18.3723 14.0761 18.6173C14 18.8011 14 19.0341 14 19.5C14 19.9659 14 20.1989 14.0761 20.3827C14.1776 20.6277 14.3723 20.8224 14.6173 20.9239C14.8011 21 15.0341 21 15.5 21ZM15 7C15 9.20914 13.2091 11 11 11C8.79086 11 7 9.20914 7 7C7 4.79086 8.79086 3 11 3C13.2091 3 15 4.79086 15 7Z"
                    stroke="#000000"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-sm">Admin</span>
              </Label>
            </div>
          </div>
        </div>

        <div className="grid gap-3">
          <Label htmlFor="name">Full Name</Label>
          <Input
            onChange={(e) => setName(e.target.value)}
            id="name"
            type="text"
            placeholder="example name"
            required
            value={name}
          />
        </div>

        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input
            onChange={(e) => setEmail(e.target.value)}
            id="email"
            type="email"
            placeholder="account@example.com"
            required
            value={email}
          />
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
          </div>
          <Input
            onChange={(e) => setPassword(e.target.value)}
            id="password"
            type="password"
            placeholder="••••••••"
            required
            value={password}
          />
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="confirm-password">Confirm Password</Label>
          </div>
          <Input
            onChange={(e) => setConfirmPassword(e.target.value)}
            id="confirm-password"
            type="password"
            placeholder="••••••••"
            required
            value={confirmPassword}
          />
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="phone">Phone Number</Label>
          </div>
          <Input
            onChange={(e) => setPhoneNumber(e.target.value)}
            id="phone"
            type="tel"
            placeholder="+6281234567890"
            required
            value={phoneNumber}
          />
        </div>
        <Button
          type="submit"
          className="w-full bg-blue-400 hover:bg-blue-500"
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </Button>
      </div>
      <div className="text-center text-sm">
        Already have an account?{" "}
        <Link href="/login" className="underline underline-offset-4">
          Sign in
        </Link>
      </div>
      <div className="text-center text-sm">
        <p className="text-sm text-muted-foreground">
          By registering, you agree to our{" "}
          <Link href="#" className="underline underline-offset-4">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="#" className="underline underline-offset-4">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </form>
  );
}