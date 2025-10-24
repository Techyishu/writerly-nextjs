"use client";

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { visitorService } from '@/lib/supabase';

// Global tracking state to prevent duplicate tracking
const trackingState = {
  isTracking: false,
  lastTrackedPage: '',
  lastTrackedTime: 0,
  debounceTimeout: null as NodeJS.Timeout | null,
};

export const useVisitorTracking = () => {
  const pathname = usePathname();
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    const trackPageVisit = async () => {
      // Prevent duplicate tracking
      if (trackingState.isTracking) {
        return;
      }

      // Debounce rapid navigation
      if (trackingState.debounceTimeout) {
        clearTimeout(trackingState.debounceTimeout);
      }

      trackingState.debounceTimeout = setTimeout(async () => {
        try {
          // Only track on the client side and avoid tracking admin pages
          if (
            typeof window !== 'undefined' && 
            pathname && 
            !pathname.startsWith('/admin') &&
            !pathname.startsWith('/api')
          ) {
            // Prevent tracking the same page multiple times in quick succession
            const now = Date.now();
            const timeSinceLastTrack = now - trackingState.lastTrackedTime;
            const isSamePage = trackingState.lastTrackedPage === pathname;

            if (isSamePage && timeSinceLastTrack < 5000) {
              return; // Don't track same page within 5 seconds
            }

            trackingState.isTracking = true;
            trackingState.lastTrackedPage = pathname;
            trackingState.lastTrackedTime = now;

            await visitorService.trackVisitor({
              page: pathname,
              ip_address: '', // Will be set by the API
              user_agent: navigator.userAgent,
              referrer: document.referrer || undefined,
            });

            // Reset tracking state after a delay
            setTimeout(() => {
              trackingState.isTracking = false;
            }, 1000);
          }
        } catch (error) {
          console.error('Error tracking visitor:', error);
          trackingState.isTracking = false;
        }
      }, 300); // 300ms debounce
    };

    // Only track if we haven't already tracked this page
    if (!hasTrackedRef.current) {
      hasTrackedRef.current = true;
      trackPageVisit();
    }

    // Reset tracking flag when pathname changes
    return () => {
      hasTrackedRef.current = false;
    };
  }, [pathname]);

  return null;
};
