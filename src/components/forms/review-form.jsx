"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star, Loader2 } from "lucide-react";

export const ReviewForm = ({ activityId }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0 || !comment) {
      toast.error("Please provide a rating and a comment.");
      return;
    }
    setIsSubmitting(true);
    console.log({ activityId, rating, comment });
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success("Thank you for your review!");
    setRating(0);
    setComment("");
    setIsSubmitting(false);
  };

  return (
    <div className="pt-3 mt-4 border-t">
      <h3 className="mb-3 text-base font-bold text-gray-800">Leave a Review</h3>
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="space-y-2">
          <div className="space-y-1">
            <Label htmlFor="rating" className="text-xs font-medium text-gray-700">
              Rating
            </Label>
            <select
              id="rating"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded bg-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 appearance-none cursor-pointer"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              required
            >
              <option value="">Select rating</option>
              <option value={5}>5 - Excellent</option>
              <option value={4}>4 - Very Good</option>
              <option value={3}>3 - Good</option>
              <option value={2}>2 - Fair</option>
              <option value={1}>1 - Poor</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="comment" className="text-xs font-medium text-gray-700">
              Comment
            </Label>
            <textarea
              id="comment"
              placeholder="Share your experience..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded bg-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 min-h-[60px] resize-none"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
          </div>
        </div>
        <Button type="submit" size="sm" disabled={isSubmitting || rating === 0 || !comment}>
          {isSubmitting ? (
            <>
              <Loader2 className="w-3 h-3 mr-2 animate-spin" /> Submitting...
            </>
          ) : (
            "Submit Review"
          )}
        </Button>
      </form>
    </div>
  );
};