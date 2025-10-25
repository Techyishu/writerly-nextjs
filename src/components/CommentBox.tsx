"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MessageCircle, Send, User } from 'lucide-react';

interface Comment {
  id: string;
  name: string;
  comment: string;
  createdAt: string;
}

interface CommentBoxProps {
  postId: string;
  className?: string;
}

export const CommentBox = ({ postId, className = '' }: CommentBoxProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comments?postId=${postId}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId,
          name: name.trim(),
          comment: comment.trim(),
        }),
      });

      if (response.ok) {
        setName('');
        setComment('');
        setShowForm(false);
        fetchComments();
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 ${className}`}>
      <div className="mb-6">
        <h3 className="text-xl font-medium text-white mb-2">Comments ({comments.length})</h3>
        <p className="text-white/70 text-sm">Share your thoughts on this post</p>
      </div>

      {comments.length > 0 && (
        <div className="space-y-4 mb-6">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-white/70" />
                <span className="text-white font-medium text-sm">{comment.name}</span>
                <span className="text-white/50 text-xs">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-white/90 text-sm leading-relaxed">{comment.comment}</p>
            </div>
          ))}
        </div>
      )}

      {!showForm ? (
        <Button
          onClick={() => setShowForm(true)}
          className="w-full bg-purple-500 hover:bg-purple-600 text-white"
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          Add a Comment
        </Button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-white/90">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="mt-1 bg-white/5 border-white/20 text-white placeholder:text-white/50"
              required
            />
          </div>

          <div>
            <Label htmlFor="comment" className="text-white/90">Comment *</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts..."
              className="mt-1 bg-white/5 border-white/20 text-white placeholder:text-white/50"
              rows={4}
              required
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={isSubmitting || !name.trim() || !comment.trim()}
              className="flex-1 bg-purple-500 hover:bg-purple-600 text-white"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowForm(false)}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CommentBox;
