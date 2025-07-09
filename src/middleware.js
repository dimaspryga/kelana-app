import { NextResponse } from "next/server"

// Cache untuk menyimpan hasil verifikasi token sementara
const tokenCache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 menit
const MAX_CACHE_SIZE = 500

const cleanCache = () => {
  if (tokenCache.size > MAX_CACHE_SIZE) {
    const firstKey = tokenCache.keys().next().value
    tokenCache.delete(firstKey)
  }
}

const getCachedUser = (token) => {
  const cached = tokenCache.get(token)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.user
  }
  return null
}

const setCachedUser = (token, user) => {
  cleanCache()
  tokenCache.set(token, { user, timestamp: Date.now() })
}

// Utility functions
const addToTokenCache = (token, userData) => {
  // Prevent memory leak by limiting cache size
  if (tokenCache.size >= MAX_CACHE_SIZE) {
    const firstKey = tokenCache.keys().next().value
    tokenCache.delete(firstKey)
  }

  tokenCache.set(token, {
    userData,
    timestamp: Date.now(),
  })
}

const clearExpiredCache = () => {
  const now = Date.now()
  for (const [token, entry] of tokenCache.entries()) {
    if (now - entry.timestamp >= CACHE_DURATION) {
      tokenCache.delete(token)
    }
  }
}

// Route configurations - Updated with more specific paths
const ROUTE_CONFIG = {
  // Admin routes - only accessible by admin users
  admin: [
    "/dashboard",
    "/admin",
    "/users", 
    "/banners", 
    "/categories", 
    "/activities", 
    "/promos", 
    "/transactions",
    "/admin/",
    "/dashboard/",
    "/users/",
    "/banners/",
    "/categories/",
    "/activities/",
    "/promos/",
    "/transactions/"
  ],
  
  // User routes - only accessible by regular users
  user: [
    "/cart",
    "/profile", 
    "/transaction",
    "/booking",
    "/favorites",
    "/cart/",
    "/profile/",
    "/transaction/",
    "/booking/",
    "/favorites/"
  ],
  
  // Auth routes - login/register pages
  auth: [
    "/login", 
    "/register", 
    "/forgot-password", 
    "/reset-password"
  ],
  
  // Public routes - accessible by everyone
  public: [
    "/", 
    "/about", 
    "/contact", 
    "/activity", 
    "/category", 
    "/promo", 
    "/search",
    "/banner",
    "/activity/",
    "/category/",
    "/promo/",
    "/banner/"
  ],
}

// Helper functions for route checking
const isRouteMatch = (pathname, routes) => {
  return routes.some((route) => {
    // Handle exact matches
    if (pathname === route) return true
    
    // Handle wildcard matches (routes ending with /)
    if (route.endsWith("/")) {
      return pathname.startsWith(route)
    }
    
    // Handle path prefix matches
    if (pathname.startsWith(route + "/")) return true
    
    return false
  })
}

const getRouteType = (pathname) => {
  // Debug logging in development
  if (process.env.NODE_ENV === "development") {
    console.log(`[Middleware] Checking route: ${pathname}`)
  }
  
  if (isRouteMatch(pathname, ROUTE_CONFIG.admin)) {
    if (process.env.NODE_ENV === "development") {
      console.log(`[Middleware] Route ${pathname} classified as ADMIN`)
    }
    return "admin"
  }
  if (isRouteMatch(pathname, ROUTE_CONFIG.user)) {
    if (process.env.NODE_ENV === "development") {
      console.log(`[Middleware] Route ${pathname} classified as USER`)
    }
    return "user"
  }
  if (isRouteMatch(pathname, ROUTE_CONFIG.auth)) {
    if (process.env.NODE_ENV === "development") {
      console.log(`[Middleware] Route ${pathname} classified as AUTH`)
    }
    return "auth"
  }
  
  if (process.env.NODE_ENV === "development") {
    console.log(`[Middleware] Route ${pathname} classified as PUBLIC`)
  }
  return "public"
}

// Create redirect response with proper headers
const createRedirectResponse = (url, request, options = {}) => {
  const response = NextResponse.redirect(new URL(url, request.url))

  // Add security headers
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")

  // Handle cookie deletion if needed
  if (options.deleteToken) {
    response.cookies.delete("token")
  }

  // Add redirect reason for debugging
  if (process.env.NODE_ENV === "development") {
    response.headers.set("X-Redirect-Reason", options.reason || "unknown")
  }

  return response
}

