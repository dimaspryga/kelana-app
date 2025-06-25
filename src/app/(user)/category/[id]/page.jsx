import { Suspense } from 'react';
import axios from 'axios';
import { DetailCategoryClient } from '@/components/ui/user/DetailCategoryClient';
import { Skeleton } from '@/components/ui/skeleton';

// --- Komponen Skeleton ---
const DetailCategorySkeleton = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-8 mx-auto max-w-7xl">
        <Skeleton className="w-1/2 h-6 mb-8" />
        <div className="relative w-full mb-8">
            <Skeleton className="w-full h-[400px] rounded-lg" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center bg-black bg-opacity-50">
                <Skeleton className="w-1/2 h-10 mb-4" />
                <Skeleton className="w-2/3 h-6" />
            </div>
        </div>
        <div className="mt-12">
          <Skeleton className="w-1/3 h-8 mb-6" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-lg"/>)}
          </div>
        </div>
      </div>
    </div>
);

// --- Fungsi Pengambilan Data di Sisi Server ---
const API_BASE_URL = "https://travel-journal-api-bootcamp.do.dibimbing.id/api/v1";
const API_KEY = "24405e01-fbc1-45a5-9f5a-be13afcd757c";

async function getCategoryData(id) {
    if (!id) return null;
    try {
        const response = await axios.get(`${API_BASE_URL}/category/${id}`, {
            headers: { apiKey: API_KEY },
        });
        return response.data.data;
    } catch (error) {
        console.error("Gagal mengambil data detail kategori di server:", error.message);
        return null;
    }
}

async function getActivitiesByCategory(id) {
    if (!id) return [];
    try {
        const response = await axios.get(`${API_BASE_URL}/activities-by-category/${id}`, {
            headers: { apiKey: API_KEY },
        });
        return response.data.data;
    } catch (error) {
        console.error("Gagal mengambil aktivitas berdasarkan kategori di server:", error.message);
        return [];
    }
}


// --- Komponen Halaman Utama (Server Component) ---
export default async function DetailCategoryPage({ params }) {
    const { id } = params;
    
    // Ambil data utama di server secara paralel
    const [initialCategory, initialActivities] = await Promise.all([
        getCategoryData(id),
        getActivitiesByCategory(id)
    ]);

    if (!initialCategory) {
        return <div className="container py-8 mx-auto text-center">Detail Kategori tidak ditemukan.</div>;
    }

    return (
        <Suspense fallback={<DetailCategorySkeleton />}>
            <DetailCategoryClient 
                initialCategory={initialCategory} 
                initialActivities={initialActivities}
            />
        </Suspense>
    );
}
