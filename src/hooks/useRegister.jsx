// hooks/useRegister.js
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function useRegister() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!role) {
      toast.warning("Please select a role.");
      setLoading(false);
      return;
    }

    if (!password || !confirmPassword) {
      toast.error("Password and Confirm Password are required.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Password and Confirm Password do not match.");
      setLoading(false);
      return;
    }

    const payload = {
      name,
      email,
      password,
      passwordRepeat: confirmPassword,
      phoneNumber,
      role,
    };

    try {
      const response = await axios.post("/api/register", payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      toast.success(
        response.data.message || "Register successful! Redirecting..."
      );
      setTimeout(() => {
        router.push("/");
      }, 3000);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Terjadi kesalahan saat register";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    name,
    setName,
    phoneNumber,
    setPhoneNumber,
    role,
    setRole,
    loading,
    handleRegister,
  };
}