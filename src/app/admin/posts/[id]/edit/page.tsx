"use client";

import AdminPostForm from '@/pages/AdminPostForm';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';

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
