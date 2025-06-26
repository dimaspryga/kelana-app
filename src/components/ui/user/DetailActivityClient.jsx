"use client";

import { useState, useEffect, useMemo } from "react";
import { useSWRDetailActivity } from "@/hooks/useSWRDetailActivity";
import { useActivityByCategory } from "@/hooks/useActivityByCategory";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/hooks/useCart";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { format } from "date-fns";
import { enUS as localeEn } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ReviewForm } from "@/components/forms/review-form";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { MapPin, Star, Calendar as CalendarIcon, Minus, Plus, Loader2, ChevronRight } from "lucide-react";

const DEFAULT_ACTIVITY_IMAGE = "/assets/banner-authpage.png";

const exampleReviews = [
  { id: 1, user: { name: "Budi Santoso", avatarUrl: "https://github.com/shadcn.png" }, rating: 5, comment: "An absolutely amazing experience!", createdAt: "2024-05-20T10:00:00Z" },
  { id: 2, user: { name: "Citra Lestari", avatarUrl: "https://github.com/shadcn.png" }, rating: 4, comment: "Very fun for the family.", createdAt: "2024-05-18T14:30:00Z" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

export function DetailActivityClient({ initialActivity }) {
  const router = useRouter();
  const pathname = usePathname();
  
  const { detailActivity } = useSWRDetailActivity(initialActivity.id, initialActivity);
  const { activityByCategory } = useActivityByCategory(detailActivity?.categoryId);
  const { addToCart, isLoading: isAddingToCart } = useCart();
  const { user } = useAuth();

  const [quantity, setQuantity] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);

  const handleDecrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  const handleIncrement = () => setQuantity((prev) => prev + 1);

  const handleAddToCart = async () => {
    if (!user) {
      toast.info("Please log in to add items to your cart.");
      router.push(`/login?redirect=${pathname}`);
      return;
    }
    if (!detailActivity?.id) {
      toast.error("An error occurred, activity ID not found.");
      return;
    }
    if (!selectedDate) {
      toast.warning("Please select a date first.");
      return;
    }
    await addToCart(detailActivity.id, quantity);
  };

  if (!detailActivity) {
    return <div>Loading...</div>;
  }

  const price = Number(detailActivity.price) || 0;
  const priceDiscount = Number(detailActivity.price_discount) || 0;
  const displayPrice = priceDiscount > 0 ? priceDiscount : price;
  const showStrikethrough = priceDiscount > 0 && price > priceDiscount;
  const totalPrice = displayPrice * quantity;
  const { reviews = exampleReviews } = detailActivity;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="min-h-screen py-8 bg-gray-50">
      <div className="container px-4 mx-auto max-w-7xl">
        <Breadcrumb className="mb-8">
            <BreadcrumbList>
                <BreadcrumbItem><BreadcrumbLink asChild><Link href="/">Home</Link></BreadcrumbLink></BreadcrumbItem>
                <BreadcrumbSeparator><ChevronRight /></BreadcrumbSeparator>
                <BreadcrumbItem><BreadcrumbLink asChild><Link href="/activities">Activities</Link></BreadcrumbLink></BreadcrumbItem>
                <BreadcrumbSeparator><ChevronRight /></BreadcrumbSeparator>
                <BreadcrumbItem><BreadcrumbPage>{detailActivity.title}</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="lg:w-2/3">
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h1 className="mb-2 text-3xl font-bold text-gray-800">{detailActivity.title}</h1>
              <div className="flex flex-wrap items-center gap-4 mb-4 text-gray-600">
                <div className="flex items-center gap-1"><Star className="w-5 h-5 text-yellow-500 fill-yellow-500" /><span className="font-semibold">{detailActivity.rating}</span><span className="text-sm text-gray-500">({detailActivity.total_reviews} reviews)</span></div>
                <div className="flex items-center gap-1"><MapPin className="w-5 h-5 text-gray-500" /><span className="text-sm">{detailActivity.address}</span></div>
              </div>
            </div>
            <div className="mt-6 overflow-hidden bg-white rounded-lg shadow-md"><div className="relative w-full h-80 md:h-96"><img src={detailActivity.imageUrls?.[0] || DEFAULT_ACTIVITY_IMAGE} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/assets/error.png"; }} alt={detailActivity.title || "Activity image"} className="object-cover w-full h-full" /></div></div>
            <div className="p-6 mt-6 bg-white rounded-lg shadow-md"><h2 className="mb-4 text-2xl font-bold text-gray-800">About {detailActivity.title}</h2><p className="text-justify text-gray-700 whitespace-pre-line">{detailActivity.description}</p></div>
            <div className="p-6 mt-6 bg-white rounded-lg shadow-md"><h2 className="mb-4 text-2xl font-bold text-gray-800">Location</h2><div className="flex items-center gap-2 mb-4"><MapPin className="w-5 h-5 text-gray-600" /><p className="text-gray-700">{detailActivity.address}</p></div><div className="flex justify-center w-full h-full text-gray-500 bg-white rounded-md"><div className="w-full overflow-hidden rounded-md [&>iframe]:w-full" dangerouslySetInnerHTML={{ __html: detailActivity.location_maps }} /></div></div>
            <div className="p-6 mt-6 bg-white rounded-lg shadow-md"><h2 className="mb-4 text-2xl font-bold text-gray-800">User Reviews ({reviews.length})</h2><div className="space-y-6">{reviews.map((review) => (<div key={review.id} className="flex gap-4"><Avatar><AvatarImage src={review.user.avatarUrl} alt={review.user.name} /><AvatarFallback>{review.user.name.charAt(0)}</AvatarFallback></Avatar><div className="flex-1"><div className="flex items-center justify-between"><p className="font-semibold text-gray-800">{review.user.name}</p><div className="flex items-center gap-1 text-sm text-yellow-500"><Star className="w-4 h-4 fill-current" /><span>{review.rating.toFixed(1)}</span></div></div><p className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p><p className="mt-2 text-gray-700">{review.comment}</p></div></div>))}{user && <ReviewForm activityId={initialActivity.id} />}</div></div>
          </div>
          <div className="lg:w-1/3">
            <div className="sticky top-24">
              <div className="p-6 bg-white rounded-lg shadow-md">
                <div className="mb-4">{displayPrice > 0 ? (<>{showStrikethrough && (<span className="text-lg text-red-500 line-through">{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price)}</span>)}<p className={`text-3xl font-bold ${showStrikethrough ? "text-blue-600" : "text-gray-900"}`}>{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(displayPrice)}</p><p className="text-sm text-gray-600">/ person</p></>) : (<p className="text-xl font-bold text-gray-700">Price not available</p>)}</div>
                {displayPrice > 0 && (
                  <>
                    <div className="space-y-4">
                      <div className="grid w-full gap-1.5"><Label htmlFor="date">Select Date</Label><Popover><PopoverTrigger asChild><Button id="date" variant={"outline"} className={cn("w-full justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}><CalendarIcon className="w-4 h-4 mr-2" />{selectedDate ? format(selectedDate, "PPP", { locale: localeEn }) : <span>Pick a date</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))} initialFocus /></PopoverContent></Popover></div>
                      <div className="grid w-full gap-1.5"><Label htmlFor="quantity">Number of People / Quantity</Label><div className="flex items-center justify-between p-2 border rounded-md"><Button variant="outline" size="icon" onClick={handleDecrement} disabled={quantity <= 1}><Minus className="w-4 h-4" /></Button><span className="w-16 font-bold text-center text-md">{quantity}</span><Button variant="outline" size="icon" onClick={handleIncrement}><Plus className="w-4 h-4" /></Button></div></div>
                    </div>
                    <div className="py-4 mt-4 border-t"><div className="flex items-center justify-between"><p className="text-lg font-semibold">Total</p><p className="text-2xl font-bold text-gray-900">{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(totalPrice)}</p></div></div>
                    <Button size="lg" className="w-full text-lg bg-blue-600 hover:bg-blue-700" disabled={!selectedDate || isAddingToCart} onClick={handleAddToCart}>{isAddingToCart ? (<><Loader2 className="w-6 h-6 mr-2 animate-spin" /> Adding...</>) : ("Add to Cart")}</Button>
                    <p className="mt-2 text-xs text-center text-gray-500">Easy Cancellation & Full Refund</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        {activityByCategory && activityByCategory.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-6 text-2xl font-bold text-gray-800">Similar Activities</h2>
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
                <Carousel opts={{ align: "start", loop: activityByCategory.length > 3 }} className="w-full">
                    <CarouselContent className="-ml-2 md:-ml-4">
                    {activityByCategory.map((rec) => (
                        <CarouselItem key={rec.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                            <motion.div variants={itemVariants}>
                                <Link href={`/activity/${rec.id}`} className="block h-full group">
                                    <div className="flex flex-col h-full overflow-hidden transition-shadow bg-white rounded-lg shadow-md hover:shadow-xl">
                                        <div className="relative w-full h-40">
                                            <img src={rec.imageUrls?.[0] || DEFAULT_ACTIVITY_IMAGE} alt={rec.title || "Activity"} className="absolute inset-0 object-cover w-full h-full" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/assets/error.png"; }} />
                                        </div>
                                        <div className="flex flex-col flex-grow p-4">
                                            <h3 className="font-semibold text-gray-800 truncate group-hover:text-blue-600">{rec.title || "Name Not Available"}</h3>
                                            <p className="mb-1 text-sm text-gray-600 truncate"><MapPin className="inline w-3 h-3 mr-1" />{rec.address || "Location Not Available"}</p>
                                            <p className="text-sm text-yellow-500"><Star className="inline w-3 h-3 mr-1 fill-current" /> {rec.rating || "-"} ({rec.total_reviews || "0"} Reviews)</p>
                                            <p className="pt-2 mt-auto text-lg font-bold text-blue-500">{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(rec.price ?? 0) || "Price not available"}</p>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        </CarouselItem>
                    ))}
                    </CarouselContent>
                    {activityByCategory.length > 3 && (
                    <>
                        <CarouselPrevious className="absolute left-[-20px] md:left-[-25px] top-1/2 -translate-y-1/2 z-10 hidden sm:flex" />
                        <CarouselNext className="absolute right-[-20px] md:right-[-25px] top-1/2 -translate-y-1/2 z-10 hidden sm:flex" />
                    </>
                    )}
                </Carousel>
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
