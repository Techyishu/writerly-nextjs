"use client";

import { useEffect, useState } from 'react';

export const usePostTracking = (postId: string) => {
  const [viewCount, setViewCount] = useState<number>(0);
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    if (!postId || isTracking) return;

    const trackView = async () => {
      try {
        setIsTracking(true);
        
        // Check if user has already viewed this post in this session
        const sessionKey = `viewed_${postId}`;
        const hasViewed = sessionStorage.getItem(sessionKey);
        
        if (!hasViewed) {
          // Track the view
          const response = await fetch('/api/visitors', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ postId }),
          });

          if (response.ok) {
            // Mark as viewed in this session
            sessionStorage.setItem(sessionKey, 'true');
            
            // Get updated view count
            const countResponse = await fetch(`/api/visitors?postId=${postId}`);
            if (countResponse.ok) {
              const data = await countResponse.json();
              setViewCount(data.viewCount);
            }
          }
        } else {
          // Get current view count without incrementing
          const countResponse = await fetch(`/api/visitors?postId=${postId}`);
          if (countResponse.ok) {
            const data = await countResponse.json();
            setViewCount(data.viewCount);
          }
        }
      } catch (error) {
        console.error('Error tracking view:', error);
      }
    };

    trackView();
  }, [postId, isTracking]);

  return { viewCount };
};