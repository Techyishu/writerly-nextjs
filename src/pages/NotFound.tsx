"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { CosmicBackground } from "@/components/CosmicBackground";
import Link from "next/link";

const NotFound = () => {
  const pathname = usePathname();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", pathname);
  }, [pathname]);

  return (
    <CosmicBackground>
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-6xl font-bold text-white">404</h1>
          <p className="mb-8 text-xl text-white/70">Oops! Page not found</p>
          <Link 
            href="/" 
            className="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </CosmicBackground>
  );
};

export default NotFound;
