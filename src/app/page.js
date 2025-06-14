"use client";

import { useEffect, useState } from "react";
import { getCookie } from "cookies-next";
import { useBanner } from "@/hooks/useBanner";
import { useCategory } from "@/hooks/useCategory";
import { useActivity } from "@/hooks/useActivity";
import { usePromo } from "@/hooks/usePromo";
import { usePaymentMethod } from "@/hooks/usePaymentMethod";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { banner } = useBanner();
  const { category } = useCategory();
  const { activity } = useActivity();
  const { promo } = usePromo();
  const { paymentMethod } = usePaymentMethod();

  useEffect(() => {
    const token = getCookie("token");
    setIsLoggedIn(!!token);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-6 md:p-10">
      <h1 className="text-3xl font-bold">Home Page</h1>
    </div>
  );
}
