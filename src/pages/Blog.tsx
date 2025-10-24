"use client";

import { useState, useEffect } from 'react';
import { BlogHeader } from "@/components/BlogHeader";
import { BlogCard } from "@/components/BlogCard";
import { HeroSection } from "@/components/HeroSection";
import { CosmicBackground } from "@/components/CosmicBackground";
import { blogService, BlogPost } from "@/lib/sanity";

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const publishedPosts = await blogService.getPublishedPosts();
      setPosts(publishedPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
      // Fallback to static data if PocketBase is not available
      setPosts([
        {
          _id: '1',
          title: "Whispers in the Dark",
          excerpt: "In the depths of night, when silence reigns supreme, the old manor house awakens with stories untold. Every creak of the floorboards echoes with memories of those who walked these halls before.",
          content: "",
          readTime: "5 min read",
          category: "Mystery",
          slug: { current: "whispers-in-the-dark" },
          featured: false,
          published: true,
          publishedAt: new Date().toISOString(),
          _createdAt: new Date().toISOString(),
          _updatedAt: new Date().toISOString(),
        },
        {
          _id: '2',
          title: "The Last Letter",
          excerpt: "She found it tucked between the pages of an ancient book, yellowed with age and sealed with wax. The handwriting was elegant, deliberate, belonging to someone who knew their words would outlive them.",
          content: "",
          readTime: "7 min read",
          category: "Fiction",
          slug: { current: "the-last-letter" },
          featured: false,
          published: true,
          publishedAt: new Date().toISOString(),
          _createdAt: new Date().toISOString(),
          _updatedAt: new Date().toISOString(),
        },
        {
          _id: '3',
          title: "Moonlit Confessions",
          excerpt: "Under the silver glow of the autumn moon, secrets have a way of spilling forth like water from a broken dam. Tonight was no different, as two souls found themselves sharing truths they'd kept buried for years.",
          content: "",
          readTime: "6 min read",
          category: "Romance",
          slug: { current: "moonlit-confessions" },
          featured: false,
          published: true,
          publishedAt: new Date().toISOString(),
          _createdAt: new Date().toISOString(),
          _updatedAt: new Date().toISOString(),
        },
        {
          _id: '4',
          title: "The Forgotten Library",
          excerpt: "Deep beneath the city streets lies a collection that time forgot. Books that were never meant to be read, stories too dangerous to tell, and knowledge that could reshape our understanding of reality itself.",
          content: "",
          readTime: "8 min read",
          category: "Fantasy",
          slug: { current: "the-forgotten-library" },
          featured: false,
          published: true,
          publishedAt: new Date().toISOString(),
          _createdAt: new Date().toISOString(),
          _updatedAt: new Date().toISOString(),
        },
        {
          _id: '5',
          title: "Echoes of Yesterday",
          excerpt: "Memory is a peculiar thing, fluid and unreliable. But in this small town, memories don't fade—they linger, they haunt, and sometimes, they come back to change everything.",
          content: "",
          readTime: "5 min read",
          category: "Drama",
          slug: { current: "echoes-of-yesterday" },
          featured: false,
          published: true,
          publishedAt: new Date().toISOString(),
          _createdAt: new Date().toISOString(),
          _updatedAt: new Date().toISOString(),
        },
        {
          _id: '6',
          title: "The Midnight Poet",
          excerpt: "In a world where words hold power, one writer discovers that their late-night compositions have begun manifesting in reality. What starts as wonder quickly becomes a race against their own imagination.",
          content: "",
          readTime: "9 min read",
          category: "Thriller",
          slug: { current: "the-midnight-poet" },
          featured: false,
          published: true,
          publishedAt: new Date().toISOString(),
          _createdAt: new Date().toISOString(),
          _updatedAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen">
      {/* Header - Fixed at top */}
      <div className="relative z-50">
        <BlogHeader />
      </div>
      
      {/* Hero Section - Full screen below header */}
      <div className="relative">
        <HeroSection />
      </div>
      
      {/* Main Content with Cosmic Background */}
      <CosmicBackground>
        <main className="container mx-auto px-4 py-16">
          {/* Section Title */}
          <div className="mb-8 sm:mb-12 text-center px-4">
            <h2 className="mb-4 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light tracking-wide text-white">
              Latest <span className="text-purple-400">Stories</span>
            </h2>
            <p className="mx-auto max-w-2xl text-base sm:text-lg text-white/70">
              Explore the collection of tales that blur the lines between dreams and reality.
            </p>
          </div>

        {/* Blog Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-white/70">Loading posts...</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <BlogCard 
                key={post._id} 
                title={post.title}
                excerpt={post.excerpt}
                date={post.publishedAt && !isNaN(new Date(post.publishedAt).getTime()) ? new Date(post.publishedAt).toLocaleDateString() : 'No date'}
                readTime={post.readTime}
                category={post.category}
                slug={post.slug.current}
                image={typeof post.coverImage === 'string' && post.coverImage.trim() !== '' ? post.coverImage : undefined}
              />
            ))}
          </div>
        )}
        </main>

        {/* Footer */}
        <footer className="mt-20 border-t border-white/20 py-8">
          <div className="container mx-auto px-4 text-center text-sm text-white/70">
            <p>© 2025 Arunasblog. All rights reserved.</p>
            <p className="mt-2">Where stories come alive in the darkness.</p>
          </div>
        </footer>
      </CosmicBackground>
    </div>
  );
}
