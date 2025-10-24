import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

// Sanity configuration
export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  useCdn: process.env.NODE_ENV === 'production',
  apiVersion: '2024-10-24',
  token: process.env.NEXT_PUBLIC_SANITY_API_TOKEN || process.env.SANITY_API_TOKEN, // For write operations
})

// Image URL builder
const builder = imageUrlBuilder(sanityClient)

export const urlFor = (source: any) => builder.image(source)

// Blog post interface matching your current structure
export interface BlogPost {
  _id: string;
  title: string;
  excerpt: string;
  content: string;
  slug: { current: string };
  category: string;
  readTime: string;
  featured: boolean;
  published: boolean;
  coverImage?: string | {
    asset: {
      _ref: string;
      _type: 'reference';
    };
    alt?: string;
  };
  publishedAt: string;
  _createdAt: string;
  _updatedAt: string;
}

// Sanity document type for internal use
interface SanityPost {
  _id: string;
  _type: string;
  title?: string;
  excerpt?: string;
  content?: string;
  slug?: { current?: string };
  category?: string;
  readTime?: string;
  featured?: boolean;
  published?: boolean;
  coverImage?: any;
  publishedAt?: string;
  _createdAt?: string;
  _updatedAt?: string;
}

// Helper function to convert Sanity document to BlogPost
function convertToBlogPost(doc: SanityPost): BlogPost {
  return {
    _id: doc._id,
    title: doc.title || '',
    excerpt: doc.excerpt || '',
    content: doc.content || '',
    slug: { current: doc.slug?.current || '' },
    category: doc.category || '',
    readTime: doc.readTime || '',
    featured: doc.featured || false,
    published: doc.published || false,
    coverImage: doc.coverImage,
    publishedAt: doc.publishedAt || new Date().toISOString(),
    _createdAt: doc._createdAt || new Date().toISOString(),
    _updatedAt: doc._updatedAt || new Date().toISOString(),
  };
}

// Blog service functions
export const blogService = {
  // Get all published blog posts
  async getPublishedPosts(): Promise<BlogPost[]> {
    try {
      const query = `*[_type == "post" && published == true] | order(publishedAt desc) {
        _id,
        title,
        excerpt,
        content,
        slug,
        category,
        readTime,
        featured,
        published,
        coverImage,
        publishedAt,
        _createdAt,
        _updatedAt
      }`;
      
      const posts = await sanityClient.fetch(query);
      return posts.map(convertToBlogPost);
    } catch (error) {
      console.error('Error fetching published posts:', error);
      return [];
    }
  },

  // Get all posts (for admin)
  async getAllPosts(): Promise<BlogPost[]> {
    try {
      const response = await fetch('/api/admin/posts');
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      const posts = await response.json();
      return posts;
    } catch (error) {
      console.error('Error fetching all posts:', error);
      return [];
    }
  },

  // Get post by slug
  async getPostBySlug(slug: string): Promise<BlogPost | null> {
    try {
      const response = await fetch(`/api/posts/${slug}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch post');
      }
      const post = await response.json();
      return convertToBlogPost(post);
    } catch (error) {
      console.error('Error fetching post by slug:', error);
      return null;
    }
  },

  // Create new post
  async createPost(data: Partial<BlogPost>): Promise<BlogPost> {
    try {
      const response = await fetch('/api/admin/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  },

  // Update post
  async updatePost(id: string, data: Partial<BlogPost>): Promise<BlogPost> {
    try {
      const response = await fetch(`/api/admin/posts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update post');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  },

  // Delete post
  async deletePost(id: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/admin/posts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }

      return true;
    } catch (error) {
      console.error('Error deleting post:', error);
      return false;
    }
  },

  // Upload image (returns asset reference)
  async uploadImage(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const result = await response.json();
      return result.assetId;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }
};
