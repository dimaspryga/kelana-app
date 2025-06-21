"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

// Helper hook untuk mengelola menu mobile
const useMobileMenu = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMobileMenuOpen]);

  return { isMobileMenuOpen, toggleMobileMenu, setIsMobileMenuOpen };
};

// Helper hook untuk mengelola fungsi pencarian
const useSearch = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);

  const toggleSearch = useCallback(() => {
    setIsSearchOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    const handleClickOutsideSearch = (event) => {
      if (
        isSearchOpen &&
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutsideSearch);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideSearch);
    };
  }, [isSearchOpen]);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  return { isSearchOpen, toggleSearch, searchInputRef, searchContainerRef, setIsSearchOpen };
};

export const useNavbar = () => {
  const router = useRouter();
  // Gunakan useAuth untuk mendapatkan semua data dan fungsi
  const { user, logout, loading } = useAuth();
  
  const { isMobileMenuOpen, toggleMobileMenu, setIsMobileMenuOpen } = useMobileMenu();
  const { isSearchOpen, toggleSearch, searchInputRef, searchContainerRef, setIsSearchOpen } = useSearch();

  const handleMobileLinkClick = useCallback(
    (path) => {
      setIsMobileMenuOpen(false);
      if (path) {
        if (path.startsWith("#")) {
          const targetElement = document.querySelector(path);
          if (targetElement) {
            targetElement.scrollIntoView({ behavior: "smooth" });
          } else {
            router.push(path);
          }
        } else {
          router.push(path);
        }
      }
    },
    [router, setIsMobileMenuOpen]
  );

  const handleToggleMobileMenu = useCallback(() => {
    toggleMobileMenu();
    setIsSearchOpen(false);
  }, [toggleMobileMenu, setIsSearchOpen]);

  const handleToggleSearch = useCallback(() => {
    toggleSearch();
    setIsMobileMenuOpen(false);
  }, [toggleSearch, setIsMobileMenuOpen]);

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Category", path: "/category" },
    { label: "Activities", path: "/activities" },
    { label: "Promo", path: "/promo" },
  ];

  // Ambil data langsung dari state `user` di AuthContext
  const isLoggedIn = !!user;
  const userRole = user?.role || null;
  const userName = user?.name || null;
  const profilePictureUrl = user?.profilePictureUrl || "/Assets/avatar.png";

  return {
    isLoggedIn,
    userRole,
    userName,
    profilePictureUrl,
    hasMounted: !loading,
    isMobileMenuOpen,
    isSearchOpen,
    searchInputRef,
    searchContainerRef,
    handleLogout: logout,
    handleMobileLinkClick,
    handleToggleMobileMenu,
    handleToggleSearch,
    navItems,
    router,
  };
};
