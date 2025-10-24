"use client";

import { Eye } from 'lucide-react';

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
  // Temporarily disabled during Sanity migration
  return (
    <div className={`flex items-center gap-1 text-sm text-gray-600 ${className}`}>
      {showIcon && <Eye className="h-4 w-4" />}
      <span>Views disabled</span>
    </div>
  );
};

export default PostViewCounter;