// Verify token with API
const verifyTokenWithAPI = async (token, request) => {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

    const verifyUrl = `${request.nextUrl.origin}/api/verify`
    const response = await fetch(verifyUrl, {
      method: "GET",
      headers: {
        Cookie: `token=${token}`,
        "User-Agent": "NextJS-Middleware/1.0",
        Accept: "application/json",
      },
      signal: controller.signal,
      cache: "no-cache",
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`Verification failed: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    if (!data.data || typeof data.data !== "object") {
      throw new Error("Invalid user data received")
    }

    return data.data
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Token verification timeout")
    }
    throw error
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("token")?.value
  const routeType = getRouteType(pathname)

  // Clean expired cache periodically
  if (Math.random() < 0.1) {
    // 10% chance to clean cache
    clearExpiredCache()
  }

  // Handle public routes - always accessible
  if (routeType === "public") {
    return NextResponse.next()
  }

  // Handle auth routes (login/register)
  if (routeType === "auth") {
    // If user is already logged in, redirect based on role
    if (token) {
      try {
        const userData = await verifyTokenWithAPI(token, request)
        if (userData?.role === "admin") {
          return createRedirectResponse("/dashboard", request, {
            reason: "admin_already_authenticated",
          })
        } else {
          return createRedirectResponse("/", request, {
            reason: "user_already_authenticated",
          })
        }
      } catch (error) {
        // Token invalid, allow access to auth pages
        return NextResponse.next()
      }
    }
    // No token, allow access to auth pages
    return NextResponse.next()
  }

  // Handle protected routes (admin and user routes)
  if (!token) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    loginUrl.searchParams.set("reason", "auth_required")

    return createRedirectResponse(loginUrl.toString(), request, {
      reason: "no_token",
    })
  }

  // Verify token and get user data
  let userData = null
  const cachedEntry = tokenCache.get(token)

  if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_DURATION) {
    userData = cachedEntry.userData
  } else {
    try {
      userData = await verifyTokenWithAPI(token, request)
      addToTokenCache(token, userData)
    } catch (error) {
      console.error("Middleware verification failed:", {
        error: error.message,
        pathname,
        timestamp: new Date().toISOString(),
        userAgent: request.headers.get("user-agent"),
      })

      // Clear invalid token and redirect to login
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      loginUrl.searchParams.set("reason", "session_expired")

      return createRedirectResponse(loginUrl.toString(), request, {
        deleteToken: true,
        reason: "invalid_token",
      })
    }
  }

  // Validate user data
  if (!userData || !userData.id || !userData.role) {
    console.error("Invalid user data in middleware:", userData)
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    loginUrl.searchParams.set("reason", "invalid_user_data")

    return createRedirectResponse(loginUrl.toString(), request, {
      deleteToken: true,
      reason: "invalid_user_data",
    })
  }

  const isAdmin = userData.role === "admin"
  const isUser = userData.role === "user"

  // Handle admin route access
  if (routeType === "admin") {
    if (!isAdmin) {
      // User trying to access admin routes - redirect to home
      return createRedirectResponse("/", request, {
        reason: "insufficient_permissions_admin",
      })
    }
    // Admin accessing admin routes - allow
    return NextResponse.next()
  }

  // Handle user route access
  if (routeType === "user") {
    if (!isUser && !isAdmin) {
      // Invalid role - redirect to login
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      loginUrl.searchParams.set("reason", "invalid_role")

      return createRedirectResponse(loginUrl.toString(), request, {
        deleteToken: true,
        reason: "invalid_role",
      })
    }
    
    // Admin trying to access user routes - redirect to dashboard
    if (isAdmin) {
      return createRedirectResponse("/dashboard", request, {
        reason: "admin_accessing_user_routes",
      })
    }
    
    // User accessing user routes - allow
    return NextResponse.next()
  }

  // Add user info to request headers for API routes
  const response = NextResponse.next()

  if (userData) {
    response.headers.set("X-User-ID", userData.id || "")
    response.headers.set("X-User-Role", userData.role || "user")
    response.headers.set("X-User-Email", userData.email || "")
  }

  // Add security headers
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")

  return response
}

// Enhanced matcher configuration
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - assets (public assets)
     * - robots.txt, sitemap.xml (SEO files)
     */
    "/((?!api/|_next/static|_next/image|favicon.ico|assets/|robots.txt|sitemap.xml|manifest.json).*)",
  ],
}
