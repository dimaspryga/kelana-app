"use client";

import React from "react";
import Link from "next/link";
import { usePaymentMethod } from "@/hooks/usePaymentMethod";
import { Skeleton } from "@/components/ui/skeleton";
import { Twitter, Instagram, Youtube, Facebook, MapPin, Phone, Mail } from 'lucide-react';

// Data link untuk Footer
const footerLinks = [
  {
    title: "Product",
    links: [
      { name: "Home", href: "/" },
      { name: "Banner", href: "/banner" },
      { name: "Category", href: "/category" },
      { name: "Activity", href: "/activity" },
      { name: "Promo", href: "/promo" },
    ],
  },
  {
    title: "About Kelana",
    links: [
      { name: "About Us", href: "/" },
      { name: "Blog", href: "/" },
      { name: "Careers", href: "/" },
      { name: "Become a Partner", href: "/" },
    ],
  },
  {
    title: "Support",
    links: [
      { name: "Help Center", href: "/" },
      { name: "Privacy Policy", href: "/" },
      { name: "Terms & Conditions", href: "/" },
      { name: "Contact Us", href: "/" },
    ],
  },
];

const Footer = () => {
  // 2. Get payment method data from the hook
  const { paymentMethod, isLoading } = usePaymentMethod();

  return (
    <footer className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white">
      <div className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          <div className="col-span-1 pr-8 lg:col-span-1">
            <Link href="/" className="inline-block transition-all duration-200 hover:opacity-80">
              <img
                src="/assets/kelana.webp"
                alt="Kelana Logo"
                className="w-auto h-12 filter brightness-0 invert"
              />
            </Link>
            <p className="mt-4 text-sm text-blue-100 leading-relaxed">
              The best platform to plan your unforgettable adventures. Discover amazing activities, unique places, and unforgettable experiences.
            </p>
            <div className="flex mt-6 space-x-4">
              <Link 
                href="#" 
                className="p-2 text-blue-200 transition-all duration-200 rounded-full hover:text-white hover:bg-blue-700 hover:scale-110"
                aria-label="Follow us on Twitter"
              >
                <Twitter className="w-5 h-5" />
              </Link>
              <Link 
                href="#" 
                className="p-2 text-blue-200 transition-all duration-200 rounded-full hover:text-white hover:bg-blue-700 hover:scale-110"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="w-5 h-5" />
              </Link>
              <Link 
                href="#" 
                className="p-2 text-blue-200 transition-all duration-200 rounded-full hover:text-white hover:bg-blue-700 hover:scale-110"
                aria-label="Follow us on Facebook"
              >
                <Facebook className="w-5 h-5" />
              </Link>
              <Link 
                href="#" 
                className="p-2 text-blue-200 transition-all duration-200 rounded-full hover:text-white hover:bg-blue-700 hover:scale-110"
                aria-label="Follow us on YouTube"
              >
                <Youtube className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {footerLinks.map((section) => (
            <div key={section.title} className="space-y-4">
              <h3 className="text-sm font-semibold tracking-wider text-white uppercase">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-base text-blue-200 transition-all duration-200 hover:text-white hover:underline hover:translate-x-1 inline-block"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="space-y-4">
            <h3 className="text-sm font-semibold tracking-wider text-white uppercase">
              Contact Us
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 group">
                <div className="p-1 mt-1 text-blue-200 transition-all duration-200 rounded-full group-hover:text-white group-hover:bg-blue-700">
                  <MapPin className="w-4 h-4" />
                </div>
                <p className="text-base text-blue-200 group-hover:text-white transition-colors duration-200">
                  Bogor, West Java, 16161
                </p>
              </li>
              <li className="flex items-start gap-3 group">
                <div className="p-1 text-blue-200 transition-all duration-200 rounded-full group-hover:text-white group-hover:bg-blue-700">
                  <Phone className="w-4 h-4" />
                </div>
                <a
                  href="tel:+622112345678"
                  className="text-base text-blue-200 transition-all duration-200 hover:text-white hover:underline"
                >
                  (021) 1234-5678
                </a>
              </li>
              <li className="flex items-start gap-3 group">
                <div className="p-1 text-blue-200 transition-all duration-200 rounded-full group-hover:text-white group-hover:bg-blue-700">
                  <Mail className="w-4 h-4" />
                </div>
                <a
                  href="mailto:support@kelana.com"
                  className="text-base text-blue-200 transition-all duration-200 hover:text-white hover:underline"
                >
                  support@kelana.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-12 mt-12 border-t border-blue-700">
          <h3 className="text-sm font-semibold tracking-wider text-center text-white uppercase mb-8">
            Our Payment Partners
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {isLoading
              ? 
                Array.from({ length: 7 }).map((_, index) => (
                  <Skeleton
                    key={index}
                    className="w-16 h-8 rounded-lg bg-blue-700"
                  />
                ))
              : 
                (paymentMethod || []).map((partner) => (
                  <div 
                    key={partner.id} 
                    className="p-2 transition-all duration-200 rounded-lg hover:bg-blue-700 hover:scale-110"
                  >
                    <img
                      src={partner.imageUrl}
                      alt={partner.name}
                      className="object-contain h-6 sm:h-8 filter brightness-0 invert opacity-80 hover:opacity-100 transition-opacity duration-200"
                      title={partner.name}
                    />
                  </div>
                ))}
          </div>
        </div>
      </div>

      <div className="bg-blue-950 border-t border-blue-800">
        <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row">
            <p className="text-sm text-blue-300">
              &copy; {new Date().getFullYear()} PT. KELANA. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-blue-300">
              <Link href="/" className="transition-colors duration-200 hover:text-white">
                Privacy Policy
              </Link>
              <Link href="/" className="transition-colors duration-200 hover:text-white">
                Terms of Service
              </Link>
              <Link href="/" className="transition-colors duration-200 hover:text-white">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;