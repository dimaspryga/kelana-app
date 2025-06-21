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
    // Placeholder untuk panggilan API
    console.log({ activityId, rating, comment });
    // Simulasi panggilan API
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success("Thank you for your review!");
    setRating(0);
    setComment("");
    setIsSubmitting(false);
  };

  return (
    <div className="pt-6 mt-8 border-t">
      <h3 className="mb-4 text-xl font-bold text-gray-800">Leave a Review</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Your Rating</Label>
          <div className="flex items-center gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className="w-6 h-6 text-yellow-400 cursor-pointer"
                fill={star <= (hoverRating || rating) ? "currentColor" : "none"}
                stroke="currentColor"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              />
            ))}
          </div>
        </div>
        <div>
          <Label htmlFor="comment">Your Comment</Label>
          <Textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="mt-2"
            placeholder="Share your experience..."
            required
            rows={4}
          />
        </div>
        <Button type="submit" disabled={isSubmitting || rating === 0 || !comment}>
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...
            </>
          ) : (
            "Submit Review"
          )}
        </Button>
      </form>
    </div>
  );
};
