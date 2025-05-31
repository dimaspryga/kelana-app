'use client';

import { useEffect, useState } from "react";
import { getCookie} from "cookies-next";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);


  useEffect(() => {
    const token = getCookie("token");
    setIsLoggedIn(!!token);
  }, []);


  return (
    <main>

    </main>
  );
}
