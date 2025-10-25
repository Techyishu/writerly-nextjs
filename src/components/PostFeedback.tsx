"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface PostFeedbackProps {
  postId: string;
  className?: string;
}

export const PostFeedback = ({ postId, className = '' }: PostFeedbackProps) => {
  const [positiveCount, setPositiveCount] = useState(0);
  const [negativeCount, setNegativeCount] = useState(0);
  const [userVote, setUserVote] = useState<'positive' | 'negative' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const response = await fetch(`/api/feedback?postId=${postId}`);
        if (response.ok) {
          const data = await response.json();
          setPositiveCount(data.positive || 0);
          setNegativeCount(data.negative || 0);
        }
      } catch (error) {
        console.error('Error fetching feedback:', error);
      }
    };

    fetchFeedback();

    const savedVote = localStorage.getItem(`feedback_${postId}`);
    if (savedVote === 'positive' || savedVote === 'negative') {
      setUserVote(savedVote);
    }
  }, [postId]);

  const handleVote = async (type: 'positive' | 'negative') => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId, type }),
      });

      if (response.ok) {
        const previousVote = userVote;
        setUserVote(type);
        localStorage.setItem(`feedback_${postId}`, type);
        
        if (type === 'positive') {
          setPositiveCount(prev => prev + 1);
          if (previousVote === 'negative') {
            setNegativeCount(prev => prev - 1);
          }
        } else {
          setNegativeCount(prev => prev + 1);
          if (previousVote === 'positive') {
            setPositiveCount(prev => prev - 1);
          }
        }
      } else {
        console.error('Failed to submit feedback:', response.status);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 ${className}`}>
      <div className="text-center mb-6">
        <h3 className="text-xl font-medium text-white mb-2">Was this post helpful?</h3>
      </div>

      <div className="flex justify-center gap-6">
        <Button
          variant={userVote === 'positive' ? 'default' : 'outline'}
          onClick={() => handleVote('positive')}
          disabled={isSubmitting}
          className={`flex items-center gap-2 ${
            userVote === 'positive' 
              ? 'bg-green-500 hover:bg-green-600 text-white' 
              : 'border-green-500/50 text-green-400 hover:bg-green-500/10'
          }`}
        >
          <ThumbsUp className="h-4 w-4" />
          {positiveCount}
        </Button>
        
        <Button
          variant={userVote === 'negative' ? 'default' : 'outline'}
          onClick={() => handleVote('negative')}
          disabled={isSubmitting}
          className={`flex items-center gap-2 ${
            userVote === 'negative' 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'border-red-500/50 text-red-400 hover:bg-red-500/10'
          }`}
        >
          <ThumbsDown className="h-4 w-4" />
          {negativeCount}
        </Button>
      </div>
    </div>
  );
};

export default PostFeedback;
