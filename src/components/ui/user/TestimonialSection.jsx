"use client";

import React, { useRef } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Quote, Star } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import { motion } from "framer-motion";

// Data dummy untuk testimoni
const testimonials = [
  {
    id: 1,
    name: "Aulia Rahman",
    location: "Jakarta, Indonesia",
    avatar: "https://i.pravatar.cc/150?u=aulia",
    rating: 5,
    comment:
      "The experience was extraordinary! Everything was well-organized, and the views were breathtaking. Highly recommended for a family vacation.",
  },
  {
    id: 2,
    name: "Bima Santoso",
    location: "Surabaya, Indonesia",
    avatar: "https://i.pravatar.cc/150?u=bima",
    rating: 5,
    comment:
      "Booking through this platform was very easy and practical. The promos offered were also very attractive. I will definitely use this service again.",
  },
  {
    id: 3,
    name: "Citra Dewi",
    location: "Bandung, Indonesia",
    avatar: "https://i.pravatar.cc/150?u=citra",
    rating: 5,
    comment:
      "An unforgettable adventure! The tour guide was very friendly and knowledgeable. The facilities provided exceeded my expectations.",
  },
  {
    id: 4,
    name: "Dian Permata",
    location: "Bali, Indonesia",
    avatar: "https://i.pravatar.cc/150?u=dian",
    rating: 5,
    comment:
      "Found a fantastic last-minute deal for a weekend getaway. The process was smooth and the activity was incredibly fun. Two thumbs up!",
  },
  {
    id: 5,
    name: "Eko Prasetyo",
    location: "Yogyakarta, Indonesia",
    avatar: "https://i.pravatar.cc/150?u=eko",
    rating: 5,
    comment:
      "The best platform for finding unique activities. I discovered a hidden gem that wasn't on other travel sites. Very satisfied!",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const TestimonialSection = () => {
  const plugin = useRef(Autoplay({ delay: 5000, stopOnInteraction: true }));

  return (
    <section className="py-20 bg-white" aria-label="Customer testimonials">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-gradient-to-r from-blue-100 to-blue-200">
            <Star className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-semibold text-blue-800">Customer Reviews</span>
          </div>
          <h2 className="mb-6 text-2xl font-bold text-gray-900 md:text-3xl lg:text-4xl tracking-tight">
            What Our <span className="text-transparent bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text">Customers</span> Say
          </h2>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto md:text-lg">
            Real experiences from travelers who have discovered amazing adventures with us
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-8"
        >
          <Carousel 
            className="w-full" 
            opts={{ align: "start", loop: testimonials.length > 4 }}
            plugins={[plugin.current]}
          >
            <CarouselContent className="-ml-4">
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="pl-4 basis-1/2 sm:basis-1/2 lg:basis-1/3">
                  <div className="h-full">
                    <motion.div
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      className="flex flex-col h-full p-6 transition-all duration-300 border border-gray-200 bg-white rounded-2xl hover:border-blue-300 hover:-translate-y-1 min-h-[200px]"
                    >
                      <div className="flex items-center mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <blockquote className="flex-grow mb-4 text-gray-700 leading-relaxed">
                        "{testimonial.comment}"
                      </blockquote>
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <img
                            className="object-cover w-10 h-10 rounded-full border-2 border-gray-100"
                            src={testimonial.avatar}
                            alt={testimonial.name}
                            onError={(e) => {
                              e.target.onerror = null
                              e.target.src = "https://placehold.co/40x40/dbeafe/2563eb?text=U"
                            }}
                          />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-semibold text-gray-900">{testimonial.name}</p>
                          <p className="text-sm text-gray-500">{testimonial.location}</p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {testimonials.length > 4 && (
              <>
                <CarouselPrevious className="absolute left-[-20px] md:left-[-25px] top-1/2 -translate-y-1/2 z-10 hidden sm:flex border-blue-200 hover:border-blue-300 bg-white/90 backdrop-blur-sm" />
                <CarouselNext className="absolute right-[-20px] md:right-[-25px] top-1/2 -translate-y-1/2 z-10 hidden sm:flex border-blue-200 hover:border-blue-300 bg-white/90 backdrop-blur-sm" />
              </>
            )}
          </Carousel>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialSection;
