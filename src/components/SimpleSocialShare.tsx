"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Facebook, 
  Twitter, 
  Instagram,
  Linkedin,
  Copy,
  Check,
  Share2
} from 'lucide-react';

interface SimpleSocialShareProps {
  title: string;
  url: string;
  description?: string;
  className?: string;
}

export const SimpleSocialShare = ({ title, url, description, className = '' }: SimpleSocialShareProps) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async (platform: string) => {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    const encodedDescription = encodeURIComponent(description || title);

    let shareUrl = '';

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case 'instagram':
        // Instagram doesn't support direct URL sharing, so we'll open Instagram's website
        window.open('https://www.instagram.com/', '_blank');
        return;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'copy':
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
          return;
        } catch (error) {
          console.error('Failed to copy:', error);
          return;
        }
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url,
          text: description || title,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="text-white/70 text-sm mr-2">Share:</span>
      
      {/* Facebook */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('facebook')}
        className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 hover:border-blue-400"
      >
        <Facebook className="h-4 w-4" />
      </Button>

      {/* Twitter */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('twitter')}
        className="border-sky-500/50 text-sky-400 hover:bg-sky-500/10 hover:border-sky-400"
      >
        <Twitter className="h-4 w-4" />
      </Button>

      {/* Instagram */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('instagram')}
        className="border-pink-500/50 text-pink-400 hover:bg-pink-500/10 hover:border-pink-400"
      >
        <Instagram className="h-4 w-4" />
      </Button>

      {/* LinkedIn */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('linkedin')}
        className="border-blue-600/50 text-blue-500 hover:bg-blue-600/10 hover:border-blue-500"
      >
        <Linkedin className="h-4 w-4" />
      </Button>

      {/* Copy Link */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('copy')}
        className="border-green-500/50 text-green-400 hover:bg-green-500/10 hover:border-green-400"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>

      {/* Native Share (mobile) */}
      {typeof navigator !== 'undefined' && 'share' in navigator && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleNativeShare}
          className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10 hover:border-purple-400"
        >
          <Share2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default SimpleSocialShare;
