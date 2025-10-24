"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Prevent static generation
export const runtime = 'nodejs';
import { blogService, BlogPost } from '@/lib/sanity';
import { CosmicBackground } from '@/components/CosmicBackground';
import { BlogHeader } from '@/components/BlogHeader';
// DatabaseTest removed - test component no longer needed
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function Admin() {
  const { user, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadPosts();
    }
  }, [isAuthenticated]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const allPosts = await blogService.getAllPosts();
      setPosts(allPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePublished = async (post: BlogPost) => {
    try {
      await blogService.updatePost(post._id, { published: !post.published });
      loadPosts(); // Reload posts
    } catch (error) {
      console.error('Error toggling published status:', error);
    }
  };

  const deletePost = async (postId: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await blogService.deletePost(postId);
        loadPosts(); // Reload posts
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <CosmicBackground>
        <BlogHeader />
        <div className="container mx-auto px-4 py-32">
          <div className="mx-auto max-w-md text-center">
            <h1 className="mb-4 text-4xl font-light text-white">Access Denied</h1>
            <p className="mb-8 text-white/70">Please log in to access the admin panel.</p>
            <Link href="/admin/login">
              <Button variant="literary" size="lg">
                Go to Login
              </Button>
            </Link>
          </div>
        </div>
      </CosmicBackground>
    );
  }

  return (
    <CosmicBackground>
      <BlogHeader />
      
      <main className="container mx-auto px-4 py-16">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-light text-white mb-2">Admin Panel</h1>
            <p className="text-white/70">Welcome back, {user?.name}</p>
          </div>
          <Link href="/admin/posts/new">
            <Button variant="literary" size="lg">
              <Plus className="mr-2 h-4 w-4" />
              New Post
            </Button>
          </Link>
        </div>


        {loading ? (
          <div className="text-center py-12">
            <p className="text-white/70">Loading posts...</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {posts.length === 0 ? (
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="text-center py-12">
                  <p className="text-white/70 mb-4">No posts found.</p>
                  <Link href="/admin/posts/new">
                    <Button variant="literary">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Post
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              posts.map((post) => (
                <Card key={post._id} className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-white text-xl mb-2">{post.title}</CardTitle>
                        <CardDescription className="text-white/70 mb-3">
                          {post.excerpt}
                        </CardDescription>
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="secondary" className="bg-purple-400/20 text-purple-300">
                            {post.category}
                          </Badge>
                          <Badge variant={post.published ? "default" : "secondary"} 
                                 className={post.published ? "bg-green-400/20 text-green-300" : "bg-gray-400/20 text-gray-300"}>
                            {post.published ? 'Published' : 'Draft'}
                          </Badge>
                          <span className="text-white/50 text-sm">{post.readTime}</span>
                        </div>
                        <p className="text-white/50 text-sm">
                          Created: {post.publishedAt && !isNaN(new Date(post.publishedAt).getTime()) ? new Date(post.publishedAt).toLocaleDateString() : 'No date'}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/posts/${post._id}/edit`}>
                        <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => togglePublished(post)}
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        {post.published ? (
                          <>
                            <EyeOff className="mr-2 h-4 w-4" />
                            Unpublish
                          </>
                        ) : (
                          <>
                            <Eye className="mr-2 h-4 w-4" />
                            Publish
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deletePost(post._id)}
                        className="border-red-400/50 text-red-300 hover:bg-red-400/10"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </main>
    </CosmicBackground>
  );
}
