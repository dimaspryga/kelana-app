// components/Navbar.jsx
"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavbar } from "@/hooks/useNavbar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const MOBILE_HEADER_HEIGHT_PX = 70;

const Navbar = () => {
  const {
    isLoggedIn,
    userRole,
    userName,
    profilePictureUrl,
    hasMounted,
    isMobileMenuOpen,
    isSearchOpen,
    searchInputRef,
    searchContainerRef,
    handleLogout,
    handleMobileLinkClick,
    handleToggleMobileMenu,
    handleToggleSearch,
    navItems,
    router,
  } = useNavbar();

  const searchInputVariants = {
    hidden: { opacity: 0, width: "0px", x: "100%" },
    visible: {
      opacity: 1,
      width: "256px",
      x: "0%",
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      width: "0px",
      x: "100%",
      transition: { duration: 0.2, ease: "easeIn" },
    },
  };

  const mobileMenuDropdownVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.2, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.15, ease: "easeIn" },
    },
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  };

  const iconVariants = {
    initial: { opacity: 0, scale: 0.85 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.15, ease: "easeInOut" },
    },
    exit: {
      opacity: 0,
      scale: 0.85,
      transition: { duration: 0.15, ease: "easeInOut" },
    },
  };

  const AuthButtons = ({ isMobile = false }) => (
    <div className={isMobile ? "w-full space-y-2" : "space-x-2"}>
      <Button
        variant="outline"
        className={isMobile ? "w-full justify-start py-2.5" : ""}
        onClick={() => {
          isMobile ? handleMobileLinkClick("/login") : router.push("/login");
        }}
      >
        Login
      </Button>
      <Button
        className={isMobile ? "w-full justify-start py-2.5" : ""}
        onClick={() => {
          isMobile
            ? handleMobileLinkClick("/register")
            : router.push("/register");
        }}
      >
        Register
      </Button>
    </div>
  );

  return (
    <>
      {/* Navbar Utama untuk Desktop */}
      <nav
        className="sticky top-0 z-30 bg-white shadow-md hidden md:flex"
        style={{ height: `${MOBILE_HEADER_HEIGHT_PX}px` }}
      >
        <div className="container mx-auto px-4 h-full flex justify-between items-center">
          <div className="flex-shrink-0">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                router.push("/");
              }}
              className="text-2xl font-bold text-gray-800 cursor-pointer"
            >
              <img src="/assets/kelana.webp" width={150} height={38} />
            </a>
          </div>
          <div className="flex flex-grow justify-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.path}
                onClick={(e) => {
                  e.preventDefault();
                  router.push(item.path);
                }}
                className="text-gray-600 hover:text-gray-900 font-medium transition duration-300"
              >
                {item.label}
              </a>
            ))}
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div
              className="relative flex items-center"
              ref={searchContainerRef}
            >
              <AnimatePresence initial={false}>
                {isSearchOpen && (
                  <motion.div
                    variants={searchInputVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <Input
                      type="text"
                      ref={searchInputRef}
                      placeholder="Search..."
                      className="mr-2"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleSearch}
                aria-label="Toggle Search"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  ></path>
                </svg>
              </Button>
            </div>
            <Button variant="ghost" size="icon" aria-label="Shopping Cart">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                ></path>
              </svg>
            </Button>
            {!hasMounted ? (
              <div className="space-x-2">
                {" "}
                <Button variant="outline" disabled>
                  Login
                </Button>{" "}
                <Button disabled>Register</Button>{" "}
              </div>
            ) : !isLoggedIn ? (
              <AuthButtons />
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-auto px-2 rounded-full flex items-center"
                  >
                    <img
                      src={profilePictureUrl}
                      alt="User Avatar"
                      className="w-8 h-8 rounded-full border-2 border-blue-500"
                    />
                  </Button>

                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48" align="end" forceMount>
                  <DropdownMenuLabel className="truncate">
                    {userName || "User"}
                  </DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => {
                      router.push("/profile");
                    }}
                  >
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      router.push("/profile/edit");
                    }}
                  >
                    Edit Profile
                  </DropdownMenuItem>
                  {userRole === "admin" && (
                    <>
                      {" "}
                      <DropdownMenuSeparator />{" "}
                      <DropdownMenuItem
                        className="font-bold"
                        onClick={() => router.push("/admin/dashboard")}
                      >
                        Dashboard
                      </DropdownMenuItem>{" "}
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 focus:bg-red-50 focus:text-red-700"
                    onClick={handleLogout}
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </nav>

      <div
        className="md:hidden fixed top-0 left-0 right-0 bg-white shadow-md z-[60] flex items-center justify-between px-4"
        style={{ height: `${MOBILE_HEADER_HEIGHT_PX}px` }}
      >
        <div className="flex-shrink-0">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              router.push("/");
            }}
            className="text-2xl font-bold text-gray-800 cursor-pointer"
          >
            <img src="/assets/kelana.webp" width={130} height={28} />
          </a>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleMobileMenu}
          aria-label={
            isMobileMenuOpen ? "Close mobile menu" : "Open mobile menu"
          }
        >
          <AnimatePresence initial={false} mode="wait">
            {isMobileMenuOpen ? (
              <motion.svg
                key="x-icon"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                variants={iconVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </motion.svg>
            ) : (
              <motion.svg
                key="hamburger-icon"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                variants={iconVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </motion.svg>
            )}
          </AnimatePresence>
        </Button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleToggleMobileMenu}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed left-0 w-screen bg-white shadow-xl z-[55] md:hidden flex flex-col"
            style={{
              originX: 1,
              originY: 0,
              top: `${MOBILE_HEADER_HEIGHT_PX}px`,
              height: `calc(100vh - ${MOBILE_HEADER_HEIGHT_PX}px)`,
            }}
            variants={mobileMenuDropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="flex-grow overflow-y-auto px-4 py-4 space-y-2">
              <div className="mb-4">
                <Input type="text" placeholder="Search..." className="w-full" />
              </div>
              <hr className="my-2" />

              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.path}
                  onClick={(e) => {
                    e.preventDefault();
                    handleMobileLinkClick(item.path);
                  }}
                  className="block py-2.5 text-gray-700 hover:bg-gray-100 active:bg-gray-200 px-2 rounded-md transition-colors duration-150"
                >
                  {item.label}
                </a>
              ))}

              <hr className="my-2" />
              {!hasMounted ? (
                <AuthButtons isMobile={true} />
              ) : !isLoggedIn ? (
                <AuthButtons isMobile={true} />
              ) : (
                <div className="mt-2">
                  {" "}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full flex justify-between items-center text-left py-2.5 px-2 rounded-md group"
                      >
                        <div className="flex items-center">
                          <img
                            src={profilePictureUrl}
                            alt="User Avatar"
                            className="w-8 h-8 rounded-full border-2 border-blue-500 mr-2"
                          />
                          {userName && (
                            <span className="font-medium truncate">
                              {userName}
                            </span>
                          )}
                        </div>
                        <svg
                          className="h-4 w-4 shrink-0 opacity-50 transition-transform duration-200 group-data-[state=open]:rotate-180"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          ></path>
                        </svg>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="rounded-md shadow-lg bg-popover text-popover-foreground z-[70] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 p-1.5 min-w-[var(--radix-dropdown-menu-trigger-width)]"
                      side="bottom"
                      align="stretch"
                      sideOffset={6}
                      collisionPadding={10}
                      forceMount
                    >
                      <DropdownMenuLabel className="font-semibold px-2 py-1.5 border-b border-border mb-1 truncate">
                        {userName || "User"}
                      </DropdownMenuLabel>
                      <DropdownMenuItem
                        className="px-2 py-1.5"
                        onClick={() => {
                          handleMobileLinkClick("/profile");
                        }}
                      >
                        My Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="px-2 py-1.5"
                        onClick={() => {
                          handleMobileLinkClick("/profile/edit");
                        }}
                      >
                        Edit Profile
                      </DropdownMenuItem>
                      {userRole === "admin" && (
                        <>
                          {" "}
                          <DropdownMenuSeparator />{" "}
                          <DropdownMenuItem
                            className="font-bold px-2 py-1.5"
                            onClick={() => {
                              handleMobileLinkClick("/admin/dashboard");
                            }}
                          >
                            Dashboard
                          </DropdownMenuItem>{" "}
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="px-2 py-1.5 text-red-600 focus:bg-red-50 focus:text-red-700"
                        onClick={handleLogout}
                      >
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;