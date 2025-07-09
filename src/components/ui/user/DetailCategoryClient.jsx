"use client";

import { useState } from "react";
import { useSWRDetailCategory } from "@/hooks/useSWRDetailCategory";
import { useSWRActivityByCategory } from "@/hooks/useSWRActivityByCategory";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/hooks/useCart";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Frown, MapPin, Star, ChevronRight, Mountain, ShoppingCart, Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";


const DEFAULT_ACTIVITY_IMAGE = "/assets/error.png";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);


const ActivityCard = ({ activity, onAddToCart, addingItemId }) => {
  const hasDiscount = activity.price_discount > 0 && activity.price_discount < activity.price;
  
  return (
    <motion.div variants={cardVariants}>
      <div className="group relative overflow-hidden transition-all duration-300 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:-translate-y-1">
        <Link href={`/activity/${activity.id}`} className="block">
          <div className="relative overflow-hidden aspect-[4/3]">
            <img
              src={activity.imageUrls[0]}
              alt={activity.title}
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
              onError={(e) => {
                e.target.onerror = null
                e.target.src = "/assets/error.png"
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <div className="absolute top-2 left-2">
              <Badge className="bg-blue-600 text-white border-0 text-xs">
                {activity.category?.name || "Activity"}
              </Badge>
            </div>
            {hasDiscount && (
              <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 text-xs font-bold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-full">
                <Sparkles className="w-2.5 h-2.5" />
                <span className="text-xs">HOT DEAL</span>
              </div>
            )}
            {!hasDiscount && (
              <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 text-white bg-black/30 rounded-full backdrop-blur-sm">
                <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-medium">{activity.rating}</span>
              </div>
            )}
            {hasDiscount && (
              <div className="absolute top-8 right-2 flex items-center gap-1 px-1.5 py-0.5 text-white bg-black/30 rounded-full backdrop-blur-sm">
                <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-medium">{activity.rating}</span>
              </div>
            )}
          </div>

          <div className="p-3">
            <h3 className="mb-1.5 text-sm font-semibold text-gray-900 line-clamp-2">
              {activity.title}
            </h3>
            <div className="flex items-center gap-1 mb-2 text-xs text-gray-500">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{activity.city || "Location not specified"}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                {hasDiscount ? (
                  <>
                    <p className="text-xs text-gray-400 line-through">
                      {formatCurrency(activity.price)}
                    </p>
                    <p className="text-base font-bold text-red-600">
                      {formatCurrency(activity.price_discount)}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="h-3"></div>
                    <p className="text-base font-bold text-blue-600">
                      {formatCurrency(activity.price)}
                    </p>
                  </>
                )}
                <p className="text-xs text-gray-500">per person</p>
              </div>
              <Button
                onClick={(e) => onAddToCart(e, activity)}
                disabled={addingItemId === activity.id}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white rounded transition-all duration-200 hover:scale-105"
              >
                {addingItemId === activity.id ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <ShoppingCart className="w-3 h-3" />
                )}
              </Button>
            </div>
          </div>
        </Link>
      </div>
    </motion.div>
  )
};

export function DetailCategoryClient({ initialCategory, initialActivities }) {
    const { detailCategory, error: categoryError } = useSWRDetailCategory(initialCategory.id, initialCategory);
    const { activityByCategory, error: activityError } = useSWRActivityByCategory(initialCategory.id, initialActivities);
    const { user, loading: isAuthLoading } = useAuth();
    const { addToCart } = useCart();
    const router = useRouter();
    const [addingItemId, setAddingItemId] = useState(null);

    const handleAddToCart = async (e, activity) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!user) {
            toast.error("Please login to add items to cart");
            router.push("/login");
            return;
        }

        setAddingItemId(activity.id);
        try {
            await addToCart(activity.id, 1);
        } catch (err) {
            // Error toast already handled in CartContext
        } finally {
            setAddingItemId(null);
        }
    };

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
            className="min-h-screen bg-white"
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
                
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative flex items-center justify-center w-full h-[350px] md:h-[450px] border border-blue-100 shadow-2xl bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden mb-12"
                >
                    <img
                        src={detailCategory.imageUrl}
                        alt={detailCategory.name || "Category image"}
                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/assets/error.png"; }}
                        className="absolute inset-0 object-cover w-full h-full"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
                    <div className="relative z-10 p-6 text-center text-white">
                        <div className="inline-flex items-center px-4 py-2 mb-4 text-sm font-semibold text-white bg-blue-600 rounded-full">
                            <Mountain className="w-4 h-4 mr-2" />
                            Category
                        </div>
                        <h1 className="mb-4 text-3xl font-extrabold drop-shadow-lg md:text-4xl lg:text-5xl xl:text-6xl tracking-tight">{detailCategory.name}</h1>
                        <p className="max-w-2xl text-sm text-slate-200 drop-shadow-md md:text-lg">Find the best adventures in the '{detailCategory.name}' category.</p>
                    </div>
                </motion.div>

                {activityByCategory && activityByCategory.length > 0 ? (
                    <div>
                        <h2 className="mb-8 text-2xl font-bold text-gray-900 md:text-3xl lg:text-4xl tracking-tight">
                            Activities in this Category
                        </h2>
                        <motion.div 
                            variants={containerVariants} 
                            initial="hidden" 
                            animate="visible"
                            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                        >
                            {activityByCategory.map((activity) => (
                                <ActivityCard 
                                    key={activity.id} 
                                    activity={activity}
                                    onAddToCart={handleAddToCart}
                                    addingItemId={addingItemId}
                                />
                            ))}
                        </motion.div>
                    </div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="flex flex-col items-center justify-center py-20 mt-12 text-center border-2 border-dashed border-blue-200 bg-white/90 backdrop-blur-sm rounded-3xl"
                    >
                        <Frown className="w-16 h-16 mb-4 text-gray-400" />
                        <h3 className="mb-2 text-xl font-semibold text-gray-700">No Activities Found</h3>
                        <p className="mb-6 text-gray-500">
                            There are currently no activities in this category.
                        </p>
                        <Button asChild className="bg-blue-600 hover:bg-blue-700 rounded-xl">
                            <Link href="/activity">View All Activities</Link>
                        </Button>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};
