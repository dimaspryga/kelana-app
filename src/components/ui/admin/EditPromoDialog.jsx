"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePromoActions } from "@/hooks/usePromoActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, ImagePlus } from "lucide-react";

export const PromoFormDialog = ({ promo, isOpen, setIsOpen, onSuccess }) => {
    const { createPromo, updatePromo, isLoading } = usePromoActions();
    
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
        const data = { ...formState, imageFile };
        try {
            if (isEditMode) {
                await updatePromo(promo.id, data);
            } else {
                await createPromo(data);
            }
            onSuccess();
            setIsOpen(false);
        } catch (error) {
            console.error("Form submission failed", error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? 'Edit Promo' : 'Create New Promo'}</DialogTitle>
                    <DialogDescription>{isEditMode ? 'Update details for this promo.' : 'Fill in the details for a new promo.'}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="relative flex items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100" onClick={() => fileInputRef.current?.click()}>
                        {previewUrl ? <img src={previewUrl} alt="Preview" className="object-cover w-full h-full rounded-md" /> : <div className="text-center text-gray-500"><ImagePlus className="w-8 h-8 mx-auto" /><p className="mt-2 text-sm">Upload Image</p></div>}
                        <Input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </div>
                    <div className="space-y-2"><Label>Title</Label><Input id="title" value={formState.title} onChange={handleInputChange} /></div>
                    <div className="space-y-2"><Label>Description</Label><Textarea id="description" value={formState.description} onChange={handleInputChange} /></div>
                    <div className="space-y-2"><Label>Terms & Conditions</Label><Textarea id="terms_condition" value={formState.terms_condition} onChange={handleInputChange} /></div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2"><Label>Promo Code</Label><Input id="promo_code" value={formState.promo_code} onChange={handleInputChange} /></div>
                        <div className="space-y-2"><Label>Discount Price (IDR)</Label><Input id="promo_discount_price" type="number" value={formState.promo_discount_price} onChange={handleInputChange} /></div>
                    </div>
                    <div className="space-y-2"><Label>Minimum Claim Price (IDR)</Label><Input id="minimum_claim_price" type="number" value={formState.minimum_claim_price} onChange={handleInputChange} /></div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">{isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}{isEditMode ? 'Save Changes' : 'Create Promo'}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
