"use client";

import React, { useState, useEffect } from "react";
import { useCategoryActions } from "@/hooks/useCategoryActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, ImagePlus } from "lucide-react";

export const CategoryFormDialog = ({
  category,
  isOpen,
  setIsOpen,
  onSuccess,
}) => {
  const { createCategory, updateCategory, isMutating } = useCategoryActions();

  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const isEditMode = !!category;

  useEffect(() => {
    if (isOpen) {
      if (isEditMode) {
        setName(category.name || "");
        setPreviewUrl(category.imageUrl || null);
      } else {
        setName("");
        setPreviewUrl(null);
      }
      setImageFile(null); // Selalu reset file input
    }
  }, [category, isOpen, isEditMode]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = { name, imageFile };

    try {
      if (isEditMode) {
        await updateCategory(category.id, data);
      } else {
        await createCategory(data);
      }
      if (typeof onSuccess === "function") {
        onSuccess();
      }
      setIsOpen(false);
    } catch (error) {
      console.error("Action failed:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Category" : "Create New Category"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the details for this category."
              : "Fill in the details for the new category."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="picture">Category Image</Label>
            <Input
              id="picture"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
          {previewUrl && (
            <div className="mt-2">
              <p className="text-sm font-medium">Image Preview:</p>
              <img
                src={previewUrl}
                alt="Preview"
                className="object-cover w-full h-40 mt-2 border rounded-md"
              />
            </div>
          )}
        </form>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isMutating}
          >
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={isMutating}>
            {isMutating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isEditMode ? "Save Changes" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
