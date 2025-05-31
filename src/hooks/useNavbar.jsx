import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { getCookie, deleteCookie } from "cookies-next";

const TOKEN_KEY = "token";
const API_BASE_URL = "https://travel-journal-api-bootcamp.do.dibimbing.id/api/v1";
const API_KEY = "24405e01-fbc1-45a5-9f5a-be13afcd757c";

const useAuthInfo = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [authInfo, setAuthInfo] = useState({
    isLoggedIn: false,
    userRole: null,
    userName: null,
    profilePictureUrl: null,
  });
  const [hasMounted, setHasMounted] = useState(false);

  const getUserInfoFromToken = useCallback(async () => {
    const token = getCookie(TOKEN_KEY);
    if (!token) {
      return {
        isLoggedIn: false,
        userRole: null,
        userName: null,
        profilePictureUrl: null,
      };
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/user`, {
        headers: {
          apiKey: API_KEY,
          Authorization: `Bearer ${token}`,
        },
      });

      const userData = response.data.data;
      return {
        isLoggedIn: true,
        userRole: userData.role || "user",
        userName: userData.name || userData.email || "Pengguna",
        profilePictureUrl: userData.profilePictureUrl || "/Assets/avatar.png",
      };
    } catch (error) {
      console.error("Error fetching user info:", error);
      deleteCookie(TOKEN_KEY);
      return {
        isLoggedIn: false,
        userRole: null,
        userName: null,
        profilePictureUrl: null,
      };
    }
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await axios.get(`${API_BASE_URL}/logout`, {
        headers: {
          Authorization: `Bearer ${getCookie("token")}`,
          apiKey: API_KEY,
        },
      });

      deleteCookie("token");
      toast.success("Logout berhasil!");

      setTimeout(() => {
        router.push("/");
      }, 2000);

      setAuthInfo({
        isLoggedIn: false,
        userRole: null,
        userName: null,
        profilePictureUrl: null,
      });
    } catch (error) {
      toast.error("Logout gagal. Coba lagi.");
    }
  }, [router]);

  useEffect(() => {
    setHasMounted(true);
    const fetchAndSetUserInfo = async () => {
      setAuthInfo(await getUserInfoFromToken());
    };
    fetchAndSetUserInfo();
  }, [getUserInfoFromToken]);

  useEffect(() => {
    if (hasMounted) {
      const fetchAndSetUserInfo = async () => {
        setAuthInfo(await getUserInfoFromToken());
      };
      fetchAndSetUserInfo();
    }
  }, [pathname, hasMounted, getUserInfoFromToken]);

  return { authInfo, handleLogout, hasMounted };
};

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
  const { authInfo, handleLogout, hasMounted } = useAuthInfo();
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
    { label: "Banner", path: "/banner" },
    { label: "Category", path: "/category" },
    { label: "Activities", path: "/activities" },
    { label: "Promo", path: "/promo" },
  ];

  const { isLoggedIn, userRole, userName, profilePictureUrl } = authInfo;

  return {
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
  };
};