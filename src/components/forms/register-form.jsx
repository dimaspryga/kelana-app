"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRegister } from "@/hooks/useRegister";
import { Loader2, Sparkles, User, Mail, Lock, Phone } from 'lucide-react';

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
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl tracking-tight">Join Kelana</h1>
        </div>
        <p className="text-gray-600 text-balance text-sm md:text-base">
          Start your journey today! Create an account to explore amazing adventures
        </p>
      </div>
      <div className="grid gap-6">
        <div>
          <Label htmlFor="user" className="block mb-3 text-sm font-semibold text-gray-700">
            Choose Your Role
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
                  "flex h-12 w-full min-w-0 rounded-xl border bg-transparent px-4 py-3 text-base shadow-sm transition-all duration-200 outline-none",
                  "focus-visible:border-blue-500 focus-visible:ring-4 focus-visible:ring-blue-100",
                  "transition-colors border-blue-200 cursor-pointer peer-checked:border-blue-600 peer-checked:bg-blue-50 items-center justify-center",
                  "hover:border-blue-300 hover:bg-blue-25",
                  className
                )}
              >
                <svg
                  width="16px"
                  height="16px"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2"
                >
                  <path
                    d="M5 21C5 17.134 8.13401 14 12 14C15.866 14 19 17.134 19 21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-sm font-medium">Traveler</span>
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
                  "flex h-12 w-full min-w-0 rounded-xl border bg-transparent px-4 py-3 text-base shadow-sm transition-all duration-200 outline-none",
                  "focus-visible:border-blue-500 focus-visible:ring-4 focus-visible:ring-blue-100",
                  "transition-colors border-blue-200 cursor-pointer peer-checked:border-blue-600 peer-checked:bg-blue-50 justify-center",
                  "hover:border-blue-300 hover:bg-blue-25",
                  className
                )}
              >
                <svg
                  width="16px"
                  height="16px"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2"
                >
                  <path
                    d="M19 18.0039V17C19 15.8954 18.1046 15 17 15C15.8954 15 15 15.8954 15 17V18.0039M4 21C4 17.134 7.13401 14 11 14C11.3395 14 11.6734 14.0242 12 14.0709M15.5 21H18.5C18.9659 21 19.1989 21 19.3827 20.9239C19.6277 20.8224 19.8224 20.6277 19.9239 20.3827C20 20.1989 20 19.9659 20 19.5C20 19.0341 20 18.8011 19.9239 18.6173C19.8224 18.3723 19.6277 18.1776 19.3827 18.0761C19.1989 18 18.9659 18 18.5 18H15.5C15.0341 18 14.8011 18 14.6173 18.0761C14.3723 18.1776 14.1776 18.3723 14.0761 18.6173C14 18.8011 14 19.0341 14 19.5C14 19.9659 14 20.1989 14.0761 20.3827C14.1776 20.6277 14.3723 20.8224 14.6173 20.9239C14.8011 21 15.0341 21 15.5 21ZM15 7C15 9.20914 13.2091 11 11 11C8.79086 11 7 9.20914 7 7C7 4.79086 8.79086 3 11 3C13.2091 3 15 4.79086 15 7Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-sm font-medium">Admin</span>
              </Label>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
              Full Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-gray-400" />
              <input
                id="name"
                type="text"
                placeholder="Enter your full name"
                className="w-full pl-10 pr-4 py-3 text-base border border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300 hover:bg-white/90"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

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
                placeholder="Create a strong password"
                className="w-full pl-10 pr-4 py-3 text-base border border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300 hover:bg-white/90"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">
              Confirm Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-gray-400" />
              <input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                className="w-full pl-10 pr-4 py-3 text-base border border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300 hover:bg-white/90"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        <div className="grid gap-3">
          <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">Phone Number</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-gray-400" />
            <Input
              onChange={(e) => setPhoneNumber(e.target.value)}
              id="phone"
              type="tel"
              placeholder="Enter your phone number"
              required
              className="pl-10 pr-4 py-3 text-base border border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300 hover:bg-white/90"
            />
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full h-12 text-lg font-semibold text-white transition-all duration-200 bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg hover:from-blue-700 hover:to-blue-800 rounded-xl hover:shadow-xl hover:scale-105" 
          disabled={loading}
        >
          {loading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
          Create Account & Start Exploring
        </Button>
      </div>
      <div className="text-center">
        <p className="text-gray-600 text-sm">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-blue-600 underline-offset-4 hover:underline hover:text-blue-700 transition-colors duration-200">
            Sign in here
          </Link>
        </p>
      </div>

      <div className="pt-4 text-center border-t border-blue-100">
        <p className="text-xs text-gray-500">
          By creating an account, you agree to our{" "}
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