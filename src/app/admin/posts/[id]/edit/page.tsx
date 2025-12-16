"use client";

import { useEffect, useState } from 'react';
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
  const [postId, setPostId] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Resolve the params promise and extract the id
    params
      .then((resolvedParams) => {
        console.log('Edit page - Post ID:', resolvedParams.id);
        setPostId(resolvedParams.id);
      })
      .catch((error) => {
        console.error('Error resolving params:', error);
      });
  }, [params]);

  return (
    <AdminProtectedRoute>
      <AdminPostForm id={postId} />
    </AdminProtectedRoute>
  );
}
