"use client";

import AdminPostForm from '@/pages/AdminPostForm';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function NewPostPage() {
  return (
    <AdminProtectedRoute>
      <AdminPostForm />
    </AdminProtectedRoute>
  );
}
