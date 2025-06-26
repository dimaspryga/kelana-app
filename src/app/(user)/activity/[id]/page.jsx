import { Suspense } from 'react';
import axios from 'axios';
import { DetailActivityClient } from '@/components/ui/user/DetailActivityClient';
import { Skeleton } from '@/components/ui/skeleton';

const DetailActivitySkeleton = () => (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="container px-4 mx-auto max-w-7xl">
        <Skeleton className="w-1/3 h-5 mb-8" />
        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="w-full space-y-6 lg:w-2/3">
            <div className="p-6 bg-white rounded-lg shadow-md">
              <Skeleton className="w-3/4 h-8 mb-4" />
              <div className="flex flex-wrap items-center gap-4">
                <Skeleton className="w-1/3 h-5" />
                <Skeleton className="w-1/2 h-5" />
              </div>
            </div>
            <Skeleton className="w-full rounded-lg aspect-video h-96" />
          </div>
          <div className="w-full lg:w-1/3">
            <div className="sticky p-6 bg-white rounded-lg shadow-md top-24">
              <div className="space-y-6">
                <div className="space-y-2"><Skeleton className="w-1/2 h-8" /><Skeleton className="w-1/4 h-4" /></div>
                <Skeleton className="w-full h-10" /><Skeleton className="w-full h-10" />
                <div className="py-4 border-t"><Skeleton className="w-full h-8" /></div>
                <Skeleton className="w-full h-12" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
);

async function getActivityData(id) {
    if (!id) return null;
    try {
        const response = await axios.get(`https://travel-journal-api-bootcamp.do.dibimbing.id/api/v1/activity/${id}`, {
            headers: {
                "apiKey": "24405e01-fbc1-45a5-9f5a-be13afcd757c",
            },
        });
        return response.data.data;
    } catch (error) {
        console.error("Gagal mengambil data detail aktivitas di server:", error.message);
        return null;
    }
}

export default async function DetailActivityPage({ params }) {
    const { id } = await params;
    const initialActivity = await getActivityData(id);

    if (!initialActivity) {
        return <div className="container py-8 mx-auto text-center">Detail Aktivitas tidak ditemukan.</div>;
    }

    return (
        <Suspense fallback={<DetailActivitySkeleton />}>
            <DetailActivityClient initialActivity={initialActivity} />
        </Suspense>
    );
}