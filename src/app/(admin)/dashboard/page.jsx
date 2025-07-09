"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useActivity } from "@/hooks/useActivity";
import { useAllUsers } from "@/hooks/useAllUsers";
import { useAllTransactions } from "@/hooks/useAllTransactions";
import { useCategory } from "@/hooks/useCategory";
import { usePromo } from "@/hooks/usePromo";
import { useBanner } from "@/hooks/useBanner";
import {
  Users,
  Activity,
  FileText,
  LayoutGrid,
  Ticket,
  ImageIcon,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Eye,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

const DashboardPage = () => {
  const { activity: activities, isLoading: isActivitiesLoading } = useActivity();
  const { users, isLoading: isUsersLoading } = useAllUsers();
  const { transactions, isLoading: isTransactionsLoading } = useAllTransactions();
  const { category: categories, isLoading: isCategoriesLoading } = useCategory();
  const { promo: promos, isLoading: isPromosLoading } = usePromo();
  const { banner: banners, isLoading: isBannersLoading } = useBanner();

  const isLoading = isActivitiesLoading || isUsersLoading || isTransactionsLoading || 
                   isCategoriesLoading || isPromosLoading || isBannersLoading;

  const stats = [
    {
      title: "Total Users",
      value: users?.length || 0,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      borderColor: "border-blue-200",
    },
    {
      title: "Total Activities",
      value: activities?.length || 0,
      icon: Activity,
      color: "text-green-600",
      bgColor: "bg-green-100",
      borderColor: "border-green-200",
    },
    {
      title: "Total Transactions",
      value: transactions?.length || 0,
      icon: FileText,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      borderColor: "border-purple-200",
    },
    {
      title: "Total Categories",
      value: categories?.length || 0,
      icon: LayoutGrid,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      borderColor: "border-orange-200",
    },
    {
      title: "Total Promos",
      value: promos?.length || 0,
      icon: Ticket,
      color: "text-pink-600",
      bgColor: "bg-pink-100",
      borderColor: "border-pink-200",
    },
    {
      title: "Total Banners",
      value: banners?.length || 0,
      icon: ImageIcon,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
      borderColor: "border-indigo-200",
    },
  ];

  const recentActivities = activities?.slice(0, 5) || [];
  const recentTransactions = transactions?.slice(0, 5) || [];

  return (
    <div className="w-full px-6 py-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-blue-900">Dashboard</h2>
            <p className="text-slate-600 mt-1">Welcome to your admin dashboard</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button className="bg-blue-600 text-white hover:bg-blue-700 border-0 shadow-sm">
              <Calendar className="w-4 h-4 mr-2" />
              Today
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="border border-slate-200 rounded-xl shadow-sm bg-white overflow-hidden">
              <CardContent className="p-6">
                {isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-blue-900 mt-1">{stat.value}</p>
                    </div>
                    <div className={cn("p-3 rounded-lg border", stat.bgColor, stat.borderColor)}>
                      <stat.icon className={cn("w-6 h-6", stat.color)} />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activities & Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <Card className="border border-slate-200 rounded-xl shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-white border-b border-slate-100">
              <CardTitle className="text-xl font-semibold text-blue-900">Recent Activities</CardTitle>
              <CardDescription className="text-slate-600">
                Latest activities added to the system
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 space-y-4">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <Skeleton className="w-10 h-10 rounded-lg" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentActivities.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="p-4 hover:bg-slate-50">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 overflow-hidden rounded-lg bg-blue-50 flex-shrink-0 border border-slate-200">
                          {activity.imageUrls?.[0] ? (
                            <img 
                              src={activity.imageUrls[0]} 
                              alt={activity.title}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="flex items-center justify-center w-full h-full">
                              <ImageIcon className="w-5 h-5 text-slate-400" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-blue-900 truncate">{activity.title}</p>
                          <p className="text-sm text-slate-500 truncate">
                            {activity.description || 'No description'}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4 text-slate-400" />
                          <span className="text-xs text-slate-500">View</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <Activity className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-600 font-medium">No activities found</p>
                  <p className="text-slate-400 text-sm">Activities will appear here once added</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="border border-slate-200 rounded-xl shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-white border-b border-slate-100">
              <CardTitle className="text-xl font-semibold text-blue-900">Recent Transactions</CardTitle>
              <CardDescription className="text-slate-600">
                Latest transactions in the system
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 space-y-4">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <Skeleton className="w-10 h-10 rounded-lg" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentTransactions.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="p-4 hover:bg-slate-50">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center border border-green-200">
                          <ShoppingCart className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-blue-900 truncate">
                            {transaction.transaction_items?.[0]?.title || 'Unknown Activity'}
                          </p>
                          <p className="text-sm text-slate-500 truncate">
                            Invoice: {transaction.invoiceId || 'N/A'}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-4 h-4 text-slate-400" />
                          <span className="text-sm font-medium text-green-600">
                            ${transaction.totalAmount || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-600 font-medium">No transactions found</p>
                  <p className="text-slate-400 text-sm">Transactions will appear here once created</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border border-slate-200 rounded-xl shadow-sm bg-white overflow-hidden">
          <CardHeader className="bg-white border-b border-slate-100">
            <CardTitle className="text-xl font-semibold text-blue-900">Quick Actions</CardTitle>
            <CardDescription className="text-slate-600">
              Common actions you can perform
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2 border border-slate-200 bg-white hover:bg-blue-50">
                <Activity className="w-6 h-6 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Add Activity</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2 border border-slate-200 bg-white hover:bg-blue-50">
                <Users className="w-6 h-6 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Manage Users</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2 border border-slate-200 bg-white hover:bg-blue-50">
                <FileText className="w-6 h-6 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">View Orders</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2 border border-slate-200 bg-white hover:bg-blue-50">
                <Ticket className="w-6 h-6 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Manage Promos</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;