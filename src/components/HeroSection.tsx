"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import heroBackground from "@/assets/hero-background.jpg";

interface BlogPost {
  _id: string;
  title: string;
  excerpt: string;
  slug: { current: string };
  coverImage?: string;
}

export const HeroSection = () => {
  const [welcomePost, setWelcomePost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWelcomePost = async () => {
      try {
        const response = await fetch('/api/posts');
        if (response.ok) {
          const posts = await response.json();
          // Find the "Welcome to the blog" post
          const welcomePost = posts.find((post: BlogPost) => 
            post.title.toLowerCase().includes('welcome to the blog')
          );
          setWelcomePost(welcomePost || null);
        }
      } catch (error) {
        console.error('Error fetching welcome post:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWelcomePost();
  }, []);

  if (isLoading) {
    return (
      <section className="relative min-h-screen">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      </section>
    );
  }

  if (!welcomePost) {
    // Fallback content if welcome post is not found
    return (
      <section className="relative min-h-screen">
        {/* Purple Border Effect */}
        <div className="absolute inset-0 m-2 rounded-2xl border-2 shadow-[0_0_30px_rgba(139,92,246,0.3)] md:m-4 md:rounded-3xl md:border-4 md:shadow-[0_0_60px_rgba(139,92,246,0.4)]" />
        
        {/* Content Container */}
        <div className="relative m-2 overflow-hidden rounded-2xl md:m-4 md:rounded-3xl">
          {/* Background Image with Overlay */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${heroBackground.src})`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
          </div>

          {/* Hero Content */}
          <div className="relative flex min-h-screen items-center">
            <div className="container mx-auto px-4 py-24 sm:px-6 md:px-12 md:py-32">
              <div className="max-w-4xl">
                <h1 className="mb-6 text-3xl font-light leading-tight tracking-wide text-white sm:text-4xl md:mb-8 md:text-5xl lg:text-6xl xl:text-7xl">
                  Welcome to Aruna's Blog
                </h1>
                <p className="mb-8 max-w-2xl text-base text-white/90 sm:text-lg md:mb-12 md:text-xl lg:text-2xl">
                  Explore captivating stories and insights that blur the lines between dreams and reality.
                </p>
                <Link href="/stories">
                  <Button variant="literary" size="lg" className="px-6 py-5 text-base md:px-10 md:py-7 md:text-lg">
                    Explore Stories
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen">
      {/* Purple Border Effect */}
      <div className="absolute inset-0 m-2 rounded-2xl border-2 shadow-[0_0_30px_rgba(139,92,246,0.3)] md:m-4 md:rounded-3xl md:border-4 md:shadow-[0_0_60px_rgba(139,92,246,0.4)]" />
      
      {/* Content Container */}
      <div className="relative m-2 overflow-hidden rounded-2xl md:m-4 md:rounded-3xl">
        {/* Background Image with Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: welcomePost.coverImage 
              ? `url(${welcomePost.coverImage})` 
              : `url(${heroBackground.src})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
        </div>

        {/* Hero Content */}
        <div className="relative flex min-h-screen items-center">
          <div className="container mx-auto px-4 py-24 sm:px-6 md:px-12 md:py-32">
            <div className="max-w-4xl">
              <h1 className="mb-6 text-3xl font-light leading-tight tracking-wide text-white sm:text-4xl md:mb-8 md:text-5xl lg:text-6xl xl:text-7xl">
                {welcomePost.title}
              </h1>
              <p className="mb-8 max-w-2xl text-base text-white/90 sm:text-lg md:mb-12 md:text-xl lg:text-2xl">
                {welcomePost.excerpt}
              </p>
              <Link href={`/post/${welcomePost.slug.current}`}>
                <Button variant="literary" size="lg" className="px-6 py-5 text-base md:px-10 md:py-7 md:text-lg">
                  Read More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
