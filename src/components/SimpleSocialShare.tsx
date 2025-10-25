"use client";

import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';

interface SimpleSocialShareProps {
  title: string;
  url: string;
  description?: string;
  className?: string;
}

export const SimpleSocialShare = ({ title, url, description, className = '' }: SimpleSocialShareProps) => {
  const handleShare = async () => {
    // Try native share first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url,
          text: description || title,
        });
        return;
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
      // You could add a toast notification here if you have a toast system
      console.log('Link copied to clipboard');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className={`flex justify-center ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={handleShare}
        className="border-white/30 text-white hover:bg-white/10 hover:border-white/50"
      >
        <Share2 className="h-4 w-4 mr-2" />
        Share
      </Button>
    </div>
  );
};

export default SimpleSocialShare;
