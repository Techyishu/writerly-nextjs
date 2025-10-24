"use client";

import { useState, useEffect } from 'react';
import { BlogHeader } from "@/components/BlogHeader";
import { BlogCard } from "@/components/BlogCard";
import { HeroSection } from "@/components/HeroSection";
import { CosmicBackground } from "@/components/CosmicBackground";
import { blogService, BlogPost } from "@/lib/supabase";

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
          id: '1',
          title: "Whispers in the Dark",
          excerpt: "In the depths of night, when silence reigns supreme, the old manor house awakens with stories untold. Every creak of the floorboards echoes with memories of those who walked these halls before.",
          content: "",
          date: "Oct 21, 2025",
          readTime: "5 min read",
          category: "Mystery",
          slug: "whispers-in-the-dark",
          featured: false,
          published: true,
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
        },
        {
          id: '2',
          title: "The Last Letter",
          excerpt: "She found it tucked between the pages of an ancient book, yellowed with age and sealed with wax. The handwriting was elegant, deliberate, belonging to someone who knew their words would outlive them.",
          content: "",
          date: "Oct 18, 2025",
          readTime: "7 min read",
          category: "Fiction",
          slug: "the-last-letter",
          featured: false,
          published: true,
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
        },
        {
          id: '3',
          title: "Moonlit Confessions",
          excerpt: "Under the silver glow of the autumn moon, secrets have a way of spilling forth like water from a broken dam. Tonight was no different, as two souls found themselves sharing truths they'd kept buried for years.",
          content: "",
          date: "Oct 15, 2025",
          readTime: "6 min read",
          category: "Romance",
          slug: "moonlit-confessions",
          featured: false,
          published: true,
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
        },
        {
          id: '4',
          title: "The Forgotten Library",
          excerpt: "Deep beneath the city streets lies a collection that time forgot. Books that were never meant to be read, stories too dangerous to tell, and knowledge that could reshape our understanding of reality itself.",
          content: "",
          date: "Oct 12, 2025",
          readTime: "8 min read",
          category: "Fantasy",
          slug: "the-forgotten-library",
          featured: false,
          published: true,
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
        },
        {
          id: '5',
          title: "Echoes of Yesterday",
          excerpt: "Memory is a peculiar thing, fluid and unreliable. But in this small town, memories don't fade—they linger, they haunt, and sometimes, they come back to change everything.",
          content: "",
          date: "Oct 9, 2025",
          readTime: "5 min read",
          category: "Drama",
          slug: "echoes-of-yesterday",
          featured: false,
          published: true,
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
        },
        {
          id: '6',
          title: "The Midnight Poet",
          excerpt: "In a world where words hold power, one writer discovers that their late-night compositions have begun manifesting in reality. What starts as wonder quickly becomes a race against their own imagination.",
          content: "",
          date: "Oct 6, 2025",
          readTime: "9 min read",
          category: "Thriller",
          slug: "the-midnight-poet",
          featured: false,
          published: true,
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
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
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-light tracking-wide md:text-5xl text-white">
              Latest <span className="text-purple-400">Stories</span>
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-white/70">
              Explore the collection of tales that blur the lines between dreams and reality.
            </p>
          </div>

        {/* Blog Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-white/70">Loading posts...</p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <BlogCard 
                key={post.id} 
                title={post.title}
                excerpt={post.excerpt}
                date={new Date(post.created).toLocaleDateString()}
                readTime={post.readTime}
                category={post.category}
                slug={post.slug}
                image={post.cover_image}
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
