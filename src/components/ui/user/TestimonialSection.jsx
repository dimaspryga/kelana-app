"use client";

import React, { useRef } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Quote } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import { motion } from "framer-motion";

// Data dummy untuk testimoni
const testimonials = [
  {
    id: 1,
    name: "Aulia Rahman",
    location: "Jakarta, Indonesia",
    avatar: "https://i.pravatar.cc/150?u=aulia",
    comment:
      "The experience was extraordinary! Everything was well-organized, and the views were breathtaking. Highly recommended for a family vacation.",
  },
  {
    id: 2,
    name: "Bima Santoso",
    location: "Surabaya, Indonesia",
    avatar: "https://i.pravatar.cc/150?u=bima",
    comment:
      "Booking through this platform was very easy and practical. The promos offered were also very attractive. I will definitely use this service again.",
  },
  {
    id: 3,
    name: "Citra Dewi",
    location: "Bandung, Indonesia",
    avatar: "https://i.pravatar.cc/150?u=citra",
    comment:
      "An unforgettable adventure! The tour guide was very friendly and knowledgeable. The facilities provided exceeded my expectations.",
  },
  {
    id: 4,
    name: "Dian Permata",
    location: "Bali, Indonesia",
    avatar: "https://i.pravatar.cc/150?u=dian",
    comment:
      "Found a fantastic last-minute deal for a weekend getaway. The process was smooth and the activity was incredibly fun. Two thumbs up!",
  },
  {
    id: 5,
    name: "Eko Prasetyo",
    location: "Yogyakarta, Indonesia",
    avatar: "https://i.pravatar.cc/150?u=eko",
    comment:
      "The best platform for finding unique activities. I discovered a hidden gem that wasn't on other travel sites. Very satisfied!",
  },
];

const TestimonialSection = () => {
  const plugin = useRef(Autoplay({ delay: 5000, stopOnInteraction: true }));

  return (
    <motion.div>
      <div className="py-16 bg-white">
        <div className="container px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              What Our Customers Say
            </h2>
            <p className="max-w-2xl mx-auto mt-4 text-lg text-gray-600">
              Real stories from travelers who have found their perfect adventure
              with us.
            </p>
          </div>

          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            plugins={[plugin.current]}
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {testimonials.map((testimonial) => (
                <CarouselItem
                  key={testimonial.id}
                  className="pl-4 basis-full md:basis-1/2 lg:basis-1/3"
                >
                  <div className="h-full p-1">
                    <Card className="flex flex-col h-full overflow-hidden transition-shadow duration-300 shadow-sm bg-gray-50 rounded-xl">
                      <CardContent className="flex-grow p-6">
                        <Quote className="w-8 h-8 text-blue-200" />
                        <p className="mt-4 text-base italic text-gray-700">
                          "{testimonial.comment}"
                        </p>
                      </CardContent>
                      <CardFooter className="p-6 pt-4 bg-gray-100/70">
                        <div className="flex items-center">
                          <Avatar>
                            <AvatarImage
                              src={testimonial.avatar}
                              alt={testimonial.name}
                            />
                            <AvatarFallback>
                              {testimonial.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="ml-4">
                            <p className="font-semibold text-gray-900">
                              {testimonial.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {testimonial.location}
                            </p>
                          </div>
                        </div>
                      </CardFooter>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
          </Carousel>
        </div>
      </div>
    </motion.div>
  );
};

export default TestimonialSection;
