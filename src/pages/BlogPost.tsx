"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { blogService, type BlogPost } from '@/lib/sanity';
import { CosmicBackground } from '@/components/CosmicBackground';
import { BlogHeader } from '@/components/BlogHeader';
import { PostViewCounter } from '@/components/PostViewCounter';
import { usePostTracking } from '@/hooks/usePostTracking';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';
import logoImage from "@/assets/WhatsApp Image 2025-10-21 at 1.21.30 AM.jpeg";
import { PostFeedback } from '@/components/PostFeedback';
import { CommentBox } from '@/components/CommentBox';
import { SimpleSocialShare } from '@/components/SimpleSocialShare';

interface BlogPostProps {
  slug: string;
}

// Function to render Sanity rich text content
function renderSanityContent(content: any): string {
  if (!content) return '';
  
  // If content is a string, return it with line breaks
  if (typeof content === 'string') {
    return content.replace(/\n/g, '<br>');
  }
  
  // If content is an array (Sanity rich text), render it
  if (Array.isArray(content)) {
    return content.map(block => {
      if (block._type === 'block') {
        let text = '';
        if (block.children) {
          text = block.children.map((child: any) => {
            if (child.text) {
              let textContent = child.text;
              if (child.marks) {
                child.marks.forEach((mark: any) => {
                  if (mark._type === 'strong') {
                    textContent = `<strong>${textContent}</strong>`;
                  } else if (mark._type === 'em') {
                    textContent = `<em>${textContent}</em>`;
                  } else if (mark._type === 'code') {
                    textContent = `<code>${textContent}</code>`;
                  }
                });
              }
              return textContent;
            }
            return '';
          }).join('');
        }
        
        // Handle block styles
        if (block.style === 'h1') {
          return `<h1 class="text-3xl font-bold mb-4">${text}</h1>`;
        } else if (block.style === 'h2') {
          return `<h2 class="text-2xl font-bold mb-3">${text}</h2>`;
        } else if (block.style === 'h3') {
          return `<h3 class="text-xl font-bold mb-2">${text}</h3>`;
        } else if (block.style === 'blockquote') {
          return `<blockquote class="border-l-4 border-purple-400 pl-4 italic">${text}</blockquote>`;
        } else {
          return `<p class="mb-4">${text}</p>`;
        }
      }
      return '';
    }).join('');
  }
  
  return '';
}

export default function BlogPost({ slug }: BlogPostProps) {
  const router = useRouter();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track post views
  usePostTracking(post?._id || '');

  useEffect(() => {
    if (slug) {
      loadPost(slug);
    }
  }, [slug]);

  const loadPost = async (postSlug: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Add timeout to prevent hanging requests
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 10000);
      });

      const postPromise = blogService.getPostBySlug(postSlug);
      const postData = await Promise.race([postPromise, timeoutPromise]) as BlogPost | null;
      
      if (postData) {
        setPost(postData);
      } else {
        setError('Post not found');
      }
    } catch (error) {
      console.error('Error loading post:', error);
      if (error instanceof Error && error.message === 'Request timeout') {
        setError('Request timed out. Please try again.');
      } else {
        setError('Failed to load post. Please try again.');
      }
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto mb-4"></div>
            <p className="text-white/70">Loading post...</p>
            <p className="text-white/50 text-sm mt-2">This may take a moment</p>
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
            <h1 className="mb-4 text-4xl font-light text-white">
              {error ? 'Error Loading Post' : 'Post Not Found'}
            </h1>
            <p className="mb-8 text-white/70">
              {error || 'The blog post you\'re looking for doesn\'t exist.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="literary" 
                onClick={() => router.push('/')}
                className="mr-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
              {error && (
                <Button 
                  variant="outline"
                  onClick={() => loadPost(slug)}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Try Again
                </Button>
              )}
            </div>
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
          <article className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-4 sm:p-6 md:p-8 lg:p-12">
            {/* Meta Information */}
            <div className="mb-8 flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-white/70">
              <div className="flex items-center gap-1 sm:gap-2">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">
                  {post.publishedAt && !isNaN(new Date(post.publishedAt).getTime()) 
                    ? new Date(post.publishedAt).toLocaleDateString() 
                    : 'No date'}
                </span>
                <span className="sm:hidden">
                  {post.publishedAt && !isNaN(new Date(post.publishedAt).getTime()) 
                    ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) 
                    : 'No date'}
                </span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                {post.readTime}
              </div>
              <PostViewCounter postId={post._id} className="text-white/70 text-xs sm:text-sm" />
              <Badge variant="secondary" className="bg-purple-400/20 text-purple-300 text-xs">
                {post.category}
              </Badge>
              {post.featured && (
                <Badge variant="default" className="bg-yellow-400/20 text-yellow-300 text-xs">
                  Featured
                </Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="mb-6 text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light leading-tight text-white">
              {post.title}
            </h1>

            {/* Excerpt */}
            <p className="mb-8 text-lg sm:text-xl text-white/80 leading-relaxed">
              {post.excerpt}
            </p>

            {/* Cover Image */}
            {post.coverImage && typeof post.coverImage === 'string' && post.coverImage.trim() !== '' && (
              <div className="mb-8">
                <img 
                  src={post.coverImage} 
                  alt={post.title}
                  className="w-full h-64 md:h-96 object-cover rounded-lg"
                />
              </div>
            )}

            {/* Social Share Buttons */}
            <div className="mb-8 flex justify-center">
              <SimpleSocialShare 
                title={post.title}
                url={`${typeof window !== 'undefined' ? window.location.origin : ''}/post/${post.slug.current}`}
                description={post.excerpt}
              />
            </div>

            {/* Content */}
            <div className="prose prose-lg prose-invert max-w-none">
              <div 
                className="text-white/90 leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: renderSanityContent(post.content) }}
              />
            </div>

            <div className="mt-8">
              <PostFeedback postId={post._id} />
            </div>

            <div className="mt-8">
              <CommentBox postId={post._id} />
            </div>

            {/* Article Footer */}
            <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-white/20">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img 
                    src={logoImage.src} 
                    alt="Aruna.S"
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-purple-400/30"
                  />
                  <div>
                    <p className="text-white font-medium text-sm sm:text-base">Aruna.S</p>
                    <p className="text-white/60 text-xs sm:text-sm">Author & Blogger</p>
                  </div>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => router.push('/')}
                  className="border-white/20 text-white hover:bg-white/10 text-xs sm:text-sm px-3 sm:px-4 py-2"
                >
                  <ArrowLeft className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Back to Blog</span>
                  <span className="sm:hidden">Back</span>
                </Button>
              </div>
            </div>
          </article>
        </div>
      </main>
    </CosmicBackground>
  );
}
