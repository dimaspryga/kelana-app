'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Send, Loader2, Bell } from 'lucide-react';
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
    <section className="py-20 bg-white" aria-label="Newsletter subscription">
      <div className="container max-w-4xl px-4 mx-auto sm:px-6 lg:px-8">
        <motion.div
          className="p-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Icon with background */}
          <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-blue-200">
            <Bell className="w-10 h-10 text-blue-600" />
          </div>
          
          <h2 className="mb-6 text-xl font-bold text-gray-900 md:text-2xl lg:text-3xl tracking-tight">
            Stay Updated with Our <span className="text-transparent bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text">Latest Offers</span>
          </h2>
          
          <p className="max-w-2xl mx-auto mb-8 text-sm text-gray-600 md:text-lg">
            Join our newsletter to receive the latest news, exclusive deals, and travel tips directly to your inbox.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <form 
              onSubmit={handleSubmit} 
              className="flex flex-col w-full max-w-md gap-4 mx-auto sm:flex-row sm:max-w-lg"
            >
              <div className="relative flex-grow">
                <Mail className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 left-4 top-1/2" />
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 pl-12 text-base text-gray-900 bg-white border border-gray-200 rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:border-blue-500 transition-all duration-200"
                  required
                />
              </div>
              <Button
                type="submit"
                size="lg" 
                className="h-12 text-base text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all duration-200 hover:scale-105"
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
          
          <p className="mt-4 text-sm text-gray-500">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default SubscribeSection;
