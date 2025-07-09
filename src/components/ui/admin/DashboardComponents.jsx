"use client";

import React, { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
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
import { ArrowUpRight, TrendingUp, TrendingDown } from 'lucide-react';
import Link from "next/link";

// --- Komponen Kartu Statistik ---
export const StatCard = ({ title, value, icon: Icon, isLoading, trend, trendValue }) => {
    if (isLoading) {
        return (
            <Card className="border border-slate-200 bg-white rounded-xl shadow-sm p-6">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-base font-semibold text-blue-900">
                        <Skeleton className="h-4 w-24" />
                    </CardTitle>
                    <Skeleton className="h-5 w-5 rounded" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-4 w-20 mt-1" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border border-slate-200 bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-semibold text-blue-900">
                    {title}
                </CardTitle>
                <Icon className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-blue-900">{value}</div>
                {trend && (
                    <div className="flex items-center text-sm mt-1">
                        {trend === "up" ? (
                            <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                        ) : (
                            <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                        )}
                        <span className={trend === "up" ? "text-green-600" : "text-red-600"}>
                            {trendValue}
                        </span>
                    </div>
                )}
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

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-[300px] w-full" />
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={chartData}>
                <defs>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                    dataKey="month" 
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                />
                <Area 
                    type="monotone"
                    dataKey="orders"
                    stroke="hsl(var(--primary))"
                    fill="url(#colorOrders)"
                    strokeWidth={2}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
};

export const RecentOrdersTable = ({ transactions, isLoading }) => {
    if (isLoading) {
        return (
            <Card className="border border-slate-200 bg-white rounded-xl shadow-sm">
                <CardHeader className="bg-white border-b border-slate-100">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent className="p-0">
                    <div className="p-6">
                        <Skeleton className="h-[300px] w-full" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { label: "Pending", variant: "secondary", className: "bg-yellow-100 text-yellow-900 border-yellow-200" },
            confirmed: { label: "Confirmed", variant: "secondary", className: "bg-blue-100 text-blue-900 border-blue-200" },
            completed: { label: "Completed", variant: "secondary", className: "bg-green-100 text-green-900 border-green-200" },
            cancelled: { label: "Cancelled", variant: "secondary", className: "bg-red-100 text-red-900 border-red-200" },
        };

        const config = statusConfig[status] || statusConfig.pending;

        return (
            <Badge variant={config.variant} className={config.className}>
                {config.label}
            </Badge>
        );
    };

    return (
        <Card className="border border-slate-200 bg-white rounded-xl shadow-sm">
            <CardHeader className="bg-white border-b border-slate-100">
                <CardTitle className="text-xl font-semibold text-blue-900">Recent Transactions</CardTitle>
                <CardDescription className="text-slate-600">
                    Latest transactions from your customers
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="font-semibold text-blue-900">Customer</TableHead>
                            <TableHead className="font-semibold text-blue-900">Activity</TableHead>
                            <TableHead className="font-semibold text-blue-900">Amount</TableHead>
                            <TableHead className="font-semibold text-blue-900">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions?.slice(0, 5).map((transaction) => (
                            <TableRow key={transaction.id}>
                                <TableCell>
                                    <div className="flex items-center space-x-3">
                                        <Skeleton className="h-12 w-12 rounded-full" />
                                        <div>
                                            <Skeleton className="h-4 w-[150px]" />
                                            <Skeleton className="h-4 w-[100px]" />
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="font-medium">{transaction.activity?.title || "N/A"}</TableCell>
                                <TableCell>Rp {transaction.totalAmount?.toLocaleString() || "0"}</TableCell>
                                <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <div className="p-4 border-t border-slate-100">
                    <Button asChild size="sm" variant="outline">
                        <Link href="/transactions">
                            View all transactions
                            <ArrowUpRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
