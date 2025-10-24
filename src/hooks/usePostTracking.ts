"use client";

import { useEffect } from 'react';

// Post tracking temporarily disabled during Sanity migration
export const usePostTracking = (postId: string) => {
  // Temporarily disabled during Sanity migration
  useEffect(() => {
    console.log('Post tracking disabled during Sanity migration:', postId);
  }, [postId]);
};