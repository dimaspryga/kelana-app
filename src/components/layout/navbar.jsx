"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/hooks/useCart";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// UI Components
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

// Icons
import {
  ShoppingCart,
  X,
  Menu,
  User,
  LogOut,
  LayoutDashboard,
  Ticket,
  Loader2,
} from "lucide-react";

// Helper function for currency formatting
const formatCurrency = (amount) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

// --- Sub-components for better organization ---

// 1. NavLink Component (Diperbarui dengan animasi "pill" yang lebih modern)
const NavLink = ({ href, children }) => {
  const pathname = usePathname();
  const isActive =
    pathname === href || (href !== "/" && pathname.startsWith(href));
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href={href}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative px-4 py-2 text-sm font-medium rounded-full",
        isActive ? "text-blue-600" : "text-gray-500"
      )}
    >
      <span className="relative z-10 transition-colors duration-200">
        {children}
      </span>
      {isActive && (
        <motion.div
          layoutId="active-nav-pill"
          className="absolute inset-0 bg-blue-100 rounded-full"
          style={{ zIndex: 0 }}
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
        />
      )}
      <AnimatePresence>
        {!isActive && isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-gray-100 rounded-full"
            style={{ zIndex: 0 }}
          />
        )}
      </AnimatePresence>
    </Link>
  );
};

