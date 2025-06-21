'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const SubscribeSection = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }
    
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Thank you for subscribing to our newsletter!");
      setEmail('');
    }, 1500);
  };

  return (
    // --- PERUBAHAN UTAMA DI SINI ---
    // Menggunakan gradien yang lebih menarik sebagai latar belakang
    <div className="py-20 bg-gradient-to-r from-blue-600 to-cyan-500">
      <div className="container max-w-4xl px-4 mx-auto sm:px-6 lg:px-8">
        <motion.div 
          className="p-8 text-center text-white" // Teks diubah menjadi putih
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Ikon dengan latar belakang semi-transparan */}
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-full bg-white/20 backdrop-blur-sm">
            <Mail className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Stay Updated with Our Latest Offers
          </h2>
          <p className="max-w-xl mx-auto mt-4 text-lg text-blue-100">
            Join our newsletter to receive the latest news, exclusive deals, and travel tips directly to your inbox.
          </p>

          <form 
            onSubmit={handleSubmit} 
            className="flex flex-col w-full max-w-md gap-3 mx-auto mt-8 sm:flex-row"
          >
            <div className="relative flex-grow">
              <Mail className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 left-4 top-1/2" />
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                // Styling input agar lebih kontras
                className="w-full h-12 pl-12 text-base text-gray-900 bg-white border-transparent rounded-md shadow-inner focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-700"
                required
              />
            </div>
            <Button 
              type="submit" 
              size="lg" 
              // Styling tombol agar kontras dan menarik
              className="h-12 text-base text-blue-600 bg-white shadow-md hover:bg-gray-100"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Send className="w-5 h-5 mr-2" />
              )}
              Subscribe
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default SubscribeSection;
