"use client";

import { Eye } from 'lucide-react';
import { usePostTracking } from '@/hooks/usePostTracking';

interface PostViewCounterProps {
  postId: string;
  className?: string;
  showIcon?: boolean;
}

export const PostViewCounter = ({ 
  postId, 
  className = '', 
  showIcon = true 
}: PostViewCounterProps) => {
  const { viewCount } = usePostTracking(postId);

  return (
    <div className={`flex items-center gap-1 text-sm text-gray-600 ${className}`}>
      {showIcon && <Eye className="h-4 w-4" />}
      <span>{viewCount} views</span>
    </div>
  );
};

export default PostViewCounter;