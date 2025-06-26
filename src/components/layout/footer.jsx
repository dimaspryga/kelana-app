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
      { name: "Activity", href: "/activities" },
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
    <footer className="bg-slate-800 text-slate-300">
      <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2 pr-8 md:col-span-1">
            <Link href="/" className="inline-block">
              <img
                src="/assets/kelana.webp"
                alt="Travel Journal Logo"
                className="w-auto h-12"
              />
            </Link>
            <p className="mt-2 text-sm text-slate-400">
              The best platform to plan your unforgettable adventures.
            </p>
            <div className="flex mt-6 space-x-4">
              <Link href="#" className="text-slate-400 hover:text-white">
                <span className="sr-only">Twitter</span>
                <Twitter />
              </Link>
              <Link href="#" className="text-slate-400 hover:text-white">
                <span className="sr-only">Instagram</span>
                <Instagram />
              </Link>
              <Link href="#" className="text-slate-400 hover:text-white">
                <span className="sr-only">Facebook</span>
                <Facebook />
              </Link>
              <Link href="#" className="text-slate-400 hover:text-white">
                <span className="sr-only">YouTube</span>
                <Youtube />
              </Link>
            </div>
          </div>

          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold tracking-wider text-white uppercase">
                {section.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-base text-slate-400 hover:text-white hover:underline"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="text-sm font-semibold tracking-wider text-white uppercase">
              Contact Us
            </h3>
            <ul className="mt-4 space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 mt-1 shrink-0 text-slate-400" />
                <p className="text-base text-slate-400">
                  Bogor, West Java, 16161
                </p>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 shrink-0 text-slate-400" />
                <a
                  href="tel:+622112345678"
                  className="text-base text-slate-400 hover:text-white hover:underline"
                >
                  (021) 1234-5678
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 shrink-0 text-slate-400" />
                <a
                  href="mailto:support@traveljournal.com"
                  className="text-base text-slate-400 hover:text-white hover:underline"
                >
                  support@kelana.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 mt-12 border-t border-slate-700">
          <h3 className="text-sm font-semibold tracking-wider text-center text-white uppercase">
            Our Payment Partners
          </h3>
          <div className="flex flex-wrap items-center justify-center mt-6 gap-x-8 gap-y-4">
            {isLoading
              ? 
                Array.from({ length: 7 }).map((_, index) => (
                  <Skeleton
                    key={index}
                    className="w-16 h-8 rounded bg-slate-700"
                  />
                ))
              : 
                (paymentMethod || []).map((partner) => (
                  <img
                    key={partner.id}
                    src={partner.imageUrl}
                    alt={partner.name}
                    className="object-contain h-6 sm:h-8"
                    title={partner.name}
                  />
                ))}
          </div>
        </div>
      </div>

      <div className="bg-slate-900">
        <div className="px-4 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <p className="text-sm text-center text-slate-500">
            &copy; {new Date().getFullYear()} PT. KELANA. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;