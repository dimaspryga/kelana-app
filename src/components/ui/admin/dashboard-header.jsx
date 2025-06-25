"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useUpdateProfile } from '@/hooks/useUpdateProfile';
import { useUploadImage } from '@/hooks/useUploadImage';
import {
    Home,
    ChevronRight,
    Search,
    Menu,
    Package2,
    Settings,
    LifeBuoy,
    LogOut,
    LayoutDashboard,
    Users,
    ImageIcon,
    LayoutGrid,
    Folder,
    Ticket,
    FileText,
    Loader2,
    ImagePlus
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";


// Komponen Dialog Pengaturan Profile
const SettingsDialog = ({ open, onOpenChange, user }) => {

    const { updateProfile, loading: isSavingProfile } = useUpdateProfile();
    const { uploadImage, isLoading: isUploadingImage } = useUploadImage();
    
    // Menggabungkan status loading
    const isSaving = isSavingProfile || isUploadingImage;

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phoneNumber: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phoneNumber: user.phoneNumber || ''
            });
            setPreviewUrl(user.profilePictureUrl || '');
        }
    }, [user, open]); // Reset form setiap kali dialog dibuka

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSaveChanges = async () => {
        const toastId = toast.loading("Saving profile changes...");
        
        try {
            let imageUrl = user.profilePictureUrl;


            if (imageFile) {
                const newImageUrl = await uploadImage(imageFile);
                if (newImageUrl) {
                    imageUrl = newImageUrl;
                } else {
                    throw new Error("Failed to get new image URL after upload.");
                }
            }

            const finalProfileData = {
                ...formData,
                profilePictureUrl: imageUrl
            };

            // Langkah 3: Panggil API untuk memperbarui profil
            await updateProfile(finalProfileData);

            toast.success("Profile updated successfully!", { id: toastId });
            onOpenChange(false);
            // TODO: Panggil fungsi untuk memuat ulang data pengguna di AuthContext jika diperlukan

        } catch (error) {
            toast.error(error.message || "Failed to save changes.", { id: toastId });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle>Account Settings</DialogTitle>
                    <DialogDescription>
                        Make changes to your profile here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    <div className="flex items-center gap-4">
                        <Avatar className="w-20 h-20">
                            <AvatarImage src={previewUrl} alt={formData.name} />
                            <AvatarFallback>{formData.name?.[0]?.toUpperCase() || 'A'}</AvatarFallback>
                        </Avatar>
                        <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isSaving}>
                            <ImagePlus className="w-4 h-4 mr-2"/>
                            Change Photo
                        </Button>
                        <Input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </div>
                    <div className="grid items-center grid-cols-4 gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input id="name" value={formData.name} onChange={handleInputChange} className="col-span-3" />
                    </div>
                    <div className="grid items-center grid-cols-4 gap-4">
                        <Label htmlFor="email" className="text-right">
                            Email
                        </Label>
                        <Input id="email" type="email" value={formData.email} onChange={handleInputChange} className="col-span-3" disabled />
                    </div>
                    <div className="grid items-center grid-cols-4 gap-4">
                        <Label htmlFor="phoneNumber" className="text-right">
                            Phone
                        </Label>
                        <Input id="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSaveChanges} disabled={isSaving}>
                        {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
};


// Data navigasi untuk mencocokkan URL dengan nama, sekarang di satu tempat
const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/users", label: "Users", icon: Users },
    { href: "/banners", label: "Banners", icon: ImageIcon },
    { href: "/categories", label: "Categories", icon: LayoutGrid },
    { href: "/activities", label: "Activities", icon: Folder },
    { href: "/promos", label: "Promos", icon: Ticket },
    { href: "/transactions", label: "Data Order", icon: FileText },
];

const Breadcrumbs = ({ path }) => {
    // Memecah path dan mengabaikan segmen 'admin'
    const pathSegments = path.split('/').filter(p => p && p !== 'admin');
    
    const breadcrumbItems = pathSegments.map((segment) => {
        const url = `/${segment}`;
        const item = navItems.find(navItem => navItem.href === url);
        return {
            label: item ? item.label : segment.charAt(0).toUpperCase() + segment.slice(1),
            href: url,
        };
    });

    return (
        <nav className="items-center hidden text-sm font-medium md:flex text-muted-foreground">
            <Link href="/dashboard" className="hover:text-primary">
                <Home className="w-4 h-4" />
            </Link>
            {breadcrumbItems.map((item, index) => (
                <React.Fragment key={index}>
                    <ChevronRight className="w-4 h-4 mx-1" />
                    <Link href={item.href} className="hover:text-primary">
                        {item.label}
                    </Link>
                </React.Fragment>
            ))}
        </nav>
    );
};


export function DashboardHeader({ activePath }) {
    const { user, logout, loading } = useAuth(); // Gunakan hook useAuth
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Menghasilkan inisial dari nama pengguna
    const getInitials = (name) => {
        if (!name) return 'A';
        const names = name.split(' ');
        if (names.length > 1) {
            return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    return (
        <>
            <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} user={user} />
            <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                            <Menu className="w-5 h-5" />
                            <span className="sr-only">Toggle navigation menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="flex flex-col">
                        {/* Konten untuk sidebar mobile */}
                        <nav className="grid gap-2 text-base font-medium">
                            <Link
                                href="#"
                                className="flex items-center gap-2 mb-4 text-lg font-semibold"
                            >
                                <Package2 className="w-6 h-6 text-blue-600" />
                                <span>Kelana Admin</span>
                            </Link>
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                return(
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${activePath === item.href ? 'bg-muted text-primary' : 'text-muted-foreground hover:text-primary'}`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {item.label}
                                    </Link>
                                )
                            })}
                        </nav>
                    </SheetContent>
                </Sheet>
                <div className="flex-1 w-full">
                    {/* Breadcrumbs sekarang menjadi bagian dari header yang responsif */}
                    <Breadcrumbs path={activePath} />
                </div>
                <div className="flex items-center gap-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="icon" className="rounded-full">
                                {loading ? (
                                    <Skeleton className="w-8 h-8 rounded-full" />
                                ) : (
                                    <Avatar className="w-8 h-8">
                                        <AvatarImage src={user?.profilePictureUrl} alt={user?.name} />
                                        <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
                                    </Avatar>
                                )}
                                <span className="sr-only">Toggle user menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{user?.name || "User"}</p>
                                    <p className="text-xs leading-none text-muted-foreground">{user?.email || "No email"}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => setIsSettingsOpen(true)}>
                                <Settings className="w-4 h-4 mr-2" />
                                <span>Settings</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={logout}>
                                <LogOut className="w-4 h-4 mr-2" />
                                <span>Logout</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>
        </>
    );
}
