"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { blogService, BlogPost } from '@/lib/supabase';
import { CosmicBackground } from '@/components/CosmicBackground';
import { BlogHeader } from '@/components/BlogHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';

interface BlogPostProps {
  slug: string;
}

export default function BlogPost({ slug }: BlogPostProps) {
  const router = useRouter();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      loadPost(slug);
    }
  }, [slug]);

  const loadPost = async (postSlug: string) => {
    try {
      setLoading(true);
      setError(null);
      const postData = await blogService.getPostBySlug(postSlug);
      
      if (postData) {
        setPost(postData);
      } else {
        setError('Post not found');
      }
    } catch (error) {
      console.error('Error loading post:', error);
      setError('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <CosmicBackground>
        <BlogHeader />
        <div className="container mx-auto px-4 py-32">
          <div className="text-center">
            <p className="text-white/70">Loading post...</p>
          </div>
        </div>
      </CosmicBackground>
    );
  }

  if (error || !post) {
    return (
      <CosmicBackground>
        <BlogHeader />
        <div className="container mx-auto px-4 py-32">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="mb-4 text-4xl font-light text-white">Post Not Found</h1>
            <p className="mb-8 text-white/70">The blog post you're looking for doesn't exist.</p>
            <Button 
              variant="literary" 
              onClick={() => router.push('/')}
              className="mr-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </div>
      </CosmicBackground>
    );
  }

  return (
    <CosmicBackground>
      <BlogHeader />
      
      <main className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-4xl">
          {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => router.push('/')}
          className="mb-8 border-white/20 text-white hover:bg-white/10"
        >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Button>

          {/* Article Header */}
          <article className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-8 md:p-12">
            {/* Meta Information */}
            <div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-white/70">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(post.created).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {post.readTime}
              </div>
              <Badge variant="secondary" className="bg-purple-400/20 text-purple-300">
                {post.category}
              </Badge>
              {post.featured && (
                <Badge variant="default" className="bg-yellow-400/20 text-yellow-300">
                  Featured
                </Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="mb-6 text-4xl font-light leading-tight text-white md:text-5xl lg:text-6xl">
              {post.title}
            </h1>

            {/* Excerpt */}
            <p className="mb-8 text-xl text-white/80 leading-relaxed">
              {post.excerpt}
            </p>

            {/* Cover Image */}
            {post.cover_image && (
              <div className="mb-8">
                <img 
                  src={post.cover_image} 
                  alt={post.title}
                  className="w-full h-64 md:h-96 object-cover rounded-lg"
                />
              </div>
            )}

            {/* Content */}
            <div className="prose prose-lg prose-invert max-w-none">
              <div 
                className="text-white/90 leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br>') }}
              />
            </div>

            {/* Article Footer */}
            <div className="mt-12 pt-8 border-t border-white/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-400/20 flex items-center justify-center">
                    <User className="h-5 w-5 text-purple-300" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Aruna.S</p>
                    <p className="text-white/60 text-sm">Author & Blogger</p>
                  </div>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => router.push('/')}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Blog
                </Button>
              </div>
            </div>
          </article>
        </div>
      </main>
    </CosmicBackground>
  );
}
