"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { setCookie, getCookie, deleteCookie } from "cookies-next"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2 } from "lucide-react"

const AuthContext = createContext(null)

const FullScreenLoader = React.memo(() => (
  <motion.div
    key="loader"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm"
    role="status"
    aria-label="Loading"
  >
    <div className="flex flex-col items-center space-y-3">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" aria-hidden="true" />
      <p className="text-sm font-medium text-gray-600">Loading...</p>
    </div>
  </motion.div>
))

FullScreenLoader.displayName = "FullScreenLoader"

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)
  const router = useRouter()
  const abortControllerRef = useRef(null)

  useEffect(() => {
    setHasMounted(true)
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const checkUserLoggedIn = useCallback(async () => {
    const token = getCookie("token")
    if (!token) {
      setLoading(false)
      return
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    try {
      const response = await axios.get("/api/verify", {
        signal: abortControllerRef.current.signal,
        timeout: 10000,
      })

      if (response.data?.data) {
        setUser(response.data.data)
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Session verification failed:", error)
        deleteCookie("token")
        setUser(null)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (hasMounted) {
      checkUserLoggedIn()
    }
  }, [hasMounted, checkUserLoggedIn])

  const login = useCallback(
    async (email, password) => {
      if (!email || !password) {
        toast.error("Email and password are required")
        return { success: false, message: "Email and password are required" }
      }

      setIsLoggingIn(true)
      const toastId = toast.loading("Logging in...")

      try {
        const response = await axios.post("/api/login", { email, password }, { timeout: 15000 })
        const { token, user: userData } = response.data

        if (!token || !userData) {
          throw new Error("Invalid response from server")
        }

        setCookie("token", token, {
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          path: "/",
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        })

        setUser(userData)
        toast.success("Login successful!", { id: toastId })

        setTimeout(() => {
          const params = new URLSearchParams(window.location.search)
          const redirectPath = params.get("redirect")
          if (redirectPath && redirectPath.startsWith("/")) {
            router.push(decodeURIComponent(redirectPath))
          } else if (userData.role === "admin") {
            router.push("/dashboard")
          } else {
            router.push("/")
          }
        }, 500)

        return { success: true }
      } catch (err) {
        let errorMessage = "Login failed. Please try again."
        if (err.response?.data?.message) {
          errorMessage = err.response.data.message
        } else if (err.code === "ECONNABORTED") {
          errorMessage = "Request timeout. Please try again."
        }

        toast.error(errorMessage, { id: toastId })
        console.error("Login failed:", err)
        deleteCookie("token")
        return { success: false, message: errorMessage }
      } finally {
        setIsLoggingIn(false)
      }
    },
    [router],
  )

  const logout = useCallback(async () => {
    const toastId = toast.loading("Logging out...")

    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      await axios.get("/api/logout", { timeout: 5000 }).catch(() => {})
      toast.success("Logout successful!", { id: toastId })
    } catch (error) {
      console.error("Logout error:", error)
      toast.success("Logout successful!", { id: toastId })
    } finally {
      setUser(null)
      deleteCookie("token")
      router.push("/")
    }
  }, [router])

  const value = {
    user,
    loading,
    isLoggingIn,
    login,
    logout,
    refetchUser: checkUserLoggedIn,
    isAuthenticated: !!user,
  }

  return (
    <AuthContext.Provider value={value}>
      <AnimatePresence mode="wait">{loading && hasMounted && <FullScreenLoader />}</AnimatePresence>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
