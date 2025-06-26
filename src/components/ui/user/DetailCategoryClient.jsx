"use client";

import { useSWRDetailCategory } from "@/hooks/useSWRDetailCategory";
import { useSWRActivityByCategory } from "@/hooks/useSWRActivityByCategory";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Frown, MapPin, Star, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";


const DEFAULT_ACTIVITY_IMAGE = "/assets/banner-authpage.png";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);


const ActivityCard = ({ activity }) => (
    <motion.div variants={cardVariants} className="h-full">
        <Link href={`/activity/${activity.id}`} className="block h-full group">
            <div className="flex flex-col h-full overflow-hidden transition-all duration-300 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-xl hover:-translate-y-1">
                <div className="relative w-full h-40 overflow-hidden">
                    <img
                        src={activity.imageUrls?.[0] || DEFAULT_ACTIVITY_IMAGE}
                        alt={activity.title || "Activity"}
                        className="absolute inset-0 object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/assets/error.png"; }}
                    />
                </div>
                <div className="flex flex-col flex-grow p-4">
                    <h3 className="text-base font-bold text-gray-800 truncate group-hover:text-blue-600">
                        {activity.title || "Name Not Available"}
                    </h3>
                    <p className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                        <MapPin className="w-4 h-4" /> {activity.city || "Location Not Available"}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-sm">
                        <div className="flex items-center gap-1 text-yellow-500">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="font-bold text-gray-700">{activity.rating || "-"}</span>
                        </div>
                        <span className="text-xs text-gray-400">({activity.total_reviews || "0"} Reviews)</span>
                    </div>
                    <p className="pt-2 mt-auto text-lg font-bold text-blue-600">
                        {formatCurrency(activity.price ?? 0)}
                    </p>
                </div>
            </div>
        </Link>
    </motion.div>
);

export function DetailCategoryClient({ initialCategory, initialActivities }) {
    const { detailCategory, error: categoryError } = useSWRDetailCategory(initialCategory.id, initialCategory);
    const { activityByCategory, error: activityError } = useSWRActivityByCategory(initialCategory.id, initialActivities);

    const error = categoryError || activityError;

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <Frown className="w-16 h-16 text-red-500" />
                <h2 className="mt-4 text-2xl font-bold">Failed to Load Category</h2>
                <p className="mt-2 text-muted-foreground">{error.message}</p>
            </div>
        );
    }
    
    if (!detailCategory) {
        return null; 
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.75 }}
            className="min-h-screen bg-slate-50"
        >
            <div className="container px-4 py-8 mx-auto max-w-7xl">
                <Breadcrumb className="mb-8">
                    <BreadcrumbList>
                        <BreadcrumbItem><BreadcrumbLink asChild><Link href="/">Home</Link></BreadcrumbLink></BreadcrumbItem>
                        <BreadcrumbSeparator><ChevronRight /></BreadcrumbSeparator>
                        <BreadcrumbItem><BreadcrumbLink asChild><Link href="/category">Categories</Link></BreadcrumbLink></BreadcrumbItem>
                        <BreadcrumbSeparator><ChevronRight /></BreadcrumbSeparator>
                        <BreadcrumbItem><BreadcrumbPage>{detailCategory.name}</BreadcrumbPage></BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                
                <div className="relative flex items-center justify-center w-full h-[350px] md:h-[450px] rounded-xl overflow-hidden shadow-lg mb-12">
                    <img
                        src={detailCategory.imageUrl}
                        alt={detailCategory.name || "Category image"}
                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/assets/error.png"; }}
                        className="absolute inset-0 object-cover w-full h-full"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
                    <div className="relative z-10 p-6 text-center text-white">
                        <h1 className="mb-2 text-4xl font-extrabold drop-shadow-lg lg:text-6xl">{detailCategory.name}</h1>
                        <p className="max-w-2xl text-lg text-slate-200 drop-shadow-md">Find the best adventures in the '{detailCategory.name}' category.</p>
                    </div>
                </div>

                {activityByCategory && activityByCategory.length > 0 ? (
                    <div>
                        <h2 className="mb-6 text-3xl font-bold text-gray-900">
                            Activities in this Category
                        </h2>
                        <motion.div 
                            variants={containerVariants} 
                            initial="hidden" 
                            animate="visible"
                            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                        >
                            {activityByCategory.map((rec) => (
                                <ActivityCard key={rec.id} activity={rec} />
                            ))}
                        </motion.div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 mt-12 text-center bg-white border-2 border-dashed rounded-lg">
                        <Frown className="w-16 h-16 mb-4 text-gray-400" />
                        <h3 className="mb-2 text-xl font-semibold text-gray-700">No Activities Found</h3>
                        <p className="mb-6 text-gray-500">
                            There are currently no activities in this category.
                        </p>
                        <Button asChild>
                            <Link href="/activities">View All Activities</Link>
                        </Button>
                    </div>
                )}
            </div>
        </motion.div>
    );
};
