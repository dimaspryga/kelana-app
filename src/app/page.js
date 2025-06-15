"use client";

import { useEffect, useState } from "react";
import { getCookie } from "cookies-next";
import HeroSection from "@/components/home/HeroSection";
import PromoSection from "@/components/home/PromoSection";
import CategorySection from "@/components/home/CategorySection";
import ActivitySection from "@/components/home/ActivitySection";
import BannerSection from "@/components/home/BannerSection";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = getCookie("token");
    setIsLoggedIn(!!token);
  }, []);

  return (
    <main>
      <HeroSection />
      <CategorySection />
      <BannerSection />
      <PromoSection />
      <ActivitySection />
    </main>
  );
}
