import AdminPostForm from '@/pages/AdminPostForm';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditPostPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <AdminProtectedRoute>
      <AdminPostForm id={id} />
    </AdminProtectedRoute>
  );
}
