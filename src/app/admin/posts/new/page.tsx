"use client";

import AdminPostForm from '@/pages/AdminPostForm';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';

export default function NewPostPage() {
  return (
    <AdminProtectedRoute>
      <AdminPostForm />
    </AdminProtectedRoute>
  );
}
