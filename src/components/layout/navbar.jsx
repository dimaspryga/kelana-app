"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/hooks/useCart";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { ShoppingCart, Menu, X, User, LogOut, Receipt, Home, MapPin, Tag, Gift, Settings } from "lucide-react";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const lastScrollY = useRef(0);
  const { user, logout, loading } = useAuth();
  const { cartItems, cartCount, isLoading: isCartLoading } = useCart();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Check if scrolled down for background effect
      setIsScrolled(currentScrollY > 10);
      
      // Handle navbar hide/show - only after scrolling past 500px
      if (currentScrollY > 500) {
        if (currentScrollY > lastScrollY.current) {
          // Scrolling down - hide navbar immediately
          setIsNavbarVisible(false);
        } else if (currentScrollY < lastScrollY.current) {
          // Scrolling up - show navbar immediately
          setIsNavbarVisible(true);
        }
      } else {
        // Always show navbar when within 500px from top
        setIsNavbarVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navigationItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/activity", label: "Activities", icon: MapPin },
    { href: "/category", label: "Categories", icon: Tag },
    { href: "/promo", label: "Promos", icon: Gift },
  ];

  const isActive = (href) => pathname === href;

  // Cart Hover Card
  const CartButton = () => (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="relative transition-all duration-300 rounded-xl hover:bg-blue-50 hover:text-blue-600 hover:scale-105 group"
            onClick={() => router.push("/cart")}
          >
            <ShoppingCart className="w-5 h-5 lg:w-6 lg:h-6 transition-transform duration-200 group-hover:scale-110" />
            {user && cartCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute flex items-center justify-center w-5 h-5 text-xs text-white bg-blue-600 rounded-full shadow-lg -top-1 -right-1 ring-2 ring-white"
              >
                {cartCount}
              </motion.span>
            )}
          </Button>
        </div>
      </HoverCardTrigger>
      {user && (
        <HoverCardContent className="p-4 border border-blue-100 shadow-2xl w-80 bg-white/95 backdrop-blur-sm rounded-2xl" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900">Shopping cart</h4>
              <p className="text-sm text-gray-500">{cartCount} Item(s)</p>
            </div>
            <div className="pr-2 space-y-3 overflow-y-auto max-h-60">
              {isCartLoading ? (
                <div className="flex items-center justify-center p-4">
                  <span className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : cartItems.length > 0 ? (
                cartItems.slice(0, 5).map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-3 transition-all duration-200 rounded-xl hover:bg-blue-50 hover:scale-105 border border-transparent hover:border-blue-200"
                  >
                    <img
                      src={item.activity?.imageUrls?.[0] || "/assets/error.png"}
                      alt={item.activity?.title}
                      className="object-cover w-12 h-12 rounded-lg shadow-sm"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/assets/error.png";
                      }}
                    />
                    <div className="flex-grow overflow-hidden">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.activity?.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.quantity} x Rp{item.activity?.price?.toLocaleString("id-ID")}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-blue-600">
                      Rp{(item.activity?.price * item.quantity).toLocaleString("id-ID")}
                    </p>
                  </motion.div>
                ))
              ) : (
                <div className="py-8 text-center">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm text-gray-500">Your cart is empty.</p>
                </div>
              )}
            </div>
            {cartItems.length > 0 && (
              <Button
                className="w-full text-white transition-all duration-200 bg-blue-600 shadow-lg hover:bg-blue-700 rounded-xl hover:shadow-xl hover:scale-105"
                onClick={() => router.push("/cart")}
              >
                View Cart
              </Button>
            )}
          </div>
        </HoverCardContent>
      )}
    </HoverCard>
  );

  // Mobile Menu
  const MobileMenu = () => (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm lg:hidden z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Mobile Menu Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl lg:hidden z-50"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white">
                <div className="flex items-center space-x-3">
                  <img
                    src="/assets/kelana.webp"
                    alt="Kelana Logo"
                    className="w-10 h-10 object-contain"
                  />
                  <h2 className="text-lg font-bold text-gray-900">Kelana</h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-xl hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* User Info */}
              {user && (
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center text-lg font-semibold">
                      {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {user.name || user.email}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {user.role}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex-1 p-6 space-y-2 bg-white">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 text-base font-medium rounded-xl transition-all duration-200 ${
                        isActive(item.href)
                          ? "text-blue-700 bg-blue-50 border border-blue-200"
                          : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* User Actions */}
              {user ? (
                <div className="p-6 border-t border-gray-100 space-y-2 bg-white">
                  <Link
                    href="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 text-base font-medium text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200"
                  >
                    <User className="w-5 h-5" />
                    <span>Profile</span>
                  </Link>
                  <Link
                    href="/transaction"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 text-base font-medium text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200"
                  >
                    <Receipt className="w-5 h-5" />
                    <span>Transactions</span>
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 text-base font-medium text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200"
                  >
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 w-full px-4 py-3 text-base font-medium text-red-600 rounded-xl hover:bg-red-50 transition-all duration-200 text-left"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="p-6 border-t border-gray-100 space-y-3 bg-white">
                  <Button
                    asChild
                    variant="outline"
                    className="w-full rounded-xl"
                  >
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      Login
                    </Link>
                  </Button>
                  <Button
                    asChild
                    className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl"
                  >
                    <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                      Register
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <motion.nav
      initial={{ y: 0 }}
      animate={{ y: isNavbarVisible ? 0 : -100 }}
      transition={{ 
        type: "spring", 
        stiffness: 1000, 
        damping: 50,
        mass: 0.1
      }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-50 ${
        isScrolled ? "bg-white/95 backdrop-blur-xl shadow-sm" : "bg-white/80 backdrop-blur-sm"
      }`}
    >
      <div className="container px-4 mx-auto max-w-7xl">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center group">
              <div className="relative transition-transform duration-300 group-hover:scale-105">
                <img
                  src="/assets/kelana.webp"
                  alt="Kelana Logo"
                  className="w-20 h-20 lg:w-28 lg:h-28 object-contain"
                />
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-1">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-4 py-2 text-base font-medium transition-all duration-500 rounded-xl ${
                  isActive(item.href)
                    ? "text-blue-700"
                    : "text-gray-700 hover:text-blue-600"
                }`}
                style={{ overflow: "visible" }}
              >
                <span>{item.label}</span>
                <motion.span
                  layoutId="nav-underline"
                  className="absolute left-1/2 -translate-x-1/2 bottom-1 h-[3px] w-6 rounded-full"
                  animate={isActive(item.href) ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  style={{ background: "#2563eb", originX: 0.5 }}
                />
              </Link>
            ))}
          </div>

          {/* Right side - Cart & User Menu */}
          <div className="flex items-center space-x-4 lg:space-x-6">
            <CartButton />
            
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden transition-all duration-200 rounded-xl hover:bg-blue-50 hover:text-blue-600"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>

            {/* Desktop User Menu - Only Profile Picture */}
            {user ? (
              <div className="hidden lg:block relative">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg hover:shadow-xl">
                      {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end" 
                    className="w-64 p-3 border border-gray-200 shadow-2xl bg-white rounded-2xl z-[60]" 
                    sideOffset={8}
                  >
                    <div className="p-3 mb-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                      <DropdownMenuLabel className="px-0 py-1 text-sm font-bold text-gray-900">
                        {user.name || user.email}
                      </DropdownMenuLabel>
                      <p className="px-0 py-1 text-xs text-gray-600 capitalize">
                        {user.role}
                      </p>
                    </div>
                    <DropdownMenuSeparator className="my-2" />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center space-x-3 px-3 py-2 text-sm rounded-xl hover:bg-blue-50 cursor-pointer transition-all duration-200">
                        <User className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/transaction" className="flex items-center space-x-3 px-3 py-2 text-sm rounded-xl hover:bg-blue-50 cursor-pointer transition-all duration-200">
                        <Receipt className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">Transactions</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center space-x-3 px-3 py-2 text-sm rounded-xl hover:bg-blue-50 cursor-pointer transition-all duration-200">
                        <Settings className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-2" />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="flex items-center space-x-3 px-3 py-2 text-sm text-red-600 rounded-xl hover:bg-red-50 cursor-pointer transition-all duration-200"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="font-medium">Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="hidden lg:flex items-center space-x-2">
                <Button
                  asChild
                  variant="ghost"
                  className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl"
                >
                  <Link href="/login">Login</Link>
                </Button>
                <Button
                  asChild
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                >
                  <Link href="/register">Register</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <MobileMenu />
    </motion.nav>
  );
};

export default Navbar; 