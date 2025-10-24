"use client";

import { User, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import logoImage from "@/assets/WhatsApp Image 2025-10-21 at 1.22.36 AM.jpeg";
// VisitorCounter removed - general visitor tracking disabled

export const BlogHeader = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  return (
    <header className="w-full bg-black/20 backdrop-blur-sm border-b border-white/10">
      <div className="container mx-auto flex h-24 items-center justify-between px-4 md:h-28 lg:h-32 md:px-6">
        <Link href="/" className="flex items-center gap-4 transition-opacity hover:opacity-80">
          <img 
            src={logoImage.src} 
            alt="Aruna.S Logo" 
            className="h-16 w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 object-contain drop-shadow-xl"
          />
          <span className="text-3xl font-light tracking-wide text-white md:text-4xl lg:text-5xl">Aruna.S</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex md:gap-8">
          <Link
            href="/"
            className={`text-sm transition-colors hover:text-purple-400 md:text-base ${
              isActive("/") ? "text-white" : "text-white/90"
            }`}
          >
            Home
          </Link>
          <Link
            href="/about"
            className={`text-sm transition-colors hover:text-purple-400 md:text-base ${
              isActive("/about") ? "text-white" : "text-white/90"
            }`}
          >
            About
          </Link>
          
          {/* Visitor Counter */}
          {/* VisitorCounter removed - general visitor tracking disabled */}
          
          <Link href="/admin/login">
            <Button variant="outline" size="sm" className="border-purple-400/50 hover:bg-purple-400/10 text-white">
              <User className="mr-2 h-4 w-4" />
              Admin
            </Button>
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="absolute top-24 left-0 right-0 bg-black/95 backdrop-blur-lg border-b border-white/20 md:hidden">
          <nav className="container mx-auto flex flex-col gap-4 px-4 py-6">
            <Link
              href="/"
              className={`text-base transition-colors hover:text-purple-400 ${
                isActive("/") ? "text-white" : "text-white/90"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/about"
              className={`text-base transition-colors hover:text-purple-400 ${
                isActive("/about") ? "text-white" : "text-white/90"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link href="/admin/login">
              <Button variant="outline" size="sm" className="w-fit border-purple-400/50 hover:bg-purple-400/10 text-white">
                <User className="mr-2 h-4 w-4" />
                Admin
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};
