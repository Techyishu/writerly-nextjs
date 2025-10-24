import { BlogHeader } from "@/components/BlogHeader";
import { CosmicBackground } from "@/components/CosmicBackground";
import { BookOpen } from "lucide-react";

export default function Stories() {
  return (
    <CosmicBackground>
      <BlogHeader />
      
      <main className="container mx-auto px-4 py-32">
        <div className="mx-auto max-w-3xl text-center">
          <BookOpen className="mx-auto mb-6 h-16 w-16 text-purple-400" />
          <h1 className="mb-4 text-4xl font-light tracking-wide md:text-5xl text-white">
            Story Archive
          </h1>
          <p className="text-lg text-white/70">
            A curated collection of tales waiting to be explored.
          </p>
        </div>
      </main>
    </CosmicBackground>
  );
}
