import Admin from '@/pages/Admin';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';

export default function AdminPage() {
  return (
    <AdminProtectedRoute>
      <Admin />
    </AdminProtectedRoute>
  );
}
