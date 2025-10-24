"use client";

import { useState, useEffect, useRef } from 'react';
import { visitorService } from '@/lib/supabase';
import { Users, Eye } from 'lucide-react';

interface VisitorCounterProps {
  className?: string;
  showUnique?: boolean;
}

// Global cache to prevent multiple simultaneous requests
const visitorCache = {
  data: null as { total: number; unique: number } | null,
  isLoading: false,
  lastFetch: 0,
  promise: null as Promise<{ total: number; unique: number }> | null,
};

export const VisitorCounter = ({ className = '', showUnique = true }: VisitorCounterProps) => {
  const [totalVisitors, setTotalVisitors] = useState<number>(0);
  const [uniqueVisitors, setUniqueVisitors] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const hasInitialized = useRef(false);

  useEffect(() => {
    const fetchVisitorCounts = async () => {
      // Prevent multiple simultaneous requests
      if (visitorCache.isLoading && visitorCache.promise) {
        try {
          const result = await visitorCache.promise;
          setTotalVisitors(result.total);
          setUniqueVisitors(result.unique);
          setIsLoading(false);
        } catch (error) {
          console.error('Error fetching visitor counts from cache:', error);
          setIsLoading(false);
        }
        return;
      }

      // Use cached data if it's fresh (less than 30 seconds old)
      const now = Date.now();
      if (visitorCache.data && (now - visitorCache.lastFetch) < 30000) {
        setTotalVisitors(visitorCache.data.total);
        setUniqueVisitors(visitorCache.data.unique);
        setIsLoading(false);
        return;
      }

      try {
        visitorCache.isLoading = true;
        setIsLoading(true);

        // Create a promise that can be shared
        visitorCache.promise = (async () => {
          const total = await visitorService.getVisitorCount();
          const unique = showUnique ? total : 0; // For now, we'll use the same count
          
          const result = { total, unique };
          visitorCache.data = result;
          visitorCache.lastFetch = now;
          
          return result;
        })();

        const result = await visitorCache.promise;
        setTotalVisitors(result.total);
        setUniqueVisitors(result.unique);
      } catch (error) {
        console.error('Error fetching visitor counts:', error);
        // Fallback to cached data if available
        if (visitorCache.data) {
          setTotalVisitors(visitorCache.data.total);
          setUniqueVisitors(visitorCache.data.unique);
        }
      } finally {
        visitorCache.isLoading = false;
        visitorCache.promise = null;
        setIsLoading(false);
      }
    };

    // Only fetch once per component mount
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      fetchVisitorCounts();
    }
  }, [showUnique]);

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 text-white/70 ${className}`}>
        <Eye className="h-4 w-4 animate-pulse" />
        <span className="text-sm">Loading...</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="flex items-center gap-2 text-white/90">
        <Eye className="h-4 w-4 text-purple-400" />
        <span className="text-sm font-medium">{totalVisitors.toLocaleString()}</span>
        <span className="text-xs text-white/60">visits</span>
      </div>
      
      {showUnique && (
        <div className="flex items-center gap-2 text-white/90">
          <Users className="h-4 w-4 text-purple-400" />
          <span className="text-sm font-medium">{uniqueVisitors.toLocaleString()}</span>
          <span className="text-xs text-white/60">unique</span>
        </div>
      )}
    </div>
  );
};
