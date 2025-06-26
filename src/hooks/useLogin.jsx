import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { setCookie } from "cookies-next";
import { toast } from "sonner";

export const useLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const router = useRouter();

  const handleChangeEmail = (e) => setEmail(e.target.value);
  const handleChangePassword = (e) => setPassword(e.target.value);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      toast.success("Login berhasil! Redirecting...");

      setCookie("token", data.token, {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        path: "/",
      });

      setTimeout(() => {
        router.push(window.location.reload("/"));
      }, 2000);
    } catch (err) {
      toast.error(err.message);
      setError(err.message);
    }
  };

  return {
    email,
    password,
    handleChangeEmail,
    handleChangePassword,
    handleLogin,
    error,
    success,
  };
};
