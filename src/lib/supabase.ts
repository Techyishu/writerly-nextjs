import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : supabase

// Types for our collections
export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  slug: string;
  category: string;
  read_time: string;
  featured: boolean;
  published: boolean;
  cover_image?: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  created_at: string;
  updated_at: string;
}

export interface Visitor {
  id: string;
  ip_address: string;
  user_agent: string;
  referrer?: string;
  page: string;
  timestamp: string;
  created_at: string;
  updated_at: string;
}

// Blog service functions
export const blogService = {
  // Get all published blog posts
  async getPublishedPosts(): Promise<BlogPost[]> {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching published posts:', error);
      return [];
    }
  },

  // Get all blog posts (admin only)
  async getAllPosts(): Promise<BlogPost[]> {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching all posts:', error);
      return [];
    }
  },

  // Get single blog post by slug
  async getPostBySlug(slug: string): Promise<BlogPost | null> {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching post by slug:', error);
      return null;
    }
  },

  // Create new blog post
  async createPost(data: Partial<BlogPost>): Promise<BlogPost> {
    try {
      const { data: result, error } = await supabase
        .from('blog_posts')
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  },

  // Update blog post
  async updatePost(id: string, data: Partial<BlogPost>): Promise<BlogPost> {
    try {
      const { data: result, error } = await supabase
        .from('blog_posts')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  },

  // Delete blog post
  async deletePost(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting post:', error);
      return false;
    }
  },

  // Upload file to Supabase storage
  async uploadFile(file: File): Promise<string> {
    try {
      console.log('File upload requested:', file.name, file.size);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      console.log('Attempting to upload to Supabase storage');
      console.log('File path:', filePath);
      console.log('File size:', file.size);

      const { data, error } = await supabase.storage
        .from('files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('Storage upload error:', error);
        // Fallback to placeholder if upload fails
        return `https://via.placeholder.com/800x400/6366f1/ffffff?text=Upload+Failed`;
      }

      const { data: urlData } = supabase.storage
        .from('files')
        .getPublicUrl(filePath);

      console.log('Upload successful:', urlData.publicUrl);
      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      return `https://via.placeholder.com/800x400/6366f1/ffffff?text=Upload+Failed`;
    }
  }
};

// Auth service functions
export const authService = {
  // Login with timeout protection
  async login(email: string, password: string): Promise<User> {
    try {
      // Add timeout to prevent hanging requests
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Login request timed out')), 8000);
      });

      const loginPromise = (async () => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) throw profileError;

        return profile;
      })();

      return await Promise.race([loginPromise, timeoutPromise]);
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  },

  // Logout
  async logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  },

  // Register new user with timeout protection
  async register(email: string, password: string, name: string): Promise<User> {
    try {
      // Add timeout to prevent hanging requests
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Registration request timed out')), 10000);
      });

      const registerPromise = (async () => {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        // Create user profile
        if (!data.user) throw new Error('User creation failed');
        
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email,
            name,
          })
          .select()
          .single();

        if (profileError) throw profileError;

        return profile;
      })();

      return await Promise.race([registerPromise, timeoutPromise]);
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  },

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;

      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      // If profile doesn't exist, create it
      if (error && error.code === 'PGRST116') {
        console.log('User profile not found, creating one...');
        const { data: newProfile, error: createError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email || '',
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          })
          .select()
          .single();

        if (createError) throw createError;
        return newProfile;
      }

      if (error) throw error;
      return profile;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }
};

// Visitor service functions
export const visitorService = {
  // Track visitor with timeout and better error handling
  async trackVisitor(data: Partial<Visitor>): Promise<void> {
    try {
      // Add timeout to prevent hanging requests
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 5000);
      });

      const trackPromise = supabase
        .from('visitors')
        .insert(data);

      await Promise.race([trackPromise, timeoutPromise]);
    } catch (error) {
      // Only log errors in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error tracking visitor:', error);
      }
    }
  },

  // Get visitor count with timeout and caching
  async getVisitorCount(): Promise<number> {
    try {
      // Add timeout to prevent hanging requests
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 3000);
      });

      const countPromise = supabase
        .from('visitors')
        .select('*', { count: 'exact', head: true });

      const { count, error } = await Promise.race([countPromise, timeoutPromise]);
      
      if (error) throw error;
      return count || 0;
    } catch (error) {
      // Only log errors in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error getting visitor count:', error);
      }
      return 0;
    }
  }
};
