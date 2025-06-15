'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const HeroSection = () => {
  return (
    <div className="relative h-[60vh] sm:h-[70vh] md:h-[80vh] flex items-center justify-center text-center text-white">
      <div 
        className="absolute inset-0 z-0 bg-center bg-cover"
        style={{ backgroundImage: "url('/assets/header.png')" }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
      </div>
      <div className="relative z-10 p-4">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl drop-shadow-md">
          Discover Unforgettable Adventures
        </h1>
        <p className="max-w-2xl mx-auto mt-4 text-lg sm:text-xl opacity-90 drop-shadow-sm">
          Explore various exciting activities and destinations around the world. Your precious moments start here.
        </p>
        <div className="max-w-lg mx-auto mt-8">
          <div className="flex items-center gap-2 p-2 bg-white rounded-full shadow-lg">
            <Search className="w-6 h-6 ml-3 text-gray-400" />
            <Input 
              type="text" 
              placeholder="Search for activities, destinations, or categories..."
              className="flex-grow text-gray-800 bg-transparent border-none focus:ring-0"
            />
            <Button className="bg-blue-600 rounded-full hover:bg-blue-700">Search</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;