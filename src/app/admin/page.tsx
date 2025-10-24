"use client";

import Admin from '@/pages/Admin';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function AdminPage() {
  return (
    <AdminProtectedRoute>
      <Admin />
    </AdminProtectedRoute>
  );
}