// 2. Cart Hover Card Component
const CartButton = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { cartItems, cartCount, isLoading: isCartLoading } = useCart();

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => router.push("/cart")}
          >
            <ShoppingCart className="w-5 h-5" />
          </Button>
          {!authLoading && user && cartCount > 0 && (
            <span className="absolute flex items-center justify-center w-5 h-5 text-xs text-white bg-blue-600 rounded-full -top-1 -right-1 ring-2 ring-white">
              {cartCount}
            </span>
          )}
        </div>
      </HoverCardTrigger>
      {user && (
        <HoverCardContent className="p-4 w-80" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Shopping cart</h4>
              <p className="text-sm text-muted-foreground">
                {cartCount} Item(s)
              </p>
            </div>
            <div className="pr-2 space-y-3 overflow-y-auto max-h-60">
              {isCartLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              ) : cartItems.length > 0 ? (
                cartItems.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <img
                      src={item.activity?.imageUrls[0]}
                      alt={item.activity?.title}
                      className="object-cover w-12 h-12 rounded-md"
                    />
                    <div className="flex-grow overflow-hidden">
                      <p className="text-sm font-medium truncate">
                        {item.activity?.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} x {formatCurrency(item.activity?.price)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold">
                      {formatCurrency(item.activity?.price * item.quantity)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="py-4 text-sm text-center text-muted-foreground">
                  Your cart is empty.
                </p>
              )}
            </div>
            {cartItems.length > 0 && (
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
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
};

// 3. Profile Dropdown Menu
const ProfileMenu = () => {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative rounded-full h-11 w-11">
          <Avatar className="border-2 border-blue-500 h-11 w-11">
            <AvatarImage src={user.profilePictureUrl} alt={user.name} />
            <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Signed in as</p>
            <p className="text-xs leading-none truncate text-muted-foreground">
              {user.name}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/profile")}>
          <User className="w-4 h-4 mr-2" /> My Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/transaction")}>
          <Ticket className="w-4 h-4 mr-2" /> My Transactions
        </DropdownMenuItem>
        {user.role === "admin" && (
          <DropdownMenuItem onClick={() => router.push("/dashboard")}>
            <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={logout}
          className="text-red-600 focus:bg-red-50 focus:text-red-700"
        >
          <LogOut className="w-4 h-4 mr-2" /> Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// 4. Auth Buttons for non-logged-in users
const AuthButtons = () => {
  const router = useRouter();
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" onClick={() => router.push("/login")}>
        Login
      </Button>
      <Button
        className="bg-blue-600 hover:bg-blue-700"
        onClick={() => router.push("/register")}
      >
        Register
      </Button>
    </div>
  );
};

// --- Main Navbar Component ---
const Navbar = () => {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Category", path: "/category" },
    { label: "Activity", path: "/activity" },
    { label: "Promo", path: "/promo" },
  ];

  const handleToggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleMobileLinkClick = (path) => {
    setIsMobileMenuOpen(false);
    router.push(path);
  };

  const isLoading = loading || !hasMounted;

  const MobileMenu = () => (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleToggleMobileMenu}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          />
          <motion.div
            variants={{
              hidden: { x: "100%" },
              visible: {
                x: "0%",
                transition: { type: "spring", stiffness: 300, damping: 30 },
              },
              exit: {
                x: "100%",
                transition: { type: "easeOut", duration: 0.3 },
              },
            }}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed top-0 right-0 z-50 w-4/5 h-full max-w-xs bg-white shadow-lg md:hidden"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <span className="text-lg font-bold">Menu</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleMobileMenu}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-4 flex flex-col h-[calc(100%-65px)]">
              <nav className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.path}
                    onClick={() => handleMobileLinkClick(item.path)}
                    className="p-3 text-base font-medium text-gray-700 rounded-md hover:bg-gray-100"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              {/* Profile Links for Mobile */}
              {user && (
                <div className="pt-4 mt-4 border-t">
                  <Button
                    variant="ghost"
                    className="justify-start w-full"
                    onClick={() => handleMobileLinkClick("/profile")}
                  >
                    <User className="w-4 h-4 mr-2" /> My Profile
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start w-full"
                    onClick={() => handleMobileLinkClick("/transaction")}
                  >
                    <Ticket className="w-4 h-4 mr-2" /> My Transactions
                  </Button>
                  {user.role === "admin" && (
                    <Button
                      variant="ghost"
                      className="justify-start w-full"
                      onClick={() => handleMobileLinkClick("/dashboard")}
                    >
                      <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
                    </Button>
                  )}
                </div>
              )}
              <div className="pt-4 mt-auto border-t">
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="w-full h-10" />
                    <Skeleton className="w-full h-10" />
                  </div>
                ) : !user ? (
                  <div className="space-y-2">
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => handleMobileLinkClick("/login")}
                    >
                      Login
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleMobileLinkClick("/register")}
                    >
                      Register
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center p-2 mb-4">
                      <Avatar className="w-10 h-10 mr-3">
                        <AvatarImage
                          src={user.profilePictureUrl}
                          alt={user.name}
                        />
                        <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <p className="font-semibold truncate">{user.name}</p>
                    </div>
                    <Button
                      variant="ghost"
                      className="justify-start w-full text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={logout}
                    >
                      <LogOut className="w-4 h-4 mr-2" /> Logout
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <header
        className={cn(
          "fixed top-0 z-30 w-full transition-all duration-300",
          isScrolled ? "bg-white/80 backdrop-blur-lg shadow-sm" : "bg-white/50"
        )}
      >
        <div className="container px-4 mx-auto sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex-shrink-0">
              {isLoading ? (
                <Skeleton className="h-8 w-36" />
              ) : (
                <Link href="/" className="text-2xl font-bold text-gray-800">
                  <img
                    src="/assets/kelana.webp"
                    width={140}
                    height={32}
                    alt="Kelana Logo"
                  />
                </Link>
              )}
            </div>
            <nav className="items-center hidden px-2 py-2 space-x-1 rounded-full shadow-inner bg-white/60 backdrop-blur-sm md:flex">
              {isLoading ? (
                <>
                  <Skeleton className="w-20 rounded-full h-9" />
                  <Skeleton className="w-24 rounded-full h-9" />
                  <Skeleton className="w-24 rounded-full h-9" />
                  <Skeleton className="w-20 rounded-full h-9" />
                </>
              ) : (
                navItems.map((item) => (
                  <NavLink key={item.label} href={item.path}>
                    {item.label}
                  </NavLink>
                ))
              )}
            </nav>
            <div className="flex items-center gap-2">
              {isLoading ? (
                <Skeleton className="w-10 h-10 rounded-full" />
              ) : (
                <CartButton />
              )}

              <div className="items-center hidden md:flex">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={user ? "profile" : isLoading ? "loading" : "auth"}
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 10, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2 pl-2">
                        <Skeleton className="w-20 h-10 rounded-md" />
                        <Skeleton className="w-24 h-10 rounded-md" />
                      </div>
                    ) : user ? (
                      <ProfileMenu />
                    ) : (
                      <AuthButtons />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="md:hidden">
                {isLoading ? (
                  <Skeleton className="w-10 h-10 rounded-full" />
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    onClick={handleToggleMobileMenu}
                  >
                    <Menu className="w-6 h-6" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
      <MobileMenu />
    </>
  );
};

export default Navbar;
