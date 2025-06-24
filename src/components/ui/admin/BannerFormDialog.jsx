// File: components/ui/admin/BannerFormDialog.js

import React, { useState, useEffect, useRef } from "react";
import { useBannerActions } from "@/hooks/useBannerActions";
import { useUploadImage } from "@/hooks/useUploadImage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, ImagePlus } from "lucide-react";
import { toast } from "sonner";

export const BannerFormDialog = ({ banner, isOpen, setIsOpen, onSuccess }) => {
    const { createBanner, updateBanner, isMutating } = useBannerActions();
    const { uploadImage, isLoading: isUploading } = useUploadImage();
    
    const [name, setName] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const fileInputRef = useRef(null);

    const isEditMode = !!banner;

    useEffect(() => {
        if (isOpen) {
            if (isEditMode) {
                setName(banner.name || '');
                setPreviewUrl(banner.imageUrl || '');
            } else {
                setName('');
                setPreviewUrl('');
            }
            setImageFile(null);
        }
    }, [isOpen, banner, isEditMode]);

    useEffect(() => {
        return () => {
            if (previewUrl && previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (previewUrl && previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error("Banner name cannot be empty.");
            return;
        }

        if (!isEditMode && !imageFile) {
            toast.error("A banner image is required.");
            return;
        }

        const action = isEditMode ? "updating" : "creating";
        const loadingToastId = toast.loading(`Starting to ${action} banner...`);

        try {
            let finalImageUrl = banner?.imageUrl;

            if (imageFile) {
                toast.loading("Uploading image...", { id: loadingToastId });
                const newImageUrl = await uploadImage(imageFile);
                finalImageUrl = newImageUrl;
            }

            if (!finalImageUrl) {
                toast.error("Failed to get image URL.", { id: loadingToastId });
                return;
            }

            toast.loading("Saving banner data...", { id: loadingToastId });
            const payload = {
                name: name,
                imageUrl: finalImageUrl,
            };

            if (isEditMode) {
                await updateBanner(banner.id, payload);
            } else {
                await createBanner(payload);
            }

            toast.success(`Banner ${isEditMode ? 'updated' : 'created'} successfully!`, { id: loadingToastId });
            if (typeof onSuccess === 'function') onSuccess();
            setIsOpen(false);

        } catch (error) {
            // ================== PERUBAHAN DI SINI ==================
            let errorMessage;

            // Cek secara spesifik untuk error 413 (Payload Too Large)
            if (error.response?.status === 413) {
                errorMessage = "Image size too large. Please upload a smaller file.";
            } else {
                // Fallback ke pesan error umum untuk error lainnya
                errorMessage = error.response?.data?.message || error.message || `Failed to ${action} banner.`;
            }
            
            toast.error(errorMessage, { id: loadingToastId });
            console.error(`Error ${action} banner (status: ${error.response?.status}):`, error.response?.data || error);
        }
    };

    const isProcessing = isUploading || isMutating;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{isEditMode ? 'Edit Banner' : 'Create New Banner'}</DialogTitle>
                        <DialogDescription>
                            {isEditMode ? 'Update the details for this banner.' : 'Fill in the details to create a new banner.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div 
                            className="relative flex items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {previewUrl ? (
                                <img src={previewUrl} alt="Preview" className="object-cover w-full h-full rounded-md" />
                            ) : (
                                <div className="text-center text-gray-500">
                                    <ImagePlus className="w-8 h-8 mx-auto" />
                                    <p className="mt-2 text-sm">Click to upload image</p>
                                </div>
                            )}
                            <Input 
                                ref={fileInputRef}
                                type="file" 
                                className="hidden" 
                                accept="image/png, image/jpeg, image/jpg"
                                onChange={handleFileChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name">Banner Name</Label>
                            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Summer Sale Promo"/>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isProcessing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isProcessing} className="bg-blue-600 hover:bg-blue-700">
                            {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {isEditMode ? 'Save Changes' : 'Create Banner'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};