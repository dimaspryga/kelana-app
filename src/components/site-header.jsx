import { LayoutDashboard, User, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import { useGetLoggedUser } from "@/hooks/useGetLoggedUser";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function SiteHeader() {
  const { user, isLoading } = useGetLoggedUser();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white border-b border-slate-200 flex items-center px-6 h-16 w-full shadow-sm">
      {/* Breadcrumb only */}
      <nav className="flex items-center gap-2 text-slate-400 text-sm" aria-label="Breadcrumb">
        <LayoutDashboard className="h-5 w-5 text-blue-600" />
        <span className="text-slate-300">/</span>
        <span className="text-slate-600 font-medium">Dashboard</span>
      </nav>
      
      {/* User profile dropdown on the right */}
      <div className="ml-auto flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
                  {isLoading ? 'A' : user?.name?.charAt(0)?.toUpperCase() || 'A'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {isLoading ? 'Loading...' : user?.name || 'Admin User'}
                </p>
                <p className="text-xs leading-none text-slate-500">
                  {isLoading ? 'loading@example.com' : user?.email || 'admin@example.com'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin-profile" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/settings" className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
