'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useNavbar } from "@/hooks/useNavbar";
import { useCart } from "@/hooks/useCart"; // Mengambil data dari CartContext via hook ini
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
import { ShoppingCart, X, Menu, User, LogOut, LayoutDashboard, Ticket, Loader2 } from "lucide-react";

// Helper function
const formatCurrency = (amount) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

// Komponen NavLink dengan efek "active"
const NavLink = ({ href, children }) => {
    const pathname = usePathname();
    const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));

    return (
        <Link 
            href={href} 
            className={cn(
                "relative px-3 py-2 text-sm font-medium transition-colors duration-300",
                isActive ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
            )}
        >
            {children}
            {isActive && (
                <motion.span 
                    layoutId="underline"
                    className="absolute bottom-[-2px] left-0 block w-full h-0.5 bg-blue-600 rounded-full"
                />
            )}
        </Link>
    );
};


const Navbar = () => {
  const {
    isLoggedIn,
    userRole,
    userName,
    profilePictureUrl,
    hasMounted,
    isMobileMenuOpen,
    handleLogout,
    handleToggleMobileMenu,
    handleMobileLinkClick,
    navItems,
  } = useNavbar();
  
  // Data diambil dari CartContext melalui hook useCart
  const { cartItems, cartCount, isLoading: isCartLoading } = useCart();
  const router = useRouter();

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const mobileMenuVariants = {
    hidden: { x: '100%' },
    visible: { x: '0%', transition: { type: 'spring', stiffness: 300, damping: 30 } },
    exit: { x: '100%', transition: { type: 'easeOut', duration: 0.3 } },
  };

  const MobileMenu = () => (
    <AnimatePresence>
        {isMobileMenuOpen && (
            <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleToggleMobileMenu} className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden" />
                <motion.div variants={mobileMenuVariants} initial="hidden" animate="visible" exit="exit" className="fixed top-0 right-0 z-50 w-4/5 h-full max-w-xs bg-white shadow-lg md:hidden">
                    <div className="flex items-center justify-between p-4 border-b"><span className="text-lg font-bold">Menu</span><Button variant="ghost" size="icon" onClick={handleToggleMobileMenu}><X className="w-5 h-5"/></Button></div>
                    <div className="p-4 flex flex-col h-[calc(100%-65px)]">
                        <nav className="flex flex-col gap-2">{navItems.map(item => (<Link key={item.label} href={item.path} onClick={() => handleMobileLinkClick(item.path)} className="p-3 text-base font-medium text-gray-700 rounded-md hover:bg-gray-100">{item.label}</Link>))}</nav>
                        <div className="pt-4 mt-auto border-t">
                            {!isLoggedIn ? (
                                <div className="space-y-2">
                                    <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => handleMobileLinkClick('/login')}>Login</Button>
                                    <Button variant="outline" className="w-full" onClick={() => handleMobileLinkClick('/register')}>Register</Button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center p-2 mb-4"><Avatar className="w-10 h-10 mr-3"><AvatarImage src={profilePictureUrl} alt={userName} /><AvatarFallback>{userName.charAt(0)}</AvatarFallback></Avatar><p className="font-semibold truncate">{userName}</p></div>
                                    <Button variant="ghost" className="justify-start w-full text-red-600 hover:bg-red-50 hover:text-red-700" onClick={handleLogout}><LogOut className="w-4 h-4 mr-2"/> Logout</Button>
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
      <header className={cn( "fixed top-0 z-30 w-full transition-all duration-300", isScrolled ? "bg-white/80 backdrop-blur-lg shadow-sm" : "bg-white/50" )}>
        <div className="container px-4 mx-auto sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex-shrink-0">
              <Link href="/" className="text-2xl font-bold text-gray-800"><img src="/assets/kelana.webp" width={140} height={32} alt="Kelana Logo"/></Link>
            </div>
            <nav className="items-center hidden px-4 py-2 space-x-2 rounded-full shadow-inner md:flex bg-white/60 backdrop-blur-sm">
                {navItems.map((item) => (<NavLink key={item.label} href={item.path}>{item.label}</NavLink>))}
            </nav>
            <div className="flex items-center gap-2">
                
                <HoverCard openDelay={200} closeDelay={100}>
                  <HoverCardTrigger asChild>
                    <div className="relative">
                        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.push('/cart')}>
                            <ShoppingCart className="w-5 h-5"/>
                        </Button>
                        {hasMounted && isLoggedIn && cartCount > 0 && (
                            <span className="absolute flex items-center justify-center w-5 h-5 text-xs text-white bg-blue-600 rounded-full -top-1 -right-1 ring-2 ring-white">
                                {cartCount}
                            </span>
                        )}
                    </div>
                  </HoverCardTrigger>
                  {hasMounted && isLoggedIn && (
                    <HoverCardContent className="p-4 w-80" align="end">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="font-semibold">Shopping cart</h4>
                                <p className="text-sm text-muted-foreground">{cartCount} Item</p>
                            </div>
                            <div className="pr-2 space-y-3 overflow-y-auto max-h-60">
                                {isCartLoading ? (
                                    <div className="flex items-center justify-center p-4"><Loader2 className="w-5 h-5 animate-spin"/></div>
                                ) : cartItems.length > 0 ? (
                                    cartItems.slice(0, 5).map(item => (
                                        <div key={item.id} className="flex items-center gap-3">
                                            <img src={item.activity?.imageUrls[0]} alt={item.activity?.title} className="object-cover w-12 h-12 rounded-md"/>
                                            <div className="flex-grow overflow-hidden">
                                                <p className="text-sm font-medium truncate">{item.activity?.title}</p>
                                                <p className="text-xs text-muted-foreground">{item.quantity} x {formatCurrency(item.activity?.price)}</p>
                                            </div>
                                            <p className="text-sm font-semibold">{formatCurrency(item.activity?.price * item.quantity)}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="py-4 text-sm text-center text-muted-foreground">Your cart is empty.</p>
                                )}
                            </div>
                            {cartItems.length > 0 && (
                                <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => router.push('/cart')}>View Cart</Button>
                            )}
                        </div>
                    </HoverCardContent>
                  )}
                </HoverCard>

                <div className="md:hidden"><Button variant="ghost" size="icon" className="rounded-full" onClick={handleToggleMobileMenu}><Menu className="w-6 h-6"/></Button></div>
                <div className="items-center hidden gap-2 pl-2 md:flex">
                    {!hasMounted ? (<div className="flex gap-2"><Skeleton className="w-20 h-10"/><Skeleton className="w-24 h-10"/></div>
                    ) : !isLoggedIn ? (<><Button variant="outline" onClick={() => router.push('/login')}>Login</Button><Button className="bg-blue-600 hover:bg-blue-700" onClick={() => router.push('/register')}>Register</Button></>
                    ) : (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" className="relative rounded-full h-11 w-11"><Avatar className="border-2 border-blue-500 h-11 w-11"><AvatarImage src={profilePictureUrl} alt={userName} /><AvatarFallback>{userName.charAt(0)}</AvatarFallback></Avatar></Button></DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount><DropdownMenuLabel className="font-normal"><div className="flex flex-col space-y-1"><p className="text-sm font-medium leading-none">Signed in as</p><p className="text-xs leading-none truncate text-muted-foreground">{userName}</p></div></DropdownMenuLabel><DropdownMenuSeparator /><DropdownMenuItem onClick={() => router.push('/profile')}><User className="w-4 h-4 mr-2"/> My Profile</DropdownMenuItem><DropdownMenuItem onClick={() => router.push('/transaction')}><Ticket className="w-4 h-4 mr-2"/> My Transactions</DropdownMenuItem>{userRole === 'admin' && (<DropdownMenuItem onClick={() => router.push('/admin/dashboard')}><LayoutDashboard className="w-4 h-4 mr-2"/> Dashboard</DropdownMenuItem>)}<DropdownMenuSeparator /><DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:bg-red-50 focus:text-red-700"><LogOut className="w-4 h-4 mr-2"/> Logout</DropdownMenuItem></DropdownMenuContent>
                        </DropdownMenu>
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