"use client";

import React from "react";
import { motion } from "framer-motion";
import { useDashboardData } from "@/hooks/useDashboardData";
import { StatCard, OrderChart, RecentOrdersTable } from "@/components/ui/admin/DashboardComponents";
import {
    Users,
    PackageX,
    Hourglass,
    Ticket,
    Gift,
    PackageCheck,
    Frown,
    Image,
    Activity,
} from "lucide-react";
import { IconCategory } from "@tabler/icons-react";

const DashboardPage = () => {
    const { stats, enrichedTransactions, isLoading, error } = useDashboardData();

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <Frown className="w-16 h-16 text-red-500" />
                <h2 className="mt-4 text-2xl font-bold">Failed to Load Dashboard Data</h2>
                <p className="mt-2 text-muted-foreground">{error.message}</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-4 space-y-6 md:p-6"
        >
            <div className="flex flex-col items-start justify-between gap-4 pb-6 border-b md:flex-row md:items-center">
                <div><h1 className="text-3xl font-bold tracking-tight">Dashboard</h1><p className="text-muted-foreground">An overview of your application's performance.</p></div>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard title="Total Users" value={stats.users} icon={Users} isLoading={isLoading} />
                <StatCard title="Total Banners" value={stats.banners} icon={Image} isLoading={isLoading} />
                <StatCard title="Total Categories" value={stats.categories} icon={IconCategory} isLoading={isLoading} />
                <StatCard title="Total Activities" value={stats.activities} icon={Activity} isLoading={isLoading} />
                <StatCard title="Total Promos" value={stats.promos} icon={Ticket} isLoading={isLoading} />
                <StatCard title="Successful Orders" value={stats.SUCCESS} icon={PackageCheck} isLoading={isLoading} />
                <StatCard title="Awaiting Confirmation" value={stats.CONFIRMATION} icon={Hourglass} isLoading={isLoading} />
                <StatCard title="Cancelled Orders" value={stats.CANCELLED} icon={PackageX} isLoading={isLoading} />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                <div className="lg:col-span-3">
                    <OrderChart transactions={enrichedTransactions} isLoading={isLoading} />
                </div>
                <div className="lg:col-span-2">
                    <RecentOrdersTable transactions={enrichedTransactions} isLoading={isLoading} />
                </div>
            </div>
        </motion.div>
    );
};

export default DashboardPage;