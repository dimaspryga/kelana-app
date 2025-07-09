"use client"

import * as React from "react"
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react"
import Link from "next/link"
import {
  LayoutDashboard,
  Users,
  ImageIcon,
  LayoutGrid,
  Folder,
  Ticket,
  FileText,
  Settings,
  LogOut,
  User,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"
import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { useAuth } from "@/context/AuthContext"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: IconDashboard,
    },
    {
      title: "Lifecycle",
      url: "#",
      icon: IconListDetails,
    },
    {
      title: "Analytics",
      url: "#",
      icon: IconChartBar,
    },
    {
      title: "Projects",
      url: "#",
      icon: IconFolder,
    },
    {
      title: "Team",
      url: "#",
      icon: IconUsers,
    },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: IconCamera,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: IconFileDescription,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: IconFileAi,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
  documents: [
    {
      name: "Data Library",
      url: "#",
      icon: IconDatabase,
    },
    {
      name: "Reports",
      url: "#",
      icon: IconReport,
    },
    {
      name: "Word Assistant",
      url: "#",
      icon: IconFileWord,
    },
  ],
}

const navGroups = [
  {
    label: "DATA MANAGEMENT",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Users", href: "/users", icon: Users },
      { label: "Banners", href: "/banners", icon: ImageIcon },
      { label: "Categories", href: "/categories", icon: LayoutGrid },
      { label: "Activities", href: "/activities", icon: Folder },
      { label: "Promos", href: "/promos", icon: Ticket },
    ],
  },
  {
    label: "TRANSACTION MANAGEMENT",
    items: [
      { label: "Data Order", href: "/transactions", icon: FileText },
    ],
  },
];

export function AppSidebar({ activePath }) {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <aside className="bg-white border-r border-slate-200 w-64 lg:w-64 md:w-56 sm:w-48 min-h-screen flex flex-col flex-shrink-0 shadow-sm">
      <div className="flex items-center gap-2 h-16 px-6 border-b border-slate-200 bg-white">
        <LayoutDashboard className="h-6 w-6 text-blue-600" />
        <span className="text-lg font-bold text-blue-700 tracking-tight">Kelana Admin</span>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 bg-white">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-2">
            <div className="uppercase text-xs text-slate-400 font-bold tracking-wider px-4 mt-6 mb-2">
              {group.label}
            </div>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const isActive = typeof window !== 'undefined' && window.location.pathname.startsWith(item.href);
                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200 font-medium ${
                        isActive
                          ? "bg-blue-50 text-blue-700 font-semibold border-r-2 border-blue-600"
                          : "text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                      }`}
                    >
                      <item.icon className={`h-5 w-5 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="mt-auto border-t border-slate-200 p-4 bg-white">
        <Link
          href="/admin-profile"
          className="flex items-center gap-3 w-full px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors duration-200"
        >
          <User className="h-5 w-5 text-slate-400" />
          <span className="truncate">Profile</span>
        </Link>
        <Link
          href="/admin/settings"
          className="flex items-center gap-3 w-full px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors duration-200 mt-2"
        >
          <Settings className="h-5 w-5 text-slate-400" />
          <span className="truncate">Settings</span>
        </Link>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-50 hover:text-red-600 transition-colors duration-200 mt-2"
        >
          <LogOut className="h-5 w-5 text-slate-400" />
          <span className="truncate">Logout</span>
        </button>
      </div>
    </aside>
  );
}
