"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Prevent static generation
export const runtime = 'nodejs';
import { blogService, BlogPost } from '@/lib/sanity';
import { CosmicBackground } from '@/components/CosmicBackground';
import { BlogHeader } from '@/components/BlogHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

const categories = [
  'Mystery',
  'Fiction',
  'Romance',
  'Fantasy',
  'Drama',
  'Thriller',
  'Horror',
  'Sci-Fi',
  'Non-Fiction',
  'Poetry'
];

interface AdminPostFormProps {
  id?: string;
}

export default function AdminPostForm({ id }: AdminPostFormProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    slug: { current: '' },
    category: '',
    readTime: '',
    published: false,
    featured: false,
    coverImage: '',
    // Author fields removed - using constant avatar from assets
  });

  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>('');
  const [existingCoverImage, setExistingCoverImage] = useState<string>(''); // Store existing image URL/ID
  const [shouldRemoveCoverImage, setShouldRemoveCoverImage] = useState(false); // Track if user wants to remove image

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPost, setIsLoadingPost] = useState(isEditing);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }

    // Wait for id to be available before loading
    if (isEditing && id) {
      console.log('Loading post with ID:', id);
      loadPost(id);
    } else if (isEditing && !id) {
      // Still waiting for id to load
      setIsLoadingPost(true);
    }
  }, [isAuthenticated, isEditing, id, router]);

  const loadPost = async (postId: string) => {
    try {
      setIsLoadingPost(true);
      const posts = await blogService.getAllPosts();
      const post = posts.find(p => p._id === postId);
      
      if (post) {
        console.log('Loaded post coverImage:', post.coverImage);
        const coverImageValue = typeof post.coverImage === 'string' ? post.coverImage : '';
        setFormData({
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          slug: post.slug,
          category: post.category,
          readTime: post.readTime,
          published: post.published,
          featured: post.featured,
          coverImage: coverImageValue,
        });
        
        // Set preview and existing image
        if (coverImageValue) {
          setExistingCoverImage(coverImageValue);
          // The API should return the full URL (from the GROQ query with asset->)
          // If it's a URL (starts with http), use it directly for preview
          if (coverImageValue.startsWith('http://') || coverImageValue.startsWith('https://')) {
            setCoverImagePreview(coverImageValue);
          } else {
            // If it's an asset ID (starts with 'image-'), we need to construct the URL
            // This shouldn't normally happen as the API query resolves assets, but handle it just in case
            console.log('Cover image is asset ID (should be URL from API):', coverImageValue);
            // Store the asset ID - we'll keep it for updating, but won't show preview
            // The user can see the image on the actual blog post
            setCoverImagePreview('');
          }
        } else {
          setExistingCoverImage('');
          setCoverImagePreview('');
        }
        setShouldRemoveCoverImage(false);
      } else {
        toast.error('Post not found');
        router.push('/admin');
      }
    } catch (error) {
      console.error('Error loading post:', error);
      toast.error('Error loading post');
    } finally {
      setIsLoadingPost(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'title' && typeof value === 'string' ? { slug: { current: generateSlug(value) } } : {})
    }));
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeCoverImage = () => {
    setCoverImageFile(null);
    setCoverImagePreview('');
    setExistingCoverImage('');
    setShouldRemoveCoverImage(true);
    setFormData(prev => ({ ...prev, coverImage: '' }));
    // Clear the file input
    const fileInput = document.getElementById('coverImage') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let finalFormData = { ...formData };
      
      // Handle cover image removal
      if (shouldRemoveCoverImage) {
        console.log('Removing cover image');
        finalFormData.coverImage = null as any; // Explicitly set to null to remove
      } else if (coverImageFile) {
        // Upload cover image if a new file is selected
        console.log('Starting image upload...');
        try {
          const imageUrl = await blogService.uploadImage(coverImageFile);
          console.log('Image upload result:', imageUrl);
          if (!imageUrl) {
            throw new Error('Image upload failed: No asset ID returned');
          }
          // Store the asset ID for Sanity
          finalFormData.coverImage = imageUrl;
        } catch (uploadError: any) {
          console.error('Image upload error:', uploadError);
          const errorMessage = uploadError.message || 'Failed to upload image';
          toast.error(`Image upload failed: ${errorMessage}`);
          throw uploadError; // Re-throw to stop form submission
        }
      } else if (isEditing && existingCoverImage) {
        // Keep existing image if no new file and not removing
        finalFormData.coverImage = existingCoverImage;
      }

      console.log('Saving post to database...');

      if (isEditing && id) {
        const result = await blogService.updatePost(id, finalFormData);
        console.log('Post updated:', result);
        toast.success('Post updated successfully!');
      } else {
        const result = await blogService.createPost(finalFormData);
        console.log('Post created:', result);
        toast.success('Post created successfully!');
      }
      router.push('/admin');
    } catch (error: any) {
      console.error('Error saving post:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      toast.error(error.message || 'Error saving post');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isLoadingPost) {
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

  return (
    <CosmicBackground>
      <BlogHeader />
      
      <main className="container mx-auto px-4 py-16">
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => router.push('/admin')}
            className="mb-4 border-white/20 text-white hover:bg-white/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Admin
          </Button>
          <h1 className="text-4xl font-light text-white">
            {isEditing ? 'Edit Post' : 'Create New Post'}
          </h1>
        </div>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white">
              {isEditing ? 'Edit Post' : 'Create New Post'}
            </CardTitle>
            <CardDescription className="text-white/70">
              {isEditing ? 'Update your blog post' : 'Write a new blog post'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-white">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter post title"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug" className="text-white">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug.current}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: { current: e.target.value } }))}
                    placeholder="post-url-slug"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt" className="text-white">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => handleInputChange('excerpt', e.target.value)}
                  placeholder="Brief description of the post"
                  rows={3}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 resize-none"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coverImage" className="text-white">Cover Image</Label>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Input
                      id="coverImage"
                      type="file"
                      accept="image/*"
                      onChange={handleCoverImageChange}
                      className="bg-white/10 border-white/20 text-white file:bg-purple-400 file:text-white file:border-0 file:rounded-md file:px-4 file:py-2 file:mr-4 flex-1"
                    />
                    {(coverImagePreview || existingCoverImage) && !shouldRemoveCoverImage && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={removeCoverImage}
                        className="whitespace-nowrap"
                      >
                        Remove Image
                      </Button>
                    )}
                  </div>
                  {coverImagePreview && !shouldRemoveCoverImage && (
                    <div className="relative">
                      <img
                        src={coverImagePreview}
                        alt="Cover preview"
                        className="w-full h-48 object-cover rounded-lg border border-white/20"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={removeCoverImage}
                        className="absolute top-2 right-2"
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                  {shouldRemoveCoverImage && (
                    <div className="p-4 bg-yellow-400/10 border border-yellow-400/20 rounded-lg">
                      <p className="text-yellow-300 text-sm">
                        Cover image will be removed when you save the post.
                      </p>
                    </div>
                  )}
                  <p className="text-sm text-white/60">
                    Upload a cover image for your blog post (optional)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-white">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-white/20 text-white">
                      {categories.map((category) => (
                        <SelectItem key={category} value={category} className="text-white hover:bg-purple-400/20 focus:bg-purple-400/20">
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="readTime" className="text-white">Read Time</Label>
                  <Input
                    id="readTime"
                    value={formData.readTime}
                    onChange={(e) => handleInputChange('readTime', e.target.value)}
                    placeholder="5 min read"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content" className="text-white">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="Write your post content here..."
                  rows={15}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 resize-none"
                  required
                />
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="published"
                    checked={formData.published}
                    onCheckedChange={(checked) => handleInputChange('published', checked)}
                    className="data-[state=checked]:bg-purple-400 data-[state=unchecked]:bg-white/20"
                  />
                  <Label htmlFor="published" className="text-white">Published</Label>
                </div>

              {/* Author avatar is constant - using assets folder */}

              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => handleInputChange('featured', checked)}
                  className="data-[state=checked]:bg-purple-400 data-[state=unchecked]:bg-white/20"
                />
                <Label htmlFor="featured" className="text-white">Featured</Label>
              </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/admin')}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="literary"
                  disabled={isLoading}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isLoading ? 'Saving...' : (isEditing ? 'Update Post' : 'Create Post')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </CosmicBackground>
  );
}
