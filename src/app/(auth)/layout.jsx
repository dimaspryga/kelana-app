import { Toaster } from "sonner";

export default function AuthLayout({ children }) {
  return (
    <>
      {children}
      <Toaster richColors position="top-center" duration={3000} />
    </>
    
  );
}
