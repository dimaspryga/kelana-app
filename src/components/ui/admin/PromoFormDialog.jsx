"use client";

import React, { useState, useEffect, useRef } from "react";
// Import the image upload hook
import { useUploadImage } from "@/hooks/useUploadImage";
import { usePromoActions } from "@/hooks/usePromoActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, ImagePlus } from "lucide-react";
import { toast } from "sonner";

export const PromoFormDialog = ({ promo, isOpen, setIsOpen, onSuccess }) => {
    // Get the image upload function and its loading state
    const { uploadImage, isLoading: isUploading } = useUploadImage();
    const { createPromo, updatePromo, isMutating: isSubmitting } = usePromoActions();
    
    // Combine loading states for the button
    const isLoading = isUploading || isSubmitting;

    const [formState, setFormState] = useState({
        title: '',
        description: '',
        terms_condition: '',
        promo_code: '',
        promo_discount_price: '',
        minimum_claim_price: '',
    });
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const fileInputRef = useRef(null);
    
    const isEditMode = !!promo;

    useEffect(() => {
        if (isOpen && promo) {
            setFormState({
                title: promo.title || '',
                description: promo.description || '',
                terms_condition: promo.terms_condition || '',
                promo_code: promo.promo_code || '',
                promo_discount_price: promo.promo_discount_price || '',
                minimum_claim_price: promo.minimum_claim_price || '',
            });
            setPreviewUrl(promo.imageUrl);
            setImageFile(null);
        } else if (isOpen) {
            setFormState({ title: '', description: '', terms_condition: '', promo_code: '', promo_discount_price: '', minimum_claim_price: '' });
            setPreviewUrl('');
            setImageFile(null);
        }
    }, [promo, isOpen]);

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormState(prev => ({ ...prev, [id]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () => {
        // Validation for required fields
        if (!isEditMode && !imageFile) {
            toast.error("A promo image is required.");
            return;
        }
        if (!formState.title.trim()) {
            toast.error("The title field is required.");
            return;
        }
        
        try {
            let finalImageUrl = isEditMode ? promo.imageUrl : '';

            // Step 1: Upload image first IF a new file is selected
            if (imageFile) {
                finalImageUrl = await uploadImage(imageFile);
            }

            // If for some reason the image upload returns no URL
            if (!finalImageUrl) {
                toast.error("Failed to upload image. Cannot proceed.");
                return;
            }

            // Step 2: Prepare the final data payload
            const data = { 
                ...formState,
                imageUrl: finalImageUrl,
            };
            
            // Step 3: Call the appropriate action (create or update)
            if (isEditMode) {
                await updatePromo(promo.id, data);
            } else {
                await createPromo(data);
            }

            onSuccess(); // This calls mutate() from the parent page
            setIsOpen(false);
        } catch (error) {
            console.error("Form submission failed", error);
            // Error is already toasted inside the action hook, so no need to toast again here.
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? 'Edit Promo' : 'Create New Promo'}</DialogTitle>
                    <DialogDescription>{isEditMode ? 'Update the details for this promo.' : 'Fill in the details for the new promo.'}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div 
                        className="relative flex items-center justify-center w-full h-40 border border-border border-dashed rounded-lg cursor-pointer bg-white hover:bg-blue-50"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {previewUrl ? <img src={previewUrl} alt="Preview" className="object-cover w-full h-full rounded-md" /> : <div className="text-center text-gray-500"><ImagePlus className="w-8 h-8 mx-auto" /><p className="mt-2 text-sm">Upload Image</p></div>}
                        <Input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </div>
                    <div className="space-y-2"><Label htmlFor="title">Title</Label><Input id="title" value={formState.title} onChange={handleInputChange} /></div>
                    <div className="space-y-2"><Label htmlFor="description">Description</Label><Textarea id="description" value={formState.description} onChange={handleInputChange} /></div>
                    <div className="space-y-2"><Label htmlFor="terms_condition">Terms & Conditions</Label><Textarea id="terms_condition" value={formState.terms_condition} onChange={handleInputChange} /></div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2"><Label htmlFor="promo_code">Promo Code</Label><Input id="promo_code" value={formState.promo_code} onChange={handleInputChange} /></div>
                        <div className="space-y-2"><Label htmlFor="promo_discount_price">Discount Price (IDR)</Label><Input id="promo_discount_price" type="number" value={formState.promo_discount_price} onChange={handleInputChange} /></div>
                    </div>
                    <div className="space-y-2"><Label htmlFor="minimum_claim_price">Minimum Claim Price (IDR)</Label><Input id="minimum_claim_price" type="number" value={formState.minimum_claim_price} onChange={handleInputChange} /></div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {promo ? "Update Promo" : "Create Promo"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
