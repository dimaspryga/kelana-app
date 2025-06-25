"use client";

import React, { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from '@/components/ui/button';
import { ArrowUpRight } from 'lucide-react';

// --- Komponen Kartu Statistik ---
export const StatCard = ({ title, value, icon: Icon, isLoading }) => {
    if (isLoading) {
        return (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <Skeleton className="w-24 h-5" />
                    <Skeleton className="w-6 h-6 rounded-full" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="w-16 h-8 mt-1" />
                </CardContent>
            </Card>
        );
    }
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
            </CardContent>
        </Card>
    );
};

export const OrderChart = ({ transactions, isLoading }) => {
    const chartData = useMemo(() => {
        if (!transactions || transactions.length === 0) return [];
        const currentYear = new Date().getFullYear();
        const monthlyOrders = Array.from({ length: 12 }, (_, i) => ({
            month: new Date(currentYear, i).toLocaleString('en-US', { month: 'short' }),
            orders: 0
        }));
        transactions.forEach(t => {
            const date = new Date(t.orderDate);
            if (date.getFullYear() === currentYear) {
                monthlyOrders[date.getMonth()].orders += 1;
            }
        });
        return monthlyOrders;
    }, [transactions]);

    const chartConfig = { orders: { label: "Orders", color: "hsl(var(--primary))" } };

    if (isLoading) return <Skeleton className="w-full h-[350px]" />;
    return (
        <Card>
            <CardHeader>
                <CardTitle>Yearly Order Trend</CardTitle>
                <CardDescription>Total orders received each month this year.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="aspect-auto h-[330px] w-full">
                    <AreaChart data={chartData} margin={{ left: 12, right: 12 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                        <defs>
                            <linearGradient id="fillOrders" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <Area dataKey="orders" type="natural" fill="url(#fillOrders)" stroke="var(--color-primary)" stackId="a" />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
};

export const RecentOrdersTable = ({ transactions, isLoading }) => {
    const statusConfig = {
        UNPAID: { label: "Waiting Payment", className: "bg-gray-100 text-gray-800" },
        CONFIRMATION: { label: "Confirming", className: "bg-blue-100 text-blue-800" },
        SUCCESS: { label: "Success", className: "bg-green-100 text-green-800" },
        CANCELLED: { label: "Cancelled", className: "bg-red-100 text-red-800" },
        FAILED: { label: "Failed", className: "bg-destructive/10 text-destructive" },
    };

    const recentTransactions = useMemo(() => {
        if (!transactions || transactions.length === 0) return [];
        return transactions.slice(0, 5);
    }, [transactions]);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center">
                <div className="grid gap-2"><CardTitle>Recent Orders</CardTitle><CardDescription>The last 5 transactions in the system.</CardDescription></div>
                <Button asChild size="sm" className="gap-1 ml-auto"><a href="/transactions">View All<ArrowUpRight className="w-4 h-4" /></a></Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader><TableRow><TableHead>Customer</TableHead><TableHead className="hidden sm:table-cell">Status</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, index) => (
                                <TableRow key={index}><TableCell><Skeleton className="w-24 h-5" /></TableCell><TableCell className="hidden sm:table-cell"><Skeleton className="w-20 h-6" /></TableCell><TableCell className="text-right"><Skeleton className="w-24 h-5 ml-auto" /></TableCell></TableRow>
                            ))
                        ) : recentTransactions.length > 0 ? (
                            recentTransactions.map((t) => {
                                const currentStatus = statusConfig[t.displayStatus] || { label: t.status, className: "bg-gray-100" };
                                return (
                                    <TableRow key={t.id}>
                                        <TableCell>
                                            <div className="font-medium">{t.user?.name || 'Deleted User'}</div>
                                            <div className="hidden text-sm text-muted-foreground md:inline">{t.user?.email || 'N/A'}</div>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell"><Badge className={currentStatus.className} variant="outline">{currentStatus.label}</Badge></TableCell>
                                        <TableCell className="font-medium text-right">{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(t.totalAmount)}</TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow><TableCell colSpan={3} className="h-24 text-center">No recent orders.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
