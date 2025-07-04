"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCategory } from "@/hooks/useCategory";
import { useBanner } from "@/hooks/useBanner";
import { useActivity } from "@/hooks/useActivity";
import { usePromo } from "@/hooks/usePromo";
import { motion, AnimatePresence } from "framer-motion";

// Import komponen UI dari Shadcn
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Search, Tag, Plane, Mountain } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const HeroSection = () => {
  const router = useRouter();
  const { category: categories, isLoading: isCategoryLoading } = useCategory();
  const { banner: banners, isLoading: isBannerLoading } = useBanner();
  const { activity: activities, isLoading: isActivityLoading } = useActivity();
  const { promo: promos, isLoading: isPromoLoading } = usePromo();

  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSelect = (path) => {
    router.push(path);
    setOpen(false);
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      return;
    }
    router.push(`/search?title=${searchQuery.trim()}`);
    setOpen(false);
  };

  const isLoading =
    isCategoryLoading || isBannerLoading || isActivityLoading || isPromoLoading;

  const heroBanner = useMemo(() => {
    return banners?.find((b) => b.id === "9b0f60df-4e08-421e-b2b5-10c2aa516a97") || "src/assets/header.png";
  }, [banners]);

  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return {
        categories: (categories || []).slice(0, 3),
        activities: (activities || []).slice(0, 4),
        promos: (promos || []).slice(0, 3),
      };
    }

    const lowerCaseQuery = searchQuery.toLowerCase();

    return {
      categories: (categories || [])
        .filter((c) => c.name.toLowerCase().includes(lowerCaseQuery))
        .slice(0, 3),
      activities: (activities || [])
        .filter((a) => a.title.toLowerCase().includes(lowerCaseQuery))
        .slice(0, 4),
      promos: (promos || [])
        .filter((p) => p.title.toLowerCase().includes(lowerCaseQuery))
        .slice(0, 3),
    };
  }, [searchQuery, categories, activities, promos]);

  return (
    <div
      className="relative w-full h-[60vh] md:h-[80vh] bg-cover bg-center"
      style={{
        backgroundImage: `url(${heroBanner?.imageUrl})`,
      }}
    >
        <AnimatePresence>
            {!isLoading && (
                <motion.div
                    className="absolute inset-0 bg-black/50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                />
            )}
        </AnimatePresence>

      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full p-4 text-center text-white">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl drop-shadow-lg "
        >
          Find Your <span className="text-blue-500"> Next Adventure</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-2xl mt-4 text-lg md:text-xl drop-shadow-md"
        >
          Discover amazing activities, unique places, and unforgettable promos
          for your perfect getaway.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex w-full max-w-2xl mt-8 space-x-2"
        >
          <div className="flex-grow">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="justify-between w-full h-16 px-4 text-base text-left bg-white text-muted-foreground hover:bg-gray-50 hover:text-gray-600"
                >
                  <div className="flex items-center">
                    <Search className="w-5 h-5 mr-3 text-gray-400" />
                    <span className="truncate">
                      {searchQuery || "Search activities, categories..."}
                    </span>
                  </div>
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[--radix-popover-trigger-width] p-0 shadow-lg"
                align="start"
              >
                <Command className="border rounded-lg shadow-md">
                  <CommandInput
                    placeholder="Type to search..."
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                    className="h-12 text-base border-0 focus:ring-0"
                  />
                  <CommandList>
                    {filteredResults.categories.length === 0 &&
                    filteredResults.activities.length === 0 &&
                    filteredResults.promos.length === 0 ? (
                      <CommandEmpty>No results found.</CommandEmpty>
                    ) : null}

                    {filteredResults.categories.length > 0 && (
                      <CommandGroup
                        heading="Categories"
                        className="p-2 text-xs text-muted-foreground"
                      >
                        {filteredResults.categories.map((category) => (
                          <CommandItem
                            className="flex items-center gap-2 p-2 rounded-md cursor-pointer text-foreground hover:bg-blue-50"
                            key={category.id}
                            onSelect={() =>
                              handleSelect(`/category/${category.id}`)
                            }
                          >
                            <Mountain className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">{category.name}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}

                    {filteredResults.activities.length > 0 && <CommandSeparator />}

                    {filteredResults.activities.length > 0 && (
                      <CommandGroup
                        heading="Activities"
                        className="p-2 text-xs text-muted-foreground"
                      >
                        {filteredResults.activities.map((activity) => (
                          <CommandItem
                            className="flex items-center gap-2 p-2 rounded-md cursor-pointer text-foreground hover:bg-blue-50"
                            key={activity.id}
                            onSelect={() =>
                              handleSelect(`/activity/${activity.id}`)
                            }
                          >
                            <Plane className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">{activity.title}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}

                    {filteredResults.promos.length > 0 && <CommandSeparator />}

                    {filteredResults.promos.length > 0 && (
                      <CommandGroup
                        heading="Promos"
                        className="p-2 text-xs text-muted-foreground"
                      >
                        {filteredResults.promos.map((promo) => (
                          <CommandItem
                            className="flex items-center gap-2 p-2 rounded-md cursor-pointer text-foreground hover:bg-blue-50"
                            key={promo.id}
                            onSelect={() => handleSelect(`/promo/${promo.id}`)}
                          >
                            <Tag className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">{promo.title}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <Button
            size="lg"
            className="h-16 px-6 text-base bg-blue-600 hover:bg-blue-700"
            onClick={handleSearch}
          >
            <Search className="w-5 h-5" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;
