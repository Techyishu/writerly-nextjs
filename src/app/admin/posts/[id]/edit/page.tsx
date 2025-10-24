"use client";

import AdminPostForm from '@/pages/AdminPostForm';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditPostPage({ params }: PageProps) {
  return (
    <AdminProtectedRoute>
      <AdminPostForm />
    </AdminProtectedRoute>
  );
}
