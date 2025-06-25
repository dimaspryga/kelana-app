"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    LayoutDashboard,
    Users,
    ImageIcon,
    LayoutGrid,
    Folder,
    Ticket,
    FileText,
    Bell,
    PlusCircle
} from 'lucide-react';

// Data untuk item navigasi
const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/users", icon: Users, label: "Users" },
    { href: "/banners", icon: ImageIcon, label: "Banners" },
    { href: "/categories", icon: LayoutGrid, label: "Categories" },
    { href: "/activities", icon: Folder, label: "Activities" },
    { href: "/promos", icon: Ticket, label: "Promos" },
];

const docItems = [
    { href: "/transactions", icon: FileText, label: "Data Order" },
];

export function DashboardSidebar({ activePath }) {
    return (
        <div className="hidden border-r bg-muted/40 md:block">
            <div className="flex flex-col h-full max-h-screen gap-2">
                <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                    <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-600">
                            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="">Kelana Admin</span>
                    </Link>
                </div>
                <div className="flex-1">
                    <nav className="grid items-start px-2 space-y-1 text-sm font-medium lg:px-4">
                        {/* Tombol Quick Create dengan warna biru */}
                        <h2 className="px-3 mb-2 text-xs font-semibold tracking-wider text-gray-500 uppercase">Data Management</h2>

                        {/* Item Navigasi Utama */}
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activePath === item.href;
                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${isActive ? "bg-blue-500 text-white" : ""}`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {item.label}
                                </Link>
                            );
                        })}

                        {/* Pemisah dan Navigasi Dokumen */}
                        <div className="my-4 border-t"></div>
                        <h2 className="px-3 mb-2 text-xs font-semibold tracking-wider text-gray-500 uppercase">Transaction Management</h2>
                        {docItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activePath === item.href;
                            return (
                                <a
                                    key={item.label}
                                    href={item.href}
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${isActive ? "bg-blue-500 text-white" : ""}`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {item.label}
                                </a>
                            );
                        })}
                    </nav>
                </div>
            </div>
        </div>
    );
}
