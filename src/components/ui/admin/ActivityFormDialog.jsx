import React, { useState, useEffect, useRef } from "react";
import { useActivityActions } from "@/hooks/useActivityActions";
import { useCategory } from "@/hooks/useCategory";
import { useUploadImage } from "@/hooks/useUploadImage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ImagePlus } from "lucide-react";
import { toast } from "sonner";

export const ActivityFormDialog = ({
  activity,
  isOpen,
  setIsOpen,
  onSuccess, // Prop ini adalah kunci untuk refresh data
}) => {
  const { createActivity, updateActivity, isMutating } = useActivityActions();
  const { uploadImage, isLoading: isUploading } = useUploadImage();
  const { category: categories } = useCategory();

  const initialFormState = {
    title: "",
    description: "",
    categoryId: "",
    price: "",
    price_discount: "",
    rating: "",
    total_reviews: "",
    facilities: "",
    address: "",
    city: "",
    province: "",
    location_maps: "",
  };

  const [formState, setFormState] = useState(initialFormState);
  const [imageFiles, setImageFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const fileInputRef = useRef(null);

  const isEditMode = !!activity;

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && activity) {
        setFormState({
          title: activity.title || "",
          description: activity.description || "",
          categoryId: activity.categoryId || "",
          price: activity.price || "",
          price_discount: activity.price_discount || "",
          rating: activity.rating || "",
          total_reviews: activity.total_reviews || "",
          facilities: activity.facilities || "",
          address: activity.address || "",
          city: activity.city || "",
          province: activity.province || "",
          location_maps: activity.location_maps || "",
        });
        setPreviewUrls(activity.imageUrls || []);
      } else {
        setFormState(initialFormState);
        setPreviewUrls([]);
      }
      setImageFiles([]);
    }
  }, [activity, isOpen, isEditMode]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormState((prev) => ({ ...prev, [id]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      previewUrls.forEach((url) => {
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      });
      setImageFiles(files);
      const urls = files.map((file) => URL.createObjectURL(file));
      setPreviewUrls(urls);
    }
  };

  const handleSubmit = async () => {
    if (!formState.title || !formState.categoryId) {
      toast.error("Judul dan Kategori wajib diisi.");
      return;
    }
    if (!isEditMode && imageFiles.length === 0) {
      toast.error("Minimal satu gambar wajib diunggah untuk aktivitas baru.");
      return;
    }

    const action = isEditMode ? "memperbarui" : "membuat";
    const loadingToastId = toast.loading(`Proses ${action} aktivitas...`);

    try {
      let finalImageUrls = activity?.imageUrls || [];

      if (imageFiles.length > 0) {
        toast.loading(`Mengunggah ${imageFiles.length} gambar...`, {
          id: loadingToastId,
        });
        const uploadPromises = imageFiles.map((file) => uploadImage(file));
        const uploadedUrls = await Promise.all(uploadPromises);
        finalImageUrls = uploadedUrls;
      }

      toast.loading("Menyimpan data aktivitas...", { id: loadingToastId });

      const payload = {
        ...formState,
        price: Number(formState.price) || 0,
        price_discount: Number(formState.price_discount) || 0,
        rating: Number(formState.rating) || 0,
        total_reviews: Number(formState.total_reviews) || 0,
        imageUrls: finalImageUrls,
      };

      if (isEditMode) {
        await updateActivity(activity.id, payload);
      } else {
        await createActivity(payload);
      }

      toast.success(
        `Aktivitas berhasil ${isEditMode ? "diperbarui" : "dibuat"}!`,
        { id: loadingToastId }
      );

      // Panggil callback onSuccess untuk memicu refresh data di komponen induk
      if (typeof onSuccess === "function") {
        onSuccess();
      }
      setIsOpen(false);
    } catch (error) {
      let errorMessage;
      if (error.response?.status === 413) {
        errorMessage =
          "Ukuran gambar terlalu besar. Gunakan file yang lebih kecil.";
      } else {
        errorMessage =
          error.response?.data?.message ||
          error.message ||
          `Gagal ${action} aktivitas.`;
      }
      toast.error(errorMessage, { id: loadingToastId });
      console.error(
        `Error ${action} activity (status: ${error.response?.status}):`,
        error.response?.data || error
      );
    }
  };

  const isProcessing = isUploading || isMutating;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Aktivitas" : "Buat Aktivitas Baru"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Perbarui detail untuk aktivitas ini."
              : "Isi detail untuk aktivitas baru."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {previewUrls.map((url, index) => (
              <div key={index} className="relative">
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="object-cover w-full h-32 rounded-md"
                />
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
          >
            <ImagePlus className="w-4 h-4 mr-2" />
            Unggah Gambar
          </Button>
          <Input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
          <div className="space-y-2">
            <Label>Judul</Label>
            <Input
              id="title"
              value={formState.title}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label>Kategori</Label>
            <Select
              value={formState.categoryId}
              onValueChange={(value) =>
                setFormState((prev) => ({ ...prev, categoryId: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {(categories || []).map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Deskripsi</Label>
            <Textarea
              id="description"
              value={formState.description}
              onChange={handleInputChange}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Harga</Label>
              <Input
                id="price"
                type="number"
                value={formState.price}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label>Harga Diskon</Label>
              <Input
                id="price_discount"
                type="number"
                value={formState.price_discount}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label>Rating (1-5)</Label>
              <Input
                id="rating"
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={formState.rating}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label>Total Review</Label>
              <Input
                id="total_reviews"
                type="number"
                value={formState.total_reviews}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Fasilitas</Label>
            <Input
              id="facilities"
              value={formState.facilities}
              onChange={handleInputChange}
              placeholder="cth: WiFi,Kolam Renang,Parkir"
            />
          </div>
          <div className="space-y-2">
            <Label>Alamat</Label>
            <Input
              id="address"
              value={formState.address}
              onChange={handleInputChange}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Kota</Label>
              <Input
                id="city"
                value={formState.city}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label>Provinsi</Label>
              <Input
                id="province"
                value={formState.province}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Location Maps (Embed URL)</Label>
            <Input
              id="location_maps"
              value={formState.location_maps}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isProcessing}
          >
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isProcessing}
          >
            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? "Simpan Perubahan" : "Buat Aktivitas"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
